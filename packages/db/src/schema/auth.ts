import {
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Mirrors Auth.js's `AdapterAccountType` without taking a next-auth dependency
 * in the data layer — the string set is stable and the adapter only ever writes
 * these values.
 */
type AdapterAccountType = "oauth" | "oidc" | "email" | "webauthn";

/**
 * Auth.js (NextAuth) persistence tables, owned by `@pbh/db` alongside the rest
 * of the schema so migrations stay in one place. Shapes follow the official
 * `@auth/drizzle-adapter` Postgres reference, with two deliberate deviations:
 *
 *  - `userId` foreign keys are `uuid` (our `users.id` is a uuid), not `text`.
 *  - Table/column DB names are snake_case to match the rest of the schema; the
 *    JS property keys stay exactly as the adapter expects (`sessionToken`,
 *    `providerAccountId`, …), which is what the adapter references.
 *
 * `accounts` exists for future OAuth providers — the magic-link (email) flow
 * never writes it. `sessions` backs the database session strategy (revocable,
 * see auth.ts). `verificationTokens` holds single-use magic-link tokens.
 */

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text().$type<AdapterAccountType>().notNull(),
    provider: text().notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text(),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    sessionToken: text("session_token").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp({ withTimezone: true, mode: "date" }).notNull(),
  },
  // Lookups are by primary key, but the cascade on user delete — and any future
  // "sign out everywhere" — scans by user_id, which would otherwise be a seq scan.
  (session) => [index("sessions_user_id_idx").on(session.userId)],
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text().notNull(),
    token: text().notNull(),
    expires: timestamp({ withTimezone: true, mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

export type Account = typeof accounts.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type VerificationToken = typeof verificationTokens.$inferSelect;
