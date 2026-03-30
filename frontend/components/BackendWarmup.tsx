"use client";
import { useEffect } from "react";

const BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

// Aggressively warms up the Render backend on page load.
// Retries every 5s until the server responds — so by the time
// the user submits a form, the server is guaranteed to be awake.
export default function BackendWarmup() {
  useEffect(() => {
    let cancelled = false;

    async function ping() {
      while (!cancelled) {
        try {
          const res = await fetch(`${BASE}/health`, {
            signal: AbortSignal.timeout(8000),
          });
          if (res.ok) return; // server is up, stop pinging
        } catch {
          // server not ready yet — wait and retry
        }
        await new Promise((r) => setTimeout(r, 5000));
      }
    }

    ping();
    return () => { cancelled = true; };
  }, []);

  return null;
}
