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
 * Scoped to the header rather than the whole tree: nothing else needs it, and a
 * client boundary around `children` in the layout would be a much wider blast
 * radius for no gain.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
