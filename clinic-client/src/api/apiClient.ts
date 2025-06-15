import { API_BASE } from "../config/apiConfig";

interface RequestOptions {
  method?: string;
  token?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function request<T>(
  path: string,
  { method = "GET", token, body, headers = {} }: RequestOptions = {}
): Promise<T> {
  const opts: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };
  if (body != null) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, opts);
  if (!res.ok) {
    let msg: string;
    try {
      msg = await res.text();
    } catch {
      msg = res.statusText;
    }
    throw new Error(msg || `API error ${res.status}`);
  }
  // no content
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}
