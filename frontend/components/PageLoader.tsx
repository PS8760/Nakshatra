"use client";
import { useEffect, useState } from "react";

const NODES = [
  { cx: 50, cy: 22, r: 4 },
  { cx: 78, cy: 38, r: 3.5 },
  { cx: 78, cy: 62, r: 3.5 },
  { cx: 50, cy: 78, r: 4 },
  { cx: 22, cy: 62, r: 3.5 },
  { cx: 22, cy: 38, r: 3.5 },
  { cx: 50, cy: 50, r: 5 },
];

const EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
  [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
];

export default function PageLoader() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Cycle active node
    const nodeTimer = setInterval(() => {
      setActive((p) => (p + 1) % NODES.length);
    }, 220);

    // Progress bar
    const progTimer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(progTimer); return 100; }
        return p + 2;
      });
    }, 40);

    // Fade out after ~2.2s
    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 2200);

    return () => {
      clearInterval(nodeTimer);
      clearInterval(progTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8"
      style={{
        background: "radial-gradient(ellipse at center, #031e35 0%, #02182b 70%)",
        transition: "opacity 0.4s ease",
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Neural network SVG */}
      <div className="relative">
        <svg width="120" height="120" viewBox="0 0 100 100">
          {/* Edges */}
          {EDGES.map(([a, b], i) => {
            const na = NODES[a], nb = NODES[b];
            const isActive = active === a || active === b;
            return (
              <line
                key={i}
                x1={na.cx} y1={na.cy} x2={nb.cx} y2={nb.cy}
                stroke={isActive ? "#09ffd3" : "rgba(9,255,211,0.12)"}
                strokeWidth={isActive ? 1.2 : 0.6}
                style={{ transition: "stroke 0.2s, stroke-width 0.2s" }}
              />
            );
          })}

          {/* Nodes */}
          {NODES.map((n, i) => {
            const isActive = active === i;
            return (
              <g key={i}>
                {isActive && (
                  <circle
                    cx={n.cx} cy={n.cy} r={n.r + 5}
                    fill="none"
                    stroke="#09ffd3"
                    strokeWidth="0.8"
                    opacity="0.3"
                    style={{ animation: "ping 0.8s ease-out forwards" }}
                  />
                )}
                <circle
                  cx={n.cx} cy={n.cy} r={n.r}
                  fill={isActive ? "#09ffd3" : "#031e35"}
                  stroke={isActive ? "#09ffd3" : "rgba(9,255,211,0.35)"}
                  strokeWidth="1"
                  style={{ transition: "fill 0.2s, r 0.2s" }}
                />
              </g>
            );
          })}

          {/* Pulse ring on center node */}
          <circle
            cx="50" cy="50" r="12"
            fill="none"
            stroke="rgba(9,255,211,0.08)"
            strokeWidth="1"
            style={{ animation: "spin 4s linear infinite" }}
          />
        </svg>

        {/* Outer glow */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(9,255,211,0.08) 0%, transparent 70%)",
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
      </div>

      {/* Brand */}
      <div className="flex flex-col items-center gap-1">
        <p
          className="text-[#09ffd3] font-bold tracking-[0.3em] text-sm uppercase"
          style={{ textShadow: "0 0 20px rgba(9,255,211,0.5)" }}
        >
          CogniscanAI
        </p>
        <p className="text-gray-600 text-xs tracking-widest">Initializing neural scan…</p>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-[2px] rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #09ffd3, #6366f1)",
            transition: "width 0.04s linear",
            boxShadow: "0 0 8px rgba(9,255,211,0.6)",
          }}
        />
      </div>

      <style>{`
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); transform-origin: 50px 50px; }
          to { transform: rotate(360deg); transform-origin: 50px 50px; }
        }
      `}</style>
    </div>
  );
}
