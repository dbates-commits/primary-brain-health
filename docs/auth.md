# Auth

Passwordless magic-link sign-in, Auth.js v5 (NextAuth) with database sessions in
Neon, plus an optional second provider — see [Auth0](#auth0), which
authenticates but does not own the session. Implemented in `apps/marketing/src/auth.ts` and `src/lib/auth-*.ts`; the
routes are `/login`, `/login/check-email` and `/api/auth/[...nextauth]`.

Two entry points, one action. The full-page form at `/login` and the header
popover (`components/layout/LoginMenu`) both call `sendLoginLink` in
`src/app/login/actions.ts`, so they can never give different answers for the
same address. `/login` navigates to the check-your-email page on success; the
popover reports success in place.

Sign-in is the *alternative* entry, not the main one: a customer who has just
paid gets a session minted directly by the checkout action (see
[`booking-flow.md`](./booking-flow.md)). The magic link is how someone comes back
later, once the 2h booking cookie has expired.

**Login-only.** Accounts are created by the booking flow, never by a magic link.
That is enforced twice: the `signIn` callback rejects an address with no account
before a `verification_tokens` row is minted, and `adapter.createUser` throws.
`sendMagicLinkEmail` also refuses to email an unknown address.

**Sign-in discloses whether an address has an account.** An unregistered address
gets "Not an active user. Try checking spelling or another email."; a registered
one gets the sent state. This is a deliberate product decision (Aug 2026), taken
from the login designs — Figma `1988:10890` draws the error, and the trade was
put to the team before it was built. It reverses the earlier behaviour, where
the caller swallowed the `AccessDenied` rejection so the two responses were
identical and nothing revealed who was registered.

What that costs, so it is on the record: the sign-in form is an account-
enumeration oracle. Anyone can test an address against the customer list, and
for a brain-health service the mere fact of being a customer is sensitive. What
keeps that bounded is the throttle below — the disclosure is per-attempt, so
limiting attempts limits the disclosure.

## Sign-in throttling

`sendLoginLink` is rate-limited per IP and per address, in
`apps/marketing/src/lib/rate-limit.ts`. So is Auth.js's own
`POST /api/auth/signin/:provider`, in the route handler: it reaches the same
`signIn` callback and discloses the same thing by which page it redirects to, so
guarding only the server action would have guarded only the door our UI uses.

| Limit | Ceiling | Window |
|---|---|---|
| Per IP | **5** attempts | 15 minutes |
| Per address | **5** attempts | 15 minutes |

The per-IP limit is the one that bites an enumeration sweep: it tries a
different address every time, so it never approaches the per-address ceiling.
The per-address limit is a separate concern — it stops one inbox being flooded
with sign-in links from a spread of sources, which the per-IP limit does not
see.

The per-IP number started at 10 and was cut to 5 (Aug 2026): 10 in a
quarter-hour is ~960 attempts a day from one address, a loose bound on the
thing the throttle exists to stop. The floor on lowering it further is shared
IPs — an office or household behind one NAT can genuinely have two or three
people signing in at once, and they all count against one bucket.

Counting happens in Postgres (`auth_rate_limits`), not Redis. There is no Redis
here, and the argument above for keeping sessions in Neon applies equally to a
table of hashes with a fifteen-minute lifespan: one data posture, no
third-party residency to audit. Per-attempt writes are the cost; at this volume
they are noise. Reach for a dedicated store if that stops being true.

Details worth knowing before changing it:

- **Buckets are hashed**, with the same keyed hash as `audit_log.ip_hash`
  (`hashIdentifier`, keyed by `IP_HASH_SECRET`). The raw column would otherwise
  become a list of addresses people typed into a brain-health site, most of
  which have no account and never consented to anything. **`IP_HASH_SECRET` has
  to be set in every scope.** Without it `hashIdentifier` falls back to plain
  SHA-256, and an email address has a small enough keyspace that a dictionary
  walks it — the bucket becomes that list again, just encoded. Any deployed boot
  without the secret throws (`assertIdentifierHashSecret`, called from
  `instrumentation.ts`); local only logs, loudly. Each scope has its own key —
  production, preview and development do not share one, so a digest from one
  environment cannot be lined up against another.
- **A refused attempt writes nothing.** The count happens before the insert, and
  a refusal returns without recording. The other ordering is the tempting one —
  it keeps the window rolling forward under a hammering — but it lets one
  already-throttled IP keep filling a victim's *email* bucket for free, and so
  lock that address out of sign-in permanently. The IP ceiling is also checked
  first and short-circuits, so an IP over its own limit never touches the email
  bucket at all.
- **It fails open.** If the database is unreachable the attempt is allowed —
  sign-in needs the database anyway, so a failure there was going to fail the
  request regardless, and failing closed would turn a database blip into a
  total sign-in outage.
- **The refusal says nothing.** Not which limit was hit, not how long is left.
  "You've tried this address five times" hands back the signal the throttle
  exists to withhold.
- **A refusal is audited** as `signin_rate_limited`, with the hashed IP and
  which limit tripped. The `auth_rate_limits` rows themselves are disposable
  and swept on each check; the audit row is the record.
- **A malformed address costs nothing** — it is rejected before the throttle,
  because it never reaches the oracle.
- **Every attempt counts, successes included.** A magic link that actually
  sends costs a slot exactly like a probe does; the format check is free, and so
  is an attempt that was refused.
  Signing out is free too, but the next sign-in needs a new link, so repeated
  login/logout rounds burn the window fast.

Which makes testing painful, so both ceilings can be raised outside production
via `SIGNIN_MAX_PER_IP` and `SIGNIN_MAX_PER_EMAIL`. **The overrides are ignored
when `VERCEL_ENV=production`** — these bound account enumeration, and a limit
that can be relaxed with a variable will eventually be relaxed by accident.

Two things to know when a limit fires unexpectedly:

- **Locally there is no `x-forwarded-for`**, so every request falls into a
  single `ip:hash("unknown")` bucket.
- **A shared egress IP is one bucket.** Everyone testing a preview from the
  same office counts against each other.

## Auth0

Since Sep 2026 there is a second way in: **Continue with Auth0**, alongside the
magic link. It exists because Linus decided the **Linus Engagement App** is the
entry point for both PBH experiences, and that app authenticates with Auth0. If
PBH signs people in against the same Auth0 tenant, one Universal Login gets
someone into both products — SSO — instead of two unrelated logins for one
customer.

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
gates the magic link: an address with no PBH account is refused, so accounts are
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
`assertConfig` on every request — it would take the magic link down with it.
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

### Before Auth0 becomes the only door

The intent is for Auth0 to replace the magic link, but that is not this change,
and it is not a deletion. Two things in this document stop applying the moment
Universal Login becomes the door:

- The **sign-in throttle** above sits in front of *our* server action and *our*
  `/api/auth/signin/*` route. It does not sit in front of Auth0. The
  account-enumeration bound it provides has to be re-derived from Auth0's own
  attack protection before the magic link goes.
- The **automatic-logoff controls** survive only because the session is still
  ours. They would need re-stating against Auth0's session model if that ever
  changes.

Neither is a refactor decision. Both were signed off by compliance; re-opening
them means going back to compliance.

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

- **No rate limiting on `requestMagicLink`** — an unauthenticated action that
  emails any registered address. Tracked on `pbh-gzv`.
- **No MFA and no account-deletion flow.** Phase 2+, not in the current
  estimate. Social login is no longer on this list — whatever connections the
  Auth0 tenant enables come through the provider above.
