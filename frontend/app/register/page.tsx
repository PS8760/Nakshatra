"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/utils/api";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", age: "", gender: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...form, age: form.age ? parseInt(form.age) : undefined }),
      }, null, 60000);
      login(data.token, data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const field = (key: keyof typeof form, label: string, type = "text", placeholder = "") => (
    <div>
      <label className="text-xs text-gray-500 uppercase tracking-widest mb-1.5 block">{label}</label>
      <input
        type={type} value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-[#09ffd3]/50 transition text-sm"
      />
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb1 absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#09ffd3]/4 blur-3xl" />
        <div className="orb2 absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full bg-indigo-500/4 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg fade-in">
        <div className="gradient-border p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#09ffd3]/10 border border-[#09ffd3]/30 flex items-center justify-center text-2xl mx-auto mb-4">🧠</div>
            <h1 className="text-2xl font-extrabold mb-1">Create your account</h1>
            <p className="text-gray-500 text-sm">Join CogniscanAI for free cognitive screening</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {field("name", "Full Name", "text", "Pranav Ghodke")}
            {field("email", "Email", "email", "you@example.com")}
            {field("password", "Password", "password", "Min. 8 characters")}

            <div className="grid grid-cols-2 gap-4">
              {field("age", "Age", "number", "25")}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-widest mb-1.5 block">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#09ffd3]/50 transition text-sm"
                >
                  <option value="" className="bg-[#02182b]">Select</option>
                  <option value="Male" className="bg-[#02182b]">Male</option>
                  <option value="Female" className="bg-[#02182b]">Female</option>
                  <option value="Other" className="bg-[#02182b]">Other</option>
                </select>
              </div>
            </div>

            {field("phone", "Phone (optional)", "tel", "+91 98765 43210")}

            <button
              type="submit" disabled={loading}
              className="mt-2 w-full py-3.5 rounded-xl bg-[#09ffd3] text-[#02182b] font-bold text-sm hover:brightness-110 transition disabled:opacity-60 shadow-[0_0_20px_rgba(9,255,211,0.2)]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#02182b]/30 border-t-[#02182b] rounded-full animate-spin" />
                  Creating account… (server waking up)
                </span>
              ) : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#09ffd3] hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
