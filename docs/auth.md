# Auth

Auth.js v5 (NextAuth) with database sessions in Neon, and **Auth0 as the only
sign-in provider**. Implemented in `apps/marketing/src/auth.ts` and
`src/lib/auth-*.ts`; the routes are `/login` and `/api/auth/[...nextauth]`.

Auth0 authenticates; Auth.js owns the session. That split is the load-bearing
decision here and the [Auth0](#auth0) section explains why.

Sign-in is the *alternative* entry, not the main one: a customer who has just
paid gets a session minted directly by the checkout action (see
[`booking-flow.md`](./booking-flow.md)). Signing in is how someone comes back
later, once the 2h booking cookie has expired.

**Login-only.** Accounts are created by the booking flow, never by signing in.
That is enforced twice: the `signIn` callback rejects an address with no
account, and `adapter.createUser` throws.

## What the magic link took with it

Passwordless magic-link sign-in was removed in Sep 2026, once Auth0 had also
taken over verifying the address at signup. Gone with it: the Resend email
provider, `/login/check-email`, `lib/auth-email.ts`, the `MagicLinkEmail`
template, the login server actions, and the header's login popover and mobile
modal (`LoginMenu`, `LoginPanel`, `MobileLoginModal` — the header item is now a
plain button straight out to Auth0).

**And the sign-in throttle, which matters more than the rest.** `lib/rate-limit.ts`
and the wrapper on `POST /api/auth/signin/*` are deleted. They existed for one
reason: our sign-in form told an anonymous caller whether an address had an
account — a deliberate product decision (Figma `1988:10890`) that made the form
an account-enumeration oracle, and for a brain-health service the mere fact of
being a customer is sensitive. Five attempts per IP and five per address, per
15 minutes, in Postgres (`auth_rate_limits`), was the bound on that.

**That oracle has moved, not closed.** No address is typed on our site any more;
it is typed on Auth0's screen, and Auth0's passwordless connection has the same
property — more so with "Disable Sign Ups" on, which Auth0's own docs flag as a
user-enumeration exposure. So the bound now has to come from **Auth0's attack
protection** (Suspicious IP Throttling and Brute-force Protection), which is
tenant configuration, not code in this repo.

> **Open, and compliance-relevant.** The original throttle was part of what was
> signed off. Nobody has yet confirmed the equivalent is enabled on the tenant —
> and which tenant it will even be is still open with Linus. Confirm this before
> production. The `auth_rate_limits` table is left in the database, unused;
> dropping it is a destructive migration and a separate decision.

## Auth0

The only way in. Linus decided the **Linus Engagement App** is the entry point
for both PBH experiences, and that app authenticates with Auth0; signing PBH
customers in against the same Auth0 tenant means one Universal Login gets
someone into both products — SSO — instead of two unrelated logins for one
person.

**Auth0 authenticates. It does not own the session.** `session.strategy` stays
`"database"`, and this is the load-bearing decision, not a detail:

- `finalizeCheckoutSession` signs a customer in the moment their payment
  verifies, by calling `createSessionForUser` (`lib/auth-session.ts`). You
  cannot fabricate an Auth0 session server-side, so an Auth0-owned session would
  mean bouncing a paying customer out to Universal Login mid-checkout.
- The automatic-logoff controls below — 15-minute idle, 8-hour absolute — are
  enforced against `sessions.created_at` by our own `getSessionAndUser`
  override. Auth0's session settings do not express the absolute cap the same
  way, and loosening a compliance-signed-off control as a side effect of adding
  a provider is not a trade anyone agreed to.

So Auth0 is the authentication event; the `sessions` row, the cookie and the
timeouts are all still ours. SSO into the Engagement App still works, because
Universal Login sets Auth0's *own* SSO cookie on the tenant domain on the way
through.

**Auth0 also verifies the address at signup.** Since Sep 2026 the booking flow
sends a new customer to Auth0 straight after the name/email form, instead of
emailing our own one-time confirmation link. Entering Auth0's code proves the
address, so the `signIn` event calls `markEmailVerified` — which stamps
`users.email_verified`, audits it, and sends the welcome email once. That is
what `resolveBookingResumeState` reads to move them past the confirm step. The
reason to do it there rather than at checkout: the customer then already holds
an Auth0 session by the time `/welcome` offers the Engagement App link. See
[`booking-flow.md`](./booking-flow.md).

**Still login-only.** The `signIn` callback gates the Auth0 path exactly as it
always has: an address with no PBH account is refused, so accounts are
still born only in the booking flow. Two details make that safe:

- The callback runs *before* Auth.js hands the profile to the adapter, so a
  rejection never reaches `createUser` (which throws) or `linkAccount`.
- `allowDangerousEmailAccountLinking` is on for Auth0, which is what attaches an
  Auth0 identity to the `users` row the booking flow already created rather than
  minting a second user for the same person. It is only sound because the
  callback refuses any profile without `email_verified` — a tenant that let
  someone sign up with an unverified address could otherwise claim any PBH
  account by typing its email.

**Configuration is tenant-agnostic on purpose.** `AUTH0_ISSUER`,
`AUTH0_CLIENT_ID` and `AUTH0_CLIENT_SECRET`; leave all three unset and the
provider is not registered, the button does not render, and nothing about
sign-in changes. Registered conditionally rather than with empty-string
fallbacks because an OAuth provider missing its issuer fails Auth.js's
`assertConfig` on every request. With `AUTH0_*` unset there is now no way to
sign in at all, and no way to finish a signup — which is the honest outcome,
since there is no second provider left.
Note these are **not** the `LINUS_*` variables, which are machine-to-machine
credentials for the Linus Public API that happens to sit behind Auth0 too.

`AUTH0_ENABLED` lives in `lib/auth0-enabled.ts` rather than `auth.ts` so the
root layout can read it without pulling NextAuth into every page's module graph;
it is drilled to the header's sign-in panel as a prop, because it is a
server-side check and the panel is a client component.

### What is not decided

- **Which tenant** holds PBH's users in production — Linus's (`prod-linus-us` /
  `stgint-linus-us`) or a PBH-owned one. If theirs, Linus must provision our
  application and callback URLs; if ours, they must configure federation between
  the two tenants or there is no SSO at all. Nothing in the code assumes an
  answer.
- **What the Engagement App expects** on arrival — a plain URL once the user has
  an Auth0 session, or a specific route. That is what would turn the `/welcome`
  CTA back into a real hand-off; today it is still a `#`.
- **A BAA.** Putting PBH customer identity in Auth0 needs one, and it is an
  Enterprise-tier item — the same objection that ruled out Clerk below. If the
  tenant is Linus's, their BAA may cover it; that needs confirming in writing.

### What survived the magic link's removal, and why

- The **automatic-logoff controls** below. They survive only because the session
  is still ours — see the split at the top of this section. They would need
  re-stating against Auth0's session model if that ever changed.
- The **login-only rule**. Auth0 authenticates; it still cannot create a PBH
  account.

What did *not* survive is the account-enumeration throttle. That is written up
under [What the magic link took with it](#what-the-magic-link-took-with-it), and
it is the one item here that needs an answer from Auth0's side before
production.

## Why Auth.js and not Clerk

Clerk is the obvious easy mode, and its BAA is Enterprise-only:

| Clerk tier | Cost | HIPAA / BAA |
|---|---|---|
| Free | $0 | No BAA |
| Pro | $25/mo + per-MAU | No BAA |
| **Enterprise** | Custom (typically $2k+/mo) | **BAA available** |

Under the conservative HIPAA posture ([`database.md`](./database.md)) our user
data is HIPAA-adjacent, so using Clerk would mean either paying ~$24k/yr for a
feature we don't need, or keeping the HIPAA-adjacent data out of Clerk — which
defeats the point of using it. At a $149 unit price that is wildly
disproportionate.

Auth.js instead: sessions live in the same Neon database as `users`, `consents`,
`payments` and `audit_log`, so there is one data posture and no third-party
residency to audit. No per-user cost, first-class Drizzle adapter, and adding
"Sign in with Google" later is a provider config rather than a re-architecture.

**Passwordless, decided under PBH-119** (compliance thread, Stefanie): no stored
passwords, no reset flow, email possession is the factor. `users.password_hash`
survives as a deprecated column only.

## HIPAA automatic-logoff controls

HIPAA prescribes no specific session-timeout duration. It requires an automatic
logoff control proportionate to the organization's risk assessment
(§164.312(a)(2)(iii), addressable). These durations were set by the compliance
review (Stefanie Kamps, Jul 2026; PBH-120), when the authenticated area reached
the Linus report.

| Control | Value | Enforced by |
|---|---|---|
| Inactivity timeout | **15 minutes** | Auth.js `session.maxAge` with `updateAge: 0` |
| Absolute session cap | **8 hours** | our `getSessionAndUser` override — Auth.js has no built-in |
| Sign-in link | **15 minutes**, single-use | provider `maxAge`; Auth.js deletes the token on redeem |

- **Scope is the whole authenticated area**, with no page-level carve-out.
- **Inactivity, not lifetime.** Auth.js slides the deadline forward on activity;
  `updateAge: 0` makes it slide on every request, so an active session is never
  cut off mid-use. The default (24h) would only refresh the deadline once a day.
- **The absolute cap** ends a session 8 hours after it was minted however
  continuously active it has been. It is checked against `sessions.created_at`,
  which exists for exactly this reason — `expires` cannot tell you a session's
  true age once it has slid.

The values live in one place, `apps/marketing/src/auth.ts`
(`IDLE_SESSION_MAX_SECONDS`, `ABSOLUTE_SESSION_MAX_SECONDS`,
`MAGIC_LINK_TTL_SECONDS`); this doc records the requirement they satisfy.

> Since `apps/app` was retired the only thing behind a session is `/welcome`,
> which renders an external link — the report is no longer reachable from here,
> so these are stricter than the current risk warrants. Left unchanged
> deliberately: loosening a compliance-signed-off control is not a refactor side
> effect. Tracked on `pbh-2qn`.

**Considered and not adopted — step-up re-authentication.** The compliance thread
also floated re-authenticating before reopening or downloading a report. Dropped
from scope; the idle and absolute timeouts are the control set we committed to.
Revisit only if compliance asks again.

## Session cookie

Database sessions, not JWT: revocable, auditable, and they support
sign-out-everywhere. The cookie is `httpOnly`, `secure`, `sameSite=lax`, and
**host-only** — no `Domain` attribute, so it does not spread across subdomains.

One trap worth knowing: Auth.js derives the `__Secure-` cookie-name prefix from
the **request protocol**, not `NODE_ENV`. `sessionCookieName()` mirrors that. Get
it wrong and the session is silently never found, because one half writes
`__Secure-authjs.session-token` while the other reads the unprefixed name.

## Known gaps

- **The enumeration bound is unconfirmed.** Our throttle is gone with the magic
  link; Auth0's attack protection has to take its place, and nobody has verified
  it is on. See the section above — this is the one open compliance item.
- **No MFA and no account-deletion flow.** Phase 2+, not in the current
  estimate. Social login is no longer on this list — whatever connections the
  Auth0 tenant enables come through the provider above, and MFA is now an Auth0
  setting rather than something to build.
