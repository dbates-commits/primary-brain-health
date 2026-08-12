# Database

Why the database is Neon on the Scale tier with a BAA, what it holds, and how the
environments are kept apart. The schema itself is code —
`packages/db/src/schema/` is the source of truth; this records the decisions
around it.

## Decision: Neon (Postgres) on Scale tier, with BAA

Locked in pending PBH counsel sign-off on the conservative HIPAA posture. See "Open decisions" at the bottom.

## What lives in the database

| Table | Purpose | Sensitivity |
| :---- | :---- | :---- |
| `users` | Account identity: name, email, DOB, ZIP, state of residence, Linus participant id | PII; conservatively HIPAA-adjacent |
| `consents` | Versioned wellness consent + HIPAA NPP acknowledgments. Stored with version number, timestamp, IP hash | PII; HIPAA-adjacent (consent to receive a health-related service) |
| `payments` | Internal payment record mirror of Stripe events: stripe_payment_intent_id, amount, status, HSA/FSA flag, last-4 | PII; financial |
| `audit_log` | Append-only log of significant events: signup, consent, payment, login | Mixed; supports SAQ-A + HIPAA audit-trail requirements |
| `sessions`, `accounts`, `verification_tokens` | Auth.js tables for magic-link sign-in — see [`auth.md`](./auth.md) | PII |

**Not in this database**:
- Card numbers / CVV / full PAN - never; lives only at Stripe
- Assessment responses / clinical data - owned by Linus, not this database
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

Two readings of the data we hold:

**Conservative reading (recommended)**: this data is HIPAA-covered. Being a user of Primary Brain Health implies a health interest; consents reference HIPAA NPP; the booking flow is the entry door to a clinical experience. Auditors and counsel will lean this way.

**Pragmatic reading**: the booking flow is pre-clinical, PII-only. HIPAA actually attaches once clinical data is collected (in Linus). Most healthcare DTC funnels operate this way.

**Decision**: conservative reading. Reasons:

1. **Cost is no longer a decision factor** - Neon recently expanded BAA availability to the Scale tier (~$69/mo base + usage, vs. ~$700/mo for the old Business-tier requirement). HIPAA-eligible Postgres is now ~$100–150/mo realistic at launch traffic, not ~$700/mo. The conservative posture costs ~$80–130/mo more than non-BAA Scale (same plan, just without BAA) - trivial vs. the retrofit risk
2. Counsel review of "is this HIPAA-covered?" is itself expensive and slow
3. Retrofitting HIPAA later (migrating data, signing BAAs after the fact, post-launch audit trails) is significantly worse than building HIPAA-aware from day one
4. PBH risk tolerance reads conservative from the RFP language ("HIPAA-aware data handling at the seam")
5. Linus is going to need HIPAA anyway - having matching posture across both prevents seam confusion

## Schema

The tables above were sketched here during discovery; the built schema is
`packages/db/src/schema/` (Drizzle), with migrations in
`packages/db/src/migrations/`. Read the schema files — this doc would only ever
be a stale copy of them.

**Drizzle**, not Prisma: lighter footprint, TypeScript-first, and it fits the
Next.js + Vercel + Neon stack idiomatically.

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
   called from `apps/marketing/src/instrumentation.ts`, refuses to start a deployment
   whose `DATABASE_ENV` contradicts `VERCEL_ENV`, or that pairs the production
   database with sandbox Linus credentials. It throws; a preview writing
   production rows is not a degraded mode worth running in.
2. **Migration gate** — `apps/marketing/vercel.json` runs `db:migrate` on production,
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

- **PBH counsel sign-off on HIPAA posture** — the conservative-reading
  recommendation needs David's compliance counsel to approve. If counsel says
  "PII-only is fine", we drop to Scale tier without the BAA and save ~$8k/yr.
- **Data retention** — how long `audit_log` entries are kept. HIPAA requires 6
  years and that is what we default to; nothing enforces it yet.
