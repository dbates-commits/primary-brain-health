import { NextResponse } from "next/server";

/**
 * The Tina admin is a static bundle at `/admin/index.html`, and it edits
 * whatever branch `NEXT_PUBLIC_TINA_BRANCH` resolves to — which on every
 * non-production deploy is now `main`, i.e. the content production serves.
 * TinaCloud refuses to index the `staging` branch, so staging reads `main`
 * instead (see `tina/config.ts`); leaving the admin reachable there would hand
 * an editor a staging URL that silently writes live content.
 *
 * Production is the only deployment where the CMS exists. Every other Vercel
 * deployment 404s the admin, which also keeps the bundle (and its clientId) off
 * preview hosts.
 *
 * Local dev is not a deployment and is explicitly exempt: `VERCEL_ENV` is unset
 * there, and `tinacms dev` serves the admin against the repo's own files with no
 * TinaCloud branch involved, so there is nothing to protect.
 */
const isVercelDeployment = Boolean(process.env.VERCEL_ENV);
const isProduction = process.env.VERCEL_ENV === "production";

export function proxy(): NextResponse {
  if (isProduction || !isVercelDeployment) {
    return NextResponse.next();
  }
  return new NextResponse("Not Found", { status: 404 });
}

export const config = {
  matcher: "/admin/:path*",
};
