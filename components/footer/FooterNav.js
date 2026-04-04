"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import FooterMobileNav from "./FooterMobileNav";
import { Playfair_Display } from "next/font/google";
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin } from "lucide-react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function FooterNav() {
  const [footerData, setFooterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeText = (value) => {
    if (!value) return value;
    return value
      .replace(/Wahid Foundation/g, "Jamiat Foundation")
      .replace(/\bWahid\b/g, "Jamiat");
  };

  const normalizeFooterData = (data) => {
    if (!data) return data;
    return {
      ...data,
      orgName: normalizeText(data.orgName),
      copyrightText: normalizeText(data.copyrightText),
      volunteering: data.volunteering
        ? {
          ...data.volunteering,
          heading: normalizeText(data.volunteering.heading),
          linkLabel: normalizeText(data.volunteering.linkLabel),
        }
        : data.volunteering,
      quickLinks: Array.isArray(data.quickLinks)
        ? data.quickLinks.map((item) => ({
          ...item,
          label: normalizeText(item.label),
        }))
        : data.quickLinks,
      termsLinks: Array.isArray(data.termsLinks)
        ? data.termsLinks.map((item) => ({
          ...item,
          label: normalizeText(item.label),
        }))
        : data.termsLinks,
    };
  };

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/footer`);
        if (!res.ok) throw new Error("Failed to fetch footer data");
        const data = await res.json();
        setFooterData(normalizeFooterData(data));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFooterData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 bg-white text-slate-400 text-sm">
        Unable to load footer links.
      </div>
    );
  }

  return (
    <footer className="bg-[#F1F5F9] border-t border-gray-100 font-sans pb-16 md:pb-0">
      <div className="max-w-8xl mx-auto px-6 py-10 md:py-16 md:px-12 xl:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_0.7fr_1.3fr_1.5fr] gap-8 md:gap-12 lg:gap-x-12 xl:gap-x-16">
          {/* Logo & Description */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/logo.png"
                alt="Jamiat Logo"
                className="h-10 w-auto transition-transform group-hover:scale-105 filter brightness-0"
              />
              <span className={`${playfair.className} text-2xl font-bold text-slate-900 tracking-tight`}>
                {footerData?.orgName || "Jamiat"}
              </span>
            </Link>
            <p className="text-slate-500 text-[15px] leading-loose max-w-[280px]">
              Serving the community with transparency, ihsan, and dedication since 1995. Your trust is our amanah.
            </p>
            {/* Social Links */}
            <div className="flex gap-4 mt-2">
              {footerData?.socialLinks?.facebook && (
                <a href={footerData.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#1877F2] transition-colors">
                  <Facebook size={20} />
                </a>
              )}
              {footerData?.socialLinks?.instagram && (
                <a href={footerData.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#E4405F] transition-colors">
                  <Instagram size={20} />
                </a>
              )}
              {footerData?.socialLinks?.twitter && (
                <a href={footerData.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#1DA1F2] transition-colors">
                  <Twitter size={20} />
                </a>
              )}
              {footerData?.socialLinks?.linkedin && (
                <a href={footerData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0A66C2] transition-colors">
                  <Linkedin size={20} />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-slate-900 font-bold text-[13px] tracking-[0.1em] uppercase mb-6 md:mb-8">
              Quick Links
            </h3>
            <ul className="space-y-4">
              {footerData?.quickLinks?.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.path}
                    className="text-slate-500 hover:text-emerald-700 text-[15px] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Us */}
          <div>
            <h3 className="text-slate-900 font-bold text-[13px] tracking-[0.1em] uppercase mb-6 md:mb-8">
              Contact Us
            </h3>
            <ul className="space-y-4">
              {footerData?.contact?.email && (
                <li className="flex items-center gap-3 text-slate-500 text-[15px]">
                  <Mail size={16} className="text-emerald-600" />
                  <a href={`mailto:${footerData.contact.email}`} className="hover:text-emerald-700 transition-colors">
                    {footerData.contact.email}
                  </a>
                </li>
              )}
              {footerData?.contact?.phone && (
                <li className="flex items-center gap-3 text-slate-500 text-[15px]">
                  <Phone size={16} className="text-emerald-600" />
                  <a href={`tel:${footerData.contact.phone}`} className="hover:text-emerald-700 transition-colors">
                    {footerData.contact.phone}
                  </a>
                </li>
              )}
              {footerData?.contact?.address && (
                <li className="flex gap-3 text-slate-500 text-[15px]">
                  <MapPin size={16} className="text-emerald-600 mt-1 flex-shrink-0" />
                  <span className="leading-relaxed">
                    {footerData.contact.address}
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: Stay Connected */}
          <div>
            <h3 className="text-slate-900 font-bold text-[13px] tracking-[0.1em] uppercase mb-6 md:mb-8">
              Stay Connected
            </h3>
            <div className="space-y-5">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600/30 transition-all placeholder:text-slate-400"
                />
              </div>
              <button className="w-full bg-[#004731] hover:bg-[#003625] text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 md:mt-20 pt-8 md:pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
          <p className="text-slate-400 text-[13px] font-medium">
            {footerData?.copyrightText || `© ${new Date().getFullYear()} Jamiat Ulama-i-Hind. All rights reserved.`}
          </p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {footerData?.termsLinks?.map((link, idx) => (
              <Link
                key={idx}
                href={link.path}
                className="text-slate-400 hover:text-emerald-700 text-[13px] font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <FooterMobileNav />
    </footer>
  );
}


