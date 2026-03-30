"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/utils/api";
import AuthGuard from "@/components/AuthGuard";
export default function ProfilePage() {
  const { user, token, updateUser, logout } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", age: "", gender: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    setForm({ name: user.name, age: user.age?.toString() || "", gender: user.gender || "", phone: user.phone || "" });
    fetchHistory();
  }, [user]);

  async function fetchHistory() {
    if (!token) return;
    try {
      const data = await apiFetch("/history", {}, token);
      setHistory(data.history || []);
    } catch {
      const stored = JSON.parse(localStorage.getItem("cogniHistory") || "[]");
      setHistory(stored);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/auth/profile", {
        method: "PUT",
        body: JSON.stringify({ name: form.name, age: form.age ? parseInt(form.age) : undefined, gender: form.gender, phone: form.phone }),
      }, token);
      updateUser({ name: form.name, age: form.age ? parseInt(form.age) : undefined, gender: form.gender, phone: form.phone });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ }
    setSaving(false);
  }

  const RISK_COLOR: Record<string, string> = { Low: "#09ffd3", Medium: "#f59e0b", High: "#ef4444" };
  const totalTests = history.length;
  const avgScore = totalTests ? Math.round(history.reduce((a: number, b: any) => a + b.finalScore, 0) / totalTests) : 0;
  const highRisk = history.filter((h: any) => h.riskLevel === "High").length;

  if (!user) return null;

  return (
    <AuthGuard>
    <div className="max-w-5xl mx-auto px-6 py-12 fade-in">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold mb-1">My Profile</h1>
          <p className="text-gray-500 text-sm">Manage your account and view your cognitive health history</p>
        </div>
        <button onClick={() => { logout(); router.push("/"); }}
          className="px-4 py-2 rounded-xl border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition">
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Avatar + stats */}
        <div className="flex flex-col gap-4">
          {/* Avatar card */}
          <div className="gradient-border p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-[#09ffd3]/10 border-2 border-[#09ffd3]/40 flex items-center justify-center text-3xl font-extrabold text-[#09ffd3] mx-auto mb-4">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="font-bold text-lg">{user.name}</h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
            {user.age && <p className="text-gray-600 text-xs mt-1">Age {user.age} · {user.gender || "—"}</p>}
          </div>

          {/* Quick stats */}
          {[
            { label: "Tests Taken", value: totalTests, color: "#09ffd3" },
            { label: "Avg Score", value: avgScore || "—", color: "#6366f1" },
            { label: "High Risk", value: highRisk, color: "#ef4444" },
          ].map((s) => (
            <div key={s.label} className="gradient-border p-4 flex items-center justify-between">
              <span className="text-sm text-gray-400">{s.label}</span>
              <span className="text-xl font-extrabold" style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}

          <Link href="/test">
            <button className="w-full py-3 rounded-xl bg-[#09ffd3] text-[#02182b] font-bold text-sm hover:brightness-110 transition shadow-[0_0_20px_rgba(9,255,211,0.2)]">
              + Take New Test
            </button>
          </Link>
        </div>

        {/* Right: Edit form + history */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Edit profile */}
          <div className="gradient-border p-6">
            <h3 className="font-bold mb-5">Edit Profile</h3>
            {saved && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-[#09ffd3]/10 border border-[#09ffd3]/20 text-[#09ffd3] text-sm">
                ✓ Profile updated successfully
              </div>
            )}
            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "name", label: "Full Name", type: "text" },
                { key: "phone", label: "Phone", type: "tel" },
                { key: "age", label: "Age", type: "number" },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 uppercase tracking-widest mb-1.5 block">{label}</label>
                  <input
                    type={type} value={(form as any)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#09ffd3]/50 transition text-sm"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-widest mb-1.5 block">Gender</label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#09ffd3]/50 transition text-sm">
                  <option value="" className="bg-[#02182b]">Select</option>
                  <option value="Male" className="bg-[#02182b]">Male</option>
                  <option value="Female" className="bg-[#02182b]">Female</option>
                  <option value="Other" className="bg-[#02182b]">Other</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <button type="submit" disabled={saving}
                  className="px-8 py-3 rounded-xl bg-[#09ffd3] text-[#02182b] font-bold text-sm hover:brightness-110 transition disabled:opacity-60">
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          {/* Test history */}
          <div className="gradient-border p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold">Test History</h3>
              <Link href="/dashboard" className="text-xs text-[#09ffd3] hover:underline">Full Dashboard →</Link>
            </div>
            {loadingHistory ? (
              <div className="flex flex-col gap-3">
                {[1,2,3].map((i) => <div key={i} className="skeleton h-12 w-full" />)}
              </div>
            ) : history.length === 0 ? (
              <p className="text-gray-500 text-sm">No tests yet. <Link href="/test" className="text-[#09ffd3] underline">Take your first test.</Link></p>
            ) : (
              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                {history.map((h: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                        style={{ backgroundColor: `${RISK_COLOR[h.riskLevel]}20`, color: RISK_COLOR[h.riskLevel] }}>
                        {h.finalScore}
                      </div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: RISK_COLOR[h.riskLevel] }}>{h.riskLevel} Risk</div>
                        <div className="text-xs text-gray-500">{new Date(h.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                      </div>
                    </div>
                    {h.aiInsight && (
                      <p className="text-xs text-gray-600 max-w-[200px] hidden md:block truncate">{h.aiInsight}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
