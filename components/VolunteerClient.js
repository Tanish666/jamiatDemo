"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Heart,
  Users,
  Globe,
  UserPlus,
  ChevronDown,
  ArrowRight,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


export const VolunteerPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    interest: "Event Organization",
    otherInterest: "",
    message: "",
    newsletter: false,
  });
  const [loading, setLoading] = useState(false);
  const [isInterestOpen, setIsInterestOpen] = useState(false);
  const interestRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (interestRef.current && !interestRef.current.contains(event.target)) {
        setIsInterestOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
        otherInterest: "",
        message: "",
        newsletter: false,
      });
    }, 1500);
  };

  const interestOptions = [
    "Event Organization",
    "Teaching & Education",
    "Community Outreach",
    "Medical Support",
    "Administrative Tasks",
    "Others"
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFC] pt-32 pb-24 px-2 sm:px-6 lg:px-8">
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
              <div className="px-5 sm:px-8 py-6 border-b border-gray-50 flex items-center gap-3">
                <div className="bg-emerald-50 p-2 rounded-lg">
                  <UserPlus className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Volunteer Registration</h2>
              </div>

              <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-6">
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

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Skills & Expertise</label>
                    <div className="relative" ref={interestRef}>
                      <button
                        type="button"
                        onClick={() => setIsInterestOpen(!isInterestOpen)}
                        className={`w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 border-2 transition-all rounded-xl outline-none text-left ${
                          isInterestOpen 
                            ? "border-emerald-500 ring-4 ring-emerald-500/10 bg-white" 
                            : "border-gray-100 hover:border-emerald-200"
                        }`}
                      >
                        <span className={`font-medium ${formData.interest ? "text-gray-900" : "text-gray-400"}`}>
                          {formData.interest}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isInterestOpen ? "rotate-180 text-emerald-500" : ""}`} />
                      </button>

                      <AnimatePresence>
                        {isInterestOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-emerald-900/10 overflow-hidden py-1.5"
                          >
                            {interestOptions.map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, interest: opt }));
                                  setIsInterestOpen(false);
                                }}
                                className={`w-full px-4 py-3 text-left transition-all flex items-center justify-between group ${
                                  formData.interest === opt 
                                    ? "bg-emerald-50 text-emerald-700" 
                                    : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600"
                                }`}
                              >
                                <span className={`text-sm font-semibold ${formData.interest === opt ? "translate-x-1" : ""} transition-transform`}>
                                  {opt}
                                </span>
                                {formData.interest === opt && (
                                  <Check className="w-4 h-4 text-emerald-600" />
                                )}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Conditional specification for "Others" */}
                  <AnimatePresence>
                    {formData.interest === "Others" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                      >
                        <label className="text-sm font-semibold text-gray-400 uppercase tracking-widest pl-1 mb-2 block">
                          Please specify
                        </label>
                        <input
                          type="text"
                          name="otherInterest"
                          placeholder="e.g. Graphic Design, Marketing..."
                          value={formData.otherInterest}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3.5 bg-white border-2 border-emerald-100 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-gray-900 font-medium placeholder:text-gray-300 shadow-sm"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
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


            {/* Other Ways to Help Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-8 border border-emerald-100 shadow-[0_8px_30px_rgb(16,185,129,0.05)] space-y-6">
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
