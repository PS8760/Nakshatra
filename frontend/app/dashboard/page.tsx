"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/utils/api";
import AuthGuard from "@/components/AuthGuard";

interface HistoryEntry {
  date: string;
  finalScore: number;
  riskLevel: "Low" | "Medium" | "High";
  rawScores?: { memory: number; reaction: number; pattern: number; speech: number; facial?: number };
  aiInsight?: string;
}

const RISK_COLOR: Record<string, string> = { Low: "#09ffd3", Medium: "#f59e0b", High: "#ef4444" };

const MOCK: HistoryEntry[] = [
  { date: new Date(Date.now() - 6 * 86400000).toISOString(), finalScore: 72, riskLevel: "Low", rawScores: { memory: 80, reaction: 70, pattern: 65, speech: 60 } },
  { date: new Date(Date.now() - 4 * 86400000).toISOString(), finalScore: 58, riskLevel: "Medium", rawScores: { memory: 55, reaction: 65, pattern: 55, speech: 60 } },
  { date: new Date(Date.now() - 2 * 86400000).toISOString(), finalScore: 70, riskLevel: "Low", rawScores: { memory: 75, reaction: 68, pattern: 65, speech: 70 } },
  { date: new Date().toISOString(), finalScore: 78, riskLevel: "Low", rawScores: { memory: 85, reaction: 75, pattern: 72, speech: 70 } },
];

