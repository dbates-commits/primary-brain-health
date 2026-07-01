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
