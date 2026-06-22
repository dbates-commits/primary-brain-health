# Glossary - PBH Phase 2 Proposal

Internal reference. Every abbreviation, acronym, and project-specific term used in `PROPOSAL_DRAFT.md` and the estimate CSVs. Use this when onboarding new team members or when memory fails.

## Project & team

| Term | Meaning |
| :---- | :---- |
| **PBH** | Primary Brain Health - the client; virtual-first proactive brain health service |
| **VB / VisualBoston** | VisualBoston, Inc. - the vendor (us) |
| **BHN** | Brain Health Navigator - PBH's human care-guide role; walks patients through assessment results and recommendations |
| **MIM** | PBH's Pennsylvania clinical partner clinic (for medical-handoff path) |
| **Linus Health** | Third-party platform PBH uses for the cognitive assessment itself; likely the integration behind "assessment runner" |
| **Cognoa PC** | PBH's California clinical partner (referenced in RFP as future-state handoff destination) |
| **DTC** | Direct-to-Consumer - describes PBH's $149 self-pay product line |
| **PM** | Project Manager (Matt) |
| **PC** | Primary Care (as in "primary-care handoff") |

## Engagement & documents

| Term | Meaning |
| :---- | :---- |
| **RFP** | Request for Proposal - the PBH-issued scope doc (PBH_Website_v2.1_RFP.md) |
| **SOW** | Statement of Work (this engagement is SOW #2) |
| **MVP** | Minimum Viable Product - the Phase 1 launch scope |
| **UAT** | User Acceptance Testing - staging walkthrough phase before go-live |
| **QA** | Quality Assurance |
| **T&M** | Time & Materials (alternate billing structure available on request) |
| **TBD** | To Be Determined |

## Compliance & regulatory

| Term | Meaning |
| :---- | :---- |
| **HIPAA** | Health Insurance Portability and Accountability Act - US federal law governing health data handling |
| **PCI** | Payment Card Industry - set of security standards for card data handling, governed by the PCI Security Standards Council |
| **SAQ-A** | Self-Assessment Questionnaire A - the lightest PCI tier; applies when card data never touches your servers (e.g. Stripe Payment Element iframe pattern) |
| **SAQ-D** | Self-Assessment Questionnaire D - the heaviest PCI tier; applies when you store/process card data directly. ~10× the work. Out of scope for PBH. |
| **AoC** | Attestation of Compliance - signed PCI form confirming the SAQ-A questionnaire results; filed annually |
| **BAA** | Business Associate Agreement - HIPAA-required contract with vendors that handle PHI on your behalf (Neon; Resend Pro tier if PHI flows; etc.) |
| **PHI** | Protected Health Information - HIPAA-defined category of identifiable health data |
| **NPP** | Notice of Privacy Practices - HIPAA-required patient-facing disclosure document; standalone page + acknowledgment in funnel |
| **ToS** | Terms of Service |
| **GDPR** | General Data Protection Regulation - EU privacy law (cookie consent banner addresses this + CCPA) |
| **CCPA** | California Consumer Privacy Act - US state privacy law |
| **HCISPP** | HealthCare Information Security and Privacy Practitioner - credential held by HIPAA specialists |
| **CISSP** | Certified Information Systems Security Professional - broader security credential |

## Payment & financial

| Term | Meaning |
| :---- | :---- |
| **HSA** | Health Savings Account - tax-advantaged US health spending account; eligible for the $149 PBH assessment |
| **FSA** | Flexible Spending Account - similar to HSA, employer-sponsored. Same HSA/FSA card-handling logic applies |
| **MCC** | Merchant Category Code - 4-digit code assigned to merchants by card networks; 8011/8099 are the medical codes that trigger HSA/FSA card auto-approval |
| **3DS** | 3-D Secure - additional cardholder authentication step (Visa Secure / Mastercard ID Check); Stripe Payment Element handles the challenge UI |
| **MC** | Mastercard |
| **AP / GP** | Apple Pay / Google Pay (digital wallets enabled in Stripe Payment Element) |

## Healthcare / clinical

| Term | Meaning |
| :---- | :---- |
| **EMR** | Electronic Medical Record - the partner clinic's clinical record system (e.g. athenahealth) |
| **NPI** | National Provider Identifier - 10-digit ID for US healthcare providers; appears on HSA/FSA receipts |
| **DOB** | Date of Birth - collected during signup for identity/eligibility |

## Web technology & stack

| Term | Meaning |
| :---- | :---- |
| **CMS** | Content Management System (TinaCMS in PBH's case) |
| **API** | Application Programming Interface |
| **SDK** | Software Development Kit |
| **JWT** | JSON Web Token - signed token format; candidate for handoff token to wellness app |
| **HMAC** | Hash-based Message Authentication Code - alternate signing scheme for handoff token |
| **TTL** | Time To Live - token expiration window (handoff tokens are 5–15 min) |
| **DSL** | Domain Specific Language - used for the screener branching rules schema |
| **JSON-LD** | JSON for Linking Data - JSON schema format used for SEO structured data (Organization, MedicalWebPage, Article) |
| **XML** | Extensible Markup Language - used for sitemap.xml and RSS feeds |
| **CSS** | Cascading Style Sheets |
| **HTML** | HyperText Markup Language |
| **CSV** | Comma-Separated Values |
| **PDF** | Portable Document Format |
| **DB** | Database |
| **ORM** | Object-Relational Mapping - abstraction layer over SQL (Drizzle ORM in our case) |
| **PR** | Pull Request - GitHub code-review unit |
| **CI** | Continuous Integration - automated tests run on every PR |
| **E2E** | End-to-End - testing across the full user journey (signup → payment → handoff) |
| **CRM** | Customer Relationship Management (HubSpot in PBH's case) |
| **UI** | User Interface |
| **UX** | User Experience |
| **CTA** | Call To Action (button or link prompting user action - "Start your assessment") |
| **IA** | Information Architecture (site navigation structure) |
| **OG** | Open Graph - meta tags controlling how a page appears when shared on social platforms |
| **DNS** | Domain Name System |
| **TLS / SSL** | Transport Layer Security / Secure Sockets Layer - HTTPS encryption |
| **SPF** | Sender Policy Framework - email-authentication DNS record (deliverability for Resend) |
| **DKIM** | DomainKeys Identified Mail - email-authentication signing (deliverability for Resend) |
| **SSO** | Single Sign-On (e.g. Sign in with Google / Apple) - explicitly out of scope for Phase 1 |
| **MFA** | Multi-Factor Authentication |
| **MAU** | Monthly Active Users - Clerk's pricing dimension; one reason we chose Auth.js instead |
| **B2B** | Business-to-Business - describes the /for-providers pathway in Phase 3 |

## Vendors & tools

| Term | Meaning |
| :---- | :---- |
| **Next.js** | React-based web framework (current PBH stack) |
| **TinaCMS** | Git-backed CMS PBH uses for editorial content |
| **Vercel** | Hosting platform for Next.js apps; PBH's deploy target |
| **Tailwind** | CSS utility framework |
| **Stripe** | Payment processor - Payment Element for SAQ-A compliant card handling |
| **HubSpot** | CRM + marketing-automation platform PBH uses |
| **Resend** | Transactional-email provider (chosen over Postmark / SES - built by ex-Vercel team, React Email native templating, modern API, BAA available on Pro tier) |
| **Postmark** | Alternate transactional-email provider considered; longstanding deliverability reputation but heavier integration than Resend for our Next.js stack |
| **React Email** | TypeScript-native email-templating library that pairs naturally with Resend; lets templates live in the same repo as the rest of the app with proper components/types |
| **Athena (athenahealth)** | EMR system used by partner clinics for clinical referral handoff |
| **Neon** | Postgres database hosting; Scale tier with BAA (Scale is the lowest Neon tier offering a BAA) |
| **Drizzle** | TypeScript ORM that talks to Neon |
| **Auth.js** | Open-source auth library (formerly NextAuth); v5 + Drizzle adapter chosen over Clerk for HIPAA-cost reasons |
| **Argon2id** | Password-hashing algorithm (industry standard, used by Auth.js credentials provider) |
| **Mux / HLS** | Video streaming platforms (candidates for testimonial video player in Phase 2) |
| **Playwright** | E2E browser-automation testing framework |
| **Litmus / Email on Acid** | Email-rendering QA platforms (test transactional templates across Gmail/Outlook/Apple Mail) |
| **BrowserStack** | Real-device mobile testing platform |
| **pnpm** | Package manager (faster, lower-disk variant of npm); used in the monorepo |
| **GA4** | Google Analytics 4 - analytics platform; new generation replacing Universal Analytics |
| **SES** | Simple Email Service (AWS); alternate transactional-email provider considered |

## Performance & accessibility

| Term | Meaning |
| :---- | :---- |
| **WCAG** | Web Content Accessibility Guidelines - the accessibility standard; PBH targets 2.1 AA |
| **AA** | WCAG conformance level (intermediate - the legal floor for public-facing US sites) |
| **ARIA** | Accessible Rich Internet Applications - HTML attributes that expose semantics to screen readers |
| **NVDA** | NonVisual Desktop Access - open-source Windows screen reader (one of two we test against) |
| **VoiceOver** | macOS / iOS built-in screen reader (other one we test against) |
| **LCP** | Largest Contentful Paint - Core Web Vital measuring how fast the main content renders |
| **CLS** | Cumulative Layout Shift - Core Web Vital measuring how much the page jumps as it loads |
| **INP** | Interaction to Next Paint - Core Web Vital measuring input responsiveness |
| **SEO** | Search Engine Optimization |
| **E-E-A-T** | Experience, Expertise, Authoritativeness, Trustworthiness - Google's quality-rating framework, especially strict for medical content (YMYL) |
| **RSS** | Really Simple Syndication - feed format for blog readers |
| **FAQ** | Frequently Asked Questions |

## Project structure (workstream IDs from RFP)

| ID | Refers to |
| :---- | :---- |
| **V1** | The current live website (the "version 1" PBH site VisualBoston shipped under SOW #1) |
| **P1–P8** | Phase 1 V1-cleanup defects. As of Jun 12, 2026, P1/P3/P5/P6/P7/P8 are closed and verified on staging; P2 (`/about` nav link) and P4 ("Our Impact" empty) carry to Phase 2 go-live (Oct 9) via the real About/Team page. |
| **F1–F6** | Phase 2 Fast-follow deliverables (Testimonials, Journey Map, Screener, Blog Hub, Resource Library, Nav/IA overhaul) |
| **C1–C7** | Phase 3 Conversion optimization deliverables (Families pathway, Providers pathway, Pricing, Founder video, Hero loop expansion, Press strip, Newsletter system) |

## Geographic / regulatory

| Term | Meaning |
| :---- | :---- |
| **PA** | Pennsylvania (PBH's first clinical-handoff state) |
| **US** | United States |
| **ZIP** | US postal code (collected at signup for state-of-residence eligibility) |
