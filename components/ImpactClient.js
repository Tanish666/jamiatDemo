"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  // General & Basic
  Heart, Star, Home, Book, BookOpen, GraduationCap, School, Award, Trophy, Medal, Target, Shield, ShieldCheck, Lock, Unlock, Key, Lightbulb, Zap, Flame, Sparkles, Gem, Search, Scan, Focus, Eye, EyeOff,
  // People & Community
  Users, User, UserCheck, Baby, HandHeart, Handshake, HeartHandshake, Smile, Frown, ThumbsUp, ThumbsDown,
  // Health & Medical
  Hospital, Stethoscope, Pill, Syringe, Activity, HeartPulse, Microscope, TestTube, Atom, Dna, Brain,
  // Buildings & Finance
  Building, Building2, Church, Landmark, Briefcase, Wallet, Banknote, Coins, PiggyBank, TrendingUp, BarChart3, PieChart, LineChart,
  // Food, Nature & Weather
  Apple, Utensils, CookingPot, Wheat, Droplets, Droplet, Trees, TreePine, Leaf, Sprout, Flower2, Sun, Moon, Cloud, CloudRain, CloudSun, Umbrella, Wind, Snowflake, Mountain, Waves, Fish, Bird, PawPrint,
  // Travel & Navigation
  Globe, Globe2, Map, MapPin, Compass, Navigation, Car, Bus, Train, Plane, Ship, Bike, Tent, Backpack, Flag, Rocket,
  // Communication & Tech
  Phone, Mail, MessageCircle, Send, Bell, Megaphone, Laptop, Monitor, Smartphone, Wifi, Signal, Bluetooth, Share2, Link as LucideLink, ExternalLink,
  // Creative & Media
  Music, Palette, Paintbrush, Camera, Film, Mic,
  // Tools & E-commerce
  Wrench, Hammer, Settings, Cog, CircleDot, Package, Gift, ShoppingBag, ShoppingCart, Store,
  // Files & Management
  FileText, File, FolderOpen, ClipboardList, Newspaper, Calendar, Clock, Timer, Hourglass, AlarmClock, ScrollText, BookMarked, LayoutGrid, Grid3X3, List, Rows3, Columns3,
  // Misc & Utilities
  ArrowRight, ArrowUp, CheckCircle, XCircle, AlertCircle, Info, Download, Upload, Recycle, RefreshCw, RotateCcw, Repeat, Infinity, Cross, Scale, Gavel, Crown,
  // Existing/Additional
  Calculator, Quote, ChevronRight
} from "lucide-react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const ICON_MAP = {
  // General & Basic
  Heart, Star, Home, Book, BookOpen, GraduationCap, School, Award, Trophy, Medal, Target, Shield, ShieldCheck, Lock, Unlock, Key, Lightbulb, Zap, Flame, Sparkles, Gem, Search, Scan, Focus, Eye, EyeOff,
  // People & Community
  Users, User, UserCheck, Baby, HandHeart, Handshake, HeartHandshake, Smile, Frown, ThumbsUp, ThumbsDown,
  // Health & Medical
  Hospital, Stethoscope, Pill, Syringe, Activity, HeartPulse, Microscope, TestTube, Atom, Dna, Brain,
  // Buildings & Finance
  Building, Building2, Church, Landmark, Briefcase, Wallet, Banknote, Coins, PiggyBank, TrendingUp, BarChart3, PieChart, LineChart,
  // Food, Nature & Weather
  Apple, Utensils, CookingPot, Wheat, Droplets, Droplet, Trees, TreePine, Leaf, Sprout, Flower2, Sun, Moon, Cloud, CloudRain, CloudSun, Umbrella, Wind, Snowflake, Mountain, Waves, Fish, Bird, PawPrint,
  // Travel & Navigation
  Globe, Globe2, Map, MapPin, Compass, Navigation, Car, Bus, Train, Plane, Ship, Bike, Tent, Backpack, Flag, Rocket,
  // Communication & Tech
  Phone, Mail, MessageCircle, Send, Bell, Megaphone, Laptop, Monitor, Smartphone, Wifi, Signal, Bluetooth, Share2, Link: LucideLink, ExternalLink,
  // Creative & Media
  Music, Palette, Paintbrush, Camera, Film, Mic,
  // Tools & E-commerce
  Wrench, Hammer, Settings, Cog, CircleDot, Package, Gift, ShoppingBag, ShoppingCart, Store,
  // Files & Management
  FileText, File, FolderOpen, ClipboardList, Newspaper, Calendar, Clock, Timer, Hourglass, AlarmClock, ScrollText, BookMarked, LayoutGrid, Grid3X3, List, Rows3, Columns3,
  // Misc & Utilities
  ArrowRight, ArrowUp, CheckCircle, XCircle, AlertCircle, Info, Download, Upload, Recycle, RefreshCw, RotateCcw, Repeat, Infinity, Cross, Scale, Gavel, Crown,
  // Existing/Additional
  Calculator, Quote, ChevronRight,

  // Semantic Aliases & Fallbacks
  education: GraduationCap,
  school: School,
  healthcare: Hospital,
  health: HeartPulse,
  women: Users,
  social: Heart,
  economic: Calculator,
  livelihood: Briefcase,
  water: Droplets,
  infrastructure: Building,
  legal: Scale,
  environment: Sprout,
  children: Baby,
  disaster: CloudRain,
  electricity: Zap,
};

