/**
 * The two bookable assessment packages (Figma 1088:4452).
 *
 * This is the single source of truth for what each package is called, what it
 * includes, and which Stripe price backs it. Both the marketing cards and the
 * server checkout path read from here, so the copy a customer reads and the
 * price they are charged cannot drift apart by editing only one of them.
 *
 * `displayPrice` is marketing copy, NOT what gets charged. The charge always
 * comes from the Stripe Price resolved via `priceEnvVar` (see
 * `getAssessmentCatalogEntry`), and Embedded Checkout renders that real amount
 * before the customer pays — so a stale value here is a copy bug, never a
 * billing one. Keep it in step with the Stripe catalog anyway.
 */

/** Stable identifier for a package. Persisted on `payments.package_key`. */
export type PackageKey = "basic" | "comprehensive";

export interface AssessmentPackage {
  key: PackageKey;
  /** Card title, e.g. "Basic Assessment Package". */
  name: string;
  /** Marketing copy only — see the note above. */
  displayPrice: string;
  /** Env var naming the Stripe Price ID that backs this package. */
  priceEnvVar: string;
  /** Card CTA label. */
  ctaLabel: string;
  /**
   * Bullets, in design order. `emphasis` renders bold — the Comprehensive card
   * leads with a bold "Everything in the Basic Assessment." callback.
   */
  includes: ReadonlyArray<{ text: string; emphasis?: boolean }>;
  /**
   * Render the check icons in the highlight green rather than white. The design
   * uses this to make Comprehensive's extra deliverables stand out; its first
   * bullet (the emphasised callback to Basic) stays white either way.
   */
  accentChecks?: boolean;
  /**
   * Whether the CTA can start a booking. The flag exists so a package can be
   * shown before it can be sold.
   *
   * ⚠️ Both are currently `true`, but Comprehensive's extra deliverables — a
   * physician assessment, a clinician diagnosis, medication and referral
   * management — have no implementation behind them yet. Enrollment puts every
   * paying user through the same Linus campaigns regardless of what they paid,
   * so a $449 customer today receives exactly the $149 service. The clinical
   * fulfillment and the consent copy (the current wellness + HIPAA NPP text is
   * not written for a diagnostic service) are tracked on pbh-eaj.
   */
  purchasable: boolean;
}

export const ASSESSMENT_PACKAGES: readonly AssessmentPackage[] = [
  {
    key: "basic",
    name: "Basic Assessment Package",
    displayPrice: "$149",
    priceEnvVar: "STRIPE_ASSESSMENT_PRICE_ID",
    ctaLabel: "Book Basic Assessment",
    includes: [
      { text: "Brain health assessment (taken online)" },
      { text: "A personal consultation with a brain health specialist" },
      { text: "Clear explanation of findings and risk profile" },
      { text: "Personalized lifestyle recommendations and next steps" },
    ],
    purchasable: true,
  },
  {
    key: "comprehensive",
    name: "Comprehensive Assessment Package",
    displayPrice: "$449",
    priceEnvVar: "STRIPE_COMPREHENSIVE_PRICE_ID",
    ctaLabel: "Book Comprehensive Assessment",
    includes: [
      { text: "Everything in the Basic Assessment.", emphasis: true },
      { text: "Physician Assessment." },
      { text: "A diagnosis from a clinician" },
      { text: "Ongoing treatment options with medication and doctor referrals" },
      { text: "Continuous support from a brain health specialist" },
    ],
    accentChecks: true,
    purchasable: true,
  },
] as const;

/** Valid package keys, for validating a client-supplied selection. */
export const PACKAGE_KEYS: ReadonlySet<string> = new Set(
  ASSESSMENT_PACKAGES.map((p) => p.key),
);

/** The package a booking defaults to when none was chosen. */
export const DEFAULT_PACKAGE_KEY: PackageKey = "basic";

/** Look up a package by key, or `undefined` if the key isn't one of ours. */
export function getPackage(key: string): AssessmentPackage | undefined {
  return ASSESSMENT_PACKAGES.find((p) => p.key === key);
}

/**
 * Narrow a client-supplied value to a purchasable package key. Anything unknown
 * — or a package that isn't purchasable yet — falls back to the default, so a
 * tampered form value can never start a checkout we can't fulfill.
 */
export function resolvePackageKey(value: unknown): PackageKey {
  const pkg = typeof value === "string" ? getPackage(value) : undefined;
  if (pkg?.purchasable) {
    return pkg.key;
  }
  return DEFAULT_PACKAGE_KEY;
}
