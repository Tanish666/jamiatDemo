"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function DonatePage({ searchParams }) {
  const { projectId, type, amount, frequency } = searchParams;
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  const [isRazorpayReady, setIsRazorpayReady] = useState(false);

  const initialFrequency = frequency ?? "One-Time";
  const [donationFrequency, setDonationFrequency] =
    useState(initialFrequency);
  const [isRecurring, setIsRecurring] = useState(
    initialFrequency !== "One-Time"
  );
  const [requestCertificate, setRequestCertificate] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId);
  const [customAmount, setCustomAmount] = useState(
    amount ?? ""
  );
  const [donationType, setDonationType] = useState(type ?? "Zakat");
  const [showRecurringConfirm, setShowRecurringConfirm] = useState(false);
  const [oneTimeCountdown, setOneTimeCountdown] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const quickAmounts = [1000, 2500, 5000, 10000, 15000, 25000];
  const amountValue = customAmount === "" ? 0 : Number(customAmount);
  const impact = isRecurring
    ? (() => {
      let daily = 0;
      let weekly = 0;
      let monthly = 0;
      let yearly = 0;

      if (donationFrequency === "Daily") {
        daily = amountValue;
        weekly = amountValue * 7;
        monthly = amountValue * 28;
        yearly = amountValue * 365;
      } else if (donationFrequency === "Weekly") {
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
        Daily: daily.toFixed(0),
        Weekly: weekly.toFixed(0),
        Monthly: monthly.toFixed(0),
        Yearly: yearly.toFixed(0),
      };
    })()
    : {};
  const [donationFor, setDonationFor] = useState("self");
  const [dedicatedTo, setDedicatedTo] = useState("");
  const [message, setMessage] = useState("");
  const minAmounts = {
    "One-Time": 50,
    Daily: 5,
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
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects?status=Active`, {
      next: { revalidate: 3600 },
    })
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.projects || []);

        if (!data.projects?.some((p) => p._id === projectId)) {
          setSelectedProjectId(data.projects?.[0]?._id || "");
        }
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
      router.push("/login");
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
                requestCertificate,
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
            requestCertificate,
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
              requestCertificate,
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
        requestCertificate,
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
    <div className="flex flex-col bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 px-5 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-50 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-[5%] left-[-5%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-6 lg:space-y-8">
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
            className="text-4xl lg:text-7xl font-serif font-bold tracking-tight text-slate-900 leading-[1.1]"
          >
            Empower Change Through <br className="hidden lg:block" />
            <span className="text-emerald-600">Your Generosity</span>
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
            className="grid grid-cols-3 gap-6 pt-8 max-w-2xl mx-auto"
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

      {/* Progress Indicator */}
      <section className="max-w-3xl mx-auto px-5 lg:px-8 py-8" >
        <div className="relative flex justify-between items-center">
          {/* Progress Line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10 rounded-full overflow-hidden">
            <motion.div
              initial={false}
              animate={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              className="h-full bg-emerald-600 transition-all duration-500"
            />
          </div>

          {[1, 2, 3].map((step) => (
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
                {step === 1 ? "Purpose" : step === 2 ? "Dedication" : "Amount"}
              </span>
            </div>
          ))}
        </div>
      </section >

      {/* Step 1: Purpose & Project */}
      {
        currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <section className="max-w-7xl mx-auto px-5 lg:px-8 py-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Project Selection */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-8 lg:p-10 rounded-[2rem] shadow-sm border border-emerald-100/50 space-y-6"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-tight uppercase text-sm">
                      <Heart className="w-4 h-4" />
                      <span>Target Project</span>
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">Select Project</h2>
                    <p className="text-slate-500">Where should your donation go?</p>
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
                </motion.div>

                {/* Intention Selection */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-8 lg:p-10 rounded-[2rem] shadow-sm border border-emerald-100/50 space-y-8"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-tight uppercase text-sm">
                      <Gift className="w-4 h-4" />
                      <span>Intention</span>
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">Donation Type</h2>
                    <p className="text-slate-500">Select your contribution category.</p>
                  </div>
                  <div className="grid gap-3">
                    {donationTypes.map((opt) => (
                      <label
                        key={opt.type}
                        className={`relative flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${donationType === opt.type
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
                          {opt.type === "General Donation" && <Heart className="w-5 h-5" />}
                          {opt.type === "Zakat" && <Gift className="w-5 h-5" />}
                          {opt.type === "Sadqa" && <HandCoins className="w-5 h-5" />}
                          {opt.type === "Interest Earnings" && <CircleDollarSign className="w-5 h-5" />}
                        </div>
                        <span className="font-bold text-slate-900">{opt.type}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              </div>
            </section>

            <footer className="max-w-7xl mx-auto px-5 lg:px-8 py-8 flex justify-end">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all active:scale-95 shadow-xl shadow-emerald-900/10"
              >
                Next Step: Dedication
                <ArrowRight className="w-5 h-5" />
              </button>
            </footer>
          </motion.div>
        )
      }

      {/* Step 2: Dedication */}
      {
        currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <section className="max-w-3xl mx-auto px-5 lg:px-8 py-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 lg:p-12 rounded-[2rem] shadow-sm border border-emerald-100/50 space-y-8"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-tight uppercase text-sm">
                    <Users className="w-4 h-4" />
                    <span>Dedication</span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">Who is this for?</h2>
                  <p className="text-slate-500">You can dedicate this donation to a loved one.</p>
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
              </motion.div>
            </section>

            <footer className="max-w-3xl mx-auto px-5 lg:px-8 py-8 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="text-slate-400 font-bold hover:text-slate-600 transition-colors"
              >
                Back to Purpose
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/10"
              >
                Next Step: Amount
                <ArrowRight className="w-5 h-5" />
              </button>
            </footer>
          </motion.div>
        )
      }

      {/* Step 3: Amount & Summary */}
      {
        currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
          >
            <section className="max-w-7xl mx-auto px-5 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-8 lg:p-10 rounded-[2rem] shadow-sm border border-emerald-100/50 space-y-10"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold tracking-tight uppercase text-sm">
                      <IndianRupee className="w-4 h-4" />
                      <span>Investment</span>
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">Choose Amount</h2>
                    <p className="text-slate-500">How much would you like to contribute?</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {["One-Time", "Daily", "Weekly", "Monthly", "Yearly"].map((freq) => (
                        <button
                          key={freq}
                          onClick={() => {
                            if (freq === "One-Time") {
                              setIsRecurring(false);
                              setDonationFrequency("One-Time");
                            } else {
                              setIsRecurring(true);
                              setDonationFrequency(freq);
                            }
                          }}
                          className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${(freq === "One-Time" && !isRecurring) || (isRecurring && donationFrequency === freq)
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                            }`}
                        >
                          {freq}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {quickAmounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setCustomAmount(amount)}
                        className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${customAmount === amount
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-100 text-slate-400 hover:border-emerald-200"
                          }`}
                      >
                        ₹{amount.toLocaleString()}
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
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <input
                      type="checkbox"
                      className="mt-1 h-5 w-5 rounded-lg accent-emerald-600"
                      checked={requestCertificate}
                      onChange={() => setRequestCertificate(!requestCertificate)}
                    />
                    <div className="space-y-1">
                      <p className="font-bold text-xs text-slate-900 uppercase tracking-widest">Tax Exemption</p>
                      <p className="text-xs text-slate-500 leading-relaxed">Request official certificate for tax deductions.</p>
                    </div>
                  </label>
                </motion.div>

                <div className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#0F172A] rounded-[2.5rem] p-8 lg:p-10 text-white shadow-2xl space-y-8"
                  >
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 font-medium text-xs border border-emerald-400/20">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Summary</span>
                      </div>
                      <h2 className="text-2xl font-bold">Review & Pay</h2>
                    </div>

                    <div className="space-y-4">
                      {[
                        { label: "Purpose", val: donationType },
                        { label: "Dedication", val: donationFor === "self" ? "For Myself" : dedicatedTo || "Family/Memory" },
                        { label: "Impact", val: `₹${amountValue} ${isRecurring ? donationFrequency : ""}`, accent: true },
                        { label: "Project", val: selectedProject?.title || "—" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{item.label}</span>
                          <span className={`font-bold text-sm ${item.accent ? "text-emerald-400 text-lg" : "text-white"}`}>
                            {item.val}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handlePayment}
                      className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 group"
                    >
                      Complete Payment
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="flex items-center justify-center gap-4 pt-4 grayscale opacity-50">
                      <img src="https://cdn.razorpay.com/logo.svg" alt="Razorpay" className="h-4 brightness-0 invert" />
                    </div>
                  </motion.div>

                  <button
                    onClick={() => setCurrentStep(2)}
                    className="w-full text-slate-400 font-bold hover:text-slate-600 transition-colors text-center"
                  >
                    Change details
                  </button>
                </div>
              </div>
            </section>
          </motion.div>
        )
      }

      {/* Spacing */}
      <div className="h-20" />

      {/* Recurring Confirmation Popup */}
      {
        showRecurringConfirm && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
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