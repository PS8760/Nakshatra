"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { ScoreResult } from "@/utils/scoring";
import AuthGuard from "@/components/AuthGuard";
import { fadeUp, scaleIn, staggerContainer } from "@/utils/motion";
import { useAuth } from "@/context/AuthContext";

const RISK_COLOR: Record<string, string> = { Low: "#09ffd3", Medium: "#f59e0b", High: "#ef4444" };
const RISK_BG: Record<string, string> = {
  Low: "bg-[#09ffd3]/10 border-[#09ffd3]/30",
  Medium: "bg-amber-500/10 border-amber-500/30",
  High: "bg-red-500/10 border-red-500/30",
};

interface FullResult extends ScoreResult {
  rawScores?: { memory: number; reaction: number; pattern: number; speech: number; facial: number };
  aiInsight?: string;
}

export default function ResultPage() {
  const [result, setResult] = useState<FullResult | null>(null);
  const [animated, setAnimated] = useState(0);
  const [barsVisible, setBarsVisible] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { user } = useAuth();

  async function handleExport() {
    if (!result) return;
    setExporting(true);
    try {
      const { exportReportPdf } = await import("@/utils/exportPdf");
      await exportReportPdf(result, user?.name ?? "Patient");
    } catch (e) {
      console.error("PDF export failed", e);
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("cogniResult");
      if (raw) {
        const parsed: FullResult = JSON.parse(raw);
        setResult(parsed);
        let current = 0;
        const target = parsed.finalScore;
        const interval = setInterval(() => {
          current = Math.min(current + 1, target);
          setAnimated(current);
          if (current >= target) { clearInterval(interval); setTimeout(() => setBarsVisible(true), 200); }
        }, 18);
        return () => clearInterval(interval);
      }
    } catch { /* ignore */ }
  }, []);

  if (!result) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">No results found.</p>
        <Link href="/" className="text-[#09ffd3] underline">Go home</Link>
      </div>
    );
  }

  const color = RISK_COLOR[result.riskLevel] ?? "#09ffd3";
  const bgClass = RISK_BG[result.riskLevel] ?? RISK_BG.Low;
  const circumference = 2 * Math.PI * 56;
  const dashOffset = circumference - (animated / 100) * circumference;

  const domains = result.rawScores ? [
    { label: "Memory", score: result.rawScores.memory, icon: "🧩", color: "#09ffd3" },
    { label: "Reaction", score: result.rawScores.reaction, icon: "⚡", color: "#6366f1" },
    { label: "Pattern", score: result.rawScores.pattern, icon: "🔷", color: "#f59e0b" },
    { label: "Facial", score: result.rawScores.facial ?? 0, icon: "👁️", color: "#a78bfa" },
    { label: "Speech", score: result.rawScores.speech, icon: "🎙️", color: "#ec4899" },
  ] : [];

  return (
    <AuthGuard>
    <motion.div
      className="max-w-2xl mx-auto px-6 py-12"
      variants={staggerContainer(0.1, 0.05)}
      initial="hidden"
      animate="show"
    >
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: `${color}15` }} />
      </div>

      <div className="flex flex-col items-center gap-7">
        {/* Score ring */}
        <motion.div variants={scaleIn} className="relative flex items-center justify-center">
          {/* Outer glow ring */}
          <div className="absolute w-44 h-44 rounded-full opacity-20 blur-xl" style={{ backgroundColor: color }} />
          <svg width="168" height="168" className="-rotate-90 relative">
            <circle cx="84" cy="84" r="56" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
            <circle cx="84" cy="84" r="56" fill="none" stroke={color} strokeWidth="10"
              strokeDasharray={circumference} strokeDashoffset={dashOffset}
              strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.018s linear", filter: `drop-shadow(0 0 8px ${color}80)` }} />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-extrabold glow-text" style={{ color }}>{animated}</span>
            <span className="text-xs text-gray-500 mt-0.5">/ 100</span>
          </div>
        </motion.div>

        {/* Risk badge */}
        <div className={`px-6 py-2.5 rounded-full border text-sm font-bold ${bgClass} shadow-lg`} style={{ color }}>
          {result.riskLevel === "Low" ? "🟢" : result.riskLevel === "Medium" ? "🟡" : "🔴"} {result.riskLevel} Cognitive Risk
        </div>

        {/* AI Insight */}
        {result.aiInsight && (
          <div className="w-full gradient-border p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#09ffd3]/10 border border-[#09ffd3]/20 flex items-center justify-center text-sm flex-shrink-0">✨</div>
              <div>
                <p className="text-xs text-[#09ffd3] uppercase tracking-widest mb-1.5 font-semibold">AI Insight</p>
                <p className="text-gray-300 text-sm leading-relaxed">{result.aiInsight}</p>
              </div>
            </div>
          </div>
        )}

        {/* Domain breakdown */}
        {domains.length > 0 && (
          <div className="w-full gradient-border p-6">
            <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-5">Domain Breakdown</h3>
            <div className="flex flex-col gap-4">
              {domains.map((d) => (
                <div key={d.label} className="flex items-center gap-3">
                  <span className="text-lg w-7">{d.icon}</span>
                  <span className="text-sm text-gray-400 w-20">{d.label}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-white/8 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: barsVisible ? `${d.score}%` : "0%", backgroundColor: d.color, boxShadow: `0 0 8px ${d.color}60` }} />
                  </div>
                  <span className="text-sm font-bold w-10 text-right" style={{ color: d.color }}>{d.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analysis */}
        <div className="w-full gradient-border p-6">
          <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-3">Analysis</h3>
          <p className="text-gray-200 leading-relaxed text-sm">{result.explanation}</p>
        </div>

        {/* Recommendations */}
        <div className="w-full gradient-border p-6">
          <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-4">Recommendations</h3>
          <ul className="flex flex-col gap-3">
            {result.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                <span className="text-[#09ffd3] mt-0.5 flex-shrink-0 text-base">✦</span>
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Caregiver alert */}
        {result.riskLevel === "High" && (
          <div className="w-full bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚨</span>
              <div>
                <p className="font-semibold text-red-300 mb-1">Caregiver Alert Triggered</p>
                <p className="text-red-300/80 text-sm leading-relaxed">
                  High cognitive risk detected. Visit the{" "}
                  <Link href="/caregiver" className="underline hover:text-red-200">Caregiver Portal</Link> to notify your support network.
                  Consider <Link href="/doctors" className="underline hover:text-red-200">finding a specialist</Link> nearby.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
          <Link href="/dashboard">
            <button className="w-full py-3 rounded-xl border border-white/10 text-gray-300 hover:border-[#09ffd3]/30 hover:text-[#09ffd3] transition text-xs font-semibold">
              📊 History
            </button>
          </Link>
          <Link href="/doctors">
            <button className="w-full py-3 rounded-xl border border-white/10 text-gray-300 hover:border-[#09ffd3]/30 hover:text-[#09ffd3] transition text-xs font-semibold">
              🩺 Doctors
            </button>
          </Link>
          <Link href="/test">
            <button className="w-full py-3 rounded-xl border border-[#09ffd3]/30 text-[#09ffd3] hover:bg-[#09ffd3]/5 transition text-xs font-semibold">
              🔄 Retake
            </button>
          </Link>
          <Link href="/">
            <button className="w-full py-3 rounded-xl bg-[#09ffd3] text-[#02182b] font-bold hover:brightness-110 transition text-xs">
              Home
            </button>
          </Link>
        </div>

        {/* PDF Export */}
        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full py-3 rounded-xl border border-white/10 text-gray-400 hover:border-[#09ffd3]/30 hover:text-[#09ffd3] transition text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {exporting ? (
            <><span className="w-3 h-3 border border-[#09ffd3] border-t-transparent rounded-full animate-spin" /> Generating PDF…</>
          ) : (
            <><span>📄</span> Download PDF Report</>
          )}
        </button>

        <p className="text-xs text-gray-600 text-center">
          Screening tool only — not a medical diagnosis. Consult a healthcare professional.
        </p>
      </div>
    </motion.div>
    </AuthGuard>
  );
}
