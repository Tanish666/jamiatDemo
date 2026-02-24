// app/layout.js
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import Headers from "../components/navbar";
import FooterNav from "../components/footer/FooterNav";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Poppins, Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata = {
  title:
    "Jamiat Foundation - Transforming Backward and Minority Communities with Zakat & Sadaqa for Education, Healthcare & Empowerment",
  description:
    "Jamiat Foundation is a non-profit initiative dedicated to channeling Zakat and Sadaqah efficiently for poverty alleviation, quality education, accessible healthcare, and sustainable community development. Join us to empower lives through transparency and impact-driven programs.",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
  keywords: [
    "Jamiat foundation",
    "zakat",
    "sadaqah",
    "donate zakat online",
    "charity India",
    "NGO for Muslims",
    "poverty alleviation",
    "education support",
    "healthcare for poor",
    "sustainable community development",
    "Islamic charity",
    "donate online India",
    "social justice",
  ],
  openGraph: {
    type: "website",
    site_name: "Jamiat Foundation",
    title:
      "Jamiat Foundation - Empowering Backward and Minority Communities with Zakat & Sadaqa for Education, Healthcare & Socio-Economic Empowerment",
    description:
      "Jamiat Foundation's Funds transform donations into real impact: poverty alleviation, education, healthcare, and sustainable development. Join our mission to empower backward and minority communities in a centralized way.",
    url: "https://jamiat.org.in/",
    image:
      "https://res.cloudinary.com/doxoxzz02/image/upload/v1755268342/Zakath_Fund_zsrpnx.jpg",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Jamiat - Transforming Communities with Zakat, Education & Healthcare",
    description:
      "Jamiat channels Zakat and Sadaqah to create sustainable change in poverty alleviation, education, healthcare, and empowerment. Be part of the impact.",
    image:
      "https://res.cloudinary.com/doxoxzz02/image/upload/v1755268342/Zakath_Fund_zsrpnx.jpg",
  },
};

import ScrollToTop from "../components/ScrollToTop";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-MDPL2JC1H2"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-MDPL2JC1H2');
            `}
          </Script>
        </head>
        <body
          className={`${inter.className}`}
        >
          <ScrollToTop />
          <Headers />
          {children}
          <FooterNav />
        </body>
      </html>
    </ClerkProvider>
  );
}
