> **Revised June 1, 2026.** This SOW updates the signed agreement with the reworked Phase 2 / Phase 3 scope and the timeline rebaselined to the June 1 start. Phase 1 scope and fee are unchanged. A summary of what changed accompanies this document.
s
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
10. [Appendix - Diligence Reference (RFP Section 8 Responses)](#10-appendix---diligence-reference-rfp-section-8-responses)

## 1. Overview

Primary Brain Health (PBH) is a virtual-first proactive brain health service. SOW #1 delivered the V1 landing page that established the brand and captured leads. SOW #2 turns that landing page into the live consumer funnel for PBH's $149 wellness assessment → Brain Health Navigator (BHN) consult → primary-care handoff product, in time for soft launch on **August 17, 2026**. After launch, the engagement extends into the editorial / authority and conversion-optimization assets that grow the funnel.

This engagement is structured as **three modular phases** so PBH can sequence investment and any one phase can be re-scoped without breaking the others:

| Phase                                 | Outcome                                                                                                                                                      | Window                |
| :------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------- |
| **Phase 1 - MVP**                     | Live consumer funnel supporting the $149 → BHN → handoff flow, with PCI-compliant payment                                                                    | Jun 1 – Aug 14, 2026  |
| **Phase 2 - Fast-follow**      | Operational tooling + Eisai-ready surfaces: BHN scheduling page, BHN-facing dashboard, cohort/waitlist mechanics, Eisai transitional landing + co-branded results, testimonials, lighter Nav/IA. Editorial deferred to Phase 3      | Aug 24 – Oct 9, 2026 |
| **Phase 3 - Conversion optimization** | Marketing-conversion levers + relocated editorial: families pathway, providers pathway, pricing, founder explainer video, hero loop, press strip, newsletter - plus Brain Health Journey Map, Cognitive Self-Screener, Blog Hub, Resource Library (relocated from Phase 2) | Oct 12 – Nov 20, 2026  |

Each phase is priced independently. PBH may approve Phase 1 in isolation and decide on Phases 2 and 3 after MVP go-live based on what the funnel is telling us.

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

##### Editorial Authority & Top-of-Funnel Growth (Phases 2 & 3)

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
- `Article` and `FAQPage` schema added with the blog hub and journey map in Phase 2
- Mobile-first development for optimal search rankings

#### Innovation & Timeline Acceleration

##### AI-Powered Development Methodology

- Continued use of AI-assisted design and coding workflows (Claude Code, generative design tools) as established in SOW #1
- Accelerated timelines per phase without sacrificing quality, supported by AI-assisted code review, accessibility checks, and test generation
- Rapid prototyping and iteration cycles that maximize client feedback opportunities

| Total Weeks (all phases) | Anticipated Start Date | End Date |
| :---: | :---: | :---: |
| ~22 weeks across 3 phases | ~Jun 1, 2026 (discovery + specialist sourcing) | Nov 20, 2026 |

## 2. Project Timeline

This engagement runs across three sequenced phases. The dates below are **committed dates** for Phase 1; Phases 2 and 3 are committed to their windows assuming sign-off on each at the prior phase's wrap.

### Phase 1 - MVP (Jun 1 – Aug 14, 2026)

| Phase                                       | Window            | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| :------------------------------------------ | :---------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Compliance specialist sourcing              | Jun 1 – Jun 15    | VisualBoston sources, interviews, contracts, and onboards subcontracted HIPAA/PCI specialist in parallel with discovery. Specialist begins work on Jun 15 Phase 1 kickoff.                                                                                                                                                                                                                                                                                                                                       |
| Discovery & strategy                        | Jun 1 – Jun 12   | Compressed to ~2 weeks given August launch dependency. Kickoff with David (founder), content/data inventory, analytics baseline, scope confirmation, signed-token handoff contract draft co-authored with PBH product team + specialist. RFP is already detailed - discovery synthesizes it into a decision doc rather than re-interviewing the same scope.                                                                                                                                                     |
| Design                                      | Jun 8 – Jun 26   | Component-library extension from V1; landing page, signup/consent/payment, confirmation/handoff page. Desktop + mobile in Figma                                                                                                                                                                                                                                                                                                                                                                                 |
| Build - Workstream B (funnel)               | Jun 22 – Aug 7    | Landing page, account/consent, Stripe payment with HSA/FSA, confirmation page, signed-token handoff                                                                                                                                                                                                                                                                                                                                                                                                             |
| Build - Workstream C (integrations)         | Jul 6 – Aug 7   | GA4 events, HubSpot lifecycle, transactional email, webhook hardening                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Compliance documentation                    | Jun 22 – Aug 7    | Specialist authors PCI SAQ-A artifacts (network diagram, cardholder inventory, full questionnaire), coordinates AoC, advises on Neon BAA execution                                                                                                                                                                                                                                                                                                                                                              |
| QA, accessibility audit, UAT                | Aug 3 – Aug 13   | E2E Playwright suite, live-mode payment test, refund flow, webhook chaos testing, light load test, WCAG audit (axe + manual + screen reader), Lighthouse, email-rendering QA, real-device mobile                                                                                                                                                                                                                                                                                                                |
| **MVP go-live**                             | **Aug 14, 2026**  | Gating commitment                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Hypercare                                   | Aug 17 – Aug 18     | Two-day soft-launch hypercare - Mark on call 8h/day; specialist on standby for any compliance question                                                                                                                                                                                                                                                                                                                                                                                                          |
| **Phase 1 → Phase 2 re-scoping checkpoint** | **Aug 17 – Aug 21** | Formal 1-week review window. VisualBoston + PBH review actual funnel data (conversion, channel mix, drop-off, early cohort signals), Eisai engagement state, and any parallel-track shifts. Output: re-scoped Phase 2 brief signed off by both parties, locking which deliverables (editorial expansion / conversion optimization / partner-routing) get prioritized inside the original Aug 24 – Oct 9 window and the existing $36,750 fee envelope. Any net-new scope flows through change-order at $150/hr. |

### Phase 2 - Fast-follow (Aug 24 – Oct 9, 2026)

| Phase                                                                                           | Window          |
| :---------------------------------------------------------------------------------------------- | :-------------- |
| Design (testimonials, journey map, screener, blog hub, resource library, IA / nav overhaul)     | Aug 24 – Sep 11 |
| Build                                                                                           | Aug 31 – Oct 2 |
| Content production (testimonial shoots, cornerstone articles - if elected as optional services) | Aug 31 – Oct 2 |
| QA, accessibility, launch                                                                       | Oct 6 – Oct 9 |

### Phase 3 - Conversion optimization (Oct 12 – Nov 20, 2026)

| Phase                                                                          | Window         |
| :----------------------------------------------------------------------------- | :------------- |
| Design (families, providers, pricing, press strip, newsletter system)          | Oct 12 – Oct 23 |
| Build                                                                          | Oct 19 – Nov 13 |
| Founder explainer video + hero loop additions (production scoped or partnered) | Oct 19 – Nov 13 |
| QA, accessibility, launch                                                      | Nov 16 – Nov 20  |

This timeline assumes timely feedback at each checkpoint and that PBH-owned copy and consent text arrive within the windows in Section 7.

## 3. Scope of Work & Deliverables

This engagement covers the design, build, integration, and launch of three modular phases. Phase 1 is the gating engagement for the August soft launch; Phases 2 and 3 build on the same foundation.

### Phase 1 - MVP (Jun 1 – Aug 14)

#### Funnel Build (Weeks 2–6)

##### Landing page (top of funnel)

A first-time visitor understands what they get for $149 and how to start within 30 seconds.

- Single-page hero with the value prop in plain language: brain-health assessment, personalized action plan, and a 30-minute consult with a Brain Health Navigator
- Visible **$149** price with what is and is not included
- Trust signals: Linus Health platform, MIM clinical partner, brief BHN team credentials (Brook Health, Eli Health, Isaac Health, Synapticure, Sunday Health, Neurocode - final list confirmed with PBH)
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
- Wellness consent (distinct from clinical consent - clinical happens later in the wellness app); covers data use, BHN role boundary, "this is not a medical evaluation"
- HIPAA Notice of Privacy Practices linked and acknowledged
- Both consents timestamped and persisted with version numbers (consents are versioned artifacts)

**Payment - PCI-compliant, HSA/FSA-aware** (powered by **Stripe**):

- Stripe Payment Element for $149 cash-pay - embedded, branded, single component covering cards + Apple Pay + Google Pay + Link. Hosted iframe keeps us on the PCI SAQ-A path
- HSA/FSA cards explicitly supported (critical given PBH's HSA/FSA-eligibility positioning); HSA/FSA card flagged correctly on the receipt. Requires correct merchant-category coding on the Stripe account - verified during discovery
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
- Token format and signing key co-defined with PBH's product team during discovery
- **VisualBoston's deliverable ends at the Stripe success → wellness app redirect.** The systems on the other side of that redirect are owned by PBH (separate vendor TBD or internal team):

  | System | What it is | Owned by |
  | :---- | :---- | :---- |
  | **Wellness app** | The post-payment application users land in after Stripe success. Hosts the cognitive assessment session, results, BHN consult scheduling, and the rest of the post-purchase product experience. | PBH (vendor TBD) |
  | **BHN dashboard** | Internal staff-facing tool the Brain Health Navigator (BHN) uses to manage their patient queue, review assessment results, document consult notes, and schedule follow-ups. Patient-facing wellness app and staff-facing BHN dashboard are separate surfaces. | PBH (vendor TBD) |
  | **Assessment runner** | The cognitive testing software itself - administering the neurocognitive battery, scoring responses, generating result visualizations. Likely a Linus Health platform integration (referenced in the trust signals). | PBH (likely Linus Health platform) |
  | **Intake gate** | The system that validates the signed handoff token from the funnel, checks clinical eligibility (state of residence, BHN program eligibility), and routes the user into the assessment session. The first thing the wellness app does on token receipt. | PBH (vendor TBD) |
  | **Athena handoff** | EMR integration that sends patient context to the partner clinic's athenahealth EMR (MIM in Pennsylvania, Cognoa PC in California) when a clinical referral is warranted. This is a clinical-EMR data exchange, not a website feature. | PBH (vendor TBD) |

  VisualBoston's responsibility on the seam: ship a working signed-token redirect, co-define the token contract, and document the handoff format. We do not build, host, or operate any of the post-redirect systems.

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
- Brief reassurance copy ("you're in the right place") - copy supplied by PBH (Nina)

#### Integrations (Weeks 4–6)

| Integration | Requirement |
| :---- | :---- |
| Analytics - GA4 | Events fired for: `landing_viewed`, `cta_primary_clicked`, `cta_secondary_clicked`, `faq_opened`, `signup_started`, `signup_completed`, `wellness_consent_signed`, `payment_started`, `payment_succeeded`, `payment_failed`. Funnel report: homepage → `payment_succeeded` |
| HubSpot | Lead created on `signup_started`; lifecycle stage updated on `payment_succeeded` to `paid`. **No PHI passes to HubSpot - only event flags.** VisualBoston implements the integration; PBH provides field mapping |
| Transactional email | VisualBoston recommends **Resend** as primary (modern API designed for the Next.js + Vercel stack, React Email native templating in TypeScript, BAA available on Pro tier, strong deliverability backed by AWS SES infrastructure). Postmark or SES acceptable alternates. PBH provisions BAA if required. Templates: receipt, 1-hour abandonment recovery, 24-hour abandonment recovery, assessment resume link |
| Wellness app handoff | Signed-token redirect from website → wellness app on `payment_succeeded`. Token format and signing key co-defined with PBH's product team |
| BHN scheduling embed (placeholder) | Website reserves and routes to the eventual BHN scheduling page; actual scheduling embed (HubSpot Meetings or Calendly) lives inside the wellness app behind login. VisualBoston confirms the redirect contract |
| Telehealth link delivery | **Out of scope for the website** - telehealth links are sent from the wellness app. VisualBoston confirms the email-template ownership boundary |

#### Cross-cutting requirements (Phase 1)

| Area | Requirement |
| :---- | :---- |
| Brand | Strict adherence to existing brand palette. No off-brand gradients. Typography system documented |
| Accessibility | WCAG 2.1 AA conformance on all new pages and components. Full testing approach in subsection below. |
| Performance | 90+ Lighthouse Performance on mobile for the landing page. Lazy-load below-fold imagery |
| SEO (baseline) | `Organization` + `MedicalWebPage` schema, XML sitemap, meta titles/descriptions on all live pages |
| CMS | Continued use of TinaCMS. New marketing pages editable by non-developers |
| CMS docs | Self-serve documentation: written guide (Google Doc / Notion, with screenshots, organized by content type) + 2-3 short Looms (5-10 min each) covering the most common edit workflows. No live training - PBH content team can work through the guide + Looms at their own pace. Matt-led, Mark-reviewed for technical accuracy. Async Slack support for follow-up questions. Guide is a living asset - updated with an addendum at each phase as new content types ship (testimonials, journey map, blog, etc. in Phase 2; newsletter + pathway pages in Phase 3). Final guide handed off as a complete self-serve asset at end of Phase 3. |
| Privacy / Compliance | PCI SAQ-A documentation (authored by HIPAA/PCI specialist). HIPAA-aware data handling at the wellness-app seam. PBH counsel delivers Privacy Policy + ToS + NPP content; VisualBoston wires into pages (P5). Cookie consent banner added with accept / decline / preferences. |
| Hosting | Continue on Vercel. Staging environment for client review |
| Mobile-first | All deliverables designed and tested mobile-first |

#### Accessibility approach (Phase 1)

PBH is a healthcare-adjacent product and the funnel handles payment - accessibility isn't optional, it's table stakes. Here's what we actually do:

**Conformance target:** WCAG 2.1 Level AA across all new pages and components. (WCAG 2.2 AA and AAA are out of scope - see Section 6.)

**Specific criteria covered:**

- Color contrast 4.5:1 for text, 3:1 for UI components and meaningful graphics
- Keyboard accessibility across the entire funnel - Tab order, focus visibility, no keyboard traps, all interactive elements reachable
- Alt text on all meaningful imagery (decorative imagery explicitly marked)
- Form labels associated with controls; error messages announced by screen readers
- Focus indicators visible on all interactive elements (default browser focus is not sufficient - we use custom indicators)
- ARIA roles + labels on dynamic content (modals, dropdowns, validation messages, live regions)
- Heading hierarchy structured for screen-reader navigation
- Skip links to bypass repetitive navigation
- Reduced-motion respected (`prefers-reduced-motion` for hero loop, journey map animations)
- Text resize to 200% without loss of content or function

**Testing approach (per surface):**

- **Automated** - axe + Lighthouse accessibility scans on every PR via CI integration. Findings triaged as Blocker / Serious / Moderate.
- **Manual keyboard pass** - Tab through every interactive surface. Verify focus order, focus visibility, keyboard traps absent. (Matt-led, see PM + Manual QA scope.)
- **Manual screen-reader pass (desktop)** - macOS VoiceOver + Windows NVDA. Critical surfaces tested: landing page, full funnel (signup → consent → payment → confirmation), confirmation/handoff transition.
- **Mobile screen-reader pass** - iOS Safari VoiceOver on real device (BrowserStack). Especially important given 60%+ mobile traffic.
- **Forms-specific testing** - announcement of labels, error states, and validation messages with screen reader. Tested in both happy path and sad path (declined payment, expired token, etc.).
- **Color contrast verification** - design-time check (Stark / Figma plugin) + automated scan at build time.

**Per-fix verification cycle** (matches industry-standard remediation pattern):

1. Automated re-scan to confirm finding resolved
2. Manual keyboard re-test
3. Manual screen-reader re-test (desktop + mobile if relevant)
4. Logged in the accessibility remediation log

**Documentation produced:**

- **Accessibility remediation log** - dated record of every finding identified during build + verification, mapped to WCAG criterion + remediation status
- **WCAG 2.1 AA conformance statement** - VisualBoston-attested at end of Phase 1 listing the criteria covered, testing approach, and any known exceptions accepted with PBH sign-off

**Note**: This is a self-attestation, not a formal third-party WCAG audit. For higher legal weight (e.g., if PBH wants to publish a public accessibility statement or has accessibility legal exposure), we'd recommend a formal third-party audit (Fable Page Audit, Deque, TPGi) as an optional add-on - see Section 6.

#### Phase 1 - Acceptance for go-live (Aug 14, 2026)

- End-to-end $149 payment succeeds in live mode (with refund tested)
- HSA/FSA card flagged correctly on receipt
- HubSpot receives correct events with no PHI
- GA4 funnel report renders on a 7-day rolling basis
- WCAG 2.1 AA audit clean (or any open issues triaged with PBH)
- PCI SAQ-A documentation delivered
- Two-day hypercare period (Aug 17–18) covered by VisualBoston

---

### Phase 2 - Fast-follow (Aug 24 – Oct 9)

Editorial and authority assets, built **only after** we're confident the MVP funnel is delivering well.

**Phase 2 pivots from editorial → operational tooling + Eisai-ready surfaces.** In line with the agreed Phase 2 priorities, the editorial deliverables relocate to Phase 3 and Phase 2 absorbs operational tooling that supports the BHN-led conversion model and the Eisai cohort surfaces.

| # | Deliverable | Notes |
| :--- | :--- | :--- |
| F1 | **Testimonials with video** | Dedicated `/testimonials` page; 6–10 patient stories (mix of video + written). Reusable testimonial card component. Featured testimonials placed contextually (homepage, About, intake confirmation). Care-partner track ("I did this for my mom"). HIPAA-aware (written releases). Partially reusable for the Eisai cohort variant. Video production: see optional content services below |
| N1 | **BHN scheduling page (`/talk-to-a-navigator`)** *(new)* | Public-facing scheduling page embedding HubSpot Meetings with cohort-aware routing (`?cohort={pbh-paid\|eisai-sponsored\|bbva-sponsored}&user_id={hashed}`). Outcome-tagged links for funnel-by-cohort reporting. Reachable from cockpit "You're Finished" page **and** from primary CTA in emailed PDF report. The conversion moment between assessment completion and BHN consult - where conversion economics live |
| N2 | **BHN-facing lightweight dashboard** *(new)* | Read-only view of today's BHN queue: results-delivered-not-yet-booked, upcoming consults, post-consult handoff status. Built on HubSpot saved views + minimal wrapper styling - **scope-bounded to read-only presentation; not a custom CRUD UI**. Any heavier internal-tool needs (note-taking, multi-step workflows) are Phase 3 change orders |
| N3 | **Cohort segmentation + waitlist mechanics in HubSpot** *(new)* | Distinct HubSpot lists per cohort (`pbh-paid`, `eisai-sponsored`, `bbva-sponsored`). Public waitlist page (`/talk-to-a-navigator/waitlist`) with toggleable kill-switch routing (no-deploy feature flag controllable by PBH ops). The surge release valve: throttle the Eisai cohort first; the PBH paid cohort never sees the waitlist. Cohort-aware routing logic + URL-param + signed-token claim plumbing |
| N4 | **Eisai transitional landing page + co-branded results variant** *(new)* | (1) Linus-branded transitional landing page receiving traffic from `leqembi.com` / `eisaipatientsupport.com`; sponsor-mark visible (not headline co-branding); HIPAA consent + Eisai sponsor-specific consent variant; sets `cohort=eisai-sponsored` flag at signup; no Stripe step. (2) Co-branded results-page variant for the Eisai cohort - same layout, same data, sponsor mark visible, sponsor-appropriate disclaimer language. |
| N5 | **Cohort flag schema spec** *(new)* | Shared spec document defining the `cohort` enum (`pbh-paid \| eisai-sponsored \| bbva-sponsored \| none`), HubSpot contact property configuration, URL-parameter parsing rules, and signed-token claim format. A shared specification referenced by both the PBH and Eisai cohort implementations. An early (Week 1) deliverable - inexpensive to define up front, costly to retrofit later |
| F6 | **Navigation & IA Overhaul (lighter scope)** | Updated primary nav: About / How It Works / Resources / For Families / For Providers / Blog / Book Consultation. Sticky persistent CTA. Footer rebuild. **Deferred to Phase 3:** mega-menu, breadcrumbs |

**Relocated from Phase 2 to Phase 3** (see Phase 3 deliverables below): F2 Brain Health Journey Map, F3 Cognitive Self-Screener, F4 Blog/Editorial Hub, F5 Resource Library. Same work, later timing - net-neutral on engagement total cost.

### Phase 3 - Conversion optimization (Oct 12 – Nov 20)

Phase 3 includes both the conversion-optimization deliverables and the editorial deliverables relocated from Phase 2. The relocation is timing-only - same work, later phase, same cost.

#### Conversion-optimization deliverables (original Phase 3)

| # | Deliverable | Notes |
| :--- | :--- | :--- |
| C1 | **For Families / Care Partners pathway** | Dedicated `/for-families` track. Care-partner-specific testimonials, FAQ, soft-conversion path ("not sure if Mom is ready - get our free family guide"). Uses the relocated F2 Journey Map primitive |
| C2 | **For Referring Providers pathway** | `/for-providers` page: clinical methodology one-pager (downloadable), referral form, sample patient report (de-identified), Dr. Bates' CV. Unlocks B2B channel. Uses the relocated F2 Journey Map primitive |
| C3 | **Pricing / Membership page** | Standalone `/pricing` page improves SEO and reduces friction. What's included, HSA/FSA language, future membership tiers |
| C4 | **Homepage explainer video** | 60–90 second founder-led video featuring Dr. Bates. Production: see optional content services below |
| C5 | **Hero loop expansion** | Two additional clips (parents with young child; multigenerational family). Footage style consistent with existing loop. Custom shoot strongly preferred over stock |
| C6 | **Press / Social Proof Strip** | Horizontal logo strip beneath hero - "As covered by," credentialing institutions, board affiliations, HSA/FSA badge. Populated as press develops |
| C7 | **Newsletter & Email Nurture System (infrastructure only)** | Sitewide newsletter signup (footer, blog sidebar, exit-intent on key pages). HubSpot integration with source + segment tags. Implementation of 7 email templates (4 welcome + 3 nurture) from Arian's design, using React Email + Resend. HubSpot automation wiring for the 4 sequences (general prospect, care partner, post-screener + welcome). **Strategy + segmentation logic + copywriting + deliverability tuning are NOT in VisualBoston's scope** - owned by PBH or PBH's contracted email marketer (see Section 6). VisualBoston is happy to refer PBH to email marketing specialists if needed. |

#### Relocated editorial deliverables (moved from Phase 2)

| # | Deliverable | Notes |
| :--- | :--- | :--- |
| F2 | **Interactive Brain Health Journey Map** *(relocated from Phase 2)* | Horizontal/vertical timeline across 5 stages (Concern → Assess → Plan → Act → Sustain). Replaces current "How It Works" section. Standalone `/how-it-works` page for direct linking. **Built as a reusable component** - the same primitive powers C1/C2 family/providers pathway pages above. Mobile-first, WCAG 2.1 AA. Relocation reason: *educational, not on conversion path* |
| F3 | **Cognitive Self-Screener / Risk Assessment Tool** *(relocated from Phase 2)* | 8–12 questions, ~3-minute self-assessment of modifiable risk factors. Built jointly with PBH medical team. Personalized result page → CTA to book the consultation. Optional email capture. HIPAA-aware. Clinically reviewed and approved by PBH medical team before launch. Relocation reason: *risks confusing the paid assessment offer; safer to land after MVP funnel data is in hand* |
| F4 | **Blog / Editorial Hub** *(relocated from Phase 2)* | Index with category filters, article template, author profile pages, `Article` + `MedicalWebPage` schema, RSS + sitemap. Launches with 8–12 cornerstone articles (content production scoped separately as optional). Relocation reason: *Nina's content workstream can stage drafts in Google Docs; publishing surface can wait* |
| F5 | **Resource Library** *(relocated from Phase 2)* | `/resources` index - Guides (PDF), Checklists, Worksheets, Webinars, Glossary. Gated downloadables → email capture → HubSpot list segmentation. Relocation reason: *same logic as Blog Hub - can stage content while operational tooling lands first* |

---

### Discovery, Design & Build Approach

#### Discovery & Strategy (Week 0–1, before Phase 1 build)

**Objective**: Lock dependencies, contracts, and content windows before the build clock starts on June 22.

**Process**:

- Kickoff conversation with David (founder) - the RFP is already detailed, so discovery synthesizes it into a decision doc rather than re-interviewing the same scope
- IA confirmation workshop covering MVP nav + Phase 2 IA overhaul targets
- Analytics baseline read of current site
- **Signed-token handoff contract** drafted jointly with PBH's product team (token format, signing key, redirect URL, error paths)
- Content production windows confirmed with Nina against Phase 1 build dates (async - no interview required)

**Deliverables**:

- Discovery summary doc (stakeholder map, decisions, dependencies)
- Signed-token handoff contract (versioned, in repo)
- **Payment architecture spec** - Stripe integration design covering account setup, MCC verification, Payment Element vs. Checkout decision, Customer-object handoff to the wellness app, receipt template (HSA/FSA-formatted, sent via Resend), webhook handling, audit log, and the PCI SAQ-A deliverable structure
- Content production calendar
- Updated risk register

#### Design Sprint & Brand Integration (Phase 1: Weeks 1–2; Phase 2: Aug 24–Sep 11; Phase 3: Oct 12–Oct 23)

**Process**:

- Component-library extension from the SOW #1 foundation
- Phase-specific page designs in Figma (desktop + mobile)
- AI-assisted mood-board and layout exploration where new visual territory is needed
- Storybook entries for new shared components

**Deliverables**:

- Figma boards per phase (signed off before development)
- Updated component library / design tokens
- Storybook entries for new shared components

**AI Tools Utilized**:

- Generative AI for visual exploration and asset generation
- Claude / ChatGPT for content strategy and UX copy refinement (where VisualBoston is contributing copy)
- AI-powered design tools for rapid layout iterations

#### AI-Accelerated Development (Phase 1: Weeks 2–6; Phase 2: Aug 31–Oct 2; Phase 3: Oct 19–Nov 13)

**Process**:

- **Claude Code** as the primary development workflow for rapid, AI-assisted coding
- Component-first development against the design system
- Progressive enhancement: core layout → form logic → integrations
- Continuous testing: AI-assisted code review, accessibility checks, end-to-end payment-flow tests

**Development Stack** (continued from SOW #1, extended for Phase 2):

- **Architecture**: Monorepo (pnpm workspaces + Turborepo). Two apps - marketing (`primarybrainhealth.com`) and funnel (`app.primarybrainhealth.com`) - share a design system in `packages/ui`. Two Vercel projects so TinaCMS edits never trigger funnel rebuilds and Stripe webhooks stay isolated from the CMS admin
- **Frontend**: Next.js 16 (App Router) with TypeScript and React 19
- **CMS**: TinaCMS (marketing app only)
- **Hosting**: Vercel (two projects, one per app)
- **Styling**: Tailwind CSS 4 with the established Cognitive Sanctuary token system, shared across both apps
- **Database**: Neon Postgres on Scale tier with BAA signed; Drizzle ORM
- **Auth**: To be locked in discovery (Clerk recommended; NextAuth / Auth.js viable alternates)
- **Payment**: Stripe Payment Element (PCI SAQ-A), Stripe Customer with `setup_future_usage` for wellness-app handoff, Stripe Tax
- **Transactional email**: Resend
- **CRM / lifecycle**: HubSpot (event flags, no PHI)
- **Analytics**: GA4 with custom-event funnel, cross-domain measurement enabled

#### Figma-first vs. Code-first surfaces

Our AI-assisted workflow (Claude Code) means some surfaces are faster to iterate directly in code than to round-trip through Figma. We're explicit about which is which so PBH knows what to expect and how to approve each one.

**Figma-first surfaces** - Arian designs in Figma first, PBH approves the Figma mockup, then Mark builds against it. Used where Arian's visual choices are the deliverable and stakeholders need to see the design before code exists.

**Code-first surfaces** - Generated directly in Claude Code using the established design system and tokens. PBH approves the working implementation on the staging URL (same sign-off weight as a Figma approval, faster cycle). Used where the design is form-follows-function and AI can produce variants in code faster than a Figma round-trip.

| Phase | Figma-first | Code-first (staging review) |
| :---- | :---- | :---- |
| **Phase 1** | Landing page (hero, trust signals, FAQ, $149 treatment, footer); funnel progress indicator; reusable form primitives; Stripe Appearance API tokens (brand values for Payment Element) | `/get-started` signup form; `/get-started/consent`; `/get-started/payment` page surround; `/get-started/confirmation`; `/signin`, `/forgot-password`, `/reset-password`; `/notice-of-privacy-practices`; 4 transactional email templates (built with React Email); cookie consent banner; form validation / loading / error / success states |
| **Phase 2** | Testimonials page + reusable card; Journey Map (5-stage timeline); Screener UI question patterns; Blog hub + article template; Resource library + filters; Nav/IA + mega-menu; Footer rebuild | Screener result page; blog author profile pages; RSS feed; HubSpot list-segmentation UI |
| **Phase 3** | Families pathway page; Providers pathway page; Pricing page; Press strip; Newsletter UI (signup variants, exit-intent); Hero adjustments (video integration); Provider PDF artifacts (print) | 7 email sequence templates (React Email); HubSpot automation wiring screens; newsletter confirmation states |

Roughly 70% of surfaces are Figma-first (the brand-defining and visually-novel work). The 30% that are code-first are functional or template-driven surfaces where AI velocity is the bigger win. PBH still has full sign-off authority on every surface - the difference is whether sign-off happens in Figma or on a staging URL.

#### Week-by-Week Breakdown (Phase 1)

##### Design Timeline

| Timeline & Services | Description | Output |
| :---- | :---- | :---- |
| **Step 1: Component-library extension** | | |
| Audit V1 component inventory | Identify reusable primitives from SOW #1 and what's missing for the funnel | Component inventory doc |
| Funnel page concepts | Landing page, signup/consent, payment, confirmation - Figma desktop + mobile | Figma - 2 concept rounds |
| **Step 2: High-fidelity & responsive** | | |
| High-fidelity flow + prototype | Click-through Figma prototype of the full funnel | Interactive prototype |
| Responsive variants | Desktop, tablet, mobile breakpoints | Responsive mockups |

##### Development Timeline

| Focus | Description | Output |
| :---- | :---- | :---- |
| **Step 3: AI-Enhanced Web Development** | | |
| Project Setup | Branch from existing repo; staging URL; Stripe / HubSpot / Resend accounts configured; signed-token contract finalized with PBH product team | Development environment, integration accounts |
| Legal copy integration (as content arrives) | Integrate PBH-counsel-supplied ToS / Privacy / NPP into pages with formatting + versioning UI as content lands during build | Live legal pages with acknowledgment flow wired in funnel |
| Landing Page Build | Funnel landing page using Claude Code; reusable hero, trust-signal, FAQ blocks | Production-ready landing page |
| Account, Consent & Payment | Account creation, versioned wellness consent + HIPAA NPP, Stripe Checkout with HSA/FSA, refund policy, audit log | Production-ready funnel core |
| Confirmation + Handoff | Confirmation page with receipt summary; signed-token redirect to wellness app; PBH-supplied reassurance copy | Production-ready confirmation + handoff |
| Integrations (GA4 / HubSpot / Resend) | Event firing, HubSpot lifecycle update on `payment_succeeded`, transactional email templates (receipt, abandonment 1h, abandonment 24h, resume link) | Integrated funnel with full event coverage |
| CMS Setup | TinaCMS schemas updated for any new marketing pages; PBH team can edit copy independently | Updated TinaCMS schemas |
| SEO (baseline) | `Organization` + `MedicalWebPage` schema, XML sitemap, meta titles/descriptions, OG tags | SEO implementation |
| Compliance Documentation | PCI SAQ-A artifacts (network diagram, cardholder inventory, full questionnaire, AoC coordination) authored by HIPAA/PCI specialist; HIPAA-aware handoff documented; consent versioning documented | PCI SAQ-A folder (network diagram + inventory + completed SAQ-A v3 + signed AoC), HIPAA/handoff write-up |
| Testing & QA | Playwright E2E suite (happy + sad paths), Stripe live + test mode payment + refund test, webhook chaos testing (replay, dedupe, signature, timeout), light load testing on payment endpoint, WCAG 2.1 AA audit (axe + manual + screen reader), email rendering across major clients, cross-browser + real-device mobile, Lighthouse 90+ mobile | QA reports, accessibility audit, E2E test suite, hypercare runbook |
| Launch | Go-live by Aug 14, 2026 | Live funnel |
| Hypercare | Two-day soft-launch hypercare Aug 17–18 with engineer on call | Hypercare incident log |
| Training & Documentation | PDF guides and Loom videos covering TinaCMS edits, HubSpot dashboard reading, Stripe dashboard reading | PDF docs, Loom videos |

#### Gantt Overview (Phase 1)

| | Jun 15 | Jun 22 | Jun 29 | Jul 6 | Jul 13 | Jul 20 | Jul 27 | Aug 3 | Aug 10 |
| :---- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| | Wk 1 | Wk 2 | Wk 3 | Wk 4 | Wk 5 | Wk 6 | Wk 7 | Wk 8 | Wk 9 |
| **Design** | | | | | | | | | |
| Component-lib extension | ● | ● | | | | | | | |
| High-fi flow + prototype | | ● | ● | | | | | | |
| **Development** | | | | | | | | | |
| Landing page | ● | ● | ● | ● | | | | | |
| Account / consent / payment | | | ● | ● | ● | ● | | | |
| Confirmation + handoff | | | | | ● | ● | | | |
| Integrations (GA4 / HubSpot / Resend) | | | | ● | ● | ● | ● | | |
| Compliance docs (PCI SAQ-A) | | | | | | ● | ● | ● | |
| QA, accessibility, Lighthouse | | | | | | | ● | ● | |
| UAT + launch | | | | | | | | ● | ● |
| Hypercare (Aug 17–18) | | | | | | | | | (next week) |

### Quality Assurance

Our Phase 1 QA scope is sized to a production launch handling payments and HIPAA-adjacent data - ~17% of phase engineering hours dedicated to explicit QA workstreams. Composed of:

**Automated Testing**:

- **End-to-end (E2E) test infrastructure**: Playwright suite at repo root. Covers the full happy path (signup → consent → NPP acknowledgment → payment → confirmation → handoff) plus sad-path variants (payment decline, abandoned signup). Foundation for ongoing regression coverage in retainer phase.
- **Webhook chaos testing**: Replayed Stripe events, out-of-order events, malformed payloads, signature mismatches, simulated Stripe API timeouts. Validates idempotency dedupe and retry queue under failure modes.
- **Stripe payment-flow testing**: Test card matrix (Visa/MC, Apple Pay, Google Pay, HSA/FSA test cards, declines, 3DS challenges) plus live-mode test with real card + refund.

**Accessibility**:

- WCAG 2.1 AA audit (axe + Lighthouse automated, manual keyboard pass, VoiceOver + NVDA screen-reader pass)
- Triaged fix backlog with blocker/serious findings closed pre-launch

**Cross-platform**:

- Cross-browser testing (Chrome, Firefox, Edge, Safari latest + one back, Mobile Safari, Chrome Android)
- Real-device mobile testing via BrowserStack on iOS Safari + Android Chrome (catches device-only quirks the responsive audit misses)

**Email rendering**:

- Litmus / Email on Acid testing for all transactional templates across Gmail, Outlook, Apple Mail, and major mobile clients. Phase 1 (4 templates) + Phase 3 (7 templates).

**Design QA**:

- Design-led staging walkthroughs against Figma per page. AI-assisted design-system compliance checking. Responsive validation across breakpoints. Token-system compliance audit.

**Compliance review** (subcontracted specialist):

- Mid-phase implementation review (webhook, audit log, payment flow)
- Pre-launch compliance sign-off (SAQ-A artifacts filed, BAA on file, audit log writing correctly in production, NPP live, secrets rotation documented)

**Launch hypercare**:

- 2-day active on-call coverage during soft launch (8 hours × 2 days). Monitoring dashboards (Stripe, Vercel, GA4, Resend, audit log) configured pre-launch with PagerDuty / Slack alert routing. Post-mortem document feeds Phase 2 + retainer scope.

**Optional add-on**: External penetration test on payment + auth surfaces ($2k–$5k, scoped separately). Recommended for additional defense in depth but not in core scope.

### Feedback & Iteration Process

**Rapid Feedback Loops**:

- Progress updates with live preview links via staging environment
- AI-assisted change implementation (minor updates can be made in minutes)
- Real-time collaboration through shared development environments

**Client Collaboration**:

- Weekly check-ins with live demo of progress
- Shared Figma workspace for design feedback
- Staging environment for content review and testing
- Final approval checkpoints at end of each phase (Phase 1: weeks 2 and 9)

## 4. Feedback & Approval Process

Approval happens on two tracks depending on whether the surface is Figma-first or code-first (see "Figma-first vs. Code-first surfaces" matrix in Section 3).

**Figma-first surfaces:**
- Design concepts presented in Figma for review and feedback
- A key stakeholder from PBH provides **written sign-off in Figma** before we proceed from design to development

**Code-first surfaces:**
- Built directly in Claude Code against the established design system and tokens
- Delivered for review on the **staging URL** when complete (not via Figma mockup)
- PBH provides **written sign-off in the project tracker** (Slack channel comment or email) within **48 business hours** of receiving the staging-review link
- Same sign-off weight as Figma approval, just on the working implementation rather than a mockup
- Faster cycle (no Figma round-trip)

Both tracks include **2 rounds of revisions per surface** within the scope of work. See Section 5 (Change Orders & Additional Work) for the full definition of what counts as a revision versus a change order, plus feedback-consolidation expectations and timing.

If PBH delays a code-first sign-off beyond 48 business hours, the surface is considered provisionally approved and the next dependent task moves forward; PBH retains rights to revise within the 2-round allowance once formal feedback arrives.

## 5. Change Orders & Additional Work

### Revision rounds

This estimate includes **2 rounds of revisions per surface** (Figma mockup or staging implementation). Additional revisions beyond the 2 rounds are billed at **$150/hr** and tracked as line items in the next milestone invoice.

**What counts as Round 1 vs Round 2:**

- **Round 1 (initial review)** - first consolidated feedback after we deliver a surface for review. PBH bundles all stakeholder input into a single feedback pass. We address all items in one revision pass and redeliver.
- **Round 2 (refinement)** - second feedback pass after Round 1 changes are implemented. Intended for fine-tuning (polish, copy tweaks, spacing nudges). Not for net-new direction.

**What's included in a revision** (no extra charge, within the 2 rounds):

- Copy edits and content swaps
- Layout adjustments within the existing structure
- Color, typography, spacing tweaks within the design system
- Adding/refining states on existing components (loading, error, empty, success)
- Responsive behavior fine-tuning
- Accessibility fixes

**What is NOT a revision (= change order, separately scoped and quoted):**

- New pages or surfaces not in the original scope of work
- Major direction changes (e.g., "let's try a completely different layout / brand direction / interaction model")
- Adding net-new functionality or features
- Expanding component scope (e.g., "what if the testimonial card also showed video?")
- Changes requested after Round 2 sign-off on a surface
- Reverting to a previously-rejected direction
- Adding new integrations or data sources
- Performance, accessibility, or compliance scope beyond what's in Section 3

**Feedback consolidation expectations:**

- PBH provides bundled feedback per round, not piecemeal drip feedback. Mid-round comments are batched into the next round.
- PBH provides feedback within **5 business days** of a deliverable being formally delivered for review. The 5-day clock applies to true silence - it does **not** trip on async Figma comments inside the 48-business-hour code-first window, mid-review partial feedback, clarifying questions, or feedback that is underway but pending one or two stakeholders. Feedback delays beyond 5 business days (i.e. no feedback in any form received) may shift downstream milestones and invoice schedule (see Section 9 Payment & Delay Policies).
- Round 1 feedback should be consolidated into a single response (Figma comments thread, Slack message, or email summary). Same for Round 2.

**Change order process:**

Mid-phase scope changes are scoped, priced, and added as written change orders before work begins. Change orders include: description, estimated hours, billing rate, milestone impact, and any timeline shift. Both parties sign the change order before execution. Scope changes that compromise the Aug 14 go-live commitment are flagged immediately and resolved jointly before work begins.

## 6. Not Included

The following services are **NOT** included in this scope of work. If you'd like to include any of these services, let us know and we'll update this document.

### Owned by PBH (out of VisualBoston's engineering scope)

Defined in detail in Section 3 under "Handoff to the wellness app (the seam)". Summary:

- The wellness app itself, BHN dashboard, assessment runner, and intake gate
- Athena (clinical EMR) handoff and any clinical-consent capture inside the wellness app
- Telehealth video links and their delivery emails (sent from the wellness app)
- Clinical scheduling embed inside the authenticated wellness app (VisualBoston only confirms the redirect contract)

### Out of scope for Phase 1 (deferred or product-side)

- SSO (Google, Apple)
- Insurance collection at signup (handled later, inside the wellness app)
- Multi-user / family accounts
- HIPAA-covered storage of PHI on PBH servers - Phase 1 deliberately keeps PHI out of the website tier
- Custom Stripe Connect, marketplace, or split-payments logic (single $149 charge only)
- Advanced article schema, FAQPage schema, internal-linking strategy beyond `Organization` + `MedicalWebPage` baseline (deferred to Phase 2)

### Marketing Collateral

- Social media design
- Exhibition design
- Posters and various print materials

### Website

- UX copywriting for Phase 1 (Nina at PBH owns consumer-facing copy for the MVP phase)
- **Legal copy authoring** - VisualBoston does not draft Terms of Service, Privacy Policy, or HIPAA Notice of Privacy Practices content. PBH counsel delivers final rich-text content; VisualBoston integrates into pages with formatting, versioning UI, and the acknowledgment flow
- **Email marketing strategy + copywriting + deliverability ops** - VisualBoston scopes and builds the *infrastructure* for the Phase 3 newsletter system (signup components, HubSpot integration, template implementation from  design, automation wiring). The following are NOT in scope: (1) email marketing strategy (sequence design, conversion goals, success metrics per email), (2) audience segmentation logic decisions, (3) copywriting for any sequence template, (4) deliverability tuning + sender reputation management, (5) A/B testing strategy + ongoing optimization, (6) metrics analysis + cohort reporting. These are an email marketing specialty owned by PBH or PBH's contracted email marketer. VisualBoston can refer specialists if needed
- **External penetration test** - flagged as a recommended optional add-on ($2k–$5k via a security firm). Our subcontracted HIPAA/PCI specialist provides architecture review + pre-launch sign-off, but adversarial pen-testing is a separately scoped engagement
- **PCI compliance for any payment flow outside Stripe** - scope assumes Stripe Payment Element only. Any future credit-card storage on PBH infrastructure or alternate processor would require SAQ-D scope (~10× the documentation work) and a different specialist engagement
- **Accessibility - third-party WCAG audit + real-user disability testing** - VisualBoston self-attests WCAG 2.1 AA conformance. A formal third-party audit (Fable Page Audit, Deque, TPGi) or real-user testing with people who use assistive technology daily is available as an optional add-on if PBH wants independent validation
- **Accessibility - WCAG 2.2 or AAA conformance** - target is WCAG 2.1 AA per RFP. 2.2 and AAA are available as scope expansion if needed
- **Accessibility - vendor widget interiors** - we can't override Stripe's iframe internals or HubSpot's embedded form markup. Any known vendor accessibility gaps are documented in the conformance statement
- **Accessibility - sign-language interpretation or audio descriptions for video** - caption tracks are included with any video content; sign-language overlay or audio description tracks are optional add-ons
- Advanced SEO Strategy
 - Content Strategy: topic clusters, content authority building, content refreshes
 - Link Building: strategic guest posting, digital PR, broken-link building
 - UX and Search Intent Optimization: deeper mobile, site-architecture, and search-intent work
 - Schema markup / structured data beyond the baseline + Phase 2 article/FAQ additions
 - **Note**: For strategic SEO we'd be happy to connect you with a trusted partner that specializes in the above
- Extended licenses for stock photos, videos, illustrations, icons, or graphics
- Personalization and internationalization features
- Global search functionality
- Spanish-language site (architected for, not built - see future state)

### Animations & Illustrations

- Custom illustrations - we'll use a mixture of generative AI and stock images / illustrations

### Optional content services (additional cost, separately invoiced)

> **⚠️ NOT included in the $162,600 engagement subtotal.** Optional content-production services (founder video, patient testimonials, hero loop additions, resource-bundle design, photography, email-sequence copywriting) are PBH-elected line items priced in §9. Firm quotes already received for several lines; the rest remain indicative pending sourcing. PBH can elect or decline any item independently with no impact on engagement scope or price.

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
- Testing - we use the following tools to ensure a high-quality end product:
 - Google Lighthouse, PageSpeed Insights, Core Web Vitals - average score across 4 incognito-mode runs, targeting 80+ on the landing page (90+ Performance on mobile)
 - Stripe test-mode end-to-end transaction suite for payment flow
 - axe / Lighthouse accessibility for WCAG 2.1 AA
- Browser Compatibility - we test the following:

| Browser | Versions | Release Notes |
| :---- | :---- | :---- |
| Google Chrome | Latest + one version back | [https://developer.chrome.com/release-notes](https://developer.chrome.com/release-notes) |
| Mozilla Firefox | Latest + one version back | [https://www.mozilla.org/en-US/firefox/releases/](https://www.mozilla.org/en-US/firefox/releases/) |
| Microsoft Edge | Latest + one version back | [https://learn.microsoft.com/en-us/deployedge/microsoft-edge-release-schedule](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-release-schedule) |
| Apple Safari | Latest + one version back | [https://developer.apple.com/documentation/safari-release-notes](https://developer.apple.com/documentation/safari-release-notes) |

- There are no holidays observed by VisualBoston during this SOW

**Primary Brain Health**

- PBH stakeholders are available to answer questions and participate in weekly check-ins
- **Content for Phase 1 is owned by Nina Zhang (PBH)** - landing-page copy, FAQ, consent text drafts (for counsel review), form labels, error states, refund policy, and receipt email delivered by the windows in the timeline above
- A key stakeholder from PBH provides written sign-off before we proceed - in Figma for Figma-first surfaces, or on the staging URL within 48 business hours for code-first surfaces (see Section 3 matrix + Section 4 for details)
- **PBH counsel delivers** the Terms of Service, Privacy Policy, and HIPAA Notice of Privacy Practices content as rich text. VisualBoston integrates into the appropriate pages with formatting, versioning UI (for the consent record), and the acknowledgment flow in the funnel. VisualBoston is not authoring legal copy.
- PBH provides the field mapping for HubSpot lifecycle stages and any custom properties
- **PBH's product team** is available during Phase 1 discovery to co-define the signed-token handoff contract (token format, signing key, expected redirect URL, error paths) with VisualBoston. VisualBoston cannot ship the funnel without this contract closed
- **PBH executes the Neon Scale BAA and the Stripe SAQ-A Attestation of Compliance**. VisualBoston's compliance specialist drafts the artifacts and coordinates signatures; PBH-officer sign-off is required before go-live
- PBH provisions any BAAs required for transactional email (Resend) and confirms HIPAA-eligible HubSpot configuration (no PHI rule)
- **HIPAA/PCI specialist sourcing window**: Sourcing runs Jun 1 – Jun 15, 2026 in parallel with discovery. Specialist begins work on Jun 15 Phase 1 kickoff. VisualBoston interviews candidates against HCISPP or CISSP certification, prior Stripe SAQ-A delivery (3+ engagements), and at least one healthcare-funnel engagement. **Once a candidate is selected (target ~Jun 8), VisualBoston shares a short bio, LinkedIn profile, and 2–3 anonymized prior-engagement references to PBH for review and approval before contract sign with the specialist.** If PBH does not approve the candidate, VisualBoston re-sources. If sourcing slips past Jun 15 due to PBH-side approval timing or re-sourcing, Phase 1 architecture work slips correspondingly
- Existing accounts continue to be used:
 - GitHub (`dbates-commits`) - repo already in use
 - Vercel - already deployed
 - TinaCMS (`dbates@primarybrainhealth.com`) - already in use
 - Domain (`www.primarybrainhealth.com`) - registered at Northwest Registered Agent; DNS access available
- PBH provisions new accounts as needed:
 - Stripe account (Standard) with HSA/FSA card acceptance enabled
 - Resend account (or alternate) with appropriate sender authentication
 - HubSpot account configuration verified for no-PHI fields
- PBH is responsible for ongoing vendor costs (separate from VisualBoston engagement fees):

  | Vendor | Plan | Approx. monthly | Notes |
  | :---- | :---- | ----: | :---- |
  | **Neon** | Scale (HIPAA-eligible with BAA) | $69 base + usage (~$100–150/mo realistic at launch traffic) | Required tier - Scale is the lowest Neon tier offering a BAA. Charges based on compute hours, storage, and data transfer above base. |
  | **Stripe** | Standard | 2.9% + 30¢ per transaction | Plus Stripe Tax fees if enabled. No monthly minimum. |
  | **Resend** | Pro (with BAA) | $20/mo for 50k emails | Free tier covers 3k emails/mo if PBH wants to start there; Pro tier required for BAA. |
  | **HubSpot** | Existing tier | (PBH's current subscription) | No new requirement; we integrate with PBH's existing HubSpot account. |
  | **Vercel** | Pro | $20/mo per seat | Required if upgrading from Hobby - needed for analytics, advanced caching, and the team-collaboration features the funnel uses. |
  | **TinaCMS** | Free or Starter ($29/mo) | $0 or $29/mo | Free tier may suffice for Phase 1; Starter unlocks higher seat counts and content backups. |
  | **BrowserStack / Litmus** | Pay-as-you-go | one-time during QA only | Used for real-device + email-rendering QA during build, not ongoing. |
  | **Domain renewal** | (PBH-managed) | ~$10–15/year | Already at Northwest Registered Agent |

  **Estimated launch-month vendor floor (excluding Stripe transaction fees and HubSpot's existing subscription): ~$140–220/mo.** Scales with traffic; the largest variable cost is Neon usage tied to active user volume.

## 8. Team

| Role                                           | Focus                                                                                                                                                                                                                                                                                                                                                                         |
| :--------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Senior Designer, Lead (**Arian**)              | Design lead across all three phases - component library, page design, design-system enforcement                                                                                                                                                                                                                                                                               |
| Senior Fullsatck Engineer (**Mark Stenquist**) | Engineering lead - funnel build, Stripe / HubSpot / Resend integrations, signed-token handoff implementation                                                                                                                                                                                                                                                                  |
| HIPAA/PCI Specialist (subcontracted)           | Credentialed security engineer (HCISPP / CISSP + prior Stripe SAQ-A experience). Owns the SAQ-A artifacts (network diagram, cardholder inventory, questionnaire, AoC coordination), authors the signed-token handoff spec, advises on Neon BAA + HIPAA posture, and provides architecture review at key milestones. ~54 hours across the engagement, concentrated in Phase 1. |
| Senior Product Manager (**Matt** McGuire)      | Stakeholder coordination, sprint planning, weekly status, risk management                                                                                                                                                                                                                                                                                                     |


## 9. Pricing & Payment Terms

**Modular by phase**. Each phase is priced independently. PBH may approve Phase 1 in isolation and decide on Phases 2 and 3 after MVP go-live.

### Phase 1 - MVP (Jun 1 – Aug 14)

Fixed-fee structure with milestone-based invoicing. Phase 1 begins with a split activation invoice (Invoices 1A + 1B) to align upfront cash exposure with concrete deliverables on each side of discovery. Time-and-materials with a cap is available on request.

| Invoice # | Description                                                                                                                                  | Terms |          Send Date |      Amount |
| :-------- | :------------------------------------------------------------------------------------------------------------------------------------------- | :---- | -----------------: | ----------: |
| 1A  | Phase 1 - Activation (HIPAA/PCI specialist sourcing kickoff, Neon + Resend + Stripe account provisioning, monorepo scaffold, discovery kickoff) | Net 0 |      ~Jun 1, 2026 |     $15,000 |
| 1B  | Phase 1 - End-of-discovery sign-off (specialist onboarded, signed-token handoff contract drafted with PBH product team / wellness-app vendor, payment architecture spec locked, discovery doc delivered) | Net 0 |      ~Jun 12, 2026 |     $19,250 |
| 2         | Phase 1 - Funnel design signed off + architecture spec locked                                                                                | Net 15 |      ~Jun 29, 2026 |     $17,100 |
| 3         | Phase 1 - Funnel core live in staging (account, consent, payment, handoff) + E2E test suite passing                                          | Net 15 |      ~Jul 24, 2026 |     $18,000 |
| 4         | Phase 1 - Go-live + PCI SAQ-A documentation delivered + hypercare complete + CMS docs delivered + WCAG 2.1 AA conformance statement filed   | Net 15 |      ~Aug 14, 2026 |     $13,950 |
|           |                                                                                                                                              |       | **Phase 1 total:** | **$83,300** |

### Phase 2 - Fast-follow (Aug 24 – Oct 9)

| Invoice # | Description | Terms | Send Date | Amount |
| :---- | :---- | :---- | ----: | ----: |
| 5 | Phase 2 - Discovery + design signed off (BHN scheduling page, BHN-facing dashboard, cohort/waitlist mechanics, Eisai transitional landing + co-branded results variant, cohort schema spec, testimonials, lighter Nav/IA) | Net 14 | ~Sep 11, 2026 | $11,500 |
| 6 | Phase 2 - Build in staging | Net 14 | ~Oct 2, 2026 | $15,150 |
| 7 | Phase 2 - Go-live + CMS docs addendum delivered | Net 14 | ~Oct 9, 2026 | $12,050 |
| | | | **Phase 2 total:** | **$38,700** |

*Phase 2 is ~$1,950 above the original Phase 2 envelope ($36,750) - the new operational surfaces (BHN scheduling, dashboard, cohort/waitlist mechanics, Eisai cohort surfaces) cost slightly more than the editorial they replace.*

### Phase 3 - Conversion optimization (Oct 12 – Nov 20)

| Invoice # | Description                                                     | Terms  |          Send Date |      Amount |
| :-------- | :-------------------------------------------------------------- | :----- | -----------------: | ----------: |
| 8         | Phase 3 - Discovery + design signed off (families pathway, providers pathway, pricing, hero loop, press strip, newsletter infrastructure + relocated editorial: Journey Map, Self-Screener, Blog Hub, Resource Library) | Net 14 |       ~Oct 23, 2026 |     $12,050 |
| 9         | Phase 3 - Build in staging                                      | Net 14 |      ~Nov 13, 2026 |     $16,150 |
| 10        | Phase 3 - Go-live + final CMS docs handed off as complete asset | Net 14 |       ~Nov 20, 2026 |     $12,400 |
|           |                                                                 |        | **Phase 3 total:** | **$40,600** |

*Phase 3 grows by $18,000 ($22,600 → $40,600) entirely from absorbing the editorial deliverables relocated from Phase 2. Same work, later timing - no new scope; dollar-neutral on the engagement total.*

### Optional content services (additional cost, quoted separately)

> **⚠️ NOT included in the $162,600 engagement subtotal.** Each line below is independently elected; declining any or all does not change the engagement scope or price.


| Line item                                                               | Description                                                                                            |                                  Cost |
| :---------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- | ------------------------------------: |
| Founder explainer video (1)                                             | 60–90 second on-camera production with founder, partner videographer                                   |                             $8,500 \* |
| Patient testimonials video (3–5) + care-partner testimonial (1)         | On-camera shoots, partner videographer (2-day or 3-day shoot depending on subject locations)           |                  $16,500 – $19,500 \* |
| Hero loop additions (2 clips)                                           | Parents-with-young-child + multigenerational family, custom shoot, color-matched to existing hero loop |                             $4,500 \* |
| Resources: 3 PDF guides, 2 checklists, 1 glossary - **light design only** (Karla, VB-subcontracted) | Includes accessibility / tagged PDFs + 2 revision rounds. **Editorial / writing for the resource bundle scoped separately and quoted when healthcare-content writer is sourced.** | **$1,750 – $2,250** † |
| Photography: team headshots + 1 branded photoshoot                      | Replace stock About-page imagery; new hero / section imagery                                           |                       $3,500 – $7,500 |
| Email sequences: welcome + 3 nurture flows                              | Copywriting for the Phase 3 newsletter system                                                          |                       $2,500 – $5,000 |
|                                                                         | **Envelope if all elected (excluding resource-bundle editorial, separately quoted):**                  |                 **$37,250 – $47,250** |

\* Firm quote from Ryan Farrell (Boston-based videographer, **PBH-direct referral**), received 2026-05-19, 50% deposit + 50% on delivery, excludes subject stipends/honoraria + travel reimbursement (PBH-direct costs) + travel outside Boston metro (billed separately).

† **$1,750 – $2,250** is VisualBoston's all-in price for Karla's light-design work on the resource bundle (VB-subcontracted under the per-line-item exception described in "How it works" below - single VB-billed line). Covers all 6 resource assets: PDF template / style book, 3 PDF guides, 2 checklists, 1 glossary - including accessibility / tagged PDFs and 2 revision rounds. The range builds in headroom for typical extra-revision overruns (additional revisions are billed by Karla at $45/hr beyond the included 2 rounds). Editorial / writing for the resource bundle is **not** included; that gets its own firm quote once a healthcare-content writer is sourced.

Other lines remain indicative; firm quotes per line item issued on request.

**How it works:** PBH contracts each specialist (videographer, copywriter, photographer) directly; VisualBoston sources, vets, and coordinates against the project timeline. Coordination is billed as a separate **8–15% fee** on the specialist's quote. This keeps vendor relationships transferable to PBH beyond the engagement and the specialist's actual cost visible. If PBH prefers a single VB-billed line at standard markup on any item (fewer vendors in AP), flip is a one-sentence ask.

**Note on the recorded webinar (RFP §6):** Your original RFP listed a recorded webinar as part of the resources bundle. We held off pricing it pending more detail on what you're envisioning - topic, length, live-then-edited vs. studio-recorded, target audience, and distribution channel all materially shift the quote. Happy to scope and quote it as an additional optional line item once those details land; likely a Phase 2 discovery topic.



### Optional Phase 1 add-on - Third-party WCAG 2.1 AA audit

PBH may elect a formal third-party WCAG audit in addition to VisualBoston's self-attested conformance statement, useful where PBH wants independent legal-weight validation or plans to publish a public accessibility statement.

| Item | Preferred partner | Indicative range | Notes |
| :---- | :---- | ---: | :---- |
| Third-party WCAG 2.1 AA audit + remediation review | **Fable** (Page Audit / Engage tier, includes real-user testing with people who use assistive technology daily) | $6,000 – $12,000 | Firm quote within 5 business days once page count + states are confirmed. Fold-in deadline ~Jul 24 to land remediation pre-launch; later than that and folds in just after go-live. Deque and TPGi are acceptable alternates if PBH has an existing relationship. |


### Optional post-launch retainer (starting Aug 19, 2026)

| Tier | Description | Monthly |
| :---- | :---- | ----: |
| Light retainer | 20 hrs / month - CMS support, dependency updates, security patches, monitoring incident response (with explicit handoff-seam SLA below). Out-of-retainer work billed at $150/hr | $3,000 |
| Full retainer | 40 hrs / month - everything in Light + light feature work, content updates beyond CMS reach, quarterly architectural review. Out-of-retainer work billed at $150/hr | $6,000 |


#### Signed-token handoff-seam SLA (included in Light + Full retainer)

The signed-token wellness-app handoff is the highest-stakes seam post-launch and is covered by an elevated SLA distinct from generic incident response.

**Scope** - failures of:
- Signed-token redirect path from confirmation page to wellness app
- Stripe webhook handler for `payment_succeeded` / `payment_failed`
- Audit-log write path on payment events

**Response targets** (business hours: 9am–6pm ET, Mon–Fri):
- **Acknowledgement**: within 1 business hour
- **Mitigation underway**: within 4 business hours
- **Post-incident write-up to PBH**: within 2 business days

**After-hours coverage**: best-effort within 4 hours of detection, formally next business morning. 24/7 paging available as a retainer upgrade (separately scoped on request).

Non-seam incidents (CMS bugs, dependency issues, generic site errors, non-payment integration issues) remain on standard retainer turnaround: next business day acknowledgement, mitigation per triage.


### Engagement total

| | Signed | Revised | Δ |
| :---- | ----: | ----: | ----: |
| Phase 1 - MVP | $83,300 | $83,300 | - |
| Phase 2 - Fast-follow | $36,750 | $38,700 | +$1,950 |
| Phase 3 - Conversion optimization | $22,600 | $40,600 | +$18,000 |
| **Subtotal (phases 1–3, optional services excluded)** | **$142,650** | **$162,600** | **+$19,950** |

**How to read the delta:** All $19,950 of growth comes from net-new work in Phase 2 (BHN scheduling page, BHN dashboard, cohort/waitlist mechanics, Eisai transitional + co-branded results, cohort schema spec) - the editorial relocation Phase 2 → Phase 3 is dollar-neutral on the engagement total. The Phase 3 +$18,000 is the editorial deliverables F2–F5 moving in (same work, later phase). The Phase 2 +$1,950 is genuinely new work that costs slightly more than what got displaced.

**Invoice Schedule**: This engagement follows a milestone-based billing structure. Invoices are issued upon completion of each milestone. Depending on when milestones are accomplished, invoices may be sent separately or combined. Payment is due within 14 days (Net 14).

### Payment & Delay Policies

**Client Feedback Timeline**: The 5-business-day clock applies only to formal sign-off events (delivery of a Figma file or staging URL marked "ready for review") where no feedback in any form has been received for 5 business days. The clock does NOT trip on: async Figma comments or staging review notes inside the 48-business-hour code-first review window; mid-review partial feedback; clarifying questions or async Slack discussion; feedback that's underway but pending one or two stakeholders. The clause exists for true silence on a delivered deliverable, not for asynchronous-but-active review. If feedback is delayed by more than 5 business days, the next milestone payment will be invoiced to maintain project momentum. For Phase 1, a feedback delay that puts the Aug 14 go-live at risk triggers an immediate joint working session to recover.

**Late Payment Penalty**: 1% per month on overdue invoices, not exceeding 12% per annum.

**Project Pause Clause**: If inactive for more than 30 days due to client delays, a $1,500 restart fee may apply to resume work.


**Phase 2 / Phase 3 Cancellation & Pause Right** *(applies to Phases 2 and 3 only; Phase 1 stays firm through go-live + hypercare)*:

- PBH may cancel or pause Phase 2 and/or Phase 3 at any time with **10 business days' written notice**
- **Pro-rata billing for work-in-progress** at the milestone rates already set in this SOW (engineering, design, PM, and specialist hours logged against the paused/cancelled phase up to the effective date) - **no kill fee**
- A cancelled phase ends with deliverables-as-of-date handed off, repo / Figma access preserved, and a final invoice issued for WIP
- A paused phase may be resumed subject to VisualBoston team availability at the time of resumption. If the pause exceeds 30 calendar days, a small re-engagement allowance (re-syncing the team, re-reviewing data, refreshing the brief) is logged as a change-order - typically 4–8 hours at $150/hr. This is not a kill fee; it covers actual re-onboarding cost
- Cancellation of Phase 2 does not cancel Phase 3 by default (each phase is independently cancellable); cancellation of Phase 3 does not retroactively unwind Phase 2

**Change-order rate confirmation**: $150/hr is the anchored hourly rate for any out-of-scope or re-scoped work across all three phases, including work that flows out of the Phase 1 → Phase 2 re-scoping checkpoint (Section 2). No higher fixed-bid rate applies. The HIPAA/PCI specialist's blended $250/hr (per the compliance-specialist estimate) applies only if PBH directly engages the specialist for additional compliance scope beyond Phase 1.


## 10. Appendix - Diligence Reference (RFP Section 8 Responses)

The RFP raised several diligence questions for VisualBoston. The substantive answers live in the relevant sections of this proposal; this appendix consolidates them in one place for PBH's evaluation. Each answer notes where to find the supporting detail elsewhere in the doc.

- **Can you commit to MVP go-live August 14 as a fixed date?** Yes, committed as a fixed date, contingent on (a) signed contract in time to begin specialist sourcing on June 1, 2026, (b) signed-token handoff contract closed with PBH's product team by end of discovery (~Jun 12), (c) HIPAA/PCI specialist onboarded by Jun 15 Phase 1 kickoff, and (d) Nina's content windows met per Section 7. We will surface any of these at risk no later than weekly check-ins. *(See Section 2 for the full timeline and Section 7 for the assumption set.)*

- **Do you have HIPAA-experienced project leads, given consent capture and the wellness-app handoff?** Our engagement model addresses this with a dedicated credentialed HIPAA/PCI specialist subcontracted to own compliance scope. The specialist authors the SAQ-A artifacts, leads the handoff-token security spec, advises on BAA execution with Neon, and provides architecture review + pre-launch sign-off. This separates compliance ownership from feature implementation and de-risks the audit posture. *(See Section 8 for the team structure and the compliance-specialist estimate doc.)*

- **PCI SAQ-A documentation - have you delivered this on prior engagements? What does your documentation look like?** The subcontracted specialist owns the SAQ-A artifacts (network diagram, cardholder inventory, full questionnaire, AoC coordination) using Stripe-provided templates as the baseline. SAQ-A documentation is delivered as a versioned compliance folder including the network diagram, cardholder data inventory, completed SAQ-A v3 questionnaire, and the signed Attestation of Compliance. Filed before go-live with PBH counsel review. *(See Section 3 'Compliance Documentation' and the compliance-specialist estimate doc.)*

- **Stripe HSA/FSA card handling - have you implemented this before? Any gotchas with receipt formatting for HSA/FSA reimbursement?** Yes - we've worked with HSA/FSA-eligible flows. Key gotchas we'll handle: (1) HSA/FSA card detection on the Stripe Customer object so receipts can be flagged correctly, (2) receipt formatting that matches HSA/FSA reimbursement-submission expectations (date, provider, service description, amount, payment method last-4), (3) explicit non-medical-evaluation language on the receipt to prevent reimbursement-rejection edge cases, (4) MCC verification (8011 / 8099) with Stripe during account setup so HSA/FSA cards auto-approve at point of sale rather than declining and surfacing as cardholder confusion. Reference client examples available on request. *(See Section 3 'Account creation, consent & payment' and stripe-architecture.md.)*

- **VisualBoston's recommendation on TinaCMS at this scale of content vs. migrating to Sanity / Contentful / Payload?** Our recommendation is to **stay on TinaCMS for Phase 1** - the migration cost outweighs the benefit when the August launch date is non-negotiable, and the new MVP pages are not content-heavy. **Revisit at the end of Phase 2** when the blog hub and resource library are landing real volume - that's the right inflection point to evaluate Sanity or Payload if Tina's editor experience strains. We'll capture concrete editor-experience and performance signals during Phase 2 to inform the decision; the call can be made before Phase 3.

- **Can the Journey Map component (fast-follow) be built reusable for future provider / family pathway pages?** Yes - the Journey Map is designed as a reusable component, with the families/providers pathways in Phase 3 using the same primitive with different content. *(See Section 3 deliverables F2, C1, C2.)*

- **Can you deliver video testimonial production in-house, or do you partner?** We partner with a videographer rather than producing in-house, coordinated under VisualBoston so PBH has a single point of contact. Production is scoped as an optional line item in Section 9 (additional cost, quoted separately).

- **What does ongoing monthly support look like post-launch?** Two retainer tiers offered in Section 9. Light retainer (20 hrs/mo, $3,000/mo) covers CMS support, dependency updates, security patches, and monitoring incident response. Full retainer (40 hrs/mo, $6,000/mo) adds light feature work, content updates beyond CMS reach, and quarterly architectural review. Out-of-retainer work billed at $150/hr. Starts Aug 19, 2026, or rolls together with Phases 2 and 3.

