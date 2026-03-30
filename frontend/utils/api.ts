const BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

// Ping the backend to wake it from Render cold start
export async function warmupBackend() {
  try {
    await fetch(`${BASE}/health`, { method: "GET", signal: AbortSignal.timeout(20000) });
  } catch {
    // ignore — just a warmup
  }
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Retry with exponential backoff — handles Render cold starts transparently
export async function apiFetch(
  path: string,
  options: RequestInit = {},
  token?: string | null,
  timeoutMs = 55000,   // 55s per attempt — covers full Render cold start
  retries = 2          // retry up to 2 times before giving up
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let lastError: Error = new Error("Request failed");

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchWithTimeout(
        `${BASE}${path}`,
        { ...options, headers },
        timeoutMs
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Request failed");
      return data;
    } catch (err: unknown) {
      const e = err as Error;
      lastError = e;

      const isTimeout = e.name === "AbortError";
      const isNetwork = e.message === "Failed to fetch" || e.message.includes("network");

      // Only retry on timeout/network errors, not on 4xx/5xx responses
      if ((isTimeout || isNetwork) && attempt < retries) {
        // Wait before retrying: 2s, then 4s
        await new Promise((r) => setTimeout(r, (attempt + 1) * 2000));
        continue;
      }

      if (isTimeout) {
        throw new Error("The server is taking longer than usual. Please try again.");
      }
      throw e;
    }
  }

  throw lastError;
}
