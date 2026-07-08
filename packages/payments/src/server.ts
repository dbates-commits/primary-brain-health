import Stripe from "stripe";
import { getStripeSecretKey } from "./env";

/**
 * Server-side Stripe SDK, instantiated lazily so a missing key only errors on
 * the first payment request rather than at module load / build time. The secret
 * key never leaves the server — only ever imported from `"use server"` actions.
 *
 * The API version is pinned explicitly (rather than defaulting to the account's
 * dashboard version) so request/response shapes stay stable; bumping the `stripe`
 * package surfaces a type error here until we deliberately adopt the new version.
 */
const STRIPE_API_VERSION = "2026-06-24.dahlia";

let cached: Stripe | undefined;

export function getStripe(): Stripe {
  if (!cached) {
    cached = new Stripe(getStripeSecretKey(), {
      apiVersion: STRIPE_API_VERSION,
    });
  }
  return cached;
}
