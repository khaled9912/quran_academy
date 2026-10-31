const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "").replace(
  /\/$/,
  ""
);

// A sleeping or unreachable API must not leave the UI waiting forever.
const REQUEST_TIMEOUT_MS = 30_000;

const getBackendBaseUrl = () => {
  if (!backendUrl) {
    const message =
      "NEXT_PUBLIC_BACKEND_URL is missing. Set it in FE/.env.local for local dev or in your deployment environment for preview/prod.";
    if (process.env.NODE_ENV !== "production") {
      throw new Error(message);
    }
    console.error(message);
    return "";
  }

  return backendUrl;
};

export type ValidationErrors = Record<string, string[]>;

export class ApiError extends Error {
  status: number;
  details: unknown;
  validationErrors?: ValidationErrors;
  constructor(
    message: string,
    status: number,
    details?: unknown,
    validationErrors?: ValidationErrors
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    this.validationErrors = validationErrors;
  }
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

// Non-JSON bodies (IIS/offline/proxy pages) must never reach the UI as raw HTML.
const statusMessage = (status: number): string => {
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You do not have permission to do that.";
  if (status === 404) return "The requested resource was not found.";
  if (status === 408)
    return "The server took too long to respond. Please try again.";
  if (status === 429)
    return "Too many attempts. Please wait a moment and try again.";
  if (status === 500) return "The server reported an error. Please try again.";
  if (status === 502 || status === 503 || status === 504)
    return "The service is temporarily unavailable. Please try again in a moment.";
  return `API request failed (${status}).`;
};

// ASP.NET ValidationProblemDetails puts the useful messages in `errors` and a generic title on top.
function readValidationErrors(payload: unknown): ValidationErrors | undefined {
  if (!isObject(payload) || !isObject(payload.errors)) return undefined;
  const entries = Object.entries(payload.errors).flatMap(([field, value]) => {
    const messages = (Array.isArray(value) ? value : [value])
      .filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0
      )
      .map((item) => item.trim());
    return messages.length ? [[field, messages] as const] : [];
  });
  return entries.length ? Object.fromEntries(entries) : undefined;
}

export async function backendFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!path.startsWith("/")) throw new Error("API paths must start with '/'.");
  const headers = new Headers(options.headers);
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  if (options.body && !isFormData && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  const baseUrl = getBackendBaseUrl();
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(
    () => timeoutController.abort(),
    REQUEST_TIMEOUT_MS
  );
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers,
      credentials: "include",
      cache: options.cache ?? "no-store",
      signal: options.signal ?? timeoutController.signal,
    });
  } catch (error) {
    if (timeoutController.signal.aborted && !options.signal?.aborted) {
      throw new ApiError(
        "The server took too long to respond. Please try again.",
        408
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
  if (response.status === 204) return null as T;
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("json")
    ? await response.json().catch(() => null)
    : null;
  if (!response.ok) {
    // A 401 means the server session is gone (e.g. API restart); let the auth
    // provider clear local state instead of leaving pages with empty data.
    if (
      response.status === 401 &&
      !path.startsWith("/api/auth/login") &&
      !path.startsWith("/api/auth/register") &&
      !path.startsWith("/api/auth/password") &&
      typeof window !== "undefined"
    ) {
      window.dispatchEvent(new Event("academy:unauthorized"));
    }
    const validationErrors = readValidationErrors(payload);
    const serverMessage = isObject(payload)
      ? (payload.message ?? payload.detail ?? payload.title ?? payload.error)
      : undefined;
    const message = validationErrors
      ? Object.values(validationErrors).flat().join(" ")
      : typeof serverMessage === "string" && serverMessage.trim()
        ? serverMessage
        : statusMessage(response.status);
    throw new ApiError(message, response.status, payload, validationErrors);
  }
  return payload as T;
}

/** Fetches a binary attachment (e.g. an admin CV download) with the session cookie. */
export async function backendBlobFetch(path: string): Promise<Blob> {
  if (!path.startsWith("/")) throw new Error("API paths must start with '/'.");
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${getBackendBaseUrl()}${path}`, {
      headers: { Accept: "*/*" },
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new ApiError(
        "The server took too long to respond. Please try again.",
        408
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event("academy:unauthorized"));
    }
    throw new ApiError(statusMessage(response.status), response.status);
  }
  return response.blob();
}

/** Builds a browser URL for API-served assets such as profile images. */
export const backendAssetUrl = (path?: string | null) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${getBackendBaseUrl()}${path}`;
};
