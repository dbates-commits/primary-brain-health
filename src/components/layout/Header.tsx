"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/shared/Button";
import { Icon } from "@/components/shared/Icon";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  link: string;
  children?: { label: string; link: string; description?: string }[];
}

interface HeaderProps {
  navigation?: NavItem[];
  ctaButton?: {
    text: string;
    link: string;
  };
}

export function Header({ navigation = [], ctaButton }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  const defaultNavigation: NavItem[] = [
    { label: "About", link: "#about-what-we-do" },
    { label: "Who It's For", link: "#who-is-this-for" },
    { label: "How It Works", link: "#how-it-works" },
    { label: "Why Us", link: "#credibility-trust" },
  ];

  const nav = navigation.length > 0 ? navigation : defaultNavigation;

  useEffect(() => {
    const navIds = nav
      .filter((item) => item.link.startsWith("#"))
      .map((item) => item.link.slice(1));

    const allIds = [...navIds, "intake", "ready-to-take-the-first-step", "take-control-of-your-brain-health"];

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
  }, [nav]);

  const linkClass = (href: string) =>
    cn(
      "text-[14px] font-semibold transition-colors",
      activeHash === href
        ? "text-indigo-600"
        : "text-gray-600 hover:text-gray-900"
    );

  const mobileLinkClass = (href: string) =>
    cn(
      "text-[16px] font-semibold",
      activeHash === href
        ? "text-indigo-600"
        : "text-gray-600 hover:text-gray-900"
    );

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Primary Brain Health</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {nav.map((item, index) =>
              item.link.startsWith("#") ? (
                <a
                  key={index}
                  href={item.link}
                  className={linkClass(item.link)}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={index}
                  href={item.link}
                  className={linkClass(item.link)}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            {ctaButton ? (
              <Button href={ctaButton.link} variant="solid" color="primary" size="sm">
                {ctaButton.text}
              </Button>
            ) : (
              <Button href="#intake" variant="solid" color="primary" size="sm">
                Book a Consultation
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Icon name={mobileMenuOpen ? "close" : "menu"} size="md" className="text-gray-600" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-4">
              {nav.map((item, index) =>
                item.link.startsWith("#") ? (
                  <a
                    key={index}
                    href={item.link}
                    className={mobileLinkClass(item.link)}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={index}
                    href={item.link}
                    className={mobileLinkClass(item.link)}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              )}
              <div className="pt-4 border-t border-gray-100">
                <Button href="#intake" variant="solid" color="primary" className="w-full">
                  Book a Consultation
                </Button>
              </div>
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
}
