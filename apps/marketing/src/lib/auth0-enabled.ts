import "server-only";

/**
 * Whether the Auth0 sign-in provider is configured, and so whether it is
 * registered in `auth.ts` and offered in the UI.
 *
 * Its own module rather than a const in `auth.ts` because the root layout needs
 * it to decide whether the header offers an Auth0 button, and importing
 * `@/auth` there would pull NextAuth and the Drizzle adapter into the module
 * graph of every page for the sake of one boolean.
 *
 * `server-only`, and the value is passed down as a prop — which is what
 * `layout.tsx` does. These are not `NEXT_PUBLIC_*`, so a client component
 * importing this would not fail: it would quietly read `undefined` and render
 * as though Auth0 were unconfigured.
 *
 * **Read at module scope, so a statically prerendered page freezes it at build
 * time.** The layout is one, which is why `AUTH0_*` is listed in the build
 * task's `env` in `turbo.json` — a cached build restored across an env change
 * would otherwise serve a header with no Login control while `/api/auth/*`,
 * evaluated per request, works perfectly. Change any of these on a deployment
 * and rebuild; a redeploy of the same build is not enough.
 */
export const AUTH0_ENABLED = Boolean(
  process.env.AUTH0_ISSUER &&
    process.env.AUTH0_CLIENT_ID &&
    process.env.AUTH0_CLIENT_SECRET,
);

/**
 * `AUTH0_ISSUER` with a scheme, which is what every consumer of it needs.
 *
 * The Auth0 dashboard displays the tenant Domain bare (`acme.us.auth0.com`),
 * and that is what gets pasted in. Left as-is it fails deep: OIDC discovery
 * throws on every request in `auth.ts`, and `new URL()` throws in
 * `auth0LogoutUrl` — after the session row is already deleted.
 */
export const AUTH0_ISSUER_URL = process.env.AUTH0_ISSUER
  ? /^https?:\/\//i.test(process.env.AUTH0_ISSUER)
    ? process.env.AUTH0_ISSUER
    : `https://${process.env.AUTH0_ISSUER}`
  : undefined;
