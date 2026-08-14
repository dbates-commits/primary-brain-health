import "server-only";

import { signPayload, signatureMatches } from "./signing";

/**
 * A signed record of WHICH terms were put in front of this customer, minted when
 * the consent step renders and handed back when they accept.
 *
 * The `consents` rows are append-only: the version stamped on them is the only
 * evidence of what a customer agreed to, and there is no correcting it later. So
 * it has to name the words that were actually on screen — which means it has to
 * be decided where those words are chosen (render), not where the acceptance
 * arrives (submit). Re-reading the CMS at submit time gets this wrong in both
 * directions: a version whose terms have since been cleared, or the code-owned
 * version recorded against CMS terms the customer plainly read because the
 * second read happened to fail.
 *
 * Signing is what lets the value travel through the browser without the browser
 * getting a say in it. The customer's page carries the stamp; only this server
 * can author one, so a tampered value is rejected rather than believed.
 *
 * Format: `<version>.<hmac>`, where an empty version means the terms shipped
 * from code and `CONSENT_VERSION` describes them.
 *
 * Deliberately carries no expiry, unlike the identity cookie. A customer sitting
 * on a page cached before an editor's change read the OLD terms, and the old
 * version is the true answer for them — expiring the stamp would reject the one
 * submission it most needs to describe.
 *
 * The form field it travels in is `CONSENT_STAMP_FIELD`, declared in `types.ts`
 * because the client binds it and cannot import a `server-only` module.
 */

/**
 * Mint the stamp for the terms being rendered. `null` for the code-owned terms.
 */
export function createConsentStamp(version: string | null): string {
  const payload = version?.trim() ?? "";
  return `${payload}.${signPayload(payload)}`;
}

/**
 * Read a stamp back.
 *
 * Returns `{ version }` — null version meaning code-owned terms — or `null` if
 * the stamp is missing, malformed, or not one we signed. A null return is not a
 * "use the default" signal: the caller cannot say what the customer read, and
 * must refuse to record rather than guess.
 */
export function readConsentStamp(
  value: unknown,
): { version: string | null } | null {
  if (typeof value !== "string" || value === "") {
    return null;
  }
  // The version itself never contains a dot-delimited signature, but it may
  // contain dots (2026-08-13 does not, but a semver-ish label would), so split
  // off the LAST segment rather than requiring exactly two.
  const separator = value.lastIndexOf(".");
  if (separator === -1) {
    return null;
  }
  const payload = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  if (!signatureMatches(payload, signature)) {
    return null;
  }
  return { version: payload === "" ? null : payload };
}
