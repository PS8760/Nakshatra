"use client";
import { useState, useEffect } from "react";
import { getRandomWords, sleep } from "@/utils/helpers";

interface Props {
  onComplete: (score: number) => void;
}

type Phase = "memorize" | "waiting" | "recall" | "done";

export default function MemoryTest({ onComplete }: Props) {
  const [words] = useState<string[]>(getRandomWords(3));
  const [phase, setPhase] = useState<Phase>("memorize");
  const [input, setInput] = useState("");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (phase !== "memorize") return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          setPhase("waiting");
          sleep(1500).then(() => setPhase("recall"));
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  function handleSubmit() {
    const recalled = input
      .toLowerCase()
      .split(/[\s,]+/)
      .map((w) => w.trim())
      .filter(Boolean);
    const correct = words.filter((w) => recalled.includes(w)).length;
    const score = Math.round((correct / words.length) * 100);
    setPhase("done");
    onComplete(score);
  }

  return (
    <div className="fade-in flex flex-col items-center gap-6 text-center">
      <h2 className="text-2xl font-bold">🧩 Memory Test</h2>

      {phase === "memorize" && (
        <>
          <p className="text-gray-400">Memorize these words. You have <span className="text-[#09ffd3] font-bold">{countdown}s</span></p>
          <div className="flex gap-4">
            {words.map((w) => (
              <span key={w} className="px-5 py-3 rounded-xl bg-[#09ffd3]/10 border border-[#09ffd3]/30 text-[#09ffd3] text-xl font-semibold capitalize">
                {w}
              </span>
            ))}
          </div>
        </>
      )}

      {phase === "waiting" && (
        <p className="text-gray-400 text-lg animate-pulse">Get ready…</p>
      )}

      {phase === "recall" && (
        <>
          <p className="text-gray-400">Type the words you remember (space or comma separated)</p>
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="e.g. apple river candle"
            className="w-full max-w-sm px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#09ffd3] transition"
          />
          <button
            onClick={handleSubmit}
            className="px-8 py-3 rounded-xl bg-[#09ffd3] text-[#02182b] font-bold hover:brightness-110 transition"
          >
            Submit
          </button>
        </>
      )}

      {phase === "done" && (
        <p className="text-[#09ffd3]">Memory test complete ✓</p>
      )}
    </div>
  );
}
