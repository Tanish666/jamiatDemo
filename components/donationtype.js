"use client";

import React, { useEffect, useState } from "react";
import { Heart, Gift, Coins, Target, HelpCircle } from "lucide-react";
import { Playfair_Display } from "next/font/google";
import Link from "next/link";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const categoryConfig = {
  hadiya: {
    icon: Heart,
    title: "General Donation",
    description: "Support our overall mission and let us allocate funds where they're needed most",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    buttonColor: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200",
    query: "general"
  },
  zakat: {
    icon: Gift,
    title: "Zakat",
    description: "Fulfill your Islamic obligation of Zakat through our verified and transparent programs",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    buttonColor: "bg-blue-600 hover:bg-blue-700 shadow-blue-200",
    query: "zakat"
  },
  sadqa: {
    icon: Coins,
    title: "Sadqa",
    description: "Give voluntary charity (Sadqa) to earn rewards and help those in need",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    buttonColor: "bg-amber-600 hover:bg-amber-700 shadow-amber-200",
    query: "sadqa"
  },
  "others(general donations & interest income)": {
    icon: Target,
    title: "Others",
    description: "(general donations & interest income) - Support our missions and let us allocate funds where they're needed most",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    buttonColor: "bg-purple-600 hover:bg-purple-700 shadow-purple-200",
    query: "interest_earnings"
  }
};

export default function MobileDonationCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDonationTypes() {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/donation-types`);
        const data = await res.json();

        // Map API response to UI configuration
        const mappedCategories = data
          .map(item => {
            const lowerType = item.type.toLowerCase();
            const config = categoryConfig[lowerType] || categoryConfig[item.type] || {
              icon: HelpCircle,
              description: "Make a positive impact with your contribution",
              color: "text-slate-600",
              bgColor: "bg-slate-50",
              buttonColor: "bg-slate-600 hover:bg-slate-700",
              query: "general"
            };

            // Custom title handling for the long "others" string
            const displayTitle = item.type === "others(general donations & interest income)" 
              ? "Others" 
              : item.type;

            return {
              ...config,
              title: displayTitle,
              id: item.type
            };
          });

        setCategories(mappedCategories);
      } catch (error) {
        console.error("Failed to fetch donation types:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDonationTypes();
  }, []);

  if (loading) return null; // Or a skeleton loader if preferred
  if (categories.length === 0) return null; // Hide section if no enabled categories

  return (
    <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-[#F1F5F9] overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Heading */}
        <div className="mb-12 sm:mb-20 text-center">
          <h2 className={`${playfair.className} text-4xl font-bold text-slate-900 mb-4 sm:text-6xl tracking-tight`}>
            Choose Your Donation Types
          </h2>
          <p className="text-base text-slate-600 sm:text-xl sm:max-w-2xl sm:mx-auto">
            Select the category that aligns with your intention and Islamic principles
          </p>
          <div className="h-1.5 w-20 bg-emerald-500 mt-6 mx-auto rounded-full"></div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className="group relative bg-white border border-slate-100 rounded-[2rem] p-8 lg:p-10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
            >
              {/* Accented Corner Decor */}
              <div className={`absolute top-0 right-0 w-24 h-24 ${category.bgColor} opacity-20 rounded-bl-[4rem] rounded-tr-[2rem] -z-0 transition-all duration-500 group-hover:scale-110`}></div>

              {/* Card Header */}
              <div className="relative z-10 text-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                  <category.icon className={`h-10 w-10 ${category.color}`} />
                </div>
                <h3 className="text-xl text-slate-900 font-bold mb-3 tracking-tight">
                  {category.title}
                </h3>
              </div>

              {/* Card Content */}
              <div className="relative z-10 text-center flex flex-col flex-grow">
                <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-grow">
                  {category.description}
                </p>
                <Link
                  href={{
                    pathname: "/projects",
                    query: {
                      title: category.query
                    },
                  }}
                  className={`w-full inline-flex items-center justify-center px-6 py-4 text-white rounded-xl text-sm font-bold shadow-lg transition-all duration-300 active:scale-[0.98] ${category.buttonColor}`}
                >
                  Donate Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

