# Database Plan

Database choice for the funnel app (`apps/app`). Stripe handles payment data; this database holds everything else.

## Decision: Neon (Postgres) on Scale tier, with BAA

Locked in pending PBH counsel sign-off on the conservative HIPAA posture. See "Open decisions" at the bottom.

## What lives in the database

The funnel app stores:

| Table | Purpose | Sensitivity |
| :---- | :---- | :---- |
| `users` | Account identity: name, email, hashed password, DOB, ZIP, state of residence | PII; conservatively HIPAA-adjacent |
| `consents` | Versioned wellness consent + HIPAA NPP acknowledgments. Stored with version number, timestamp, IP hash | PII; HIPAA-adjacent (consent to receive a health-related service) |
| `payments` | Internal payment record mirror of Stripe events: stripe_payment_intent_id, amount, status, HSA/FSA flag, last-4 | PII; financial |
| `audit_log` | Append-only log of significant events: signup, consent, payment, handoff token issued | Mixed; supports SAQ-A + HIPAA audit-trail requirements |

**Not in this database**:
- Card numbers / CVV / full PAN - never; lives only at Stripe
- Assessment responses / clinical data - owned by the Linus Remote Assessments, not this database
- BHN consultation notes, EMR data - Linus Remote Assessments + Athena
- Marketing site content - TinaCMS, separate codebase (`apps/marketing`)

## Why Neon

| Requirement | How Neon meets it |
| :---- | :---- |
| HIPAA-eligible | BAA available on **Scale plan or higher** (Neon expanded BAA availability to Scale tier - previously Business-only) |
| Postgres | Native (Neon = serverless Postgres) |
| Encryption at rest | AES-256 default |
| Encryption in transit | TLS 1.2+ enforced |
| Audit logging | Built-in; configurable retention |
| Access controls | IAM, IP allowlisting, project-level isolation |
| Backups / PITR | Built-in point-in-time recovery |
| SOC 2 | Type 2 certified |
| Branching for dev / staging | First-class - instant database branches off production |
| Vercel integration | Native, auto-wires DATABASE_URL env vars per environment |
| Pricing scaling | Predictable; doesn't surprise at scale |

