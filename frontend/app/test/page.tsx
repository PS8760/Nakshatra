"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import MemoryTest from "@/components/MemoryTest";
import ReactionTest from "@/components/ReactionTest";
import PatternTest from "@/components/PatternTest";
import SpeechTest from "@/components/SpeechTest";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/utils/api";

const STEPS = [
  { label: "Memory", icon: "🧩", desc: "Word recall" },
  { label: "Reaction", icon: "⚡", desc: "Response speed" },
  { label: "Pattern", icon: "🔷", desc: "Sequence memory" },
  { label: "Speech", icon: "🎙️", desc: "Verbal fluency" },
];

export default function TestPage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({ memory: 0, reaction: 0, pattern: 0, speech: 0 });
  const [loading, setLoading] = useState(false);

  async function submitScores(finalScores: typeof scores) {
    setLoading(true);
    const payload = {
      memory: Math.round(finalScores.memory * 0.7 + finalScores.pattern * 0.3),
      reaction: finalScores.reaction,
      speech: finalScores.speech,
      pattern: finalScores.pattern,
    };
    try {
      const data = await apiFetch("/score", { method: "POST", body: JSON.stringify(payload) }, token);
      data.rawScores = finalScores;
      sessionStorage.setItem("cogniResult", JSON.stringify(data));
    } catch {
      const { computeScore } = await import("@/utils/scoring");
      const result = computeScore(payload);
      (result as any).rawScores = finalScores;
      sessionStorage.setItem("cogniResult", JSON.stringify(result));
    } finally {
      // Also save to localStorage for offline dashboard
      try {
        const history = JSON.parse(localStorage.getItem("cogniHistory") || "[]");
        const raw = sessionStorage.getItem("cogniResult");
        if (raw) {
          history.unshift({ date: new Date().toISOString(), ...JSON.parse(raw) });
          localStorage.setItem("cogniHistory", JSON.stringify(history.slice(0, 20)));
        }
      } catch { /* ignore */ }
      setLoading(false);
      router.push("/result");
    }
  }

  function next(key: keyof typeof scores, value: number) {
    const updated = { ...scores, [key]: value };
    setScores(updated);
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else submitScores(updated);
  }

  const progress = (step / STEPS.length) * 100;

  return (
    <AuthGuard>
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 py-12 relative">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orb1 absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-[#09ffd3]/3 blur-3xl" />
        <div className="orb2 absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-indigo-500/3 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* User greeting */}
        {user && (
          <p className="text-center text-sm text-gray-500 mb-4">
            Testing as <span className="text-[#09ffd3] font-medium">{user.name}</span>
          </p>
        )}

        {/* Step indicators */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {STEPS.map((s, i) => (
              <div key={s.label} className="flex flex-col items-center gap-1.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base transition-all duration-300 ${
                  i < step ? "bg-[#09ffd3] text-[#02182b] shadow-[0_0_16px_rgba(9,255,211,0.4)]"
                  : i === step ? "bg-[#09ffd3]/15 border-2 border-[#09ffd3] text-[#09ffd3]"
                  : "bg-white/5 border border-white/10 text-gray-600"
                }`}>
                  {i < step ? "✓" : s.icon}
                </div>
                <span className={`text-xs font-medium ${i === step ? "text-[#09ffd3]" : "text-gray-600"}`}>{s.label}</span>
                <span className="text-[10px] text-gray-700 hidden sm:block">{s.desc}</span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#09ffd3] to-[#09ffd3]/70 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }} />
          </div>
          <p className="text-right text-xs text-gray-600 mt-1.5">Step {step + 1} of {STEPS.length}</p>
        </div>

        {/* Test card */}
        <div className="gradient-border p-8 min-h-[340px] flex items-center justify-center relative overflow-hidden">
          <div className="scan-line" />
          {loading ? (
            <div className="flex flex-col items-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-[#09ffd3]/20 animate-ping absolute inset-0" />
                <div className="w-16 h-16 rounded-full border-2 border-[#09ffd3]/10 animate-ping absolute inset-0" style={{ animationDelay: "0.3s" }} />
                <div className="w-16 h-16 flex items-center justify-center text-3xl relative">🧠</div>
              </div>
              <div className="text-center">
                <p className="text-[#09ffd3] font-semibold mb-1">Analyzing your cognitive profile…</p>
                <p className="text-gray-500 text-xs">AI is processing your results</p>
              </div>
            </div>
          ) : (
            <div className="w-full fade-in">
              {step === 0 && <MemoryTest onComplete={(s) => next("memory", s)} />}
              {step === 1 && <ReactionTest onComplete={(s) => next("reaction", s)} />}
              {step === 2 && <PatternTest onComplete={(s) => next("pattern", s)} />}
              {step === 3 && <SpeechTest onComplete={(s) => next("speech", s)} />}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">
          Results are private and {token ? "saved to your account" : "stored locally"}
        </p>
      </div>
    </div>
    </AuthGuard>
  );
}
