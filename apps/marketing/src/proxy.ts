import { NextResponse } from "next/server";

/**
 * The Tina admin is a static bundle at `/admin/index.html`, and it edits
 * whatever branch `NEXT_PUBLIC_TINA_BRANCH` resolves to — which on every
 * non-production deploy is now `main`, i.e. the content production serves.
 * TinaCloud refuses to index the `staging` branch, so staging reads `main`
 * instead (see `tina/config.ts`); leaving the admin reachable there would hand
 * an editor a staging URL that silently writes live content.
 *
 * Production is the only deployment where the CMS exists. Everywhere else the
 * admin 404s, which also keeps the bundle (and its clientId) off preview hosts.
 */
const isProduction = process.env.VERCEL_ENV === "production";

export function proxy(): NextResponse {
  if (isProduction) {
    return NextResponse.next();
  }
  return new NextResponse("Not Found", { status: 404 });
}

export const config = {
  matcher: "/admin/:path*",
};
