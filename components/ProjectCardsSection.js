"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Users, Calendar, Droplets, GraduationCap, UtensilsCrossed, Heart, Gift, Coins, Target, Plus, Thermometer, ShieldCheck, Landmark } from "lucide-react";
import Image from "next/image";

import ShareButton from "./ShareButton";

// Utils
const categoryIcons = {
  "Clean Water Initiative": Droplets,
  "Water Wells": Droplets,
  "Education": GraduationCap,
  "Food Security": UtensilsCrossed,
  "General Donation": Heart,
  "Social Welfare": Heart,
  "Zakat": Gift,
  "Sadqa": Coins,
  "Interest Earnings": Target,
  "Emergency Relief": Plus,
  "Healthcare": Plus,
  "Orphan Care": Gift,
  "Religious": Landmark
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatNumber = (num) => {
  if (num >= 1_000_000) return Math.floor(num / 1_000_000) + "M";
  if (num >= 1_000) return Math.floor(num / 1_000) + "K";
  return num?.toString() || "0";
};

// Skeleton Loader
const ProjectCardSkeleton = () => (
  <div className="overflow-hidden bg-white rounded-[2rem] shadow-sm animate-pulse flex flex-col h-[480px]">
    <div className="h-52 bg-gray-200"></div>
    <div className="p-5 space-y-4 flex-grow">
      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      <div className="mt-auto space-y-4">
        <div className="flex justify-between">
          <div className="h-2 bg-gray-200 rounded w-1/4"></div>
          <div className="h-2 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full w-full"></div>
        <div className="flex gap-2">
          <div className="h-10 bg-gray-200 rounded-xl flex-grow"></div>
          <div className="h-10 bg-gray-200 rounded-xl w-10"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function ProjectCardsSection({
  searchTerm = "",
  categoryFilter = "all",
  donationTypeFilter = "all",
  infiniteScroll = false, // homepage=false, projects page=true
  initialLimit = 4, // how many to load per API call
  sortBy = "Most Urgent",
  page: propPage,
  onTotalPagesChange,
}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [internalPage, setInternalPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { isSignedIn } = useUser();
  const loaderRef = useRef(null);

  // Use prop page if provided, else use internal state for infinite scroll
  const page = propPage || internalPage;

  // Fetch data
  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        setLoading(true);

        // Build query params
        const queryParams = new URLSearchParams({
          limit: initialLimit,
          page: page,
          search: searchTerm || "",
          category: categoryFilter === "all" ? "" : categoryFilter,
          donationType: donationTypeFilter === "all" ? "" : donationTypeFilter,
          sortBy: sortBy,
        });

        const [projectsRes, donationsRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/projects?${queryParams.toString()}`,
            { signal: controller.signal }
          ),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/donations/summary`, {
            signal: controller.signal,
          }),
        ]);

        const projectsData = await projectsRes.json();
        const donationsData = await donationsRes.json();

        const donationsMap = {};
        donationsData?.data?.forEach((d) => {
          donationsMap[d._id] = {
            totalCollected: d.totalCollected,
            totalDonors: d.totalDonors,
          };
        });

        const merged = Array.isArray(projectsData?.projects)
          ? projectsData.projects.map((p) => ({
            ...p,
            donationSummary: donationsMap[p._id] || {
              totalCollected: 0,
              totalDonors: 0,
            },
          }))
          : [];

        // If page=1 OR not infinite scroll, reset list, else append
        setProjects((prev) => (page === 1 || !infiniteScroll ? merged : [...prev, ...merged]));

        // Update total pages for parent
        if (onTotalPagesChange) {
          onTotalPagesChange(projectsData?.totalPages || 1);
        }

        // Stop if no more pages
        if (page >= (projectsData?.totalPages || 1)) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error("Failed to fetch projects/donations", err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    return () => controller.abort();
    // Re-fetch when ANY filter or page changes
  }, [page, initialLimit, searchTerm, categoryFilter, donationTypeFilter, sortBy, infiniteScroll, onTotalPagesChange]);

  // Infinite scroll observer (only used if no propPage and infiniteScroll is true)
  useEffect(() => {
    if (!infiniteScroll || !!propPage || !loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setInternalPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [infiniteScroll, propPage, hasMore, loading]);

  // Filtering
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (!project?.status || project.status === "Draft") return false;

      const matchesSearch =
        !searchTerm ||
        project?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project?.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        project?.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" ||
        (Array.isArray(project?.category)
          ? project.category.includes(categoryFilter)
          : project?.category === categoryFilter);

      let matchesDonationType = true;
      if (donationTypeFilter !== "all") {
        matchesDonationType = project?.donationOptions?.some((opt) => {
          if (!opt?.isEnabled) return false;
          const type = opt.type?.toLowerCase();
          return (
            (donationTypeFilter === "zakat" && type === "zakat") ||
            (donationTypeFilter === "interest_earnings" &&
              type === "interest earnings") ||
            (donationTypeFilter === "sadqa" && type === "sadqa") ||
            (donationTypeFilter === "general" && type === "general donation")
          );
        });
      }

      return matchesSearch && matchesCategory && matchesDonationType;
    });
  }, [projects, searchTerm, categoryFilter, donationTypeFilter]);

  return (
    <section className="flex flex-col items-center w-full py-4 text-gray-900">
      {loading && (page === 1 || !infiniteScroll) ? (
        <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {Array.from({ length: initialLimit || 9 }).map(
            (_, i) => (
              <ProjectCardSkeleton key={i} />
            )
          )}
        </div>
      ) : (
        <>
          {/* Projects Grid */}
          <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProjects.map((project, index) => {
              // Determine category for icon/label
              const categoryMatch = project?.category?.[0] || "General Donation";
              const CategoryIcon = categoryIcons[categoryMatch] || Heart;

              return (
                <div
                  key={project?._id}
                  className="group overflow-hidden bg-white rounded-[2rem] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col border border-gray-100"
                >
                  {/* Image & Category Tag */}
                  <div className="h-52 relative overflow-hidden">
                    <Image
                      src={project?.cardImage || project?.mainImage}
                      alt={project?.title || "Project"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {/* Floating Category Badge */}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-white/20">
                      <CategoryIcon className="h-3 w-3 text-[#2ebc94]" />
                      <span className="text-[0.65rem] font-bold text-gray-700 tracking-wide">
                        {categoryMatch}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 pb-6 flex flex-col flex-grow">
                    {/* Title */}
                    <h3 className="text-[1.1rem] text-[#1e293b] font-bold mb-2 leading-tight line-clamp-2 min-h-[2.8rem]">
                      {project?.title || "Untitled Project"}
                    </h3>

                    {/* Description */}
                    <p
                      className="text-[0.85rem] text-gray-500 font-medium mb-8 line-clamp-2 leading-relaxed opacity-90"
                      dangerouslySetInnerHTML={{
                        __html: project?.description || "No description available",
                      }}
                    />

                    {/* Progress Stats */}
                    <div className="mt-auto">
                      <div className="flex justify-between items-end mb-3">
                        <span className="text-[0.85rem] font-bold text-[#2ebc94]">
                          {Math.min(project?.completion || 0, 100)}% Funded
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[0.75rem] font-bold text-[#1e293b]">
                            {formatCurrency(project?.collected ?? 0)}
                          </span>
                          <span className="text-[0.75rem] font-medium text-gray-400">
                            / {formatCurrency(project?.totalRequired ?? 0)}
                          </span>
                        </div>
                      </div>

                      <div className="h-1.5 w-full bg-[#f1f5f9] rounded-full overflow-hidden mb-8">
                        <div
                          className="h-full bg-[#2ebc94] rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${Math.min(project?.completion || 0, 100)}%` }}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {project?.status !== "Completed" && (
                          <Link
                            href={`/donate/${project?.slug || ""}?type=${categoryMatch}`}
                            className="flex-grow text-center bg-emerald-600 text-white py-2.5 px-4 rounded-lg hover:bg-emerald-700 font-bold transition-all duration-300 text-[0.85rem]"
                          >
                            Donate Now
                          </Link>
                        )}
                        <Link
                          href={`/projects/${project?.slug || ""}`}
                          className="flex-grow text-center border border-[#2ebc94] text-[#2ebc94] py-2.5 rounded-lg font-bold hover:bg-[#2ebc94] hover:text-white transition-all duration-300 text-[0.85rem]"
                        >
                          View Details
                        </Link>
                        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e2e8f0] text-[#2ebc94] hover:bg-[#f0fdf9] hover:border-[#2ebc94] transition-all duration-300 group/heart">
                          <Heart className="h-4 w-4 transition-transform group-hover/heart:scale-110" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Infinite scroll loader */}
          {infiniteScroll && hasMore && (
            <div
              ref={loaderRef}
              className="mt-10 grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <ProjectCardSkeleton key={`skeleton-${i}`} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
