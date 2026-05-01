"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Section } from "@/components/shared/Section";
import { Container } from "@/components/shared/Container";
import { Heading } from "@/components/shared/Heading";
import { Icon } from "@/components/shared/Icon";

interface VideoSpotlightProps {
  headline?: string;
  subheadline?: string;
  video?: string;
  poster?: string;
  leftImage?: string;
  rightImage?: string;
  tinaFields?: {
    headline?: string;
    subheadline?: string;
  };
}

export function VideoSpotlight({
  headline,
  subheadline,
  video,
  poster,
  leftImage,
  rightImage,
  tinaFields,
}: VideoSpotlightProps) {
  const [isOpen, setIsOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Pause and reset video when modal closes so it doesn't keep playing
  // in the background.
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isOpen]);

  const open = () => {
    if (!video) return;
    setIsOpen(true);
  };

  return (
    <Section className="bg-surface py-20 md:py-28">
      <Container>
        {(headline || subheadline) && (
          <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
            {headline && (
              <Heading
                size="lg"
                className="mb-4"
                data-tina-field={tinaFields?.headline}
              >
                {headline}
              </Heading>
            )}
            {subheadline && (
              <p
                className="text-lg md:text-xl text-on-surface-variant"
                data-tina-field={tinaFields?.subheadline}
              >
                {subheadline}
              </p>
            )}
          </div>
        )}

        <div className="relative mx-auto max-w-5xl">
          {/* Wrapper sized to the video itself; side images are positioned
              absolutely off its left/right edges. The wrapper's aspect-video
              defines the layout box; the button absolutely fills it. */}
          <div className="relative mx-auto w-full sm:w-[70%] aspect-video">
            {leftImage && (
              <div
                aria-hidden="true"
                className="hidden md:block absolute -left-[80px] top-[60px] bottom-[60px] aspect-[3/4] rounded-2xl overflow-hidden shadow-md z-0"
              >
                <Image
                  src={leftImage}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 18vw, 220px"
                />
              </div>
            )}

            {rightImage && (
              <div
                aria-hidden="true"
                className="hidden md:block absolute -right-[80px] top-[60px] bottom-[60px] aspect-[3/4] rounded-2xl overflow-hidden shadow-md z-0"
              >
                <Image
                  src={rightImage}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 18vw, 220px"
                />
              </div>
            )}

            <button
              type="button"
              onClick={open}
              disabled={!video}
              aria-label={video ? "Play video" : "Video unavailable"}
              className="group absolute inset-0 z-10 rounded-2xl overflow-hidden shadow-2xl bg-surface-variant disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
            >
              {poster && (
                <Image
                  src={poster}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 720px"
                />
              )}

              <div className="absolute inset-0 bg-on-surface/10 group-hover:bg-on-surface/0 transition-colors" />

              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-full bg-surface/95 shadow-xl transition-transform duration-300 group-hover:scale-110">
                  <Icon
                    name="play"
                    size="lg"
                    className="text-primary translate-x-0.5"
                  />
                </span>
              </span>
            </button>
          </div>
        </div>
      </Container>

      {isOpen && video && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/90 p-4"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Video player"
        >
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close video"
            className="absolute top-4 right-4 p-2 text-surface hover:text-surface/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-surface/40 rounded-full"
          >
            <Icon name="close" size="lg" />
          </button>

          <div
            className="relative w-full max-w-5xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={videoRef}
              src={video}
              poster={poster}
              controls
              autoPlay
              playsInline
              className="w-full h-full rounded-lg shadow-2xl bg-black"
            >
              <track kind="captions" />
            </video>
          </div>
        </div>
      )}
    </Section>
  );
}
