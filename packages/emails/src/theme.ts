import { siteBaseUrl } from "./base-url";

/**
 * Email-safe rendition of the design tokens.
 *
 * Email clients can't consume CSS custom properties or Tailwind classes, so
 * the values from `@pbh/tokens/theme.css` are mirrored here as literal hex for
 * inline styles. theme.css stays the source of truth.
 *
 * The `@token` annotation on each entry is machine-read: a node test asserts
 * the named variable exists in theme.css and resolves to this hex, so the
 * mirror can no longer drift in silence the way "update it here too" allowed.
 * Anything intentionally NOT mirrored says `@token none` and why.
 */
export const emailColors = {
  /** @token --color-brand-default */
  brandDefault: "#006e8a",
  /** @token --color-brand-deep */
  brandDeep: "#004d61",
  /** @token --color-brand-on-brand */
  brandOnBrand: "#ffffff",
  /** @token --color-aqua-default */
  aquaDefault: "#009ea1",
  /** @token --color-background-default */
  backgroundDefault: "#ffffff",
  /** @token --color-background-warm — page ground behind the card */
  backgroundWarm: "#f5f3ee",
  /** @token --color-background-warm-strong — the email panel ground */
  backgroundWarmStrong: "#f0eee9",
  /** @token --color-ink-strong — primary text */
  inkStrong: "#1b1c19",
  /** @token --color-text-default — secondary text */
  textDefault: "#45474d",
  /** @token --color-outline-variant — hairline borders */
  outlineVariant: "#c5c6ce",
  /** @token --color-error */
  error: "#ba1a1a",
  /** @token --color-danger — the declined-payment red */
  danger: "#d60012",
} as const;

/**
 * Single stack for headings and body.
 *
 * @token none — deliberate divergence. The web apps pair Larken (headlines)
 * with Inter (body), but Larken is not web-font-servable to email clients, so
 * emails standardize on the Inter stack with system fallbacks. Its absence
 * from the sync check is intent, not oversight.
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

/**
 * Absolute, HTTPS-safe URL for a file under the site's public/email-assets.
 *
 * Except under `pnpm email`, where the marketing app isn't running and the
 * absolute localhost:3000 URL would 404 — every image in the preview would
 * render as a broken box. There the react-email dev server serves the same
 * files itself (see `isReactEmailPreview`), so we hand back a root-relative
 * `/static/<file>` URL that resolves against whichever port the preview
 * landed on. Real sends never take this branch: mail clients can't resolve a
 * relative URL, and nothing sets these variables outside the preview CLI.
 */
function emailAssetUrl(file: string): string {
  if (isReactEmailPreview()) {
    return `/static/${file}`;
  }
  return ensureSecureUrl(`${siteBaseUrl()}/email-assets/${file}`);
}

/**
 * True when the template is being rendered by the `email dev` preview server.
 *
 * The CLI injects a set of `REACT_EMAIL_INTERNAL_*` variables into the process
 * it renders templates in; this is the one naming the emails directory, which
 * is also the directory the server serves `/static` out of. Checking an env
 * var the CLI owns beats sniffing NODE_ENV — the marketing app runs these same
 * templates in development too, and there the absolute URL is correct.
 */
function isReactEmailPreview(): boolean {
  return Boolean(process.env.REACT_EMAIL_INTERNAL_EMAILS_DIR_ABSOLUTE_PATH);
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
