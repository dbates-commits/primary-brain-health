"use server";

import { redirect } from "next/navigation";
import { destroyCurrentSession } from "@/lib/auth-session";

/**
 * Sign the user out: revoke the database session (deletes the row, so the
 * cookie is dead everywhere immediately) and return to /login.
 */
export async function signOutAction() {
  await destroyCurrentSession();
  redirect("/login");
}
