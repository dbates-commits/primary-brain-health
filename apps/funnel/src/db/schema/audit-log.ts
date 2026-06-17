import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Append-only event stream backing SAQ-A (PCI) + HIPAA audit-trail
 * requirements. Write-only from the app via the `writeAuditLog` helper
 * (src/db/audit.ts); rows are never updated or deleted. HIPAA retention is
 * 6 years (see database-plan.md "Open decisions").
 *
 * `userId` is nullable: some events (e.g. a failed signup) have no account yet.
 */
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id),
    eventType: text("event_type").notNull(),
    metadata: jsonb(),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ipHash: text("ip_hash"),
    requestId: text("request_id"),
  },
  (t) => [
    index("audit_log_user_id_idx").on(t.userId),
    index("audit_log_event_type_occurred_at_idx").on(t.eventType, t.occurredAt),
  ],
);

export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;
