"use client";

import { useEffect } from "react";

export function ScrollRevealInit() {
  useEffect(() => {
    const sections = document.querySelectorAll("[data-scroll-reveal]");
    const individuals = document.querySelectorAll(
      "[data-scroll-reveal-self]"
    );
    if (!sections.length && !individuals.length) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Smaller viewports = trigger sooner so users don't stare at blank space
    const isSmall = window.matchMedia("(max-width: 768px)").matches;
    const rootMargin = isSmall ? "0px 0px -8% 0px" : "0px 0px -12% 0px";

    const reveal = (target: Element) => {
      const items = target.querySelectorAll<HTMLElement>("[data-scroll-item]");
      const stagger = Number(
        (target as HTMLElement).dataset.scrollStagger ?? 90
      );
      if (items.length > 0) {
        items.forEach((item, i) => {
          item.style.transitionDelay = prefersReducedMotion
            ? "0ms"
            : `${i * stagger}ms`;
          item.classList.add("scroll-visible");
        });
      } else {
        (target as HTMLElement).classList.add("scroll-visible");
      }
    };

    if (prefersReducedMotion) {
      // Skip observers entirely — mark everything visible immediately
      sections.forEach((el) => reveal(el));
      individuals.forEach((el) => el.classList.add("scroll-visible"));
      return;
    }

    // Section-level reveal (existing behavior): when the section enters
    // view, all of its [data-scroll-item] children fade in with a stagger.
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          sectionObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin }
    );

    sections.forEach((el) => {
      const items = el.querySelectorAll("[data-scroll-item]");
      if (items.length > 0) {
        items.forEach((item) => item.classList.add("scroll-hidden"));
      } else {
        el.classList.add("scroll-hidden");
      }
      sectionObserver.observe(el);
    });

    // Per-element reveal: each [data-scroll-reveal-self] is observed
    // independently and fades in only when it personally enters view.
    // The natural reading order does the sequencing — there's no
    // section-wide stagger. Best for content that's vertically spaced
    // out (e.g. cards or columns that don't all fit on one screen).
    let individualObserver: IntersectionObserver | null = null;
    if (individuals.length > 0) {
      individualObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("scroll-visible");
            individualObserver?.unobserve(entry.target);
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
      );
      individuals.forEach((el) => {
        el.classList.add("scroll-hidden");
        individualObserver?.observe(el);
      });
    }

    return () => {
      sectionObserver.disconnect();
      individualObserver?.disconnect();
    };
  }, []);

  return null;
}
