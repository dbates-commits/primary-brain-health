/**
 * The Figma-named tokens and the values Figma resolves them to.
 *
 * The single source for the swatch story below and its assertions: an entry
 * here is both what gets rendered and what gets measured, so a token cannot be
 * displayed without also being checked. Values come from
 * `docs/design-tokens-figma-export.json` — re-run the Plugin API enumeration
 * and diff that file when re-syncing, then update these.
 */
export interface Swatch {
  /** The Tailwind utility, exactly as a component would write it. */
  className: string;
  /** The Figma variable this mirrors, or null when the code names it alone. */
  figma: string | null;
  /** Expected computed value, in the form getComputedStyle returns. */
  rgb: string;
}

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

/** Semantic colours — what components should actually reach for. */
export const SEMANTIC_COLORS: Swatch[] = [
  { className: "bg-background-default", figma: "background/default", rgb: rgb("#ffffff") },
  { className: "bg-background-subtle", figma: "background/subtle", rgb: rgb("#fafafa") },
  { className: "bg-background-warm", figma: "background/warm", rgb: rgb("#f5f3ee") },
  { className: "bg-background-brand", figma: "background/brand", rgb: rgb("#006e8a") },
  { className: "bg-background-brand-subtle", figma: "background/brand-subtle", rgb: rgb("#eff6f9") },
  { className: "bg-background-teal-subtle", figma: "background/teal-subtle", rgb: rgb("#e5efef") },
  { className: "bg-text-default", figma: "text/default", rgb: rgb("#45474d") },
  { className: "bg-text-heading", figma: "text/heading", rgb: rgb("#000000") },
  { className: "bg-text-secondary", figma: "text/secondary", rgb: rgb("#6f706e") },
  { className: "bg-text-tertiary", figma: "text/tertiary", rgb: rgb("#888884") },
  { className: "bg-text-label", figma: "text/label", rgb: rgb("#374151") },
  { className: "bg-text-disabled", figma: "text/disabled", rgb: rgb("#9ca3af") },
  { className: "bg-text-brand", figma: "text/brand", rgb: rgb("#006e8a") },
  { className: "bg-text-supporting", figma: "text/supporting", rgb: rgb("#495e55") },
  { className: "bg-text-warm-dark", figma: "text/warm-dark", rgb: rgb("#231815") },
  { className: "bg-text-inverse", figma: "text/inverse", rgb: rgb("#ffffff") },
  { className: "bg-text-inverse-secondary", figma: "text/inverse-secondary", rgb: rgb("#afd2e3") },
  { className: "bg-border-default", figma: "border/default", rgb: rgb("#d8d8d8") },
  { className: "bg-border-subtle", figma: "border/subtle", rgb: rgb("#d9d9d9") },
  { className: "bg-border-strong", figma: "border/strong", rgb: rgb("#888884") },
  { className: "bg-border-brand", figma: "border/brand", rgb: rgb("#006e8a") },
  { className: "bg-brand-default", figma: "brand/default", rgb: rgb("#006e8a") },
  { className: "bg-brand-hover", figma: "brand/hover", rgb: rgb("#007dad") },
  { className: "bg-brand-active", figma: "brand/active", rgb: rgb("#346b89") },
  { className: "bg-brand-muted", figma: "brand/muted", rgb: rgb("#afd2e3") },
  { className: "bg-brand-subtle", figma: "brand/subtle", rgb: rgb("#eff6f9") },
  { className: "bg-brand-on-brand", figma: "brand/on-brand", rgb: rgb("#ffffff") },
  { className: "bg-aqua-default", figma: "teal/default", rgb: rgb("#009ea1") },
  { className: "bg-aqua-subtle", figma: "teal/subtle", rgb: rgb("#e5efef") },
  { className: "bg-accent-green", figma: "accent/green", rgb: rgb("#85c559") },
  { className: "bg-danger", figma: "danger", rgb: rgb("#d60012") },
  { className: "bg-icon-brand-teal", figma: "icon/brand-teal", rgb: rgb("#4a9ba0") },
  { className: "bg-mint-subtle", figma: "mint/subtle", rgb: rgb("#e2efef") },
  { className: "bg-accent-green-strong", figma: "accent/green-strong", rgb: rgb("#4dc78c") },
  { className: "bg-accent-green-container", figma: "accent/green-container", rgb: rgb("#e2f6e9") },
  { className: "bg-toast-surface", figma: "toast/surface", rgb: rgb("#1f262e") },
  { className: "bg-border-inverse", figma: "border/inverse", rgb: rgb("#ffffff") },
  { className: "bg-background-warm-strong", figma: "background/warm-strong", rgb: rgb("#f0eee9") },
];

