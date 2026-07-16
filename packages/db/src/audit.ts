import { db } from "./client";
import { auditLog } from "./schema";

/**
 * Significant events worth an immutable audit-trail entry. Keep this union in
 * sync with what compliance expects to see (SAQ-A + HIPAA).
 */
export type AuditEventType =
  | "signup"
  | "consent"
  | "payment_pending"
  | "payment_succeeded"
  | "payment_failed"
  | "payment_refunded"
  | "token_issued"
  | "email_sent";

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
