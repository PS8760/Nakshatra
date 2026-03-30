"use client";
import { useState, useEffect, useRef } from "react";
import { clamp } from "@/utils/helpers";

interface Props {
  onComplete: (score: number) => void;
}

type Phase = "waiting" | "ready" | "clicked" | "early";

export default function ReactionTest({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("waiting");
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const startRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const delay = 2000 + Math.random() * 3000;
    timerRef.current = setTimeout(() => {
      setPhase("ready");
      startRef.current = Date.now();
    }, delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  function handleClick() {
    if (phase === "waiting") {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase("early");
      onComplete(10); // penalize early click
      return;
    }
    if (phase === "ready") {
      const ms = Date.now() - startRef.current;
      setReactionMs(ms);
      setPhase("clicked");
      // 200ms = perfect (100), 1000ms+ = 0
      const score = clamp(Math.round(100 - ((ms - 200) / 8)), 0, 100);
      onComplete(score);
    }
  }

  return (
    <div className="fade-in flex flex-col items-center gap-6 text-center">
      <h2 className="text-2xl font-bold">⚡ Reaction Test</h2>
      <p className="text-gray-400">Click the circle as soon as it turns green</p>

      <button
        onClick={handleClick}
        className={`w-40 h-40 rounded-full font-bold text-lg transition-all duration-200 ${
          phase === "ready"
            ? "bg-[#09ffd3] text-[#02182b] scale-110 shadow-[0_0_40px_#09ffd3]"
            : "bg-white/10 text-gray-400 border border-white/10"
        }`}
      >
        {phase === "waiting" ? "Wait…" : phase === "ready" ? "NOW!" : phase === "early" ? "Too early" : "✓"}
      </button>

      {phase === "clicked" && reactionMs !== null && (
        <p className="text-[#09ffd3]">
          Reaction time: <span className="font-bold">{reactionMs}ms</span> — Reaction test complete ✓
        </p>
      )}
      {phase === "early" && (
        <p className="text-yellow-400">You clicked too early. Score recorded.</p>
      )}
    </div>
  );
}
