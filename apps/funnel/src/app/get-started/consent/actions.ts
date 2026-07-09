"use server";

import { headers } from "next/headers";
import { consents, db, writeAuditLog } from "@pbh/db";
import { CONSENT_VERSION } from "@/lib/consent";
import { getClientIp, hashIp } from "@/lib/request-meta";
import { isPgError, PgErrorCode } from "@/lib/db-errors";
import type { ConsentState } from "@pbh/booking";

/**
 * Record the user's acknowledgment of the wellness + HIPAA NPP terms. Writes one
 * append-only row per consent type plus a `consent` audit entry.
 *
 * NOTE: `userId` arrives from a hidden form field, i.e. it's client-trusted.
 * That's acceptable for this scaffold; once auth/session lands, derive the user
 * server-side instead of trusting the field.
 */
export async function recordConsent(
  _prev: ConsentState,
  formData: FormData,
): Promise<ConsentState> {
  const userId = String(formData.get("userId") ?? "").trim();
  const agreed = formData.get("agreed") === "on";

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

  const requestHeaders = await headers();
  const ipHash = hashIp(getClientIp(requestHeaders));
  const userAgent = requestHeaders.get("user-agent");

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
    // userId came from a (client-trusted) hidden field; a bad/stale value
    // trips the FK to users.id rather than being a transient failure.
    if (isPgError(err, PgErrorCode.ForeignKeyViolation)) {
      return {
        status: "error",
        message:
          "We couldn't find your account. Please restart and create your account again.",
      };
    }
    console.error("recordConsent failed:", err);
    return {
      status: "error",
      message: "Something went wrong saving your consent. Please try again.",
    };
  }
}
