# Primary Brain Health — Website v2

**Scope of Work / RFP for Visual Boston — May 10, 2026**

Prepared by: David Bates, Founder & Interim CEO
Site: primarybrainhealth.com
Stack (current): Next.js + TinaCMS, deployed on Vercel
Supersedes: PBH_Website_Phase2_Scope.md (May 8, 2026)

---

PBH is in parallel building its DTC clinical product (a $149 wellness assessment → Brain Health Navigator consult → primary-care handoff at MIM, Pennsylvania, Cognoa PC, California). That product needs a live, paying funnel by **August 3, 2026**. The website is the front door.

This RFP therefore chunks the engagement into three discrete value units. The MVP slice is the only thing required for the August launch; the rest is sequenced around it and built only after we are confident the core experience works.

| Slice | Outcome | Window |
| :---- | :---- | :---- |
| **MVP slice** (this RFP's primary ask) | V1 cleanup + the live consumer funnel that supports the $149 → BHN → handoff flow, including PCI-compliant payment processing | June 1 – July 31, 2026 (~4–6 weeks of build) |
| **Fast-follow** | Editorial / authority assets that drive top-of-funnel and trust: testimonials, journey map, cognitive screener, blog hub, full IA overhaul | Aug 10 – Sep 25, 2026 |
| **Conversion optimization** | Marketing-conversion levers: families pathway, providers pathway, pricing page, founder explainer video, hero loop additions, newsletter system, press strip | Sep 28 – Nov 6, 2026 |

The grander Tier C / Phase 3 vision is preserved at the bottom of this document so Visual Boston can architect for it — but it is not in scope for this engagement.

We are asking Visual Boston to price all three slices modularly so PBH can sequence investment and so any single slice can be re-scoped or re-bid without breaking the others.

---

## 1. Background & Goals

PBH is a virtual-first proactive brain health service. The current site is a clean, single-page funnel for a $149 brain-health consultation that captures lead info but does not take payment online. In parallel, the underlying product is being rebuilt as an end-to-end clinical experience: assessment → BHN telehealth consult → medical-care intake → handoff into the partner clinic's EMR. The website must become the funnel for that product, in time for soft launch in early August 2026.

**Primary KPIs the MVP slice must serve (in order):**

- **Paid conversion rate** — homepage → completed $149 payment
- **Funnel integrity** — every event from landing through payment success is tracked, attributable, and handed off cleanly to the wellness app
- **Trust at the decision point** — for a $149 health service, professional polish matters more than feature breadth
- **Compliance posture** — PCI-compliant payment, HIPAA-aware data handling at the seam, accessibility at WCAG 2.1 AA

**KPIs the fast-follow and optimization slices serve (later):**

- Time-on-site, pages-per-session, newsletter capture, organic search traffic, provider-referral inquiries

---

## 2. MVP Slice — Required deliverables (June 1 – July 31)

The MVP slice has three internal sub-slices. Visual Boston should price them as a single integrated effort but track them separately so we can manage risk.

### Slice A — V1 Cleanup (Week 1)

These are defects in the current live site that must be remediated as part of mobilization.

| # | Issue | Action |
| :---- | :---- | :---- |
| P1 | All 4 blog posts contain TinaCMS developer placeholder content (live and indexable) | Remove or noindex until real content lands in fast-follow |
| P2 | `/about` (Team) page is orphaned — not linked in nav or footer | Add to main navigation — plan to surface in Aug–Sept |
| P3 | `/blog` (Resources) page is orphaned — not linked anywhere | Either add to nav or remove from index until fast-follow ships real content |
| P4 | "Our Impact" section on `/about` renders empty | Populate with placeholder data (cohort numbers from pilot) or hide until fast-follow |
| P5 | Terms of Service references "the Sanctuary" (template artifact) | Content Legal review |
| P6 | Blog card featured images missing/blank | Hide blog or stub with brand-appropriate placeholders |
| P7 | Blog header uses off-brand purple gradient | Restyle to brand system (teal/navy/cream) |
| P8 | Homepage hero loop animation has visible cutoff/clipping in bottom-right | Fix asset framing/masking; QA on mobile, tablet, desktop |

**Acceptance**: all P1–P8 items closed and verified on staging by **June 12, 2026** — this is the joint demo with PBH's Week-4 sandbox prototype walkthrough.

### Slice B — MVP Funnel Build (Weeks 2–6)

This is the core of the engagement: the live consumer funnel from the landing page through payment success.

#### B1. Landing page (top of funnel)

**Purpose**: A first-time visitor understands what they get for $149 and how to start within 30 seconds.

**Requirements**:

- Single-page hero with the value prop in plain language: a brain-health assessment, a personalized action plan, and a 30-minute consult with a Brain Health Navigator
- Visible $149 price with what is and is not included
- Trust signals: Linus Health platform, MIM clinical partner, brief BHN team credentials (to be collected: Brook Health, Eli Health, Isaac Health, Synapticure, Sunday Health, Neurocode)
- One primary CTA (Start your assessment) and one secondary CTA (Learn how it works)
- FAQ block addressing: what the assessment is, who the BHN is, what happens after, what is and is not medical advice, refund policy
- Footer with Privacy Policy, Notice of Privacy Practices, Terms of Service, contact, explicit wellness-vs-medical statement
- Mobile-responsive (≥ 60% of inbound traffic expected on mobile)
- Geographic eligibility note prominently surfaced (Pennsylvania residents for the medical-handoff path; assessment available nationally, virtual specialist referrals nationally)

**Acceptance**: First-time visitor can identify price, what they get, and primary CTA without scrolling past the second viewport. Lighthouse mobile Performance ≥ 80. WCAG AA contrast.

#### B2. Account creation, consent & payment (the funnel core)

**Purpose**: Visitor creates an account, agrees to the wellness terms, and pays $149 — in under five minutes.

**Requirements**:

**Account & consent**:

- Account creation: email + password, basic identity (legal name, DOB, ZIP, state of residence — required because of appropriate PC handoff)
- Wellness consent — distinct from clinical consent (which happens later in the funnel); covers data use, BHN role boundary, "this is not a medical evaluation"
- HIPAA Notice of Privacy Practices linked and acknowledged
- Both consents timestamped and persisted with version numbers (consents are versioned artifacts)

**Payment — PCI-compliant, HSA/FSA-aware**:

- Stripe Checkout (or Stripe Elements if richer in-page UX needed) for $149 cash-pay
- Apple Pay / Google Pay enabled
- HSA/FSA cards explicitly supported — critical given PBH's HSA/FSA-eligibility positioning
- Card stored on file via Stripe Customer object (card will be reused for the medical-care intake step inside the wellness app)
- Refund policy presented before payment (final policy window TBD by PBH; placeholder copy can ship at staging)
- Receipt email sent immediately on payment success — itemized in a format suitable for HSA/FSA reimbursement submission
- Sales-tax handling per jurisdiction (Stripe Tax or equivalent)
- Webhook reliability for `payment_succeeded` / `payment_failed` events
- Tokenized card storage (never on PBH servers)
- Audit log for every payment event
- PCI SAQ-A compliance documentation delivered to PBH before go-live

**Handoff to the wellness app (the seam)**:

- On `payment_succeeded`: HubSpot lead is tagged `paid` (no PHI passed); the user is redirected to the wellness app domain with a signed token; the wellness app instantiates the assessment session
- The wellness app, BHN dashboard, assessment runner, intake gate, and Athena handoff are **NOT** in Visual Boston's scope — they are owned by PBH's engineering pod (vendor TBD). Visual Boston's deliverable ends at the Stripe success → wellness app redirect

**Out of scope (explicit)**:

- SSO (Google, Apple)
- Insurance collection at this step (handled later inside the wellness app)
- Multi-user / family accounts

**Acceptance**:

- Median time from `signup_started` to `payment_succeeded` < 5 minutes for completing visitors
- End-to-end test transaction succeeds in test mode **AND** live mode
- HSA/FSA card flagged correctly on receipt
- Refund flow tested
- Webhook reliability verified
- PCI SAQ-A documentation delivered
- Receipt email arrives within 60 seconds of payment success

#### B3. Confirmation page (post-payment, before redirect)

**Requirements**:

- Receipt summary, what-happens-next, expected timeline, link to begin the assessment immediately or via emailed resume link
- Brief reassurance copy ("you're in the right place") — copy supplied by PBH (Nina)

### Slice C — MVP Integrations (Weeks 4–6)

This is the plumbing that makes the funnel measurable and the launch real.

| Integration | Requirement |
| :---- | :---- |
| **Analytics — GA4** | Events fired for: `landing_viewed`, `cta_primary_clicked`, `cta_secondary_clicked`, `faq_opened`, `signup_started`, `signup_completed`, `wellness_consent_signed`, `payment_started`, `payment_succeeded`, `payment_failed`. Funnel report: homepage → `payment_succeeded` |
| **HubSpot** | Lead created on `signup_started`; lifecycle stage updated on `payment_succeeded` to `paid`. No PHI passes to HubSpot — only event flags. Visual Boston implements the integration; PBH provides the field mapping |
| **Transactional email** | Provider: Postmark, Resend, or SES (Visual Boston recommends; PBH provisions BAA if required). Templates needed: receipt, abandonment recovery (1h), abandonment recovery (24h, second touch), assessment resume link |
| **Wellness app handoff** | Signed-token redirect handoff from website → wellness app on `payment_succeeded`. Token format and signing key co-defined with engineering pod |
| **BHN scheduling embed (placeholder)** | The website must reserve and route to the eventual BHN scheduling page; the actual scheduling embed (HubSpot Meetings or Calendly) lives inside the wellness app behind login. Visual Boston confirms the redirect contract |
| **Telehealth link delivery** | Out of scope for the website (telehealth links are sent from the wellness app). Visual Boston confirms the email-template ownership boundary |

### MVP Slice — Cross-cutting requirements (apply to all of A + B + C)

| Area | Requirement |
| :---- | :---- |
| **Brand** | Strict adherence to existing brand palette. No off-brand gradients. Typography system documented. |
| **Accessibility** | WCAG 2.1 AA on all new pages and components. Keyboard navigation. Color contrast. Alt text. |
| **Performance** | 90+ Lighthouse Performance on mobile for the landing page. Lazy-load below-fold imagery. |
| **SEO (baseline only)** | Schema.org `Organization` and `MedicalWebPage`; XML sitemap; meta titles/descriptions on all live pages. Deeper SEO (article schema, FAQPage schema, internal linking strategy) deferred to fast-follow |
| **CMS** | Continued use of TinaCMS. New marketing pages editable by non-developers. |
| **Privacy / Compliance** | PCI SAQ-A documentation. HIPAA-aware data handling at the wellness-app seam. Privacy policy and ToS rewritten (P5). Cookie consent if not already present. |
| **Hosting** | Continue on Vercel. Staging environment for client review before launch. |
| **Mobile-first** | All MVP deliverables designed and tested mobile-first. |
| **Content production** | Consumer-facing copy for the MVP slice is owned by Nina Zhang (PBH), not Visual Boston. Nina will deliver landing-page copy, FAQ, consent text drafts (for counsel review), form labels, error states, refund policy, and receipt email by the windows in §4 |

### MVP Slice — Acceptance for go-live

**By July 31, 2026:**

- All Slice A defects closed
- End-to-end test of $149 payment succeeds in live mode (with refund tested)
- HSA/FSA card flagged correctly on receipt
- HubSpot receives correct events with no PHI
- GA4 funnel report renders on a 7-day rolling basis
- WCAG 2.1 AA audit clean (or any open issues triaged with PBH)
- PCI SAQ-A compliance documentation delivered
- Two-day hypercare period (Aug 3–4) covered by Visual Boston

---

## 3. Fast-follow — Editorial & trust (Aug 10 – Sep 25)

These are the assets that establish authority and reduce decision-point friction. Built only after we are confident the MVP funnel is delivering a good and proper experience.

| # | Deliverable | Notes |
| :---- | :---- | :---- |
| F1 | **Testimonials with video** | Dedicated `/testimonials` page; 6–10 patient stories (mix of video + written). Reusable testimonial card component. Featured testimonials placed contextually (homepage, About, intake confirmation). Care-partner testimonial track ("I did this for my mom"). HIPAA-aware (written releases). Production scoping: in-house or partner videographer |
| F2 | **Interactive Brain Health Journey Map** | Horizontal/vertical timeline across 5 stages (Concern → Assess → Plan → Act → Sustain). Replaces the current "How It Works" section. Standalone `/how-it-works` page for direct linking. Mobile-first. WCAG 2.1 AA |
| F3 | **Cognitive Self-Screener / Risk Assessment Tool** | 8–12 question, ~3-minute self-assessment of modifiable risk factors. Built jointly with PBH medical team. Personalized result page → CTA to book the consultation. Optional email capture. HIPAA-aware. Clinically reviewed and approved by PBH medical team before launch |
| F4 | **Blog / Editorial Hub** | Index with category filters; article template; author profile pages; Schema.org `Article` + `MedicalWebPage`; RSS + sitemap. Launch with 8–12 cornerstone articles (content production scoped separately). Replaces the placeholder content from Slice A |
| F5 | **Resource Library** | `/resources` index — Guides (PDF), Checklists, Worksheets, Webinars, Glossary. Gated downloadables → email capture → HubSpot list segmentation |
| F6 | **Navigation & IA Overhaul** | New primary nav: About / How It Works / Resources / For Families / For Providers / Blog / Book Consultation. Mega-menu for Resources. Sticky persistent CTA. Footer rebuild. Breadcrumbs |

---

## 4. Conversion optimization — Marketing levers (Sep 28 – Nov 6)

Built only after we have a proven experience to drive traffic to.

| # | Deliverable | Notes |
| :---- | :---- | :---- |
| C1 | **For Families / Care Partners pathway** | Dedicated `/for-families` track. Care-partner-specific testimonials, FAQ, soft-conversion path ("not sure if Mom is ready — get our free family guide") |
| C2 | **For Referring Providers pathway** | `/for-providers` page: clinical methodology one-pager (downloadable), referral form, sample patient report (de-identified), Dr. Bates' CV. Unlocks B2B channel |
| C3 | **Pricing / Membership page** | Standalone `/pricing` page improves SEO and reduces friction. What's included, HSA/FSA language, future membership tiers |
| C4 | **Homepage explainer video** | 60–90 second founder-led video featuring Dr. Bates. Visual Boston scopes production or coordinates partner videographer |
| C5 | **Hero loop expansion** | Two additional clips (parents with young child; multigenerational family). Footage style consistent with existing loop. Custom shoot strongly preferred over stock |
| C6 | **Press / Social Proof Strip** | Horizontal logo strip beneath hero — "As covered by," credentialing institutions, board affiliations, HSA/FSA badge. Populated as press develops |
| C7 | **Newsletter & Email Nurture System** | Sitewide newsletter signup (footer, blog sidebar, exit-intent on key pages). HubSpot integration. Welcome sequence + 3 evergreen nurture sequences (general prospect, care partner, post-screener) |

---

## 5. Future state (Phase 3 — for awareness only, NOT in this engagement)

Architect Slices A–C to accommodate these without rework. Build only when business case warrants.

- Patient Portal / Member Login
- Live chat / scheduling widget (Calendly or similar embedded)
- Provider Directory (when network grows)
- Outcome Dashboard (anonymized aggregate outcomes)
- Spanish-language site
- Podcast integration
- Annual research report / white paper

---

## 6. Content production responsibilities

Content for the MVP slice is owned by PBH (Nina Zhang) on the build-sprint priority order in the DTC MVP Epic + PRD, Appendix A. Visual Boston is not asked to write copy for the MVP slice.

Content for the fast-follow and optimization slices may be partly owned by Visual Boston if you offer content services; please propose options:

- 8–12 cornerstone blog articles (1,200–2,000 words each), clinically reviewed
- Founder explainer video (1) + patient testimonials (3–5) + care-partner testimonial (1)
- Resources: 3 PDF guides, 2 checklists, 1 glossary, 1 recorded webinar
- Photography: real team headshots (replace stock on About page); one branded photoshoot for hero/section imagery
- Screener content: question bank, scoring logic, result-page copy (jointly developed with PBH medical team)
- Email sequences: welcome + 3 nurture flows (copywriting)

---

## 7. Deliverables Visual Boston should include in the proposal

Please structure the proposal with the following:

- **Discovery & strategy phase** — stakeholder interviews, IA workshop, content audit handoff, analytics baseline. Must be compressed to 1–2 weeks given the August launch
- **Design phase** — moodboard, component library extension, MVP-slice page designs in Figma (desktop + mobile)
- **Build phase** — sprint plan, staging environment, QA plan, accessibility audit, PCI SAQ-A documentation
- **Launch phase** — content migration, redirects, SEO checks, analytics validation, monitoring, 2-day hypercare for soft launch (Aug 3–4)
- **Post-launch** — 30-day support window, training session for editorial team
- **Pricing** — modular by slice so PBH can sequence investment:
  - MVP Slice (A + B + C) — single fixed-fee or T&M with cap
  - Fast-follow — separate quote
  - Conversion optimization — separate quote
  - Optional content services — separate line items
- **Timeline** — committed dates for Slice A done June 12, MVP go-live July 31 as gating commitments
- **Team & roles** — who from Visual Boston works on the project; estimated PBH-side time commitment
- **Assumptions, exclusions, and dependencies** — explicitly call out:
  - Wellness app and post-payment flow are out of scope (engineering pod owns)
  - Consent text and refund policy require counsel review on PBH side
  - HIPAA-eligible product use of HubSpot is bounded by the no-PHI rule

---

## 8. Key questions for Visual Boston

- Can you commit to MVP go-live July 31 as a fixed date, given the soft-launch dependency?
- Do you have HIPAA-experienced project leads, given consent capture and the wellness-app handoff?
- PCI SAQ-A — have you delivered this on prior engagements? What does your documentation look like?
- Stripe HSA/FSA card handling — have you implemented this before? Any gotchas with receipt formatting for HSA/FSA reimbursement?
- Visual Boston's recommendation on TinaCMS at this scale of content vs. migrating to Sanity/Contentful/Payload — and whether that decision can be deferred past the MVP slice
- Can the Journey Map component (fast-follow) be built reusable for future provider/family pathway pages?
- Can you deliver video testimonial production in-house for fast-follow, or do you partner?
- What does ongoing monthly support look like post-launch?

---

## 9. Summary — at a glance

**MVP slice (June 1 – July 31, ~4–6 weeks of build)**: V1 cleanup (P1–P8) • Landing page • Account creation + wellness consent + HIPAA NPP + state-of-residence capture • $149 Stripe payment with HSA/FSA support • Receipt email • Confirmation page + redirect handoff to wellness app • HubSpot integration (no PHI) • GA4 funnel analytics • Transactional email setup • Staging review + accessibility + PCI audit + UAT • 2-day soft-launch hypercare

**Fast-follow (Aug 10 – Sep 25)**: Testimonials with video • Journey Map • Cognitive Self-Screener • Blog hub • Resource Library • Nav & IA overhaul

**Conversion optimization (Sep 28 – Nov 6)**: Families pathway • Providers pathway • Pricing page • Founder explainer video • Hero loop additions • Press strip • Newsletter & nurture system

**Phase 3 / future state (architect for, not in scope)**: Member portal • Live chat • Provider directory • Outcome dashboard • Spanish site • Podcast • Annual report
