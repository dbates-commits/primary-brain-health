import type { Metadata } from "next";
import { Gilda_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollRevealInit } from "@/components/ScrollRevealInit";

const gildaDisplay = Gilda_Display({
  variable: "--font-gilda-display",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Primary Brain Health | Expert Cognitive Longevity Care",
  description:
    "Primary Brain Health is a virtual-first clinic dedicated to dementia prevention and cognitive optimization. Book your initial brain health consultation today.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${gildaDisplay.variable} font-body antialiased bg-white text-on-surface`}
      >
        <ScrollRevealInit />
        <Header />
        <main className="pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
