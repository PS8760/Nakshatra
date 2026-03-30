"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "@/utils/api";
import { motion } from "framer-motion";
import AuthGuard from "@/components/AuthGuard";

const CITIES = ["All", "Mumbai", "Pune", "Bangalore", "Delhi"];

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  hospital: string;
  city: string;
  rating: number;
  experience: number;
  phone: string;
  available: boolean;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map((s) => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "text-amber-400" : "text-gray-700"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-400 ml-1">{rating}</span>
    </div>
  );
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filtered, setFiltered] = useState<Doctor[]>([]);
  const [city, setCity] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/doctors")
      .then((d) => { setDoctors(d.doctors); setFiltered(d.doctors); })
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let list = doctors;
    if (city !== "All") list = list.filter((d) => d.city === city);
    if (search) list = list.filter((d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase()) ||
      d.hospital.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(list);
  }, [city, search, doctors]);

  return (
    <AuthGuard>
    <div className="max-w-6xl mx-auto px-6 py-12 fade-in">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1.5 rounded-full border border-[#09ffd3]/30 text-[#09ffd3] text-xs font-semibold mb-4 bg-[#09ffd3]/5 tracking-widest uppercase">
          Medical Directory
        </span>
        <h1 className="text-4xl font-extrabold mb-3">Find Cognitive Specialists</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Connect with neurologists, cognitive specialists, and dementia experts near you.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text" value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, specialty, or hospital…"
          className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#09ffd3]/50 transition text-sm"
        />
        <div className="flex gap-2 flex-wrap">
          {CITIES.map((c) => (
            <button key={c} onClick={() => setCity(c)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                city === c ? "bg-[#09ffd3] text-[#02182b]" : "bg-white/5 border border-white/10 text-gray-400 hover:border-[#09ffd3]/30 hover:text-white"
              }`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-6">{filtered.length} specialist{filtered.length !== 1 ? "s" : ""} found</p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(9,255,211,0.08)" }}
              className="gradient-border p-5 flex flex-col gap-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#09ffd3]/10 border border-[#09ffd3]/20 flex items-center justify-center text-xl">
                    {doc.specialty.includes("Neuro") ? "🧠" : doc.specialty.includes("Geriatric") ? "👴" : doc.specialty.includes("Memory") ? "💭" : "🩺"}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight">{doc.name}</h3>
                    <p className="text-xs text-[#09ffd3]">{doc.specialty}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  doc.available ? "bg-[#09ffd3]/10 text-[#09ffd3] border border-[#09ffd3]/20" : "bg-gray-500/10 text-gray-500 border border-gray-500/20"
                }`}>
                  {doc.available ? "Available" : "Busy"}
                </span>
              </div>

              {/* Details */}
              <div className="flex flex-col gap-1.5 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <span>🏥</span> {doc.hospital}
                </div>
                <div className="flex items-center gap-2">
                  <span>📍</span> {doc.city}
                </div>
                <div className="flex items-center gap-2">
                  <span>⏱️</span> {doc.experience} years experience
                </div>
              </div>

              <StarRating rating={doc.rating} />

              {/* Actions */}
              <div className="flex gap-2 mt-1">
                <a href={`tel:${doc.phone}`}
                  className="flex-1 py-2 rounded-lg bg-[#09ffd3]/10 border border-[#09ffd3]/20 text-[#09ffd3] text-xs font-semibold text-center hover:bg-[#09ffd3]/20 transition">
                  📞 Call
                </a>
                <button
                  className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold hover:border-[#09ffd3]/30 hover:text-white transition"
                  onClick={() => alert(`Appointment booking for ${doc.name} — coming soon!`)}
                >
                  📅 Book
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-4">🔍</p>
          <p>No doctors found for your search. Try a different city or keyword.</p>
        </div>
      )}
    </div>
    </AuthGuard>
  );
}
