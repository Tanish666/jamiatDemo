"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Users, Calendar } from "lucide-react";
import Image from "next/image";

import ShareButton from "./ShareButton";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});


// Utils
const stripHtml = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
};

const formatCurrency = (amount) => {
  const value = Number(amount) || 0;
  if (value < 1_000) return `₹${value}`;
  if (value < 1_000_000) return `₹${Math.floor(value / 1_000)}k`;
  if (value < 10_000_000) return `₹${Math.floor(value / 100_000)}L`;
  return `₹${Math.floor(value / 10_000_000)}Cr`;
};

const formatNumber = (num) => {
  const value = Number(num) || 0;
  if (value < 1_000) return value.toString();
  if (value < 1_000_000) return Math.floor(value / 1_000) + "k";
  if (value < 10_000_000) return Math.floor(value / 100_000) + "L";
  return Math.floor(value / 10_000_000) + "Cr";
};

// Skeleton Loader
const ProjectCardSkeleton = () => (
  <div className="overflow-hidden bg-white rounded-3xl shadow-sm animate-pulse flex flex-col">
    <div className="h-48 lg:h-56 bg-gray-100"></div>
    <div className="p-6 space-y-3">
      <div className="h-6 bg-gray-100 rounded-lg w-3/4"></div>
      <div className="h-4 bg-gray-100 rounded-lg w-full"></div>
      <div className="h-4 bg-gray-100 rounded-lg w-5/6"></div>
    </div>
    <div className="p-6 pt-0 space-y-4">
      <div className="space-y-2">
        <div className="h-2 bg-gray-100 rounded-full w-full"></div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-100 rounded w-1/4"></div>
          <div className="h-3 bg-gray-100 rounded w-1/4"></div>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-12 bg-gray-100 rounded-xl w-1/2"></div>
        <div className="h-12 bg-gray-100 rounded-xl w-1/2"></div>
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
}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { isSignedIn } = useUser();
  const loaderRef = useRef(null);

  // Fetch data
  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        setLoading(true);

        const projectsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/projects?limit=${initialLimit}&page=${page}`,
          { signal: controller.signal }
        );

        console.log(`${process.env.NEXT_PUBLIC_API_URL}/projects?limit=${initialLimit}&page=${page}`)

        const projectsData = await projectsRes.json();

        const projectList = Array.isArray(projectsData?.projects)
          ? projectsData.projects
          : [];

        const perProjectSummaries = await Promise.all(
          projectList.map(async (p) => {
            if (!p?._id) {
              return { id: null, summary: null };
            }
            try {
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/donations/summary/${p._id}`,
                { signal: controller.signal }
              );
              if (!res.ok) {
                return { id: p._id, summary: null };
              }
              const json = await res.json();
              return { id: p._id, summary: json?.data || null };
            } catch (err) {
              if (err instanceof DOMException && err.name === "AbortError") {
                throw err;
              }
              return { id: p._id, summary: null };
            }
          })
        );

        const donationsMap = {};
        perProjectSummaries.forEach(({ id, summary }) => {
          if (!id || !summary) return;
          donationsMap[id] = {
            totalCollected: summary.totalCollected ?? 0,
            totalDonors: summary.totalDonors ?? 0,
          };
        });

        const merged = projectList.map((p) => {
          const donationSummary = donationsMap[p._id] || {
            totalCollected: 0,
            totalDonors: 0,
          };
          const totalRequired = p?.totalRequired ?? 0;
          const completion =
            totalRequired > 0
              ? Math.min(
                100,
                Math.round(
                  (donationSummary.totalCollected / totalRequired) * 100
                )
              )
              : 0;

          return {
            ...p,
            donationSummary,
            collected: donationSummary.totalCollected,
            completion,
          };
        });

        // If page=1, reset list, else append
        setProjects((prev) => (page === 1 ? merged : [...prev, ...merged]));

        // Stop if no more pages
        if (page >= (projectsData?.totalPages || 1)) {
          setHasMore(false);
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
  }, [page, initialLimit]);

  // Infinite scroll observer
  useEffect(() => {
    if (!infiniteScroll || !loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [infiniteScroll, hasMore, loading]);

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
        (Array.isArray(project?.category) &&
          project.category.includes(categoryFilter));

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
    <section className="flex flex-col items-center w-full px-4 py-8 sm:px-12 text-slate-900">
      {loading && page === 1 ? (
        <div className="grid w-full md:gap-8 gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: infiniteScroll ? initialLimit : 4 }).map(
            (_, i) => (
              <ProjectCardSkeleton key={i} />
            )
          )}
        </div>
      ) : (
        <>
          {/* Projects Grid */}
          <div className="grid w-full md:gap-8 gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProjects.map((project) => (
              <div
                key={project?._id}
                className="group overflow-hidden bg-white rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 lg:hover:-translate-y-2 lg:hover:scale-[1.02] flex flex-col border border-slate-100"
              >
                {/* Image & Share */}
                <div className="h-48 lg:h-56 relative">
                  <Image
                    src={project?.cardImage || project?.mainImage}
                    alt={project?.title || "Project"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06422d]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-2 right-2">
                    <ShareButton slug={project?.slug || ""} />
                  </div>
                </div>

                {/* Title & Description */}
                <div className="p-6 pb-2">
                  <h3 className={`${playfair.className} text-xl text-[#06422d] font-bold h-[56px] line-clamp-2 mb-3 tracking-tight`}>
                    {project?.title || "Untitled Project"}
                  </h3>
                  <div className="h-[72px] mb-3 overflow-hidden">
                    <p className="text-sm text-gray-600 inline leading-relaxed">
                      {(() => {
                        const text = stripHtml(project?.description) || "No description available";
                        return text.length > 85 ? text.substring(0, 85).trim() + "..." : text;
                      })()}
                    </p>
                    <Link
                      href={`/projects/${project?.slug || ""}`}
                      className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold hover:underline ml-1 inline whitespace-nowrap"
                    >
                      View more
                    </Link>
                  </div>
                </div>

                {/* Stats & Buttons */}
                <div className="p-6 pt-0 flex flex-col flex-grow space-y-4">
                  {project?.totalRequired > 0 ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-bold text-[#06422d]">
                            {project?.completion ?? 0}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-emerald-50 rounded-full overflow-hidden border border-emerald-100/50">
                          <div
                            className="h-full bg-emerald-600 transition-all duration-700"
                            style={{ width: `${project?.completion || 0}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-emerald-600 font-semibold">
                            {formatCurrency(project?.collected ?? 0)}
                          </span>
                          <span className="text-gray-600">
                            of {formatCurrency(project?.totalRequired ?? 0)}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between bg-white p-4">
                      <div className="flex flex-col items-center font-bold text-center">
                        <span className="text-xs uppercase text-gray-500">
                          Total Collected
                        </span>
                        <span className="text-lg text-[#06422d]">
                          {formatCurrency(
                            project?.donationSummary?.totalCollected ?? 0
                          )}
                        </span>
                      </div>
                      <div className="flex flex-col items-center font-bold text-center">
                        <span className="text-xs uppercase text-gray-500">
                          Total Donors
                        </span>
                        <span className="text-lg text-gray-800">
                          {project?.donationSummary?.totalDonors ?? 0}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-1.5 mt-auto">
                    {project?.status !== "Completed" && (
                      <Link
                        href={
                          !isSignedIn
                            ? "/login"
                            : `/donate/${project?.slug || ""}`
                        }
                        className="w-full sm:flex-1 text-center bg-[#06422d] text-white py-2 px-1 rounded-xl hover:bg-emerald-800 text-sm font-bold transition-all duration-300 active:scale-[0.98] shadow-lg shadow-emerald-900/10 whitespace-nowrap"
                      >
                        Donate Now
                      </Link>
                    )}
                    <Link
                      href={`/projects/${project?.slug || ""}`}
                      className="w-full sm:flex-1 text-center border-2 border-emerald-900 text-emerald-900 py-2 px-1 rounded-xl hover:bg-emerald-50 text-sm font-bold transition-all duration-300 active:scale-[0.98] whitespace-nowrap"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Infinite scroll loader */}
          {infiniteScroll && hasMore && (
            <div
              ref={loaderRef}
              className="mt-6 grid w-full md:gap-8 gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {Array.from({ length: infiniteScroll ? initialLimit : 4 }).map((_, i) => (
                <ProjectCardSkeleton key={`skeleton-${i}`} />
              ))}
            </div>
          )}

          {/* View More Projects Option */}
          {!infiniteScroll && (
            <div className="mt-8 flex justify-center w-full">
              <Link
                href="/projects"
                className="px-10 py-4 bg-white border-2 border-emerald-900 text-emerald-900 rounded-xl hover:bg-emerald-50 font-bold transition-all duration-300 active:scale-[0.98] shadow-xl hover:shadow-md"
              >
                View More Projects
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  );
}

