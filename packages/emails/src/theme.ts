/**
 * Email-safe rendition of "The Cognitive Sanctuary" design tokens.
 *
 * Email clients can't consume CSS custom properties or Tailwind classes, so
 * the brand values from `@pbh/tokens/theme.css` are mirrored here as literal
 * hex strings for inline styles. If a token changes there, update it here too
 * — theme.css stays the source of truth.
 */
export const emailColors = {
  /** --color-primary — Dark Teal */
  primary: "#006e8a",
  /** --color-primary-container */
  primaryContainer: "#004d61",
  /** --color-on-primary */
  onPrimary: "#ffffff",
  /** --color-secondary — Aqua accent */
  secondary: "#009ea1",
  /** --color-surface */
  surface: "#ffffff",
  /** --color-surface-container-low — page background behind the card */
  surfaceContainerLow: "#f5f3ee",
  /** --color-surface-container */
  surfaceContainer: "#f0eee9",
  /** --color-on-surface — primary text */
  onSurface: "#1b1c19",
  /** --color-on-surface-variant — secondary text */
  onSurfaceVariant: "#44474d",
  /** --color-outline-variant — hairline borders */
  outlineVariant: "#c5c6ce",
  /** --color-error */
  error: "#ba1a1a",
} as const;

/**
 * Single stack for headings and body. The web apps pair Larken (headlines)
 * with Inter (body), but Larken isn't web-font-servable to email clients, so
 * emails standardize on the Inter stack with system fallbacks.
 */
export const emailFontStack =
  "Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";

/**
 * Absolute URL for the header logo — email clients need a hosted image, not
 * a relative path or data URI (Gmail blocks the latter). Resolved at render
 * time: EMAIL_LOGO_URL wins (set it once a stable production/CDN URL exists),
 * otherwise the file the funnel serves from public/email-assets/ under
 * APP_BASE_URL.
 */
export function emailLogoUrl(): string {
  if (process.env.EMAIL_LOGO_URL) {
    return process.env.EMAIL_LOGO_URL;
  }
  const base = process.env.APP_BASE_URL ?? "http://localhost:3001";
  return `${base}/email-assets/pbh-logo.png`;
}
