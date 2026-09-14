"use server";

import { siteBaseUrl } from "@pbh/emails";
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

  // Auth0 needs an absolute `returnTo`, and it must be one of the tenant's
  // Allowed Logout URLs. `siteBaseUrl()` is that list's one entry per
  // environment — the same origin Stripe returns to and every email links to.
  //
  // Not the request's `Host`: on a preview that is a new hostname per build,
  // which cannot be in the allowlist, so Auth0 would refuse and strand the
  // customer on its error page with their session already destroyed. It is also
  // attacker-controlled, and `x-forwarded-proto` is wrong behind two proxies.
  return { redirectTo: auth0LogoutUrl(siteBaseUrl()) || "/" };
}
