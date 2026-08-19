import { siteBaseUrl } from "./base-url";

/**
 * Email-safe rendition of the design tokens.
 *
 * Email clients can't consume CSS custom properties or Tailwind classes, so
 * the values from `@pbh/tokens/theme.css` are mirrored here as literal hex
 * strings for inline styles. Both sides are synced by hand from Figma
 * (SppKdzsaH6rQ14u90UpNSq) — if a token changes there, update it here too.
 * Only the values the templates actually use are mirrored.
 */
export const emailColors = {
  /** --color-brand-default — Figma `brand/default` */
  brandDefault: "#006e8a",
  /** --color-brand-on-brand — Figma `brand/on-brand` */
  brandOnBrand: "#ffffff",
  /** --color-background-default — Figma `background/default` */
  backgroundDefault: "#ffffff",
  /** --color-background-warm — Figma `background/warm`; page bg behind the card */
  backgroundWarm: "#f5f3ee",
  /** --color-warm-100 — CODE-ONLY, no Figma variable */
  warm100: "#f0eee9",
  /** --color-grey-850 — Figma primitive `colors/neutral/850`; primary text */
  grey850: "#1b1c19",
  /** --color-text-default — Figma `text/default`; secondary text */
  textDefault: "#45474d",
  /** --color-outline-variant — CODE-ONLY, no Figma variable; hairline borders */
  outlineVariant: "#c5c6ce",
} as const;

/**
 * Single stack for headings and body. The web apps pair Larken (headlines)
 * with Inter (body), but Larken isn't web-font-servable to email clients, so
 * emails standardize on the Inter stack with system fallbacks.
 */
export const emailFontStack = "Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";

/**
 * Absolute URL for the header logo — email clients need a hosted image, not
 * a relative path or data URI (Gmail blocks the latter). Resolved at render
 * time: EMAIL_LOGO_URL wins (set it once a stable production/CDN URL exists),
 * otherwise the file the marketing site serves from public/email-assets/.
 */
export function emailLogoUrl(): string {
  if (process.env.EMAIL_LOGO_URL) {
    return ensureSecureUrl(process.env.EMAIL_LOGO_URL);
  }
  return emailAssetUrl("pbh-logo.png");
}

/**
 * The teal-washed man-and-woman photo used as the Welcome email hero
 * background — the same couple from the marketing homepage hero, with a
 * mostly-opaque teal overlay baked in (email clients can't reliably layer a
 * color over a background image). Served from public/email-assets.
 */
export function emailHeroImageUrl(): string {
  return emailAssetUrl("welcome-hero-bg.jpg");
}

/** Absolute, HTTPS-safe URL for a file under the site's public/email-assets. */
function emailAssetUrl(file: string): string {
  return ensureSecureUrl(`${siteBaseUrl()}/email-assets/${file}`);
}

/**
 * Emails must reference assets over HTTPS — mail clients block or flag
 * mixed-content/insecure image URLs. Loopback hosts are left on http (the
 * local dev server has no TLS, and localhost is already a secure context);
 * any other http URL is upgraded to https so a real send can never ship an
 * insecure image reference.
 */
function ensureSecureUrl(url: string): string {
  if (/^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(url)) {
    return url;
  }
  return url.replace(/^http:\/\//i, "https://");
}
