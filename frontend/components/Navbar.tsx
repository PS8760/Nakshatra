"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/doctors", label: "Find Doctors" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Shrink navbar on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleLogout() {
    logout();
    setDropOpen(false);
    router.push("/");
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#02182b]/98 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.06)]"
          : "bg-[#02182b]/80 backdrop-blur-md"
      }`}
    >
      {/* Accent line */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-[#09ffd3]/40 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-extrabold text-lg tracking-tight group">
          <div className="w-8 h-8 rounded-lg bg-[#09ffd3]/10 border border-[#09ffd3]/25 flex items-center justify-center transition-all duration-200 group-hover:bg-[#09ffd3]/20 group-hover:scale-105">
            <span className="text-sm">🧠</span>
          </div>
          <span className="text-white">Cogni<span className="text-[#09ffd3]">scan</span>AI</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === l.href
                  ? "text-[#09ffd3]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {l.label}
              {/* Active underline */}
              {pathname === l.href && (
                <span className="absolute bottom-0.5 left-3.5 right-3.5 h-[2px] rounded-full bg-[#09ffd3]" />
              )}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#09ffd3]/30 transition-all duration-200 text-sm"
              >
                <div className="w-6 h-6 rounded-full bg-[#09ffd3]/20 border border-[#09ffd3]/40 flex items-center justify-center text-[#09ffd3] font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-300 max-w-[90px] truncate text-xs">{user.name}</span>
                <svg
                  className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              <div className={`absolute right-0 top-full mt-2 w-44 bg-[#031e35] border border-white/10 rounded-xl shadow-2xl overflow-hidden transition-all duration-200 origin-top-right ${
                dropOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
              }`}>
                <Link href="/profile" onClick={() => setDropOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                  <span className="text-base">👤</span> My Profile
                </Link>
                <Link href="/dashboard" onClick={() => setDropOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                  <span className="text-base">📊</span> Dashboard
                </Link>
                <Link href="/caregiver" onClick={() => setDropOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                  <span className="text-base">🔔</span> Caregiver
                </Link>
                <div className="h-px bg-white/5 mx-3" />
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                  <span className="text-base">🚪</span> Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <button className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors duration-200 font-medium">
                  Sign In
                </button>
              </Link>
              <Link href="/register">
                <button className="px-4 py-2 rounded-lg text-sm bg-white/8 border border-white/12 text-white hover:bg-white/12 transition-all duration-200 font-medium">
                  Register
                </button>
              </Link>
            </div>
          )}

          <Link href="/test">
            <button className="ml-1 px-5 py-2 rounded-xl bg-[#09ffd3] text-[#02182b] font-bold text-sm hover:brightness-110 active:scale-95 transition-all duration-200 shadow-[0_0_16px_rgba(9,255,211,0.2)]">
              Start Test
            </button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="border-t border-white/5 bg-[#02182b] px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === l.href ? "text-[#09ffd3] bg-[#09ffd3]/8" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}>
              {l.label}
            </Link>
          ))}
          <div className="h-px bg-white/5 my-1" />
          {user ? (
            <>
              <Link href="/profile" onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/5">
                👤 {user.name}
              </Link>
              <button onClick={() => { handleLogout(); setOpen(false); }}
                className="px-4 py-2.5 rounded-lg text-sm text-red-400 text-left hover:bg-red-500/10 transition-colors">
                🚪 Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-2 px-1">
              <Link href="/login" onClick={() => setOpen(false)} className="flex-1">
                <button className="w-full py-2.5 rounded-lg text-sm text-gray-300 border border-white/10 hover:border-white/20 transition-colors">Sign In</button>
              </Link>
              <Link href="/register" onClick={() => setOpen(false)} className="flex-1">
                <button className="w-full py-2.5 rounded-lg text-sm bg-white/8 text-white border border-white/12">Register</button>
              </Link>
            </div>
          )}
          <Link href="/test" onClick={() => setOpen(false)} className="mt-1">
            <button className="w-full py-2.5 rounded-xl bg-[#09ffd3] text-[#02182b] font-bold text-sm">Start Test</button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
