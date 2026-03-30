"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/utils/api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      login(data.token, data.user);
      router.push(redirect);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb1 absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#09ffd3]/4 blur-3xl" />
        <div className="orb2 absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-indigo-500/4 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md fade-in">
        {/* Card */}
        <div className="gradient-border p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#09ffd3]/10 border border-[#09ffd3]/30 flex items-center justify-center text-2xl mx-auto mb-4">🧠</div>
            <h1 className="text-2xl font-extrabold mb-1">Welcome back</h1>
            <p className="text-gray-500 text-sm">Sign in to your CogniscanAI account</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest mb-1.5 block">Email</label>
              <input
                type="email" required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-[#09ffd3]/50 transition text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest mb-1.5 block">Password</label>
              <input
                type="password" required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-[#09ffd3]/50 transition text-sm"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="mt-2 w-full py-3.5 rounded-xl bg-[#09ffd3] text-[#02182b] font-bold text-sm hover:brightness-110 transition disabled:opacity-60 shadow-[0_0_20px_rgba(9,255,211,0.2)]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#02182b]/30 border-t-[#02182b] rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#09ffd3] hover:underline font-medium">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
