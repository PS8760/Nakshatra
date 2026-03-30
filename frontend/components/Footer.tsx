import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#02182b] mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 font-extrabold text-lg mb-3">
            <span className="text-[#09ffd3]">🧠</span>
            Cogni<span className="text-[#09ffd3]">scan</span>AI
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            AI-powered early cognitive decline detection. Multimodal. Accessible. Actionable.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-xs text-gray-500 uppercase tracking-widest mb-4">Navigation</h4>
          <ul className="flex flex-col gap-2 text-sm text-gray-400">
            {[
              { href: "/", label: "Home" },
              { href: "/how-it-works", label: "How It Works" },
              { href: "/about", label: "About" },
              { href: "/dashboard", label: "Dashboard" },
              { href: "/caregiver", label: "Caregiver Portal" },
              { href: "/test", label: "Take the Test" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-[#09ffd3] transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Disclaimer */}
        <div>
          <h4 className="text-xs text-gray-500 uppercase tracking-widest mb-4">Disclaimer</h4>
          <p className="text-gray-500 text-sm leading-relaxed">
            CogniscanAI is a screening tool only. It does not constitute a medical diagnosis.
            Always consult a qualified healthcare professional for medical advice.
          </p>
          <p className="text-gray-600 text-xs mt-4">© 2025 CogniscanAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
