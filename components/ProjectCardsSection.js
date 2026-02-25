"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Users, Calendar, ChevronRight } from "lucide-react";
import Image from "next/image";

import ShareButton from "./ShareButton";

// Utils
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
  <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse flex flex-col h-full">
    <div className="h-52 bg-gray-100"></div>
    <div className="p-6 space-y-4 flex-grow">
      <div className="h-6 bg-gray-100 rounded-md w-3/4"></div>
      <div className="space-y-2">
        <div className="h-3.5 bg-gray-100 rounded-md w-full"></div>
        <div className="h-3.5 bg-gray-100 rounded-md w-full"></div>
        <div className="h-3.5 bg-gray-100 rounded-md w-2/3"></div>
        <div className="h-3 bg-gray-50 rounded-md w-24"></div>
      </div>
      <div className="pt-4 space-y-3 mt-auto">
        <div className="flex justify-between">
          <div className="h-3 bg-gray-100 rounded-full w-1/4"></div>
          <div className="h-3 bg-gray-100 rounded-full w-1/6"></div>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full w-full"></div>
      </div>
    </div>
    <div className="p-6 pt-0 flex gap-3">
      <div className="h-11 bg-gray-100 rounded-xl w-1/2"></div>
      <div className="h-11 bg-gray-100 rounded-xl w-1/2"></div>
    </div>
  </div>
);

