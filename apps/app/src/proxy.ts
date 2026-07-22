import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Optimistic auth gate (Next.js `proxy` convention, formerly `middleware`).
 * Redirects anonymous visitors away from protected routes by checking only for
 * the *presence* of the session cookie — a fast, edge-safe check that avoids a
 * DB round-trip (and any adapter-in-edge concerns) here.
 *
 * This is deliberately not the authoritative check: a present-but-invalid
 * cookie still reaches the route, where `auth()` validates the session against
 * the database and redirects if it's bad. This just spares anonymous users a
 * wasted render.
 */
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

function hasSessionCookie(req: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => req.cookies.has(name));
}

export function proxy(req: NextRequest) {
  if (hasSessionCookie(req)) {
    return NextResponse.next();
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/assessments/:path*"],
};
