# Discovery Summary — PBH Website v2 (SOW #2)

**Status:** Final — delivered with Invoice 1B
**Date:** June 30, 2026
**Authors:** Mark Stenquist (VisualBoston), Bill Laukaitis (compliance)
**Related:** [stripe-architecture.md](./stripe-architecture.md) · [handoff-token-contract.md](./handoff-token-contract.md) · [SOW2-Proposal.md](../proposal/SOW2-Proposal.md)

---

## Purpose

This document records the decisions, dependencies, and stakeholder map established during the Phase 1 discovery sprint (Jun 1–Jun 12, 2026). It satisfies the Invoice 1B discovery-doc deliverable and serves as the authoritative record of what was locked before the build clock started on Jun 22.

---

## Stakeholder Map

### VisualBoston

| Name | Role |
| :--- | :--- |
| Mark Stenquist | Engineering lead — architecture, build, delivery |
| Matt (PM) | Project management, client coordination |
| Bill Laukaitis | Primary compliance specialist — Stripe/PCI/HSA-FSA + HIPAA (both memos) |
| Jessica Zeff | HIPAA advisory — reviews Bill's draft memos before they reach PBH |

### Primary Brain Health

| Name | Role |
| :--- | :--- |
| David (founder) | Executive sponsor, final sign-off, Stripe account owner |
| Nina Zhang | Content production — landing-page copy, FAQ, consent text drafts, form labels, error states, refund policy, receipt email |

### Third Parties

| Vendor | Role |
| :--- | :--- |
| Linus Health / Eisai (Epsom platform) | Wellness app — receives the signed-token handoff after payment; hosts the cognitive assessment session |
| MIM (Pennsylvania) | Clinical partner — athenahealth EMR handoff for PA-resident medical referrals |
| Cognoa PC (California) | Clinical partner — future-state; CA clinical handoff |
| Neon | Postgres database hosting (Scale tier — lowest tier with BAA available) |
| Stripe | Payment processor (Payment Element, SAQ-A path) |
| Resend | Transactional email (Pro tier — BAA available; React Email templating) |
| Vercel | Hosting + edge infrastructure |

---

## Decisions Locked in Discovery

### Authentication

**Decision:** Auth.js v5 (formerly NextAuth) with the Drizzle adapter.

Clerk was evaluated and rejected. Clerk's pricing model is MAU-based, which creates unbounded cost exposure as the consumer funnel scales, and Clerk's HIPAA BAA terms were not appropriate for the PBH use case. Auth.js is open-source, free at any scale, and integrates cleanly with the existing Next.js + Neon + Drizzle stack.

Password hashing: Argon2id (industry standard, native in Auth.js credentials provider).

### Database

**Decision:** Neon Scale tier (Postgres) with Drizzle ORM.

Scale is the lowest Neon tier offering a Business Associate Agreement (BAA). PBH executes the BAA directly with Neon before go-live — this is a PBH obligation, not a VisualBoston deliverable.

### Payment

**Decision:** Stripe Payment Element (embedded iframe, SAQ-A compliant).

Stripe Checkout (hosted redirect) was the faster-to-ship alternative. Payment Element was chosen for funnel-completion reasons — staying on-domain through the payment step reduces drop-off at the $149 decision point. Both are SAQ-A compliant; PBH never handles card data directly under either approach.

Full payment architecture rationale, data flow, MCC/HSA-FSA requirements, and cross-team seams are documented in [stripe-architecture.md](./stripe-architecture.md).

**Stripe account:** David's existing Stripe account (single shared account — no account split with the wellness app). Confirmed Jun 25.

### Signed-Token Handoff

**Decision:** JWT (RS256, 2048-bit), delivered as a query parameter with `Referrer-Policy: no-referrer` on the redirect. 10-minute TTL. Replay protection via `jti` + `processed_tokens` table on the wellness-app side.

Token transport was locked Jun 25 (query param over POST body — simpler, no meaningful security tradeoff given short TTL + no-referrer policy). Full issuance/validation protocol and error handling are in [handoff-token-contract.md](./handoff-token-contract.md).

**Wellness-app platform:** Eisai/Linus Health (Epsom). Confirmed Jun 25. Exact receiving domain/endpoint to be confirmed by PBH product team before funnel implementation begins.

