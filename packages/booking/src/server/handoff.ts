import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db, payments } from "@pbh/db";

/**
 * Post-payment sign-in handoff: marketing charges the card, the funnel owns the
 * session, and the two are different origins — so marketing cannot set the
 * funnel's cookie. Instead it mints a signed token here, the customer is sent to
 * the funnel with it, and the funnel exchanges it for a real Auth.js session.
 *
 * This token IS a login credential and it travels in a URL, so it ends up in
 * browser history and any referrer. Three things keep that acceptable:
 *
 *  1. **Short-lived** — 10 minutes, matching the existing funnel→Linus handoff
 *     contract (`HANDOFF_TOKEN_TTL_SECONDS` in `@pbh/types`).
 *  2. **Single-use** — redemption is an atomic claim on
 *     `payments.handoff_consumed_at`, so a replay from history finds nothing.
 *  3. **Bound to a real payment** — the claim only succeeds against a row that
 *     actually reached `succeeded`. A valid signature alone grants nothing.
 *
 * It is also only issued after the email address has been confirmed earlier in
 * the booking flow, so the inbox is known to belong to the payer.
 */

/** Matches `HANDOFF_TOKEN_TTL_SECONDS` in `@pbh/types` — same rationale. */
export const AUTH_HANDOFF_TTL_SECONDS = 600;

function getSecret(): string {
  const secret = process.env.AUTH_HANDOFF_SECRET;
  if (!secret) {
    throw new Error(
      "Post-payment sign-in is not configured. Missing AUTH_HANDOFF_SECRET. " +
        "It must be the SAME value in the marketing and funnel apps — one mints " +
        "the token, the other verifies it. Generate with `openssl rand -base64 32`.",
    );
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

/** `<userId>.<paymentIntentId>.<expiryMs>.<hmac>` */
export function createHandoffToken(
  userId: string,
  paymentIntentId: string,
): string {
  const expiry = Date.now() + AUTH_HANDOFF_TTL_SECONDS * 1000;
  const payload = `${userId}.${paymentIntentId}.${expiry}`;
  return `${payload}.${sign(payload)}`;
}

export type HandoffResult =
  | { status: "ok"; userId: string }
  | { status: "invalid"; reason: "malformed" | "expired" | "used-or-unpaid" };

/**
 * Verify a handoff token and claim its one use. Returns the user to sign in.
 *
 * The claim is the `UPDATE … WHERE handoff_consumed_at IS NULL` itself, not a
 * read followed by a write, so two tabs opening the same link can't both get a
 * session. "Already used" and "never paid" collapse into one reason on purpose:
 * distinguishing them tells an attacker whether a payment id is real.
 */
export async function redeemHandoffToken(
  token: string,
): Promise<HandoffResult> {
  const parts = (token ?? "").split(".");
  if (parts.length !== 4) {
    return { status: "invalid", reason: "malformed" };
  }
  const [userId, paymentIntentId, expiryRaw, signature] = parts;

  const expected = sign(`${userId}.${paymentIntentId}.${expiryRaw}`);
  const a = Buffer.from(signature, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { status: "invalid", reason: "malformed" };
  }

  const expiry = Number(expiryRaw);
  if (!Number.isFinite(expiry) || expiry < Date.now()) {
    return { status: "invalid", reason: "expired" };
  }

  const claimed = await db
    .update(payments)
    .set({ handoffConsumedAt: new Date() })
    .where(
      and(
        eq(payments.stripePaymentIntentId, paymentIntentId),
        eq(payments.userId, userId),
        eq(payments.status, "succeeded"),
        isNull(payments.handoffConsumedAt),
      ),
    )
    .returning({ userId: payments.userId });

  if (claimed.length === 0) {
    return { status: "invalid", reason: "used-or-unpaid" };
  }

  return { status: "ok", userId };
}

/**
 * Find the payment this user just completed and mint a handoff token for it.
 * Returns null when there is nothing to hand off — no succeeded payment, or one
 * whose handoff was already redeemed — so the caller falls back to the magic
 * link rather than producing a token that cannot work.
 */
export async function createHandoffForLatestPayment(
  userId: string,
): Promise<string | null> {
  const [payment] = await db
    .select({ intentId: payments.stripePaymentIntentId })
    .from(payments)
    .where(
      and(
        eq(payments.userId, userId),
        eq(payments.status, "succeeded"),
        isNull(payments.handoffConsumedAt),
      ),
    )
    .limit(1);

  if (!payment) {
    return null;
  }
  return createHandoffToken(userId, payment.intentId);
}
