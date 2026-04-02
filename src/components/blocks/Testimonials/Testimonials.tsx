"use client";

import { Container } from "@/components/shared/Container";
import { Card } from "@/components/shared/Card";
import { Icon } from "@/components/shared/Icon";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface TestimonialItem {
  quote: string;
  authorName: string;
  authorRole?: string;
  company?: string;
  avatar?: string;
  rating?: number;
}

export interface TestimonialsProps {
  variant?: "carousel" | "grid" | "single" | "quotes";
  theme?: "light" | "dark" | "primary";
  headline?: string;
  subheadline?: string;
  items?: TestimonialItem[];
}

const themeStyles = {
  light: {
    bg: "bg-gray-50",
    headline: "text-gray-900",
    subheadline: "text-gray-600",
    quote: "text-gray-700",
    author: "text-gray-900",
    role: "text-gray-500",
    cardBg: "bg-white",
    quoteIcon: "text-indigo-200",
    starActive: "text-yellow-400",
    starInactive: "text-gray-300",
  },
  dark: {
    bg: "bg-gray-900",
    headline: "text-white",
    subheadline: "text-gray-400",
    quote: "text-gray-300",
    author: "text-white",
    role: "text-gray-400",
    cardBg: "bg-gray-800",
    quoteIcon: "text-indigo-900",
    starActive: "text-yellow-400",
    starInactive: "text-gray-600",
  },
  primary: {
    bg: "bg-indigo-600",
    headline: "text-white",
    subheadline: "text-indigo-200",
    quote: "text-white",
    author: "text-white",
    role: "text-indigo-200",
    cardBg: "bg-indigo-500",
    quoteIcon: "text-indigo-400",
    starActive: "text-yellow-300",
    starInactive: "text-indigo-300",
  },
};

function StarRating({ rating, activeColor, inactiveColor }: { rating: number; activeColor: string; inactiveColor: string }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          name="star"
          size="sm"
          className={star <= rating ? activeColor : inactiveColor}
        />
      ))}
    </div>
  );
}

export function Testimonials({
  variant = "carousel",
  theme = "light",
  headline,
  subheadline,
  items = [],
}: TestimonialsProps) {
  const styles = themeStyles[theme];

  if (variant === "grid") {
    return (
      <section className={cn("py-20", styles.bg)}>
        <Container>
          {(headline || subheadline) && (
            <div className="text-center max-w-3xl mx-auto mb-16">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item, index) => (
              <Card key={index} variant="elevated" className={styles.cardBg}>
                <Icon name="quote" size="lg" className={cn("mb-4", styles.quoteIcon)} />
                <p className={cn("text-lg mb-6", styles.quote)}>&ldquo;{item.quote}&rdquo;</p>
                {item.rating && (
                  <div className="mb-4">
                    <StarRating
                      rating={item.rating}
                      activeColor={styles.starActive}
                      inactiveColor={styles.starInactive}
                    />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  {item.avatar && (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image src={item.avatar} alt={item.authorName} fill className="object-cover" />
                    </div>
                  )}
                  <div>
                    <p className={cn("font-semibold", styles.author)}>{item.authorName}</p>
                    {(item.authorRole || item.company) && (
                      <p className={cn("text-sm", styles.role)}>
                        {item.authorRole}{item.authorRole && item.company && " at "}{item.company}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (variant === "single" && items.length > 0) {
    const item = items[0];
    return (
      <section className={cn("py-20", styles.bg)}>
        <Container size="narrow">
          <div className="text-center">
            <Icon name="quote" size="xl" className={cn("mx-auto mb-6", styles.quoteIcon)} />
            <blockquote className={cn("text-2xl md:text-3xl font-medium mb-8", styles.quote)}>
              &ldquo;{item.quote}&rdquo;
            </blockquote>
            {item.rating && (
              <div className="flex justify-center mb-6">
                <StarRating
                  rating={item.rating}
                  activeColor={styles.starActive}
                  inactiveColor={styles.starInactive}
                />
              </div>
            )}
            <div className="flex items-center justify-center gap-4">
              {item.avatar && (
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image src={item.avatar} alt={item.authorName} fill className="object-cover" />
                </div>
              )}
              <div className="text-left">
                <p className={cn("font-semibold text-lg", styles.author)}>{item.authorName}</p>
                {(item.authorRole || item.company) && (
                  <p className={cn("text-sm", styles.role)}>
                    {item.authorRole}{item.authorRole && item.company && " at "}{item.company}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (variant === "quotes") {
    return (
      <section className={cn("py-20", styles.bg)}>
        <Container>
          {(headline || subheadline) && (
            <div className="text-center max-w-3xl mx-auto mb-16">
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
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {items.map((item, index) => (
              <Card key={index} variant="bordered" className={cn(styles.cardBg, "break-inside-avoid")}>
                <p className={cn("text-base mb-4", styles.quote)}>&ldquo;{item.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  {item.avatar && (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image src={item.avatar} alt={item.authorName} fill className="object-cover" />
                    </div>
                  )}
                  <div>
                    <p className={cn("font-medium text-sm", styles.author)}>{item.authorName}</p>
                    {item.company && (
                      <p className={cn("text-xs", styles.role)}>{item.company}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  // Default: carousel
  return (
    <section className={cn("py-20", styles.bg)}>
      <Container>
        {(headline || subheadline) && (
          <div className="text-center max-w-3xl mx-auto mb-16">
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
              <Card key={index} variant="elevated" className={cn(styles.cardBg, "w-[380px] flex-shrink-0")}>
                <Icon name="quote" size="lg" className={cn("mb-4", styles.quoteIcon)} />
                <p className={cn("text-lg mb-6", styles.quote)}>&ldquo;{item.quote}&rdquo;</p>
                {item.rating && (
                  <div className="mb-4">
                    <StarRating
                      rating={item.rating}
                      activeColor={styles.starActive}
                      inactiveColor={styles.starInactive}
                    />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  {item.avatar && (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image src={item.avatar} alt={item.authorName} fill className="object-cover" />
                    </div>
                  )}
                  <div>
                    <p className={cn("font-semibold", styles.author)}>{item.authorName}</p>
                    {(item.authorRole || item.company) && (
                      <p className={cn("text-sm", styles.role)}>
                        {item.authorRole}{item.authorRole && item.company && " at "}{item.company}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
