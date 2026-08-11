import { eq } from "drizzle-orm";
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
    .where(eq(users.email, email))
    .limit(1);

  return user ?? null;
}
