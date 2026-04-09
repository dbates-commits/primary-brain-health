import type { CSSProperties } from "react";
import type { TinaMarkdownContent } from "tinacms/dist/rich-text";

export interface TinaFieldsMap {
  headline?: string;
  subheadline?: string;
  trustText?: string;
  primaryButtonText?: string;
}

export interface HeroProps {
  theme?: "light" | "dark" | "primary" | "secondary";
  headline?: string;
  subheadline?: string;
  subheadlineRich?: TinaMarkdownContent;
  trustText?: string;
  image?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  tinaFields?: TinaFieldsMap;
}

export const TRUST_AVATARS = [
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=120&h=120&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=120&h=120&fit=crop&crop=face",
];

export const DEFAULT_HERO_IMAGE = "/images/laughing-couple.png";

export function highlightBrainHealth(
  headline: string,
  colorClass = "text-secondary",
  spanStyle?: CSSProperties
) {
  const parts = headline.split(/(Brain Health)/i);
  return parts.map((part, i) =>
    /brain health/i.test(part) ? (
      <span key={i} className={colorClass} style={spanStyle}>
        {part}
      </span>
    ) : (
      part
    )
  );
}

export function TrustAvatars({ borderClass = "border-surface" }: { borderClass?: string }) {
  return (
    <div className="flex items-center">
      {TRUST_AVATARS.map((src, i) => (
        <div
          key={i}
          className={`w-8 h-8 rounded-full overflow-hidden border-2 ${borderClass}`}
          style={{ marginLeft: i > 0 ? "-10px" : 0 }}
        >
          <img src={src} alt="" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}
