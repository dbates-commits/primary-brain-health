"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/shared/Button";

interface NavItem {
  label: string;
  link: string;
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const pathname = usePathname();

  function handleLogoClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const nav: NavItem[] = [
    { label: "About", link: "#about" },
    { label: "What You Gain", link: "#what-you-gain" },
    { label: "How It Works", link: "#how-it-works" },
    { label: "Trust", link: "#credibility-trust" },
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
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    // Delay to ensure sections are in the DOM
    const timer = setTimeout(() => {
      allIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl shadow-[0px_12px_32px_rgba(4,22,50,0.06)]">
      <div className="flex justify-between items-center h-20 px-8 lg:px-16 max-w-[1400px] mx-auto">
        {/* Logo */}
        <a
          href="/"
          onClick={handleLogoClick}
          className="flex items-center gap-2"
        >
          <img
            src="/images/pbh-logomark.svg"
            alt="Primary Brain Health"
            className="h-10 w-auto"
          />
          <span className="text-lg font-bold tracking-[0.12em] uppercase font-headline text-primary hidden sm:inline">
            Primary Brain Health
          </span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2">
          {nav.map((item) => (
            <a
              key={item.link}
              href={item.link}
              className={cn(
                "font-body text-base font-semibold tracking-tight px-4 py-2 transition-all",
                activeHash === item.link
                  ? "text-secondary"
                  : "text-on-surface/70 hover:text-on-surface"
              )}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <Button href="#intake" variant="solid" color="primary" size="md" className="hidden lg:inline-flex">
          Book a Consultation
        </Button>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 text-primary"
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
      <div
        className={cn(
          "lg:hidden grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
          mobileMenuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="bg-surface/95 backdrop-blur-xl px-8 py-6 border-t border-outline-variant/10">
            <div className="flex flex-col gap-4">
              {nav.map((item) => (
                <a
                  key={item.link}
                  href={item.link}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "font-body text-base font-semibold py-2",
                    activeHash === item.link
                      ? "text-secondary"
                      : "text-on-surface/70"
                  )}
                >
                  {item.label}
                </a>
              ))}
              <Button
                href="#intake"
                onClick={() => setMobileMenuOpen(false)}
                variant="solid"
                color="primary"
                size="md"
                className="text-center mt-2"
              >
                Book a Consultation
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
