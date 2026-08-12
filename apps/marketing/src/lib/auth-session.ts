import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db, sessions, writeAuditLog } from "@pbh/db";
import { IDLE_SESSION_MAX_SECONDS } from "@/auth";

/**
 * Whether Auth.js is using secure cookies (and so the `__Secure-` name prefix).
 *
 * Auth.js derives this from the **request protocol**, not from NODE_ENV
 * (`@auth/core/lib/init.js`: `config.useSecureCookies ?? url.protocol ===
 * "https:"`). Callers that have the request must pass its protocol; guessing
 * from NODE_ENV diverges for a production build served over http — we would
 * write `__Secure-…` (which the browser then refuses over http) while `auth()`
 * reads the unprefixed name, and the session would silently never be found.
 */
function secureCookiesEnabled(protocol?: string): boolean {
  if (protocol) {
    return protocol.startsWith("https");
  }
  return process.env.NODE_ENV === "production";
}

export function sessionCookieName(protocol?: string): string {
  return secureCookiesEnabled(protocol)
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";
}

/** The cookie a caller must set for `auth()` to find the session it describes. */
export interface SessionCookie {
  name: string;
  value: string;
  options: {
    httpOnly: true;
    secure: boolean;
    sameSite: "lax";
    path: "/";
    expires: Date;
  };
}

/**
 * Mint a database session for `userId` and describe the cookie that proves it.
 *
 * Does exactly what the adapter does on a normal sign-in — a random session
 * token row plus the cookie Auth.js reads — just initiated by us. Called from
 * `finalizeCheckoutSession` once a payment verifies. Returns the cookie rather
 * than setting it: a Server Action applies it with `cookies()`, but a Route
 * Handler must put it on its own `NextResponse` (cookies set via `next/headers`
 * don't reliably survive a redirect response).
 *
 * `protocol` should be the request's (e.g. `req.nextUrl.protocol`) so the cookie
 * name matches what Auth.js will look for — see `secureCookiesEnabled`.
 */
export async function createSessionForUser(
  userId: string,
  opts: { protocol?: string; method?: string } = {},
): Promise<SessionCookie> {
  const sessionToken = randomUUID();
  // The idle deadline, same as any adapter-minted session: Auth.js slides it
  // forward on activity. Minting it further out would give this one path a
  // longer inactivity window than the 15 minutes compliance signed off on — a
  // session nobody touches would sit redeemable until that longer deadline,
  // since nothing shortens it before the first authenticated request. The
  // 8-hour absolute cap is enforced separately, off `sessions.created_at`.
  const expires = new Date(Date.now() + IDLE_SESSION_MAX_SECONDS * 1000);

  await db.insert(sessions).values({ sessionToken, userId, expires });

  try {
    await writeAuditLog({
      eventType: "login",
      userId,
      metadata: { method: opts.method ?? "post-payment" },
    });
  } catch (err) {
    console.error("[auth] audit write for login failed:", err);
  }

  return {
    name: sessionCookieName(opts.protocol),
    value: sessionToken,
    options: {
      httpOnly: true,
      secure: secureCookiesEnabled(opts.protocol),
      sameSite: "lax",
      path: "/",
      expires,
    },
  };
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