### Email

**Decision:** Resend (Pro tier) with React Email templates.

Postmark was evaluated. Resend was chosen for its native React Email integration (templates live in the same repo as the rest of the codebase, with proper TypeScript components and types) and BAA availability on the Pro tier. Stripe's built-in receipt is disabled in favor of a custom Resend receipt template formatted for HSA/FSA reimbursement.

### Analytics

**Decision:** GA4 with a defined event taxonomy.

Events confirmed in scope for Phase 1: `landing_viewed`, `cta_primary_clicked`, `cta_secondary_clicked`, `faq_opened`, `signup_started`, `signup_completed`, `wellness_consent_signed`, `payment_started`, `payment_succeeded`, `payment_failed`. Funnel report: homepage → `payment_succeeded`.

### Content Production Calendar

Confirmed async with Nina Zhang. Phase 1 content windows:

| Content | Owner | Window |
| :--- | :--- | :--- |
| Landing-page copy (hero, value props, FAQ) | Nina Zhang | By Jun 22 (build start) |
| Consent text drafts (for PBH counsel review) | Nina Zhang | By Jun 22 |
| Form labels + error states | Nina Zhang | By Jun 22 |
| Refund policy copy | Nina Zhang | By Jun 29 |
| Receipt email copy | Nina Zhang + PBH counsel | By Jul 7 (Resend receipt template build) |

---

## Dependencies on PBH

These items are PBH obligations — VisualBoston cannot complete the build, compliance deliverables, or go-live without them.

| Item | Owner | Required by | Status |
| :--- | :--- | :--- | :--- |
| Neon Scale BAA execution | David (PBH officer sign-off) | Before go-live (Aug 14) | Pending |
| Stripe AoC sign-off | David (PBH officer) | Before go-live (Aug 14) | Pending — Bill Laukaitis drafts; PBH signs |
| Wellness-app domain / endpoint | PBH product team + Linus/Eisai | Before funnel build begins (~Jul 7) | Open — see handoff-token-contract.md §14 |
| MCC confirmation | Bill Laukaitis + Stripe support | Before live-mode payment test | In progress — David onboarded Stripe as "full clinical"; Bill confirming assigned MCC |
| Stripe API key access for wellness app | PBH product team | Before go-live | Open — confirm restricted-key access model with Linus/Eisai engineering |
| Receipt template sign-off | Nina Zhang + PBH counsel | By Jul 7 | Pending — VB provides template; PBH counsel approves non-medical-evaluation language |
| Refund authority decision | David | Before staging (Jul 24) | Open — VB recommendation: wellness app handles post-redirect refunds; funnel handles pre-redirect failures only |
| Nina content windows met | Nina Zhang | Per calendar above | On track |

---

## Risk Register (Phase 1)

| Risk | Likelihood | Impact | Mitigation |
| :--- | :--- | :--- | :--- |
| MCC coded incorrectly → HSA/FSA cards decline | Medium | High | Bill Laukaitis verifying with Stripe support this week |
| Wellness-app domain not confirmed before build | Low-Medium | High | Handoff token contract sent to PBH product team Jun 26; follow-up due Jul 7 |
| Nina content delays | Low | Medium | Content windows built into timeline with 5-business-day buffer before each build milestone |
| Neon BAA not executed before go-live | Low | High (go-live blocker) | PBH on notice; VisualBoston will surface at-risk ≥2 weeks before Aug 14 |
| Specialist availability (Bill or Jessica) | Low | Medium | Backup-consultant commitment in SOW §7 — VB sources qualified replacement at no cost to PBH |

---

## What Is Not Covered by This Document

- The Stripe Readiness Memo (Stripe/PCI/HSA-FSA compliance analysis) — Bill Laukaitis, target Jul 22
- The HIPAA Security Memo — Bill Laukaitis, target Jul 22 (conditional on Neon BAA execution)
- The PCI SAQ-A questionnaire + Attestation of Compliance — Bill Laukaitis, delivered at Phase 1 go-live
- The signed-token handoff contract itself — see [handoff-token-contract.md](./handoff-token-contract.md)
- The payment architecture spec — see [stripe-architecture.md](./stripe-architecture.md)
