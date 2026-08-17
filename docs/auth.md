# Auth

Passwordless magic-link sign-in, Auth.js v5 (NextAuth) with database sessions in
Neon. Implemented in `apps/marketing/src/auth.ts` and `src/lib/auth-*.ts`; the
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
`apps/marketing/src/lib/rate-limit.ts`.

| Limit | Ceiling | Window |
|---|---|---|
| Per IP | **10** attempts | 15 minutes |
| Per address | **5** attempts | 15 minutes |

The per-IP limit is the one that bites an enumeration sweep: it tries a
different address every time, so it never approaches the per-address ceiling.
The per-address limit is a separate concern — it stops one inbox being flooded
with sign-in links from a spread of sources.

Counting happens in Postgres (`auth_rate_limits`), not Redis. There is no Redis
here, and the argument above for keeping sessions in Neon applies equally to a
table of hashes with a fifteen-minute lifespan: one data posture, no
third-party residency to audit. Per-attempt writes are the cost; at this volume
they are noise. Reach for a dedicated store if that stops being true.

Details worth knowing before changing it:

- **Buckets are hashed**, with the same keyed hash as `audit_log.ip_hash`
  (`hashIdentifier`, keyed by `IP_HASH_SECRET`). The raw column would otherwise
  become a list of addresses people typed into a brain-health site, most of
  which have no account and never consented to anything.
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
- **No MFA, no social login, no account-deletion flow.** All Phase 2+, none in
  the current estimate.
