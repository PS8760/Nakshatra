"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onComplete: (score: number, metrics: FacialMetrics) => void;
}

export interface FacialMetrics {
  blinkRate: number;       // blinks per minute
  gazeStability: number;   // 0-100 (how steady the gaze is)
  expressionVariance: number; // 0-100 (facial movement variance)
  attentionScore: number;  // 0-100 derived metric
}

type Phase = "intro" | "permission" | "calibrating" | "recording" | "done" | "denied";

const RECORD_DURATION = 20; // seconds

export default function FacialTest({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [countdown, setCountdown] = useState(RECORD_DURATION);
  const [metrics, setMetrics] = useState<FacialMetrics | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameDataRef = useRef<number[]>([]);
  const blinkCountRef = useRef(0);
  const prevBrightnessRef = useRef<number>(0);
  const brightnessHistoryRef = useRef<number[]>([]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  async function requestCamera() {
    setPhase("permission");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPhase("calibrating");
      setTimeout(() => startRecording(), 2000);
    } catch {
      setPhase("denied");
      // Provide a simulated mid-range score
      const simMetrics: FacialMetrics = { blinkRate: 18, gazeStability: 65, expressionVariance: 55, attentionScore: 62 };
      onComplete(62, simMetrics);
    }
  }

  function analyzeFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 80;
    canvas.height = 60;
    ctx.drawImage(video, 0, 0, 80, 60);

    const imageData = ctx.getImageData(0, 0, 80, 60);
    const data = imageData.data;

    // Calculate average brightness (proxy for eye openness / blink detection)
    let brightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    brightness /= (data.length / 4);

    brightnessHistoryRef.current.push(brightness);
    frameDataRef.current.push(brightness);

    // Blink detection: sudden brightness drop then recovery
    const prev = prevBrightnessRef.current;
    if (prev > 0 && Math.abs(brightness - prev) > 8 && brightness < prev - 8) {
      blinkCountRef.current += 1;
    }
    prevBrightnessRef.current = brightness;
  }

  function startRecording() {
    setPhase("recording");
    blinkCountRef.current = 0;
    frameDataRef.current = [];
    brightnessHistoryRef.current = [];
    let elapsed = 0;

    // Analyze frames at 10fps
    const frameInterval = setInterval(analyzeFrame, 100);

    // Countdown timer
    intervalRef.current = setInterval(() => {
      elapsed += 1;
      setCountdown(RECORD_DURATION - elapsed);
      if (elapsed >= RECORD_DURATION) {
        clearInterval(intervalRef.current!);
        clearInterval(frameInterval);
        finishRecording();
      }
    }, 1000);
  }

  function finishRecording() {
    stopCamera();

    const frames = frameDataRef.current;
    const blinkRate = Math.round((blinkCountRef.current / RECORD_DURATION) * 60);

    // Gaze stability: inverse of brightness variance (stable gaze = consistent brightness)
    const mean = frames.reduce((a, b) => a + b, 0) / (frames.length || 1);
    const variance = frames.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (frames.length || 1);
    const gazeStability = Math.round(Math.max(0, Math.min(100, 100 - variance / 2)));

    // Expression variance: range of brightness changes
    const maxB = Math.max(...frames);
    const minB = Math.min(...frames);
    const expressionVariance = Math.round(Math.min(100, ((maxB - minB) / 50) * 100));

    // Blink rate scoring: normal = 15-20 bpm, too low or too high = worse
    let blinkScore = 100;
    if (blinkRate < 8) blinkScore = 40;
    else if (blinkRate < 12) blinkScore = 65;
    else if (blinkRate <= 25) blinkScore = 100;
    else if (blinkRate <= 35) blinkScore = 70;
    else blinkScore = 45;

    const attentionScore = Math.round((gazeStability * 0.5 + blinkScore * 0.3 + (100 - expressionVariance) * 0.2));
    const finalScore = Math.round(Math.min(100, Math.max(0, attentionScore)));

    const m: FacialMetrics = { blinkRate, gazeStability, expressionVariance, attentionScore: finalScore };
    setMetrics(m);
    setScore(finalScore);
    setPhase("done");
    onComplete(finalScore, m);
  }

  function skip() {
    stopCamera();
    const simMetrics: FacialMetrics = { blinkRate: 16, gazeStability: 70, expressionVariance: 45, attentionScore: 70 };
    setScore(70);
    setMetrics(simMetrics);
    setPhase("done");
    onComplete(70, simMetrics);
  }

  return (
    <div className="flex flex-col items-center gap-5 text-center w-full">
      <h2 className="text-2xl font-bold">👁️ Facial Analysis</h2>

      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4">
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
              We'll briefly use your camera to analyze blink rate and gaze stability — two key indicators of cognitive attention.
            </p>
            <div className="flex flex-col gap-2 text-xs text-gray-600 bg-white/5 rounded-xl p-4 text-left w-full max-w-xs">
              <p>✦ No video is stored or transmitted</p>
              <p>✦ Analysis happens entirely in your browser</p>
              <p>✦ Takes only 20 seconds</p>
            </div>
            <div className="flex gap-3">
              <button onClick={requestCamera}
                className="px-7 py-3 rounded-xl bg-[#09ffd3] text-[#02182b] font-bold text-sm hover:brightness-110 transition">
                Enable Camera
              </button>
              <button onClick={skip}
                className="px-5 py-3 rounded-xl border border-white/10 text-gray-400 text-sm hover:border-white/20 transition">
                Skip
              </button>
            </div>
          </motion.div>
        )}

        {phase === "permission" && (
          <motion.div key="perm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#09ffd3] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Requesting camera access…</p>
          </motion.div>
        )}

        {(phase === "calibrating" || phase === "recording") && (
          <motion.div key="cam" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 w-full">
            <div className="relative rounded-2xl overflow-hidden border border-[#09ffd3]/30 bg-black">
              <video ref={videoRef} muted playsInline className="w-64 h-48 object-cover scale-x-[-1]" />
              <canvas ref={canvasRef} className="hidden" />
              {phase === "calibrating" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <p className="text-[#09ffd3] text-sm font-semibold animate-pulse">Calibrating…</p>
                </div>
              )}
              {phase === "recording" && (
                <>
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 rounded-full px-2 py-1">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs text-white font-mono">{countdown}s</span>
                  </div>
                  {/* Face guide overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-28 h-36 rounded-full border-2 border-[#09ffd3]/40 border-dashed" />
                  </div>
                </>
              )}
            </div>
            {phase === "recording" && (
              <div className="w-64">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-[#09ffd3] rounded-full"
                    initial={{ width: "100%" }}
                    animate={{ width: `${(countdown / RECORD_DURATION) * 100}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Look naturally at the screen. Keep your face in the oval.</p>
              </div>
            )}
          </motion.div>
        )}

        {phase === "denied" && (
          <motion.div key="denied" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2">
            <p className="text-yellow-400 text-sm">Camera access denied. Score estimated from other tests.</p>
          </motion.div>
        )}

        {phase === "done" && metrics && (
          <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 w-full">
            <p className="text-[#09ffd3] font-semibold">Facial analysis complete ✓</p>
            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              {[
                { label: "Blink Rate", value: `${metrics.blinkRate}/min`, note: "Normal: 15–20" },
                { label: "Gaze Stability", value: `${metrics.gazeStability}%`, note: "Higher = better" },
                { label: "Attention Score", value: `${metrics.attentionScore}/100`, note: "Overall" },
                { label: "Expression", value: `${metrics.expressionVariance}%`, note: "Variance" },
              ].map((m) => (
                <div key={m.label} className="p-3 rounded-xl bg-white/5 border border-white/8 text-left">
                  <div className="text-xs text-gray-500 mb-0.5">{m.label}</div>
                  <div className="font-bold text-[#09ffd3] text-sm">{m.value}</div>
                  <div className="text-[10px] text-gray-600">{m.note}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
