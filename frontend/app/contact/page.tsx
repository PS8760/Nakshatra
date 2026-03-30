"use client";
import { useState } from "react";
import { apiFetch } from "@/utils/api";
import AuthGuard from "@/components/AuthGuard";

const CATEGORIES = ["General", "Bug Report", "Feature Request", "Medical Query", "Technical Support", "Other"];

const TEAM = [
  { name: "Pranav Ghodke", role: "Lead Developer & AI Engineer", emoji: "👨‍💻", color: "#09ffd3" },
  { name: "Jui Katkade", role: "Frontend Developer & UX Designer", emoji: "👩‍🎨", color: "#6366f1" },
  { name: "Aditya Chavan", role: "Backend Developer & ML Engineer", emoji: "👨‍🔬", color: "#f59e0b" },
  { name: "Gauri Borse", role: "Research & Medical Advisor", emoji: "👩‍⚕️", color: "#ec4899" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", category: "General" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(true);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const data = await apiFetch("/contact", { method: "POST", body: JSON.stringify(form) });
      setEmailSent(data.emailSent ?? true);
      setSuccess(true);
      setForm({ name: "", email: "", subject: "", message: "", category: "General" });
    } catch (err: any) {
      setError(err.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
    <div className="max-w-6xl mx-auto px-6 py-12 fade-in">
      {/* Header */}
      <div className="text-center mb-14">
        <span className="inline-block px-4 py-1.5 rounded-full border border-[#09ffd3]/30 text-[#09ffd3] text-xs font-semibold mb-4 bg-[#09ffd3]/5 tracking-widest uppercase">
          Get In Touch
        </span>
        <h1 className="text-4xl font-extrabold mb-3">Contact Us</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Have a question, found a bug, or want to collaborate? We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-3">
          <div className="gradient-border p-8">
            <h2 className="font-bold text-lg mb-6">Send us a message</h2>

            {success ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <div className="w-16 h-16 rounded-full bg-[#09ffd3]/10 border border-[#09ffd3]/30 flex items-center justify-center text-3xl">✓</div>
                <h3 className="font-bold text-[#09ffd3] text-lg">Message received!</h3>
                <p className="text-gray-400 text-sm">
                  {emailSent
                    ? "We'll get back to you within 24 hours."
                    : "Your message was saved. Email notification is pending — we'll still get back to you soon."}
                </p>
                <button onClick={() => setSuccess(false)}
                  className="px-6 py-2 rounded-xl border border-white/10 text-gray-300 text-sm hover:border-[#09ffd3]/30 transition">
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                  <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-widest mb-1.5 block">Your Name</label>
                    <input type="text" required value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Pranav Ghodke"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-[#09ffd3]/50 transition text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-widest mb-1.5 block">Email</label>
                    <input type="email" required value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-[#09ffd3]/50 transition text-sm" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-widest mb-1.5 block">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#09ffd3]/50 transition text-sm">
                    {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#02182b]">{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-widest mb-1.5 block">Subject</label>
                  <input type="text" required value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Brief description of your query"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-[#09ffd3]/50 transition text-sm" />
                </div>

                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-widest mb-1.5 block">Message</label>
                  <textarea required rows={5} value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Describe your issue or question in detail…"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-[#09ffd3]/50 transition text-sm resize-none" />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#09ffd3] text-[#02182b] font-bold text-sm hover:brightness-110 transition disabled:opacity-60 shadow-[0_0_20px_rgba(9,255,211,0.2)]">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-[#02182b]/30 border-t-[#02182b] rounded-full animate-spin" />
                      Sending…
                    </span>
                  ) : "Send Message →"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right: Team + info */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Team */}
          <div className="gradient-border p-6">
            <h3 className="font-bold mb-5">Meet the Team</h3>
            <div className="flex flex-col gap-4">
              {TEAM.map((m) => (
                <div key={m.name} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${m.color}15`, border: `1px solid ${m.color}30` }}>
                    {m.emoji}
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: m.color }}>{m.name}</div>
                    <div className="text-xs text-gray-500">{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact info */}
          <div className="gradient-border p-6">
            <h3 className="font-bold mb-4">Contact Info</h3>
            <div className="flex flex-col gap-3 text-sm text-gray-400">
              <div className="flex items-center gap-3">
                <span className="text-[#09ffd3]">📧</span>
                <span>spranav0812@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#09ffd3]">⏱️</span>
                <span>Response within 24 hours</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#09ffd3]">🌍</span>
                <span>Pune, Maharashtra, India</span>
              </div>
            </div>
          </div>

          {/* Bug report tip */}
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <p className="text-xs text-amber-300/80 leading-relaxed">
              <span className="font-semibold text-amber-300">🐛 Reporting a bug?</span> Please include your browser name, OS, and steps to reproduce the issue. Screenshots are very helpful!
            </p>
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
