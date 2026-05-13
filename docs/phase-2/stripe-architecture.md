# Stripe Payment Architecture — Notes

Pre-implementation research and decision notes for the PBH Website v2 funnel ($149 → BHN → wellness-app handoff). These notes feed into the **Payment architecture spec** that's a named deliverable of the Slice 1 discovery phase.

Status: notes / research. Not yet a spec.

Related: [PROPOSAL.md](./PROPOSAL.md), [PBH_Website_v2.1_RFP.docx](./PBH_Website_v2.1_RFP.docx).

---

## Why Stripe

The RFP requires four things that map cleanly to Stripe primitives:

| Requirement | Stripe primitive |
| :---- | :---- |
| PCI SAQ-A (card data never touches PBH servers) | Stripe Checkout or Payment Element (both hosted-iframe → SAQ-A) |
| HSA/FSA card support | Standard Stripe — works automatically *if MCC is right* (see gotchas) |
| Apple Pay / Google Pay | Native in Payment Element |
| Card on file (reused by wellness app downstream) | `Customer` object + `setup_future_usage: 'off_session'` |
| Sales-tax by jurisdiction | Stripe Tax |
| Webhook reliability | Stripe Webhooks + idempotency keys |

Alternatives considered and rejected:

- **Braintree (PayPal)** — viable, but Stripe has stronger developer experience, better HSA/FSA edge-case documentation, and the Customer-object handoff to the wellness app is more idiomatic
- **Square** — weaker JS SDK, less developer-friendly
- **Adyen** — enterprise-scale, overkill for a single $149 charge product

Stripe is the standard play.

---

## Implementation choice

Three SAQ-A-compatible flavors:

1. **Stripe Checkout** (hosted redirect)
   - Fastest to ship, lowest QA surface, zero PCI risk
   - User clicks "Pay $149" → redirect to `checkout.stripe.com` → returns to confirmation page on success
   - Branding limited — gives up some funnel-completion-rate

2. **Stripe Payment Element** (embedded iframe widget) — **recommended for PBH**
   - Single component covering cards + Apple Pay + Google Pay + Link
   - Fully branded surround; PBH stays on-domain through payment
   - Still SAQ-A — Stripe hosts the iframe; PBH never sees the PAN
   - Funnel-completion gain from staying on-domain is worth the extra implementation effort at the $149 decision point

3. **Card Element** (legacy split-element form)
   - More work than Payment Element, no real benefit
   - Skip

**Recommendation: Payment Element.**

---

## Data flow (high level)

```
1. Visitor lands → completes account creation + wellness consent
2. Website creates Stripe Customer (name, email, ZIP, state — no PHI)
3. Website creates PaymentIntent
     - amount: 14900 (USD cents)
     - customer: <Customer id>
     - setup_future_usage: 'off_session'   ← enables card-on-file for wellness app
     - automatic_payment_methods: { enabled: true }
4. Browser confirms payment via Payment Element (Stripe-hosted iframe)
5. Stripe → webhook → website backend:
     - payment_succeeded   → mark order paid, fire GA4 event, update HubSpot,
                              trigger Postmark receipt
     - payment_failed      → fire GA4 event, surface error to user
6. Browser receives confirmation, redirects to wellness app with signed token
7. Wellness app references the same Stripe Customer / PaymentMethod for
   downstream medical-care intake charge (separate scope, owned by engineering pod)
```

---

## Non-obvious gotchas

### 1. MCC at onboarding is the HSA/FSA make-or-break

HSA/FSA cards are regular Visa/MC cards with funding sourced from a health-spending account. Whether they approve at point of sale depends on the merchant's **Merchant Category Code** (MCC) — set by Stripe during account verification.

- Right MCC (typically **8099** "Health Services NEC" or **8011** "Doctors") → HSA/FSA cards auto-approve at the network level
- Wrong MCC (e.g. coded as "wellness coaching" or "consumer services") → HSA/FSA cards decline at the network, before our code even sees the request

**Action**: Verify MCC explicitly with Stripe support during onboarding. Do not assume. Document the MCC in the implementation spec.

### 2. Stripe's default receipt is too sparse for HSA/FSA reimbursement

HSA/FSA admins require specific fields on the receipt for reimbursement approval. Stripe's default receipt doesn't include all of them.

