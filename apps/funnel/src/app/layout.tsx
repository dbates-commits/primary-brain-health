import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Primary Brain Health — Get Started",
  description: "Begin your $149 cognitive wellness assessment.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
