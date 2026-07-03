import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ASSESSMENT_UID_COOKIE } from "@/app/assessments/register-and-enroll";
import { finalizeCheckoutSession } from "../actions";

// Needs the Stripe SDK + DB (Node runtime) and must never be cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Return target for Stripe hosted Checkout (`success_url`). Stripe redirects here
 * with `?session_id={CHECKOUT_SESSION_ID}` after payment. We finalize the session
 * server-side (verify → persist → register/enroll — the user id comes off the
 * session, not client state), drop the assessment session cookie, and forward to
 * /assessments. A route handler is used because cookies can only be set from a
 * Server Action or Route Handler, not during a Server Component render.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const origin = req.nextUrl.origin;
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(new URL("/get-started?payment=error", origin));
  }

  const result = await finalizeCheckoutSession(sessionId);
  if (result.status === "error") {
    return NextResponse.redirect(new URL("/get-started?payment=error", origin));
  }

  const response = NextResponse.redirect(new URL("/assessments", origin));
  response.cookies.set(ASSESSMENT_UID_COOKIE, result.userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });
  return response;
}
