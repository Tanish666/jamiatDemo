"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import ProjectCardsSection from "./ProjectCardsSection";
import { Filter, Search, ChevronDown, Heart, Droplets, GraduationCap, UtensilsCrossed, Gift, Coins, Target, Briefcase, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import useResponsiveLimit from "../app/hooks/useResponsiveLimit";
import useDebounce from "../app/hooks/useDebounce";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"], // choose weights you want
});


function Projects({ title }) {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput);

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [donationTypeFilter, setDonationTypeFilter] = useState(title || "all");
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState("Most Urgent");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  // Map icons to categories (mockup counts representing the image)
  const categoryData = useMemo(() => {
    const defaultIcons = {
      "Education": GraduationCap,
      "Social Welfare": Heart,
      "Emergency Relief": Plus,
      "Water Wells": Droplets,
      "Orphan Care": Gift,
      "Healthcare": Plus,
      "Religious": Coins
    };

    const counts = {
      "All Projects": 42,
      "Education": 12,
      "Social Welfare": 8,
      "Emergency Relief": 5,
      "Water Wells": 15,
      "Orphan Care": 7
    };

    return [
      { name: "All Projects", count: counts["All Projects"], icon: Briefcase },
      ...(categories.length > 0 ? categories : [
        { name: "Education" },
        { name: "Social Welfare" },
        { name: "Emergency Relief" },
        { name: "Water Wells" },
        { name: "Orphan Care" }
      ]).map(cat => ({
        name: cat.name,
        count: counts[cat.name] || Math.floor(Math.random() * 10) + 1,
        icon: defaultIcons[cat.name] || Briefcase
      }))
    ];
  }, [categories]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, categoryFilter, donationTypeFilter, sortBy]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage, "...", totalPages);
      }
    }

    return (
      <div className="mt-24 flex items-center justify-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`w-10 h-10 flex items-center justify-center rounded-lg border border-gray-100 transition-all ${currentPage === 1 ? "text-gray-200 cursor-not-allowed" : "text-gray-400 hover:bg-white"}`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p, idx) => (
          p === "..." ? (
            <span key={`dots-${idx}`} className="px-2 text-gray-300 font-bold">...</span>
          ) : (
            <button
              key={`page-${p}`}
              onClick={() => handlePageChange(p)}
              className={`w-10 h-10 rounded-lg text-[0.85rem] font-bold transition-all duration-300 ${currentPage === p
                ? "bg-[#2ebc94] text-white shadow-lg shadow-emerald-100 border-none"
                : "text-gray-500 border border-gray-100 hover:bg-white"
                }`}
            >
              {p}
            </button>
          )
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`w-10 h-10 flex items-center justify-center rounded-lg border border-gray-100 transition-all ${currentPage === totalPages ? "text-gray-200 cursor-not-allowed" : "text-gray-400 hover:bg-white"}`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] text-[#1e293b]">
      <div className="max-w-[1536px] mx-auto px-6 lg:px-12 py-16 pt-32 lg:pt-32">
        <div className="flex flex-col gap-12">
          {/* Header & Search */}
          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-2">
              <h1 className={`${playfair.className} text-4xl md:text-[3rem] font-bold text-[#1e293b]`}>Ongoing Projects</h1>
              <p className="text-gray-500 font-medium text-[1rem]">Support our causes and make a lasting impact today.</p>
            </div>

            <div className="w-full lg:w-[450px] flex gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full bg-white pl-11 pr-4 py-4 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-[0.95rem] text-gray-700 font-medium shadow-sm shadow-emerald-50/50"
                />
              </div>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-100 rounded-2xl py-4 pl-5 pr-12 text-[0.9rem] font-bold text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-sm min-w-[160px]"
                >
                  <option>Most Urgent</option>
                  <option>Newest</option>
                  <option>Popular</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </header>

          {/* horizontal Categories Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
            {categoryData.map((choice) => (
              <button
                key={choice.name}
                onClick={() => setCategoryFilter(choice.name === "All Projects" ? "all" : choice.name)}
                className={`flex items-center gap-3 whitespace-nowrap px-6 py-3 rounded-full transition-all duration-300 border font-bold text-[0.85rem] ${(categoryFilter === "all" && choice.name === "All Projects") || categoryFilter === choice.name
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100"
                  : "bg-white border-gray-100 text-gray-500 hover:border-emerald-200 hover:text-emerald-600"
                  }`}
              >
                <choice.icon className="h-4 w-4" />
                <span>{choice.name}</span>
                <span className={`text-[0.65rem] px-2 py-0.5 rounded-full ${(categoryFilter === "all" && choice.name === "All Projects") || categoryFilter === choice.name
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-400"
                  }`}>
                  {choice.count}
                </span>
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <main className="w-full">
            <ProjectCardsSection
              searchTerm={debouncedSearch}
              categoryFilter={categoryFilter}
              donationTypeFilter={donationTypeFilter}
              initialLimit={12}
              infiniteScroll={false}
              sortBy={sortBy}
              page={currentPage}
              onTotalPagesChange={(total) => setTotalPages(total)}
            />

            {/* Pagination */}
            {totalPages > 1 && renderPagination()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Projects;
