"use client";
import { useState } from "react";
import type { HistoryEntry } from "@/utils/exportPdf";

interface Props {
  history: HistoryEntry[];
  userName: string;
  onClose: () => void;
}

const RISK_COLOR: Record<string, string> = { Low: "#09ffd3", Medium: "#f59e0b", High: "#ef4444" };

export default function ReportModal({ history, userName, onClose }: Props) {
  const [mode, setMode] = useState<"choose" | "overall" | "select">("choose");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [generating, setGenerating] = useState(false);

  function toggleEntry(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(history.map((_, i) => i)));
  }

  async function generate() {
    setGenerating(true);
    try {
      if (mode === "overall") {
        const { exportOverallReportPdf } = await import("@/utils/exportPdf");
        await exportOverallReportPdf(history, userName);
      } else {
        const chosen = history.filter((_, i) => selected.has(i));
        if (chosen.length === 0) return;
        if (chosen.length === 1) {
          // Single test — use the single-test report
          const { exportReportPdf } = await import("@/utils/exportPdf");
          const entry = chosen[0];
          await exportReportPdf(
            {
              finalScore: entry.finalScore,
              riskLevel: entry.riskLevel,
              explanation: entry.aiInsight ?? "No analysis available for this test.",
              recommendations: [],
              aiInsight: entry.aiInsight,
              rawScores: entry.rawScores,
            },
            userName
          );
        } else {
          // Multiple selected — use overall report with subset
          const { exportOverallReportPdf } = await import("@/utils/exportPdf");
          await exportOverallReportPdf(chosen, userName);
        }
      }
      onClose();
    } catch (e) {
      console.error("PDF generation failed", e);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      style={{ background: "rgba(2,24,43,0.85)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-[#031e35] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div>
            <h2 className="font-bold text-base">Generate Report</h2>
            <p className="text-gray-500 text-xs mt-0.5">Choose what to include in your PDF</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 transition flex items-center justify-center text-gray-400 text-sm">
            ✕
          </button>
        </div>

        {/* Choose mode */}
        {mode === "choose" && (
          <div className="p-6 flex flex-col gap-4">
            <button
              onClick={() => { setMode("overall"); }}
              className="group flex items-start gap-4 p-5 rounded-xl border border-white/8 hover:border-[#09ffd3]/40 bg-white/[0.02] hover:bg-[#09ffd3]/5 transition text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-[#09ffd3]/10 border border-[#09ffd3]/20 flex items-center justify-center text-xl flex-shrink-0">
                📊
              </div>
              <div>
                <div className="font-semibold text-sm group-hover:text-[#09ffd3] transition-colors">
                  Full History Report
                </div>
                <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Cumulative report across all {history.length} tests — includes score timeline, domain averages, risk distribution, and per-test breakdown.
                </div>
                <div className="mt-2 text-xs text-[#09ffd3]/70 font-medium">
                  {history.length} tests · {history.length > 1 ? "Multi-page PDF" : "Single page"}
                </div>
              </div>
            </button>

            <button
              onClick={() => setMode("select")}
              className="group flex items-start gap-4 p-5 rounded-xl border border-white/8 hover:border-[#6366f1]/40 bg-white/[0.02] hover:bg-[#6366f1]/5 transition text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/20 flex items-center justify-center text-xl flex-shrink-0">
                🎯
              </div>
              <div>
                <div className="font-semibold text-sm group-hover:text-[#6366f1] transition-colors">
                  Select Specific Tests
                </div>
                <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Pick one or more individual tests to include. Great for sharing a specific session with a doctor.
                </div>
                <div className="mt-2 text-xs text-[#6366f1]/70 font-medium">
                  Choose from {history.length} available tests
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Overall confirm */}
        {mode === "overall" && (
          <div className="p-6 flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-[#09ffd3]/5 border border-[#09ffd3]/15">
              <p className="text-sm text-gray-300 leading-relaxed">
                This will generate a <strong className="text-[#09ffd3]">comprehensive PDF</strong> covering all {history.length} tests with:
              </p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {["Score timeline chart", "Domain averages across all tests", "Risk distribution breakdown", "Per-test detail with domain scores"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="text-[#09ffd3]">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setMode("choose")} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:border-white/20 transition">
                Back
              </button>
              <button onClick={generate} disabled={generating}
                className="flex-1 py-2.5 rounded-xl bg-[#09ffd3] text-[#02182b] font-bold text-sm hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {generating ? (
                  <><span className="w-4 h-4 border-2 border-[#02182b]/30 border-t-[#02182b] rounded-full animate-spin" /> Generating...</>
                ) : "Download PDF"}
              </button>
            </div>
          </div>
        )}

        {/* Select tests */}
        {mode === "select" && (
          <div className="flex flex-col">
            <div className="px-6 pt-4 pb-2 flex items-center justify-between">
              <span className="text-xs text-gray-500">{selected.size} selected</span>
              <button onClick={selectAll} className="text-xs text-[#09ffd3] hover:underline">Select all</button>
            </div>

            <div className="px-6 pb-2 max-h-64 overflow-y-auto flex flex-col gap-2">
              {history.map((entry, i) => {
                const isSelected = selected.has(i);
                const rc = RISK_COLOR[entry.riskLevel] ?? "#09ffd3";
                return (
                  <button
                    key={i}
                    onClick={() => toggleEntry(i)}
                    className="flex items-center gap-3 p-3 rounded-xl border transition text-left w-full"
                    style={{
                      borderColor: isSelected ? `${rc}50` : "rgba(255,255,255,0.06)",
                      backgroundColor: isSelected ? `${rc}08` : "rgba(255,255,255,0.02)",
                    }}
                  >
                    {/* Checkbox */}
                    <div
                      className="w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        borderColor: isSelected ? rc : "rgba(255,255,255,0.15)",
                        backgroundColor: isSelected ? rc : "transparent",
                      }}
                    >
                      {isSelected && <span className="text-[#02182b] text-xs font-bold">✓</span>}
                    </div>

                    {/* Score badge */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: `${rc}15`, color: rc, border: `1px solid ${rc}30` }}
                    >
                      {entry.finalScore}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold" style={{ color: rc }}>{entry.riskLevel} Risk</div>
                      <div className="text-xs text-gray-500">
                        {new Date(entry.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>

                    {/* Domain mini bars */}
                    {entry.rawScores && (
                      <div className="hidden sm:flex items-end gap-0.5 h-5 flex-shrink-0">
                        {(["memory", "reaction", "pattern", "speech"] as const).map((d) => {
                          const dColors: Record<string, string> = { memory: "#09ffd3", reaction: "#6366f1", pattern: "#f59e0b", speech: "#ec4899" };
                          return (
                            <div key={d} className="w-1 rounded-sm"
                              style={{ height: `${Math.max(3, (entry.rawScores![d] / 100) * 20)}px`, backgroundColor: dColors[d], opacity: 0.7 }} />
                          );
                        })}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="px-6 py-4 border-t border-white/8 flex gap-3">
              <button onClick={() => setMode("choose")} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:border-white/20 transition">
                Back
              </button>
              <button
                onClick={generate}
                disabled={generating || selected.size === 0}
                className="flex-1 py-2.5 rounded-xl bg-[#6366f1] text-white font-bold text-sm hover:brightness-110 transition disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                ) : `Download ${selected.size > 0 ? `(${selected.size})` : ""} PDF`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
