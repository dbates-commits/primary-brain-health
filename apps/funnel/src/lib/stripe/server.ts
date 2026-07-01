import Stripe from "stripe";
import { getStripeSecretKey } from "./env";

/**
 * Server-side Stripe SDK, instantiated lazily so a missing key only errors on
 * the first payment request rather than at module load / build time. The secret
 * key never leaves the server — only ever imported from `"use server"` actions.
 */
let cached: Stripe | undefined;

export function getStripe(): Stripe {
  if (!cached) {
    cached = new Stripe(getStripeSecretKey());
  }
  return cached;
}
