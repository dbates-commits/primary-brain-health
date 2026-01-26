"use client";

import { tinaField } from "tinacms/dist/react";
import { Container } from "@/components/shared/Container";
import { Card } from "@/components/shared/Card";
import { Icon } from "@/components/shared/Icon";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface FeatureItem {
  title: string;
  description?: string;
  icon?: string;
  image?: string;
  link?: string;
}

interface TinaFieldsMap {
  headline?: string;
  subheadline?: string;
}

export interface FeaturesProps {
  variant?: "grid" | "alternating" | "iconCards" | "comparison";
  theme?: "light" | "dark" | "primary";
  headline?: string;
  subheadline?: string;
  columns?: "2" | "3" | "4";
  items?: FeatureItem[];
  tinaFields?: TinaFieldsMap;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blockData?: any;
}

const themeStyles = {
  light: {
    bg: "bg-white",
    headline: "text-gray-900",
    subheadline: "text-gray-600",
    itemTitle: "text-gray-900",
    itemDesc: "text-gray-600",
    cardBg: "bg-gray-50",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  dark: {
    bg: "bg-gray-900",
    headline: "text-white",
    subheadline: "text-gray-400",
    itemTitle: "text-white",
    itemDesc: "text-gray-400",
    cardBg: "bg-gray-800",
    iconBg: "bg-indigo-900",
    iconColor: "text-indigo-400",
  },
  primary: {
    bg: "bg-indigo-600",
    headline: "text-white",
    subheadline: "text-indigo-200",
    itemTitle: "text-white",
    itemDesc: "text-indigo-200",
    cardBg: "bg-indigo-500",
    iconBg: "bg-white/20",
    iconColor: "text-white",
  },
};

const columnClasses = {
  "2": "md:grid-cols-2",
  "3": "md:grid-cols-2 lg:grid-cols-3",
  "4": "md:grid-cols-2 lg:grid-cols-4",
};

export function Features({
  variant = "grid",
  theme = "light",
  headline,
  subheadline,
  columns = "3",
  items = [],
  tinaFields,
  blockData,
}: FeaturesProps) {
  const styles = themeStyles[theme];

  const getItemField = (index: number, field: string) => {
    return blockData?.items?.[index] ? tinaField(blockData.items[index], field) : undefined;
  };

  if (variant === "grid") {
    return (
      <section className={cn("py-20", styles.bg)}>
        <Container>
          {(headline || subheadline) && (
            <div className="text-center max-w-3xl mx-auto mb-16">
              {headline && (
                <h2
                  className={cn("text-3xl md:text-4xl font-bold mb-4", styles.headline)}
                  data-tina-field={tinaFields?.headline}
                >
                  {headline}
                </h2>
              )}
              {subheadline && (
                <p
                  className={cn("text-lg", styles.subheadline)}
                  data-tina-field={tinaFields?.subheadline}
                >
                  {subheadline}
                </p>
              )}
            </div>
          )}
          <div className={cn("grid gap-8", columnClasses[columns])}>
            {items.map((item, index) => (
              <Card key={index} variant="bordered" className={styles.cardBg} hover>
                {item.icon && (
                  <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4", styles.iconBg)}>
                    <Icon name={item.icon} className={styles.iconColor} size="md" />
                  </div>
                )}
                <h3
                  className={cn("text-xl font-semibold mb-2", styles.itemTitle)}
                  data-tina-field={getItemField(index, "title")}
                >
                  {item.title}
                </h3>
                {item.description && (
                  <p
                    className={cn("text-base", styles.itemDesc)}
                    data-tina-field={getItemField(index, "description")}
                  >
                    {item.description}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (variant === "alternating") {
    return (
      <section className={cn("py-20", styles.bg)}>
        <Container>
          {(headline || subheadline) && (
            <div className="text-center max-w-3xl mx-auto mb-16">
              {headline && (
                <h2
                  className={cn("text-3xl md:text-4xl font-bold mb-4", styles.headline)}
                  data-tina-field={tinaFields?.headline}
                >
                  {headline}
                </h2>
              )}
              {subheadline && (
                <p
                  className={cn("text-lg", styles.subheadline)}
                  data-tina-field={tinaFields?.subheadline}
                >
                  {subheadline}
                </p>
              )}
            </div>
          )}
          <div className="space-y-24">
            {items.map((item, index) => (
              <div
                key={index}
                className={cn(
                  "grid md:grid-cols-2 gap-12 items-center",
                  index % 2 === 1 && "md:flex-row-reverse"
                )}
              >
                <div className={index % 2 === 1 ? "md:order-2" : ""}>
                  {item.icon && (
                    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4", styles.iconBg)}>
                      <Icon name={item.icon} className={styles.iconColor} size="md" />
                    </div>
                  )}
                  <h3
                    className={cn("text-2xl font-bold mb-4", styles.itemTitle)}
                    data-tina-field={getItemField(index, "title")}
                  >
                    {item.title}
                  </h3>
                  {item.description && (
                    <p
                      className={cn("text-lg", styles.itemDesc)}
                      data-tina-field={getItemField(index, "description")}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
                <div className={index % 2 === 1 ? "md:order-1" : ""}>
                  {item.image && (
                    <div
                      className="relative aspect-[4/3] rounded-2xl overflow-hidden"
                      data-tina-field={getItemField(index, "image")}
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (variant === "iconCards") {
    return (
      <section className={cn("py-20", styles.bg)}>
        <Container>
          {(headline || subheadline) && (
            <div className="text-center max-w-3xl mx-auto mb-16">
              {headline && (
                <h2
                  className={cn("text-3xl md:text-4xl font-bold mb-4", styles.headline)}
                  data-tina-field={tinaFields?.headline}
                >
                  {headline}
                </h2>
              )}
              {subheadline && (
                <p
                  className={cn("text-lg", styles.subheadline)}
                  data-tina-field={tinaFields?.subheadline}
                >
                  {subheadline}
                </p>
              )}
            </div>
          )}
          <div className={cn("grid gap-6", columnClasses[columns])}>
            {items.map((item, index) => (
              <Card key={index} variant="elevated" className="text-center" hover>
                {item.icon && (
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4", styles.iconBg)}>
                    <Icon name={item.icon} className={styles.iconColor} size="lg" />
                  </div>
                )}
                <h3
                  className={cn("text-xl font-semibold mb-2", styles.itemTitle)}
                  data-tina-field={getItemField(index, "title")}
                >
                  {item.title}
                </h3>
                {item.description && (
                  <p
                    className={cn("text-sm", styles.itemDesc)}
                    data-tina-field={getItemField(index, "description")}
                  >
                    {item.description}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (variant === "comparison") {
    return (
      <section className={cn("py-20", styles.bg)}>
        <Container>
          {(headline || subheadline) && (
            <div className="text-center max-w-3xl mx-auto mb-16">
              {headline && (
                <h2
                  className={cn("text-3xl md:text-4xl font-bold mb-4", styles.headline)}
                  data-tina-field={tinaFields?.headline}
                >
                  {headline}
                </h2>
              )}
              {subheadline && (
                <p
                  className={cn("text-lg", styles.subheadline)}
                  data-tina-field={tinaFields?.subheadline}
                >
                  {subheadline}
                </p>
              )}
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-8">
            {items.map((item, index) => (
              <Card key={index} variant="bordered" className={cn(styles.cardBg, "relative")} hover>
                <div className="flex items-start gap-4">
                  {item.icon && (
                    <div className={cn("w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center", styles.iconBg)}>
                      <Icon name={item.icon} className={styles.iconColor} size="md" />
                    </div>
                  )}
                  <div>
                    <h3
                      className={cn("text-xl font-semibold mb-2", styles.itemTitle)}
                      data-tina-field={getItemField(index, "title")}
                    >
                      {item.title}
                    </h3>
                    {item.description && (
                      <p
                        className={cn("text-base", styles.itemDesc)}
                        data-tina-field={getItemField(index, "description")}
                      >
                        {item.description}
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

  return null;
}
