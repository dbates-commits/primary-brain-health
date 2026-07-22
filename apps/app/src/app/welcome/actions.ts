"use server";

import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, users } from "@pbh/db";
import { auth } from "@/auth";

/**
 * Mark the "Choose How to Start" screen as seen for the current user, then send
 * them on to their assessments. Stamping `welcomeSeenAt` is what makes the
 * screen first-login-only: the /welcome guard bounces to /assessments once it is
 * set. Auth is the Auth.js session (minted by a magic-link sign-in) — no session
 * means no user, so we bounce to /login rather than mutate a guessed row.
 */
export async function markWelcomeSeen(): Promise<void> {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) {
    redirect("/login");
  }

  await db
    .update(users)
    .set({ welcomeSeenAt: sql`now()` })
    .where(eq(users.id, uid))
    .returning({ id: users.id });

  redirect("/assessments");
}
