/**
 * Provision a Clerk account for a paying user after a successful payment, so
 * they can sign in later at /clerk if they need to return. The account is
 * created WITHOUT a password (`skipPasswordRequirement`), so sign-in is
 * passwordless email verification — the Clerk instance must have an email
 * strategy (verification code / link) enabled for this to be usable, and for
 * `skipPasswordRequirement` to be accepted at all.
 *
 * Idempotent and strictly NON-FATAL: a provisioning hiccup (Clerk unreachable,
 * email already has a Clerk user, instance misconfig) must never break the
 * post-payment assessment handoff. We log and move on; the user still gets
 * immediate access via the assessment session cookie, and later sign-in maps
 * back to this same PBH user by email. Server-only (uses CLERK_SECRET_KEY).
 */

import { clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";

export async function provisionClerkUserForPayingUser(
  userId: string,
): Promise<void> {
  // No Clerk secret in this environment → nothing to provision. Skip quietly so
  // envs without Clerk configured don't log noise on every payment.
  if (!process.env.CLERK_SECRET_KEY) {
    return;
  }

  try {
    const [user] = await db
      .select({
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) {
      return;
    }

    const client = await clerkClient();

    // Idempotency: if a Clerk user already owns this email (e.g. they used the
    // /clerk demo before paying, or a retry), don't try to create a duplicate.
    const existing = await client.users.getUserList({
      emailAddress: [user.email],
      limit: 1,
    });
    if (existing.totalCount > 0) {
      return;
    }

    await client.users.createUser({
      externalId: userId, // link the Clerk account back to the canonical PBH id
      emailAddress: [user.email],
      firstName: user.firstName,
      lastName: user.lastName || undefined,
      skipPasswordRequirement: true,
    });
  } catch (err) {
    console.error(
      "provisionClerkUserForPayingUser failed (non-fatal):",
      err,
    );
  }
}