function Chart({ data }: { data: HistoryEntry[] }) {
  const scores = data.map((d) => d.finalScore);
  if (scores.length < 2) return <p className="text-gray-600 text-sm text-center py-8">Take more tests to see your trend.</p>;
  const W = 500; const H = 120; const pad = 16;
  const points = scores.map((s, i) => {
    const x = pad + (i / (scores.length - 1)) * (W - pad * 2);
    const y = H - pad - (s / 100) * (H - pad * 2);
    return [x, y] as [number, number];
  });
  const polyline = points.map((p) => p.join(",")).join(" ");
  const area = `${pad},${H - pad} ${polyline} ${W - pad},${H - pad}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32" preserveAspectRatio="none">
      <defs>
        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#09ffd3" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#09ffd3" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#cg)" />
      <polyline points={polyline} fill="none" stroke="#09ffd3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 4px #09ffd380)" }} />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill="#09ffd3" stroke="#02182b" strokeWidth="2" />
      ))}
    </svg>
  );
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [useMock, setUseMock] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (token) {
        try {
          const data = await apiFetch("/history", {}, token);
          if (data.history?.length > 0) {
            setHistory(data.history);
            setLoading(false);
            return;
          }
          // Logged in but no history yet — show empty state, NOT mock
          setHistory([]);
          setLoading(false);
          return;
        } catch { /* fallback to localStorage */ }
      }
      // Not logged in — try localStorage
      const stored = JSON.parse(localStorage.getItem("cogniHistory") || "[]") as HistoryEntry[];
      if (stored.length > 0) {
        setHistory(stored);
      } else {
        // Only show mock if completely unauthenticated
        setHistory(MOCK);
        setUseMock(true);
      }
      setLoading(false);
    }
    load();
  }, [token]);

  const latest = history[0];
  const avg = history.length ? Math.round(history.reduce((a, b) => a + b.finalScore, 0) / history.length) : 0;
  const trend = history.length >= 2 ? history[0].finalScore - history[history.length - 1].finalScore : 0;
  const highRisk = history.filter((h) => h.riskLevel === "High").length;

  return (
    <AuthGuard>
    <div className="max-w-5xl mx-auto px-6 py-12 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold mb-1">
            {user ? `${user.name}'s Dashboard` : "Dashboard"}
          </h1>
          <p className="text-gray-500 text-sm">Your cognitive health over time</p>
        </div>
        <Link href="/test">
          <button className="px-5 py-2.5 rounded-xl bg-[#09ffd3] text-[#02182b] font-bold text-sm hover:brightness-110 transition shadow-[0_0_16px_rgba(9,255,211,0.2)]">
            + New Test
          </button>
        </Link>
      </div>

      {useMock && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          Showing demo data. <Link href="/test" className="underline">Take a real test</Link> or <Link href="/login" className="underline">sign in</Link> to see your history.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Latest Score", value: latest?.finalScore ?? "—", color: latest ? RISK_COLOR[latest.riskLevel] : "#fff" },
          { label: "Average Score", value: avg || "—", color: "#6366f1" },
          { label: "Tests Taken", value: history.length, color: "#f59e0b" },
          { label: "Trend", value: trend === 0 ? "Stable" : trend > 0 ? `↑ +${trend}` : `↓ ${trend}`, color: trend >= 0 ? "#09ffd3" : "#ef4444" },
        ].map((s) => (
          <div key={s.label} className="gradient-border p-5 text-center card-hover">
            {loading ? <div className="skeleton h-8 w-16 mx-auto mb-2" /> : (
              <div className="text-2xl font-extrabold mb-1" style={{ color: s.color }}>{s.value}</div>
            )}
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="gradient-border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm text-gray-500 uppercase tracking-widest">Score Trend</h2>
          {highRisk > 0 && (
            <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              {highRisk} High Risk
            </span>
          )}
        </div>
        {loading ? <div className="skeleton h-32 w-full" /> : <Chart data={[...history].reverse()} />}
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span>{history.length > 0 ? new Date([...history].reverse()[0].date).toLocaleDateString() : ""}</span>
          <span>{history.length > 0 ? new Date(history[0].date).toLocaleDateString() : ""}</span>
        </div>
      </div>

      {/* Domain averages */}
      {history.some((h) => h.rawScores) && (
        <div className="gradient-border p-6 mb-6">
          <h2 className="text-sm text-gray-500 uppercase tracking-widest mb-5">Average by Domain</h2>
          {(["memory", "reaction", "pattern", "facial", "speech"] as const).map((domain) => {
            const vals = history.filter((h) => h.rawScores).map((h) => h.rawScores![domain] ?? 0);
            const avg = vals.length ? Math.round(vals.reduce((a: number, b: number) => a + b, 0) / vals.length) : 0;
            const colors: Record<string, string> = { memory: "#09ffd3", reaction: "#6366f1", pattern: "#f59e0b", facial: "#a78bfa", speech: "#ec4899" };
            const icons: Record<string, string> = { memory: "🧩", reaction: "⚡", pattern: "🔷", facial: "👁️", speech: "🎙️" };
            return (
              <div key={domain} className="flex items-center gap-3 mb-3 last:mb-0">
                <span className="text-base w-6">{icons[domain]}</span>
                <span className="text-sm text-gray-400 capitalize w-20">{domain}</span>
                <div className="flex-1 h-2 rounded-full bg-white/8 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${avg}%`, backgroundColor: colors[domain], boxShadow: `0 0 6px ${colors[domain]}60` }} />
                </div>
                <span className="text-sm font-bold w-8 text-right" style={{ color: colors[domain] }}>{avg}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* History list */}
      <div className="gradient-border p-6">
        <h2 className="text-sm text-gray-500 uppercase tracking-widest mb-5">Test History</h2>
        {loading ? (
          <div className="flex flex-col gap-3">{[1,2,3].map((i) => <div key={i} className="skeleton h-14 w-full" />)}</div>
        ) : history.length === 0 ? (
          <p className="text-gray-500 text-sm">No tests yet. <Link href="/test" className="text-[#09ffd3] underline">Take your first test.</Link></p>
        ) : (
          <div className="flex flex-col gap-1">
            {history.map((h, i) => (
              <div key={i} className="flex items-start justify-between py-3.5 border-b border-white/5 last:border-0 group">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: `${RISK_COLOR[h.riskLevel]}15`, color: RISK_COLOR[h.riskLevel], border: `1px solid ${RISK_COLOR[h.riskLevel]}30` }}>
                    {h.finalScore}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: RISK_COLOR[h.riskLevel] }}>{h.riskLevel} Risk</div>
                    <div className="text-xs text-gray-500">{new Date(h.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                    {h.aiInsight && <p className="text-xs text-gray-600 mt-0.5 max-w-xs truncate">{h.aiInsight}</p>}
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  {h.rawScores && (
                    <div className="hidden md:flex gap-2">
                      {Object.entries(h.rawScores).map(([k, v]) => (
                        <span key={k} className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-md">{k[0].toUpperCase()}: {v}</span>
                      ))}
                    </div>
                  )}
                  {h.riskLevel === "High" && (
                    <span className="text-xs px-2 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/25">⚠ Alert</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </AuthGuard>
  );
}