// Truncated Description Component
const TruncatedDescription = ({ html, slug }) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const descriptionRef = useRef(null);

  useEffect(() => {
    const checkTruncation = () => {
      const el = descriptionRef.current;
      if (el) {
        // Checking if content overflows 3 lines
        setIsTruncated(el.scrollHeight > el.clientHeight + 1);
      }
    };

    // Initial check
    checkTruncation();

    // Check on resize
    window.addEventListener("resize", checkTruncation);
    return () => window.removeEventListener("resize", checkTruncation);
  }, [html]);

  return (
    <div className="mt-3 relative">
      <div
        ref={descriptionRef}
        className="text-[13px] sm:text-xs text-gray-500 line-clamp-3 leading-relaxed min-h-[60px]"
        dangerouslySetInnerHTML={{
          __html: html || "No description available",
        }}
      />
      {isTruncated && (
        <Link
          href={`/projects/${slug || ""}`}
          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold text-xs mt-2 group/more transition-colors"
        >
          Read Full Story
          <ChevronRight className="w-3 h-3 group-hover/more:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
};


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
    <section className="flex flex-col items-center w-full px-4 py-8 sm:px-12 text-gray-900 max-w-[1800px] mx-auto">
      {loading && page === 1 ? (
        <div className="grid w-full gap-6 md:gap-6
                      grid-cols-1
                      sm:grid-cols-2
                      lg:grid-cols-3
                      xl:grid-cols-4">
          {Array.from({ length: infiniteScroll ? initialLimit : 3 }).map(
            (_, i) => (
              <ProjectCardSkeleton key={i} />
            )
          )}
        </div>
      ) : (
        <>
          {/* Projects Grid */}
          <div className="grid w-full gap-6 md:gap-6
                      grid-cols-1
                      sm:grid-cols-2
                      lg:grid-cols-3
                      xl:grid-cols-4">
            {filteredProjects.map((project) => (
              <div
                key={project?._id}
                className="group overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-300 flex flex-col h-full"
              >
                {/* Image & Share */}
                <div className="h-52 lg:h-60 relative overflow-hidden">
                  <Image
                    src={project?.cardImage || project?.mainImage}
                    alt={project?.title || "Project"}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>

                  {/* Category Badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    {Array.isArray(project?.category) && project.category.slice(0, 2).map((cat, idx) => (
                      <span key={idx} className="bg-emerald-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg">
                        {cat}
                      </span>
                    ))}
                  </div>

                  <div className="absolute top-3 right-3 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <ShareButton slug={project?.slug || ""} />
                  </div>
                </div>

                {/* Title & Description */}
                <div className="p-6 pb-4">
                  <h3 className="text-xl text-emerald-900 font-bold min-h-[56px] leading-tight group-hover:text-emerald-700 transition-colors">
                    {project?.title || "Untitled Project"}
                  </h3>
                  <TruncatedDescription
                    html={project?.description}
                    slug={project?.slug}
                  />
                </div>

                {/* Stats & Buttons */}
                <div className="p-6 pt-0 flex flex-col flex-grow space-y-5">
                  {project?.totalRequired > 0 ? (
                    <>
                      <div className="space-y-2.5 mt-auto">
                        <div className="flex justify-between items-end text-sm">
                          <span className="text-gray-500 font-medium tracking-wide flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            PROGRESS
                          </span>
                          <span className="font-bold text-emerald-950">
                            {project?.completion ?? 0}%
                          </span>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner p-0.5">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out relative shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                            style={{ width: `${project?.completion || 0}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-tighter">Raised</span>
                            <span className="text-lg font-black text-emerald-800 leading-none">
                              {formatCurrency(project?.collected ?? 0)}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Goal</span>
                            <span className="text-base font-bold text-gray-700 leading-none">
                              {formatCurrency(project?.totalRequired ?? 0)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {(Number(project?.beneficiaries) > 0 ||
                        project?.status === "Completed" ||
                        Number(project?.daysLeft) > 0) && (
                          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                            {Number(project?.beneficiaries) > 0 && (
                              <div className="flex items-center gap-1.5 py-1.5 px-3 bg-gray-50 rounded-lg">
                                <Users className="h-3.5 w-3.5 text-emerald-600" />
                                <span className="text-xs font-semibold text-gray-600">
                                  {formatNumber(project?.beneficiaries ?? 0)}{" "}
                                </span>
                              </div>
                            )}
                            {(project?.status === "Completed" ||
                              Number(project?.daysLeft) > 0) && (
                                <div className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg ${project?.status === "Completed" ? "bg-emerald-50" : "bg-amber-50"}`}>
                                  <Calendar className={`h-3.5 w-3.5 ${project?.status === "Completed" ? "text-emerald-600" : "text-amber-600"}`} />
                                  <span className={`text-xs font-semibold ${project?.status === "Completed" ? "text-emerald-700" : "text-amber-700"}`}>
                                    {project?.status === "Completed"
                                      ? "Completed"
                                      : `${project?.daysLeft ?? 0} days to go`}
                                  </span>
                                </div>
                              )}
                          </div>
                        )}
                    </>
                  ) : (
                    <div className="flex justify-between bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100/50 mt-auto">
                      <div className="flex flex-col items-start">
                        <span className="text-[10px] uppercase text-emerald-600 font-black tracking-widest">
                          Collected
                        </span>
                        <span className="text-xl font-black text-emerald-800">
                          {formatCurrency(
                            project?.donationSummary?.totalCollected ?? 0
                          )}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase text-gray-500 font-black tracking-widest">
                          Donors
                        </span>
                        <span className="text-xl font-black text-gray-800 leading-none">
                          {project?.donationSummary?.totalDonors ?? 0}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    {project?.status !== "Completed" && (
                      <Link
                        href={
                          !isSignedIn
                            ? "/login"
                            : `/donate/${project?.slug || ""}`
                        }
                        className="w-full sm:flex text-center bg-gradient-to-br from-emerald-600 to-emerald-700 text-white py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-emerald-900/20 active:scale-95 transition-all font-bold text-sm tracking-wide justify-center items-center"
                      >
                        Donate Now
                      </Link>
                    )}
                    <Link
                      href={`/projects/${project?.slug || ""}`}
                      className="w-full sm:flex-1 text-center border-2 border-emerald-600 text-emerald-600 py-3 px-4 rounded-xl hover:bg-emerald-50 active:scale-95 transition-all font-bold text-sm tracking-wide shadow-sm"
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
              className="grid w-full gap-6 md:gap-6
               grid-cols-1
               sm:grid-cols-2
               lg:grid-cols-3
               xl:grid-cols-4"
            >
              {Array.from({ length: infiniteScroll ? initialLimit : 3 }).map((_, i) => (
                <ProjectCardSkeleton key={`skeleton-${i}`} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}