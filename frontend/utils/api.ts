const BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

// Ping the backend to wake it from Render cold start
export async function warmupBackend() {
  try {
    await fetch(`${BASE}/health`, { method: "GET", signal: AbortSignal.timeout(15000) });
  } catch {
    // ignore — just a warmup
  }
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
  token?: string | null,
  timeoutMs = 30000
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || "Request failed");
    return data;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out. The server may be waking up — please try again in a moment.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
