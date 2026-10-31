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
    : await response.text().catch(() => "");
  if (!response.ok) {
    // A 401 means the server session is gone (e.g. API restart); let the auth
    // provider clear local state instead of leaving pages with empty data.
    if (
      response.status === 401 &&
      !path.startsWith("/api/auth/login") &&
      !path.startsWith("/api/auth/register") &&
      typeof window !== "undefined"
    ) {
      window.dispatchEvent(new Event("academy:unauthorized"));
    }
    const validationErrors = readValidationErrors(payload);
    const message = validationErrors
      ? Object.values(validationErrors).flat().join(" ")
      : isObject(payload)
        ? String(
            payload.message ??
              payload.detail ??
              payload.title ??
              payload.error ??
              `API request failed (${response.status})`
          )
        : String(payload || `API request failed (${response.status})`);
    throw new ApiError(message, response.status, payload, validationErrors);
  }
  return payload as T;
}

/** Builds a browser URL for API-served assets such as profile images. */
export const backendAssetUrl = (path?: string | null) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${getBackendBaseUrl()}${path}`;
};
