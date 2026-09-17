import "server-only";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db, sessions, writeAuditLog } from "@pbh/db";

import { sessionCookieName } from "@/lib/session-cookie";

/**
 * Revoke the session this request's cookie names, unless it already belongs to
 * `userId`. Returns what it did.
 *
 * Two callers, one problem: a request can arrive holding a live session for a
 * *different* person, and both of them are about to establish identity for
 * someone else.
 *
 *  - **The Auth0 callback.** `@auth/core`'s `handleLoginOrRegister` reads the
 *    session cookie first and, for an Auth0 `sub` it has not seen before, links
 *    that identity to whoever the session names — without ever comparing
 *    addresses. So a second person signing up on a browser that still holds the
 *    first one's session would be bound to that account, permanently and
 *    silently. Deleting the row makes the adapter's `getSessionAndUser` return
 *    null, and the link falls through to the by-email path that the verified-
 *    address gate exists to make safe. `prompt=login` does not cover this: it
 *    clears Auth0's SSO cookie, not ours.
 *  - **`finalizeCheckoutSession`**, which mints a session off a verified
 *    payment. Now that the confirm step signs a customer in, that mint would
 *    otherwise orphan the earlier row: Logout only deletes the token in the
 *    current cookie, and the absolute cap is enforced when a row is *read*, so
 *    the abandoned one is un-revocable, un-audited and unexpiring.
 *
 * Does not touch the cookie. Both callers write a session cookie of their own
 * on the way out, and the Auth0 callback assembles its response inside
 * `@auth/core`, where `next/headers` cannot reach it.
 */
export async function revokeSessionCookieUnless(
  userId: string,
): Promise<"kept" | "revoked" | "none"> {
  const token = (await cookies()).get(sessionCookieName())?.value;
  if (!token) {
    return "none";
  }

  const [row] = await db
    .select({ userId: sessions.userId })
    .from(sessions)
    .where(eq(sessions.sessionToken, token))
    .limit(1);
  if (!row) {
    return "none";
  }
  if (row.userId === userId) {
    return "kept";
  }

  await db.delete(sessions).where(eq(sessions.sessionToken, token));
  try {
    await writeAuditLog({ eventType: "logout", userId: row.userId });
  } catch (err) {
    console.error("[auth] audit write for superseded session failed:", err);
  }
  return "revoked";
}
