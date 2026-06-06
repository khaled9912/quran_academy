import { supabase } from "@/lib/supabase-client";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

if (!backendUrl) {
  throw new Error("Missing NEXT_PUBLIC_BACKEND_URL environment variable");
}

const getAuthHeaders = async () => {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export const backendFetch = async (path: string, options: RequestInit = {}) => {
  const headers = {
    ...(options.headers ?? {}),
    ...(await getAuthHeaders()),
  };

  const response = await fetch(`${backendUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Backend request failed: ${response.status} ${body}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};
