"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/utils/api";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";

interface HistoryEntry {
  date: string;
  finalScore: number;
  riskLevel: "Low" | "Medium" | "High";
  rawScores?: { memory: number; reaction: number; pattern: number; speech: number };
}

const RISK_COLOR: Record<string, string> = { Low: "#09ffd3", Medium: "#f59e0b", High: "#ef4444" };

const RESOURCES = [
  { title: "Alzheimer's Association", url: "https://www.alz.org", desc: "World's leading voluntary health organization in Alzheimer's care and research." },
  { title: "WHO Dementia Fact Sheet", url: "https://www.who.int/news-room/fact-sheets/detail/dementia", desc: "Global statistics and prevention strategies from the World Health Organization." },
  { title: "MCI Foundation", url: "https://www.mcifoundation.org", desc: "Resources for Mild Cognitive Impairment patients and caregivers." },
];

const TIPS = [
  "Keep a daily journal of behavioral changes — note dates, times, and context.",
  "Encourage regular physical activity; even 30-minute walks improve brain health.",
  "Maintain social engagement — isolation accelerates cognitive decline.",
  "Ensure consistent sleep schedules; poor sleep is a major risk factor.",
  "Consult a neurologist if two or more tests show Medium or High risk.",
  "Reduce stress through mindfulness, music, or gentle yoga.",
];

export default function CaregiverPage() {
  const { user, token } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [alertSent, setAlertSent] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function load() {
      // Try MongoDB first
      if (token) {
        try {
          const data = await apiFetch("/history", {}, token);
          if (data.history?.length > 0) { setHistory(data.history); return; }
        } catch { /* fallback */ }
      }
      // Fallback to localStorage
      try {
        const stored = JSON.parse(localStorage.getItem("cogniHistory") || "[]") as HistoryEntry[];
        setHistory(stored);
      } catch { /* ignore */ }
    }
    load();
  }, [token]);

  const highRiskCount = history.filter((h) => h.riskLevel === "High").length;
  const latest = history[0];
  const isHighRisk = latest?.riskLevel === "High";

  async function sendAlert(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    try {
      await apiFetch("/alert", {
        method: "POST",
        body: JSON.stringify({
          email,
          score: latest?.finalScore ?? 0,
          riskLevel: latest?.riskLevel ?? "Unknown",
          patientName: user?.name ?? "Patient",
          message,
        }),
      }, token);
    } catch { /* ignore */ }
    setSending(false);
    setAlertSent(true);
  }

  return (
    <AuthGuard>
    <div className="max-w-5xl mx-auto px-6 py-12 fade-in">
      {/* Header */}
      <div className="mb-10">
        <span className="inline-block px-4 py-1.5 rounded-full border border-[#09ffd3]/30 text-[#09ffd3] text-xs font-semibold mb-4 bg-[#09ffd3]/5 tracking-widest uppercase">
          Caregiver Portal
        </span>
        <h1 className="text-3xl font-extrabold mb-2">Caregiver Dashboard</h1>
        <p className="text-gray-500">Monitor cognitive health, receive alerts, and access support resources.</p>
      </div>

      {/* Alert banner */}
      {isHighRisk && (
        <div className="mb-8 p-5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-4">
          <span className="text-3xl">🚨</span>
          <div>
            <p className="font-bold text-red-300 mb-1">High Risk Alert</p>
            <p className="text-red-300/80 text-sm leading-relaxed">
              The most recent test result shows <strong>High Cognitive Risk</strong> (score: {latest.finalScore}/100).
              Immediate professional consultation is recommended.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Status cards */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/8 text-center">
          <div className="text-3xl font-extrabold mb-1" style={{ color: latest ? RISK_COLOR[latest.riskLevel] : "#fff" }}>
            {latest?.finalScore ?? "—"}
          </div>
          <div className="text-xs text-gray-500">Latest Score</div>
          {latest && (
            <div className="mt-2 text-xs font-semibold" style={{ color: RISK_COLOR[latest.riskLevel] }}>
              {latest.riskLevel} Risk
            </div>
          )}
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/8 text-center">
          <div className="text-3xl font-extrabold text-amber-400 mb-1">{highRiskCount}</div>
          <div className="text-xs text-gray-500">High Risk Tests</div>
        </div>
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/8 text-center">
          <div className="text-3xl font-extrabold text-[#09ffd3] mb-1">{history.length}</div>
          <div className="text-xs text-gray-500">Total Tests</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Alert form */}
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8">
          <h2 className="font-bold mb-1">Send Alert to Caregiver</h2>
          <p className="text-gray-500 text-sm mb-4">Notify a doctor or family member about the latest results.</p>
          {alertSent ? (
            <div className="p-4 rounded-xl bg-[#09ffd3]/10 border border-[#09ffd3]/20 text-[#09ffd3] text-sm">
              ✓ Alert sent to {email}. They will receive a summary report.
            </div>
          ) : (
            <form onSubmit={sendAlert} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="caregiver@example.com"
                required
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#09ffd3] transition text-sm"
              />
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Optional message…"
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#09ffd3] transition text-sm resize-none"
              />
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-3 rounded-xl bg-[#09ffd3] text-[#02182b] font-bold text-sm hover:brightness-110 transition disabled:opacity-50"
              >
                {sending ? "Sending…" : "Send Alert"}
              </button>
            </form>
          )}
        </div>

        {/* Caregiver tips */}
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8">
          <h2 className="font-bold mb-4">Caregiver Tips</h2>
          <ul className="flex flex-col gap-3">
            {TIPS.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                <span className="text-[#09ffd3] mt-0.5 flex-shrink-0">✦</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent history */}
      {history.length > 0 && (
        <div className="mb-8 p-6 rounded-2xl bg-white/[0.03] border border-white/8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Recent Test History</h2>
            <Link href="/dashboard" className="text-xs text-[#09ffd3] hover:underline">View full dashboard →</Link>
          </div>
          <div className="flex flex-col gap-3">
            {history.slice(0, 5).map((h, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm"
                    style={{ backgroundColor: `${RISK_COLOR[h.riskLevel]}20`, color: RISK_COLOR[h.riskLevel] }}
                  >
                    {h.finalScore}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: RISK_COLOR[h.riskLevel] }}>{h.riskLevel} Risk</div>
                    <div className="text-xs text-gray-500">{new Date(h.date).toLocaleDateString()}</div>
                  </div>
                </div>
                {h.riskLevel === "High" && (
                  <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Alert</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resources */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8">
        <h2 className="font-bold mb-4">Support Resources</h2>
        <div className="flex flex-col gap-4">
          {RESOURCES.map((r) => (
            <a
              key={r.title}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-[#09ffd3]/30 transition group"
            >
              <span className="text-[#09ffd3] mt-0.5">↗</span>
              <div>
                <div className="font-semibold text-sm group-hover:text-[#09ffd3] transition-colors">{r.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{r.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
