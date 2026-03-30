"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/utils/motion";

const TEAM = [
  { name: "Pranav Ghodke", role: "Lead Developer & AI Engineer", emoji: "👨‍💻", color: "#09ffd3" },
  { name: "Jui Katkade", role: "Frontend Developer & UX Designer", emoji: "👩‍🎨", color: "#6366f1" },
  { name: "Aditya Chavan", role: "Backend Developer & ML Engineer", emoji: "👨‍🔬", color: "#f59e0b" },
  { name: "Gauri Borse", role: "Research & Medical Advisor", emoji: "👩‍⚕️", color: "#ec4899" },
];

const PROBLEM_POINTS = [
  "Over 55 million people worldwide live with dementia — a number projected to triple by 2050.",
  "Most diagnoses happen too late, when intervention is far less effective.",
  "Cognitive screening tools are expensive, clinic-bound, and inaccessible in low-resource settings.",
  "Caregivers often lack early warning signals until decline is severe.",
];

const SOLUTION_POINTS = [
  "Browser-based multimodal cognitive tests — no hardware, no clinic visit required.",
  "AI-driven risk scoring using memory, reaction, speech, and pattern recognition.",
  "Works on any device with a browser, even in low-bandwidth environments.",
  "Automated caregiver alerts for high-risk results.",
  "Longitudinal tracking to monitor cognitive trends over time.",
];

export default function AboutPage() {
  return (
    <motion.div
      className="max-w-5xl mx-auto px-6 py-16"
      variants={staggerContainer(0.1)}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <div className="text-center mb-16">
        <span className="inline-block px-4 py-1.5 rounded-full border border-[#09ffd3]/30 text-[#09ffd3] text-xs font-semibold mb-4 bg-[#09ffd3]/5 tracking-widest uppercase">
          Our Mission
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">About CogniscanAI</h1>
        <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
          We're building accessible, AI-powered cognitive screening to help detect decline early —
          before it becomes irreversible.
        </p>
      </div>

      {/* Problem */}
      <section className="mb-16">
        <div className="p-8 rounded-2xl bg-red-500/5 border border-red-500/20">
          <h2 className="text-2xl font-bold mb-6 text-red-400">The Problem</h2>
          <ul className="flex flex-col gap-4">
            {PROBLEM_POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-gray-300 text-sm leading-relaxed">
                <span className="text-red-400 mt-0.5 flex-shrink-0">✕</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Solution */}
      <section className="mb-16">
        <div className="p-8 rounded-2xl bg-[#09ffd3]/5 border border-[#09ffd3]/20">
          <h2 className="text-2xl font-bold mb-6 text-[#09ffd3]">Our Solution</h2>
          <ul className="flex flex-col gap-4">
            {SOLUTION_POINTS.map((s) => (
              <li key={s} className="flex items-start gap-3 text-gray-300 text-sm leading-relaxed">
                <span className="text-[#09ffd3] mt-0.5 flex-shrink-0">✦</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Tech stack */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8">Technology Stack</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Next.js 14", role: "Frontend", icon: "▲" },
            { name: "Tailwind CSS", role: "Styling", icon: "🎨" },
            { name: "FastAPI", role: "Backend", icon: "⚡" },
            { name: "Browser Speech API", role: "Speech Input", icon: "🎙️" },
          ].map((t) => (
            <div key={t.name} className="p-4 rounded-xl bg-white/[0.03] border border-white/8 text-center">
              <div className="text-2xl mb-2">{t.icon}</div>
              <div className="font-semibold text-sm">{t.name}</div>
              <div className="text-xs text-gray-500 mt-1">{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8">The Team</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {TEAM.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, boxShadow: `0 16px 40px ${m.color}18` }}
              className="flex flex-col items-center text-center p-5 rounded-2xl bg-white/[0.03] border border-white/8 card-hover"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-3"
                style={{ backgroundColor: `${m.color}15`, border: `1px solid ${m.color}30` }}>
                {m.emoji}
              </div>
              <div className="font-bold text-sm" style={{ color: m.color }}>{m.name}</div>
              <div className="text-xs text-gray-500 mt-1">{m.role}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="text-center p-10 rounded-2xl bg-white/[0.02] border border-white/8">
        <h3 className="text-2xl font-bold mb-3">Ready to try it?</h3>
        <p className="text-gray-500 mb-6 text-sm">Free, private, and takes under 3 minutes.</p>
        <Link href="/test">
          <button className="pulse-btn px-10 py-4 rounded-2xl bg-[#09ffd3] text-[#02182b] font-bold text-lg hover:brightness-110 transition-all">
            Start Test →
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
