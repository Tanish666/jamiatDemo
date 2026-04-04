// components/ShareButton.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function ShareButton({ slug, title, type = "projects", align = "right" }) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getUrl = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    if (slug) {
      return `${baseUrl}/${type}/${slug}`;
    }
    return typeof window !== "undefined" ? window.location.href : "";
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleWhatsAppShare = () => {
    const url = getUrl();
    const prefix = type === "blogs" ? "blog post" : "project";
    const text = title ? `Check out this ${prefix}: ${title}\n\n${url}` : `Check out this ${prefix}!\n\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    setIsOpen(false);
  };

  const displayType = type === "blogs" ? "Blog Post" : "Project";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${isOpen ? "bg-white text-emerald-600 shadow-lg scale-105" : "bg-gray-50 text-gray-700 shadow-sm hover:bg-white hover:text-emerald-600 border border-gray-100"
          }`}
        aria-label={`Share ${displayType}`}
      >
        <Share2 className="w-4 h-4 transition-all duration-300" />
      </button>

      {isOpen && (
        <div className={`absolute mt-3 w-60 bg-white/95 backdrop-blur-xl rounded-[1.5rem] shadow-[0_20px_40px_rgb(0,0,0,0.15)] border border-white p-2 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300 ${
          align === "left" ? "left-0 origin-top-left" : "right-0 origin-top-right"
        }`}>
          <div className="px-3 py-2.5 border-b border-gray-100/60 mb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Share {displayType}</span>
          </div>

          <button
            onClick={handleCopy}
            className="w-full px-2 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-emerald-50 rounded-xl flex items-center gap-3 transition-all group"
          >
            <div className={`p-2 rounded-lg transition-all duration-300 ${copied ? 'bg-emerald-500 text-white shadow-md' : 'bg-gray-50 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600'}`}>
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </div>
            <span className={`transition-colors duration-300 ${copied ? 'text-emerald-600' : 'group-hover:text-emerald-600'}`}>
              {copied ? "Copied" : "Copy Link"}
            </span>
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="w-full px-2 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-[#25D366]/10 rounded-xl flex items-center gap-3 transition-all group mt-1"
          >
            <div className="p-2 rounded-lg bg-gray-50 text-gray-500 group-hover:bg-[#25D366] group-hover:text-white group-hover:shadow-md transition-all duration-300">
              <FaWhatsapp className="w-4 h-4" />
            </div>
            <span className="group-hover:text-[#25D366] transition-colors duration-300">Share on WhatsApp</span>
          </button>
        </div>
      )}
    </div>
  );
}
