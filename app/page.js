"use client";

import { useEffect, useState } from "react";
import HeroSection from "../components/HeroSection";
import ImpactStats from "../components/ImpactSection";
import ProjectCardsSection from "../components/ProjectCardsSection";
import Link from "next/link";
import Lenis from "lenis";
import MobileDonationCategories from "../components/donationtype";
import useResponsiveLimit from "./hooks/useResponsiveLimit";
import HomePageHeroSection from "../components/homePageHeroSection";
import { Sparkles, ArrowRight } from "lucide-react";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"], // choose weights you want
});
async function getHeroData() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/homeherosection`,
      {
        cache: "force-cache",
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (e) {
    return null;
  }
}

export default function Home() {
  const [quote, setQuote] = useState(null);
  const [heroData, setHeroData] = useState(null);

  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://jamiat.org.in/#organization",
        name: "Jamiat",
        alternateName: "Jamiat Foundation",
        url: "https://jamiat.org.in",
        logo: "https://res.cloudinary.com/doxoxzz02/image/upload/v1755268285/Wahid_Logo_Green_xwcrq8.png",
        sameAs: [
          "https://www.facebook.com/jamiat.org.in",
          "https://www.instagram.com/wahid.foundation",
          "https://www.linkedin.com/company/wahid-foundation-india/",
          "https://x.com/wahid_trust",
          "https://www.youtube.com/@wahid.foundation",
        ],
        description:
          "Jamiat Foundation is a non-profit social welfare initiative that unites Indian backward and minority communities by collecting Re.1 a day per person to fund education, healthcare, scholarships, entrepreneurship, and community development projects.",
        foundingDate: "2024-10-09",
        founder: [
          {
            "@type": "Person",
            name: "Harab Rasheed",
            jobTitle: "Founder & CEO",
            description:
              "Founder of Jamiat Foundation, Marhaba Haji and Revivoheal, a serial entrepreneur, IIM Bombay graduate, with experience in strategy consulting and halal tourism.",
            sameAs: [
              "https://www.linkedin.com/in/harabrasheed",
              "https://www.facebook.com/harabrasheed/",
              "https://x.com/harabrasheed",
              "https://www.instagram.com/harabrasheed/",
            ],
          },
          {
            "@type": "Person",
            name: "Raashid Sherif",
            jobTitle: "Co-Founder & COO",
            description:
              "Co-Founder of Jamiat Foundation, COO of Rehbar, Hafiz-e-Qur'an, Islamic finance scholar with over a decade of experience in Sharia-compliant financial solutions.",
            sameAs: ["https://www.linkedin.com/in/raashidsherif"],
          },
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "info@jamiat.org.in",
          telephone: "+91-9480389296",
          areaServed: "IN",
          availableLanguage: "en",
        },
        address: {
          "@type": "PostalAddress",
          addressCountry: "India",
        },
        knowsAbout: [
          "Zakat",
          "Sadaqah",
          "Islamic Finance",
          "Healthcare",
          "Education",
          "Community Empowerment",
          "Scholarship Funds",
          "Microfinance",
        ],
      },
      {
        "@type": "Project",
        "@id": "https://jamiat.org.in/#general-zakath-fund",
        name: "General Zakath Fund",
        description:
          "Fund dedicated to collecting and distributing zakath for social welfare and poverty alleviation.",
        parentOrganization: { "@id": "https://jamiat.org.in/#organization" },
        url: "https://jamiat.org.in/projects/general-zakath-fund",
      },
      {
        "@type": "Project",
        "@id": "https://jamiat.org.in/#general-sadqa-fund",
        name: "General Sadqa Fund",
        description:
          "Charity-based fund for immediate social relief and community aid initiatives.",
        parentOrganization: { "@id": "https://jamiat.org.in/#organization" },
        url: "https://jamiat.org.in/projects/general-sadqa-fund",
      },
      {
        "@type": "Project",
        "@id": "https://jamiat.org.in/#interest-purification-fund",
        name: "Interest Income Purification Fund",
        description:
          "Fund used for purification of riba income and channeling it towards public welfare.",
        parentOrganization: { "@id": "https://jamiat.org.in/#organization" },
        url: "https://jamiat.org.in/projects/interest-purification-fund",
      },
      {
        "@type": "Project",
        "@id": "https://jamiat.org.in/#ias-ips-coaching-fund",
        name: "IAS/IPS Coaching Scholarship Fund",
        description:
          "Scholarship fund to support minority students preparing for IAS/IPS competitive exams.",
        parentOrganization: { "@id": "https://jamiat.org.in/#organization" },
        url: "https://jamiat.org.in/projects/ias-ips-coaching-fund",
      },
      {
        "@type": "Project",
        "@id": "https://jamiat.org.in/#school-development-fund",
        name: "Minority Modern School Development Fund",
        description:
          "Fund to develop modern schools providing quality education for minority communities.",
        parentOrganization: { "@id": "https://jamiat.org.in/#organization" },
        url: "https://jamiat.org.in/projects/school-development-fund",
      },
      {
        "@type": "Project",
        "@id": "https://jamiat.org.in/#prisoner-release-fund",
        name: "Release Innocent Prisoners Fund",
        description:
          "Support fund to legally and financially assist in releasing innocent prisoners.",
        parentOrganization: { "@id": "https://jamiat.org.in/#organization" },
        url: "https://jamiat.org.in/projects/prisoner-release-fund",
      },
      {
        "@type": "Project",
        "@id": "https://jamiat.org.in/#microfinance-fund",
        name: "Minority Entrepreneur Micro Finance Fund",
        description:
          "Micro-finance fund to empower minority entrepreneurs with small-scale business support.",
        parentOrganization: { "@id": "https://jamiat.org.in/#organization" },
        url: "https://jamiat.org.in/projects/microfinance-fund",
      },
      {
        "@type": "Project",
        "@id": "https://jamiat.org.in/#lawyers-scholarship-fund",
        name: "100 Minority Community Lawyers' Scholarship Fund",
        description:
          "Scholarship program to create 100 qualified minority community lawyers.",
        parentOrganization: { "@id": "https://jamiat.org.in/#organization" },
        url: "https://jamiat.org.in/projects/lawyers-scholarship-fund",
      },
      {
        "@type": "Project",
        "@id": "https://jamiat.org.in/#al-ansaar-trust-fund",
        name: "Al Ansaar Trust Fund",
        description:
          "Dedicated trust fund supporting local mosque programs for community welfare in Bangalore through aid for healthcare, education, economic upliftment, and Ramadan community meals.",
        parentOrganization: { "@id": "https://jamiat.org.in/#organization" },
        url: "https://jamiat.org.in/projects/al-ansaar-trust-fund",
        areaServed: "Bangalore",
      },
      {
        "@type": "Project",
        "@id": "https://jamiat.org.in/#hospital-development-fund",
        name: "Minority Modern Hospital Development Fund",
        description:
          "Fund to develop modern hospitals with advanced healthcare facilities for minority communities.",
        parentOrganization: { "@id": "https://jamiat.org.in/#organization" },
        url: "https://jamiat.org.in/projects/hospital-development-fund",
      },
      {
        "@type": "Project",
        "@id": "https://jamiat.org.in/#cancer-treatment-fund",
        name: "Cancer Treatment Fund for Poor",
        description:
          "Fund to provide financial assistance for poor patients battling cancer.",
        parentOrganization: { "@id": "https://jamiat.org.in/#organization" },
        url: "https://jamiat.org.in/projects/cancer-treatment-fund",
      },
      {
        "@type": "Project",
        "@id": "https://jamiat.org.in/#dialysis-treatment-fund",
        name: "Dialysis Treatment Fund for Poor",
        description:
          "Fund to support dialysis treatments for underprivileged patients with kidney issues.",
        parentOrganization: { "@id": "https://jamiat.org.in/#organization" },
        url: "https://jamiat.org.in/projects/dialysis-treatment-fund",
      },
      {
        "@type": "Project",
        "@id": "https://jamiat.org.in/#doctors-scholarship-fund",
        name: "100 Minority Doctors' Scholarship Fund",
        description:
          "Scholarship program to create 100 doctors from minority communities.",
        parentOrganization: { "@id": "https://jamiat.org.in/#organization" },
        url: "https://jamiat.org.in/projects/doctors-scholarship-fund",
      },
      {
        "@type": "Project",
        "@id": "https://jamiat.org.in/#news-channel-fund",
        name: "Minority News Channel Development Fund",
        description:
          "Fund to build and operate a modern news channel to empower minority voices.",
        parentOrganization: { "@id": "https://jamiat.org.in/#organization" },
        url: "https://jamiat.org.in/projects/news-channel-fund",
      },
      {
        "@type": "WebSite",
        "@id": "https://jamiat.org.in/#website",
        url: "https://jamiat.org.in",
        name: "Jamiat",
        publisher: { "@id": "https://jamiat.org.in/#organization" },
        potentialAction: {
          "@type": "SearchAction",
          target: "https://jamiat.org.in/search?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebPage",
        "@id": "https://jamiat.org.in/#webpage",
        url: "https://jamiat.org.in",
        name: "Jamiat - Social Welfare Projects & Funds",
        isPartOf: { "@id": "https://jamiat.org.in/#website" },
        about: { "@id": "https://jamiat.org.in/#organization" },
        primaryImageOfPage:
          "https://res.cloudinary.com/doxoxzz02/image/upload/v1755268342/Zakath_Fund_zsrpnx.jpg",
        datePublished: "2024-10-09",
        dateModified: "2025-09-01",
        inLanguage: "en",
        potentialAction: [
          {
            "@type": "DonateAction",
            target: "https://jamiat.org.in/donate",
            recipient: { "@id": "https://jamiat.org.in/#organization" },
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": "https://jamiat.org.in/#faq",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is Jamiat?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Jamiat is a social welfare initiative collecting Re.1 per day from Indians to fund education, healthcare, scholarships, and community development.",
            },
          },
          {
            "@type": "Question",
            name: "How can I donate to Jamiat?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "You can donate through our official website jamiat.org.in using secure payment methods. Even Re.1 a day makes a big impact.",
            },
          },
          {
            "@type": "Question",
            name: "Which projects does Jamiat support?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Jamiat supports 14 ongoing projects including scholarships, healthcare funds, microfinance, school and hospital development, prisoner release, and more.",
            },
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://jamiat.org.in",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Projects",
            item: "https://jamiat.org.in/projects",
          },
        ],
      },
    ],
  };

  useEffect(() => {
    const lenis = new Lenis({
      duration: 2
    });
    let rafId;
    function raf(time) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf);

    async function fetchHero() {
      const data = await getHeroData();
      setHeroData(data);
    }

    fetchHero();

    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
    };
  }, []);


  useEffect(() => {
    async function fetchQuote() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/homequotesection`,
          {
            next: { revalidate: 3600 },
          }
        );

        const data = await res.json();
        setQuote(data);
      } catch (e) {
        setQuote(null);
      }
    }
    fetchQuote();
  }, []);

  return (
    <>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </head>

      <div className="flex flex-col bg-white overflow-hidden">

        {/* <HeroSection hero={heroData} /> */}
        <HomePageHeroSection hero={heroData} />

        <section className="py-16 lg:py-24 text-[#1E293B]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 lg:mb-20">
              <h2 className={`${playfair.className} text-4xl lg:text-6xl font-bold text-slate-900 mb-4 tracking-tight`}>
                Urgent Projects
              </h2>
              <p className="text-slate-600 text-base lg:text-xl max-w-3xl mx-auto leading-relaxed">
                These initiatives require immediate attention. Your support can turn the tide for families facing crisis right now.
              </p>
              <div className="h-1.5 w-20 bg-emerald-500 mt-6 mx-auto rounded-full"></div>
            </div>

            {(() => {
              const limit = useResponsiveLimit();
              return <ProjectCardsSection initialLimit={limit} infiniteScroll={false} />;
            })()}

            <div className="mt-12 flex justify-center">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-[#00d084] font-bold hover:gap-3 transition-all"
              >
                View All Active Projects <span className="text-xl">→</span>
              </Link>
            </div>
          </div>
        </section>


        <div className="border-b border-slate-100 bg-[#F1F5F9]">
          <ImpactStats />
        </div>

        {/* Inspirational Quote Section */}
        <section className="relative py-24 lg:py-18 overflow-hidden bg-white">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-50/30 to-transparent"></div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Decorative Quote Icon */}
            <div className="mb-0 flex justify-center">
              <div className="size-16 rounded-2xl bg-amber-100 flex items-center justify-center rotate-3 shadow-sm">
                <span className="text-5xl text-amber-600 font-serif mb-2 leading-none">"</span>
              </div>
            </div>

            <div className="space-y-10">
              <h3 className="font-serif italic text-4xl lg:text-5xl text-slate-800 leading-tight lg:leading-[1.5] tracking-tight max-w-3xl mx-auto">
                {quote?.text ||
                  "Whoever saves one life - it is as if he had saved mankind entirely."}
              </h3>

              <div className="flex items-center justify-center gap-6">
                <div className="h-px w-12 bg-amber-200"></div>
                <p className="text-sm lg:text-base font-bold text-amber-700 tracking-widest uppercase">
                  {quote?.reference || "Surah Al-Ma'idah 5:32"}
                </p>
                <div className="h-px w-12 bg-amber-200"></div>
              </div>
            </div>
          </div>
        </section>

        <div className="border-y border-slate-100">
          <MobileDonationCategories />
        </div>



        {/* Ready to Make a Difference CTA */}
        <section className="mx-4 sm:mx-6 lg:mx-10 mb-8 py-16 lg:py-22 px-6 relative overflow-hidden bg-[#06422d] rounded-[2rem] lg:rounded-[4rem] mt-8">
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/5 blur-[120px] rounded-full translate-x-1/2"></div>

          <div className="relative max-w-4xl mx-auto text-center space-y-10">
            <div className="space-y-6">
              <h2 className={`${playfair.className} text-5xl lg:text-6xl font-bold text-white font-serif tracking-tight leading-tight`}>
                Ready to Make a Difference?
              </h2>

              <p className="text-white/80 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
                Join our community of over 10,000 donors who are changing lives every single day.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/projects/general-sadqa-fund"
                className="w-full sm:w-auto px-10 py-4 bg-white text-[#06422d] hover:bg-emerald-50 text-lg font-bold rounded-2xl transition-all duration-300 active:scale-[0.98] flex items-center justify-center"
              >
                Start Donating
              </Link>

              <Link
                href="/projects"
                className="w-full sm:w-auto px-10 py-4 bg-transparent border border-white text-white hover:bg-white/10 text-lg font-bold rounded-2xl transition-all duration-300 flex items-center justify-center"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
