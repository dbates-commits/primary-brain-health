import "server-only";

/**
 * `@pbh/booking/server` — the shared, server-only orchestration behind the
 * booking step forms: account/details/consent write cores, the Stripe checkout +
 * fulfillment path, the Linus register/enroll flow, the webhook handler, and the
 * small helper set (email, db-errors, consent, request-meta) they build on.
 *
 * Both the funnel and the marketing app import from here, so this is the single
 * source of truth for the payment/enrollment logic. Each app keeps only its thin
 * `"use server"` wrappers (resolving the current user and reading request
 * headers) plus its own post-payment concerns (cookies, redirects, handoff).
 */
export * from "./auth";
export * from "./email";
export * from "./db-errors";
export * from "./consent";
export * from "./request-meta";
export * from "./fulfill";
export * from "./register-and-enroll";
export * from "./signup-core";
export * from "./details-core";
export * from "./consent-core";
export * from "./checkout-core";
export * from "./webhook";