const Impact = () => {
  const [hero, setHero] = useState(null);
  const [loadingHero, setLoadingHero] = useState(true);
  const [stories, setStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [tabContent, setTabContent] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [showAllStories, setShowAllStories] = useState(false);
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    async function fetchContent() {
      try {
        const [heroRes, storiesRes, categoriesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/impactherosection`, {
            cache: "force-cache",
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/impact-stories`, {
            cache: "force-cache",
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/impactcategories`, {
            cache: "force-cache",
          }),
        ]);

        const [heroData, storiesData, categoriesData] = await Promise.all([
          heroRes.json(),
          storiesRes.json(),
          categoriesRes.json(),
        ]);

        setHero(heroData);
        setStories(storiesData);
        setTabContent(categoriesData);
      } catch (err) {
        console.error("Failed to fetch impact data:", err);
      } finally {
        setLoadingHero(false);
        setLoadingStories(false);
        setLoadingCategories(false);
      }
    }

    fetchContent();
  }, []);

  useEffect(() => {
    if (tabContent?.categories?.length > 0 && !activeTab) {
      setActiveTab(tabContent.categories[0].key);
    }
  }, [tabContent, activeTab]);

  const visibleStories = showAllStories ? stories : stories.slice(0, 3);

  if (loadingHero || loadingStories || loadingCategories) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const statsList = [
    {
      icon: <Users className="w-6 h-6 text-emerald-600" />,
      value: hero?.stats?.livesChanged?.value || "0",
      label: hero?.stats?.livesChanged?.label || "Lives Touched",
      description: "Direct beneficiaries of our social welfare programs."
    },
    {
      icon: <Globe className="w-6 h-6 text-emerald-600" />,
      value: hero?.stats?.states?.value || "0",
      label: hero?.stats?.states?.label || "States Covered",
      description: "Expansion across regions to reach those in need."
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-emerald-600" />,
      value: hero?.stats?.projects?.value || "0",
      label: hero?.stats?.projects?.label || "Active Projects",
      description: "Ongoing initiatives driving sustainable change."
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-[#ECFDF5] py-20 lg:py-32 flex flex-col items-center px-4 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[60%] bg-emerald-100/50 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[60%] bg-emerald-50/50 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl w-full text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm border border-emerald-100 mb-2 transition-transform hover:scale-105 cursor-default">
            <Globe className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-700">Global Reach</span>
          </div>
          <h1 className={`${playfair.className} text-4xl md:text-6xl font-bold text-[#1a2e35] leading-tight tracking-tight px-2`}>
            {hero?.title || "Our Collective Impact"}
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            {hero?.subtitle || "Together, we are transforming lives and building resilient communities. Every donation is a seed of hope."}
          </p>
          <div className="pt-4">
            <Link
              href="/donate"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-10 py-4 rounded-full font-bold shadow-lg hover:shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-[0.98]"
            >
              {hero?.ctaText || "Support Our Mission"}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="bg-white pb-24">
        <div className="max-w-7xl mx-auto w-full -mt-16 lg:-mt-24 relative z-20 px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {statsList.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-[0_15px_50px_-12px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-2 group"
              >
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className={`${playfair.className} text-4xl font-bold text-gray-900 mb-2`}>{stat.value}</div>
                <div className="text-emerald-700 font-bold text-xs tracking-[0.1em] uppercase mb-4">{stat.label}</div>
                <p className="text-gray-500 text-sm leading-relaxed">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact categories section */}
      <section className="px-4 py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className={`${playfair.className} text-4xl lg:text-5xl font-bold text-[#1a2e35]`}>
              {tabContent?.section?.title || "Areas of Impact"}
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
              {tabContent?.section?.subtitle || "Explore how we're making a difference across different areas of social development."}
            </p>
          </div>

          {/* Tab navigation */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {tabContent?.categories?.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveTab(cat.key)}
                className={`px-6 py-3 rounded-full text-sm lg:text-base font-bold transition-all ${activeTab === cat.key
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {cat.title}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="mt-12">
            {tabContent?.categories?.map(
              ({ key, color, title, subtitle, stats, description, link, icon }) =>
                activeTab === key && (
                  <div key={key} className="bg-[#F8FAFC] rounded-[48px] p-8 lg:p-16 border border-gray-100 shadow-sm animate-in fade-in duration-500 max-w-4xl mx-auto">
                    <div className="space-y-8">
                      <div className="flex items-center gap-6">
                        <div className="bg-white w-20 h-20 rounded-[28px] shadow-xl flex items-center justify-center flex-shrink-0 border border-emerald-50">
                          {(() => {
                            // Handle cases where icon might be a path/URL or prefixed string
                            const rawIcon = icon?.split("/")?.pop()?.split(".")?.[0];
                            const cleanIcon = (rawIcon || icon)?.replace("Lucide", "");
                            
                            const IconComponent = ICON_MAP[cleanIcon] || ICON_MAP[icon] || ICON_MAP[key] || GraduationCap;
                            return <IconComponent className="h-10 w-10 text-emerald-600" />;
                          })()}
                        </div>
                        <div>
                          <h3 className={`${playfair.className} text-3xl font-bold text-[#1a2e35]`}>{title}</h3>
                          <p className="text-emerald-600 font-bold text-sm tracking-wider uppercase mt-1">{subtitle}</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {stats?.map((stat, index) => (
                          <div key={index} className="space-y-3">
                            <div className="flex justify-between items-center text-sm lg:text-base">
                              <span className="font-bold text-[#1a2e35]">{stat.label}</span>
                              <span className="font-extrabold text-emerald-600">{stat.value}</span>
                            </div>
                            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-emerald-100/50">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${stat.progress}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                viewport={{ once: true }}
                                className="h-full bg-emerald-600"
                              ></motion.div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-6 border-t border-gray-200">
                        <p className="text-gray-600 text-lg leading-relaxed">{description}</p>
                        {typeof link === "string" && (
                          <Link
                            href={link}
                            className="mt-8 inline-flex items-center gap-2 text-emerald-700 font-bold hover:gap-4 transition-all"
                          >
                            Explore {title.split(" ")[0]} Initiatives
                            <ArrowRight className="h-5 w-5" />
                          </Link>
                        )}
                      </div>
                    </div>

                  </div>
                )
            )}
          </div>
        </div>
      </section>

      {/* Voices of Change Section */}
      {stories.length > 0 && (
        <section className="">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-20 space-y-4">
              <h2 className={`${playfair.className} text-4xl lg:text-5xl font-bold text-[#1a2e35]`}>
                Voices of Change
              </h2>
              <p className="text-gray-500 text-lg max-w-lg mx-auto leading-relaxed">
                Real stories from the people whose lives have been transformed by your generosity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 xl:gap-12">
              {stories.length === 0 ? (
                <div className="col-span-3 text-center text-gray-400 py-12">No stories available.</div>
              ) : (
                visibleStories.map((story, idx) => (
                  <div
                    key={story._id || story.id}
                    className={`p-10 lg:p-12 rounded-[40px] border border-gray-50 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] relative group hover:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.1)] transition-all duration-700 hover:-translate-y-3 ${idx % 2 === 1 ? "bg-white" : "bg-[#ECFDF5]"}`}
                  >
                    <Quote className={`absolute top-10 right-10 size-10 transition-colors duration-500 ${idx % 2 === 1 ? "text-emerald-500" : "text-[#A7F3D0]"}`} />

                    <div className="flex items-center gap-5 mb-10 relative z-10">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xl">
                        {story.initials}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1a2e35] text-lg">{story.name}</h4>
                        <p className="text-emerald-600 text-[11px] font-extrabold tracking-[0.1em] uppercase mt-1">{story.location}</p>
                      </div>
                    </div>

                    <p className={`${playfair.className} text-gray-600 leading-relaxed italic text-xl relative z-10 antialiased`}>
                      "{story.quote}"
                    </p>
                  </div>
                ))
              )}
            </div>

            {stories.length >= 4 && (
              <div className="mt-16 text-center">
                <button
                  onClick={() => setShowAllStories(!showAllStories)}
                  className="inline-flex items-center gap-2 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white px-10 py-4 rounded-full font-bold transition-all"
                >
                  {showAllStories ? "Show Fewer Stories" : "Read More Impact Stories"}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="lg:mx-8  px-4 py-24 lg:py-32 lg:pb-24 ">
        <div className="bg-gradient-to-br from-[#064e3b] to-[#065f46] rounded-[48px] py-16 lg:py-20 px-6 text-center relative overflow-hidden shadow-2xl shadow-emerald-900/20">
          <div className="absolute top-0 right-0 w-[50%] h-full bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_70%)]" />
          <div className="absolute bottom-0 left-0 w-[50%] h-full bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.05),transparent_70%)]" />

          <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
            <h2 className={`${playfair.className} text-3xl md:text-6xl font-bold text-white leading-tight`}>
              Be the Reason Someone Smiles Today
            </h2>
            <p className="text-emerald-100/80 text-lg md:text-xl leading-relaxed">
              Your contribution, no matter the size, has a ripple effect that touches lives across the globe. Join our mission of compassion.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/donate"
                className="w-full sm:w-auto bg-white text-emerald-900 px-12 py-5 rounded-full font-bold hover:shadow-xl hover:scale-105 transition-all active:scale-[0.98]"
              >
                Donate Now
              </Link>
              <Link
                href="/projects"
                className="w-full sm:w-auto bg-transparent border-2 border-white/20 text-white px-12 py-5 rounded-full font-bold hover:bg-white/10 transition-all"
              >
                Explore Projects
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Impact;