"use client";

import { useState, useEffect } from "react";
import { Heart, Users, Calendar, ArrowRight, Play, Star, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "700"], // choose weights you want
});
const ICONS = { Calendar, Users, Heart };

function lightenHexColor(hex, percent = 0.2) {
    if (!hex) return "#e5e5e5"; // fallback gray
    hex = hex.replace(/^#/, "");
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    r = Math.round(r + (255 - r) * percent);
    g = Math.round(g + (255 - g) * percent);
    b = Math.round(b + (255 - b) * percent);
    return `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// 🔹 Skeleton Component
function SkeletonBox({ className }) {
    return (
        <div className={clsx("animate-pulse bg-gray-100 rounded-md", className)} />
    );
}

export default function HomePageHeroSection({ hero }) {
    const isLoading = !hero;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const sliderImages = hero?.heroImages || [
        "/donate.jpg",
        "https://res.cloudinary.com/doxoxzz02/image/upload/v1755268342/Zakath_Fund_zsrpnx.jpg",
        "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop",
    ];

    useEffect(() => {
        if (isLoading || sliderImages.length <= 1 || isPaused) return;

        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % sliderImages.length);
        }, 3000);

        return () => clearInterval(timer);
    }, [isLoading, sliderImages.length, isPaused]);

    const nextSlide = () => setCurrentImageIndex((prev) => (prev + 1) % sliderImages.length);
    const prevSlide = () => setCurrentImageIndex((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);

    return (
        <section className="relative bg-white">
            <div className="relative">
                {/* Top CTA */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-28 pb-12 lg:pb-24 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
                    {/* Left Content */}
                    <div className="w-full lg:w-1/2 space-y-8 lg:pt-4 ">
                        {isLoading ? (
                            <div className="space-y-6">
                                <SkeletonBox className="h-8 w-48 rounded-full" />
                                <SkeletonBox className="h-16 w-full" />
                                <SkeletonBox className="h-24 w-full mt-4" />
                                <div className="flex gap-4">
                                    <SkeletonBox className="h-14 w-40 rounded-xl" />
                                    <SkeletonBox className="h-14 w-40 rounded-xl" />
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Badge */}
                                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-semibold border border-emerald-100 animate-fade-in">

                                    <span>{hero.pill || "Supporting Families Since 1919"}</span>
                                </div>

                                {/* Heading */}
                                <h1 className={`${playfair.className} text-4xl lg:text-6xl xl:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight`}>
                                    {hero.title || "Empowering the Ummah, Building the Future"}
                                </h1>

                                {/* Subtitle */}
                                <p className="text-slate-600 text-lg lg:text-xl leading-relaxed max-w-xl">
                                    {hero.subtitle || "Join us in making a lasting impact. Your contributions support education, healthcare, and sustainable development for communities in need around the globe."}
                                </p>

                                {/* CTA Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                    <Link
                                        href="/donate"
                                        className="bg-emerald-900 text-white px-8 py-4 text-lg font-bold shadow-xl shadow-emerald-900/20 hover:bg-emerald-800 transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 rounded-xl border-2 border-emerald-900"
                                    >
                                        <Heart className="size-5 fill-current" />
                                        {hero?.ctaText || "Donate Now"}
                                    </Link>
                                    <Link
                                        href={`${hero?.secondaryCTA?.link}`}
                                        className="bg-white text-slate-800 px-8 py-4 text-lg font-semibold 
                                        hover:bg-slate-50 transition-all duration-300 
                                        active:scale-[0.98] 
                                        flex items-center justify-center gap-3 
                                        rounded-xl border border-slate-200 
                                        shadow-2xl hover:shadow-md"
                                    >
                                        <Play className="size-5 fill-emerald-600 text-emerald-600" />
                                        {hero?.secondaryCTA.text || "See Our Impact"}
                                    </Link>
                                </div>

                                {/* Social Proof */}
                                <div className="flex items-center gap-5 pt-6 border-t border-slate-100">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="size-11 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm">
                                                <img
                                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + 42}`}
                                                    alt="donor"
                                                    className="size-full object-cover"
                                                />
                                            </div>
                                        ))}
                                        <div className="size-11 rounded-full border-2 border-white bg-emerald-50 flex items-center justify-center text-xs font-bold text-emerald-700 shadow-sm">
                                            +2k
                                        </div>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-bold text-slate-900">
                                            Trusted by 2,500+ Donors
                                        </p>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Container */}
                    <div className="w-full lg:w-[40%] relative lg:mb-14">
                        {/* Decorative Background Elements */}
                        <div className="absolute -inset-10 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

                        {/* Main Container for Image */}
                        <div className="relative group">
                            <div className="absolute -inset-2  rounded-[2.5rem]  opacity-0 group-hover:opacity-100 transition duration-700"></div>

                            {isLoading ? (
                                <div className="relative aspect-square w-full rounded-[2.5rem] overflow-hidden">
                                    <SkeletonBox className="w-full h-full" />
                                </div>
                            ) : (
                                <>
                                    <div className="relative aspect-square w-full  overflow-hidden  transition-all duration-500 ">
                                        {/* This is the div where the user can put their image */}
                                        <div
                                            id="hero-image-container"
                                            className="w-full h-full relative overflow-hidden flex items-center justify-center bg-slate-100 rounded-2xl group/slider"
                                            onMouseEnter={() => setIsPaused(true)}
                                            onMouseLeave={() => setIsPaused(false)}
                                        >
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={currentImageIndex}
                                                    initial={{ x: 300, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    exit={{ x: -300, opacity: 0 }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 260,
                                                        damping: 20
                                                    }}
                                                    className="absolute inset-0 w-full h-full"
                                                >
                                                    <img
                                                        src={sliderImages[currentImageIndex]}
                                                        alt={`Hero slide ${currentImageIndex + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </motion.div>
                                            </AnimatePresence>

                                            {/* Navigation Arrows */}
                                            <button
                                                onClick={(e) => { e.preventDefault(); prevSlide(); }}
                                                className="absolute left-4 z-10 p-2 rounded-full bg-white/20 backdrop-blur-md text-white opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-white/40"
                                            >
                                                <ChevronLeft className="size-6" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.preventDefault(); nextSlide(); }}
                                                className="absolute right-4 z-10 p-2 rounded-full bg-white/20 backdrop-blur-md text-white opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-white/40"
                                            >
                                                <ChevronRight className="size-6" />
                                            </button>

                                            {/* Progress bars/dots */}
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                                                {sliderImages.map((_, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setCurrentImageIndex(idx)}
                                                        className={clsx(
                                                            "h-1.5 rounded-full transition-all duration-300",
                                                            currentImageIndex === idx
                                                                ? "w-8 bg-emerald-500"
                                                                : "w-2 bg-white/50 hover:bg-white/80"
                                                        )}
                                                        aria-label={`Go to slide ${idx + 1}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Overlay for that extra premium feel (optional, but looks good in image) */}
                                        <div className="absolute inset-0  via-transparent to-transparent pointer-events-none"></div>
                                    </div>

                                    {/* Floating Card Detail (Optional, like in the image) */}
                                    <div className="absolute -bottom-6 -left-20 bg-white p-5 rounded-2xl shadow-2xl shadow-emerald-950/10 border-2 border-emerald-50/50 hidden sm:block animate-bounce-slow bg-gray-600">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                                <Heart className="size-5 text-emerald-600 fill-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Recent Donation</p>
                                                <p className="text-sm font-bold text-slate-900">₹5,000 for Water Project</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                {/* Stats */}
                <div className="px-4 sm:px-6 lg:px-8 py-24 bg-[#06422d] lg:py-32">
                    <div className="max-w-7xl mx-auto space-y-16 lg:space-y-24">
                        {/* Stats Section */}
                        <div className="grid grid-cols-3 gap-4 lg:gap-12">
                            {isLoading
                                ? Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="text-center space-y-2">
                                        <SkeletonBox className="h-8 w-16 mx-auto bg-white/10" />
                                        <SkeletonBox className="h-4 w-20 mx-auto bg-white/5" />
                                    </div>
                                ))
                                : Object.values(hero.stats || {}).map((stat, i) => (
                                    <div
                                        key={stat.label}
                                        className={`text-center${i === 1 ? " border-x border-white/10" : ""
                                            }`}
                                    >
                                        <div className="text-3xl font-bold text-white sm:text-5xl mb-2">
                                            {stat.value}
                                        </div>
                                        <div className="text-xs text-emerald-100/70 font-medium sm:text-base tracking-wide uppercase">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                        </div>

                        {/* Impact Cards */}
                        {/* <div className="grid sm:grid-cols-3 gap-6 lg:gap-10">
                            {isLoading
                                ? Array.from({ length: 3 }).map((_, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-3xl bg-white/5 p-8 flex flex-col items-center gap-5"
                                    >
                                        <SkeletonBox className="w-20 h-20 rounded-full bg-white/10" />
                                        <div className="space-y-3 w-full flex flex-col items-center">
                                            <SkeletonBox className="h-6 w-1/2 bg-white/10" />
                                            <SkeletonBox className="h-4 w-full bg-white/5" />
                                            <SkeletonBox className="h-4 w-3/4 bg-white/5" />
                                        </div>
                                    </div>
                                ))
                                : hero?.cards?.map((card, idx) => {
                                    const Icon = ICONS[card.icon] || Heart;
                                    return (
                                        <div
                                            key={idx}
                                            className="bg-white rounded-[2rem] p-10 lg:p-14 flex flex-col items-center text-center shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
                                        >
                                            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-[#f0fdf4] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                                                <Icon className="h-8 w-8 lg:h-10 lg:w-10 text-[#06422d]" />
                                            </div>
                                            <div className="space-y-4">
                                                <h3 className="text-xl lg:text-2xl font-bold text-[#06422d] tracking-tight">
                                                    {card.title}
                                                </h3>
                                                <p className="text-slate-600 leading-relaxed text-sm lg:text-base">
                                                    {card.description}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div> */}

                        <div className="grid sm:grid-cols-3 gap-6 lg:gap-8">
                            {/* Card 1: About Us */}
                            <div className="bg-[#fdf8f0] rounded-[2rem] p-8 lg:p-9 flex flex-col h-full shadow-xl transition-all duration-500 hover:-translate-y-2">
                                <div className="mb-4">
                                    <span className="bg-emerald-100 text-emerald-900 font-bold text-xs tracking-[0.3em] uppercase px-4 py-2 rounded-full inline-block">About Us</span>
                                </div>
                                <h2 className={`${playfair.className} text-3xl lg:text-4xl font-bold text-[#06422d] leading-tight mb-5`}>
                                    A Century of Commitment
                                </h2>
                                <p className="text-slate-600 leading-relaxed text-sm lg:text-base">
                                    Jamiat Ulama-i-Hind stands commited to protecting
                                    Muslim rights, upholding secularism, and preserving
                                    constitutional values-advocating tirelessly for
                                    justice, harmony, and national unity across every
                                    corner of India.
                                </p>
                            </div>

                            {/* Card 2: Our Purpose */}
                            <div className="bg-[#fdf8f0] rounded-[2rem] p-8 lg:p-9 flex flex-col h-full shadow-xl transition-all duration-500 hover:-translate-y-2">
                                <div className="mb-4">
                                    <span className="bg-emerald-100 text-emerald-900 font-bold text-xs tracking-[0.3em] uppercase px-4 py-2 rounded-full inline-block">Our Purpose</span>
                                </div>
                                <h2 className={`${playfair.className} text-3xl lg:text-4xl font-bold text-[#06422d] leading-tight mb-6`}>
                                    Vision & Mission
                                </h2>
                                <div className="space-y-4 flex-grow">
                                    {/* Small Vision & Mission Items */}
                                    <div className="flex gap-4">
                                        <div className="mt-1">
                                            <Star className="size-5 text-emerald-600 fill-emerald-600/10" />
                                        </div>
                                        <div>
                                            <h3 className="text-emerald-900 font-bold text-sm uppercase tracking-wider mb-1">Our Vision</h3>
                                            <p className="text-slate-600 text-sm lg:text-base leading-relaxed">
                                                To guide Muslimsin all aspects oflife in
                                                accordance with the teachings of Islam, and to
                                                spiritually awaken them to fulfil their role as the
                                                best community.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="mt-1">
                                            <Sparkles className="size-5 text-emerald-600 fill-emerald-600/10" />
                                        </div>
                                        <div>
                                            <h3 className="text-emerald-900 font-bold text-sm uppercase tracking-wider mb-1">Our Mission</h3>
                                            <p className="text-slate-600 text-sm lg:text-base leading-relaxed">
                                                To play an efective role as a community in the
                                                construction and development of our country
                                                through constructive programs in education, social
                                                upliftment, justice, and economic empowerment
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card 3: National Leadership */}
                            <div className="bg-[#fdf8f0] rounded-[2rem] p-8 lg:p-9 flex flex-col items-center text-center h-full shadow-xl transition-all duration-500 hover:-translate-y-2">
                                <div className="mb-6">
                                    <span className="bg-emerald-100 text-emerald-900 font-bold text-xs  tracking-[0.3em] uppercase px-4 py-2 rounded-full inline-block">National Leadership</span>
                                </div>

                                <div className="relative mb-6">
                                    <div className="w-24 h-24 rounded-full bg-[#06422d] p-0.5 shadow-xl">
                                        <div className="w-full h-full rounded-full border border-amber-400/30 flex items-center justify-center bg-emerald-900/50 overflow-hidden">
                                            <Users className="size-10 text-amber-400/80" />
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-amber-400 p-1.5 rounded-full shadow-lg">
                                        <Sparkles className="size-3.5 text-[#06422d]" />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h2 className={`${playfair.className} text-xl lg:text-2xl font-bold text-[#06422d] mb-1`}>
                                        Maulana Mahmood As'ad Madani
                                    </h2>
                                    <span className="text-emerald-700 font-bold text-[10px] tracking-[0.2em] uppercase">
                                        National President
                                    </span>
                                </div>

                                <div className="mt-auto w-full">
                                    <div className="border-l-2 border-amber-400 pl-4 text-left">
                                        <p className="text-slate-600 italic text-sm lg:text-base leading-relaxed">
                                            "Our mission is not just to serve the communityit is to build a nation where every citizen,
                                            regardless of faith, lives with dignity, justice, and
                                            equal rights."
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}