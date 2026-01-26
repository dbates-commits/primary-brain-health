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
  title: "TinaShowcase - Next.js + Tina CMS Demo",
  description:
    "A sophisticated Next.js + Tina CMS demo showcasing advanced content modeling patterns including drag-and-drop blocks, variants, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
