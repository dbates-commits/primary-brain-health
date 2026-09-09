/**
 * Which address an Auth0 profile is allowed to sign in as — the pure half of
 * the `signIn` callback's Auth0 branch, split out so it can be tested without
 * standing up NextAuth and a database.
 *
 * The impure half stays in `auth.ts`: whether that address has a PBH account.
 */

/** The subset of an OIDC profile this decision reads. */
export interface Auth0ProfileClaims {
  email?: string | null;
  email_verified?: unknown;
}

/**
 * Returns the address to check against the PBH user list, or `null` to refuse
 * the sign-in outright.
 *
 * **`email_verified` must be exactly `true`.** It is what makes
 * `allowDangerousEmailAccountLinking` safe: linking attaches an Auth0 identity
 * to whichever PBH account holds that email, so an unverified address would let
 * anyone claim any account by typing its email at signup. Auth0 sends the claim
 * as a real boolean, but some connections have historically sent the string
 * `"true"` — an `== true` or a truthiness check would accept `"false"` too, so
 * this is deliberately strict rather than coerced.
 *
 * `profile.email` wins over the adapter's `user.email` because the profile is
 * the claim the verification flag actually describes; falling back to `user`
 * only covers a provider that maps the email elsewhere.
 */
export function auth0SignInAddress(
  profile: Auth0ProfileClaims | null | undefined,
  fallbackEmail?: string | null,
): string | null {
  if (profile?.email_verified !== true) {
    return null;
  }
  const address = profile.email ?? fallbackEmail;
  if (!address || address.trim().length === 0) {
    return null;
  }
  return address;
}