/** The booking stepper's own group, modelled as semantics in Figma. */
export const STEPPER_COLORS: Swatch[] = [
  { className: "bg-stepper-active", figma: "stepper/active", rgb: rgb("#006e8a") },
  { className: "bg-stepper-inactive", figma: "stepper/inactive", rgb: rgb("#d8d8d8") },
  { className: "bg-stepper-circle-bg", figma: "stepper/circle-bg", rgb: rgb("#ffffff") },
  { className: "bg-stepper-icon-active", figma: "stepper/icon-active", rgb: rgb("#ffffff") },
  { className: "bg-stepper-line-inactive", figma: "stepper/line-inactive", rgb: rgb("#d9d9d9") },
  { className: "bg-stepper-text-active", figma: "stepper/text-active", rgb: rgb("#006e8a") },
  { className: "bg-stepper-text-inactive", figma: "stepper/text-inactive", rgb: rgb("#6f706e") },
];

/** Raw ramps. Listed so a missing mirror is caught, not so components use them. */
export const PRIMITIVE_COLORS: Swatch[] = [
  { className: "bg-brand-50", figma: "colors/brand/50", rgb: rgb("#eff6f9") },
  { className: "bg-brand-100", figma: "colors/brand/100", rgb: rgb("#b5ddf2") },
  { className: "bg-brand-200", figma: "colors/brand/200", rgb: rgb("#afd2e3") },
  { className: "bg-brand-300", figma: "colors/brand/300", rgb: rgb("#5eaeb3") },
  { className: "bg-brand-400", figma: "colors/brand/400", rgb: rgb("#4a9ba0") },
  { className: "bg-brand-500", figma: "colors/brand/500", rgb: rgb("#008db8") },
  { className: "bg-brand-600", figma: "colors/brand/600", rgb: rgb("#007dad") },
  { className: "bg-brand-700", figma: "colors/brand/700", rgb: rgb("#006e8a") },
  { className: "bg-brand-800", figma: "colors/brand/800", rgb: rgb("#346b89") },
  { className: "bg-brand-850", figma: "colors/brand/850", rgb: rgb("#224b60") },
  { className: "bg-brand-900", figma: "colors/brand/900", rgb: rgb("#033246") },
  { className: "bg-grey-50", figma: "colors/neutral/50", rgb: rgb("#fafafa") },
  { className: "bg-grey-100", figma: "colors/neutral/100", rgb: rgb("#f6f6f6") },
  { className: "bg-grey-200", figma: "colors/neutral/200", rgb: rgb("#f3f4f6") },
  { className: "bg-grey-300", figma: "colors/neutral/300", rgb: rgb("#d9d9d9") },
  { className: "bg-grey-350", figma: "colors/neutral/350", rgb: rgb("#d8d8d8") },
  { className: "bg-grey-400", figma: "colors/neutral/400", rgb: rgb("#d1d5db") },
  { className: "bg-grey-450", figma: "colors/neutral/450", rgb: rgb("#9ca3af") },
  { className: "bg-grey-500", figma: "colors/neutral/500", rgb: rgb("#888884") },
  { className: "bg-grey-550", figma: "colors/neutral/550", rgb: rgb("#6f706e") },
  { className: "bg-grey-600", figma: "colors/neutral/600", rgb: rgb("#6b7280") },
  { className: "bg-grey-700", figma: "colors/neutral/700", rgb: rgb("#4b5563") },
  { className: "bg-grey-750", figma: "colors/neutral/750", rgb: rgb("#45474d") },
  { className: "bg-grey-800", figma: "colors/neutral/800", rgb: rgb("#374151") },
  { className: "bg-grey-850", figma: "colors/neutral/850", rgb: rgb("#1b1c19") },
  { className: "bg-grey-900", figma: "colors/neutral/900", rgb: rgb("#111827") },
  { className: "bg-aqua-50", figma: "colors/teal/50", rgb: rgb("#e5efef") },
  { className: "bg-aqua-100", figma: "colors/teal/100", rgb: rgb("#a0e6ea") },
  { className: "bg-aqua-500", figma: "colors/teal/500", rgb: rgb("#009ea1") },
  { className: "bg-aqua-700", figma: "colors/teal/700", rgb: rgb("#495e55") },
  { className: "bg-green-100", figma: "colors/green/100", rgb: rgb("#e2f6e9") },
  { className: "bg-green-500", figma: "colors/green/500", rgb: rgb("#85c559") },
  { className: "bg-green-600", figma: "colors/green/600", rgb: rgb("#4dc78c") },
  { className: "bg-mint-100", figma: "colors/mint/100", rgb: rgb("#e2efef") },
  { className: "bg-yellow-100", figma: "colors/yellow/100", rgb: rgb("#feffc8") },
  { className: "bg-warm-50", figma: "colors/warm/50", rgb: rgb("#f5f3ee") },
  { className: "bg-warm-100", figma: "colors/warm/100", rgb: rgb("#f0eee9") },
  { className: "bg-warm-900", figma: "colors/warm/900", rgb: rgb("#231815") },
  { className: "bg-ink-900", figma: "colors/ink/900", rgb: rgb("#1f262e") },
];

