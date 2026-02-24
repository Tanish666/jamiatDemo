"use client";

import { useMemo, useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { IoPerson } from "react-icons/io5";
import { FaHeart } from "react-icons/fa6";
import { PiBookOpenTextFill } from "react-icons/pi";

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
  const minAmounts = {
    "One-Time": 50,
    Daily: 5,
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

  const percentageRaised = useMemo(() => {
    if (!project?.totalRequired) return 0;
    return Math.min(
      Math.round((project?.collected / project?.totalRequired) * 100),
      100
    );
  }, [project]);

  const donationCategories = [
    {
      icon: Heart,
      title: "General Donation",
      description:
        "Support our overall mission and let us allocate funds where they're needed most",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      buttonColor: "bg-emerald-600 hover:bg-emerald-700",
    },
    {
      icon: Gift,
      title: "Zakat",
      description:
        "Fulfill your Islamic obligation of Zakat through our verified and transparent programs",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
    {
      icon: Coins,
      title: "Sadqa",
      description:
        "Give voluntary charity (Sadqa) to earn rewards and help those in need",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      buttonColor: "bg-amber-600 hover:bg-amber-700",
    },
    {
      icon: Target,
      title: "Interest Earnings",
      description:
        "Donate your interest earnings to purify your wealth according to Islamic principles",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
    },
  ].filter((category) =>
    project?.donationOptions?.some(
      (opt) => opt?.type === category.title && opt?.isEnabled
    )
  );

  const checkedCategory = useMemo(() => {
    return donationCategories.length > 0 ? donationCategories[0].title : null;
  }, [donationCategories]);

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
    <main className="min-h-screen bg-[#FDFDFC] pt-24 pb-16 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Section */}
        {project?.mainImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-[400px] lg:h-[500px] w-full overflow-hidden rounded-[2.5rem] shadow-2xl"
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
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
              <Link
                href="/projects"
                className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white hover:bg-white/30 transition-all group"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Projects</span>
              </Link>
              <div className="bg-white/20 backdrop-blur-md p-1 rounded-full text-white">
                <ShareButton slug={project?.slug} />
              </div>
            </div>

            {/* Bottom Content Area */}
            <div className="absolute bottom-8 left-8 right-8 text-white z-20">
              <div className="space-y-4 max-w-3xl">
                <span className="inline-block px-3 py-1 bg-emerald-500/80 backdrop-blur-sm text-white text-xs font-bold rounded-full uppercase tracking-wider">
                  {project?.category || "Uncategorized"}
                </span>
                <h1 className="text-3xl lg:text-5xl font-serif font-bold leading-tight">
                  {project?.title || "Untitled Project"}
                </h1>
                <div className="flex items-center space-x-4 text-sm font-medium opacity-90">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>{project?.location || "Unknown Location"}</span>
                  </div>
                  <div className="h-4 w-[1px] bg-white/30" />
                  <div className="flex items-center space-x-1.5" suppressHydrationWarning>
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>{project?.daysLeft || 0} Days Left</span>
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
              className="grid grid-cols-3 gap-6"
            >
              <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-center space-y-1.5">
                <p className="text-2xl lg:text-3xl font-bold text-emerald-600">{percentageRaised}%</p>
                <p className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest">FUNDED</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-center space-y-1.5">
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{project?.daysLeft || 0}</p>
                <p className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest">DAYS LEFT</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] text-center space-y-1.5">
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{project?.beneficiaries || 0}</p>
                <p className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-widest">BENEFICIARIES</p>
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
                {/* Custom Tab Switcher */}
                <div className="flex bg-gray-100/50 p-1.5 rounded-2xl w-fit">
                  {project?.impact?.length > 0 && (
                    <button
                      className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === "impact"
                        ? "bg-white text-emerald-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                        }`}
                      onClick={() => setActiveTab("impact")}
                    >
                      Impact
                    </button>
                  )}
                  {project?.description && (
                    <button
                      className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === "about"
                        ? "bg-white text-emerald-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-900"
                        }`}
                      onClick={() => setActiveTab("about")}
                    >
                      About
                    </button>
                  )}
                  {project?.updates?.length > 0 && (
                    <button
                      className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === "updates"
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
                <div className="min-h-[300px]">
                  <AnimatePresence mode="wait">
                    {activeTab === "impact" && (
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
                                className="p-8 rounded-[2rem] bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4"
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
                                <p className="text-gray-600 text-sm leading-relaxed">
                                  {impact.description}
                                </p>
                              </div>
                            );
                          })}
                      </motion.div>
                    )}

                    {activeTab === "about" && (
                      <motion.div
                        key="about"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="space-y-10"
                      >
                        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6">About the Project</h3>
                          <div
                            className="text-gray-600 text-lg leading-relaxed whitespace-pre-line prose prose-emerald max-w-none"
                            dangerouslySetInnerHTML={{ __html: project?.description }}
                          />
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
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-[1.5rem] bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all">
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

                    {activeTab === "updates" && (
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
                            className="group p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-md transition-all"
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
                            <p className="text-gray-600 leading-relaxed italic">
                              "{update.content}"
                            </p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.section>
            )}

            {/* Gallery & Video Below Content */}
            <div className="space-y-12">
              {project?.photoGallery?.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-serif font-bold text-gray-900">Project Gallery</h3>
                  <div className="rounded-[2.5rem] overflow-hidden shadow-sm">
                    <ProjectGallery images={project?.photoGallery} />
                  </div>
                </div>
              )}

              {project?.youtubeIframe && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-serif font-bold text-gray-900">Watch the Impact</h3>
                  <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-black">
                    <iframe
                      src={
                        project?.youtubeIframe.includes("youtu.be")
                          ? `https://www.youtube.com/embed/${project?.youtubeIframe.split("youtu.be/")[1].split("?")[0]
                          }`
                          : project?.youtubeIframe
                      }
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
                className="bg-[#064E3B] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10 space-y-8">
                  <div className="space-y-2">
                    <p className="text-emerald-200/70 text-xs font-bold uppercase tracking-widest">Collection Progress</p>
                    <h3 className="text-4xl font-serif font-bold">₹{project?.collected?.toLocaleString() || "0"}</h3>
                    <p className="text-emerald-100/60 text-sm">of ₹{project?.totalRequired?.toLocaleString() || "0"} goal</p>
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
                      <span>{project?.daysLeft || 0} Days More</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Donation Form Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
              >
                <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-3">
                  <div className="bg-emerald-50 p-2.5 rounded-xl">
                    <Heart className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Make a Donation</h2>
                </div>

                <div className="p-8 space-y-8">
                  {/* Donation Type Selection */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Select Purpose</label>
                    <div className="grid grid-cols-2 gap-3">
                      {["General Donation", "Zakat", "Sadqa", "Interest Earnings"].map((category) => {
                        const isAvailable = donationCategories.some(cat => cat.title === category);
                        const isSelected = checkedDonationType ? checkedDonationType === category : checkedCategory === category;

                        return (
                          <button
                            key={category}
                            disabled={!isAvailable}
                            onClick={() => setCheckedDonationType(category)}
                            className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${isSelected
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]"
                              : isAvailable
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                                : "bg-gray-50 text-gray-300 border-gray-50 cursor-not-allowed"
                              }`}
                          >
                            {category}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Donation Amount (₹)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min={minAmount}
                        placeholder={`Min: ₹${minAmount}`}
                        className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-bold text-lg placeholder:text-gray-300 "
                      />
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 font-bold">INR</div>
                    </div>
                  </div>

                  {/* Frequency Selection */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Giving Frequency</label>
                    <div className="flex bg-gray-50 p-1.5 rounded-2xl">
                      {["One-Time", "Monthly"].map((f) => (
                        <button
                          key={f}
                          onClick={() => setFrequency(f)}
                          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${frequency === f ? "bg-white text-emerald-600 shadow-sm" : "text-gray-400"
                            }`}
                        >
                          {f}
                        </button>
                      ))}
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
                className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6"
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
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
