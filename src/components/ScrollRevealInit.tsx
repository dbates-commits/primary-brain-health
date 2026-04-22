"use client";

import { useEffect } from "react";

export function ScrollRevealInit() {
  useEffect(() => {
    const sections = document.querySelectorAll("[data-scroll-reveal]");
    if (!sections.length) return;

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
      // Skip observer entirely — mark everything visible immediately
      sections.forEach((el) => reveal(el));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          observer.unobserve(entry.target);
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
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
