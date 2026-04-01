"use client";

import { useEffect, useRef, useState } from "react";
import {
  HeroProps,
  highlightBrainHealth,
  TrustAvatars,
} from "./hero-utils";

const BRAIN_COLUMNS = [
  { height: "34.6%" }, // left short
  { height: "73.9%" }, // left-mid
  { height: "100%" },  // center-left
  { height: "100%" },  // center-right
  { height: "73.9%" }, // right-mid
  { height: "34.6%" }, // right short
];

// Stagger: center-first, outer last (ms)
const STRIP_DELAYS_MS = [280, 140, 0, 0, 140, 280];

const VIDEOS = [
  "/videos/hero-video.mp4",
  "/videos/7677135-hd_1920_1080_30fps.mp4",
];

const PHOTO_POSTER =
  "/uploads/Senior%20woman%20and%20daughter%20in%20kitchen%20with%20laptop%20(2)%201.jpg";

const CYCLE_INTERVAL_MS = 8000;

export function HeroBrainMask({
  headline,
  subheadline,
  primaryButtonText,
  primaryButtonLink,
  tinaFields,
}: HeroProps) {
  const [videoIndex, setVideoIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setVideoIndex((idx) => (idx + 1) % VIDEOS.length);
    }, CYCLE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#eff3f7] px-6 md:px-12 lg:px-20 py-16 lg:py-20">
      {/* Faint background wash */}
      <div className="absolute inset-0 opacity-10 mix-blend-luminosity pointer-events-none">
        <img
          src={PHOTO_POSTER}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
        {/* Text */}
        <div className="flex flex-col gap-10 lg:gap-16 flex-1 order-2 lg:order-1">
          <div className="flex flex-col gap-6">
            <h1
              className="text-4xl md:text-5xl lg:text-[56px] font-bold font-headline text-on-surface leading-[1.1] tracking-tight"
              data-tina-field={tinaFields?.headline}
            >
              {headline
                ? highlightBrainHealth(headline, "text-[#456991]")
                : null}
            </h1>
            {subheadline && (
              <p
                className="text-lg md:text-2xl text-on-surface leading-relaxed max-w-xl"
                data-tina-field={tinaFields?.subheadline}
              >
                {subheadline}
              </p>
            )}
          </div>

          {primaryButtonText && (
            <a
              href={primaryButtonLink || "#"}
              className="bg-primary text-on-primary px-6 py-3 rounded-full font-headline text-sm font-bold active:scale-90 transition-transform duration-200 inline-flex items-center justify-center w-fit"
              data-tina-field={tinaFields?.primaryButtonText}
            >
              {primaryButtonText}
            </a>
          )}

          {/* Trust bar */}
          <div className="border-l-4 border-outline-variant pl-6 flex flex-col gap-2">
            <TrustAvatars />
            <p className="text-2xl font-medium text-on-surface">
              3,200+ Patients
            </p>
            <p className="text-xl text-outline">Trust Us</p>
          </div>
        </div>

        {/* Brain-shaped strips — containers are static, only the video animates */}
        <div className="order-1 lg:order-2 shrink-0 w-[280px] md:w-[400px] lg:w-[500px] xl:w-[560px]">
          <div className="relative w-full" style={{ paddingBottom: "100%" }}>
            <div className="absolute inset-0 flex items-center justify-center gap-[10px]">
              {BRAIN_COLUMNS.map((col, i) => (
                  <div
                    key={i}
                    className="relative overflow-hidden rounded-full flex-shrink-0"
                    style={{
                      // Exact strip width: container minus 5 gaps divided by 6
                      width: "calc((100% - 50px) / 6)",
                      height: col.height,
                    }}
                  >
                    {/*
                     * True die-cut: video spans the full container width.
                     * In strip-relative units: 6 strips + 5×10px gaps = calc(600% + 50px).
                     * Each strip offsets left by its index × (one strip-width + 10px gap).
                     * key={videoIndex} remounts the video on each cycle → autoPlay + animation replay.
                     */}
                    <video
                      key={videoIndex}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      poster={PHOTO_POSTER}
                      className="absolute max-w-none"
                      style={{
                        width: "calc(600% + 50px)",
                        height: "100%",
                        left: `calc(${-i * 100}% - ${i * 10}px)`,
                        top: 0,
                        objectFit: "cover",
                        objectPosition: "center center",
                        animation: `strip-video-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${STRIP_DELAYS_MS[i]}ms both`,
                      }}
                    >
                      <source src={VIDEOS[videoIndex]} type="video/mp4" />
                    </video>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
