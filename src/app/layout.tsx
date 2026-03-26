import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Primary Brain Health",
  description:
    "Primary Brain Health is a virtual-first clinic dedicated to dementia prevention and cognitive optimization. Book your initial brain health consultation today.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer
          social={{
            twitter: "https://twitter.com/tinacms",
            github: "https://github.com/tinacms/tinacms",
            linkedin: "https://linkedin.com/company/tinacms",
          }}
        />
      </body>
    </html>
  );
}
