import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db, sessions, writeAuditLog } from "@pbh/db";

/** Matches the `session.maxAge` in auth.ts (7 days). */
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/**
 * Secure cookies (and the `__Secure-` name prefix) on every deployed
 * environment — Vercel builds run with NODE_ENV=production and serve over
 * https. Plain http locally. This mirrors how Auth.js derives the cookie name,
 * so the cookie we set here is the one `auth()` reads back.
 */
function secureCookiesEnabled(): boolean {
  return process.env.NODE_ENV === "production";
}

export function sessionCookieName(): string {
  return secureCookiesEnabled()
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";
}

/**
 * Programmatically sign a user in by minting a database session row and setting
 * the Auth.js session cookie. Used after a successful payment so the funnel's
 * "pay → land on /assessments already signed in" flow works without a
 * magic-link round-trip. It does exactly what the adapter does on a normal
 * sign-in — a random session token row plus the same cookie Auth.js reads —
 * just initiated by us instead of by a magic-link click.
 */
export async function createSessionForUser(userId: string): Promise<void> {
  const sessionToken = randomUUID();
  const expires = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await db.insert(sessions).values({ sessionToken, userId, expires });

  (await cookies()).set(sessionCookieName(), sessionToken, {
    httpOnly: true,
    secure: secureCookiesEnabled(),
    sameSite: "lax",
    path: "/",
    expires,
  });

  try {
    await writeAuditLog({
      eventType: "login",
      userId,
      metadata: { method: "post-payment" },
    });
  } catch (err) {
    console.error("[auth] audit write for login failed:", err);
  }
}

/**
 * Sign the current user out: delete the session row (revoking it wherever it's
 * read) and clear the cookie. Deleting the row — not just the cookie — is the
 * point of database sessions: a stolen cookie is dead the moment the row is
 * gone.
 */
export async function destroyCurrentSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(sessionCookieName())?.value;
  if (!token) {
    return;
  }

  const [row] = await db
    .delete(sessions)
    .where(eq(sessions.sessionToken, token))
    .returning({ userId: sessions.userId });
  jar.delete(sessionCookieName());

  if (row) {
    try {
      await writeAuditLog({ eventType: "logout", userId: row.userId });
    } catch (err) {
      console.error("[auth] audit write for logout failed:", err);
    }
  }
}
