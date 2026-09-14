import { db } from "./client";
import { auditLog } from "./schema";

/**
 * Significant events worth an immutable audit-trail entry. Keep the live half of
 * this union in sync with what compliance expects to see (SAQ-A + HIPAA) — and
 * in sync with what the code actually writes, which is the half that makes the
 * first claim true. Events no longer emitted are listed separately at the end.
 */
export type AuditEventType =
  | "signup"
  | "consent"
  | "payment_pending"
  | "payment_succeeded"
  | "payment_failed"
  | "payment_refunded"
  | "email_sent"
  // Authentication / session lifecycle (Auth0 login, programmatic
  // post-payment login, sign-out) — access events a HIPAA audit expects.
  | "login"
  | "logout"
  // The address was proven reachable by the person who booked. Written when
  // Auth0 reports a verified address on the first sign-in; the email itself is
  // Auth0's, so there is no longer a "we sent one" event to pair it with.
  | "email_verified"
  // Account lifecycle: a deletion request filed from the account page. Nothing
  // is erased when this is written — `users.deactivated_at` is stamped and the
  // account is locked out, and the erasure itself is an operator routine. This
  // row is the durable record of when the customer asked. The metadata never
  // carries the address; see the data-minimisation note in `schema/users.ts`.
  | "account_deactivated"
  // The deletion notice to Linus CS did not go out. Its own event, not a
  // failed `email_sent`, because it is the one send with no retry behind it:
  // the `deactivated_at` claim is idempotent, so a second request for the same
  // user returns early without re-sending. This row is how the operator
  // worklist finds a subject Linus was never told about. Metadata carries the
  // reason, never an address.
  | "deletion_notice_failed"
  // Historical. Nothing emits these any more — they belonged to the magic link,
  // the booking-confirm link and the sign-in throttle that went with them when
  // Auth0 became the only door (Sep 2026). Kept in the union because the rows
  // are still in `audit_log`, which is append-only: reading one back must not
  // be a type error. Do not add to this group; add to the live list above.
  | "token_issued"
  | "magic_link_sent"
  | "signin_rate_limited"
  | "email_verification_sent";

export interface AuditEntry {
  eventType: AuditEventType;
  /** Null for events that occur before/without an account (e.g. failed signup). */
  userId?: string | null;
  metadata?: Record<string, unknown> | null;
  /** Hash of the client IP — never store the raw IP. */
  ipHash?: string | null;
  requestId?: string | null;
}

/**
 * Append a row to the audit log. This is the only sanctioned write path into
 * `audit_log`; the table is otherwise treated as append-only.
 */
export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  await db.insert(auditLog).values({
    eventType: entry.eventType,
    userId: entry.userId ?? null,
    metadata: entry.metadata ?? null,
    ipHash: entry.ipHash ?? null,
    requestId: entry.requestId ?? null,
  });
}
