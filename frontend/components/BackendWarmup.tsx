"use client";
import { useEffect } from "react";
import { warmupBackend } from "@/utils/api";

// Silently pings the backend on first page load to wake Render from cold start.
// This runs in the background — no UI, no blocking.
export default function BackendWarmup() {
  useEffect(() => {
    warmupBackend();
  }, []);
  return null;
}
