"use client";

import { useEffect } from "react";

export function ScrollRevealInit() {
  useEffect(() => {
    const sections = document.querySelectorAll("[data-scroll-reveal]");
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const items = entry.target.querySelectorAll<HTMLElement>("[data-scroll-item]");
          const stagger = Number((entry.target as HTMLElement).dataset.scrollStagger ?? 80);
          if (items.length > 0) {
            items.forEach((item, i) => {
              item.style.transitionDelay = `${i * stagger}ms`;
              item.classList.add("scroll-visible");
            });
          } else {
            (entry.target as HTMLElement).classList.add("scroll-visible");
          }
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
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
