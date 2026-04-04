"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import useSWR from "swr";
import {
  MapPin,
  Mail,
  Phone,
  Heart,
  Gift,
  Coins,
  Target,
  Target as ImpactIcon,
  Calendar,
  Layers,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { IoPerson } from "react-icons/io5";
import { FaHeart } from "react-icons/fa6";
import { PiBookOpenTextFill } from "react-icons/pi";
import { HelpCircle } from "lucide-react";

import dynamic from "next/dynamic";
import ShareButton from "./ShareButton";
import Image from "next/image";

const ProjectGallery = dynamic(() => import("./PhotoGallery"), { ssr: false });
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ProjectDetailsPage({ slug, projectId }) {
  const { isSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState("impact");
  const [checkedDonationType, setCheckedDonationType] = useState();
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("One-Time");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showReadMoreButton, setShowReadMoreButton] = useState(false);
  const dropdownRef = useRef(null);
  const descriptionRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const minAmounts = {
    "One-Time": 50,
    Weekly: 20,
    Monthly: 50,
    Yearly: 365,
  };
  const minAmount = minAmounts[frequency] || 50;

  const {
    data: projectRaw,
    error,
    isLoading,
    mutate,
  } = useSWR(
    projectId
      ? `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`
      : null,
    fetcher
  );

  const project = projectRaw
    ? {
      ...projectRaw,
      category: Array.isArray(projectRaw?.category)
        ? projectRaw.category.join(", ")
        : projectRaw?.category || "Unknown",
      impact: Array.isArray(projectRaw?.impact) ? projectRaw.impact : [],
      scheme: Array.isArray(projectRaw?.scheme) ? projectRaw.scheme : [],
      updates: Array.isArray(projectRaw?.updates) ? projectRaw.updates : [],
      donationOptions: Array.isArray(projectRaw?.donationOptions)
        ? projectRaw.donationOptions
        : [
          { type: "General Donation", isEnabled: false },
          { type: "Zakat", isEnabled: false },
          { type: "Sadqa", isEnabled: false },
          { type: "Interest Earnings", isEnabled: false },
        ],
    }
    : null;

  const { data: apiDonationTypes } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/donation-types`,
    fetcher
  );

  const categoryConfig = {
    hadiya: {
      icon: Heart,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      buttonColor: "bg-emerald-600 hover:bg-emerald-700",
    },
    "general donation": {
      icon: Heart,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      buttonColor: "bg-emerald-600 hover:bg-emerald-700",
    },
    zakat: {
      icon: Gift,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
    sadqa: {
      icon: Coins,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      buttonColor: "bg-amber-600 hover:bg-amber-700",
    },
    "interest earnings": {
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
    },
    "others(general donations & interest income)": {
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
    },
  };

  const donationCategories = useMemo(() => {
    if (!apiDonationTypes || !Array.isArray(apiDonationTypes)) return [];

    return apiDonationTypes
      .map((item) => {
        const lowerType = item.type.toLowerCase();
        const config = categoryConfig[lowerType] || {
          icon: HelpCircle,
          color: "text-slate-600",
          bgColor: "bg-slate-50",
          buttonColor: "bg-slate-600 hover:bg-slate-700",
        };

        return {
          ...config,
          title: item.type === "others(general donations & interest income)" ? "Others" : item.type,
          originalType: item.type,
          description: item.description || "Support our mission and contribute to this project",
        };
      })
      .filter((category) =>
        project?.donationOptions?.some(
          (opt) => opt?.type === category.originalType && opt?.isEnabled
        )
      );
  }, [apiDonationTypes, project?.donationOptions]);

  const checkedCategory = useMemo(() => {
    return donationCategories.length > 0 ? donationCategories[0].title : null;
  }, [donationCategories]);

  useEffect(() => {
    if (descriptionRef.current) {
      setShowReadMoreButton(descriptionRef.current.scrollHeight > 350);
    }
  }, [project?.description, activeTab]);

  const percentageRaised = useMemo(() => {
    if (!project?.totalRequired) return 0;
    return Math.min(
      Math.round((project?.collected / project?.totalRequired) * 100),
      100
    );
  }, [project]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-600">
        <p className="text-lg font-medium mb-6 text-red-500">
          Failed to load project details. Please try again.
        </p>
        <button
          onClick={() => mutate()}
          className="px-4 py-2 bg-emerald-600 text-white rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-600">
        <p className="text-lg font-medium mb-6">Loading project details...</p>
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-emerald-500"
              animate={{ y: [0, -10, 0], opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFDFC] pt-24 pb-16 px-2 sm:px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Section */}
        {project?.mainImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-[400px] lg:h-[500px] w-full overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl"
          >
            <Image
              src={project?.mainImage}
              alt={project?.title || "Project Image"}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              fill
              priority={true}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Top Navigation Bar (Floating) */}
            <div className="absolute top-4 sm:top-6 left-3 sm:left-6 right-3 sm:right-6 flex justify-between items-center z-20">
              <Link
                href="/projects"
                className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-white hover:bg-white/30 transition-all group"
              >
                <ChevronLeft className="w-4 sm:w-5 h-4 sm:h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs sm:text-sm font-medium hidden sm:block">Back to Projects</span>
                <span className="text-xs sm:text-sm font-medium sm:hidden">Back</span>
              </Link>
              <div className="bg-white/20 backdrop-blur-md p-1 rounded-full text-white">
                <ShareButton slug={project?.slug} title={project?.title} />
              </div>
            </div>

            {/* Bottom Content Area */}
            <div className="absolute bottom-6 sm:bottom-8 left-3 sm:left-8 right-3 sm:right-8 text-white z-20">
              <div className="space-y-3 sm:space-y-4 max-w-3xl">
                <span className="inline-block px-3 py-1 bg-emerald-500/80 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold rounded-full uppercase tracking-wider">
                  {project?.category || "Uncategorized"}
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-serif font-bold leading-tight">
                  {project?.title || "Untitled Project"}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm font-medium opacity-90">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-400" />
                    <span>{project?.location || "Unknown Location"}</span>
                  </div>
                  <div className="hidden sm:block h-4 w-[1px] bg-white/30" />
                  <div className="flex items-center space-x-1.5" suppressHydrationWarning>
                    <Calendar className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-400" />
                    <span>
                      {project?.daysLeft > 0
                        ? `${project.daysLeft.toLocaleString('en-IN')} Days Left`
                        : `Goal: ₹${project?.totalRequired?.toLocaleString('en-IN') || "0"}`
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8">
          {/* Left Column: Details & Content */}
          <div className="lg:col-span-8 space-y-12">
            {/* Quick Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6"
            >
              <div className="bg-white p-3 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-center space-y-1 sm:space-y-1.5 flex flex-col justify-center items-center">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-600 w-full truncate">{percentageRaised}%</p>
                <p className="text-[10px] sm:text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest w-full truncate" title="FUNDED">FUNDED</p>
              </div>
              <div className="bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-center space-y-1 sm:space-y-1.5 flex flex-col justify-center items-center">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 w-full truncate">
                  {project?.daysLeft > 0 ? project.daysLeft.toLocaleString('en-IN') : `₹${project?.totalRequired?.toLocaleString('en-IN') || "0"}`}
                </p>
                <p className="text-[10px] sm:text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest w-full truncate" title={project?.daysLeft > 0 ? "DAYS LEFT" : "TOTAL GOAL"}>
                  {project?.daysLeft > 0 ? "DAYS LEFT" : "TOTAL GOAL"}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-white p-3 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-center space-y-1 sm:space-y-1.5 flex flex-col justify-center items-center">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 w-full truncate">{project?.beneficiaries?.toLocaleString('en-IN') || 0}</p>
                <p className="text-[10px] sm:text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest w-full truncate" title="BENEFICIARIES">BENEFICIARIES</p>
              </div>
            </motion.div>
            {/* Main Content Tabs */}
            {(project?.impact?.length > 0 || project?.updates?.length > 0 || project?.description) && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-8"
              >
                {/* About Content (Now Outside Tabs) */}
                {project?.description && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-10"
                  >
                    <div className="bg-white px-4 py-5 sm:p-6 lg:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 mb-4 sm:mb-6">About the Project</h3>
                      <div
                        ref={descriptionRef}
                        className={`text-gray-600 text-lg leading-relaxed whitespace-pre-wrap break-words prose prose-emerald max-w-none w-full transition-all duration-300 overflow-hidden ${!isDescriptionExpanded ? "max-h-[350px]" : ""}`}
                        dangerouslySetInnerHTML={{ __html: project?.description }}
                      />
                      {showReadMoreButton && (
                        <div className="mt-4 pt-4 border-t border-gray-50 flex justify-center">
                          <button
                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                            className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-2 transition-colors px-4 py-2 hover:bg-emerald-50 rounded-xl"
                          >
                            {isDescriptionExpanded ? "Show Less" : "Read More"}
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDescriptionExpanded ? "rotate-180" : ""}`} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Timeline */}
                    {project?.timeline?.length > 0 && (
                      <div className="space-y-6">
                        <h3 className="text-2xl font-serif font-bold text-gray-900">Project Timeline</h3>
                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-gray-200 before:to-transparent">
                          {project?.timeline.map((event, idx) => {
                            let statusStyles = "bg-gray-200 text-gray-500";
                            let Icon = AlertCircle;

                            if (event.status === "Completed") {
                              statusStyles = "bg-emerald-50 text-emerald-600";
                              Icon = CheckCircle2;
                            } else if (event.status === "In Progress") {
                              statusStyles = "bg-blue-50 text-blue-600";
                              Icon = Clock;
                            }

                            return (
                              <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-white text-emerald-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors duration-300">
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] px-4 py-5 sm:p-6 rounded-[1.5rem] bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all">
                                  <div className="flex items-center justify-between space-x-2 mb-1">
                                    <div className="font-bold text-gray-900">{event.title}</div>
                                    <time className="font-mono text-xs text-emerald-600/50" suppressHydrationWarning>
                                      {event.date ? new Date(event.date).toLocaleDateString() : ""}
                                    </time>
                                  </div>
                                  <div className="text-gray-500 text-sm">{event.description}</div>
                                  <div className={`mt-3 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusStyles}`}>
                                    {event.status}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Tab Switcher & Content (Impact/Updates Only) */}
                {(project?.impact?.length > 0 || project?.updates?.length > 0) && (
                  <div className="space-y-8">
                    {/* Custom Tab Switcher */}
                    <div className="flex bg-gray-100/50 p-1 md:p-1.5 rounded-xl md:rounded-2xl w-full sm:w-fit overflow-x-auto hide-scrollbar">
                      {project?.impact?.length > 0 && (
                        <button
                          className={`px-4 sm:px-6 py-2 md:py-2.5 text-xs sm:text-sm font-bold rounded-lg md:rounded-xl transition-all whitespace-nowrap flex-1 sm:flex-none ${activeTab === "impact"
                            ? "bg-white text-emerald-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                            }`}
                          onClick={() => setActiveTab("impact")}
                        >
                          Impact
                        </button>
                      )}
                      {project?.updates?.length > 0 && (
                        <button
                          className={`px-4 sm:px-6 py-2 md:py-2.5 text-xs sm:text-sm font-bold rounded-lg md:rounded-xl transition-all whitespace-nowrap flex-1 sm:flex-none ${activeTab === "updates"
                            ? "bg-white text-emerald-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                            }`}
                          onClick={() => setActiveTab("updates")}
                        >
                          Updates
                        </button>
                      )}
                    </div>

                    {/* Tab Content */}
                    <div className="">
                      <AnimatePresence mode="wait">
                        {activeTab === "impact" && project?.impact?.length > 0 && (
                          <motion.div
                            key="impact"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                          >
                            {project?.impact
                              .slice()
                              .sort((a, b) => {
                                const order = { Direct: 1, Indirect: 2, "Long-term": 3 };
                                return (order[a.type] || 99) - (order[b.type] || 99);
                              })
                              .map((impact, idx) => {
                                let Icon = ImpactIcon;
                                if (impact.type === "Indirect") Icon = Layers;
                                if (impact.type === "Long-term") Icon = Calendar;

                                return (
                                  <div
                                    key={idx}
                                    className="px-4 py-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4"
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
                                        <Icon className="w-6 h-6" />
                                      </div>
                                      <div>
                                        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">
                                          {impact.type || "Impact"}
                                        </h3>
                                        <p className="text-xs font-bold text-emerald-600/60 uppercase tracking-widest">
                                          {impact.title || "Project Impact"}
                                        </p>
                                      </div>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed break-words">
                                      {impact.description}
                                    </p>
                                  </div>
                                );
                              })}
                          </motion.div>
                        )}

                        {activeTab === "updates" && project?.updates?.length > 0 && (
                          <motion.div
                            key="updates"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-6"
                          >
                            {project?.updates.map((update, idx) => (
                              <div
                                key={idx}
                                className="group px-4 py-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-md transition-all"
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <div className="flex items-center gap-4">
                                    <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                      <PiBookOpenTextFill className="text-xl" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                      {update.version || "Update"}
                                    </h3>
                                  </div>
                                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest" suppressHydrationWarning>
                                    {update.date ? new Date(update.date).toLocaleDateString() : ""}
                                  </span>
                                </div>
                                <p className="text-gray-600 leading-relaxed italic break-words whitespace-pre-wrap">
                                  "{update.content}"
                                </p>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </motion.section>
            )}

            {/* Gallery & Video Below Content */}
            <div className="space-y-12">
              {project?.photoGallery?.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-serif font-bold text-gray-900">Project Gallery</h3>
                  <div className="rounded-[2.5rem] overflow-hidden shadow-xl p-2 sm:p-5">
                    <ProjectGallery images={project?.photoGallery} className="bg-black" />
                  </div>
                </div>
              )}

              {project?.youtubeIframe && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-serif font-bold text-gray-900">Watch the Impact</h3>
                  <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-black">
                    <iframe
                      src={(() => {
                        const url = project?.youtubeIframe || "";
                        let videoId = "";

                        if (url.includes("youtu.be/")) {
                          videoId = url.split("youtu.be/")[1]?.split(/[?#]/)[0];
                        } else if (url.includes("youtube.com/watch")) {
                          const urlObj = new URL(url);
                          videoId = urlObj.searchParams.get("v");
                        } else if (url.includes("youtube.com/embed/")) {
                          videoId = url.split("youtube.com/embed/")[1]?.split(/[?#]/)[0];
                        } else if (url.includes("youtube.com/v/")) {
                          videoId = url.split("youtube.com/v/")[1]?.split(/[?#]/)[0];
                        }

                        return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : url;
                      })()}
                      title="Project Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sidebar (Donation & Manager) */}
          <div className="lg:col-span-4 space-y-10">
            {/* Donation Sticky Card */}
            <div className="sticky top-24 space-y-10">
              {/* Target & Progress Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#064E3B] rounded-[2rem] sm:rounded-[2.5rem] px-4 py-6 sm:p-8 text-white relative overflow-hidden shadow-2xl"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10 space-y-8">
                  <div className="space-y-2">
                    <p className="text-emerald-200/70 text-xs font-bold uppercase tracking-widest">Collection Progress</p>
                    <h3 className="text-4xl font-serif font-bold">₹{project?.collected?.toLocaleString('en-IN') || "0"}</h3>
                    <p className="text-emerald-100/60 text-sm">of ₹{project?.totalRequired?.toLocaleString('en-IN') || "0"} goal</p>
                  </div>

                  <div className="space-y-3">
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentageRaised}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-emerald-400 rounded-full"
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                      <span>{percentageRaised}% Raised</span>
                      <span>
                        {project?.daysLeft > 0
                          ? `${project.daysLeft.toLocaleString('en-IN')} Days More`
                          : `Goal: ₹${project?.totalRequired?.toLocaleString('en-IN') || "0"}`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Donation Form Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] "
              >
                <div className="px-4 py-1 pt-5 sm:px-8 sm:py-1 sm:pt-6 border-b border-gray-50 flex items-center gap-3">
                  <div className="bg-emerald-50 p-2.5 rounded-xl">
                    <Heart className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Make a Donation</h2>
                </div>

                <div className="px-4 pt-2 pb-5 sm:pt-4 sm:pb-8 sm:px-8 space-y-6 sm:space-y-8">
                  {/* Donation Type Selection */}
                  {donationCategories.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Select Purpose</label>
                      <div className="grid grid-cols-2 gap-3">
                        {donationCategories.map((category) => {
                          const isSelected = checkedDonationType ? checkedDonationType === category.originalType : checkedCategory === category.originalType;

                          return (
                            <button
                              key={category.originalType}
                              onClick={() => setCheckedDonationType(category.originalType)}
                              className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${isSelected
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]"
                                : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                                }`}
                            >
                              {category.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Donation Amount (₹)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min={minAmount}
                        placeholder={`Min: ₹${minAmount?.toLocaleString('en-IN')}`}
                        className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-bold text-lg placeholder:text-gray-300 text-gray-600"
                      />
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 font-bold">INR</div>
                    </div>
                  </div>

                  {/* Frequency Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Giving Frequency</label>
                    <div className="relative " ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-bold text-base flex items-center justify-between text-gray-600 hover:bg-gray-100/50 ${isDropdownOpen ? 'ring-2 ring-emerald-500/20 border-emerald-500' : ''}`}
                      >
                        <span>{frequency}</span>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-emerald-500' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/40 overflow-hidden py-1"
                          >
                            {["One-Time", "Weekly", "Monthly", "Yearly"].map((f) => (
                              <button
                                key={f}
                                type="button"
                                onClick={() => {
                                  setFrequency(f);
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full px-5 py-3 text-left transition-colors font-bold text-sm ${frequency === f
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-emerald-500/80"
                                  }`}
                              >
                                {f}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Proceed Button */}
                  <Link
                    href={{
                      pathname: !isSignedIn ? "/login" : `/donate/${slug}`,
                      query: {
                        type: checkedDonationType || checkedCategory,
                        amount,
                        frequency,
                      },
                    }}
                    className="block"
                  >
                    <button className="w-full py-5 bg-gradient-to-r from-[#10B981] to-[#34D399] text-white font-bold rounded-[2rem] shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2">
                      <Heart className="w-5 h-5 fill-current" />
                      Proceed to Donation
                    </button>
                  </Link>
                </div>
              </motion.div>

              {/* Project Manager Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white px-4 py-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <IoPerson className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Project Manager</h3>
                    <p className="text-xs font-bold text-emerald-600/60 uppercase tracking-widest leading-none">Reach out for queries</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">In Charge</p>
                      <p className="font-bold text-gray-900">{project?.projectManager?.name || "Jamiat Team"}</p>
                    </div>
                    <div className="flex gap-2">
                      {project?.projectManager?.email && (
                        <a
                          href={`mailto:${project.projectManager.email}`}
                          className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                      {project?.projectManager?.phone && (
                        <a
                          href={`tel:${project.projectManager.phone}`}
                          className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* PDF Document Card */}
              {project?.pdfUrl && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white px-4 py-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Project Document</h3>
                      <p className="text-xs font-bold text-red-600/60 uppercase tracking-widest leading-none">Official PDF File</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50">
                    <a
                      href={project.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-gray-50 text-gray-900 font-bold rounded-2xl shadow-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2 border border-gray-100 group"
                    >
                      <FileText className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                      View PDF Document
                    </a>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
