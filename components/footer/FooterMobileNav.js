"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart4, Heart, Info, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/projects", icon: BarChart4, label: "Projects" },
  { path: "/donate", icon: Heart, label: "Donate" },
  { path: "/impact", icon: TrendingUp, label: "Impact" },
  { path: "/about", icon: Info, label: "About" },
];

export default function FooterMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-50 md:hidden pb-safe">
      <ul className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <li key={item.path} className="flex-1">
              <Link
                href={item.path}
                className={`flex flex-col items-center justify-center py-1.5 transition-all duration-300 relative group ${
                  isActive ? "text-emerald-600 scale-105" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <div className={`p-1 rounded-xl transition-colors ${isActive ? "bg-emerald-50" : "bg-transparent group-hover:bg-gray-50"}`}>
                  <Icon className={`w-5.5 h-5.5 ${isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
                </div>
                <span className={`text-[10px] font-bold mt-1 tracking-tight ${isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-emerald-600 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
