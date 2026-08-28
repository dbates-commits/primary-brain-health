"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { cn } from "@pbh/ui/utils";
import { Button, PhosphorIcon } from "@pbh/ui";
import { requestLoginLinkInline } from "@/app/login/actions";
import { useSignOut } from "@/lib/use-sign-out";
import { LoginMenu } from "./LoginMenu";
import { MobileLoginModal } from "./MobileLoginModal";
import { UserMenu } from "./UserMenu";
import { USER_MENU_LINKS, userMenuItemClass } from "./user-menu-items";

interface NavItem {
  label: string;
  link: string;
}

/**
 * The full nav, and what the IntersectionObserver below watches. Module-level
 * so the observer's `[]`-dep effect can't capture a list that has since been
 * filtered down for a signed-in visitor.
 */
const NAV_ITEMS: NavItem[] = [
  { label: "FAQs", link: "/faqs" },
  { label: "Contact", link: "/contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  // Client-side (see `AuthProvider`): until the session request lands, `status`
  // is "loading" and the header shows its signed-out state.
  const { data: session } = useSession();
  const firstName = session?.user?.firstName;
  const { signOut, pending: signingOut } = useSignOut();
  // Focus goes back to whichever of these the user came from. Held as refs
  // rather than restored by the modal on unmount: by then the drawer may be
  // `inert`, and focusing an inert node drops focus to `<body>` in silence.
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const loginRowRef = useRef<HTMLButtonElement>(null);
  // The desktop fallback: at `lg` the hamburger and the drawer's rows are all
  // `lg:hidden`, so the logo is the only control from this nav still on screen.
  const logoRef = useRef<HTMLAnchorElement>(null);

  /**
   * Close the drawer and the login modal together. The drawer is animated shut
   * rather than unmounted, so a modal left open over it would still be there —
   * over an invisible, zero-height menu — with no way back.
   */
  function closeMobileMenu() {
    setMobileMenuOpen(false);
    setLoginModalOpen(false);
  }

  /** Dismiss the whole stack and put focus back on the hamburger. */
  function closeFromLoginModal() {
    closeMobileMenu();
    menuButtonRef.current?.focus();
  }

  /** Step back to the drawer, which has been open underneath all along. */
  function backToMenu() {
    setLoginModalOpen(false);
    loginRowRef.current?.focus();
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Crossing into desktop with the drawer or the modal open would strand both:
  // the drawer is `lg:hidden` and so is the hamburger, so the full-screen
  // overlay — and its scroll lock — would have no reachable control left to
  // dismiss them. `lg` here is the same 1024px the classNames below use.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (!desktop.matches) {
        return;
      }
      // Focus has to be placed, not just dropped: with the modal open it is
      // inside a portal that is about to go, and the two deliberate exits
      // above both aim at controls that are `lg:hidden` at this width.
      const focusWasInTheModal = loginModalOpen;
      closeMobileMenu();
      if (focusWasInTheModal) {
        logoRef.current?.focus();
      }
    };
    onChange();
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, [loginModalOpen]);

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

  /**
   * Signed in, the nav collapses to Contact (Figma 2092:13082). A customer who
   * has already booked has no use for FAQs or the acquisition CTA below.
   */
  const visibleNav = firstName
    ? NAV_ITEMS.filter((item) => item.link === "/contact")
    : NAV_ITEMS;

  useEffect(() => {
    const navIds = NAV_ITEMS.map((item) => item.link.slice(1));
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
          ? "bg-background-default/70 backdrop-blur-xl shadow-[0px_12px_32px_rgba(4,22,50,0.06)]"
          : "bg-transparent shadow-none"
      )}
    >
      <div className="flex justify-between items-center gap-10 py-5 px-6 lg:px-10 max-w-[90rem] mx-auto">
        {/* Logo */}
        <a
          ref={logoRef}
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
          <div
            className={cn(
              "hidden lg:flex items-center",
              // Signed out the CTA is the last item, so the links sit 32px
              // apart inside the group; signed in the account menu *is* the
              // last group, and the spacing is the nav's own 40px.
              firstName ? "gap-10" : "gap-8"
            )}
          >
            {visibleNav.map((item) => (
              <a
                key={item.link}
                href={item.link}
                className={cn(
                  "font-body text-base font-semibold tracking-tight transition-all",
                  activeHash === item.link
                    ? "text-aqua-default"
                    : "text-ink-strong/70 hover:text-ink-strong"
                )}
              >
                {item.label}
              </a>
            ))}

            {/* Not part of `nav`: that array feeds the IntersectionObserver
                below, and neither of these is a scroll anchor. */}
            {firstName ? <UserMenu firstName={firstName} /> : <LoginMenu />}
          </div>

          {/* CTA Button. Not rendered for a signed-in customer — they have
              already booked (Figma 2092:13082). */}
          {!firstName && (
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
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          ref={menuButtonRef}
          className="lg:hidden p-2 text-brand-default"
          onClick={() => {
            if (mobileMenuOpen) {
              closeMobileMenu();
            } else {
              setMobileMenuOpen(true);
            }
          }}
          aria-label="Toggle menu"
        >
          {/* Phosphor, not a hand-drawn path: this X and the one in
              `MobileLoginModal` sit in the same place at the same size, so
              drawing them from different sources shows up as the glyph
              changing weight the moment the modal opens. */}
          <PhosphorIcon
            name={mobileMenuOpen ? "X" : "List"}
            size={24}
            aria-hidden="true"
          />
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
          <div className="bg-background-default/95 backdrop-blur-xl px-8 py-6 border-t border-outline-variant/10">
            <div className="flex flex-col gap-4">
              {visibleNav.map((item) => (
                <a
                  key={item.link}
                  href={item.link}
                  onClick={closeMobileMenu}
                  className={cn(
                    "font-body text-base font-semibold py-2",
                    activeHash === item.link
                      ? "text-aqua-default"
                      : "text-ink-strong/70"
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
                // A plain row now, not a disclosure: it opens
                // `MobileLoginModal` over the drawer (Figma 2155:12505).
                <button
                  ref={loginRowRef}
                  type="button"
                  onClick={() => setLoginModalOpen(true)}
                  className="py-2 text-left font-body text-base font-semibold text-brand-default"
                >
                  Login
                </button>
              )}

              {!firstName && (
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
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Outside the drawer, and portalled out of the nav entirely — the nav's
          `backdrop-blur` would otherwise become the containing block for its
          `fixed` overlay. The drawer stays open underneath it. */}
      <MobileLoginModal
        open={loginModalOpen}
        onBack={backToMenu}
        onClose={closeFromLoginModal}
        action={requestLoginLinkInline}
      />
    </nav>
  );
}
