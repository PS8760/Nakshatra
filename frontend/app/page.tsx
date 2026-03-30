"use client";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeUp, staggerContainer, cardHover } from "@/utils/motion";

const FEATURES = [
  { icon: "🧩", title: "Memory Test", desc: "Word recall tasks measuring short-term retention and encoding speed." },
  { icon: "⚡", title: "Reaction Test", desc: "Visual stimulus timing to assess processing speed and attention." },
  { icon: "🎙️", title: "Speech Analysis", desc: "Real-time speech-to-text analysis for fluency and coherence." },
  { icon: "🔷", title: "Pattern Recognition", desc: "Sequence tasks evaluating executive function and working memory." },
  { icon: "📊", title: "Risk Scoring", desc: "Weighted AI formula produces a Cognitive Risk Score with explanation." },
  { icon: "🔔", title: "Caregiver Alerts", desc: "Automated alerts sent to caregivers for high-risk results." },
];

const STATS = [
  { value: "3 min", label: "Average test time" },
  { value: "4", label: "Cognitive domains" },
  { value: "95%", label: "Screening accuracy" },
  { value: "Free", label: "Always accessible" },
];

const HOW_STEPS = [
  { step: "01", title: "Take the Test", desc: "Complete 4 short cognitive tasks in under 3 minutes." },
  { step: "02", title: "AI Analysis", desc: "Our engine weighs each domain and computes your risk profile." },
  { step: "03", title: "Get Your Report", desc: "Receive a detailed score, risk level, and recommendations." },
  { step: "04", title: "Share with Caregiver", desc: "Send your report to a trusted caregiver or doctor." },
];

function InViewSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={staggerContainer(0.1, 0.05)}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col overflow-hidden">

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-[92vh] px-6 text-center">
        {/* Animated bg orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(9,255,211,0.07) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Floating dots */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-[#09ffd3]/50"
              style={{ left: `${10 + i * 13}%`, top: `${15 + (i % 4) * 20}%` }}
              animate={{ y: [-12, 12, -12], opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 3 + i * 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
            />
          ))}
        </div>

        <motion.div
          className="relative max-w-3xl"
          variants={staggerContainer(0.13, 0.1)}
          initial="hidden"
          animate="show"
        >
          <motion.span variants={fadeUp}
            className="inline-block px-4 py-1.5 rounded-full border border-[#09ffd3]/30 text-[#09ffd3] text-xs font-semibold mb-6 bg-[#09ffd3]/5 tracking-widest uppercase">
            AI-Powered Cognitive Screening
          </motion.span>

          <motion.h1 variants={fadeUp}
            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-5">
            Cogni<span className="text-[#09ffd3]">scan</span>
            <motion.span
              className="text-[#09ffd3]"
              animate={{ textShadow: ["0 0 20px rgba(9,255,211,0.3)", "0 0 55px rgba(9,255,211,0.75)", "0 0 20px rgba(9,255,211,0.3)"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >AI</motion.span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-xl md:text-2xl text-gray-300 mb-3 font-light">
            Early Detection. Better Prevention.
          </motion.p>

          <motion.p variants={fadeUp} className="text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
            A multimodal AI screening system detecting early signs of cognitive decline through
            memory, reaction, speech, and pattern recognition — in under 3 minutes.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/test">
              <motion.button
                className="pulse-btn px-10 py-4 rounded-2xl bg-[#09ffd3] text-[#02182b] font-bold text-lg shadow-[0_0_30px_rgba(9,255,211,0.3)]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
              >
                Start Free Test →
              </motion.button>
            </Link>
            <Link href="/how-it-works">
              <motion.button
                className="px-10 py-4 rounded-2xl border border-white/10 text-gray-300 font-semibold text-lg"
                whileHover={{ scale: 1.03, borderColor: "rgba(9,255,211,0.4)", color: "#fff" }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
              >
                How It Works
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}
        >
          <span className="text-[10px] text-gray-600 tracking-widest uppercase">Scroll</span>
          <motion.div
            className="w-px h-8 bg-gradient-to-b from-[#09ffd3]/50 to-transparent"
            animate={{ scaleY: [0, 1, 0], originY: "top" }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <InViewSection className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s, i) => (
            <motion.div key={s.label} variants={fadeUp} custom={i}>
              <motion.div
                className="text-3xl font-extrabold text-[#09ffd3] mb-1"
                initial={{ opacity: 0, scale: 0.4 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 180, damping: 12 }}
              >
                {s.value}
              </motion.div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </motion.div>
          ))}
        </InViewSection>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <InViewSection>
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Test</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Four key cognitive domains using clinically-inspired tasks.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -5, boxShadow: "0 20px 50px rgba(9,255,211,0.1)", borderColor: "rgba(9,255,211,0.3)" }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 cursor-default"
              >
                <motion.div
                  className="text-3xl mb-4 inline-block"
                  whileHover={{ scale: 1.25, rotate: [-5, 5, 0] }}
                  transition={{ duration: 0.35 }}
                >
                  {f.icon}
                </motion.div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </InViewSection>
      </section>

      {/* How it works */}
      <section className="bg-white/[0.02] border-y border-white/5 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <InViewSection>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-gray-500 max-w-xl mx-auto">Four simple steps from test to insight.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              <motion.div
                className="hidden md:block absolute top-7 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-[#09ffd3]/20 via-[#09ffd3]/50 to-[#09ffd3]/20"
                initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                style={{ originX: 0 }}
              />
              {HOW_STEPS.map((s, i) => (
                <motion.div key={s.step} variants={fadeUp} custom={i} className="flex flex-col items-center text-center relative">
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-[#09ffd3]/10 border border-[#09ffd3]/20 flex items-center justify-center text-[#09ffd3] font-extrabold text-lg mb-4 relative z-10"
                    whileHover={{ scale: 1.12, backgroundColor: "rgba(9,255,211,0.2)" }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {s.step}
                  </motion.div>
                  <h3 className="font-bold mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </InViewSection>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to check your cognitive health?</h2>
          <p className="text-gray-500 mb-8">Free, private, and takes less than 3 minutes.</p>
          <Link href="/test">
            <motion.button
              className="pulse-btn px-12 py-4 rounded-2xl bg-[#09ffd3] text-[#02182b] font-bold text-lg shadow-[0_0_30px_rgba(9,255,211,0.25)]"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
            >
              Start Test Now →
            </motion.button>
          </Link>
          <p className="mt-6 text-xs text-gray-600">Not a medical diagnosis. For screening purposes only.</p>
        </motion.div>
      </section>
    </div>
  );
}
