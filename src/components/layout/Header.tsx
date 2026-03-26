"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  link: string;
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  const nav: NavItem[] = [
    { label: "About", link: "#about" },
    { label: "Who It's For", link: "#who-it-is-for" },
    { label: "How It Works", link: "#how-it-works" },
    { label: "Why Us", link: "#why-us" },
  ];

  useEffect(() => {
    const navIds = nav.map((item) => item.link.slice(1));
    const allIds = [...navIds, "intake"];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (navIds.includes(id)) {
              setActiveHash(`#${id}`);
            } else {
              setActiveHash("");
            }
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );

    allIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl shadow-[0px_12px_32px_rgba(4,22,50,0.06)]">
      <div className="flex justify-between items-center h-20 px-8 md:px-16 max-w-[1400px] mx-auto">
        {/* Logo */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="text-xl font-bold text-primary tracking-tight font-headline"
        >
          Primary Brain Health
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {nav.map((item) => (
            <a
              key={item.link}
              href={item.link}
              className={cn(
                "font-headline text-sm font-semibold tracking-tight px-4 py-2 rounded-full transition-all",
                activeHash === item.link
                  ? "text-secondary font-bold border-b-2 border-secondary pb-1 rounded-none"
                  : "text-primary/70 hover:text-primary hover:bg-surface-container-low"
              )}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <a
          href="#intake"
          className="hidden md:inline-flex bg-primary text-on-primary px-6 py-3 rounded-full font-headline text-sm font-bold active:scale-90 transition-transform duration-200"
        >
          Book a Consultation
        </a>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-primary"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface/95 backdrop-blur-xl px-8 py-6 border-t border-outline-variant/10">
          <div className="flex flex-col gap-4">
            {nav.map((item) => (
              <a
                key={item.link}
                href={item.link}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "font-headline text-base font-semibold py-2",
                  activeHash === item.link
                    ? "text-secondary"
                    : "text-primary/70"
                )}
              >
                {item.label}
              </a>
            ))}
            <a
              href="#intake"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-primary text-on-primary px-6 py-3 rounded-full font-headline text-sm font-bold text-center mt-2"
            >
              Book a Consultation
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
