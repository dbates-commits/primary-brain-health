"use client";

import { Container } from "@/components/shared/Container";
import { Section } from "@/components/shared/Section";
import { Button } from "@/components/shared/Button";
import { Icon } from "@/components/shared/Icon";
import { Heading } from "@/components/shared/Heading";
import { cn } from "@/lib/utils";

interface PricingTier {
  name: string;
  price: string;
  period?: "month" | "year" | "once";
  description?: string;
  features?: string[];
  buttonText?: string;
  buttonLink?: string;
  highlighted?: boolean;
  badge?: string;
}

export interface PricingTableProps {
  variant?: "cards" | "table" | "comparison";
  theme?: "light" | "dark";
  headline?: string;
  subheadline?: string;
  showToggle?: boolean;
  annualDiscount?: number;
  tiers?: PricingTier[];
}

const themeStyles = {
  light: {
    bg: "bg-gray-50",
    headline: "text-gray-900",
    subheadline: "text-gray-600",
    cardBg: "bg-white",
    cardHighlight: "bg-indigo-600",
    tierName: "text-gray-900",
    tierNameHighlight: "text-white",
    price: "text-gray-900",
    priceHighlight: "text-white",
    description: "text-gray-500",
    descriptionHighlight: "text-indigo-100",
    feature: "text-gray-600",
    featureHighlight: "text-indigo-100",
    checkColor: "text-indigo-600",
    checkColorHighlight: "text-indigo-200",
    border: "border-gray-200",
  },
  dark: {
    bg: "bg-gray-900",
    headline: "text-white",
    subheadline: "text-gray-400",
    cardBg: "bg-gray-800",
    cardHighlight: "bg-indigo-600",
    tierName: "text-white",
    tierNameHighlight: "text-white",
    price: "text-white",
    priceHighlight: "text-white",
    description: "text-gray-400",
    descriptionHighlight: "text-indigo-100",
    feature: "text-gray-300",
    featureHighlight: "text-indigo-100",
    checkColor: "text-indigo-400",
    checkColorHighlight: "text-indigo-200",
    border: "border-gray-700",
  },
};

