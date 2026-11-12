export type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
};

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public errors?: string[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ data: T; envelope: ApiEnvelope<T> }> {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("r2r_token")
    : null;

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers ?? {}),
    },
    credentials: "include",
  });

  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok || !(payload && (payload as any).success !== false)) {
    const errPayload = payload as ApiEnvelope<unknown> | null;
    throw new ApiError(
      errPayload?.message || "Request failed",
      res.status,
      errPayload?.errors,
    );
  }

  const data = (payload as ApiEnvelope<T>).data as T;
  return { data, envelope: payload as ApiEnvelope<T> };
}

export async function apiGet<T>(path: string): Promise<T> {
  return (await request<T>(path)).data;
}

export async function apiPostJson<T, B = any>(
  path: string,
  body?: B,
): Promise<T> {
  // @ts-ignore - body serialization handled at runtime
  const bodyStr = body ? JSON.stringify(body) : undefined;
  return (await request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: bodyStr,
  })).data;
}

export async function apiPostForm<T>(
  path: string,
  formData: FormData,
): Promise<T> {
  return (await request<T>(path, { method: "POST", body: formData })).data;
}

export async function apiDelete<T>(path: string): Promise<T> {
  return (await request<T>(path, { method: "DELETE" })).data;
}