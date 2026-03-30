import Link from "next/link";

const TESTS = [
  {
    icon: "🧩",
    name: "Memory Test",
    weight: "50%",
    duration: "~45s",
    desc: "Three random words are shown for 5 seconds. After a brief delay, you're asked to recall them. Correct recalls are scored proportionally.",
    science: "Episodic memory recall is one of the earliest markers of Alzheimer's and MCI (Mild Cognitive Impairment).",
  },
  {
    icon: "⚡",
    name: "Reaction Test",
    weight: "30%",
    duration: "~20s",
    desc: "A circle appears after a random delay (2–5s). Click it as fast as possible. Response time is mapped to a 0–100 score.",
    science: "Slowed psychomotor speed is associated with frontal lobe dysfunction and early dementia.",
  },
  {
    icon: "🎙️",
    name: "Speech Test",
    weight: "20%",
    duration: "~30s",
    desc: "Read a sentence aloud. The Browser Speech API transcribes it and we analyze word match rate and sentence length.",
    science: "Speech fluency, word-finding difficulty, and sentence coherence are key indicators of language-related cognitive decline.",
  },
  {
    icon: "🔷",
    name: "Pattern Test",
    weight: "Bonus",
    duration: "~30s",
    desc: "A sequence of colored tiles lights up. Repeat the pattern by clicking in the same order. Longer sequences = higher score.",
    science: "Visuospatial working memory and sequential processing are affected early in cognitive decline.",
  },
];

const FORMULA = [
  { label: "Memory", weight: 0.5, color: "#09ffd3" },
  { label: "Reaction", weight: 0.3, color: "#6366f1" },
  { label: "Speech", weight: 0.2, color: "#f59e0b" },
];

const RISK_LEVELS = [
  { level: "Low Risk", range: "70–100", color: "#09ffd3", bg: "bg-[#09ffd3]/10 border-[#09ffd3]/30", desc: "Cognitive performance within normal range. Continue healthy habits." },
  { level: "Medium Risk", range: "40–69", color: "#f59e0b", bg: "bg-amber-500/10 border-amber-500/30", desc: "Mild variation detected. Monitor and consider follow-up screening." },
  { level: "High Risk", range: "0–39", color: "#ef4444", bg: "bg-red-500/10 border-red-500/30", desc: "Notable difficulty detected. Professional evaluation recommended." },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 fade-in">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full border border-[#09ffd3]/30 text-[#09ffd3] text-xs font-semibold mb-4 bg-[#09ffd3]/5 tracking-widest uppercase">
          Methodology
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">How CogniscanAI Works</h1>
        <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Our system uses four clinically-inspired cognitive tasks, each targeting a different brain domain.
          Results are combined using a weighted scoring formula to produce a Cognitive Risk Score.
        </p>
      </div>

      {/* Tests */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold mb-8">The Four Tests</h2>
        <div className="flex flex-col gap-6">
          {TESTS.map((t, i) => (
            <div key={t.name} className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0 flex flex-col items-center md:items-start gap-2 md:w-40">
                <span className="text-4xl">{t.icon}</span>
                <span className="font-bold text-lg">{t.name}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-[#09ffd3]/10 text-[#09ffd3] border border-[#09ffd3]/20">
                  Weight: {t.weight}
                </span>
                <span className="text-xs text-gray-500">{t.duration}</span>
              </div>
              <div className="flex-1">
                <p className="text-gray-300 mb-3 leading-relaxed">{t.desc}</p>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    <span className="text-[#09ffd3] font-semibold">Clinical basis: </span>
                    {t.science}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Scoring formula */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold mb-8">Scoring Formula</h2>
        <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/8">
          <div className="font-mono text-center text-lg text-[#09ffd3] mb-8 p-4 rounded-xl bg-[#09ffd3]/5 border border-[#09ffd3]/20">
            Score = (Memory × 0.5) + (Reaction × 0.3) + (Speech × 0.2)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FORMULA.map((f) => (
              <div key={f.label} className="flex flex-col items-center p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-2xl font-extrabold mb-1" style={{ color: f.color }}>
                  {(f.weight * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-400">{f.label} weight</div>
                <div className="mt-3 w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${f.weight * 100}%`, backgroundColor: f.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Risk levels */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold mb-8">Risk Levels</h2>
        <div className="flex flex-col gap-4">
          {RISK_LEVELS.map((r) => (
            <div key={r.level} className={`p-5 rounded-2xl border ${r.bg} flex items-start gap-4`}>
              <div className="text-2xl font-extrabold w-20 flex-shrink-0" style={{ color: r.color }}>
                {r.range}
              </div>
              <div>
                <div className="font-bold mb-1" style={{ color: r.color }}>{r.level}</div>
                <p className="text-gray-400 text-sm">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="text-center">
        <Link href="/test">
          <button className="pulse-btn px-10 py-4 rounded-2xl bg-[#09ffd3] text-[#02182b] font-bold text-lg hover:brightness-110 transition-all">
            Take the Test →
          </button>
        </Link>
      </div>
    </div>
  );
}
