"use server";

import { destroyCurrentSession } from "@/lib/auth-session";

/**
 * Sign the user out: revoke the database session, deleting the row so the
 * cookie is dead everywhere immediately.
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
export async function signOutAction() {
  await destroyCurrentSession();
}
