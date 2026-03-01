"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";


import {
  Heart,
  Users,
  Gift,
  HandCoins,
  CircleDollarSign,
  Repeat,
  FileBadge,
  IndianRupee,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function DonatePage() {

  const { user } = useUser();
  const [isRecurring, setIsRecurring] = useState(false);
  const [donationFrequency, setDonationFrequency] = useState("Monthly");
  const [requestCertificate, setRequestCertificate] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [customAmount, setCustomAmount] = useState(50);
  const [donationType, setDonationType] = useState(null);
  const { category } = useParams();
  const quickAmounts = [1000, 2500, 5000, 10000, 15000, 25000];
  const impact = (() => {
    const daily =
      donationFrequency === "Weekly"
        ? customAmount / 7
        : donationFrequency === "Monthly"
          ? customAmount / 30
          : customAmount / 365;
    return {
      Monthly: (daily * 30).toFixed(0),
      Yearly: (daily * 365).toFixed(0),
    };
  })();
  const [donationFor, setDonationFor] = useState("self");
  const [dedicatedTo, setDedicatedTo] = useState("");
  const [message, setMessage] = useState("");
  const minAmounts = {
    "One-Time": 50,
    Weekly: 20,
    Monthly: 50,
    Yearly: 365,
  };
  const minAmount = isRecurring
    ? minAmounts[donationFrequency] || 50
    : minAmounts["One-Time"];
  const name = user?.fullName || "Anonymous";
  const email = user?.emailAddresses[0]?.emailAddress || "";

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/projects?donation_type=${category}&page=1&limit=6`
        );
        const data = await res.json();
        setProjects(data.projects || []);
        if (data.projects?.length > 0) {
          setSelectedProjectId(data.projects[1]._id); // Default to first project
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    }

    fetchProjects();
  }, []);

  useEffect(() => {
    if (!customAmount || customAmount < minAmount) {
      setCustomAmount(minAmount);
    }
  }, [minAmount]);

  // Razorpay Payment Handler
  const handlePayment = () => {
    if (!isSignedIn) {
      router.push("/login");
      return;
    }
    if (!customAmount || customAmount < minAmount) {
      alert(`Please enter a valid donation amount (minimum ₹${minAmount}).`);
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

    // Load Razorpay SDK
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const selectedProject = projects.find((p) => p._id === selectedProjectId);
      const options = {
        key: "rzp_live_lfzYuYY8Jv6NQG", // Replace with your Razorpay Key ID
        amount: customAmount * 100, // Amount in paise
        currency: "INR",
        name: "Jamiat Foundation",
        description: `Donation for ${selectedProject?.title || "General Fund"}`,
        image: "https://cdn.razorpay.com/logo.svg", // Optional: Your logo
        handler: async function (response) {
          alert(
            `Payment successful! Payment ID: ${response.razorpay_payment_id}`
          );

          // 1) Capture the payment on the server
          try {
            const captureRes = await fetch("/api/capture-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentId: response.razorpay_payment_id,
                amount: customAmount,
              }),
            });

            const captureData = await captureRes.json();
            if (!captureRes.ok) {
              console.error("Capture failed:", captureData);
              alert("Payment capture failed. Please contact support.");
              return;
            }
          } catch (err) {
            console.error("Capture error:", err);
            alert("Payment capture failed. Please contact support.");
            return;
          }

          // 2) Save donation details
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/save-donation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentId: response.razorpay_payment_id,
              amount: customAmount,
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
          color: "#059669", // Emerald-600
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    };

    script.onerror = () => {
      alert("Failed to load Razorpay SDK. Please try again later.");
    };
  };

  if (projects.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white text-gray-900">
        <p>Loading projects...</p>
      </main>
    );
  }

  const selectedProject = projects.find((p) => p._id === selectedProjectId);
  const donationTypes =
    selectedProject?.donationOptions?.filter((opt) => opt.isEnabled) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
        <div
          className="absolute inset-0 opacity-10 bg-center bg-cover"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80')",
            backgroundBlendMode: "overlay",
          }}
        />
        <div className="relative px-5 py-12 lg:py-10">
          <div className="max-w-md mx-auto space-y-6 lg:max-w-4xl lg:space-y-10">
            <div className="space-y-2 lg:text-center lg:space-y-6">
              <h1 className="text-4xl font-bold leading-tight tracking-tight lg:text-6xl lg:leading-tight">
                Make Your Donation
              </h1>
              <p className="text-emerald-50 text-lg leading-relaxed lg:text-2xl lg:max-w-3xl lg:mx-auto lg:leading-relaxed">
                Your generosity creates lasting change. Every rupee counts in
                building a better tomorrow.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 lg:max-w-2xl lg:mx-auto lg:p-8 lg:gap-8 lg:rounded-2xl">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1 lg:text-4xl lg:mb-2">
                  10K+
                </div>
                <div className="text-xs text-emerald-100 lg:text-base">
                  Active Donors
                </div>
              </div>
              <div className="text-center border-x border-white/20">
                <div className="text-2xl font-bold mb-1 lg:text-4xl lg:mb-2">
                  25K+
                </div>
                <div className="text-xs text-emerald-100 lg:text-base">
                  Lives Impacted
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1 lg:text-4xl lg:mb-2">
                  14
                </div>
                <div className="text-xs text-emerald-100 lg:text-base">
                  States Reached
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Selection */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white border rounded-xl shadow p-6 space-y-4">
          <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
            <Heart className="h-5 w-5 text-emerald-600" />
            <span>Select Project</span>
          </div>
          <p className="text-sm text-gray-500">
            Choose the project you want to support with your donation
          </p>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full h-10 px-3 rounded border border-gray-300 focus:outline-none focus:ring focus:ring-emerald-200 text-black"
          >
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Cards Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Choose Donation Type */}
          <div className="flex-1 bg-white border rounded-xl shadow p-6 space-y-4">
            <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <Heart className="h-5 w-5 text-emerald-600" />
              <span>Choose Donation Type</span>
            </div>
            <p className="text-sm text-gray-500">
              Select the category that aligns with your intention
            </p>
            <div className="space-y-4">
              {donationTypes.map((opt) => (
                <label
                  key={opt.type}
                  className={`flex flex-col p-4 rounded-xl border cursor-pointer ${donationType === opt.type
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50"
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="donationType"
                      value={opt.type}
                      checked={donationType === opt.type}
                      onChange={() => setDonationType(opt.type)}
                      className="h-4 w-4 accent-emerald-600"
                    />
                    {opt.type === "General Donation" && (
                      <Heart className="h-5 w-5 text-emerald-600" />
                    )}
                    {opt.type === "Zakat" && (
                      <Gift className="h-5 w-5 text-blue-600" />
                    )}
                    {opt.type === "Sadqa" && (
                      <HandCoins className="h-5 w-5 text-orange-600" />
                    )}
                    {opt.type === "Interest Earnings" && (
                      <CircleDollarSign className="h-5 w-5 text-purple-600" />
                    )}
                    <span className="font-semibold text-gray-900">
                      {opt.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {opt.type === "General Donation" &&
                      "Support our overall mission"}
                    {opt.type === "Zakat" && "Islamic obligatory charity"}
                    {opt.type === "Sadqa" && "Voluntary Islamic charity"}
                    {opt.type === "Interest Earnings" && "Purify your wealth"}
                  </p>
                </label>
              ))}
            </div>
          </div>

          {/* Donation Dedication */}
          <div className="flex-1 bg-white border rounded-xl shadow p-6 space-y-4">
            <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <Users className="h-5 w-5 text-emerald-600" />
              <span>Donation Dedication</span>
            </div>
            <p className="text-sm text-gray-500">Who is this donation for?</p>
            <div className="space-y-3">
              {[
                { value: "self", label: "For myself" },
                { value: "family", label: "On behalf of family member" },
                { value: "memory", label: "In memory of someone" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer ${donationFor === option.value
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50"
                    }`}
                >
                  <input
                    type="radio"
                    name="donationFor"
                    value={option.value}
                    checked={donationFor === option.value}
                    onChange={() => setDonationFor(option.value)}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  <span className="font-medium text-gray-900">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
            {(donationFor === "family" || donationFor === "memory") && (
              <div>
                <label className="block font-medium text-sm text-gray-700 mb-1">
                  {donationFor === "family"
                    ? "Family member name"
                    : "In memory of"}
                </label>
                <input
                  type="text"
                  className="w-full h-10 px-3 rounded border border-gray-300 focus:outline-none focus:ring focus:ring-emerald-200"
                  placeholder={
                    donationFor === "family"
                      ? "Enter family member name"
                      : "Enter name of loved one"
                  }
                  value={dedicatedTo}
                  onChange={(e) => setDedicatedTo(e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="block font-medium text-sm text-gray-700 mb-1">
                Message (Optional)
              </label>
              <textarea
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-emerald-200"
                placeholder="Add a personal message or prayer..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 py-2">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Donation Frequency Card */}
          <div className="flex-1 p-6 bg-white border rounded-xl shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <Repeat className="h-6 w-6 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Choose Donation Frequency
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              Select whether you'd like to make a recurring or one-time donation
            </p>
            <label className="flex items-start space-x-3 mt-4 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 scale-125 accent-emerald-600"
                checked={isRecurring}
                onChange={() => setIsRecurring(!isRecurring)}
              />
              <div>
                <p className="font-medium text-gray-900">
                  Make this a recurring donation
                </p>
                <p className="text-sm text-gray-600">
                  Set up automatic donations to provide consistent support
                </p>
              </div>
            </label>
            {isRecurring && (
              <div className="mt-4 space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Select frequency:
                </label>
                <div className="space-y-2">
                  {["Weekly", "Monthly", "Yearly"].map((freq) => (
                    <label key={freq} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="frequency"
                        value={freq}
                        checked={donationFrequency === freq}
                        onChange={() => setDonationFrequency(freq)}
                        className="h-4 w-4 accent-emerald-600"
                      />
                      <span className="text-gray-800">{freq}</span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  Minimum donation for {donationFrequency.toLowerCase()} is ₹
                  {minAmount}.
                </p>
              </div>
            )}
          </div>

          {/* Tax Exemption Certificate Card */}
          <div className="flex-1 p-6 bg-white border rounded-xl shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <FileBadge className="h-6 w-6 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Tax Exemption Certificate
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              Request a tax exemption certificate for your donation
            </p>
            <label className="flex items-start space-x-3 mt-4 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 scale-125 accent-emerald-600"
                checked={requestCertificate}
                onChange={() => setRequestCertificate(!requestCertificate)}
              />
              <div>
                <p className="font-medium text-gray-900">
                  Generate Tax Exemption Certificate
                </p>
                <p className="text-sm text-gray-600">
                  Request an official tax exemption certificate for your
                  donation that can be used for tax deductions
                </p>
              </div>
            </label>
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Choose Amount */}
          <div className="flex-1 p-6 bg-white border rounded-xl shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <IndianRupee className="h-6 w-6 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Choose Your {isRecurring ? donationFrequency : "One-Time"}{" "}
                Amount
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              Select how much you'd like to donate{" "}
              {isRecurring && `on a ${donationFrequency.toLowerCase()} basis`}.
            </p>
            <div className="grid grid-cols-3 gap-3 text-black">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setCustomAmount(amount)}
                  className={`py-2 px-4 rounded-lg border text-sm font-semibold hover:border-emerald-300 hover:bg-emerald-50 ${customAmount === amount
                    ? "bg-emerald-100 border-emerald-400"
                    : "border-gray-300"
                    }`}
                >
                  ₹{amount.toLocaleString()}
                </button>
              ))}
            </div>
            <div className="mt-4 text-black">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Amount (Min ₹{minAmount})
              </label>
              <input
                type="number"
                min={minAmount}
                value={customAmount}
                onChange={(e) => setCustomAmount(Number(e.target.value))}
                className="w-full h-10 px-3 rounded border border-gray-300 focus:outline-none focus:ring focus:ring-emerald-200"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum donation: ₹{minAmount}
              </p>
            </div>
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                Your Contribution Impact
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm text-gray-700">
                <div className="text-center">
                  <div className="font-bold text-lg">₹{impact.Monthly}</div>
                  <div>Monthly</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">₹{impact.Yearly}</div>
                  <div>Yearly</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
      <section className="max-w-xl mx-auto mt-11 bg-green-50 p-6 rounded-2xl shadow-sm">
        <h2 className="text-center text-xl font-semibold text-green-800 mb-6">
          Donation Summary
        </h2>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex justify-between items-center bg-white rounded-lg px-4 py-2">
            <span className="text-gray-500">Donation Type</span>
            <span className="font-medium">{donationType || "—"}</span>
          </div>
          <div className="flex justify-between items-center bg-white rounded-lg px-4 py-2">
            <span className="text-gray-500">Donation Frequency</span>
            <span className="font-medium">
              {isRecurring ? donationFrequency : "One-Time"}
            </span>
          </div>
          <div className="flex justify-between items-center bg-white rounded-lg px-4 py-2">
            <span className="text-gray-500">
              {isRecurring ? `${donationFrequency} Amount` : "Amount"}
            </span>
            <span className="font-medium">₹{customAmount}</span>
          </div>
          <div className="flex justify-between items-center bg-white rounded-lg px-4 py-2">
            <span className="text-gray-500">Project</span>
            <span className="font-semibold text-right">
              {selectedProject?.title || "—"}
            </span>
          </div>
          <div className="flex justify-between items-center bg-white rounded-lg px-4 py-2">
            <span className="text-gray-500">Tax Certificate</span>
            <span className="font-medium">
              {requestCertificate ? "Requested" : "Not requested"}
            </span>
          </div>
        </div>
        <button
          onClick={handlePayment}
          className="w-full mt-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold flex items-center justify-center hover:bg-emerald-700 transition"
        >
          <span className="mr-2">💚</span>
          Proceed to Payment →
        </button>
        <div className="mt-4 text-center text-xs text-gray-500 flex items-center justify-center space-x-2">
          <img
            src="https://cdn.razorpay.com/logo.svg"
            alt="Razorpay"
            className="h-4 w-auto"
          />
          <span>Secure payment powered by Razorpay</span>
        </div>
      </section>
    </div>
  );
}
