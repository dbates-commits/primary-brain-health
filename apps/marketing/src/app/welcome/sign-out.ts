"use server";

import { headers } from "next/headers";
import { destroyCurrentSession } from "@/lib/auth-session";
import { auth0LogoutUrl } from "@/lib/auth0-logout";

/**
 * Sign the user out: revoke the database session, deleting the row so the
 * cookie is dead everywhere immediately — then hand the caller Auth0's logout
 * URL, because ours is only half the session.
 *
 * Auth0 keeps its own SSO cookie on the tenant domain. Without this second leg
 * the next sign-in is silently re-authenticated as the same person, so "log out"
 * would mean "log out until you click login". See `auth0LogoutUrl`.
 *
 * The session's own timeouts are short, but they are inactivity-based — on a
 * shared or family computer the next person would otherwise arrive signed in.
 *
 * Deliberately does **not** redirect. `redirect()` from a server action is a
 * soft client navigation, which leaves `SessionProvider`'s cached session
 * untouched — the header would keep showing the avatar and account menu for a
 * user whose session no longer exists, until a hard reload or a window focus
 * happened to refetch it. Navigation is the caller's job, and every caller goes
 * through `useSignOut`, which does it as a full document load.
 */
export async function signOutAction(): Promise<{ redirectTo: string }> {
  await destroyCurrentSession();

  // Auth0 needs an absolute `returnTo`, and it has to match the deployment the
  // request actually came from — localhost, a preview, or production — so it is
  // read from the request rather than from a build-time constant.
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${proto}://${host}` : "";

  return { redirectTo: (origin && auth0LogoutUrl(origin)) || "/" };
}
