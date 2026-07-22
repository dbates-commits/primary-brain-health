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
 * Catalog Price ID for the brain-health assessment, charged at checkout. The
 * amount and currency live on the Stripe Price object (the single source of
 * truth), so this ID — not a hardcoded cents value — is what varies between
 * environments: the sandbox test price locally/on Preview, the live
 * `clinical_assessment` price in Production. Set it per Vercel environment.
 */
export function getStripeAssessmentPriceId(): string {
  return getStripePriceIdFromEnv("STRIPE_ASSESSMENT_PRICE_ID");
}

/**
 * Read a package's Stripe Price ID from the env var that backs it. Each
 * assessment package names its own var (see `ASSESSMENT_PACKAGES` in
 * `@pbh/booking`), so adding a package is a config change here plus a Price in
 * the Stripe catalog — never a hardcoded amount.
 *
 * Both price IDs must come from the SAME Stripe account as `STRIPE_SECRET_KEY`,
 * and that account must match the one the funnel's webhook uses; fulfillment
 * re-fetches the PaymentIntent and validates it against the catalog price.
 */
export function getStripePriceIdFromEnv(envVar: string): string {
  const priceId = process.env[envVar];
  if (!priceId) {
    throw new Error(
      `Stripe checkout is not configured. Missing ${envVar}. Locally, copy ` +
        ".env.example to .env.local and paste a test-mode Price ID from the " +
        "same Stripe account as your secret key. On Vercel, set it per " +
        "environment (sandbox price on Preview, live price in Production).",
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
