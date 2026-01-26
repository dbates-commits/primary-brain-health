"use client";

import { useState } from "react";
import { Container } from "@/components/shared/Container";
import { Icon } from "@/components/shared/Icon";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface GalleryItem {
  image: string;
  alt: string;
  caption?: string;
  video?: string;
  aspectRatio?: "square" | "video" | "portrait" | "landscape";
}

export interface GalleryProps {
  variant?: "grid" | "masonry" | "carousel" | "lightbox";
  theme?: "light" | "dark";
  headline?: string;
  subheadline?: string;
  columns?: "2" | "3" | "4" | "5";
  gap?: "none" | "small" | "medium" | "large";
  items?: GalleryItem[];
}

const themeStyles = {
  light: {
    bg: "bg-white",
    headline: "text-gray-900",
    subheadline: "text-gray-600",
    caption: "text-gray-600",
    lightboxBg: "bg-black/90",
  },
  dark: {
    bg: "bg-gray-900",
    headline: "text-white",
    subheadline: "text-gray-400",
    caption: "text-gray-300",
    lightboxBg: "bg-black/95",
  },
};

const columnClasses = {
  "2": "grid-cols-1 md:grid-cols-2",
  "3": "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  "4": "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  "5": "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
};

const gapClasses = {
  none: "gap-0",
  small: "gap-2",
  medium: "gap-4",
  large: "gap-8",
};

const aspectClasses = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
};

export function Gallery({
  variant = "grid",
  theme = "light",
  headline,
  subheadline,
  columns = "3",
  gap = "medium",
  items = [],
}: GalleryProps) {
  const styles = themeStyles[theme];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (variant === "grid") {
    return (
      <section className={cn("py-20", styles.bg)}>
        <Container>
          {(headline || subheadline) && (
            <div className="text-center max-w-3xl mx-auto mb-12">
              {headline && (
                <h2 className={cn("text-3xl md:text-4xl font-bold mb-4", styles.headline)}>
                  {headline}
                </h2>
              )}
              {subheadline && (
                <p className={cn("text-lg", styles.subheadline)}>{subheadline}</p>
              )}
            </div>
          )}
          <div className={cn("grid", columnClasses[columns], gapClasses[gap])}>
            {items.map((item, index) => (
              <div key={index} className="group relative overflow-hidden rounded-lg">
                <div className={aspectClasses[item.aspectRatio || "square"]}>
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                {item.caption && (
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="p-4 text-white text-sm">{item.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (variant === "masonry") {
    return (
      <section className={cn("py-20", styles.bg)}>
        <Container>
          {(headline || subheadline) && (
            <div className="text-center max-w-3xl mx-auto mb-12">
              {headline && (
                <h2 className={cn("text-3xl md:text-4xl font-bold mb-4", styles.headline)}>
                  {headline}
                </h2>
              )}
              {subheadline && (
                <p className={cn("text-lg", styles.subheadline)}>{subheadline}</p>
              )}
            </div>
          )}
          <div className={cn("columns-1 md:columns-2 lg:columns-3", gapClasses[gap])}>
            {items.map((item, index) => (
              <div key={index} className="group relative break-inside-avoid mb-4 overflow-hidden rounded-lg">
                <Image
                  src={item.image}
                  alt={item.alt}
                  width={600}
                  height={400}
                  className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                />
                {item.caption && (
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="p-4 text-white text-sm">{item.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (variant === "carousel") {
    return (
      <section className={cn("py-20", styles.bg)}>
        <Container>
          {(headline || subheadline) && (
            <div className="text-center max-w-3xl mx-auto mb-12">
              {headline && (
                <h2 className={cn("text-3xl md:text-4xl font-bold mb-4", styles.headline)}>
                  {headline}
                </h2>
              )}
              {subheadline && (
                <p className={cn("text-lg", styles.subheadline)}>{subheadline}</p>
              )}
            </div>
          )}
          <div className="overflow-x-auto pb-4 -mx-4 px-4">
            <div className="flex gap-6" style={{ width: `${items.length * 400}px` }}>
              {items.map((item, index) => (
                <div key={index} className="w-[380px] flex-shrink-0 group relative overflow-hidden rounded-lg">
                  <div className="aspect-[4/3]">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  {item.caption && (
                    <p className={cn("mt-3 text-sm", styles.caption)}>{item.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    );
  }

  // Lightbox variant
  return (
    <section className={cn("py-20", styles.bg)}>
      <Container>
        {(headline || subheadline) && (
          <div className="text-center max-w-3xl mx-auto mb-12">
            {headline && (
              <h2 className={cn("text-3xl md:text-4xl font-bold mb-4", styles.headline)}>
                {headline}
              </h2>
            )}
            {subheadline && (
              <p className={cn("text-lg", styles.subheadline)}>{subheadline}</p>
            )}
          </div>
        )}
        <div className={cn("grid", columnClasses[columns], gapClasses[gap])}>
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => setLightboxIndex(index)}
              className="group relative overflow-hidden rounded-lg cursor-pointer"
            >
              <div className={aspectClasses[item.aspectRatio || "square"]}>
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                <Icon name="arrowRight" className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size="lg" />
              </div>
            </button>
          ))}
        </div>

        {/* Lightbox Modal */}
        {lightboxIndex !== null && (
          <div
            className={cn("fixed inset-0 z-50 flex items-center justify-center", styles.lightboxBg)}
            onClick={() => setLightboxIndex(null)}
          >
            <button
              className="absolute top-4 right-4 text-white p-2"
              onClick={() => setLightboxIndex(null)}
            >
              <Icon name="close" size="lg" />
            </button>
            {lightboxIndex > 0 && (
              <button
                className="absolute left-4 text-white p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex - 1);
                }}
              >
                <Icon name="chevronDown" size="lg" className="rotate-90" />
              </button>
            )}
            {lightboxIndex < items.length - 1 && (
              <button
                className="absolute right-4 text-white p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex + 1);
                }}
              >
                <Icon name="chevronDown" size="lg" className="-rotate-90" />
              </button>
            )}
            <div className="relative max-w-4xl max-h-[80vh] w-full h-full m-8" onClick={(e) => e.stopPropagation()}>
              <Image
                src={items[lightboxIndex].image}
                alt={items[lightboxIndex].alt}
                fill
                className="object-contain"
              />
            </div>
            {items[lightboxIndex].caption && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-center">
                <p>{items[lightboxIndex].caption}</p>
              </div>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}
