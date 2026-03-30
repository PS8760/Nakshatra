"use client";
import { useState } from "react";

interface Props {
  onComplete: (score: number, transcript: string) => void;
}

const TARGET = "The early bird catches the worm before the sun rises high";

export default function SpeechTest({ onComplete }: Props) {
  const [phase, setPhase] = useState<"idle" | "listening" | "done" | "unsupported">("idle");
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState<number | null>(null);

  function analyzeSpeech(text: string): number {
    if (!text.trim()) return 0;
    const targetWords = TARGET.toLowerCase().split(" ");
    const spokenWords = text.toLowerCase().split(/\s+/);
    const matched = targetWords.filter((w) => spokenWords.includes(w)).length;
    const lengthScore = Math.min(spokenWords.length / targetWords.length, 1) * 50;
    const matchScore = (matched / targetWords.length) * 50;
    return Math.round(lengthScore + matchScore);
  }

  function startListening() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setPhase("unsupported");
      // Simulate a mid-range score if speech not supported
      onComplete(60, "[Speech API not supported]");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setPhase("listening");

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      const s = analyzeSpeech(text);
      setScore(s);
      setPhase("done");
      onComplete(s, text);
    };

    recognition.onerror = () => {
      setPhase("done");
      setTranscript("[Could not capture speech]");
      onComplete(40, "[error]");
    };

    recognition.onend = () => {
      if (phase === "listening") {
        setPhase("done");
        onComplete(40, transcript || "[no input]");
      }
    };

    recognition.start();
  }

  function skipSpeech() {
    setPhase("done");
    onComplete(50, "[skipped]");
  }

  return (
    <div className="fade-in flex flex-col items-center gap-6 text-center">
      <h2 className="text-2xl font-bold">🎙️ Speech Test</h2>
      <p className="text-gray-400">Read the sentence below aloud when ready</p>

      <div className="px-6 py-4 rounded-xl bg-[#09ffd3]/5 border border-[#09ffd3]/20 max-w-md">
        <p className="text-[#09ffd3] text-lg font-medium italic">"{TARGET}"</p>
      </div>

      {phase === "idle" && (
        <div className="flex gap-3">
          <button
            onClick={startListening}
            className="px-8 py-3 rounded-xl bg-[#09ffd3] text-[#02182b] font-bold hover:brightness-110 transition"
          >
            🎤 Start Recording
          </button>
          <button
            onClick={skipSpeech}
            className="px-6 py-3 rounded-xl border border-white/10 text-gray-400 hover:border-white/30 transition text-sm"
          >
            Skip
          </button>
        </div>
      )}

      {phase === "listening" && (
        <div className="flex flex-col items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500 animate-ping" />
          <p className="text-gray-400 text-sm">Listening… speak now</p>
        </div>
      )}

      {phase === "unsupported" && (
        <p className="text-yellow-400 text-sm">Speech API not supported in this browser. Score estimated.</p>
      )}

      {phase === "done" && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-[#09ffd3]">Speech test complete ✓</p>
          {transcript && (
            <p className="text-gray-400 text-sm max-w-sm">
              Heard: <span className="text-white italic">"{transcript}"</span>
            </p>
          )}
          {score !== null && (
            <p className="text-gray-500 text-xs">Speech score: {score}/100</p>
          )}
        </div>
      )}
    </div>
  );
}
