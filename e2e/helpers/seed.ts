import { createHmac, randomUUID } from "node:crypto";
import { expect, type BrowserContext } from "@playwright/test";
import { neon } from "@neondatabase/serverless";

import { BOOKING_COOKIE } from "./booking";

/**
 * Fixtures written straight into the test database, for the specs that need an
 * account in a particular state and do not care how it got there.
 *
 * **This is not a bypass of the verification gate.** Nothing here runs in the
 * app: no route, action or export changes, and no production code path learns a
 * way to skip Auth0. It is a test creating its own row in its own database — the
 * same thing a SQL fixture file would do — so that the authorization spec can
 * assert what it is actually about (which account a booking mutation writes to)
 * without driving an identity provider that emails a code to a human.
 *
 * The specs that *are* about the signup journey stay switched off until there is
 * a way to read that code; see the note in `booking-authz.spec.ts` and pbh-mgr.
 */

function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Seeding needs DATABASE_URL — a dedicated Neon branch, never prod and " +
        "never a Vercel preview URL. See e2e/README.md.",
    );
  }
  return neon(url);
}

export interface SeededUser {
  id: string;
  email: string;
}

/**
 * An account with a proven address and nothing else: no details, no consent, no
 * payment. `resolveBookingResumeState` puts this user on the details step, which
 * is where a customer returning from Auth0 lands.
 */
export async function seedVerifiedUser(): Promise<SeededUser> {
  const email = `e2e+seed-${Date.now()}-${randomUUID().slice(0, 8)}@example.com`;
  const rows = await sql()`
    insert into users (email, first_name, last_name, email_verified)
    values (${email}, 'Ada', 'Lovelace', now())
    returning id
  `;
  return { id: rows[0].id as string, email };
}

/**
 * Mint the booking cookie for a user, the way the server does at signup.
 *
 * The format and the HMAC are spelled out here rather than imported from
 * `@pbh/booking/server`: that module is `server-only` and cannot be loaded
 * outside a React Server Component, and an authorization test that recomputed
 * the signature with the same function it is testing would prove less. If the
 * wire format changes, this breaks — which is the point.
 */
export function mintBookingCookieValue(userId: string): string {
  const secret = process.env.BOOKING_RESUME_SECRET;
  if (!secret) {
    throw new Error("Seeding needs BOOKING_RESUME_SECRET — the same value the server runs with.");
  }
  const payload = `${userId}.${Date.now() + 60 * 60 * 1000}`;
  const hmac = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${hmac}`;
}

/** Put a genuine booking cookie for `userId` in the browser context. */
export async function addBookingCookie(
  context: BrowserContext,
  userId: string,
  baseURL: string,
): Promise<void> {
  await context.addCookies([
    {
      name: BOOKING_COOKIE,
      value: mintBookingCookieValue(userId),
      url: baseURL,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  const [cookie] = (await context.cookies()).filter((c) => c.name === BOOKING_COOKIE);
  expect(cookie, "the seeded booking cookie should be in the jar").toBeTruthy();
}
