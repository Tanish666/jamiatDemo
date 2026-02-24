"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Heart,
  Users,
  GraduationCap,
  Globe,
  UserPlus,
  ChevronDown,
  ArrowRight,
  Calendar,
} from "lucide-react";

const ICON_MAP = {
  GraduationCap,
  Heart,
  Users,
  Calendar,
};

export const VolunteerPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    interest: "Event Organization",
    message: "",
    newsletter: false,
  });
  const [loading, setLoading] = useState(false);
  const [opportunities, setOpportunities] = useState([]);
  const [oppLoading, setOppLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchOpportunities() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/volunteer-positions`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Failed to fetch opportunities");
        const data = await res.json();
        setOpportunities(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
        }
      } finally {
        setOppLoading(false);
      }
    }

    fetchOpportunities();
    return () => controller.abort();
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulating API call
    setTimeout(() => {
      toast.success("Registration successful! We'll be in touch soon.");
      setLoading(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        interest: "Event Organization",
        message: "",
        newsletter: false,
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFC] pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header/Hero Section */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            Community Service
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#064E3B] font-bold leading-tight">
            Give Your Time for a Greater Cause
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Join our dedicated team of volunteers and help us make a lasting impact. Your skills and time are the most valuable donation you can give.
          </p>
        </div>

        {/* Main Content: Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left Column: Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-3">
                <div className="bg-emerald-50 p-2 rounded-lg">
                  <UserPlus className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Volunteer Registration</h2>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="e.g. Yusuf"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none "
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="e.g. Khan"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="yusuf@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Skills & Expertise</label>
                  <div className="relative">
                    <select
                      name="interest"
                      value={formData.interest}
                      onChange={handleChange}
                      className="w-full appearance-none px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-gray-700"
                    >
                      <option>Event Organization</option>
                      <option>Teaching & Education</option>
                      <option>Community Outreach</option>
                      <option>Medical Support</option>
                      <option>Administrative Tasks</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Why do you want to volunteer?</label>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Tell us a little about yourself..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none resize-none placeholder:text-gray-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-[#10B981] to-[#34D399] text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? "Registering..." : "Sign Up to Volunteer"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Why Volunteer & Opportunities */}
          <div className="lg:col-span-5 space-y-10">

            {/* Current Volunteer Opportunities */}
            <div className="bg-[#ECFDF5] rounded-3xl p-8 space-y-6">
              <h2 className="text-2xl font-serif text-[#064E3B] font-bold">Current Opportunities</h2>

              <div className="space-y-6">
                {oppLoading ? (
                  <div className="text-emerald-800/60 animate-pulse py-4">
                    Loading opportunities...
                  </div>
                ) : opportunities.length === 0 ? (
                  <div className="text-emerald-800/60 py-4">
                    No active opportunities at the moment.
                  </div>
                ) : (
                  opportunities.map((opportunity, idx) => {
                    const Icon = ICON_MAP[opportunity.icon] || GraduationCap;
                    return (
                      <div key={opportunity._id || idx} className="flex gap-4 group">
                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <Icon className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-[#064E3B]">{opportunity.title}</h3>
                          </div>
                          <p className="text-emerald-800/70 text-sm leading-snug">
                            {opportunity.description}
                          </p>
                          {opportunity.commitment && (
                            <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded">
                              {opportunity.commitment}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Other Ways to Help Card */}
            <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-[0_8px_30px_rgb(16,185,129,0.05)] space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 p-2 rounded-lg">
                  <Heart className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-serif text-[#064E3B] font-bold">Other Ways to Help</h2>
              </div>

              <p className="text-gray-600 leading-relaxed">
                Can't volunteer your time right now? You can still make a significant difference in our community by supporting our initiatives financially.
              </p>

              <Link
                href="/donate"
                className="inline-flex items-center justify-center gap-2 w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 group"
              >
                Make a Donation
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>



          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerPage;
