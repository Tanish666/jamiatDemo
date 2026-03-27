"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { Playfair_Display } from "next/font/google";
import { usePathname } from "next/navigation";
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function Headers() {

  const [isOpen, setIsOpen] = useState(false);
  const { user, isSignedIn } = useUser();
  const [emergencyVisibility, setEmergencyVisibility] = useState(false);
  const pathname = usePathname();
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/projects", label: "Projects" },
    { href: "/impact", label: "Our Impact" },
    { href: "/about", label: "About" },
    { href: "/donate", label: "Donate" },
    { href: "/volunteer", label: "Volunteer" },
    { href: "/blogs", label: "Blogs" },
    { href: "/islamic", label: "Islamic" },
    { href: "/emergencyDonation", label: "Emergency Donation" },
  ];

  useEffect(() => {
    async function getEmergencyVisibility() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/emergency-fund/toggle`);
        const data = await res.json();
        setEmergencyVisibility(data.isActive);
      } catch (err) {
        console.error("Error fetching emergency visibility:", err);
      }
    }
    getEmergencyVisibility();
  }, []);


  return (
    <header className="fixed top-0 left-0 right-0 z-[999] transition-all duration-300">
      <div className="md:mx-4 md:mt-4">
        <div className="w-full md:max-w-8xl mx-auto backdrop-blur-md bg-[#00452E]/90 border-b md:border border-emerald-800/50 shadow-lg shadow-emerald-950/20 md:rounded-2xl px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-white/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                <img src={"/logo.png"} alt="Jamiat Foundation Logo" className="relative h-10 w-auto transition-transform duration-300 group-hover:scale-110 brightness-0 invert" />
              </div>
              <span className={`${playfair.className} text-xl lg:text-2xl font-bold text-white tracking-tight`}>
                Jamiat <span className="text-emerald-400">Ulama-i-Hind</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-8 z-50">
            {navItems.map((item) => {
              if (item.href === "/emergencyDonation" && !emergencyVisibility) return null;
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

              return (
                item.href === "/donate" ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative text-sm font-semibold transition-colors group py-2 ${isActive ? "text-emerald-300" : "text-emerald-50 hover:text-emerald-300"
                      }`}
                  >
                    {item.label}
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-emerald-400 transition-transform duration-300 origin-left ${isActive ? "w-full scale-x-100" : "w-full scale-x-0 group-hover:scale-x-100"
                      }`}
                    ></span>
                  </Link>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative text-sm font-semibold transition-colors group py-2 ${isActive ? "text-emerald-300" : "text-emerald-50 hover:text-emerald-300"
                      }`}
                  >
                    {item.label}
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-emerald-400 transition-transform duration-300 origin-left ${isActive ? "w-full scale-x-100" : "w-full scale-x-0 group-hover:scale-x-100"
                      }`}
                    ></span>
                  </Link>
                )
              );
            })}
          </nav>

          {/* Right: Auth Actions */}
          <div className="hidden xl:flex items-center gap-4">
            <SignedOut>
              <Link
                href="/login"
                className="px-5 py-2.5 text-sm font-bold text-emerald-100 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className={`${playfair.className} px-6 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-900/20 hover:bg-emerald-400 transition-all active:scale-[0.98]`}
              >
                Sign Up
              </Link>
            </SignedOut>

            <SignedIn>
              <Link href="/profile" className="flex items-center transition-transform hover:scale-105">
                <div className={`relative p-1 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-200 ${pathname === "/profile" ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#00452E]" : ""
                  }`}>
                  <img
                    src={user?.imageUrl}
                    alt="Profile"
                    className="h-9 w-9 rounded-full border-2 border-[#00452E] object-cover"
                  />
                </div>
              </Link>
            </SignedIn>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="xl:hidden p-2 text-emerald-100 hover:bg-emerald-800/50 rounded-lg transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="xl:hidden fixed inset-x-0 top-[64px] md:inset-x-4 md:top-24 z-50">
          <div className="bg-[#00452E] border-t border-emerald-800 md:border md:rounded-2xl shadow-2xl p-6 space-y-6 animate-fade-in">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => {
                if (item.href === "/emergencyDonation" && !emergencyVisibility) return null;
                const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-lg font-semibold transition-colors ${isActive ? "text-emerald-300" : "text-emerald-50 hover:text-emerald-300"
                      }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-6 border-t border-emerald-800">
              <SignedOut>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    className="w-full py-3 text-center text-emerald-100 font-bold hover:text-white"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="w-full py-3 text-center bg-emerald-500 text-white font-bold rounded-xl shadow-lg border border-emerald-400/20"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              </SignedOut>

              <SignedIn>
                <Link
                  href="/profile"
                  className="flex items-center justify-center gap-3 py-2 text-white"
                  onClick={() => setIsOpen(false)}
                >
                  <img
                    src={user?.imageUrl}
                    alt="Profile"
                    className="h-12 w-12 rounded-full border-2 border-emerald-400"
                  />
                  <span className="font-bold text-white">{user?.fullName}</span>
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