The branching feature deserves specific call-out: every preview deployment in Vercel *can* get its own database branch automatically, which is the basis for the environment separation described under [Environments](#environments) below.

> **As-built, corrected 2026-07-28 (pbh-9yb.3).** This paragraph previously claimed PR previews had isolated data and that "we never test against production data". That was the design intent, never the deployed reality: from launch until 2026-07-28 the Vercel **Preview** scope carried the *production* `DATABASE_URL`, so every PR preview read and wrote live rows — and, since Preview points at the Linus sandbox, wrote sandbox participant ids onto production users. Read [Environments](#environments) for what is actually wired today; do not cite this section in a compliance attestation without it.

## HIPAA tier reasoning

Two readings of the funnel data:

**Conservative reading (recommended)**: Funnel data is HIPAA-covered. Being a user of Primary Brain Health implies a health interest; consents reference HIPAA NPP; the funnel is the entry door to a clinical experience. Auditors and counsel will lean this way.

**Pragmatic reading**: Funnel is pre-clinical, PII-only. HIPAA actually attaches once clinical data is collected (in the Linus Remote Assessments). Most healthcare DTC funnels operate this way.

**Decision**: conservative reading. Reasons:

1. **Cost is no longer a decision factor** - Neon recently expanded BAA availability to the Scale tier (~$69/mo base + usage, vs. ~$700/mo for the old Business-tier requirement). HIPAA-eligible Postgres is now ~$100–150/mo realistic at launch traffic, not ~$700/mo. The conservative posture costs ~$80–130/mo more than non-BAA Scale (same plan, just without BAA) - trivial vs. the retrofit risk
2. Counsel review of "is this HIPAA-covered?" is itself expensive and slow
3. Retrofitting HIPAA later (migrating data, signing BAAs after the fact, post-launch audit trails) is significantly worse than building HIPAA-aware from day one
4. PBH risk tolerance reads conservative from the RFP language ("HIPAA-aware data handling at the seam")
5. The Linus Remote Assessments is going to need HIPAA anyway - having matching posture across both prevents seam confusion

## Schema sketch (preliminary, finalized in discovery)

```sql
-- users: account identity
create table users (
  id uuid primary key default gen_random_uuid(),
  email citext unique not null,
  password_hash text not null,
  legal_name text not null,
  date_of_birth date not null,
  zip text not null,
  state_of_residence char(2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- consents: versioned consent records
create table consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  consent_type text not null,            -- 'wellness' | 'hipaa_npp'
  version text not null,                  -- e.g. '2026-06-01'
  acknowledged_at timestamptz not null default now(),
  ip_hash text not null,
  user_agent text
);

-- payments: mirror of Stripe payment lifecycle
create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  stripe_payment_intent_id text unique not null,
  amount_cents int not null,
  currency text not null default 'usd',
  status text not null,                   -- 'pending'|'succeeded'|'failed'|'refunded'
  is_hsa_fsa boolean not null default false,
  card_brand text,
  card_last4 text,
  succeeded_at timestamptz,
  created_at timestamptz not null default now()
);

-- audit_log: append-only event stream for SAQ-A + HIPAA audit trail
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  event_type text not null,               -- 'signup'|'consent'|'payment_*'|'token_issued'|...
  metadata jsonb,
  occurred_at timestamptz not null default now(),
  ip_hash text,
  request_id text
);

create index on consents(user_id);
create index on payments(user_id);
create index on payments(stripe_payment_intent_id);
create index on audit_log(user_id);
create index on audit_log(event_type, occurred_at);
```

ORM: **Drizzle** (lightweight, TypeScript-first, fits the Next.js + Vercel + Neon stack idiomatically). Alternative is Prisma if the team prefers it.

## Environments

**As built** (project `primary-brain-health`, corrected 2026-07-28 under pbh-9yb.3):

| Vercel scope | Neon branch | `DATABASE_ENV` | Purpose |
| :---- | :---- | :---- | :---- |
| Production | `production` (default) | `production` | Live |
| Preview (all PRs, incl. `staging`) | `preview` — one shared branch | `preview` | PR previews, UAT |
| Local dev | `dev` | `development` | Engineer workstations, `E2E_FULL_FLOW=1` runs |

One shared preview branch, not one per PR. That is the MVP shape: it removes the
production exposure, which is the compliance-relevant part, without per-PR
provisioning. Two PRs with conflicting migrations will collide on it — accepted
for now, and the reason branch-per-PR stays on the roadmap below.

### How it is enforced

An env var alone is only as good as whoever last edited it in the Vercel UI, so
two things check it:

1. **Boot assertion** — `assertDatabaseEnvironment()` (`packages/db/src/env-assert.ts`),
   called from each app's `instrumentation.ts`, refuses to start a deployment
   whose `DATABASE_ENV` contradicts `VERCEL_ENV`, or that pairs the production
   database with sandbox Linus credentials. It throws; a preview writing
   production rows is not a degraded mode worth running in.
2. **Migration gate** — `apps/app/vercel.json` runs `db:migrate` on production,
   and on preview *only when* `DATABASE_ENV=preview`. Previously it was
   production-only precisely because preview shared the production database
   (commit 84a8da0), which also made any PR containing a migration untestable on
   preview by construction.

`DATABASE_ENV` is not a secret — it names which database the connection string
leads to, and it must be set in every scope alongside `DATABASE_URL`. Where it is
unset the boot check logs loudly and continues, so rolling it out can't take an
environment down.

### Planned, not built

- **Ephemeral branch per PR**, auto-created by the Vercel + Neon integration and
  torn down on merge. Removes the shared-preview collision above.
- **A dedicated staging branch.** `staging` currently deploys into the Preview
  scope and therefore shares the preview branch with every PR.

## Open decisions

- **PBH counsel sign-off on HIPAA posture** - the conservative-reading recommendation needs David's compliance counsel to approve. If counsel says "PII-only is fine for funnel," we drop to Scale tier and save ~$8k/yr.
- **ORM**: Drizzle vs Prisma - decide in discovery. Drizzle preferred for lighter footprint + edge runtime compatibility.
- **Password hashing**: argon2 vs bcrypt. Argon2 if auth provider doesn't already handle it (e.g. NextAuth) - Clerk handles entirely on their side.
- **Email verification flow**: required before payment? Or post-payment? Affects schema (verified_at column) and UX.
- **Data retention policy**: how long do we keep `audit_log` entries? HIPAA requires 6 years. We default to that.

## What this changes in the estimate

The previous "Database choice + schema" task in `estimate.md` (5 pts) is now more specific:

- Neon Scale setup + BAA signed by PBH legal - 2 pts
- Schema + initial migration (Drizzle) - 5 pts
- Vercel + Neon integration (preview branches) - 1 pt
- Audit log infrastructure (event types, write helpers) - 3 pts

Total: 11 pts (was 5). The bump reflects audit logging being treated as first-class infrastructure rather than something bolted on.
