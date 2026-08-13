import "server-only";

import { consents, db, writeAuditLog } from "@pbh/db";
import { CONSENT_REQUIRED_ERROR, type ConsentState } from "../types";
import { CONSENT_VERSION } from "./consent";
import { isPgError, PgErrorCode } from "./db-errors";

/**
 * Record the user's acknowledgment of the wellness + HIPAA NPP terms. Writes one
 * append-only row per consent type plus a `consent` audit entry.
 *
 * `userId` is resolved by the app wrapper (via the identity seam), not trusted
 * from the form. Request metadata (`ipHash`, `userAgent`) is read by the app and
 * passed in, keeping this core framework-agnostic.
 */
export async function recordConsentCore({
  userId,
  agreed,
  ipHash,
  userAgent,
  version,
}: {
  userId: string;
  agreed: boolean;
  ipHash: string;
  userAgent: string | null;
  /**
   * Which terms this customer actually saw. Passed in by the app, which reads
   * it from wherever the terms came from — the marketing app renders them from
   * the CMS, so the version travels with them there. Falls back to
   * `CONSENT_VERSION` for a host still rendering the code-owned terms.
   *
   * The rows are append-only, so this is the only chance to record it.
   */
  version?: string | null;
}): Promise<ConsentState> {
  const consentVersion = version?.trim() || CONSENT_VERSION;
  if (!userId) {
    return {
      status: "error",
      message: "Missing account reference. Please restart and try again.",
    };
  }

  if (!agreed) {
    return {
      status: "error",
      message: "Please confirm before continuing.",
      fieldErrors: { agreed: CONSENT_REQUIRED_ERROR },
    };
  }

  try {
    await db.insert(consents).values([
      {
        userId,
        consentType: "wellness",
        version: consentVersion,
        ipHash,
        userAgent,
      },
      {
        userId,
        consentType: "hipaa_npp",
        version: consentVersion,
        ipHash,
        userAgent,
      },
    ]);

    await writeAuditLog({
      eventType: "consent",
      userId,
      ipHash,
      metadata: {
        types: ["wellness", "hipaa_npp"],
        version: consentVersion,
      },
    });

    return { status: "success" };
  } catch (err) {
    // userId came from the flow; a bad/stale value trips the FK to users.id
    // rather than being a transient failure.
    if (isPgError(err, PgErrorCode.ForeignKeyViolation)) {
      return {
        status: "error",
        message:
          "We couldn't find your account. Please restart and create your account again.",
      };
    }
    console.error("recordConsentCore failed:", err);
    return {
      status: "error",
      message: "Something went wrong saving your consent. Please try again.",
    };
  }
}
