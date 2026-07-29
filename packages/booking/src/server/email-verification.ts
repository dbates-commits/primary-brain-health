import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { bookingEmailVerifications, db, users, writeAuditLog } from "@pbh/db";
import { sendConfirmEmail, sendWelcomeEmail } from "./send-email";

/** How long a confirmation link stays valid. */
export const CONFIRM_TOKEN_TTL_HOURS = 24;

/**
 * Minimum gap between confirmation sends for one user. Stops the re-send button
 * being used to mail-bomb an address (or burn Resend quota) by clicking it
 * repeatedly.
 */
const RESEND_THROTTLE_SECONDS = 60;

/**
 * Only the hash is stored, so a dump of `booking_email_verifications` can't be
 * replayed into someone's booking. SHA-256 without a salt is right here — the
 * input is 32 bytes of CSPRNG output, so there is nothing to brute-force.
 */
function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export type ConfirmResult =
  | { status: "confirmed"; userId: string }
  | { status: "invalid"; reason: "unknown" | "expired" | "already-used" };

/**
 * Mint a confirmation token for `userId` and email the link.
 *
 * Never throws — signup must not fail because a send did. The token row is
 * written first: a stored token with no email is recoverable (they re-send),
 * whereas an emailed link with no row is a dead end.
 */
export async function sendBookingConfirmation(
  userId: string,
): Promise<{ sent: boolean }> {
  try {
    const rawToken = randomBytes(32).toString("base64url");
    const expiresAt = new Date(
      Date.now() + CONFIRM_TOKEN_TTL_HOURS * 60 * 60 * 1000,
    );

    await db.insert(bookingEmailVerifications).values({
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt,
    });

    const result = await sendConfirmEmail(userId, rawToken);

    try {
      await writeAuditLog({
        eventType: "email_verification_sent",
        userId,
        metadata: { delivered: result.sent },
      });
    } catch (err) {
      console.error("[confirm] audit write for send failed:", err);
    }

    return { sent: result.sent };
  } catch (err) {
    console.error("[confirm] sendBookingConfirmation failed:", err);
    return { sent: false };
  }
}

/**
 * Re-send, subject to the throttle. Returns the same shape whether or not it
 * actually sent, so the button can't be used to probe whether an address is
 * registered or how recently someone signed up.
 */
export async function resendBookingConfirmation(
  userId: string,
): Promise<{ ok: true }> {
  try {
    const since = new Date(Date.now() - RESEND_THROTTLE_SECONDS * 1000);
    const [recent] = await db
      .select({ id: bookingEmailVerifications.id })
      .from(bookingEmailVerifications)
      .where(
        and(
          eq(bookingEmailVerifications.userId, userId),
          gt(bookingEmailVerifications.createdAt, since),
        ),
      )
      .limit(1);

    if (!recent) {
      await sendBookingConfirmation(userId);
    } else {
      console.log(`[confirm] re-send throttled for user ${userId}`);
    }
  } catch (err) {
    console.error("[confirm] resendBookingConfirmation failed:", err);
  }
  return { ok: true };
}

/**
 * Redeem a confirmation token: mark it used, stamp `users.emailVerified`, and
 * return whose booking to resume.
 *
 * The `consumedAt IS NULL` guard is part of the UPDATE, not a prior read, so two
 * concurrent clicks (a mail client prefetching the link, then the human clicking
 * it) can't both succeed. The row is kept, not deleted — the audit trail wants
 * evidence of when the address was confirmed.
 */
export async function consumeBookingConfirmation(
  rawToken: string,
): Promise<ConfirmResult> {
  const token = rawToken.trim();
  if (!token) {
    return { status: "invalid", reason: "unknown" };
  }

  const tokenHash = hashToken(token);

  const [claimed] = await db
    .update(bookingEmailVerifications)
    .set({ consumedAt: new Date() })
    .where(
      and(
        eq(bookingEmailVerifications.tokenHash, tokenHash),
        isNull(bookingEmailVerifications.consumedAt),
        gt(bookingEmailVerifications.expiresAt, new Date()),
      ),
    )
    .returning({ userId: bookingEmailVerifications.userId });

  if (!claimed) {
    // Nothing claimed: unknown token, already used, or expired. Distinguish the
    // last two so the UI can say "this link expired" instead of "invalid link",
    // which reads as though they did something wrong.
    const [existing] = await db
      .select({
        consumedAt: bookingEmailVerifications.consumedAt,
        expiresAt: bookingEmailVerifications.expiresAt,
      })
      .from(bookingEmailVerifications)
      .where(eq(bookingEmailVerifications.tokenHash, tokenHash))
      .orderBy(desc(bookingEmailVerifications.createdAt))
      .limit(1);

    if (!existing) {
      return { status: "invalid", reason: "unknown" };
    }
    if (existing.consumedAt) {
      return { status: "invalid", reason: "already-used" };
    }
    return { status: "invalid", reason: "expired" };
  }

  // Idempotent by design: re-confirming an already-verified address just
  // refreshes nothing important, and the first timestamp is the one that matters
  // for the audit, so only stamp when it's still null.
  await db
    .update(users)
    .set({ emailVerified: new Date() })
    .where(and(eq(users.id, claimed.userId), isNull(users.emailVerified)));

  try {
    await writeAuditLog({ eventType: "email_verified", userId: claimed.userId });
  } catch (err) {
    console.error("[confirm] audit write for verify failed:", err);
  }

  // Welcome lands now rather than at signup: until this point the address was
  // unproven, and sending both at once buries the link they had to click.
  await sendWelcomeEmail(claimed.userId);

  return { status: "confirmed", userId: claimed.userId };
}
