/**
 * Whether the Auth0 sign-in provider is configured, and so whether it is
 * registered in `auth.ts` and offered in the UI.
 *
 * Its own module rather than a const in `auth.ts` because the root layout needs
 * it to decide whether the header offers an Auth0 button, and importing
 * `@/auth` there would pull NextAuth and the Drizzle adapter into the module
 * graph of every page for the sake of one boolean.
 *
 * Server-only by construction: these are not `NEXT_PUBLIC_*`, so a client
 * component reading them would see `undefined`. Pass the value down as a prop —
 * which is what `layout.tsx` does — rather than importing this into one.
 */
export const AUTH0_ENABLED = Boolean(
  process.env.AUTH0_ISSUER &&
    process.env.AUTH0_CLIENT_ID &&
    process.env.AUTH0_CLIENT_SECRET,
);
