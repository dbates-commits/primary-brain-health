# Project Proposal

## Statement of Work (SOW #2)

**Primary Brain Health — Website v2 (DTC Funnel & Editorial Expansion)**

VisualBoston, Inc.

## Table of contents

1. [Overview](#1-overview)
2. [Project Timeline](#2-project-timeline)
3. [Scope of Work & Deliverables](#3-scope-of-work--deliverables)
4. [Feedback & Approval Process](#4-feedback--approval-process)
5. [Change Orders & Additional Work](#5-change-orders--additional-work)
6. [Not Included](#6-not-included)
7. [Assumptions](#7-assumptions)
8. [Team](#8-team)
9. [Pricing & Payment Terms](#9-pricing--payment-terms)

## 1. Overview

Primary Brain Health (PBH) is a virtual-first proactive brain health service. SOW #1 delivered the V1 landing page that established the brand and captured leads. SOW #2 turns that landing page into the live consumer funnel for PBH's $149 wellness assessment → Brain Health Navigator (BHN) consult → primary-care handoff product, in time for soft launch on **August 3, 2026**. After launch, the engagement extends into the editorial / authority and conversion-optimization assets that grow the funnel.

This engagement is structured as **three modular slices** so PBH can sequence investment and any one slice can be re-scoped without breaking the others:

| Slice | Outcome | Window |
| :---- | :---- | :---- |
| **Slice 1 — MVP** | V1 cleanup + live consumer funnel supporting the $149 → BHN → handoff flow, with PCI-compliant payment | Jun 1 – Jul 31, 2026 |
| **Slice 2 — Fast-follow** | Editorial / authority assets: testimonials, journey map, cognitive screener, blog hub, full IA overhaul | Aug 10 – Sep 25, 2026 |
| **Slice 3 — Conversion optimization** | Marketing-conversion levers: families pathway, providers pathway, pricing page, founder explainer video, hero loop additions, newsletter system, press strip | Sep 28 – Nov 6, 2026 |

Each slice is priced independently. PBH may approve Slice 1 in isolation and decide on Slices 2 and 3 after MVP go-live based on what the funnel is telling us.

### Overall Goals

#### Primary Business Objectives

##### Paid Conversion at the Decision Point

- Deliver a clean, fast funnel from landing page through completed $149 payment, with median time-to-pay under five minutes for completing visitors
- Establish trust at the decision point with professional polish, clear price/value framing, and visible compliance posture
- Surface HSA/FSA eligibility as a first-class part of the purchase experience

##### Funnel Integrity & Compliance Posture

- Every funnel event tracked, attributable, and handed off cleanly to the wellness app
- PCI SAQ-A compliance documented and delivered to PBH before go-live
- HIPAA-aware data handling at the wellness-app seam (no PHI in HubSpot, signed-token handoff to the wellness app)
- WCAG 2.1 AA accessibility on all new pages and components

##### Editorial Authority & Top-of-Funnel Growth (Slices 2 & 3)

- Build the testimonials, journey map, screener, blog hub, and resource library that establish authority and reduce decision-point friction
- Open the families and providers pathways and the conversion levers (pricing page, founder explainer video, hero expansion, press strip, newsletter nurture) that scale paid acquisition

#### Technical & Performance Improvements

##### Continued Modern Stack

- Continued use of the existing Next.js + TinaCMS + Vercel stack delivered in SOW #1
- 90+ Lighthouse Performance on mobile for the landing page; 80+ across other categories
- 99.9% uptime via Vercel; staging environment for client review before any go-live
- Mobile-first throughout (≥ 60% of inbound traffic is mobile)

##### SEO & Search Performance

- Baseline on-page SEO across new pages: meta titles, descriptions, headers, XML sitemap
- Schema.org `Organization` and `MedicalWebPage` at MVP go-live
- `Article` and `FAQPage` schema added with the blog hub and journey map in Slice 2
- Mobile-first development for optimal search rankings

#### Innovation & Timeline Acceleration

##### AI-Powered Development Methodology

- Continued use of AI-assisted design and coding workflows (Claude Code, generative design tools) as established in SOW #1
- Accelerated timelines per slice without sacrificing quality, supported by AI-assisted code review, accessibility checks, and test generation
- Rapid prototyping and iteration cycles that maximize client feedback opportunities

| Total Weeks (all slices) | Anticipated Start Date | End Date |
| :---: | :---: | :---: |
| ~22 weeks across 3 slices | {{START_DATE — depends on signing; assume ~May 18, 2026 for discovery to land Slice 1 build June 1}} | Nov 6, 2026 |

## 2. Project Timeline

This engagement runs across three sequenced slices. The dates below are **committed dates** for Slice 1; Slices 2 and 3 are committed to their windows assuming sign-off on each at the prior slice's wrap.

### Slice 1 — MVP (Jun 1 – Jul 31, 2026)

| Phase | Window | Notes |
| :---- | :---- | :---- |
| Discovery & strategy | {{~May 18 – May 31}} | Compressed to ~2 weeks given August launch dependency. Stakeholder interviews (David, Nina, engineering pod), content/data inventory, analytics baseline, scope confirmation, signed-token handoff contract draft with engineering pod |
| Design | {{~May 25 – Jun 12}} | Component-library extension from V1; landing page, signup/consent/payment, confirmation/handoff page. Desktop + mobile in Figma |
| Build — Slice A (V1 cleanup) | Jun 1 – Jun 12 | All eight P1–P8 defects closed and verified on staging by **Jun 12, 2026** (gating commitment — aligns with PBH's Week-4 sandbox prototype walkthrough) |
| Build — Slice B (funnel) | Jun 8 – Jul 24 | Landing page, account/consent, Stripe payment with HSA/FSA, confirmation page, signed-token handoff |
| Build — Slice C (integrations) | Jun 22 – Jul 24 | GA4 events, HubSpot lifecycle, transactional email, webhook hardening, PCI SAQ-A documentation |
| QA, accessibility audit, UAT | Jul 20 – Jul 30 | End-to-end live-mode payment test, refund flow, webhook reliability, WCAG audit, Lighthouse |
| **MVP go-live** | **Jul 31, 2026** | Gating commitment |
| Hypercare | Aug 3 – Aug 4 | Two-day soft-launch hypercare; engineer on call |

### Slice 2 — Fast-follow (Aug 10 – Sep 25, 2026)

| Phase | Window |
| :---- | :---- |
| Design (testimonials, journey map, screener, blog hub, resource library, IA / nav overhaul) | Aug 10 – Aug 28 |
| Build | Aug 17 – Sep 18 |
| Content production (testimonial shoots, cornerstone articles — if elected as optional services) | Aug 17 – Sep 18 |
| QA, accessibility, launch | Sep 22 – Sep 25 |

### Slice 3 — Conversion optimization (Sep 28 – Nov 6, 2026)

| Phase | Window |
| :---- | :---- |
| Design (families, providers, pricing, press strip, newsletter system) | Sep 28 – Oct 9 |
| Build | Oct 5 – Oct 30 |
| Founder explainer video + hero loop additions (production scoped or partnered) | Oct 5 – Oct 30 |
| QA, accessibility, launch | Nov 2 – Nov 6 |

This timeline assumes timely feedback at each checkpoint and that PBH-owned copy and consent text arrive within the windows in §7.

## 3. Scope of Work & Deliverables

This engagement covers the design, build, integration, and launch of three modular slices. Slice 1 is the gating engagement for the August soft launch; Slices 2 and 3 build on the same foundation.

### Slice 1 — MVP (Jun 1 – Jul 31)

#### 1A — V1 Cleanup (Week 1, by Jun 12)

Eight defects in the current live site, remediated as part of mobilization:

| # | Issue | Action |
| :--- | :--- | :--- |
| P1 | Blog posts contain TinaCMS placeholder content (live, indexable) | Remove from index / `noindex` until real content lands in Slice 2 |
| P2 | `/about` (Team) page orphaned | Add to main nav (surfaced fully in Slice 2 IA overhaul) |
| P3 | `/blog` (Resources) page orphaned | Remove from nav and `noindex` until Slice 2 content ships |
| P4 | "Our Impact" section on `/about` renders empty | Populate with pilot-cohort placeholder numbers (PBH-supplied), or hide until Slice 2 |
| P5 | Terms of Service references "the Sanctuary" (template artifact) | Rewrite ToS + Privacy Policy + Notice of Privacy Practices; counsel review on PBH side |
| P6 | Blog card featured images missing/blank | Hide blog cards or stub with brand-appropriate placeholders |
| P7 | Blog header off-brand purple gradient | Restyle to brand system (teal / navy / cream) |
| P8 | Homepage hero loop visible cutoff in bottom-right on some breakpoints | Re-frame / re-mask asset; QA mobile, tablet, desktop |

**Acceptance**: all P1–P8 closed and verified on staging by **Jun 12, 2026**.

#### 1B — Funnel Build (Weeks 2–6)

##### Landing page (top of funnel)

A first-time visitor understands what they get for $149 and how to start within 30 seconds.

- Single-page hero with the value prop in plain language: brain-health assessment, personalized action plan, and a 30-minute consult with a Brain Health Navigator
- Visible **$149** price with what is and is not included
- Trust signals: Linus Health platform, MIM clinical partner, brief BHN team credentials (Brook Health, Eli Health, Isaac Health, Synapticure, Sunday Health, Neurocode — final list confirmed with PBH)
- One primary CTA ("Start your assessment"), one secondary CTA ("Learn how it works")
- FAQ block: what the assessment is, who the BHN is, what happens after, what is and is not medical advice, refund policy
- Footer with Privacy Policy, Notice of Privacy Practices, Terms of Service, contact, explicit wellness-vs-medical statement
- Geographic eligibility surfaced (Pennsylvania residents for the medical-handoff path; assessment available nationally, virtual specialist referrals nationally)

**Acceptance**: first-time visitor identifies price, what they get, and primary CTA without scrolling past the second viewport. Lighthouse mobile Performance ≥ 80. WCAG AA contrast.

##### Account creation, consent & payment (the funnel core)

Visitor creates an account, agrees to wellness terms, and pays $149 in under five minutes.

**Account & consent**:

- Email + password account creation
- Basic identity: legal name, DOB, ZIP, state of residence (required for appropriate primary-care handoff)
- Wellness consent (distinct from clinical consent — clinical happens later in the wellness app); covers data use, BHN role boundary, "this is not a medical evaluation"
- HIPAA Notice of Privacy Practices linked and acknowledged
- Both consents timestamped and persisted with version numbers (consents are versioned artifacts)

**Payment — PCI-compliant, HSA/FSA-aware** (powered by **Stripe**):

- Stripe Payment Element for $149 cash-pay — embedded, branded, single component covering cards + Apple Pay + Google Pay + Link. Hosted iframe keeps us on the PCI SAQ-A path
- HSA/FSA cards explicitly supported (critical given PBH's HSA/FSA-eligibility positioning); HSA/FSA card flagged correctly on the receipt. Requires correct merchant-category coding on the Stripe account — verified during discovery
- Card stored on file via Stripe Customer object (reused by the wellness app for the medical-care intake step downstream)
- Refund policy presented before payment (final policy window TBD by PBH; placeholder copy ships at staging)
- Receipt email sent within 60 seconds of `payment_succeeded`, itemized in a format suitable for HSA/FSA reimbursement submission
- Sales-tax handling per jurisdiction (Stripe Tax)
- Webhook reliability for `payment_succeeded` and `payment_failed` events
- Tokenized card storage (never on PBH servers)
- Audit log for every payment event
- **PCI SAQ-A compliance documentation** delivered to PBH before go-live

**Handoff to the wellness app (the seam)**:

- On `payment_succeeded`: HubSpot lead tagged `paid` (no PHI passed); user redirected to the wellness app domain with a signed token; the wellness app instantiates the assessment session
- Token format and signing key co-defined with PBH's engineering pod during discovery
- The wellness app, BHN dashboard, assessment runner, intake gate, and Athena handoff are **not** in VisualBoston's scope — owned by PBH's engineering pod

**Acceptance**:

- Median `signup_started` → `payment_succeeded` < 5 minutes for completing visitors
- End-to-end test transaction succeeds in test mode **and** live mode
- HSA/FSA card flagged correctly on receipt
- Refund flow tested in live mode
- Webhook reliability verified (replay handling, idempotency)
- PCI SAQ-A documentation delivered
- Receipt email arrives within 60 seconds of payment success

##### Confirmation page (post-payment, before redirect)

- Receipt summary, what-happens-next, expected timeline, link to begin the assessment immediately or via emailed resume link
- Brief reassurance copy ("you're in the right place") — copy supplied by PBH (Nina)

#### 1C — Integrations (Weeks 4–6)

| Integration | Requirement |
| :---- | :---- |
| Analytics — GA4 | Events fired for: `landing_viewed`, `cta_primary_clicked`, `cta_secondary_clicked`, `faq_opened`, `signup_started`, `signup_completed`, `wellness_consent_signed`, `payment_started`, `payment_succeeded`, `payment_failed`. Funnel report: homepage → `payment_succeeded` |
| HubSpot | Lead created on `signup_started`; lifecycle stage updated on `payment_succeeded` to `paid`. **No PHI passes to HubSpot — only event flags.** VisualBoston implements the integration; PBH provides field mapping |
| Transactional email | VisualBoston recommends **Postmark** as primary (highest deliverability for transactional, simple template editor, lowest operational overhead). Resend or SES acceptable alternates. PBH provisions BAA if required. Templates: receipt, 1-hour abandonment recovery, 24-hour abandonment recovery, assessment resume link |
| Wellness app handoff | Signed-token redirect from website → wellness app on `payment_succeeded`. Token format and signing key co-defined with engineering pod |
| BHN scheduling embed (placeholder) | Website reserves and routes to the eventual BHN scheduling page; actual scheduling embed (HubSpot Meetings or Calendly) lives inside the wellness app behind login. VisualBoston confirms the redirect contract |
| Telehealth link delivery | **Out of scope for the website** — telehealth links are sent from the wellness app. VisualBoston confirms the email-template ownership boundary |

#### Cross-cutting requirements (Slice 1)

| Area | Requirement |
| :---- | :---- |
| Brand | Strict adherence to existing brand palette. No off-brand gradients. Typography system documented |
| Accessibility | WCAG 2.1 AA on all new pages. Keyboard nav, color contrast, alt text |
| Performance | 90+ Lighthouse Performance on mobile for the landing page. Lazy-load below-fold imagery |
| SEO (baseline) | `Organization` + `MedicalWebPage` schema, XML sitemap, meta titles/descriptions on all live pages |
| CMS | Continued use of TinaCMS. New marketing pages editable by non-developers |
| Privacy / Compliance | PCI SAQ-A documentation. HIPAA-aware data handling at the wellness-app seam. Privacy Policy + ToS rewritten (P5). Cookie consent added if not already present |
| Hosting | Continue on Vercel. Staging environment for client review |
| Mobile-first | All deliverables designed and tested mobile-first |

#### Slice 1 — Acceptance for go-live (Jul 31, 2026)

- All Slice A defects closed
- End-to-end $149 payment succeeds in live mode (with refund tested)
- HSA/FSA card flagged correctly on receipt
- HubSpot receives correct events with no PHI
- GA4 funnel report renders on a 7-day rolling basis
- WCAG 2.1 AA audit clean (or any open issues triaged with PBH)
- PCI SAQ-A documentation delivered
- Two-day hypercare period (Aug 3–4) covered by VisualBoston

---

### Slice 2 — Fast-follow (Aug 10 – Sep 25)

Editorial and authority assets, built **only after** we're confident the MVP funnel is delivering well.

| # | Deliverable | Notes |
| :--- | :--- | :--- |
| F1 | **Testimonials with video** | Dedicated `/testimonials` page; 6–10 patient stories (mix of video + written). Reusable testimonial card component. Featured testimonials placed contextually (homepage, About, intake confirmation). Care-partner track ("I did this for my mom"). HIPAA-aware (written releases). Video production: see optional content services below |
| F2 | **Interactive Brain Health Journey Map** | Horizontal/vertical timeline across 5 stages (Concern → Assess → Plan → Act → Sustain). Replaces current "How It Works" section. Standalone `/how-it-works` page for direct linking. **Built as a reusable component** so the same primitive powers future families/providers pathway pages in Slice 3. Mobile-first, WCAG 2.1 AA |
| F3 | **Cognitive Self-Screener / Risk Assessment Tool** | 8–12 questions, ~3-minute self-assessment of modifiable risk factors. Built jointly with PBH medical team. Personalized result page → CTA to book the consultation. Optional email capture. HIPAA-aware. Clinically reviewed and approved by PBH medical team before launch |
| F4 | **Blog / Editorial Hub** | Index with category filters, article template, author profile pages, `Article` + `MedicalWebPage` schema, RSS + sitemap. Launches with 8–12 cornerstone articles (content production scoped separately as optional). Replaces the placeholder content from Slice A |
| F5 | **Resource Library** | `/resources` index — Guides (PDF), Checklists, Worksheets, Webinars, Glossary. Gated downloadables → email capture → HubSpot list segmentation |
| F6 | **Navigation & IA Overhaul** | New primary nav: About / How It Works / Resources / For Families / For Providers / Blog / Book Consultation. Mega-menu for Resources. Sticky persistent CTA. Footer rebuild. Breadcrumbs |

### Slice 3 — Conversion optimization (Sep 28 – Nov 6)

Built only after Slice 2 establishes a proven experience to drive traffic to.

| # | Deliverable | Notes |
| :--- | :--- | :--- |
| C1 | **For Families / Care Partners pathway** | Dedicated `/for-families` track. Care-partner-specific testimonials, FAQ, soft-conversion path ("not sure if Mom is ready — get our free family guide") |
| C2 | **For Referring Providers pathway** | `/for-providers` page: clinical methodology one-pager (downloadable), referral form, sample patient report (de-identified), Dr. Bates' CV. Unlocks B2B channel |
| C3 | **Pricing / Membership page** | Standalone `/pricing` page improves SEO and reduces friction. What's included, HSA/FSA language, future membership tiers |
| C4 | **Homepage explainer video** | 60–90 second founder-led video featuring Dr. Bates. Production: see optional content services below |
| C5 | **Hero loop expansion** | Two additional clips (parents with young child; multigenerational family). Footage style consistent with existing loop. Custom shoot strongly preferred over stock |
| C6 | **Press / Social Proof Strip** | Horizontal logo strip beneath hero — "As covered by," credentialing institutions, board affiliations, HSA/FSA badge. Populated as press develops |
| C7 | **Newsletter & Email Nurture System** | Sitewide newsletter signup (footer, blog sidebar, exit-intent on key pages). HubSpot integration. Welcome sequence + 3 evergreen nurture sequences (general prospect, care partner, post-screener) |

---

### Discovery, Design & Build Approach

#### Phase 1: Discovery & Strategy (Week 0–1, before Slice 1 build)

**Objective**: Lock dependencies, contracts, and content windows before the build clock starts on June 1.

**Process**:

- Stakeholder interviews: David (founder), Nina (content), engineering pod lead (handoff contract)
- IA confirmation workshop covering MVP nav + Slice 2 IA overhaul targets
- Analytics baseline read of current site
- **Signed-token handoff contract** drafted jointly with engineering pod
- Content production windows confirmed with Nina against Slice 1 build dates

**Deliverables**:

- Discovery summary doc (stakeholder map, decisions, dependencies)
- Signed-token handoff contract (versioned, in repo)
- **Payment architecture spec** — Stripe integration design covering account setup, MCC verification, Payment Element vs. Checkout decision, Customer-object handoff to the wellness app, receipt template (HSA/FSA-formatted, sent via Postmark), webhook handling, audit log, and the PCI SAQ-A deliverable structure
- Content production calendar
- Updated risk register

#### Phase 2: Design Sprint & Brand Integration (Slice 1: Weeks 1–2; Slice 2: Aug 10–28; Slice 3: Sep 28–Oct 9)

**Process**:

- Component-library extension from the SOW #1 foundation
- Slice-specific page designs in Figma (desktop + mobile)
- AI-assisted mood-board and layout exploration where new visual territory is needed
- Storybook entries for new shared components

**Deliverables**:

- Figma boards per slice (signed off before development)
- Updated component library / design tokens
- Storybook entries for new shared components

**AI Tools Utilized**:

- Generative AI for visual exploration and asset generation
- Claude / ChatGPT for content strategy and UX copy refinement (where VisualBoston is contributing copy)
- AI-powered design tools for rapid layout iterations

#### Phase 3: AI-Accelerated Development (Slice 1: Weeks 2–6; Slice 2: Aug 17–Sep 18; Slice 3: Oct 5–Oct 30)

**Process**:

- **Claude Code** as the primary development workflow for rapid, AI-assisted coding
- Component-first development against the design system
- Progressive enhancement: core layout → form logic → integrations
- Continuous testing: AI-assisted code review, accessibility checks, end-to-end payment-flow tests

**Development Stack** (continued from SOW #1):

- **Frontend**: Next.js 16 (App Router) with TypeScript and React 19
- **CMS**: TinaCMS
- **Hosting**: Vercel
- **Styling**: Tailwind CSS 4 with the established Cognitive Sanctuary token system
- **Payment**: Stripe Checkout (or Elements), Stripe Customer, Stripe Tax
- **Transactional email**: Postmark (recommended)
- **CRM / lifecycle**: HubSpot (event flags, no PHI)
- **Analytics**: GA4 with custom-event funnel

#### Week-by-Week Breakdown (Slice 1)

##### Design Timeline

| Timeline & Services | Description | Output |
| :---- | :---- | :---- |
| **Step 1: Component-library extension** | | |
| Audit V1 component inventory | Identify reusable primitives from SOW #1 and what's missing for the funnel | Component inventory doc |
| Funnel page concepts | Landing page, signup/consent, payment, confirmation — Figma desktop + mobile | Figma — 2 concept rounds |
| **Step 2: High-fidelity & responsive** | | |
| High-fidelity flow + prototype | Click-through Figma prototype of the full funnel | Interactive prototype |
| Responsive variants | Desktop, tablet, mobile breakpoints | Responsive mockups |

##### Development Timeline

| Focus | Description | Output |
| :---- | :---- | :---- |
| **Step 3: AI-Enhanced Web Development** | | |
| Project Setup | Branch from existing repo; staging URL; Stripe / HubSpot / Postmark accounts configured; signed-token contract finalized with engineering pod | Development environment, integration accounts |
| Slice A — V1 Cleanup | Close P1–P8 defects; restyle blog header; remove TinaCMS placeholder content; rewrite ToS / Privacy / NPP | All P1–P8 closed on staging by Jun 12 |
| Landing Page Build | Funnel landing page using Claude Code; reusable hero, trust-signal, FAQ blocks | Production-ready landing page |
| Account, Consent & Payment | Account creation, versioned wellness consent + HIPAA NPP, Stripe Checkout with HSA/FSA, refund policy, audit log | Production-ready funnel core |
| Confirmation + Handoff | Confirmation page with receipt summary; signed-token redirect to wellness app; PBH-supplied reassurance copy | Production-ready confirmation + handoff |
| Integrations (GA4 / HubSpot / Postmark) | Event firing, HubSpot lifecycle update on `payment_succeeded`, transactional email templates (receipt, abandonment 1h, abandonment 24h, resume link) | Integrated funnel with full event coverage |
| CMS Setup | TinaCMS schemas updated for any new marketing pages; PBH team can edit copy independently | Updated TinaCMS schemas |
| SEO (baseline) | `Organization` + `MedicalWebPage` schema, XML sitemap, meta titles/descriptions, OG tags | SEO implementation |
| Compliance Documentation | PCI SAQ-A documentation; HIPAA-aware handoff documented; consent versioning documented | PCI SAQ-A docs, compliance write-up |
| Testing & QA | End-to-end test mode + live mode payment, refund test, webhook idempotency, WCAG audit, Lighthouse, cross-browser | QA reports, accessibility audit |
| Launch | Go-live by Jul 31, 2026 | Live funnel |
| Hypercare | Two-day soft-launch hypercare Aug 3–4 with engineer on call | Hypercare incident log |
| Training & Documentation | PDF guides and Loom videos covering TinaCMS edits, HubSpot dashboard reading, Stripe dashboard reading | PDF docs, Loom videos |

#### Gantt Overview (Slice 1)

| | Jun 1 | Jun 8 | Jun 15 | Jun 22 | Jun 29 | Jul 6 | Jul 13 | Jul 20 | Jul 27 |
| :---- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| | Wk 1 | Wk 2 | Wk 3 | Wk 4 | Wk 5 | Wk 6 | Wk 7 | Wk 8 | Wk 9 |
| **Design** | | | | | | | | | |
| Component-lib extension | ● | ● | | | | | | | |
| High-fi flow + prototype | | ● | ● | | | | | | |
| **Development** | | | | | | | | | |
| Slice A — V1 Cleanup | ● | ● | | | | | | | |
| Landing page | | ● | ● | ● | | | | | |
| Account / consent / payment | | | ● | ● | ● | ● | | | |
| Confirmation + handoff | | | | | ● | ● | | | |
| Integrations (GA4 / HubSpot / Postmark) | | | | ● | ● | ● | ● | | |
| Compliance docs (PCI SAQ-A) | | | | | | ● | ● | ● | |
| QA, accessibility, Lighthouse | | | | | | | ● | ● | |
| UAT + launch | | | | | | | | ● | ● |
| Hypercare (Aug 3–4) | | | | | | | | | (next week) |

### Quality Assurance

**Automated Testing**:

- AI-assisted code review and bug detection
- Automated accessibility testing
- Performance monitoring and optimization
- Cross-device compatibility validation
- End-to-end Stripe payment-flow testing (test mode + live mode)
- Webhook reliability and idempotency testing

**Design Consistency**:

- AI-powered design system compliance checking
- Responsive design validation across breakpoints
- Token-system compliance audit

### Feedback & Iteration Process

**Rapid Feedback Loops**:

- Progress updates with live preview links via staging environment
- AI-assisted change implementation (minor updates can be made in minutes)
- Real-time collaboration through shared development environments

**Client Collaboration**:

- Weekly check-ins with live demo of progress
- Shared Figma workspace for design feedback
- Staging environment for content review and testing
- Final approval checkpoints at end of each slice (Slice 1: weeks 2 and 9)

## 4. Feedback & Approval Process

Design concepts are presented in Figma for review and feedback. A key stakeholder from PBH provides **written sign-off in Figma** before we proceed from design to development on each slice.

## 5. Change Orders & Additional Work

To maintain efficiency, this estimate includes **2 rounds of revisions** per design mockup. Additional revisions beyond this scope are billed at **$120/hr**.

Mid-slice scope changes are scoped, priced, and added as written change orders. Scope changes that compromise the Jul 31 go-live commitment are flagged immediately and resolved jointly before work begins.

## 6. Not Included

The following services are **NOT** included in this scope of work. If you'd like to include any of these services, let us know and we'll update this document.

### Owned by PBH's engineering pod (out of scope here)

- The wellness app itself, BHN dashboard, assessment runner, and intake gate
- Athena (clinical EMR) handoff and any clinical-consent capture inside the wellness app
- Telehealth video links and their delivery emails (sent from the wellness app)
- Clinical scheduling embed inside the authenticated wellness app (VisualBoston only confirms the redirect contract)

### Out of scope for Slice 1 (deferred or product-side)

- SSO (Google, Apple)
- Insurance collection at signup (handled later, inside the wellness app)
- Multi-user / family accounts
- HIPAA-covered storage of PHI on PBH servers — Slice 1 deliberately keeps PHI out of the website tier
- Custom Stripe Connect, marketplace, or split-payments logic (single $149 charge only)
- Advanced article schema, FAQPage schema, internal-linking strategy beyond `Organization` + `MedicalWebPage` baseline (deferred to Slice 2)

### Marketing Collateral

- Social media design
- Exhibition design
- Posters and various print materials

### Website

- UX copywriting for Slice 1 (Nina at PBH owns consumer-facing copy for the MVP slice)
- Advanced SEO Strategy
  - Content Strategy: topic clusters, content authority building, content refreshes
  - Link Building: strategic guest posting, digital PR, broken-link building
  - UX and Search Intent Optimization: deeper mobile, site-architecture, and search-intent work
  - Schema markup / structured data beyond the baseline + Slice 2 article/FAQ additions
  - **Note**: For strategic SEO we'd be happy to connect you with a trusted partner that specializes in the above
- Extended licenses for stock photos, videos, illustrations, icons, or graphics
- Personalization and internationalization features
- Global search functionality
- Spanish-language site (architected for, not built — see future state)

### Animations & Illustrations

- Custom illustrations — we'll use a mixture of generative AI and stock images / illustrations

### Optional content services (separate line items in §9)

The RFP asks whether VisualBoston handles content production. We propose these as optional line items, separately priced, so PBH can elect or decline each:

- 8–12 cornerstone blog articles (1,200–2,000 words each), clinically reviewed
- Founder explainer video (1) + patient testimonials (3–5) + care-partner testimonial (1) — we partner with a videographer for on-camera shoots and bring the partner in under VisualBoston coordination
- Resources: 3 PDF guides, 2 checklists, 1 glossary, 1 recorded webinar
- Photography: team headshots (to replace stock on About page); one branded photoshoot for hero/section imagery
- Screener content: question bank, scoring logic, result-page copy (jointly developed with PBH medical team)
- Email sequences: welcome + 3 nurture flows (copywriting)

### Phase 3 / Future State (architect for, not in scope)

These are preserved in the RFP and architected for, but not built in this engagement:

- Patient Portal / Member Login
- Live chat / scheduling widget (Calendly or similar embedded in the marketing site)
- Provider Directory (when network grows)
- Outcome Dashboard (anonymized aggregate outcomes)
- Spanish-language site
- Podcast integration
- Annual research report / white paper

We are happy to provide separate estimates for any additional work that arises throughout the project.

**Future-Proofing Note**: Architectural and technical decisions are made with PBH's stated future plans in mind so the foundation supports member login, provider directory, live chat, and Spanish-language expansion without significant rework.

## 7. Assumptions

**VisualBoston**

- VisualBoston works closely with PBH stakeholders weekly using shared Slack channels and comments in Figma
- 1 remote meeting per week for check-ins and progress review
- High-resolution stock imagery from the following sources is included at no extra cost:
  - [https://pexels.com](https://pexels.com)
  - [https://unsplash.com/](https://unsplash.com/)
  - **Important Note**: Stock assets from these sources are primarily intended for digital use on the website. Usage beyond the website (print, large-format displays) may require additional licensing and extra costs. The client is responsible for any extended licenses needed. We strongly recommend reviewing licensing terms for each asset, especially for any Midjourney-generated images, before non-website use
- Work is managed through VisualBoston's project management tool
- Testing — we use the following tools to ensure a high-quality end product:
  - Google Lighthouse, PageSpeed Insights, Core Web Vitals — average score across 4 incognito-mode runs, targeting 80+ on the landing page (90+ Performance on mobile)
  - Stripe test-mode end-to-end transaction suite for payment flow
  - axe / Lighthouse accessibility for WCAG 2.1 AA
- Browser Compatibility — we test the following:

| Browser | Versions | Release Notes |
| :---- | :---- | :---- |
| Google Chrome | Latest + one version back | [https://developer.chrome.com/release-notes](https://developer.chrome.com/release-notes) |
| Mozilla Firefox | Latest + one version back | [https://www.mozilla.org/en-US/firefox/releases/](https://www.mozilla.org/en-US/firefox/releases/) |
| Microsoft Edge | Latest + one version back | [https://learn.microsoft.com/en-us/deployedge/microsoft-edge-release-schedule](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-release-schedule) |
| Apple Safari | Latest + one version back | [https://developer.apple.com/documentation/safari-release-notes](https://developer.apple.com/documentation/safari-release-notes) |

- There are no holidays observed by VisualBoston during this SOW

**Primary Brain Health**

- PBH stakeholders are available to answer questions and participate in weekly check-ins
- **Content for Slice 1 is owned by Nina Zhang (PBH)** — landing-page copy, FAQ, consent text drafts (for counsel review), form labels, error states, refund policy, and receipt email delivered by the windows in the timeline above
- A key stakeholder from PBH provides written sign-off in Figma before we proceed to development on each slice
- PBH provides counsel review for the rewritten Terms of Service, Privacy Policy, and HIPAA Notice of Privacy Practices in time for Slice 1 launch
- PBH provides the field mapping for HubSpot lifecycle stages and any custom properties
- **PBH's engineering pod** is available during Slice 1 discovery to co-define the signed-token handoff contract (token format, signing key, expected redirect URL, error paths). VisualBoston cannot ship the funnel without this contract closed
- PBH provisions any BAAs required for transactional email (Postmark) and confirms HIPAA-eligible HubSpot configuration (no PHI rule)
- Existing accounts continue to be used:
  - GitHub (`dbates-commits`) — repo already in use
  - Vercel — already deployed
  - TinaCMS (`dbates@primarybrainhealth.com`) — already in use
  - Domain (`www.primarybrainhealth.com`) — registered at Northwest Registered Agent; DNS access available
- PBH provisions new accounts as needed:
  - Stripe account (Standard) with HSA/FSA card acceptance enabled
  - Postmark account (or alternate) with appropriate sender authentication
  - HubSpot account configuration verified for no-PHI fields
- PBH is responsible for ongoing costs:
  - TinaCMS plan ($29/month or $24/month billed annually) if upgrading from free tier
  - Vercel hosting if upgrading from current tier
  - Stripe transaction fees
  - Postmark (or alternate) monthly send volume
  - HubSpot subscription

## 8. Team

| Role | Focus |
| :---- | :---- |
| Senior Product Designer (**Alec Harrison**) | Design lead across all three slices — component library, page design, design-system enforcement |
| Senior Frontend Engineer (**Mark Stenquist**) | Engineering lead — funnel build, Stripe / HubSpot / Postmark integrations, signed-token handoff, compliance documentation |
| {{ADDITIONAL_TEAM_MEMBER if applicable — e.g., a second engineer for Slice 1 compliance work, or content/video partner for Slices 2–3}} | {{Focus}} |

### Responses to RFP §8 questions

The RFP asks several diligence questions. Addressed here for the record:

- **July 31 fixed go-live**: Yes, committed as a fixed date, contingent on (a) signed contract by {{CONTRACT_SIGN_BY_DATE}}, (b) signed-token handoff contract closed with engineering pod by end of discovery, and (c) Nina's content windows met per §7. We will surface any of these at risk no later than weekly check-ins.
- **HIPAA-experienced project leads**: {{Mark to confirm — recommend listing prior healthcare engagements that touched consent capture, HIPAA-aware data handling, or BAA-covered vendor integrations}}
- **PCI SAQ-A documentation prior work**: {{Mark to confirm — recommend listing prior Stripe Checkout SAQ-A engagements, plus a one-paragraph description of the SAQ-A documentation deliverable format}}
- **Stripe HSA/FSA card handling**: We've worked with HSA/FSA-eligible flows. Key gotchas we'll handle: (1) HSA/FSA card detection on the Stripe Customer object so receipts can be flagged correctly, (2) receipt formatting that matches HSA/FSA reimbursement-submission expectations (date, provider, service description, amount, payment method last-4), (3) explicit non-medical-evaluation language on the receipt to prevent reimbursement-rejection edge cases. {{Mark to confirm with any prior client examples}}
- **TinaCMS at this scale vs. Sanity / Contentful / Payload**: Our recommendation is to **stay on TinaCMS for Slice 1** — the migration cost outweighs the benefit when the August launch date is non-negotiable, and the new MVP pages are not content-heavy. **Revisit at the end of Slice 2** when the blog hub and resource library are landing real volume — that's the right inflection point to evaluate Sanity or Payload if Tina's editor experience strains. We'll capture concrete editor-experience and performance signals during Slice 2 to inform the decision; the call can be made before Slice 3.
- **Journey Map reusability**: Yes — the Journey Map is designed as a reusable component, with the families/providers pathways in Slice 3 using the same primitive with different content. This is reflected in the F2 description above.
- **Video testimonial production**: We partner with a videographer rather than producing in-house, coordinated under VisualBoston so PBH has a single point of contact. Production is scoped as an optional line item in §9.
- **Ongoing monthly support post-launch**: We offer a post-launch retainer at {{$RATE_OR_HOURS_PER_MONTH}} covering: CMS support, content updates beyond CMS reach, dependency updates, security patches, light feature work, and monitoring incident response. Out-of-retainer work billed at $120/hr. We can scope this as a separate engagement starting Aug 5, 2026 — or roll it together with Slices 2 and 3.

## 9. Pricing & Payment Terms

**Modular by slice**. Each slice is priced independently. PBH may approve Slice 1 in isolation and decide on Slices 2 and 3 after MVP go-live.

### Slice 1 — MVP (Jun 1 – Jul 31)

Fixed-fee structure with milestone-based invoicing. Time-and-materials with a cap is available on request.

| Invoice # | Description | Terms | Send Date | Amount |
| :---- | :---- | :---- | ----: | ----: |
| 1 | Slice 1 — Discovery complete + design kickoff | Net 14 | {{~May 20, 2026}} | $ {{S1_INV1}} |
| 2 | Slice 1 — Slice A defects closed (Jun 12) + funnel design signed off | Net 14 | {{~Jun 15, 2026}} | $ {{S1_INV2}} |
| 3 | Slice 1 — Funnel core live in staging (account, consent, payment, handoff) | Net 14 | {{~Jul 10, 2026}} | $ {{S1_INV3}} |
| 4 | Slice 1 — Go-live + PCI SAQ-A documentation delivered | Net 14 | {{~Jul 31, 2026}} | $ {{S1_INV4}} |
| | | | **Slice 1 total:** | **$ {{S1_TOTAL}}** |

### Slice 2 — Fast-follow (Aug 10 – Sep 25)

| Invoice # | Description | Terms | Send Date | Amount |
| :---- | :---- | :---- | ----: | ----: |
| 5 | Slice 2 — Discovery + design signed off (testimonials, journey map, screener, blog hub, resources, IA) | Net 14 | {{~Aug 28, 2026}} | $ {{S2_INV1}} |
| 6 | Slice 2 — Build in staging | Net 14 | {{~Sep 18, 2026}} | $ {{S2_INV2}} |
| 7 | Slice 2 — Go-live | Net 14 | {{~Sep 25, 2026}} | $ {{S2_INV3}} |
| | | | **Slice 2 total:** | **$ {{S2_TOTAL}}** |

### Slice 3 — Conversion optimization (Sep 28 – Nov 6)

| Invoice # | Description | Terms | Send Date | Amount |
| :---- | :---- | :---- | ----: | ----: |
| 8 | Slice 3 — Discovery + design signed off | Net 14 | {{~Oct 9, 2026}} | $ {{S3_INV1}} |
| 9 | Slice 3 — Build in staging | Net 14 | {{~Oct 30, 2026}} | $ {{S3_INV2}} |
| 10 | Slice 3 — Go-live | Net 14 | {{~Nov 6, 2026}} | $ {{S3_INV3}} |
| | | | **Slice 3 total:** | **$ {{S3_TOTAL}}** |

### Optional content services (separately priced line items)

| Line item | Description | Estimate |
| :---- | :---- | ----: |
| 8–12 cornerstone blog articles (1,200–2,000 words each, clinically reviewed) | Editorial production for Slice 2 blog hub | $ {{CONTENT_BLOG}} |
| Founder explainer video (1) | 60–90 second on-camera production with founder, partner videographer | $ {{CONTENT_FOUNDER_VIDEO}} |
| Patient testimonials video (3–5) + care-partner testimonial (1) | On-camera shoots, partner videographer | $ {{CONTENT_TESTIMONIALS}} |
| Resources: 3 PDF guides, 2 checklists, 1 glossary, 1 recorded webinar | Editorial + light design for Slice 2 resource library | $ {{CONTENT_RESOURCES}} |
| Photography: team headshots + 1 branded photoshoot | Replace stock About-page imagery; new hero / section imagery | $ {{CONTENT_PHOTO}} |
| Screener content (joint with PBH medical team) | Question bank, scoring logic, result-page copy | $ {{CONTENT_SCREENER}} |
| Email sequences: welcome + 3 nurture flows | Copywriting for the Slice 3 newsletter system | $ {{CONTENT_EMAIL}} |

### Optional post-launch retainer (starting Aug 5, 2026)

| Tier | Description | Monthly |
| :---- | :---- | ----: |
| Retainer | {{HOURS_PER_MONTH}} hours / month — CMS support, dependency updates, security patches, light feature work, monitoring incident response. Out-of-retainer work billed at $120/hr | $ {{RETAINER_MONTHLY}} |

### Engagement total

| | Amount |
| :---- | ----: |
| Slice 1 — MVP | $ {{S1_TOTAL}} |
| Slice 2 — Fast-follow | $ {{S2_TOTAL}} |
| Slice 3 — Conversion optimization | $ {{S3_TOTAL}} |
| **Subtotal (slices 1–3, optional services excluded)** | **$ {{ENGAGEMENT_TOTAL}}** |

**Invoice Schedule**: This engagement follows a milestone-based billing structure. Invoices are issued upon completion of each milestone. Depending on when milestones are accomplished, invoices may be sent separately or combined. Payment is due within 14 days (Net 14).

### Payment & Delay Policies

**Client Feedback Timeline**: If feedback is delayed by more than 5 business days, the next milestone payment will be invoiced to maintain project momentum. For Slice 1, a feedback delay that puts the Jul 31 go-live at risk triggers an immediate joint working session to recover.

**Late Payment Penalty**: 1% per month on overdue invoices, not exceeding 12% per annum.

**Project Pause Clause**: If inactive for more than 30 days due to client delays, a $1,500 restart fee may apply to resume work.

