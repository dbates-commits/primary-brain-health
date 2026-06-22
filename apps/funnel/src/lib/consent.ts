/**
 * Single source of truth for consent versions + types. Bump CONSENT_VERSION
 * whenever the wellness or HIPAA NPP copy changes — existing rows stay pinned to
 * the version the user actually acknowledged (the table is append-only).
 *
 * Placeholder values for now; real per-type versioning lands with the
 * compliance task.
 */
export const CONSENT_VERSION = "2026-06-01";

export const CONSENT_TYPES = ["wellness", "hipaa_npp"] as const;

export type ConsentType = (typeof CONSENT_TYPES)[number];
