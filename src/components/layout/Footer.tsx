"use client";

export function Footer() {
  return (
    <footer className="bg-surface-container-low w-full rounded-t-[2.5rem]">
      <div className="flex flex-col md:flex-row justify-between items-start gap-12 py-20 px-8 md:px-24 max-w-[1400px] mx-auto">
        {/* Brand */}
        <div className="max-w-sm">
          <div className="text-lg font-bold text-primary mb-4 font-headline">
            Primary Brain Health
          </div>
          <p className="text-primary/60 text-sm leading-relaxed mb-6">
            A clinical leader in cognitive longevity and proactive brain care.
            Virtual-first, evidence-based, patient-centered.
          </p>
        </div>

        {/* Link Columns */}
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-4">
            <h5 className="font-headline font-bold text-primary text-sm uppercase tracking-widest">
              Menu
            </h5>
            <ul className="space-y-2">
              <li>
                <a
                  href="#about"
                  className="text-primary/60 hover:text-secondary transition-colors text-sm"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#who-it-is-for"
                  className="text-primary/60 hover:text-secondary transition-colors text-sm"
                >
                  Who It&apos;s For
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-primary/60 hover:text-secondary transition-colors text-sm"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#why-us"
                  className="text-primary/60 hover:text-secondary transition-colors text-sm"
                >
                  Why Us
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h5 className="font-headline font-bold text-primary text-sm uppercase tracking-widest">
              Support
            </h5>
            <ul className="space-y-2">
              <li>
                <a
                  href="#intake"
                  className="text-primary/60 hover:text-secondary transition-colors text-sm"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-primary/60 hover:text-secondary transition-colors text-sm"
                >
                  Terms &amp; Conditions
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="text-primary/60 hover:text-secondary transition-colors text-sm"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-outline-variant/10 px-8 md:px-24 py-8 flex flex-col md:flex-row justify-between items-center gap-4 max-w-[1400px] mx-auto">
        <span className="text-primary/60 text-sm">
          &copy; {new Date().getFullYear()} Primary Brain Health. All rights
          reserved.
        </span>
        <div className="flex items-center gap-2 text-primary/60 text-sm">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          contact@primarybrainhealth.com
        </div>
      </div>
    </footer>
  );
}
