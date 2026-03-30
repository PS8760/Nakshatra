import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 text-center gap-6 fade-in">
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#09ffd3]/4 blur-3xl" />
      </div>

      <div className="text-8xl font-extrabold text-[#09ffd3]/20 select-none">404</div>

      <div className="w-16 h-16 rounded-2xl bg-[#09ffd3]/10 border border-[#09ffd3]/30 flex items-center justify-center text-3xl -mt-4">
        🧠
      </div>

      <div>
        <h1 className="text-2xl font-extrabold mb-2">Page not found</h1>
        <p className="text-gray-400 max-w-sm text-sm leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <div className="flex gap-3">
        <Link href="/">
          <button className="px-7 py-3 rounded-xl bg-[#09ffd3] text-[#02182b] font-bold text-sm hover:brightness-110 transition shadow-[0_0_20px_rgba(9,255,211,0.2)]">
            ← Go Home
          </button>
        </Link>
        <Link href="/test">
          <button className="px-7 py-3 rounded-xl border border-white/10 text-gray-300 font-semibold text-sm hover:border-[#09ffd3]/30 hover:text-white transition">
            Take a Test
          </button>
        </Link>
      </div>
    </div>
  );
}
