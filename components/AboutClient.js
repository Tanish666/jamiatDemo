"use client";
import React, { useState, useEffect } from "react";
import {
  Star,
  Users,
  Heart,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  History,
  Briefcase,
  Download,
  PieChart,
  Gem,
} from "lucide-react";
import { motion } from "framer-motion";
import { StorySection } from "./StorySection";

const JOURNEY_ICONS = [<History className="w-6 h-6" key="h1" />, <Heart className="w-6 h-6" key="h2" />, <Users className="w-6 h-6" key="u1" />, <Gem className="w-6 h-6" key="g1" />];
const IMPACT_ICONS = [<TrendingUp className="w-6 h-6" key="t1" />, <Users className="w-6 h-6" key="u2" />, <Heart className="w-6 h-6" key="h3" />, <Star className="w-6 h-6" key="s1" />];
const FUTURE_ICONS = [<ArrowRight className="w-6 h-6" key="a1" />, <Gem className="w-6 h-6" key="g2" />, <History className="w-6 h-6" key="h4" />, <TrendingUp className="w-6 h-6" key="t2" />];

const LEADERSHIP_DATA = [
  {
    name: "Ahmed Khan",
    role: "Executive Director",
    bio: "Former management consultant with 15 years of non-profit leadership experience.",
    initials: "AK",
    color: "bg-blue-100",
    textColor: "text-blue-600",
  },
  {
    name: "Sarah Al-Fayed",
    role: "Director of Finance",
    bio: "CPA ensuring every dollar is allocated with efficiency and transparency.",
    initials: "SA",
    color: "bg-emerald-100",
    textColor: "text-emerald-600",
  },
  {
    name: "Omar Malik",
    role: "Outreach Coordinator",
    bio: "Bridging the gap between our donors and the communities we serve.",
    initials: "OM",
    color: "bg-purple-100",
    textColor: "text-purple-600",
  },
  {
    name: "Zainab Hassan",
    role: "Education Program Lead",
    bio: "Passionate educator developing curriculums for underprivileged youth.",
    initials: "ZH",
    color: "bg-amber-100",
    textColor: "text-amber-600",
  },
];

const DEFAULT_OBJECTIVES = [
  {
    text: "Protection of Islam, Islamic culture, tradition, heritage and places of worship.",
  },
  {
    text: "Protection and promotion of religious, cultural, educational and citizenship rights of the Muslim community.",
  },
  {
    text: "Reformation of religious, social and educational life of the Muslim community.",
  },
  {
    text: "Establishment of institutions that could empower Muslims educationally, culturally, socially, and economically.",
  },
];

const stripLeadingMarker = (text) => {
  if (typeof text !== "string") return "";
  // Removes markers like "A. ", "1. ", or "• " from the start of the text
  return text.replace(/^[A-Z0-9][\.\)]\s*|^\-\s*/i, "").trim();
};

const getColorClasses = (colorName) => {
  switch (colorName?.toLowerCase()) {
    case 'blue': return { bg: 'bg-blue-100', text: 'text-blue-600' };
    case 'purple': return { bg: 'bg-purple-100', text: 'text-purple-600' };
    case 'amber': return { bg: 'bg-amber-100', text: 'text-amber-600' };
    case 'emerald':
    default: return { bg: 'bg-emerald-100', text: 'text-emerald-600' };
  }
};