export function PricingTable({
  variant = "cards",
  theme = "light",
  headline,
  subheadline,
  tiers = [],
}: PricingTableProps) {
  const styles = themeStyles[theme];

  if (variant === "cards") {
    return (
      <Section className={cn("py-20", styles.bg)}>
        <Container>
          {(headline || subheadline) && (
            <div className="text-center max-w-3xl mx-auto mb-16">
              {headline && (
                <Heading size="md" className={cn("mb-4", styles.headline)}>
                  {headline}
                </Heading>
              )}
              {subheadline && (
                <p className={cn("text-lg", styles.subheadline)}>{subheadline}</p>
              )}
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {tiers.map((tier, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-2xl p-8 relative",
                  tier.highlighted
                    ? cn(styles.cardHighlight, "shadow-xl scale-105")
                    : cn(styles.cardBg, "border", styles.border)
                )}
              >
                {tier.badge && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-sm font-semibold px-4 py-1 rounded-full">
                    {tier.badge}
                  </span>
                )}
                <h3
                  className={cn(
                    "text-xl font-semibold mb-2",
                    tier.highlighted ? styles.tierNameHighlight : styles.tierName
                  )}
                >
                  {tier.name}
                </h3>
                {tier.description && (
                  <p
                    className={cn(
                      "text-sm mb-6",
                      tier.highlighted ? styles.descriptionHighlight : styles.description
                    )}
                  >
                    {tier.description}
                  </p>
                )}
                <div className="mb-6">
                  <span
                    className={cn(
                      "text-5xl font-bold",
                      tier.highlighted ? styles.priceHighlight : styles.price
                    )}
                  >
                    ${tier.price}
                  </span>
                  {tier.period && tier.period !== "once" && (
                    <span
                      className={cn(
                        "text-sm",
                        tier.highlighted ? styles.descriptionHighlight : styles.description
                      )}
                    >
                      /{tier.period}
                    </span>
                  )}
                </div>
                {tier.features && tier.features.length > 0 && (
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Icon
                          name="check"
                          size="sm"
                          className={cn(
                            "flex-shrink-0 mt-0.5",
                            tier.highlighted ? styles.checkColorHighlight : styles.checkColor
                          )}
                        />
                        <span
                          className={cn(
                            "text-sm",
                            tier.highlighted ? styles.featureHighlight : styles.feature
                          )}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {tier.buttonText && (
                  <Button
                    href={tier.buttonLink}
                    variant={tier.highlighted ? "solid" : "outline"}
                    color={tier.highlighted ? "white" : "primary"}
                    className="w-full"
                  >
                    {tier.buttonText}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Container>
      </Section>
    );
  }

  if (variant === "comparison") {
    const allFeatures = new Set<string>();
    tiers.forEach((tier) => tier.features?.forEach((f) => allFeatures.add(f)));

    return (
      <Section className={cn("py-20", styles.bg)}>
        <Container>
          {(headline || subheadline) && (
            <div className="text-center max-w-3xl mx-auto mb-16">
              {headline && (
                <Heading size="md" className={cn("mb-4", styles.headline)}>
                  {headline}
                </Heading>
              )}
              {subheadline && (
                <p className={cn("text-lg", styles.subheadline)}>{subheadline}</p>
              )}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={cn("text-left p-4 border-b", styles.border)} />
                  {tiers.map((tier, index) => (
                    <th
                      key={index}
                      className={cn(
                        "text-center p-4 border-b",
                        styles.border,
                        tier.highlighted ? styles.cardHighlight : ""
                      )}
                    >
                      <div
                        className={cn(
                          "text-lg font-semibold",
                          tier.highlighted ? styles.tierNameHighlight : styles.tierName
                        )}
                      >
                        {tier.name}
                      </div>
                      <div
                        className={cn(
                          "text-3xl font-bold my-2",
                          tier.highlighted ? styles.priceHighlight : styles.price
                        )}
                      >
                        ${tier.price}
                        {tier.period && tier.period !== "once" && (
                          <span className="text-sm font-normal">/{tier.period}</span>
                        )}
                      </div>
                      {tier.buttonText && (
                        <Button
                          href={tier.buttonLink}
                          variant={tier.highlighted ? "solid" : "outline"}
                          color={tier.highlighted ? "white" : "primary"}
                          size="sm"
                          className="mt-2"
                        >
                          {tier.buttonText}
                        </Button>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from(allFeatures).map((feature, featureIndex) => (
                  <tr key={featureIndex}>
                    <td className={cn("p-4 border-b", styles.border, styles.feature)}>
                      {feature}
                    </td>
                    {tiers.map((tier, tierIndex) => (
                      <td
                        key={tierIndex}
                        className={cn(
                          "text-center p-4 border-b",
                          styles.border,
                          tier.highlighted ? "bg-indigo-600/10" : ""
                        )}
                      >
                        {tier.features?.includes(feature) ? (
                          <Icon
                            name="check"
                            size="sm"
                            className={cn("mx-auto", styles.checkColor)}
                          />
                        ) : (
                          <span className={styles.description}>-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </Section>
    );
  }

  // Table variant
  return (
    <Section className={cn("py-20", styles.bg)}>
      <Container>
        {(headline || subheadline) && (
          <div className="text-center max-w-3xl mx-auto mb-16">
            {headline && (
              <Heading size="md" className={cn("mb-4", styles.headline)}>
                {headline}
              </Heading>
            )}
            {subheadline && (
              <p className={cn("text-lg", styles.subheadline)}>{subheadline}</p>
            )}
          </div>
        )}
        <div className={cn("rounded-xl overflow-hidden border", styles.border, styles.cardBg)}>
          <table className="w-full">
            <thead>
              <tr className={cn("border-b", styles.border)}>
                <th className={cn("text-left p-6", styles.tierName)}>Plan</th>
                <th className={cn("text-left p-6", styles.tierName)}>Price</th>
                <th className={cn("text-left p-6", styles.tierName)}>Features</th>
                <th className="p-6" />
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier, index) => (
                <tr key={index} className={cn("border-b last:border-b-0", styles.border)}>
                  <td className="p-6">
                    <div className={cn("font-semibold", styles.tierName)}>{tier.name}</div>
                    {tier.description && (
                      <div className={cn("text-sm", styles.description)}>{tier.description}</div>
                    )}
                  </td>
                  <td className="p-6">
                    <span className={cn("text-2xl font-bold", styles.price)}>${tier.price}</span>
                    {tier.period && tier.period !== "once" && (
                      <span className={cn("text-sm", styles.description)}>/{tier.period}</span>
                    )}
                  </td>
                  <td className="p-6">
                    <div className={cn("text-sm", styles.feature)}>
                      {tier.features?.slice(0, 3).join(", ")}
                      {tier.features && tier.features.length > 3 && ` +${tier.features.length - 3} more`}
                    </div>
                  </td>
                  <td className="p-6">
                    {tier.buttonText && (
                      <Button href={tier.buttonLink} variant="outline" color="primary" size="sm">
                        {tier.buttonText}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </Section>
  );
}
