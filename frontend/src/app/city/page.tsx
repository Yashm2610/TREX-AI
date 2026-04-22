"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface CityCard {
  city: string;
  city_key: string;
  index: number;
  veg_thali: string;
  rent_1bhk_centre: string;
  pg_double: string;
  petrol: string;
}

// Gradient palettes per city — falls back to a default
const CITY_GRADIENTS: Record<string, string> = {
  Mumbai: "from-orange-900 via-amber-800 to-yellow-700",
  Delhi: "from-red-900 via-rose-800 to-orange-700",
  Bangalore: "from-emerald-900 via-teal-800 to-cyan-700",
  Chennai: "from-blue-900 via-cyan-800 to-teal-700",
  Hyderabad: "from-violet-900 via-purple-800 to-fuchsia-700",
  Pune: "from-sky-900 via-blue-800 to-indigo-700",
  Kolkata: "from-yellow-900 via-amber-800 to-orange-700",
  Ahmedabad: "from-orange-800 via-amber-700 to-yellow-600",
  Jaipur: "from-pink-900 via-rose-800 to-red-700",
  Lucknow: "from-lime-900 via-green-800 to-emerald-700",
  Gurgaon: "from-slate-800 via-gray-700 to-zinc-600",
  Noida: "from-indigo-900 via-blue-800 to-sky-700",
  Goa: "from-teal-800 via-cyan-700 to-sky-600",
  Chandigarh: "from-purple-900 via-violet-800 to-indigo-700",
};

function getGradient(city: string) {
  return CITY_GRADIENTS[city] || "from-gray-800 via-slate-700 to-gray-600";
}

function IndexBadge({ index }: { index: number }) {
  const color =
    index >= 80 ? "bg-red-100 text-red-700" :
    index >= 50 ? "bg-amber-100 text-amber-700" :
    "bg-emerald-100 text-emerald-700";
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${color}`}>
      Index {index}
    </span>
  );
}

export default function CityPage() {
  const router = useRouter();
  const [cities, setCities] = useState<CityCard[]>([]);
  const [filtered, setFiltered] = useState<CityCard[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"index" | "city">("index");

  useEffect(() => {
    fetch(`${API}/api/cities`)
      .then((r) => r.json())
      .then((d) => {
        setCities(d.cities || []);
        setFiltered(d.cities || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...cities];
    if (search.trim()) {
      result = result.filter((c) =>
        c.city.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (sortBy === "city") result.sort((a, b) => a.city.localeCompare(b.city));
    else result.sort((a, b) => b.index - a.index);
    setFiltered(result);
  }, [search, sortBy, cities]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Nav */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <span
            className="text-xl font-bold tracking-tight cursor-pointer"
            onClick={() => router.push("/")}
          >
            trex<span className="text-blue-500">.ai</span>
          </span>
          <div className="flex gap-6 text-sm font-medium text-gray-600">
            <button onClick={() => router.push("/city")} className="text-blue-600 font-semibold">City Costs</button>
            <button onClick={() => router.push("/resume")} className="hover:text-gray-900 transition-colors">Resume</button>
          </div>
        </nav>

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">India Cost of Living</h1>
                <p className="text-gray-500 mt-1">
                  Compare prices for {cities.length} cities — rent, food, transport &amp; more.
                </p>
              </div>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Search city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "index" | "city")}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none bg-white"
                >
                  <option value="index">Sort: Cost Index</option>
                  <option value="city">Sort: A–Z</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* City Grid */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-sm animate-pulse">
                  <div className="h-28 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">No cities found for "{search}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((city) => (
                <div
                  key={city.city_key}
                  onClick={() => router.push(`/city/${encodeURIComponent(city.city)}`)}
                  className="group rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  {/* Hero gradient banner */}
                  <div className={`relative h-28 bg-gradient-to-br ${getGradient(city.city)} flex items-end p-4`}>
                    <div>
                      <p className="text-white font-bold text-lg leading-tight">{city.city}</p>
                    </div>
                    <div className="absolute top-3 right-3">
                      <IndexBadge index={city.index} />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1.5">🍽️ Veg Thali</span>
                      <span className="font-semibold text-gray-800">{city.veg_thali}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1.5">🏠 1BHK Rent</span>
                      <span className="font-semibold text-gray-800">{city.rent_1bhk_centre}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1.5">🏘️ PG Double</span>
                      <span className="font-semibold text-gray-800">{city.pg_double}</span>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-xs text-gray-400">Mumbai = 100</span>
                      <button className="text-xs text-blue-600 font-medium group-hover:underline">
                        View prices →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
