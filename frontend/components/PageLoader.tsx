"use client";
export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-[100] bg-[#02182b] flex flex-col items-center justify-center gap-6">
      {/* Brain scan animation */}
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-2 border-[#09ffd3]/20 animate-ping" />
        <div className="absolute inset-2 rounded-full border-2 border-[#09ffd3]/30 animate-ping" style={{ animationDelay: "0.3s" }} />
        <div className="absolute inset-4 rounded-full border-2 border-[#09ffd3]/40 animate-ping" style={{ animationDelay: "0.6s" }} />
        <div className="absolute inset-0 flex items-center justify-center text-4xl">🧠</div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="text-[#09ffd3] font-semibold tracking-widest text-sm uppercase">CogniscanAI</p>
        <div className="flex gap-1">
          {[0,1,2].map((i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#09ffd3]"
              style={{ animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)} }`}</style>
    </div>
  );
}
