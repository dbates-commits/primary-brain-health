import "server-only";

/**
 * `@pbh/booking/server` — the shared, server-only orchestration behind the
 * booking step forms: account/details/consent write cores, the Stripe checkout +
 * fulfillment path, the Linus register/enroll flow, the webhook handler, and the
 * small helper set (email, db-errors, consent, request-meta) they build on.
 *
 * The app imports everything from here, so this is the single source of truth
 * for the payment/enrollment logic. The app keeps only its thin `"use server"`
 * wrappers (resolving the current user and reading request headers) plus its own
 * post-payment concerns (cookies, redirects).
 */
export * from "./auth";
export * from "./email";
export * from "./db-errors";
export * from "./consent";
export * from "./request-meta";
export * from "./fulfill";
export * from "./entitlement";
export * from "./register-and-enroll";
export * from "./signup-core";
export * from "./email-verification";
export * from "./resume";
export * from "./booking-session";
export * from "./details-core";
export * from "./consent-core";
export * from "./consent-stamp";
export * from "./checkout-core";
export * from "./stripe-customer";
export * from "./webhook";
// Named, not `export *`: the other senders in that module are internal to the
// booking orchestration and should stay unreachable from an app. Deactivation
// is initiated from the account page, so this one has to cross.
export {
  sendAccountDeactivatedEmail,
  sendAccountDeletionNoticeEmail,
} from "./send-email";
