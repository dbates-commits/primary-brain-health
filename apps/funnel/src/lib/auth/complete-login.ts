/**
 * The shared login logic used by BOTH auth providers being evaluated — Clerk
 * (`/clerk/complete`) and Auth.js (`/authjs`). The only thing that differs
 * between them is how the identity is verified; once we have a verified email,
 * everything downstream is identical and lives here:
 *
 *   1. find (or create) the canonical Neon `users` row, keyed by email, and
 *   2. establish the assessment session cookie.
 *
 * Keeping this provider-agnostic is what makes the two routes an apples-to-
 * apples comparison. Server-only (touches the DB + cookies); call it from a
 * Route Handler or Server Action, then redirect.
 */

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { establishAssessmentSession } from "./session";

export interface ProviderIdentity {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

/**
 * Resolve a verified provider identity to the canonical PBH user id, creating a
 * minimal `users` row on first sign-in, then drop the assessment session
 * cookie. Returns the PBH `users.id`.
 */
export async function completeProviderLogin(
  identity: ProviderIdentity,
): Promise<string> {
  const email = identity.email.trim();

  let [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    // First time we've seen this identity (e.g. a Clerk account with no prior
    // funnel signup). Create a minimal row; email is the join key. firstName is
    // NOT NULL, so fall back to the email's local part when the provider gives
    // us no name.
    const firstName = identity.firstName?.trim() || email.split("@")[0] || "Member";
    const lastName = identity.lastName?.trim() || "";
    [user] = await db
      .insert(users)
      .values({ email, firstName, lastName })
      .returning({ id: users.id });
  }

  await establishAssessmentSession(user.id);
  return user.id;
}
