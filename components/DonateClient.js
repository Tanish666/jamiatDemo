"use client";

import { useEffect, useState, useRef } from "react";
import {
  Heart,
  Users,
  Gift,
  HandCoins,
  CircleDollarSign,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function DonatePage({ searchParams }) {
  const { projectId, type, amount, frequency } = searchParams;
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  const [isRazorpayReady, setIsRazorpayReady] = useState(false);

  const validFrequencies = ["One-Time", "Weekly", "Monthly", "Yearly"];
  const initialFrequency = validFrequencies.includes(frequency) ? frequency : "One-Time";
  const [donationFrequency, setDonationFrequency] =
    useState(initialFrequency);
  const [isRecurring, setIsRecurring] = useState(
    initialFrequency !== "One-Time"
  );
  const [isFrequencyOpen, setIsFrequencyOpen] = useState(false);
  const frequencyRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (frequencyRef.current && !frequencyRef.current.contains(event.target)) {
        setIsFrequencyOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId);
  const [customAmount, setCustomAmount] = useState(
    amount ?? ""
  );
  const [donationType, setDonationType] = useState(type ?? "Zakat");
  const [showRecurringConfirm, setShowRecurringConfirm] = useState(false);
  const [oneTimeCountdown, setOneTimeCountdown] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const scrollRef = useRef(null);

  const stepTitleRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      if (window.innerWidth < 1024) {
        // On mobile, scroll to the top of the donation section (considering Hero is above it)
        scrollRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // On desktop, only scroll the internal container if it's scrollable
        scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
    
    // Focus the step title for accessibility when step changes
    const timer = setTimeout(() => {
      stepTitleRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, [currentStep]);
  const quickAmounts = [1000, 2500, 5000, 10000, 15000, 25000];
  const amountValue = customAmount === "" ? 0 : Number(customAmount);
  const impact = isRecurring
    ? (() => {
      let daily = 0;
      let weekly = 0;
      let monthly = 0;
      let yearly = 0;

      if (donationFrequency === "Weekly") {
        weekly = amountValue;
        daily = amountValue / 7;
        monthly = amountValue * 4;
        yearly = amountValue * 52;
      } else if (donationFrequency === "Monthly") {
        monthly = amountValue;
        weekly = amountValue / 4;
        daily = amountValue / 28;
        yearly = (amountValue / 4) * 52;
      } else {
        yearly = amountValue;
        weekly = amountValue / 52;
        daily = amountValue / 365;
        monthly = (amountValue / 52) * 4;
      }

      return {
        Weekly: weekly.toFixed(0),
        Monthly: monthly.toFixed(0),
        Yearly: yearly.toFixed(0),
      };
    })()
    : {};
  const [donationFor, setDonationFor] = useState("self");
  const [dedicatedTo, setDedicatedTo] = useState("");
  const [message, setMessage] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const minAmounts = {
    "One-Time": 50,
    Weekly: 20,
    Monthly: 50,
    Yearly: 365,
  };
  const minAmount =
    !isRecurring || donationFrequency === "One-Time"
      ? minAmounts["One-Time"]
      : minAmounts[donationFrequency] || 50;
  const name = user?.fullName || "Anonymous";
  const email = user?.emailAddresses[0]?.emailAddress || "";

  useEffect(() => {
    const draftStr = sessionStorage.getItem('donationDraft');
    if (draftStr) {
      try {
        const parsed = JSON.parse(draftStr);
        if (parsed.donationFrequency !== undefined) setDonationFrequency(parsed.donationFrequency);
        if (parsed.isRecurring !== undefined) setIsRecurring(parsed.isRecurring);
        if (parsed.panNumber !== undefined) setPanNumber(parsed.panNumber);
        if (parsed.customAmount !== undefined) setCustomAmount(parsed.customAmount);
        if (parsed.donationType !== undefined) setDonationType(parsed.donationType);
        if (parsed.currentStep !== undefined) setCurrentStep(parsed.currentStep);
        if (parsed.donationFor !== undefined) setDonationFor(parsed.donationFor);
        if (parsed.dedicatedTo !== undefined) setDedicatedTo(parsed.dedicatedTo);
        if (parsed.message !== undefined) setMessage(parsed.message);
      } catch (err) {
        console.error("Failed to parse donation draft:", err);
      }
    }
  }, []);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects?status=Active`, {
      next: { revalidate: 3600 },
    })
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.projects || []);

        const draftStr = sessionStorage.getItem('donationDraft');
        let draftProjectId = null;
        if (draftStr) {
          try {
            draftProjectId = JSON.parse(draftStr).selectedProjectId;
          } catch (e) { }
        }

        const targetId = projectId || draftProjectId;

        if (!targetId || !data.projects?.some((p) => p._id === targetId)) {
          setSelectedProjectId(data.projects?.[0]?._id || "");
        } else {
          setSelectedProjectId(targetId);
        }
      })
      .finally(() => {
        // Clean up draft after projects fetch has resolved and project is set
        sessionStorage.removeItem('donationDraft');
      })
      .catch((err) => console.error("Failed to fetch projects:", err));
  }, [projectId]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => setIsRazorpayReady(true);
    script.onerror = () => console.error("Razorpay SDK failed to load");

    document.body.appendChild(script);

    // remove script on unmount
    return () => script.remove();
  }, []);

  useEffect(() => {
    if (customAmount === "") return;
    // Keep non-numeric entries from breaking calculations.
    if (Number.isNaN(amountValue)) {
      setCustomAmount("");
    }
  }, [amountValue, customAmount]);

  useEffect(() => {
    if (!showRecurringConfirm) {
      setOneTimeCountdown(0);
      return;
    }

    setOneTimeCountdown(3);
    const intervalId = setInterval(() => {
      setOneTimeCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [showRecurringConfirm]);

  const handlePayment = async ({ bypassConfirm = false } = {}) => {
    if (!isSignedIn) {
      sessionStorage.setItem('donationDraft', JSON.stringify({
        donationFrequency,
        isRecurring,
        panNumber,
        selectedProjectId,
        customAmount,
        donationType,
        currentStep: 4,
        donationFor,
        dedicatedTo,
        message,
      }));
      router.push("/login?redirect_url=/donate");
      return;
    }


    if (!donationType) {
      alert("Please select a donation type.");
      return;
    }

    if (!selectedProjectId) {
      alert("Please select a project to donate to.");
      return;
    }

    if (!amountValue || amountValue < minAmount) {
      alert(`Please enter a valid donation amount (minimum ₹${minAmount}).`);
      return;
    }

    if (!isRecurring && !bypassConfirm) {
      setShowRecurringConfirm(true);
      return;
    }

    if (!isRazorpayReady) {
      alert("Payment system is still loading. Please try again in a moment.");
      return;
    }

    const selectedProject = projects.find((p) => p._id === selectedProjectId);

    if (isRecurring) {
      // Create subscription on the server and launch Razorpay Checkout with subscription_id
      try {
        const createRes = await fetch("/api/create-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: amountValue,
            frequency: donationFrequency,
            name,
            email,
          }),
        });

        const createData = await createRes.json();
        if (!createRes.ok) {
          console.error("Subscription creation failed:", createData);
          alert("Failed to create subscription. Please try again later.");
          return;
        }

        const subscriptionId = createData?.subscription?.id;
        if (!subscriptionId) {
          console.error("No subscription id returned:", createData);
          alert("Failed to initialize subscription. Please contact support.");
          return;
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
          subscription_id: subscriptionId,
          name: "Jamiat Foundation",
          description: `Recurring ${donationFrequency} donation for ${selectedProject?.title || "General Fund"
            }`,
          handler: async (response) => {
            console.log("Subscription success:", response);
            alert(
              `Subscription successful! Subscription ID: ${response.razorpay_subscription_id}`
            );

            // Save subscription record in your DB
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/save-donation`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                subscriptionId: response.razorpay_subscription_id,
                paymentId: response.razorpay_payment_id,
                amount: amountValue,
                donationType,
                donationFrequency: donationFrequency,
                projectId: selectedProjectId,
                name,
                email,
                dedicatedTo,
                message,
                panNumber,
                isRecurring: true,
              }),
            })
              .then((res) => res.json())
              .then((data) => console.log("Donation saved:", data))
              .catch((err) => console.error("Failed to save donation:", err));
          },
          prefill: {
            name: name,
            email: email,
          },
          notes: {
            projectId: selectedProjectId,
            donationType,
            donationFor,
            dedicatedTo,
            message,
            isRecurring,
            donationFrequency,
            panNumber,
          },
          theme: {
            color: "#059669",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error("Error creating subscription:", err);
        alert("Unable to create subscription. Please try again later.");
      }

      return;
    }

    // One-time payment flow (unchanged)
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      amount: customAmount * 100,
      currency: "INR",
      name: "Jamiat Foundation",
      description: `Donation for ${selectedProject?.title || "General Fund"}`,
      handler: async (response) => {
        console.log("Payment success:", response);
        alert(
          `Payment successful! Payment ID: ${response.razorpay_payment_id}`
        );

        try {
          // 1️⃣ Capture the payment via backend
          const captureRes = await fetch("/api/capture-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentId: response.razorpay_payment_id,
              amount: amountValue,
            }),
          });

          const captureData = await captureRes.json();
          if (!captureRes.ok) {
            console.error("Capture failed:", captureData);
            alert("Payment capture failed! Please contact support.");
            return;
          }

          console.log("Payment captured:", captureData);

          // 2️⃣ Save donation record in your DB
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/save-donation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentId: response.razorpay_payment_id,
              amount: amountValue,
              donationType,
              donationFrequency: isRecurring ? donationFrequency : "One-Time",
              projectId: selectedProjectId,
              name,
              email,
              dedicatedTo,
              message,
              panNumber,
            }),
          })
            .then((res) => res.json())
            .then((data) => console.log("Donation saved:", data))
            .catch((err) => console.error("Failed to save donation:", err));
        } catch (err) {
          console.error("Error during capture or save:", err);
        }
      },
      prefill: {
        name: name,
        email: email,
      },
      notes: {
        projectId: selectedProjectId,
        donationType,
        donationFor,
        dedicatedTo,
        message,
        isRecurring,
        donationFrequency,
        panNumber,
      },
      theme: {
        color: "#059669",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const selectedProject = projects.find((p) => p._id === selectedProjectId);
  const donationTypes =
    selectedProject?.donationOptions?.filter((opt) => opt.isEnabled) || [];

  return (
    <div className="flex flex-col lg:flex-row justify-center bg-white overflow-x-hidden min-h-screen">
      {/* Hero Section */}
      <section className="w-full lg:w-5/12 relative pb-12 pt-24 lg:pt-32 lg:pb-0 px-5 lg:px-24 overflow-hidden flex items-start bg-slate-50/50 border-b lg:border-b-0 lg:border-l border-slate-100">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-emerald-50 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-[5%] left-[-5%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-xl mx-auto text-center space-y-6 lg:space-y-8 py-12 lg:py-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 font-medium text-sm border border-emerald-100/50"
          >
            <Heart className="w-4 h-4" />
            <span>Support Our Mission</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-slate-900 leading-[1.1]"
          >
            Empower Change <br className="hidden sm:block" />
            Through <span className="text-emerald-600">Your Generosity</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            Your contribution provides a safety net for those who have nowhere else to turn.
            Every rupee counts in building a better tomorrow.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-3 gap-2 sm:gap-6 pt-8 max-w-2xl mx-auto text-center"
          >
            <div className="space-y-1">
              <div className="text-2xl lg:text-3xl font-bold text-emerald-600">10k+</div>
              <div className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest">ACTIVE DONORS</div>
            </div>
            <div className="space-y-1 border-x border-slate-100">
              <div className="text-2xl lg:text-3xl font-bold text-emerald-600">50k+</div>
              <div className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest">LIVES IMPACTED</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl lg:text-3xl font-bold text-emerald-600">14</div>
              <div className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest">STATES REACHED</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Donation Section */}
      <div
        ref={scrollRef}
        className="w-full lg:w-7/12 flex flex-col pt-8 lg:pt-32 pb-16 overflow-y-auto bg-slate-50/50 scroll-mt-24"
      >

        <AnimatePresence mode="wait">
          {
            currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <section className="max-w-2xl mx-auto px-4 sm:px-5 lg:px-8 w-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 sm:p-8 lg:p-12 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-emerald-100/50 space-y-8 sm:space-y-10"
                  >
                    {/* Project Selection Section */}
                    <div className="space-y-6">
                      <div className="space-y-2 text-center flex flex-col items-center">
                        <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-tight uppercase text-sm">
                          <Heart className="w-4 h-4" />
                          <span>Target Project</span>
                        </div>
                        <h2 
                          ref={stepTitleRef}
                          tabIndex={-1}
                          className="text-2xl lg:text-3xl font-bold text-slate-900 text-center focus:outline-none"
                        >
                          Select Project
                        </h2>
                        <p className="text-slate-500 text-center">Where should your donation go?</p>
                      </div>
                      <div className="relative group">
                        <select
                          value={selectedProjectId}
                          onChange={(e) => setSelectedProjectId(e.target.value)}
                          className="w-full h-14 pl-4 pr-10 rounded-2xl border-2 border-slate-100 bg-slate-50/50 appearance-none focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-900 font-medium"
                        >
                          {projects?.map((project) => (
                            <option key={project._id} value={project._id}>
                              {project.title}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Dedication Form Section */}
                    <div className="space-y-8">
                      <div className="space-y-2 text-center flex flex-col items-center">
                        <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-tight uppercase text-sm">
                          <Users className="w-4 h-4" />
                          <span>Dedication</span>
                        </div>
                        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 text-center">Who is this for?</h2>
                        <p className="text-slate-500 text-center">You can dedicate this donation to a loved one.</p>
                      </div>

                      <div className="grid gap-3">
                        {[
                          { value: "self", label: "For myself" },
                          { value: "family", label: "On behalf of family member" },
                          { value: "memory", label: "In memory of someone" },
                        ].map((option) => (
                          <label
                            key={option.value}
                            className={`flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${donationFor === option.value
                              ? "border-emerald-500 bg-emerald-50/50"
                              : "border-slate-100 bg-slate-50/30 hover:border-emerald-200"
                              }`}
                          >
                            <input
                              type="radio"
                              name="donationFor"
                              value={option.value}
                              checked={donationFor === option.value}
                              onChange={() => setDonationFor(option.value)}
                              className="h-5 w-5 accent-emerald-600 mr-3"
                            />
                            <span className="font-bold text-slate-900">{option.label}</span>
                          </label>
                        ))}
                      </div>

                      {(donationFor === "family" || donationFor === "memory") && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                            {donationFor === "family" ? "FAMILY MEMBER NAME" : "IN MEMORY OF"}
                          </label>
                          <input
                            type="text"
                            className="w-full h-14 px-4 rounded-xl border-2 border-slate-100 bg-slate-50/50 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-900 font-medium"
                            placeholder={donationFor === "family" ? "Enter name" : "Enter name"}
                            value={dedicatedTo}
                            onChange={(e) => setDedicatedTo(e.target.value)}
                          />
                        </motion.div>
                      )}

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                          MESSAGE (OPTIONAL)
                        </label>
                        <textarea
                          rows="3"
                          className="w-full p-4 border-2 border-slate-100 bg-slate-50/50 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-900 font-medium resize-none"
                          placeholder="Add a prayer or message..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                      </div>
                    </div>
                  </motion.div>
                </section>

                  <footer className="max-w-2xl mx-auto px-5 lg:px-8 flex justify-center lg:justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all active:scale-95 shadow-xl shadow-emerald-900/10"
                  >
                    Next Step: Donation Type
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </footer>
              </motion.div>
            )
          }

          {/* Step 2: Donation Type */}
          {
            currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <section className="max-w-2xl mx-auto px-4 sm:px-5 lg:px-8 w-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 sm:p-8 lg:p-12 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-emerald-100/50 space-y-6 sm:space-y-8"
                  >
                    <div className="space-y-2 text-center flex flex-col items-center">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-tight uppercase text-sm">
                        <Gift className="w-4 h-4" />
                        <span>Intention</span>
                      </div>
                      <h2 
                        ref={stepTitleRef}
                        tabIndex={-1}
                        className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 text-center focus:outline-none"
                      >
                        Donation Type
                      </h2>
                      <p className="text-slate-500 text-center">Select your contribution category.</p>
                    </div>
                    <div className="grid gap-3">
                      {donationTypes.map((opt) => (
                        <label
                          key={opt.type}
                          className={`relative flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-emerald-500 ${donationType === opt.type
                            ? "border-emerald-500 bg-emerald-50/50"
                            : "border-slate-100 bg-slate-50/30 hover:border-emerald-200"
                            }`}
                        >
                          <input
                            type="radio"
                            name="donationType"
                            value={opt.type}
                            checked={donationType === opt.type}
                            onChange={() => setDonationType(opt.type)}
                            className="sr-only"
                          />
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 transition-colors ${donationType === opt.type ? "bg-emerald-600 text-white" : "bg-white text-emerald-600 border border-emerald-100"
                            }`}>
                            {(opt.type === "General Donation" || opt.type === "Hadiya") && <Heart className="w-5 h-5" />}
                            {opt.type === "Zakat" && <Gift className="w-5 h-5" />}
                            {opt.type === "Sadqa" && <HandCoins className="w-5 h-5" />}
                            {(opt.type === "Interest Earnings" || opt.type === "others(general donations & interest income)") && <CircleDollarSign className="w-5 h-5" />}
                          </div>
                          <span className="font-bold text-slate-900">
                            {opt.type === "General Donation" ? "Hadiya" : opt.type === "Interest Earnings" ? "others(general donations & interest income)" : opt.type}
                          </span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                </section>

                <footer className="max-w-2xl mx-auto px-5 lg:px-8 flex flex-col-reverse lg:flex-row items-center justify-between gap-4 lg:gap-0">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-slate-400 font-bold hover:text-slate-600 focus:outline-none focus:text-slate-900 transition-colors"
                  >
                    Back to Details
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all shadow-xl shadow-emerald-900/10"
                  >
                    Next Step: Amount
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </footer>
              </motion.div>
            )
          }

          {/* Step 3: Amount */}
          {
            currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <section className="max-w-2xl mx-auto px-4 sm:px-5 lg:px-8 w-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 sm:p-8 lg:p-12 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-emerald-100/50 space-y-8 sm:space-y-10"
                  >
                    <div className="space-y-2 text-center flex flex-col items-center">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-tight uppercase text-sm">
                        <IndianRupee className="w-4 h-4" />
                        <span>Investment</span>
                      </div>
                      <h2 
                        ref={stepTitleRef}
                        tabIndex={-1}
                        className="text-2xl lg:text-3xl font-bold text-slate-900 text-center focus:outline-none"
                      >
                        Choose Amount
                      </h2>
                      <p className="text-slate-500 text-center">How much would you like to contribute?</p>
                    </div>

                    <div className="space-y-2" ref={frequencyRef}>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsFrequencyOpen(!isFrequencyOpen)}
                          className={`w-full bg-slate-50 border-2 border-slate-100 px-5 h-14 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 focus:bg-white transition-all text-slate-900 font-bold flex items-center justify-between hover:bg-white/50 ${isFrequencyOpen ? 'border-emerald-500 ring-4 ring-emerald-500/10' : ''}`}
                        >
                          <span className="text-base">{isRecurring ? donationFrequency : "One-Time"}</span>
                          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isFrequencyOpen ? 'rotate-180 text-emerald-500' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {isFrequencyOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl shadow-emerald-900/5 overflow-hidden py-1"
                            >
                              {["One-Time", "Weekly", "Monthly", "Yearly"].map((freq) => (
                                <button
                                  key={freq}
                                  type="button"
                                  onClick={() => {
                                    if (freq === "One-Time") {
                                      setIsRecurring(false);
                                      setDonationFrequency("One-Time");
                                    } else {
                                      setIsRecurring(true);
                                      setDonationFrequency(freq);
                                    }
                                    setIsFrequencyOpen(false);
                                  }}
                                  className={`w-full px-5 py-3 text-left transition-colors font-bold text-sm ${(freq === "One-Time" && !isRecurring) || (isRecurring && donationFrequency === freq)
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-emerald-500"
                                    }`}
                                >
                                  {freq}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {quickAmounts.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setCustomAmount(amount)}
                          className={`py-3 rounded-xl border-2 font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 ${customAmount === amount
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-100 text-slate-400 hover:border-emerald-200"
                            }`}
                        >
                          ₹{amount.toLocaleString('en-IN')}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        value={customAmount}
                        placeholder={minAmount}
                        onChange={(e) => setCustomAmount(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full h-14 pl-10 pr-4 rounded-xl border-2 border-slate-100 bg-slate-50/50 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-900 font-bold text-lg"
                      />
                      <div className="absolute text-red-500 text-xs mt-2 ml-2">(min: ₹{minAmount.toLocaleString('en-IN')})</div>
                    </div>

                    {amountValue > 2000 && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                          PAN CARD NUMBER (REQUIRED)
                        </label>
                        <input
                          type="text"
                          className="w-full h-14 px-4 rounded-xl border-2 border-slate-100 bg-slate-50/50 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-900 font-medium uppercase"
                          placeholder="Enter 10-digit PAN"
                          value={panNumber}
                          onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                          maxLength={10}
                        />
                      </div>
                    )}

                    {isRecurring && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-6 border-t border-slate-100 pt-6 space-y-4"
                      >
                        <h3 className="font-bold text-slate-900 text-center">
                          Your Contribution Impact
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {[
                            { label: "Weekly", val: impact.Weekly },
                            { label: "Monthly", val: impact.Monthly },
                            { label: "Yearly", val: impact.Yearly },
                          ].map((item) => (
                            <div key={item.label} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center space-y-1">
                              <div className="text-emerald-600 font-bold text-lg">₹{Number(item.val).toLocaleString('en-IN')}</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </section>

                <footer className="max-w-2xl mx-auto px-5 lg:px-8 flex flex-col-reverse lg:flex-row items-center justify-between gap-4 lg:gap-0">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-slate-400 font-bold hover:text-slate-600 focus:outline-none focus:text-slate-900 transition-colors"
                  >
                    Back to Type
                  </button>
                  <button
                    onClick={() => {
                      if (!amountValue || amountValue < minAmount) {
                        alert(`Please enter a valid donation amount (minimum ₹${minAmount.toLocaleString('en-IN')}).`);
                        return;
                      }
                      if (amountValue > 2000) {
                        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
                        if (!panNumber || !panRegex.test(panNumber)) {
                          alert("Please enter a valid 10-digit PAN Card Number.");
                          return;
                        }
                      }
                      setCurrentStep(4);
                    }}
                    className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all shadow-xl shadow-emerald-900/10"
                  >
                    Next Step: Review
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </footer>
              </motion.div>
            )
          }

          {/* Step 4: Review & Payment */}
          {
            currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <section className="max-w-xl mx-auto px-4 sm:px-5 lg:px-8 w-full">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#0F172A] rounded-[1.2rem] sm:rounded-[2rem] px-6 py-4 sm:px-8 sm:py-5 lg:px-10 lg:py-6 text-white shadow-2xl space-y-3 sm:space-y-4"
                  >
                    <div className="space-y-1 text-center flex flex-col items-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 font-medium text-xs border border-emerald-400/20">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Final Step</span>
                      </div>
                      <h2 
                        ref={stepTitleRef}
                        tabIndex={-1}
                        className="text-2xl sm:text-3xl font-bold text-center focus:outline-none"
                      >
                        Review & Pay
                      </h2>
                      <p className="text-slate-400 text-xs sm:text-sm text-center">Please confirm your donation details before proceeding.</p>
                    </div>

                    <div className="space-y-3">
                      {[
                        { label: "Purpose", val: donationType === "General Donation" ? "Hadiya" : donationType === "Interest Earnings" ? "others(general donations & interest income)" : donationType },
                        { label: "Frequency", val: isRecurring ? donationFrequency : "One-Time" },
                        { label: "Dedication", val: donationFor === "self" ? "For Myself" : dedicatedTo || "Family/Memory" },
                        ...(amountValue > 2000 ? [{ label: "PAN Card", val: panNumber }] : []),
                        { label: "Impact", val: `₹${amountValue.toLocaleString('en-IN')}`, accent: true },
                        { label: "Project", val: selectedProject?.title || "—" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                          <span className={`font-bold ${item.accent ? "text-emerald-400 text-lg sm:text-xl" : "text-white text-sm sm:text-base"}`}>
                            {item.val}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handlePayment}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 transition-all active:scale-95 group shadow-xl shadow-emerald-900/20"
                    >
                      Complete Payment
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="flex flex-col items-center gap-3 pt-2">
                      <div className="flex items-center gap-2 text-slate-500 text-[10px] sm:text-xs font-medium">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Secure Payment via Razorpay</span>
                      </div>
                      <img src="https://cdn.razorpay.com/logo.svg" alt="Razorpay" className="h-3 brightness-0 invert opacity-50" />
                    </div>
                  </motion.div>
                </section>

                <footer className="max-w-xl mx-auto px-5 lg:px-8 flex justify-center">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="text-slate-400 font-bold hover:text-slate-600 transition-colors"
                  >
                    Change Amount
                  </button>
                </footer>
              </motion.div>
            )
          }
        </AnimatePresence>
        {/* Progress Indicator */}
        <section className="max-w-2xl mx-auto px-4 sm:px-5 lg:px-8 py-6 sm:py-10 w-full order-first lg:order-none mb-2 lg:mb-0" >
          <div className="relative flex justify-between items-center max-w-md mx-auto">
            {/* Progress Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10 rounded-full overflow-hidden">
              <motion.div
                initial={false}
                animate={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                className="h-full bg-emerald-600 transition-all duration-500"
              />
            </div>

            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (step < currentStep) setCurrentStep(step);
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${currentStep >= step
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200"
                    : "bg-white border-slate-200 text-slate-400"
                    }`}
                >
                  {step}
                </motion.button>
                <span className={`mt-2 text-[10px] font-bold uppercase tracking-widest mx-2 ${currentStep >= step ? "text-emerald-700" : "text-slate-400"
                  }`}>
                  {step === 1 ? "Details" : step === 2 ? "Type" : step === 3 ? "Amount" : "Review"}
                </span>
              </div>
            ))}
          </div>
        </section >
        {/* Spacing */}
        <div className="h-10" />
      </div >

      {/* Recurring Confirmation Popup */}
      {
        showRecurringConfirm && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[1100]">
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirm One-Time Donation
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                You have selected a one-time donation. Would you like to make this
                a recurring donation for consistent support?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRecurringConfirm(false);
                    handlePayment({ bypassConfirm: true }); // Use handlePayment instead of proceedToPayment
                  }}
                  disabled={oneTimeCountdown > 0}
                  className={`px-4 py-2 rounded-lg text-white ${oneTimeCountdown > 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                >
                  Continue with One-Time
                  {oneTimeCountdown > 0 ? ` (${oneTimeCountdown}s)` : ""}
                </button>
                <button
                  onClick={() => {
                    setIsRecurring(true);
                    setDonationFrequency("Monthly");
                    setShowRecurringConfirm(false);
                    handlePayment({ bypassConfirm: true }); // Use handlePayment instead of proceedToPayment
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Make it Recurring
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}