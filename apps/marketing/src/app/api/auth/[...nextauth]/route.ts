import { handlers } from "@/auth";

/**
 * Auth.js request handlers — mounts sign-in, the Auth0 callback, session and
 * sign-out endpoints under /api/auth/*. All auth flows route through here.
 *
 * `POST` used to be wrapped to apply our Postgres sign-in throttle. That
 * throttle existed to bound account enumeration through the magic-link form,
 * whose response distinguished a registered address from an unregistered one.
 * With Auth0 the only provider, no address is ever posted here — the address is
 * typed on Auth0's own screen, so the oracle and its bound both live there now.
 * See the "Auth0" section of `docs/auth.md`.
 */
export const { GET, POST } = handlers;
