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
 * Look up an account by email — the login-only gate. Called from the `signIn`
 * callback in `auth.ts`, which rejects an unknown address before Auth.js hands
 * the profile to the adapter, so no user is ever created by signing in.
 *
 * `users.email` is Postgres `citext`, so this is case-insensitive; we normalize
 * anyway to match how the rest of the app writes addresses.
 *
 * A deactivated account is deliberately not "an existing account" here. Filing a
 * deletion request stamps `users.deactivated_at` but keeps the row and the
 * address (see `deactivate-account-core.ts`), so without this clause the person
 * could sign back in the moment after asking to be deleted. Both doors
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
