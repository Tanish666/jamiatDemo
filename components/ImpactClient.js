"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Droplets,
  GraduationCap,
  Heart,
  Globe,
  ArrowRight,
  Quote,
  MapPin,
  HandCoins
} from "lucide-react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const Impact = () => {
  const [heroData, setHeroData] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [heroRes, storiesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/impactherosection`, { cache: "force-cache" }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/impact-stories`, { cache: "force-cache" }),
        ]);

        const hero = await heroRes.json();
        const storiesData = await storiesRes.json();

        setHeroData(hero);
        setStories(storiesData);
      } catch (err) {
        console.error("Failed to fetch impact data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const stats = [
    {
      icon: <Users className="w-6 h-6 text-emerald-600" />,
      value: "50k+",
      label: "Lives Touched",
      description: "Direct beneficiaries of our social welfare programs."
    },
    {
      icon: <Droplets className="w-6 h-6 text-emerald-600" />,
      value: "120",
      label: "Clean Water Projects",
      description: "Wells and filtration plants installed in arid regions."
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-emerald-600" />,
      value: "8.5k",
      label: "Students Educated",
      description: "Scholarships provided to underprivileged children."
    },
    {
      icon: <HandCoins className="w-6 h-6 text-emerald-600" />,
      value: "$2M+",
      label: "Funds Distributed",
      description: "Total aid delivered directly to those in need."
    }
  ];

  const footprintItems = [
    {
      dotColor: "bg-emerald-500",
      title: "Emergency Relief",
      description: "Currently active in Turkey & Syria"
    },
    {
      dotColor: "bg-blue-500",
      title: "Education Programs",
      description: "Ongoing in Pakistan, India & Bangladesh"
    },
    {
      dotColor: "bg-orange-500",
      title: "Orphan Support",
      description: "Supporting families in Somalia & Yemen"
    }
  ];

  const testimonials = [
    {
      name: "Aisha K.",
      role: "SCHOLARSHIP RECIPIENT",
      quote: "Because of the Jamiat scholarship, I can focus on my medical studies without worrying about tuition. I hope to serve my village as a doctor one day.",
      avatar: "https://res.cloudinary.com/dts36v9yv/image/upload/v1740030588/avatars/female1.jpg"
    },
    {
      name: "Omar F.",
      role: "CLEAN WATER PROJECT",
      quote: "The new well in our community has changed everything. Our children are healthier, and we no longer walk miles just to fetch drinking water.",
      avatar: "https://res.cloudinary.com/dts36v9yv/image/upload/v1740030588/avatars/male1.jpg"
    },
    {
      name: "Fatima Z.",
      role: "MICRO-FINANCE BENEFICIARY",
      quote: "With the small business grant, I started a sewing shop. Now I can provide for my three children with dignity and pride.",
      avatar: "https://res.cloudinary.com/dts36v9yv/image/upload/v1740030588/avatars/female2.jpg"
    }
  ];

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
    </div>
  );

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
            Our Collective Impact
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            Together, we are transforming lives and building resilient communities. Every donation is a seed of hope that grows into lasting change.
          </p>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="bg-white pb-24">
        <div className="max-w-7xl mx-auto w-full -mt-16 lg:-mt-24 relative z-20 px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
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

      {/* Global Footprint Section */}
      <section className="bg-[#F8FAFC]">
        <div className="py-24 lg:py-32 px-4 max-w-7xl mx-auto overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="space-y-10 order-2 lg:order-1">
              <div className="space-y-6">
                <h2 className={`${playfair.className} text-4xl lg:text-5xl font-bold text-[#1a2e35] leading-tight`}>
                  Our Footprint Across the Globe
                </h2>
                <p className="text-gray-500 text-lg max-w-lg leading-relaxed font-medium">
                  From bustling cities to remote villages, Jamiat is on the ground where help is needed most. We currently operate active projects in 14 countries.
                </p>
              </div>

              <div className="space-y-4 max-w-md">
                {footprintItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-5 hover:shadow-xl hover:border-transparent transition-all cursor-default group"
                  >
                    <div className={`w-3.5 h-3.5 rounded-full ${item.dotColor} shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.1)] group-hover:scale-125 transition-transform`} />
                    <div>
                      <h4 className="font-bold text-[#1a2e35] text-base">{item.title}</h4>
                      <p className="text-gray-400 text-sm mt-0.5">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Container */}
            <div className="order-1 lg:order-2 relative">
              <div className="absolute -inset-4 bg-emerald-50/50 rounded-[60px] blur-3xl -z-10" />
              <div className="aspect-[1.2/1] bg-gray-50 rounded-[48px] relative overflow-hidden shadow-2xl border-8 border-white group">
                <div className="absolute inset-0 bg-[#f8f9fa] flex items-center justify-center">
                  <div className="w-full h-full relative">
                    <img
                      src="https://res.cloudinary.com/dts36v9yv/image/upload/v1740031175/map_bg.png"
                      alt="World Map"
                      className="w-full h-full object-cover opacity-60 grayscale brightness-110"
                    />

                    {/* Pulsing Dots on Map */}
                    <div className="absolute top-[35%] left-[60%] flex items-center justify-center">
                      <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping opacity-75" />
                      <div className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                    </div>

                    <div className="absolute top-[55%] left-[68%] flex items-center justify-center">
                      <div className="w-4 h-4 bg-orange-500 rounded-full animate-ping opacity-75" />
                      <div className="absolute w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white shadow-sm" />
                    </div>

                    <div className="absolute top-[50%] left-[82%] flex items-center justify-center">
                      <div className="w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-75" />
                      <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white shadow-sm" />
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-8 right-8 bg-white/95 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/50 text-[10px] font-bold text-gray-500 shadow-xl uppercase tracking-[0.2em] transition-all group-hover:px-8">
                  Interactive Project Map
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voices of Change Section */}
      <section className="py-24 lg:py-32 bg-[#fcfdfd]">
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
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className={`p-12 rounded-[40px] border border-gray-50 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] relative group hover:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.1)] transition-all duration-700 hover:-translate-y-3 ${idx === 1 ? "bg-white" : "bg-[#ECFDF5]"}`}
              >
                <Quote className={`absolute top-10 right-10 size-10  transition-colors duration-500 ${idx === 1 ? "text-emerald-500" : "text-[#A7F3D0]"}`} />

                <div className="flex items-center gap-5 mb-10 relative z-10">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1a2e35] text-lg">{t.name}</h4>
                    <p className="text-emerald-600 text-[11px] font-extrabold tracking-[0.1em] uppercase mt-1">{t.role}</p>
                  </div>
                </div>

                <p className={`${playfair.className} text-gray-600 leading-relaxed italic text-xl relative z-10 antialiased`}>
                  "{t.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="max-w-7xl mx-auto px-4 py-20 lg:py-32">
        <div className="bg-gradient-to-br from-[#064e3b] to-[#065f46] rounded-[48px] p-8 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-emerald-900/20">
          <div className="absolute top-0 right-0 w-[50%] h-full bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_70%)]" />
          <div className="absolute bottom-0 left-0 w-[50%] h-full bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.05),transparent_70%)]" />

          <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
            <h2 className={`${playfair.className} text-3xl md:text-5xl font-bold text-white leading-tight`}>
              Be the Reason Someone Smiles Today
            </h2>
            <p className="text-emerald-100/80 text-lg md:text-xl leading-relaxed">
              Your contribution, no matter the size, has a ripple effect that touches lives across the globe. Join our mission of compassion.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/donate"
                className="w-full sm:w-auto bg-white text-emerald-900 px-10 py-4 rounded-full font-bold hover:shadow-lg hover:bg-gray-50 transition-all active:scale-[0.98]"
              >
                Donate Now
              </Link>
              <Link
                href="/annual-report"
                className="w-full sm:w-auto bg-transparent border-2 border-white/20 text-white px-10 py-4 rounded-full font-bold hover:bg-white/10 transition-all"
              >
                View Annual Report
              </Link>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default Impact;
