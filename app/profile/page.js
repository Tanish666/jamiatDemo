"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { SignOutButton } from "@clerk/nextjs";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  Clock,
  Heart,
  ChevronRight,
  LogOut,
  Loader2,
  CheckCircle2,
  LayoutDashboard,
  ShieldCheck,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [formData, setFormData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [donationSummary, setDonationSummary] = useState({
    totalDonations: 0,
    totalAmount: 0
  });
  const [loadingDonor, setLoadingDonor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [donorExists, setDonorExists] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const defaultProfile = {
    name: "",
    email: "",
    profilePicture: "",
    pancardNumber: "",
    phoneNumber: "",
    address: { street: "", city: "", state: "", country: "", zipCode: "" },
    totalProjects: 0,
    totalDonated: 0,
    projectsDonatedTo: [],
    taxReceipts: []
  };

  function buildClerkFallback(u) {
    if (!u) return { ...defaultProfile };
    const email =
      u.primaryEmailAddress?.emailAddress ||
      u.email ||
      u.emailAddresses?.[0]?.emailAddress ||
      "";
    const name =
      u.fullName ||
      [u.firstName, u.lastName].filter(Boolean).join(" ") ||
      u.username ||
      "";
    const image = u.imageUrl || "";
    const phone = u.phoneNumbers?.[0]?.phoneNumber || u.phoneNumber || "";

    return {
      ...defaultProfile,
      name,
      email,
      profilePicture: image,
      phoneNumber: phone
    };
  }

  useEffect(() => {
    if (!isLoaded) return;
    const clerkInitial = buildClerkFallback(user);
    if (!clerkInitial.email) return;

    setFormData(clerkInitial);

    (async () => {
      setLoadingDonor(true);
      try {
        const email = clerkInitial.email;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/donors/${email}`);

        if (res.ok) {
          const donorFromDb = await res.json();
          setDonorExists(true);

          const merged = {
            ...clerkInitial,
            ...donorFromDb,
            address: {
              ...clerkInitial.address,
              ...(donorFromDb.address || {})
            },
            projectsDonatedTo: donorFromDb.projectsDonatedTo || []
          };

          setFormData(merged);

          // Fetch detailed donation data
          try {
            const donationsRes = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/donations/by-email?email=${encodeURIComponent(
                email
              )}`
            );
            if (donationsRes.ok) {
              const donationData = await donationsRes.json();
              const donated = (donationData.projects || []).map((p) => ({
                _id: p.projectId,
                title: p.projectTitle,
                amount: p.amount,
                donationsCount: p.donationsCount
              }));
              setProjects(donated);

              // Update total donated if available in the donation summary
              if (donationData.totalDonated !== undefined) {
                setFormData(prev => ({ ...prev, totalDonated: donationData.totalDonated }));
              }
            }
          } catch (donError) {
            console.error("Error fetching donation details:", donError);
          }
        } else if (res.status === 404) {
          setDonorExists(false);
        }

        const donationsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/donations/by-email?email=${encodeURIComponent(
            email
          )}`
        );
        if (donationsRes.ok) {
          const donationData = await donationsRes.json();
          const donatedProjects = (donationData.projects || []).map((p) => ({
            _id: p.projectId,
            title: p.projectTitle,
            amount: p.amount,
            donationsCount: p.donationsCount
          }));
          setProjects(donatedProjects);
          setDonationSummary({
            totalDonations: donationData.totalDonations || 0,
            totalAmount: donationData.totalAmount || 0
          });
        }
      } catch (err) {
        console.error("Error fetching donor:", err);
      } finally {
        setLoadingDonor(false);
      }
    })();
  }, [isLoaded, user]);

  if (!isLoaded || !formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFC]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
          <p className="text-gray-500 text-lg font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  function setField(path, value) {
    if (path.startsWith("address.")) {
      const key = path.split(".")[1];
      setFormData((f) => ({
        ...f,
        address: { ...f.address, [key]: value }
      }));
    } else {
      setFormData((f) => ({ ...f, [path]: value }));
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const email = formData.email;
      const method = donorExists ? "PUT" : "POST";
      const url = `${process.env.NEXT_PUBLIC_API_URL}/donors/${email}`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error(`Failed to save: ${res.status}`);
      }

      const saved = await res.json();
      setFormData((f) => ({ ...f, ...saved }));
      setDonorExists(true);
      // Instead of alert, we could use a toast if available. Sticking to logic for now.
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Save error", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil((projects?.length || 0) / rowsPerPage));
  const paginatedProjects = (projects || []).slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount || 0);
  return (
    <div className="min-h-screen bg-[#FDFDFC] pt-32 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header/Hero Section */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold uppercase tracking-wider"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure Member Portal
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#064E3B] font-bold leading-tight"
          >
            Welcome, {formData.name?.split(" ")[0] || "Friend"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed"
          >
            Manage your personal information, track your contributions, and see the impact of your generosity.
          </motion.p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left Column: Profile Settings */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-50 p-2.5 rounded-xl">
                    <User className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                </div>
                {loadingDonor && (
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium animate-pulse">
                    <Clock className="w-4 h-4" />
                    Syncing...
                  </div>
                )}
              </div>

              <div className="p-8 space-y-10">
                {/* Avatar & Basic Info */}
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-500 to-emerald-200 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                    <img
                      src={formData.profilePicture || "/profile.png"}
                      alt="Profile"
                      className="relative w-32 h-32 rounded-[1.8rem] object-cover border-4 border-white shadow-md group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 space-y-4 text-center sm:text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative">
                          <input
                            className="w-full bg-gray-50/50 border border-gray-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                            value={formData.name || ""}
                            onChange={(e) => setField("name", e.target.value)}
                            placeholder="Your Name"
                          />
                          <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email (Read-only)</label>
                        <div className="relative">
                          <input
                            className="w-full bg-gray-100/30 border border-gray-100 px-4 py-3 rounded-xl text-gray-400 cursor-not-allowed italic"
                            value={formData.email || ""}
                            readOnly
                          />
                          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Extended Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative">
                      <input
                        className="w-full bg-gray-50/50 border border-gray-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                        value={formData.phoneNumber || ""}
                        onChange={(e) => setField("phoneNumber", e.target.value)}
                        placeholder="+1-234-567-890"
                      />
                      <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">PAN Card Number</label>
                    <div className="relative">
                      <input
                        className="w-full bg-gray-50/50 border border-gray-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all uppercase"
                        value={formData.pancardNumber || ""}
                        onChange={(e) => setField("pancardNumber", e.target.value)}
                        placeholder="ABCDE1234F"
                      />
                      <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className="pt-6 border-t border-gray-50">
                  <div className="flex items-center gap-2 mb-6 text-gray-900">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-bold">Address Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {["street", "city", "state", "country", "zipCode"].map((field) => (
                      <div key={field} className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                          {field === "zipCode" ? "ZIP / Postal" : field}
                        </label>
                        <input
                          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                          className="w-full bg-gray-50/50 border border-gray-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                          value={formData.address?.[field] || ""}
                          onChange={(e) => setField(`address.${field}`, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-50">
                  <div className="flex items-center gap-3">
                    <SignOutButton>
                      <button className="px-6 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </SignOutButton>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-[#10B981] to-[#34D399] text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                    {saving ? "Updating..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Impact/Stats & Donations */}
          <div className="lg:col-span-4 space-y-10">

            {/* Impact Summary Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#064E3B] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="relative z-10 space-y-8">
                <div className="space-y-2">
                  <div className="bg-emerald-500/20 w-12 h-12 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-emerald-300" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold">Your Donations</h3>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-1">
                    <p className="text-5xl font-bold tracking-tight">₹{formData.totalDonated?.toLocaleString('en-IN') || 0}</p>
                    <p className="text-xs font-medium text-emerald-200 uppercase tracking-wider">TOTAL DONATED</p>
                  </div>
                  <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/10">
                    <div className="space-y-1">
                      <p className="text-2xl font-bold tracking-tight">{projects.length}</p>
                      <p className="text-xs font-medium text-emerald-200 uppercase tracking-wider">PROJECTS</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold tracking-tight">{donorExists ? "Live" : "New"}</p>
                      <p className="text-xs font-medium text-emerald-200 uppercase tracking-wider">STATUS</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <p className="text-emerald-100/70 text-sm leading-relaxed italic">
                    "The best of people are those that bring most benefit to the rest of mankind."
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Recent Donations Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between px-2">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <LayoutDashboard className="w-6 h-6 text-emerald-600" />
                  Contributions
                </h3>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                  {projects.length} Total
                </span>
              </div>

              {projects.length > 0 ? (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {paginatedProjects.map((project, idx) => (
                      <motion.div
                        key={project._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-md transition-all cursor-pointer relative flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-emerald-600 border border-gray-100 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                            <Heart className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                              {project.title}
                            </h4>
                            <p className="text-xs text-gray-400 font-medium">
                              ₹{project.amount?.toLocaleString('en-IN') || 0} • {project.donationsCount || 0} donation{project.donationsCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-transform group-hover:translate-x-1" />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 pt-4">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-100 rounded-lg hover:bg-emerald-50 disabled:opacity-30 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-bold text-gray-500">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-gray-100 rounded-lg hover:bg-emerald-50 disabled:opacity-30 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50/50 rounded-[2rem] p-10 border-2 border-dashed border-gray-200 text-center space-y-4">
                  <div className="bg-white w-12 h-12 rounded-full shadow-sm flex items-center justify-center mx-auto text-gray-300">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900">No donations yet</p>
                    <p className="text-xs text-gray-500 leading-relaxed">Your journey of giving starts with a single step.</p>
                  </div>
                  <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-widest pt-2">
                    Explore Projects
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
