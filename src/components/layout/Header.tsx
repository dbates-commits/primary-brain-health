"use client";

import { useState } from "react";
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

  const defaultNavigation: NavItem[] = [
    { label: "Home", link: "/" },
    { label: "About", link: "/about" },
    { label: "Services", link: "/services" },
    { label: "Portfolio", link: "/projects" },
    { label: "Blog", link: "/blog" },
    { label: "Contact", link: "/contact" },
  ];

  const nav = navigation.length > 0 ? navigation : defaultNavigation;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Primary Brain Health</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {nav.map((item, index) => (
              <Link
                key={index}
                href={item.link}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            {ctaButton ? (
              <Button href={ctaButton.link} variant="solid" color="primary" size="sm">
                {ctaButton.text}
              </Button>
            ) : (
              <Button href="/admin" variant="solid" color="primary" size="sm">
                Edit in Tina
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
              {nav.map((item, index) => (
                <Link
                  key={index}
                  href={item.link}
                  className="text-base font-medium text-gray-600 hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-100">
                <Button href="/admin" variant="solid" color="primary" className="w-full">
                  Edit in Tina
                </Button>
              </div>
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
}