/** Values the code needs that Figma has no variable for. */
export const CODE_ONLY_COLORS: Swatch[] = [
  { className: "bg-brand-deep", figma: null, rgb: rgb("#004d61") },
  { className: "bg-brand-wash", figma: null, rgb: rgb("#a3d4e4") },
  { className: "bg-brand-pale", figma: null, rgb: rgb("#d1eaf2") },
  { className: "bg-focus-ring", figma: null, rgb: rgb("#8ec7da") },
  { className: "bg-aqua-container", figma: null, rgb: rgb("#b3e8e9") },
  { className: "bg-on-aqua-container", figma: null, rgb: rgb("#007577") },
  { className: "bg-outline", figma: null, rgb: rgb("#75777e") },
  { className: "bg-outline-variant", figma: null, rgb: rgb("#c5c6ce") },
  { className: "bg-grey-warm-200", figma: null, rgb: rgb("#dfdfdf") },
];

export interface SizeToken {
  className: string;
  figma: string;
  px: string;
}

export const TYPE_STEPS: SizeToken[] = [
  { className: "text-display", figma: "heading/display", px: "80px" },
  { className: "text-h1", figma: "heading/h1", px: "56px" },
  { className: "text-h2", figma: "heading/h2", px: "48px" },
  { className: "text-h3", figma: "heading/h3", px: "40px" },
  { className: "text-h4", figma: "heading/h4", px: "32px" },
  { className: "text-h5", figma: "heading/h5", px: "24px" },
  { className: "text-subtitle", figma: "heading/subtitle", px: "20px" },
  { className: "text-heading-small", figma: "heading/small", px: "16px" },
  { className: "text-body-lg", figma: "body/large", px: "20px" },
  { className: "text-body", figma: "body/base", px: "16px" },
  { className: "text-body-sm", figma: "body/small", px: "14px" },
  { className: "text-caption", figma: "caption/default", px: "12px" },
];

export const RADII: SizeToken[] = [
  { className: "rounded-button", figma: "button/radius", px: "40px" },
  { className: "rounded-modal", figma: "modal/corner-radius", px: "12px" },
  { className: "rounded-form-card", figma: "form-card/radius", px: "12px" },
  { className: "rounded-input", figma: "form-field/input-radius", px: "8px" },
  { className: "rounded-hero", figma: "hero/radius", px: "20px" },
  { className: "rounded-step-card-icon", figma: "step-card/icon-radius", px: "40px" },
];
