"use client";
import { useState, useEffect, useRef } from "react";
import { sleep } from "@/utils/helpers";

interface Props {
  onComplete: (score: number) => void;
}

const COLORS = ["#09ffd3", "#6366f1", "#f59e0b", "#ef4444"];
const GRID = [0, 1, 2, 3];

export default function PatternTest({ onComplete }: Props) {
  const [phase, setPhase] = useState<"intro" | "showing" | "input" | "done">("intro");
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSeq, setUserSeq] = useState<number[]>([]);
  const [lit, setLit] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [failed, setFailed] = useState(false);
  const maxRounds = 5;
  const doneRef = useRef(false);

  async function startRound(seq: number[]) {
    setPhase("showing");
    setUserSeq([]);
    await sleep(600);
    for (const idx of seq) {
      setLit(idx);
      await sleep(600);
      setLit(null);
      await sleep(300);
    }
    setPhase("input");
  }

  function startGame() {
    const first = [Math.floor(Math.random() * 4)];
    setSequence(first);
    setRound(1);
    startRound(first);
  }

  function handleTile(idx: number) {
    if (phase !== "input") return;
    const next = [...userSeq, idx];
    setUserSeq(next);
    setLit(idx);
    setTimeout(() => setLit(null), 200);

    const pos = next.length - 1;
    if (next[pos] !== sequence[pos]) {
      // Wrong
      setFailed(true);
      setPhase("done");
      const score = Math.round(((round - 1) / maxRounds) * 100);
      if (!doneRef.current) { doneRef.current = true; onComplete(score); }
      return;
    }

    if (next.length === sequence.length) {
      if (round >= maxRounds) {
        setPhase("done");
        if (!doneRef.current) { doneRef.current = true; onComplete(100); }
        return;
      }
      // Next round
      const nextSeq = [...sequence, Math.floor(Math.random() * 4)];
      setSequence(nextSeq);
      setRound((r) => r + 1);
      setTimeout(() => startRound(nextSeq), 800);
    }
  }

  return (
    <div className="fade-in flex flex-col items-center gap-6 text-center">
      <h2 className="text-2xl font-bold">🔷 Pattern Test</h2>

      {phase === "intro" && (
        <>
          <p className="text-gray-400 max-w-xs">Watch the sequence of tiles light up, then repeat it in the same order.</p>
          <button
            onClick={startGame}
            className="px-8 py-3 rounded-xl bg-[#09ffd3] text-[#02182b] font-bold hover:brightness-110 transition"
          >
            Start
          </button>
        </>
      )}

      {(phase === "showing" || phase === "input") && (
        <>
          <p className="text-gray-400 text-sm">
            {phase === "showing" ? "Watch carefully…" : `Repeat the sequence (${userSeq.length}/${sequence.length})`}
          </p>
          <p className="text-xs text-gray-600">Round {round} of {maxRounds}</p>
          <div className="grid grid-cols-2 gap-3">
            {GRID.map((idx) => (
              <button
                key={idx}
                onClick={() => handleTile(idx)}
                disabled={phase === "showing"}
                className="w-24 h-24 rounded-2xl transition-all duration-150 border-2"
                style={{
                  backgroundColor: lit === idx ? COLORS[idx] : `${COLORS[idx]}22`,
                  borderColor: lit === idx ? COLORS[idx] : `${COLORS[idx]}44`,
                  boxShadow: lit === idx ? `0 0 24px ${COLORS[idx]}88` : "none",
                }}
              />
            ))}
          </div>
        </>
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center gap-2">
          {failed
            ? <p className="text-yellow-400">Wrong tile! Pattern test complete.</p>
            : <p className="text-[#09ffd3]">Perfect! All rounds complete ✓</p>}
        </div>
      )}
    </div>
  );
}
