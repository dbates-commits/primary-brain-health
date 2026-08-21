"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

/**
 * Client-side session context for the header's account menu.
 *
 * The header has to know whether someone is signed in, and it is the only thing
 * on the marketing site that does. Reading the session on the server would mean
 * calling `auth()` in the root layout, which reads cookies and so opts every
 * marketing page out of static rendering — a steep price for one nav item.
 * `SessionProvider` fetches `/api/auth/session` from the browser instead, so
 * the pages stay static; the cost is that the header renders its signed-out
 * state for the moment before that request lands.
 *
 * Wraps the header *and* the page below it. The account settings form is the
 * second consumer — it refreshes the session after a save, and the header reads
 * the name that save changed, so the two have to share one cache. Passing the
 * pages through as `children` keeps them server-rendered: a client component
 * renders its `children` slot, it does not pull that subtree into the client.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
