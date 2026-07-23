import type { Track } from "@pbh/copy";

/**
 * Validated Stripe server-side environment access, mirroring db/env.ts and
 * linus/env.ts: read `process.env`, throw a helpful error if the secret key is
 * missing. The publishable key is read directly on the client via
 * `process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (safe to expose).
 */
export function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "Stripe is not configured. Missing STRIPE_SECRET_KEY. Locally, copy " +
        ".env.example to .env.local and paste your Stripe test secret key. On " +
        "Vercel, set it per environment.",
    );
  }
  return key;
}

/**
 * Which env var holds each track's Catalog Price ID.
 *
 * The wellness track deliberately keeps the original
 * `STRIPE_ASSESSMENT_PRICE_ID` name rather than being renamed to something
 * symmetrical: that variable is already set in every environment (local,
 * Preview, Production) and in both apps, and renaming it would break payments
 * everywhere the moment this deploys. Only the clinical price is new.
 */
export const TRACK_PRICE_ENV_VARS = {
  wellness: "STRIPE_ASSESSMENT_PRICE_ID",
  clinical: "STRIPE_CLINICAL_PRICE_ID",
} as const satisfies Record<Track, string>;

/**
 * Catalog Price ID for a track's product, charged at checkout. The amount and
 * currency live on the Stripe Price object (the single source of truth), so
 * this ID — not a hardcoded cents value — is what varies between environments:
 * the sandbox test price locally/on Preview, the live price in Production. Set
 * both per Vercel environment.
 */
export function getStripePriceId(track: Track): string {
  const envVar = TRACK_PRICE_ENV_VARS[track];
  const priceId = process.env[envVar];
  if (!priceId) {
    throw new Error(
      `Stripe checkout is not configured for the ${track} track. Missing ` +
        `${envVar}. Locally, copy .env.example to .env.local and paste a ` +
        "test-mode Price ID from the same Stripe account as your secret key. " +
        "On Vercel, set it per environment (sandbox price on Preview, live " +
        "price in Production).",
    );
  }
  return priceId;
}

/**
 * Signing secret for the Stripe webhook endpoint, used to verify that inbound
 * events genuinely came from Stripe. Distinct per endpoint: the local Stripe
 * CLI (`stripe listen`) prints its own `whsec_…`, and each hosted endpoint in
 * the Stripe dashboard has a different one — set the matching value per Vercel
 * environment.
 */
export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "Stripe webhooks are not configured. Missing STRIPE_WEBHOOK_SECRET. " +
        "Locally, run `stripe listen --forward-to localhost:3001/api/stripe/webhook` " +
        "and paste the printed whsec_… into .env.local. On Vercel, set it per " +
        "environment from the endpoint's signing secret.",
    );
  }
  return secret;
}
