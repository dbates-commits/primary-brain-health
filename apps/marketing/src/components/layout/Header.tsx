"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { cn } from "@pbh/ui/utils";
import { Button, PhosphorIcon } from "@pbh/ui";
import { requestLoginLinkInline } from "@/app/login/actions";
import { useSignOut } from "@/lib/use-sign-out";
import { LoginMenu } from "./LoginMenu";
import { LoginPanel } from "./LoginPanel";
import { UserMenu } from "./UserMenu";
import { USER_MENU_LINKS, userMenuItemClass } from "./user-menu-items";

interface NavItem {
  label: string;
  link: string;
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  // Client-side (see `AuthProvider`): until the session request lands, `status`
  // is "loading" and the header shows its signed-out state.
  const { data: session } = useSession();
  const firstName = session?.user?.firstName;
  const { signOut, pending: signingOut } = useSignOut();

  /**
   * Close the drawer, collapsing the login panel with it. The drawer is
   * animated shut rather than unmounted, so a panel left disclosed would still
   * be there — invisible and zero-height — the next time it opens.
   */
  function closeMobileMenu() {
    setMobileMenuOpen(false);
    setLoginOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleLogoClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname === "/") {
      e.preventDefault();
      // Strip any hash (e.g. #intake) from the URL without adding a
      // history entry, so the back button doesn't bounce the user back
      // into the anchor they just left.
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleConsultationClick(
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>
  ) {
    closeMobileMenu();
    // On the homepage, Next.js Link no-ops when the URL hash already matches
    // (e.g. user previously clicked here, then scrolled away). Intercept and
    // scroll manually so the CTA always brings the user to #intake.
    if (pathname === "/") {
      e.preventDefault();
      const intake = document.getElementById("intake");
      if (intake) {
        intake.scrollIntoView({ behavior: "smooth" });
        if (window.location.hash !== "#intake") {
          window.history.replaceState(null, "", "/#intake");
        }
      }
    }
  }

  const nav: NavItem[] = [
    { label: "FAQs", link: "/faqs" },
    { label: "Contact", link: "/contact" },
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
        if (el) {
          observer.observe(el);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled
          ? "bg-surface/70 backdrop-blur-xl shadow-[0px_12px_32px_rgba(4,22,50,0.06)]"
          : "bg-transparent shadow-none"
      )}
    >
      <div className="flex justify-between items-center gap-10 py-5 px-6 lg:px-10 max-w-[90rem] mx-auto">
        {/* Logo */}
        <a
          href="/"
          onClick={handleLogoClick}
          className="flex items-center"
        >
          <img
            src="/images/pbh_logostacked_color.svg"
            alt="Primary Brain Health"
            className="h-10 w-auto"
          />
        </a>

        {/* Right side: nav + CTA (grouped so they right-align together) */}
        <div className="flex items-center gap-10">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {nav.map((item) => (
              <a
                key={item.link}
                href={item.link}
                className={cn(
                  "font-body text-base font-semibold tracking-tight transition-all",
                  activeHash === item.link
                    ? "text-secondary"
                    : "text-on-surface/70 hover:text-on-surface"
                )}
              >
                {item.label}
              </a>
            ))}

            {/* Not part of `nav`: that array feeds the IntersectionObserver
                below, and neither of these is a scroll anchor. */}
            {firstName ? <UserMenu firstName={firstName} /> : <LoginMenu />}
          </div>

          {/* CTA Button */}
          <Button
            href="/#intake"
            onClick={handleConsultationClick}
            variant="solid"
            color="primary"
            size="md"
            className="hidden lg:inline-flex"
          >
            Book a Consultation
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 text-primary"
          onClick={() => {
            if (mobileMenuOpen) {
              closeMobileMenu();
            } else {
              setMobileMenuOpen(true);
            }
          }}
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
        // `inert`, not just `overflow-hidden`: the drawer collapses to zero
        // height rather than unmounting, so without this its links — and the
        // sign-in form inside it — stay tabbable and exposed to screen readers
        // while invisible. Tabbing off the logo would walk into a hidden form.
        inert={!mobileMenuOpen}
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
                  onClick={closeMobileMenu}
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

              {/* Signed in, the drawer lists the account items flat. The
                  desktop dropdown exists to keep the nav row short, which is
                  not a problem the drawer has. */}
              {firstName ? (
                <>
                  {USER_MENU_LINKS.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={cn(userMenuItemClass, "w-full px-0")}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={signOut}
                    disabled={signingOut}
                    className={cn(userMenuItemClass, "w-full px-0")}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  {/* Same panel as the desktop popover, disclosed inline — the
                      drawer is already an overlay, so nesting a second one in
                      it would be one layer too many. */}
                  <button
                    type="button"
                    onClick={() => setLoginOpen((v) => !v)}
                    aria-expanded={loginOpen}
                    className="flex items-center gap-1 py-2 text-left font-body text-base font-semibold text-primary"
                  >
                    Login
                    <PhosphorIcon
                      name="CaretDown"
                      size={16}
                      aria-hidden="true"
                      className={cn(
                        "transition-transform",
                        loginOpen && "rotate-180",
                      )}
                    />
                  </button>
                  {loginOpen && (
                    <LoginPanel
                      action={requestLoginLinkInline}
                      onDone={() => setLoginOpen(false)}
                    />
                  )}
                </>
              )}

              <Button
                href="/#intake"
                onClick={handleConsultationClick}
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
