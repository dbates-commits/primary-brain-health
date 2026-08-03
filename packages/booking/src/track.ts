/**
 * The bridge between the two axes: which product a package *is*.
 *
 * `PackageKey` is the commercial axis — what a customer chose on the card, what
 * Stripe price they were charged, what gets persisted on `payments.package_key`.
 * `Track` is the editorial/compliance axis — which vocabulary a surface may use
 * about that purchase (see `@pbh/copy`). They are one-to-one today, but they are
 * not the same thing and must not be collapsed: a third package (a bundle, a
 * renewal, a regional price) would still be one of the two tracks, and the day
 * that happens the mapping is here rather than smeared across every call site.
 *
 * This lives in `@pbh/booking` on purpose. `@pbh/copy` is deliberately
 * dependency-free plain data, and `@pbh/payments` must not learn about packages;
 * booking is the only package that already knows both.
 */
import type { Track } from "@pbh/copy";
import { DEFAULT_PACKAGE_KEY, type PackageKey } from "./packages";

/**
 * `satisfies` is load-bearing: adding a package without deciding its track is a
 * typecheck failure, not a surface that quietly renders the wrong vocabulary.
 *
 * Comprehensive is clinical because of what it promises — a physician
 * assessment, a diagnosis, medication and referrals (see `ASSESSMENT_PACKAGES`).
 * Basic promises none of those, so it is wellness, and clinical vocabulary
 * rendered against it is a claim about something that wasn't sold.
 */
export const TRACK_BY_PACKAGE = {
  basic: "wellness",
  comprehensive: "clinical",
} as const satisfies Record<PackageKey, Track>;

/**
 * The track a package sells.
 *
 * Accepts the nullable/unknown shapes a package key actually arrives in — a
 * `payments.package_key` column that is null on rows written before packages
 * existed, or Stripe metadata. Those legacy rows are all the $149 product,
 * which is `basic`, so the default is a fact about history rather than a guess.
 * Anything genuinely unrecognised also lands on the default: wellness can only
 * ever understate what someone bought, never dress a wellness purchase in
 * clinical language.
 */
export function trackForPackage(key: unknown): Track {
  if (typeof key === "string" && key in TRACK_BY_PACKAGE) {
    return TRACK_BY_PACKAGE[key as PackageKey];
  }
  return TRACK_BY_PACKAGE[DEFAULT_PACKAGE_KEY];
}
