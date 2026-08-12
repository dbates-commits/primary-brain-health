"use server";

import { redirect } from "next/navigation";
import { destroyCurrentSession } from "@/lib/auth-session";

/**
 * Sign the user out: revoke the database session (deletes the row, so the
 * cookie is dead everywhere immediately) and return to the marketing home page.
 *
 * The session's own timeouts are short, but they are inactivity-based — on a
 * shared or family computer the next person would otherwise arrive signed in.
 */
export async function signOutAction() {
  await destroyCurrentSession();
  redirect("/");
}
