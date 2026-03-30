"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface Props {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=" + encodeURIComponent(window.location.pathname));
    }
  }, [user, loading, router]);

  // While checking auth state, show a brain-scan loader
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-2 border-[#09ffd3]/20 animate-ping" />
          <div className="absolute inset-3 rounded-full border-2 border-[#09ffd3]/30 animate-ping" style={{ animationDelay: "0.3s" }} />
          <div className="absolute inset-0 flex items-center justify-center text-3xl">🧠</div>
        </div>
        <p className="text-gray-500 text-sm">Loading…</p>
      </div>
    );
  }

  // Not logged in — show a friendly gate instead of blank flash
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 text-center gap-6 fade-in">
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="orb1 absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#09ffd3]/4 blur-3xl" />
        </div>

        <div className="w-16 h-16 rounded-2xl bg-[#09ffd3]/10 border border-[#09ffd3]/30 flex items-center justify-center text-3xl">
          🔒
        </div>

        <div>
          <h2 className="text-2xl font-extrabold mb-2">Sign in required</h2>
          <p className="text-gray-400 max-w-sm text-sm leading-relaxed">
            This page is only available to registered users. Create a free account or sign in to continue.
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/login">
            <button className="px-7 py-3 rounded-xl bg-[#09ffd3] text-[#02182b] font-bold text-sm hover:brightness-110 transition shadow-[0_0_20px_rgba(9,255,211,0.2)]">
              Sign In
            </button>
          </Link>
          <Link href="/register">
            <button className="px-7 py-3 rounded-xl border border-white/10 text-gray-300 font-semibold text-sm hover:border-[#09ffd3]/30 hover:text-white transition">
              Create Account
            </button>
          </Link>
        </div>

        <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition">
          ← Back to home
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
