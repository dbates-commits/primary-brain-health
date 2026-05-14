import type { Metadata } from "next";
import { Gilda_Display, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollRevealInit } from "@/components/ScrollRevealInit";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Analytics } from "@vercel/analytics/next";

const gildaDisplay = Gilda_Display({
  variable: "--font-gilda-display",
  weight: "400",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const siteTitle = "Primary Brain Health | Expert Cognitive Longevity Care";
const siteDescription =
  "Primary Brain Health is a virtual-first clinic dedicated to dementia prevention and cognitive optimization. Book your initial brain health consultation today.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: siteTitle,
    template: "%s | Primary Brain Health",
  },
  description: siteDescription,
  icons: {
    icon: [
      { url: "/images/favicon_32.png", type: "image/png", sizes: "32x32" },
      { url: "/images/favicon_64.png", type: "image/png", sizes: "64x64" },
      { url: "/images/favicon_128.png", type: "image/png", sizes: "128x128" },
      { url: "/images/favicon_256.png", type: "image/png", sizes: "256x256" },
    ],
    shortcut: "/images/favicon_32.png",
    apple: { url: "/images/favicon_256.png", sizes: "256x256" },
  },
  openGraph: {
    type: "website",
    title: siteTitle,
    description: siteDescription,
    siteName: "Primary Brain Health",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Primary Brain Health",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/images/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth bg-[#EFF6F9]">
      <body
        className={`${gildaDisplay.variable} ${inter.variable} font-body antialiased bg-white text-on-surface`}
      >
        <ScrollToTop />
        <ScrollRevealInit />
        <Header />
        <main className="pt-20">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