**Pattern**:
- Stripe webhook fires `payment_succeeded`
- Website backend triggers Postmark with a custom receipt template containing:
  - Provider legal name (PBH, Inc.)
  - NPI if applicable
  - Service description ("Brain health assessment & 30-minute consultation with a Brain Health Navigator")
  - Date of service
  - Amount paid
  - Payment method last-4
  - Patient name + address
  - Explicit non-medical-evaluation language to prevent reimbursement-rejection edge cases

Stripe's built-in receipt is disabled in favor of the Postmark-sent custom receipt.

### 3. Stripe doesn't sign BAAs

Stripe is **not** a HIPAA-covered entity and won't sign a BAA. This is fine if we discipline what flows into Stripe:

- ✅ Allowed in Stripe Customer / metadata: name, email, ZIP, state, payment method
- ❌ Never in Stripe: medical questions, assessment results, consent text body, diagnoses, anything clinical

Wellness consent (signed copy, version number, timestamp) lives in PBH's database — not in Stripe metadata.

### 4. Letter of Medical Necessity (LMN)

Some HSA/FSA administrators require an LMN to reimburse "wellness"-coded services. The PBH offering sits at the wellness/medical seam (assessment + consultation, with handoff to medical care for PA residents).

**Action**: PBH compliance counsel to confirm whether the assessment-plus-consult bundle reads as medical or wellness for reimbursement. If wellness-coded, we may want to offer an LMN-generation flow as a downstream feature. Not in Slice 1 scope.

### 5. PCI SAQ-A is paperwork, not engineering

The SAQ-A deliverable consists of:

- Network/data-flow diagram showing card data flows only through Stripe-hosted surfaces (Payment Element iframe + Stripe API)
- Inventory of systems touching cardholder data → just Stripe
- Completed SAQ-A questionnaire (the merchant — PBH — signs)
- Attestation of Compliance

Stripe provides SAQ-A templates and a checklist. VisualBoston compiles the deliverable; PBH signs the AoC.

---

## Cross-team seams to lock in discovery

These need to be decided jointly with PBH's engineering pod before the Slice 1 build clock starts:

| Seam | Decision needed |
| :---- | :---- |
| Stripe account ownership | One Stripe account shared between website and wellness app, or separate accounts with Customer transfer? Strongly recommend **one shared account** to keep the `Customer` and `PaymentMethod` references valid downstream. |
| API key access for wellness app | How does the wellness app authenticate to Stripe? Same restricted key, or its own? |
| Refund authority | Does the website handle refunds, or does the wellness app? Recommend wellness app for clinical/customer-service reasons; website only for pre-redirect failure refunds. |
| Webhook routing | Single webhook endpoint (website), or split between website and wellness app? Recommend website-only for payment lifecycle, wellness-app-only for downstream charges. |
| Customer-object handoff | The signed redirect token must include the Stripe Customer ID so the wellness app can immediately use the card on file without extra lookup. |

---

## Test & cutover strategy

- **Test mode throughout build** — Stripe test cards including HSA/FSA test card numbers (`4000 0566 5566 5556` for FSA-coded Visa, etc.)
- **Live mode end-to-end transaction before go-live** — required for acceptance per the proposal; uses a real HSA/FSA card if PBH has access, otherwise a real consumer card with immediate refund
- **Webhook idempotency** verified — replay tests using Stripe's webhook replay tooling
- **Refund flow** tested in live mode — partial and full refund paths

---

## What this document is not

- Not the final implementation spec — that's a discovery deliverable
- Not a security audit — that's the SAQ-A documentation deliverable
- Not a substitute for Stripe's own onboarding checklist for healthcare merchants

## Open questions for the implementation spec

- Exact MCC code Stripe assigns at onboarding — confirm with support
- Whether PBH operates as a single legal entity for Stripe purposes or has separate entities for the wellness vs. medical sides
- Whether the wellness app's downstream charge is a separate Customer-level transaction, a SetupIntent → off-session charge, or a subscription
- Whether sales tax applies in any of PBH's serviced jurisdictions for this category of service (Stripe Tax handles automatically once MCC is set, but verify expected behavior)
- Receipt template wording — needs Nina's copy + PBH counsel sign-off for non-medical-evaluation language
- LMN flow — Slice 1 or deferred?
