import { and, eq, isNull } from "drizzle-orm";
import { db, users } from "@pbh/db";
import { normalizeEmail } from "@pbh/booking/server";

/** The subset of the user row the auth flow needs. */
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
}

/**
 * Look up an account by email for the magic-link flow. Shared by the login-only
 * `signIn` callback (which rejects unknown addresses before a token is minted)
 * and by `sendMagicLinkEmail` (which needs the first name for the greeting), so
 * both agree on exactly what counts as an existing account.
 *
 * `users.email` is Postgres `citext`, so this is case-insensitive; we normalize
 * anyway to match how the rest of the app writes addresses.
 *
 * A deactivated account is deliberately not "an existing account" here. Filing a
 * deletion request stamps `users.deactivated_at` but keeps the row and the
 * address (see `deactivate-account-core.ts`), so without this clause the person
 * could ask for a magic link the moment after asking to be deleted. Both doors
 * into sign-in run through this function, so one predicate closes both — and the
 * form's existing "Not an active user" wording is then literally true.
 */
export async function findAuthUserByEmail(
  rawEmail: string,
): Promise<AuthUser | null> {
  const email = normalizeEmail(rawEmail);
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
    })
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deactivatedAt)))
    .limit(1);

  return user ?? null;
}
