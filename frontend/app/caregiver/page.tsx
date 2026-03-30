"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiFetch } from "@/utils/api";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";

interface HistoryEntry {
  date: string;
  finalScore: number;
  riskLevel: "Low" | "Medium" | "High";
  rawScores?: { memory: number; reaction: number; pattern: number; speech: number };
  aiInsight?: string;
}

const RISK_COLOR: Record<string, string> = { Low: "#09ffd3", Medium: "#f59e0b", High: "#ef4444" };
const RISK_BG: Record<string, string> = {
  Low: "bg-[#09ffd3]/10 border-[#09ffd3]/20",
  Medium: "bg-amber-500/10 border-amber-500/20",
  High: "bg-red-500/10 border-red-500/20",
};

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

const DOMAINS = ["memory", "reaction", "pattern", "speech"] as const;
const DOMAIN_COLOR: Record<string, string> = {
  memory: "#09ffd3", reaction: "#6366f1", pattern: "#f59e0b", speech: "#ec4899",
};

function SkeletonCard() {
  return (
    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/8 animate-pulse">
      <div className="h-8 w-16 bg-white/10 rounded mx-auto mb-2" />
      <div className="h-3 w-20 bg-white/5 rounded mx-auto" />
    </div>
  );
}

export default function CaregiverPage() {
  const { user, token } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertSent, setAlertSent] = useState(false);
  const [alertError, setAlertError] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    if (token) {
      try {
        const data = await apiFetch("/history", {}, token);
        if (Array.isArray(data.history)) {
          setHistory(data.history);
          setLastRefresh(new Date());
          setLoading(false);
          return;
        }
      } catch { /* fallback */ }
    }
    try {
      const stored = JSON.parse(localStorage.getItem("cogniHistory") || "[]") as HistoryEntry[];
      setHistory(stored);
    } catch { /* ignore */ }
    setLastRefresh(new Date());
    setLoading(false);
  }, [token]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const highRiskCount = history.filter((h) => h.riskLevel === "High").length;
  const latest = history[0];
  const isHighRisk = latest?.riskLevel === "High";
  const trend = history.length >= 2 ? history[0].finalScore - history[1].finalScore : null;
  const avgScore = history.length ? Math.round(history.reduce((s, h) => s + h.finalScore, 0) / history.length) : null;

  const domainAvg = DOMAINS.reduce((acc, d) => {
    const vals = history.map((h) => h.rawScores?.[d]).filter((v): v is number => v !== undefined);
    acc[d] = vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : null;
    return acc;
  }, {} as Record<string, number | null>);

  async function sendAlert(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setAlertError("");
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
      setAlertSent(true);
    } catch (err: any) {
      setAlertError(err.message || "Failed to send alert. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <AuthGuard>
    <div className="max-w-5xl mx-auto px-6 py-12 fade-in">

      <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
        <div>
          <span className="inline-block px-4 py-1.5 rounded-full border border-[#09ffd3]/30 text-[#09ffd3] text-xs font-semibold mb-4 bg-[#09ffd3]/5 tracking-widest uppercase">
            Caregiver Portal
          </span>
          <h1 className="text-3xl font-extrabold mb-1">Caregiver Dashboard</h1>
          <p className="text-gray-500 text-sm">
            {user?.name ? `Monitoring: ${user.name}` : "Monitor cognitive health, receive alerts, and access support resources."}
          </p>
        </div>
        <button onClick={loadHistory} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-gray-400 text-xs hover:border-[#09ffd3]/30 hover:text-[#09ffd3] transition disabled:opacity-40">
          <span className={loading ? "animate-spin inline-block" : ""}>↻</span>
          {lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Refresh"}
        </button>
      </div>

      {!loading && isHighRisk && (
        <div className="mb-8 p-5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-4">
          <span className="text-3xl">🚨</span>
          <div>
            <p className="font-bold text-red-300 mb-1">High Risk Alert</p>
            <p className="text-red-300/80 text-sm leading-relaxed">
              Most recent test shows <strong>High Cognitive Risk</strong> (score: {latest.finalScore}/100).
              Immediate professional consultation is recommended.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <>{[0,1,2,3].map((i) => <SkeletonCard key={i} />)}</>
        ) : (
          <>
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/8 text-center">
              <div className="text-3xl font-extrabold mb-1" style={{ color: latest ? RISK_COLOR[latest.riskLevel] : "#fff" }}>
                {latest?.finalScore ?? "—"}
              </div>
              <div className="text-xs text-gray-500">Latest Score</div>
              {latest && <div className="mt-1.5 text-xs font-semibold" style={{ color: RISK_COLOR[latest.riskLevel] }}>{latest.riskLevel} Risk</div>}
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/8 text-center">
              <div className="text-3xl font-extrabold mb-1 text-[#09ffd3]">{avgScore ?? "—"}</div>
              <div className="text-xs text-gray-500">Avg Score</div>
              {trend !== null && (
                <div className={`mt-1.5 text-xs font-semibold ${trend >= 0 ? "text-[#09ffd3]" : "text-red-400"}`}>
                  {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)} vs prev
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
          </>
        )}
      </div>

      {!loading && history.length > 0 && (
        <div className="mb-8 p-6 rounded-2xl bg-white/[0.03] border border-white/8">
          <h2 className="font-bold text-sm mb-5">
            Domain Averages
            <span className="text-gray-500 font-normal text-xs ml-2">across all {history.length} tests</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {DOMAINS.map((d) => (
              <div key={d} className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 capitalize">{d}</span>
                  <span className="text-xs font-bold" style={{ color: DOMAIN_COLOR[d] }}>{domainAvg[d] ?? "—"}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: domainAvg[d] ? `${domainAvg[d]}%` : "0%", backgroundColor: DOMAIN_COLOR[d], boxShadow: `0 0 6px ${DOMAIN_COLOR[d]}60` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8">
          <h2 className="font-bold mb-1">Send Alert to Caregiver</h2>
          <p className="text-gray-500 text-sm mb-4">Notify a doctor or family member about the latest results.</p>
          {alertSent ? (
            <div className="p-4 rounded-xl bg-[#09ffd3]/10 border border-[#09ffd3]/20 text-[#09ffd3] text-sm flex flex-col gap-3">
              <p>✓ Alert sent to <strong>{email}</strong>.</p>
              <button onClick={() => { setAlertSent(false); setEmail(""); setMessage(""); }}
                className="text-xs text-gray-400 hover:text-white transition underline self-start">
                Send another alert
              </button>
            </div>
          ) : (
            <form onSubmit={sendAlert} className="flex flex-col gap-3">
              {alertError && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{alertError}</div>
              )}
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="caregiver@example.com" required
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#09ffd3] transition text-sm" />
              <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="Optional message…"
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#09ffd3] transition text-sm resize-none" />
              {latest && (
                <div className={`px-3 py-2 rounded-lg border text-xs ${RISK_BG[latest.riskLevel]}`} style={{ color: RISK_COLOR[latest.riskLevel] }}>
                  Will include: Score {latest.finalScore}/100 · {latest.riskLevel} Risk · {new Date(latest.date).toLocaleDateString()}
                </div>
              )}
              <button type="submit" disabled={sending}
                className="px-6 py-3 rounded-xl bg-[#09ffd3] text-[#02182b] font-bold text-sm hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {sending ? (
                  <><span className="w-4 h-4 border-2 border-[#02182b]/30 border-t-[#02182b] rounded-full animate-spin" /> Sending…</>
                ) : "Send Alert →"}
              </button>
            </form>
          )}
        </div>

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

      <div className="mb-8 p-6 rounded-2xl bg-white/[0.03] border border-white/8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Recent Test History</h2>
          <Link href="/dashboard" className="text-xs text-[#09ffd3] hover:underline">View full dashboard →</Link>
        </div>
        {loading ? (
          <div className="flex flex-col gap-3">{[0,1,2].map((i) => <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />)}</div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            <p className="text-2xl mb-2">📋</p>
            No test history yet.{" "}
            <Link href="/test" className="text-[#09ffd3] hover:underline">Take your first test →</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {history.slice(0, 6).map((h, i) => (
              <div key={i} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-white/[0.03] transition border border-transparent hover:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: `${RISK_COLOR[h.riskLevel]}15`, color: RISK_COLOR[h.riskLevel], border: `1px solid ${RISK_COLOR[h.riskLevel]}30` }}>
                    {h.finalScore}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: RISK_COLOR[h.riskLevel] }}>{h.riskLevel} Risk</div>
                    <div className="text-xs text-gray-500">{new Date(h.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {h.rawScores && (
                    <div className="hidden sm:flex items-end gap-0.5 h-5">
                      {DOMAINS.map((d) => (
                        <div key={d} className="w-1 rounded-sm" style={{ height: `${Math.max(3, (h.rawScores![d] / 100) * 20)}px`, backgroundColor: DOMAIN_COLOR[d], opacity: 0.7 }} />
                      ))}
                    </div>
                  )}
                  {h.riskLevel === "High" && (
                    <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">Alert</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/8">
        <h2 className="font-bold mb-4">Support Resources</h2>
        <div className="flex flex-col gap-3">
          {RESOURCES.map((r) => (
            <a key={r.title} href={r.url} target="_blank" rel="noopener noreferrer"
              className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-[#09ffd3]/30 transition group">
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
