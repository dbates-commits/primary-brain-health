import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  BOOKING_RESUME_COOKIE,
  BOOKING_RESUME_TTL_SECONDS,
  consumeBookingConfirmation,
  createResumeCookieValue,
} from "@pbh/booking/server";

// Verifies a one-time token and writes a cookie — never cacheable, and it needs
// Node's crypto for the HMAC.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Landing point for the confirmation link emailed at signup.
 *
 * A Route Handler rather than a page: it has no UI of its own. It redeems the
 * token, drops the signed resume cookie, and sends the customer to the home page
 * with a marker the booking flow picks up — the modal reopens at whichever step
 * they had reached.
 *
 * The marker in the URL is deliberately just `resume`/`expired`, carrying no id
 * and no token: the proof rides in the httpOnly cookie, so nothing sensitive
 * ends up in browser history, referrers, or a shared link. Being a static route,
 * this wins over the `[slug]` catch-all.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const home = new URL("/", req.nextUrl.origin);

  const result = await consumeBookingConfirmation(token);

  if (result.status !== "confirmed") {
    // Every failure mode lands on the same place: the modal reopens at the
    // confirmation step and offers a fresh link. Distinguishing "expired" from
    // "already used" in the URL would leak whether a token ever existed.
    home.searchParams.set("booking", "expired");
    home.hash = "booking";
    return NextResponse.redirect(home);
  }

  home.searchParams.set("booking", "resume");
  home.hash = "booking";
  const res = NextResponse.redirect(home);

  res.cookies.set(BOOKING_RESUME_COOKIE, createResumeCookieValue(result.userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: BOOKING_RESUME_TTL_SECONDS,
  });

  return res;
}
