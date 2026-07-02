/**
 * The one place that mints the assessment "session". Both auth providers
 * (Clerk, Auth.js) and the payment step converge here so there is a single,
 * shared session mechanism — the same short-lived cookie the `/assessments`
 * page and report route read. Server-only (writes an httpOnly cookie).
 *
 * NOTE: the cookie value is an unsigned user id — acceptable for this
 * evaluation scaffold. Swap this for the winning provider's signed session
 * once the auth provider is chosen; every caller goes through here, so it's a
 * one-file change.
 */

import { cookies } from "next/headers";
import { ASSESSMENT_UID_COOKIE } from "@/app/assessments/register-and-enroll";

/** Short-lived cookie identifying whose assessments/reports to serve. */
export const ASSESSMENT_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60,
};

/** Drop the assessment session cookie for `userId`. */
export async function establishAssessmentSession(userId: string): Promise<void> {
  (await cookies()).set(ASSESSMENT_UID_COOKIE, userId, ASSESSMENT_COOKIE_OPTS);
}
