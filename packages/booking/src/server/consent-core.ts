import "server-only";

import { consents, db, writeAuditLog } from "@pbh/db";
import type { ConsentState } from "../types";
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
}: {
  userId: string;
  agreed: boolean;
  ipHash: string;
  userAgent: string | null;
}): Promise<ConsentState> {
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
      fieldErrors: { agreed: "You must agree to the terms to continue." },
    };
  }

  try {
    await db.insert(consents).values([
      {
        userId,
        consentType: "wellness",
        version: CONSENT_VERSION,
        ipHash,
        userAgent,
      },
      {
        userId,
        consentType: "hipaa_npp",
        version: CONSENT_VERSION,
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
        version: CONSENT_VERSION,
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
