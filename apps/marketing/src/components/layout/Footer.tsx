"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-background-brand-subtle w-full rounded-t-[1.25rem]">
      <div className="flex flex-col md:flex-row justify-between items-start gap-12 py-20 px-8 md:px-24 max-w-[1400px] mx-auto">
        {/* Brand */}
        <div className="max-w-sm">
          <a href="/" className="flex items-center mb-4">
            <img
              src="/images/pbh_logostacked_color.svg"
              alt="Primary Brain Health"
              className="h-10 w-auto"
            />
          </a>
          <p className="text-ink-strong/70 text-body-sm leading-relaxed mb-6">
            A clinical leader in cognitive longevity and proactive brain care.
            Virtual-first, evidence-based, patient-centered.
          </p>
        </div>

        {/* Link Columns */}
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-4">
            <h5 className="font-body font-bold text-brand-default text-body-sm uppercase tracking-widest">
              Menu
            </h5>
            <ul className="space-y-2">
              <li>
                <a
                  href="#what-you-gain"
                  className="text-ink-strong/70 hover:text-ink-strong transition-colors text-body-sm"
                >
                  What You Gain
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-ink-strong/70 hover:text-ink-strong transition-colors text-body-sm"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#intake"
                  className="text-ink-strong/70 hover:text-ink-strong transition-colors text-body-sm"
                >
                  Get Assessed
                </a>
              </li>
              <li>
                <Link
                  href="/faqs"
                  className="text-ink-strong/70 hover:text-ink-strong transition-colors text-body-sm"
                >
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h5 className="font-body font-bold text-brand-default text-body-sm uppercase tracking-widest">
              Support
            </h5>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="text-ink-strong/70 hover:text-ink-strong transition-colors text-body-sm"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-ink-strong/70 hover:text-ink-strong transition-colors text-body-sm"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-ink-strong/70 hover:text-ink-strong transition-colors text-body-sm"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-outline-variant/10 px-8 md:px-24 py-8 flex flex-col md:flex-row justify-between items-center gap-4 max-w-[1400px] mx-auto">
        <span className="text-ink-strong/70 text-body-sm">
          &copy; {new Date().getFullYear()} Primary Brain Health. All rights
          reserved.
        </span>
        <a
          href="mailto:contact@primarybrainhealth.com"
          className="flex items-center gap-2 text-ink-strong/70 hover:text-ink-strong text-body-sm transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          contact@primarybrainhealth.com
        </a>
      </div>
    </footer>
  );
}