const AboutClient = () => {
  const [hero, setHero] = useState(null);
  const [vision, setVision] = useState(null);
  const [values, setValues] = useState(null);
  const [story, setStory] = useState(null);
  const [leadership, setLeadership] = useState(null);
  const [financial, setFinancial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("journey");

  useEffect(() => {
    if (story) {
      if (story.journey?.length > 0) setActiveTab("journey");
      else if (story.impact?.length > 0) setActiveTab("impact");
      else if (story.future?.length > 0) setActiveTab("future");
    }
  }, [story]);

  const availableTabs = React.useMemo(() => [
    { label: "Our Journey", value: "journey", data: story?.journey },
    { label: "Our Impact", value: "impact", data: story?.impact },
    { label: "Future Vision", value: "future", data: story?.future },
  ].filter(tab => tab.data && tab.data.length > 0), [story]);

  const objectivePoints = React.useMemo(() =>
    values?.cards
      ?.map((card, idx) => {
        const title = typeof card?.title === "string" ? card.title.trim() : "";
        const description =
          typeof card?.description === "string" ? card.description.trim() : "";
        const expectedLetter = String.fromCharCode(65 + idx);
        const normalizedTitle = stripLeadingMarker(title);
        const normalizedDescription = stripLeadingMarker(description);
        const titleIsLetterOnly =
          !normalizedTitle ||
          title.toUpperCase() === expectedLetter ||
          /^[A-Z]$/i.test(title);

        if (normalizedDescription) {
          return normalizedDescription;
        }
        if (normalizedTitle && !titleIsLetterOnly) {
          return normalizedTitle;
        }
        return "";
      })
      .filter(Boolean) || [], [values]);

  const objectivesToRender = React.useMemo(() =>
    objectivePoints.length > 0 ? objectivePoints : DEFAULT_OBJECTIVES.map((item) => item.text),
    [objectivePoints]);

  useEffect(() => {
    async function fetchContent() {
      try {
        const [heroRes, visionRes, valuesRes, storyRes, leadershipRes, financialRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/aboutherosection`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/aboutvisionsection`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/aboutvaluesection`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/aboutstorysection`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/aboutleadershipsection`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/aboutfinancialsection`),
        ]);

        const [heroData, visionData, valuesData, storyData, leadershipData, financialData] = await Promise.all([
          heroRes.json(),
          visionRes.json(),
          valuesRes.json(),
          storyRes.json(),
          leadershipRes.json(),
          financialRes.json(),
        ]);

        setHero(heroData);
        setVision(visionData);
        setValues(valuesData);
        setStory(storyData);
        setLeadership(leadershipData);
        setFinancial(financialData);
      } catch (err) {
        console.error("Failed to fetch about page data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, []);

  const handleDownload = async (e, url, filename) => {
    e.preventDefault();
    if (!url || url === "#") return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;

      let downloadName = filename || "document";
      if (!downloadName.toLowerCase().endsWith('.pdf')) {
        downloadName += '.pdf';
      }
      link.download = downloadName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: open in new tab if fetch fails (e.g. CORS)
      window.open(url, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 px-5 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-[5%] left-[-5%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8 lg:space-y-12">
          <div className="space-y-6 lg:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 font-medium text-sm border border-emerald-100/50"
            >
              <Users className="w-4 h-4" />
              <span>Who We Are</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl lg:text-7xl font-serif font-bold tracking-tight text-slate-900 leading-[1.1]"
            >
              {hero?.title || (
                <>
                  Serving Humanity with <br className="hidden lg:block" />
                  <span className="text-emerald-600">Compassion & Ihsan</span>
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
            >
              {hero?.subtitle ||
                "Since 1995, Jamiat has been dedicated to uplifting underserved communities through sustainable development, education, and immediate relief."}
            </motion.p>
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-3 gap-4 lg:gap-8 bg-emerald-50/50 backdrop-blur-sm rounded-2xl p-6 lg:p-10 lg:max-w-3xl lg:mx-auto border border-emerald-100/50"
          >
            <div className="text-center">
              <div className="text-2xl lg:text-5xl font-bold text-emerald-600 mb-1 lg:mb-2">
                {hero?.stats?.yearsOfImpact?.value}
              </div>
              <div className="text-[10px] lg:text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {hero?.stats?.yearsOfImpact?.label}
              </div>
            </div>
            <div className="text-center border-x border-emerald-100">
              <div className="text-2xl lg:text-5xl font-bold text-emerald-600 mb-1 lg:mb-2">
                {hero?.stats?.livesChanged?.value}
              </div>
              <div className="text-[10px] lg:text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {hero?.stats?.livesChanged?.label}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-5xl font-bold text-emerald-600 mb-1 lg:mb-2">
                {hero?.stats?.states?.value}
              </div>
              <div className="text-[10px] lg:text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {hero?.stats?.states?.label}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center"
          >
            <a
              href="/donate"
              className="group w-full lg:w-auto lg:px-12 bg-emerald-600 text-white hover:bg-emerald-700 py-4 lg:py-5 text-lg lg:text-xl font-bold shadow-lg shadow-emerald-200 hover:shadow-xl transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 rounded-xl"
            >
              {hero?.ctaText || "Donate Now"}
              <ArrowRight className="h-5 w-5 lg:h-6 lg:w-6 transition-transform group-hover:translate-x-1" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* our story */}
      <section className="px-5 py-12 lg:px-8 lg:py-20 bg-white">
        <div className="max-w-md mx-auto lg:max-w-7xl space-y-8 lg:space-y-12">
          <div className="text-center space-y-2 lg:space-y-4">
            <h2 className="text-2xl lg:text-4xl font-bold text-gray-900">
              {story?.title}
            </h2>
            <p className="text-gray-600 lg:text-lg lg:max-w-2xl lg:mx-auto">
              {story?.subtitle}
            </p>
          </div>

          {/* Tabs */}
          <div>
            <div className="flex h-12 lg:h-16 items-center justify-center rounded-xl bg-gray-100 p-1.5 text-gray-600 gap-1 lg:max-w-3xl lg:mx-auto">
              {availableTabs?.map((tab, idx) => (
                <button
                  key={tab?.value || idx}
                  className={`relative flex-1 rounded-lg px-6 py-2 lg:px-10 lg:py-3 text-sm lg:text-base font-semibold transition-all duration-300 ${activeTab === tab.value
                    ? "text-emerald-700"
                    : "hover:bg-gray-200/50 text-gray-500 hover:text-gray-900"
                    }`}
                  onClick={() => setActiveTab(tab.value)}
                >
                  {activeTab === tab.value && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 lg:mt-12">
                {activeTab === "journey" && (
                  <StorySection items={story?.journey} icons={JOURNEY_ICONS} />
                )}
                {activeTab === "impact" && (
                  <StorySection items={story?.impact} icons={IMPACT_ICONS} />
                )}
                {activeTab === "future" && (
                  <StorySection items={story?.future} icons={FUTURE_ICONS} />
                )}
            </div>
          </div>
        </div>
      </section>

      {/* Our Objectives */}
      <section className="bg-emerald-50/40 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-20 lg:py-32 space-y-16">
          <div className="text-center space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 font-medium text-sm border border-emerald-100/50"
            >
              <Users className="w-4 h-4" />
              <span>Our Vision & Mission</span>
            </motion.div>

            <h2 className="text-3xl lg:text-5xl font-serif font-bold text-slate-900 leading-tight">
              Our Objectives
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium tracking-tight">
              INDIA&apos;S LARGEST MUSLIM ORGANISATION
            </p>
          </div>

          <div className="w-full mx-auto space-y-6 lg:space-y-8">
            {objectivesToRender.length > 0 ? (
              objectivesToRender.map((objectiveText, idx) => (
                <motion.div
                  key={`${idx}-${objectiveText.slice(0, 20)}`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group flex items-start gap-5 lg:gap-8 bg-white/50 backdrop-blur-sm p-6 lg:p-10 rounded-[2.5rem] border border-emerald-100/50 hover:bg-white hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300"
                >
                  <span className="w-10 h-10 lg:w-16 lg:h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg lg:text-3xl shadow-lg shadow-emerald-200 flex-shrink-0 group-hover:scale-110 transition-transform">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <p className="text-slate-600 lg:text-xl leading-relaxed group-hover:text-slate-900 transition-colors pt-1 lg:pt-3">
                    {objectiveText}
                  </p>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-slate-400 italic">No objectives defined yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 py-20 lg:py-32 space-y-16">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-6">
          <div className="space-y-4 text-left">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
              {leadership?.title || "Leadership"}
            </h2>
            <p className="text-slate-500 text-lg">
              {leadership?.subtitle || "Meet the dedicated individuals guiding our mission forward."}
            </p>
          </div>

        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {(leadership?.members?.length > 0 ? leadership.members : LEADERSHIP_DATA).map((member, idx) => {
            const isApiData = !!member.description;
            const bgColor = isApiData ? getColorClasses(member.color).bg : member.color;
            const textColor = isApiData ? getColorClasses(member.color).text : member.textColor;
            const bioText = isApiData ? member.description : member.bio;
            const displayInitials = member.initials || (member.name ? member.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "");

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group space-y-6 text-center"
              >
                <div className="relative mx-auto w-32 h-32 lg:w-40 lg:h-40">
                  <div className="absolute inset-0 bg-emerald-100 rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className={`relative w-full h-full ${bgColor} rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden`}>
                    <span className={`text-2xl lg:text-3xl font-bold ${textColor}`}>
                      {displayInitials}
                    </span>
                    {member.image && (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-xl text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-emerald-600 font-medium text-sm">
                      {member.role}
                    </p>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed px-4">
                    {bioText}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Financial Transparency Section */}
      <section className="max-w-4xl px-5 lg:px-8 py-16 lg:py-24 lg:max-w-7xl mx-auto w-full">
        <div className="relative bg-[#0F172A] rounded-[2.5rem] overflow-hidden p-8 lg:p-16 text-white flex flex-col lg:flex-row gap-16 items-center shadow-2xl">
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-emerald-500 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 lg:w-1/2 space-y-8 order-2 lg:order-none">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 font-medium text-xs border border-emerald-400/20">
              <PieChart className="w-4 h-4" />
              <span>{financial?.tagline || "Financial Transparency"}</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
              {financial?.title || "Your Trust is Our Amanah"}
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              {financial?.description || "We believe in complete transparency. Every year, we publish detailed reports so you can see exactly how your contributions are making a difference. We maintain low administrative costs to maximize impact."}
            </p>
            <div className="flex flex-wrap gap-4 pt-4 w-full">
              <a
                href={financial?.button1?.pdfUrl || "#"}
                onClick={(e) => handleDownload(e, financial?.button1?.pdfUrl, financial?.button1?.label || "2023 Annual Report")}
                className="w-full lg:w-auto justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20 active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {financial?.button1?.label || "2023 Annual Report"}
              </a>
            </div>
          </div>

          <div className="relative z-10 lg:w-1/2 w-full order-1 lg:order-none">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-10 space-y-10 shadow-2xl">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    TOTAL REVENUE
                  </p>
                  <p className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                    {financial?.totalRevenue || "$2.4 Million"}
                  </p>
                </div>
                <div className="bg-emerald-500/20 p-2 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
              </div>

              <div className="space-y-8">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  ALLOCATION OF FUNDS
                </p>
                <div className="space-y-6">
                  {[
                    { label: "Program Services", val: financial?.programServices ?? 88, color: "bg-emerald-500" },
                    { label: "Fundraising", val: financial?.fundraising ?? 8, color: "bg-blue-400" },
                    { label: "Administration", val: financial?.administration ?? 4, color: "bg-slate-400" },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-slate-300">{item.label}</span>
                        <span className="text-white font-bold">{item.val}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.val}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: idx * 0.2 }}
                          className={`h-full ${item.color} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 text-[10px] text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" />
                {financial?.footerText || "Audited by independent third-party firms annually."}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacing for Footer */}
      <div className="h-20 lg:h-32" />
    </div>
  );
};

export default AboutClient;

