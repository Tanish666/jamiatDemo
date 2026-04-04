"use client";

import { SignUp } from "@clerk/nextjs";
import { Playfair_Display } from "next/font/google";
import { MoveLeft, ShieldCheck, Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
});

function SignUpContent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/";

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-teal-50/50 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 relative z-10">
        {/* Visual Content Side - Desktop Only */}
        <div className="hidden lg:flex flex-col space-y-10 lg:w-1/2 pr-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-emerald-700 font-bold hover:text-emerald-800 transition-all group w-fit"
          >
            <div className="p-2 bg-white rounded-full shadow-sm border border-emerald-100 group-hover:bg-emerald-50 transition-colors">
              <MoveLeft className="w-4 h-4" />
            </div>
            <span className="text-sm uppercase tracking-widest">Return to Home</span>
          </Link>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-700">Join our mission</span>
            </div>
            <h1 className={`${playfair.className} text-5xl xl:text-6xl font-bold text-[#1a2e35] leading-[1.1]`}>
              Create an account & <br />
              <span className="text-emerald-600">Empower Lives</span>
            </h1>
            <p className="text-gray-500 text-lg max-w-md leading-relaxed font-medium">
              Join thousands of donors making a real difference. Track your impact, manage recurring donations, and stay updated with our latest projects.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-[24px] border border-emerald-50 flex items-start gap-4 hover:shadow-xl hover:bg-white transition-all duration-300">
              <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#1a2e35]">Secure & Private</h4>
                <p className="text-sm text-gray-500 mt-1">Data is encrypted.</p>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-[24px] border border-emerald-50 flex items-start gap-4 hover:shadow-xl hover:bg-white transition-all duration-300">
              <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#1a2e35]">Impact Reports</h4>
                <p className="text-sm text-gray-500 mt-1">Detailed insights.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Form Side */}
        <div className="w-full lg:w-1/2 flex justify-center items-center">
          <div className="w-full max-w-md flex justify-center">
            <SignUp
              appearance={{
                elements: {
                  rootBox: "w-full flex justify-center mx-0",
                  card: "w-full shadow-none border-none p-6 sm:p-12 bg-transparent mx-auto",
                  headerTitle: `${playfair.className} text-4xl font-bold text-[#1a2e35] mb-2`,
                  headerSubtitle: "text-gray-400 font-medium text-base tracking-tight",
                  formButtonPrimary:
                    "bg-[#064e3b] hover:bg-[#065f46] text-sm font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/10 active:scale-[0.98] uppercase tracking-widest",
                  socialButtonsBlockButton: "border-gray-100 hover:bg-gray-50/80 transition-all rounded-2xl py-3.5 border-2 shadow-sm",
                  socialButtonsBlockButtonText: "font-bold text-gray-700 text-sm",
                  formFieldLabel: "text-[#1a2e35] font-bold text-[11px] uppercase tracking-[0.15em] mb-2.5 ml-1",
                  formFieldInput: "bg-gray-50/80 border-gray-100 focus:border-emerald-500/50 focus:bg-white rounded-2xl py-3.5 px-5 transition-all outline-none border-2",
                  footerActionLink: "text-emerald-600 hover:text-emerald-700 font-bold transition-colors",
                  dividerText: "text-gray-300 text-[10px) font-bold uppercase tracking-[0.3em]",
                  identityPreviewText: "text-[#1a2e35] font-bold",
                  identityPreviewEditButton: "text-emerald-600 font-bold",
                }
              }}
              fallbackRedirectUrl={redirectUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}