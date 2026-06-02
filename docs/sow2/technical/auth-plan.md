# Auth Plan

Decision on the auth provider for the funnel app (`apps/funnel`). Locked-in pending PBH counsel's HIPAA posture decision (see `database-plan.md`).

## Recommendation: **Auth.js v5 (NextAuth) with credentials provider, sessions in Neon**

Self-hosted, no per-user cost, inherits Neon's HIPAA posture cleanly. The funnel doesn't need Clerk's drop-in component library because the signup flow is heavily customized for the wellness consent + payment funnel anyway.

## Why not Clerk

Clerk is the obvious "easy mode" - beautiful drop-in components, social login built in, MFA out of the box, and developer experience that's hard to beat. The problem is HIPAA.

| Clerk tier | Cost | HIPAA / BAA |
| :---- | :---- | :---- |
| Free | $0 | No BAA |
| Pro | $25/mo + per-MAU | No BAA |
| **Enterprise** | **Custom (typically $2k+/mo)** | **BAA available** |

If we take the conservative HIPAA-from-launch posture (see `database-plan.md`), the funnel's user data is HIPAA-adjacent. That means **either**:

- Pay Clerk Enterprise (~$24k/yr+ for a feature we don't need), or
- Don't pass HIPAA-adjacent data through Clerk (which defeats the point of using Clerk for auth)

For an early-stage product targeting a $149 unit price, Clerk Enterprise is a wildly disproportionate cost.

## Why not custom JWT

Custom auth means:
- Write password hashing (argon2), session creation, session refresh, CSRF protection, secure cookie config, account recovery
- Maintain it (security patches, attack surface)
- Pass HIPAA-relevant audit logging review
- Spend ~25 pts of engineering on something that's a solved problem

Custom auth is only justified when your auth requirements are genuinely unusual. Ours aren't - email + password, sessions, eventual social login. Auth.js handles all of this.

## Why Auth.js v5 fits

**Built on Neon** - sessions and accounts table live in Neon Postgres alongside `users`, `consents`, `payments`, `audit_log`. Inherits Neon's BAA. One database posture for the whole funnel. No third-party data residency to audit.

**No per-user cost** - open source. As PBH scales from 100 to 10,000 to 100,000 users, auth costs nothing extra.

**Adapter ecosystem** - Drizzle adapter is first-class. Schema migrations integrate with existing Drizzle workflow.

**Future-flexible** - adding "Sign in with Google/Apple" is one provider config + a few UI changes. Not a re-architecture.

**Composable** - we build the sign-up form in our own design system (which we need to do anyway because of the wellness-consent + payment flow). Auth.js handles the auth logic; we handle the UI.

## Schema additions

Auth.js + Drizzle adapter adds these tables alongside the existing `users` table:

```sql
-- account: OAuth provider linkage (empty for credentials-only at launch)
create table account (
  user_id uuid not null references users(id) on delete cascade,
  type text not null,
  provider text not null,
  provider_account_id text not null,
  refresh_token text,
  access_token text,
  expires_at int,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  primary key (provider, provider_account_id)
);

-- session: active sessions
create table session (
  session_token text primary key,
  user_id uuid not null references users(id) on delete cascade,
  expires timestamptz not null
);

-- verification_token: email verification, password reset
create table verification_token (
  identifier text not null,
  token text not null,
  expires timestamptz not null,
  primary key (identifier, token)
);
```

The existing `users` table from `database-plan.md` keeps its app-specific columns (name, DOB, ZIP, state, etc.) - Auth.js just needs `id`, `email`, optionally `emailVerified`. Drizzle adapter handles the schema integration.

## Password security

- **Hashing**: argon2id (winner of the Password Hashing Competition, current best-practice). Bcrypt is acceptable fallback if argon2 adds Edge runtime complications.
- **Strength requirements**: minimum 12 characters, no other arbitrary rules. We rely on length + hashing rather than character-class theater.
- **Breach checking**: optional HIBP integration - flag passwords that appear in known breaches at registration. Recommended but not blocking.

## Session strategy

- Database-backed sessions (not JWT). Easier to revoke, easier to audit, supports immediate logout-everywhere on password change.
- Cookie scoped to `.primarybrainhealth.com` (apex domain) so it spans `primarybrainhealth.com` and `app.primarybrainhealth.com` cleanly.
- `httpOnly`, `secure`, `sameSite=lax`.
- 30-day sliding expiration; refresh on activity.

## Email verification

The RFP doesn't require email verification before payment, but it should happen at some point:

- **Option A - verify before payment**: blocks signups with throwaway emails, but adds friction to the funnel
- **Option B - verify after payment**: payment is the real qualification signal; email verification can be deferred

Recommend Option B - payment is the trust action, email verification is a post-payment housekeeping step that doesn't block conversion. Discovery decision.

## Forgot password flow

- `/forgot-password` form → user enters email
- Token generated, stored in `verification_token`, emailed via Resend
- Token TTL 1 hour
- Clicking link → `/reset-password?token=...` form → new password
- Token consumed on use; old sessions invalidated

## Phase-2 / Phase-3 additions (not in Phase 1)

- **Social login** (Google, Apple) - adding to Auth.js is one provider config + UI changes (~3 pts)
- **MFA via TOTP** - Auth.js has built-in support (~5 pts)
- **Account deletion / data export** - HIPAA + privacy hygiene (~5 pts)
- **Session-management UI** - "active devices" view for users (~3 pts)

These can be in scope or out of scope for Phase 2/3 depending on PBH priorities. Not in current estimate.

## Estimate impact

The previous "Auth setup + basic config" task in `estimate.md` (8 pts) covers Auth.js setup. Refined breakdown:

| Task | Pts |
| :---- | ---: |
| Install + configure Auth.js v5 with Drizzle adapter | 2 |
| Email + password signup + signin flows | 3 |
| Session middleware + protected routes | 1 |
| Forgot password flow (Resend integration) | 3 |
| Email verification flow | 2 |
| **Total** | **11 pts** |

Was 8 pts in the original. **+3 pts net** (~4 hrs at 1.4x).

If PBH later wants Clerk Enterprise instead, it's roughly a wash on engineering pts (Clerk's setup is faster, but the Neon-sync webhook adds work) - the real difference is the recurring Clerk Enterprise cost.

## Open decisions

- **Email verification timing** (before or after payment) - Option B recommended; confirm in discovery
- **MFA** - required at launch or deferred? Likely deferred. Discovery decision.
- **Password reset email sender domain** - using `noreply@primarybrainhealth.com` or `accounts@primarybrainhealth.com`? Resend setup detail.
- **Account-deletion flow** - required for GDPR if any EU traffic; required for state-level privacy laws (CA, VA, CO). Likely Phase 2 add.
