"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onComplete: (score: number, transcript: string, metrics?: SpeechMetrics) => void;
}

export interface SpeechMetrics {
  wordCount: number;
  matchRate: number;       // % of target words spoken
  fillerWords: number;     // uh, um, er, like, you know
  speechRate: number;      // words per second
  hesitations: number;     // pauses detected
  fluencyScore: number;    // 0-100
}

const TARGET = "The early bird catches the worm before the sun rises high";
const FILLER_WORDS = ["uh", "um", "er", "like", "you know", "hmm", "ah", "uhh", "umm"];

function analyzeSpeech(text: string, durationMs: number): { score: number; metrics: SpeechMetrics } {
  if (!text.trim()) {
    return { score: 0, metrics: { wordCount: 0, matchRate: 0, fillerWords: 0, speechRate: 0, hesitations: 0, fluencyScore: 0 } };
  }

  const targetWords = TARGET.toLowerCase().split(" ");
  const spokenWords = text.toLowerCase().split(/\s+/).filter(Boolean);
  const matched = targetWords.filter((w) => spokenWords.includes(w)).length;
  const matchRate = Math.round((matched / targetWords.length) * 100);

  // Filler word count
  const fillerCount = spokenWords.filter((w) => FILLER_WORDS.includes(w)).length;

  // Speech rate (words per second)
  const durationSec = durationMs / 1000;
  const speechRate = durationSec > 0 ? Math.round((spokenWords.length / durationSec) * 10) / 10 : 0;

  // Hesitation proxy: repeated words or very short words
  const hesitations = spokenWords.filter((w, i) => i > 0 && w === spokenWords[i - 1]).length;

  // Length score
  const lengthScore = Math.min(spokenWords.length / targetWords.length, 1) * 40;
  // Match score
  const matchScore = (matched / targetWords.length) * 40;
  // Fluency penalty
  const fluencyPenalty = Math.min(20, (fillerCount * 4) + (hesitations * 3));
  // Rate bonus (ideal: 2-3 words/sec)
  const rateBonus = speechRate >= 1.5 && speechRate <= 4 ? 20 : speechRate > 0 ? 10 : 0;

  const fluencyScore = Math.round(Math.max(0, Math.min(100, lengthScore + matchScore + rateBonus - fluencyPenalty)));

  return {
    score: fluencyScore,
    metrics: { wordCount: spokenWords.length, matchRate, fillerWords: fillerCount, speechRate, hesitations, fluencyScore },
  };
}

export default function SpeechTest({ onComplete }: Props) {
  const [phase, setPhase] = useState<"idle" | "listening" | "done" | "unsupported">("idle");
  const [transcript, setTranscript] = useState("");
  const [metrics, setMetrics] = useState<SpeechMetrics | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [volume, setVolume] = useState(0);
  const startTimeRef = useRef<number>(0);
  const recognitionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);

  function startVolumeMonitor(stream: MediaStream) {
    try {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setVolume(Math.min(100, avg * 2));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch { /* ignore */ }
  }

  function stopVolumeMonitor() {
    cancelAnimationFrame(animFrameRef.current);
    audioCtxRef.current?.close();
    setVolume(0);
  }

  function startListening() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setPhase("unsupported");
      onComplete(60, "[Speech API not supported]");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    startTimeRef.current = Date.now();
    setPhase("listening");

    // Start mic volume monitor
    navigator.mediaDevices.getUserMedia({ audio: true }).then(startVolumeMonitor).catch(() => {});

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        interim += event.results[i][0].transcript;
      }
      setTranscript(interim);
    };

    recognition.onend = () => {
      stopVolumeMonitor();
      const duration = Date.now() - startTimeRef.current;
      const finalText = transcript || "[no input]";
      const { score: s, metrics: m } = analyzeSpeech(finalText, duration);
      setScore(s);
      setMetrics(m);
      setPhase("done");
      onComplete(s, finalText, m);
    };

    recognition.onerror = () => {
      stopVolumeMonitor();
      setPhase("done");
      onComplete(40, "[error]");
    };

    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
  }

  function skip() {
    setPhase("done");
    onComplete(50, "[skipped]");
  }

  const bars = Array.from({ length: 20 }, (_, i) => i);

  return (
    <div className="flex flex-col items-center gap-5 text-center w-full">
      <h2 className="text-2xl font-bold">🎙️ Speech Analysis</h2>

      <AnimatePresence mode="wait">
        {phase === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 w-full">
            <p className="text-gray-400 text-sm">Read the sentence below clearly and naturally</p>
            <div className="px-5 py-4 rounded-xl bg-[#09ffd3]/5 border border-[#09ffd3]/20 max-w-sm">
              <p className="text-[#09ffd3] text-base font-medium italic leading-relaxed">"{TARGET}"</p>
            </div>
            <div className="flex gap-3">
              <button onClick={startListening}
                className="px-8 py-3 rounded-xl bg-[#09ffd3] text-[#02182b] font-bold text-sm hover:brightness-110 transition">
                🎤 Start Recording
              </button>
              <button onClick={skip}
                className="px-5 py-3 rounded-xl border border-white/10 text-gray-400 text-sm hover:border-white/20 transition">
                Skip
              </button>
            </div>
          </motion.div>
        )}

        {phase === "listening" && (
          <motion.div key="listening" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 w-full">
            <div className="px-5 py-3 rounded-xl bg-[#09ffd3]/5 border border-[#09ffd3]/20 max-w-sm">
              <p className="text-[#09ffd3] text-sm italic">"{TARGET}"</p>
            </div>

            {/* Live waveform */}
            <div className="flex items-end gap-0.5 h-12">
              {bars.map((i) => (
                <motion.div key={i} className="w-1.5 rounded-full bg-[#09ffd3]"
                  animate={{ height: `${Math.max(4, (volume / 100) * 48 * (0.4 + Math.random() * 0.6))}px` }}
                  transition={{ duration: 0.1 }}
                />
              ))}
            </div>

            {/* Live transcript */}
            {transcript && (
              <p className="text-gray-300 text-sm max-w-xs italic">"{transcript}"</p>
            )}

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-gray-400 text-xs">Listening… speak now</span>
            </div>

            <button onClick={stopListening}
              className="px-6 py-2 rounded-xl border border-white/10 text-gray-400 text-sm hover:border-white/20 transition">
              Done Speaking
            </button>
          </motion.div>
        )}

        {phase === "unsupported" && (
          <motion.div key="unsupported" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-yellow-400 text-sm">Speech API not supported. Score estimated.</p>
          </motion.div>
        )}

        {phase === "done" && (
          <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 w-full">
            <p className="text-[#09ffd3] font-semibold">Speech analysis complete ✓</p>
            {transcript && transcript !== "[skipped]" && (
              <p className="text-gray-400 text-xs max-w-xs italic">Heard: "{transcript}"</p>
            )}
            {metrics && (
              <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
                {[
                  { label: "Words", value: metrics.wordCount },
                  { label: "Match", value: `${metrics.matchRate}%` },
                  { label: "Rate", value: `${metrics.speechRate}/s` },
                  { label: "Fillers", value: metrics.fillerWords },
                  { label: "Fluency", value: `${metrics.fluencyScore}` },
                  { label: "Score", value: score ?? "—" },
                ].map((m) => (
                  <div key={m.label} className="p-2 rounded-lg bg-white/5 border border-white/8 text-center">
                    <div className="text-[10px] text-gray-500">{m.label}</div>
                    <div className="text-sm font-bold text-[#09ffd3]">{m.value}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
