import { NextResponse, type NextRequest } from "next/server";

import { UNLOCK_COOKIE, UNLOCK_PATH, tokensMatch, unlockToken } from "@/lib/internal-unlock";

/**
 * A password on everything under `/internal`.
 *
 * These pages describe the system rather than serve a customer — the email
 * previews, the booking-step modals, the customer-journey map — and they are
 * shared as links with people outside the team. One shared password, entered
 * once, is the right weight for that; the form lives at {@link UNLOCK_PATH}.
 *
 * It is not the only control. `robots.ts` disallows `/internal/`, each page
 * sets its own `noindex`, and the header below repeats it on every response —
 * including on production, where `next.config.ts` deliberately stops adding it.
 *
 * A proxy always runs on the Node runtime, and declaring a `runtime` here is a
 * build error ("Route segment config is not allowed in Proxy file") — hence
 * only a matcher.
 */
export const config = {
  matcher: "/internal/:path*",
};

const NOINDEX = "noindex, nofollow, noarchive";

function withHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Robots-Tag", NOINDEX);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export default async function proxy(request: NextRequest) {
  const expected = process.env.INTERNAL_PREVIEW_PASSWORD;

  if (!expected) {
    // Unset is only ever a local-dev state. On a deployment it means someone
    // shipped without the variable, and an internal page open to the web is a
    // worse outcome than a broken link, so it 404s rather than letting through.
    if (process.env.VERCEL_ENV) {
      return withHeaders(new NextResponse(null, { status: 404 }));
    }
    return withHeaders(NextResponse.next());
  }

  // The form itself cannot sit behind the gate it opens.
  if (request.nextUrl.pathname === UNLOCK_PATH) {
    return withHeaders(NextResponse.next());
  }

  const given = request.cookies.get(UNLOCK_COOKIE)?.value;
  if (given && tokensMatch(given, await unlockToken(expected))) {
    return withHeaders(NextResponse.next());
  }

  const unlock = new URL(UNLOCK_PATH, request.url);
  unlock.searchParams.set("next", request.nextUrl.pathname);
  return withHeaders(NextResponse.redirect(unlock));
}
