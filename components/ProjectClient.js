"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import ProjectCardsSection from "./ProjectCardsSection";
import { Filter, Search } from "lucide-react";
import useResponsiveLimit from "../app/hooks/useResponsiveLimit";
import useDebounce from "../app/hooks/useDebounce";
import { Playfair_Display } from "next/font/google";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

function Projects({ title }) {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput);

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [donationTypeFilter, setDonationTypeFilter] = useState(title || "all");
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const donationTypes = useMemo(
    () => ["all", "general", "zakat", "sadqa", "interest_earnings"],
    []
  );

  // Fetch categories with cleanup
  useEffect(() => {
    const controller = new AbortController();

    async function fetchCategories() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/categories`,
          { signal: controller.signal }
        );
        const data = await res.json();
        console.log(data);
        const cats = Array.isArray(data)
          ? data
          : Array.isArray(data.categories)
            ? data.categories
            : [];

        setCategories(cats);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to fetch categories", error);
        }
      }
    }

    fetchCategories();

    return () => controller.abort();
  }, []);

  // Clear filters handler
  const handleClearFilters = useCallback(() => {
    setSearchInput("");
    setCategoryFilter("all");
    setDonationTypeFilter("all");
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-emerald-100">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none" />

      {/* Header */}
      <section className="relative text-center px-4 pt-32 pb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-6 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Our Initiatives
        </div>
        <h1 className={`text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 ${playfairDisplay.className}`}>
          Empowering <span className="text-emerald-600">Communities</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Discover the initiatives we're working on across India. Every project
          is carefully planned and transparently managed to maximize impact.
        </p>
      </section>

      {/* Filter Section */}
      <section className="top-4 z-30 px-3 sm:px-10 mb-12">
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-2 sm:p-3 max-w-7xl mx-auto">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search Container */}
            <div className="flex flex-row gap-2 flex-grow">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full text-sm sm:text-base pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                />
              </div>

              <button
                onClick={() => setShowFilters((prev) => !prev)}
                className="lg:hidden flex items-center justify-center aspect-square w-[52px] bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all rounded-2xl cursor-pointer"
              >
                <Filter className={`h-5 w-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filters Container */}
            <div
              className={`${showFilters ? "flex" : "hidden"
                } lg:flex flex-col sm:flex-row gap-3 w-full lg:w-auto animate-in fade-in slide-in-from-top-2 duration-300`}
            >
              {/* Category Dropdown */}
              <div className="relative group flex-1 lg:w-56">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Filter className="h-4 w-4 text-slate-400" />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full pl-11 pr-10 py-3.5 text-sm font-medium bg-slate-50 border-transparent rounded-2xl appearance-none cursor-pointer focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              {/* Donation Type Dropdown */}
              <div className="relative group flex-1 lg:w-56">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-500/70">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <select
                  value={donationTypeFilter}
                  onChange={(e) => setDonationTypeFilter(e.target.value)}
                  className="w-full pl-11 pr-10 py-3.5 text-sm font-medium bg-slate-50 border-transparent rounded-2xl appearance-none cursor-pointer focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                >
                  {donationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "all"
                        ? "All Donation Types"
                        : type === "zakat"
                          ? "Zakat Eligible"
                          : type === "interest_earnings"
                            ? "Interest Earnings"
                            : type === "sadqa"
                              ? "Sadqa"
                              : "General"}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              {/* Clear Button */}
              <button
                onClick={handleClearFilters}
                className="py-3.5 px-6 shrink-0 bg-slate-900 hover:bg-emerald-600 text-white text-sm font-bold rounded-2xl shadow-lg shadow-slate-200 hover:shadow-emerald-200 transition-all duration-300 active:scale-95 cursor-pointer whitespace-nowrap"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Project Cards */}
      <section className="relative w-full pb-20 px-4 md:px-0">
        <div className="max-w-7xl mx-auto">
          {(() => {
            const responsiveLimit = useResponsiveLimit();
            return (
              <ProjectCardsSection
                searchTerm={debouncedSearch}
                categoryFilter={categoryFilter}
                donationTypeFilter={donationTypeFilter}
                initialLimit={responsiveLimit}
                infiniteScroll={true}
              />
            );
          })()}
        </div>
      </section>
    </div>
  );
}

export default Projects;