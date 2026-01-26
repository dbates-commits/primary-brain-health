"use client";

import { Container } from "@/components/shared/Container";
import { Icon } from "@/components/shared/Icon";
import { cn } from "@/lib/utils";

interface StatItem {
  value: string;
  label: string;
  icon?: string;
  description?: string;
  progress?: number;
}

export interface StatsProps {
  variant?: "counters" | "progress" | "icons" | "cards";
  theme?: "light" | "dark" | "primary" | "gradient";
  headline?: string;
  subheadline?: string;
  animate?: boolean;
  items?: StatItem[];
}

const themeStyles = {
  light: {
    bg: "bg-white",
    headline: "text-gray-900",
    subheadline: "text-gray-600",
    value: "text-gray-900",
    label: "text-gray-500",
    cardBg: "bg-gray-50",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    progressBg: "bg-gray-200",
    progressFill: "bg-indigo-600",
  },
  dark: {
    bg: "bg-gray-900",
    headline: "text-white",
    subheadline: "text-gray-400",
    value: "text-white",
    label: "text-gray-400",
    cardBg: "bg-gray-800",
    iconBg: "bg-indigo-900",
    iconColor: "text-indigo-400",
    progressBg: "bg-gray-700",
    progressFill: "bg-indigo-500",
  },
  primary: {
    bg: "bg-indigo-600",
    headline: "text-white",
    subheadline: "text-indigo-200",
    value: "text-white",
    label: "text-indigo-200",
    cardBg: "bg-indigo-500",
    iconBg: "bg-white/20",
    iconColor: "text-white",
    progressBg: "bg-indigo-400",
    progressFill: "bg-white",
  },
  gradient: {
    bg: "bg-gradient-to-r from-indigo-600 to-purple-600",
    headline: "text-white",
    subheadline: "text-indigo-100",
    value: "text-white",
    label: "text-indigo-100",
    cardBg: "bg-white/10",
    iconBg: "bg-white/20",
    iconColor: "text-white",
    progressBg: "bg-white/30",
    progressFill: "bg-white",
  },
};

export function Stats({
  variant = "counters",
  theme = "light",
  headline,
  subheadline,
  items = [],
}: StatsProps) {
  const styles = themeStyles[theme];

  if (variant === "counters") {
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {items.map((item, index) => (
              <div key={index} className="text-center">
                <div className={cn("text-4xl md:text-5xl font-bold mb-2", styles.value)}>
                  {item.value}
                </div>
                <div className={cn("text-sm uppercase tracking-wider", styles.label)}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (variant === "progress") {
    return (
      <section className={cn("py-20", styles.bg)}>
        <Container size="narrow">
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
          <div className="space-y-8">
            {items.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className={cn("font-medium", styles.value)}>{item.label}</span>
                  <span className={cn("font-bold", styles.value)}>{item.value}</span>
                </div>
                <div className={cn("h-3 rounded-full", styles.progressBg)}>
                  <div
                    className={cn("h-3 rounded-full transition-all duration-1000", styles.progressFill)}
                    style={{ width: `${item.progress || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (variant === "icons") {
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {items.map((item, index) => (
              <div key={index} className="text-center">
                {item.icon && (
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4", styles.iconBg)}>
                    <Icon name={item.icon} className={styles.iconColor} size="lg" />
                  </div>
                )}
                <div className={cn("text-3xl md:text-4xl font-bold mb-2", styles.value)}>
                  {item.value}
                </div>
                <div className={cn("text-sm", styles.label)}>{item.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (variant === "cards") {
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {items.map((item, index) => (
              <div key={index} className={cn("rounded-xl p-6 text-center", styles.cardBg)}>
                {item.icon && (
                  <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4", styles.iconBg)}>
                    <Icon name={item.icon} className={styles.iconColor} size="md" />
                  </div>
                )}
                <div className={cn("text-3xl font-bold mb-1", styles.value)}>{item.value}</div>
                <div className={cn("text-sm", styles.label)}>{item.label}</div>
                {item.description && (
                  <p className={cn("text-xs mt-2", styles.subheadline)}>{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  return null;
}
