import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { redeemHandoffToken } from "@pbh/booking/server";
import { createSessionForUser } from "@/lib/auth-session";

// Mints a session and writes a cookie — never cacheable, and it needs Node's
// crypto for the HMAC.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Post-payment sign-in handoff. The marketing app charges the card but cannot
 * set this app's session cookie (different origin), so it sends the customer
 * here with a short-lived, single-use token bound to their succeeded payment.
 *
 * `redeemHandoffToken` does the verification and claims the single use
 * atomically; a valid signature alone grants nothing without a matching
 * `succeeded` payment that has not already been redeemed. On any failure we fall
 * through to `/login`, where a magic link always works — a paid customer must
 * never hit a dead end.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const assessments = new URL("/assessments", req.nextUrl.origin);
  const login = new URL("/login", req.nextUrl.origin);

  let result;
  try {
    result = await redeemHandoffToken(token);
  } catch (err) {
    console.error("[handoff] redeem failed:", err);
    return NextResponse.redirect(login);
  }

  if (result.status !== "ok") {
    // Deliberately no detail in the URL: which of "expired", "already used" or
    // "no such payment" applied is not the customer's problem to debug, and
    // saying so would confirm whether a payment id exists.
    console.warn(`[handoff] rejected: ${result.reason}`);
    return NextResponse.redirect(login);
  }

  try {
    // Pass the request protocol so the cookie name matches what `auth()` will
    // look for, and set it on this response — a cookie written via
    // `next/headers` does not reliably survive a redirect.
    const cookie = await createSessionForUser(result.userId, {
      protocol: req.nextUrl.protocol,
      method: "post-payment-handoff",
    });
    const res = NextResponse.redirect(assessments);
    res.cookies.set(cookie.name, cookie.value, cookie.options);
    return res;
  } catch (err) {
    // The token is already spent at this point, so the customer cannot retry
    // this link — send them somewhere that still works rather than erroring.
    console.error("[handoff] session mint failed:", err);
    return NextResponse.redirect(login);
  }
}
