# Flow Diagrams - PBH Phase 2

Visual reference for the funnel + handoff. Mermaid syntax - renders in GitHub, GitLab, VS Code, Cursor, and most markdown viewers. Source-controllable, easy to edit.

Three diagrams:

1. [User funnel (happy + sad paths)](#1-user-funnel)
2. [Payment + handoff sequence (across systems)](#2-payment--handoff-sequence)
3. [System architecture overview](#3-system-architecture)

---

## 1. User funnel

Visitor journey from landing through the Stripe success → Linus Remote Assessments handoff. Includes abandonment + retry paths.

```mermaid
flowchart TD
    Start([Visitor arrives at primarybrainhealth.com]) --> Landing[/Landing page<br/>$149 value prop, CTAs, FAQ, trust signals/]
    Landing --> CTAClick{Clicks<br/>Start your assessment?}
    CTAClick -->|No, leaves| Exit1([Exit - abandonment email sent if email captured])
    CTAClick -->|Yes| Signup[/get-started<br/>Name, email, password, DOB, ZIP, state/]

    Signup --> SignupValid{Form valid?}
    SignupValid -->|Validation errors| Signup
    SignupValid -->|Valid| Consent[/get-started/consent<br/>Wellness consent + HIPAA NPP acknowledgment/]

    Consent --> ConsentAccept{Consent accepted?}
    ConsentAccept -->|Declined / abandoned| Exit2([Exit - abandonment cron fires at 1h + 24h])
    ConsentAccept -->|Accepted| Payment[/get-started/payment<br/>Stripe Payment Element + order summary + refund policy/]

    Payment --> PaymentResult{Payment result?}
    PaymentResult -->|Declined / 3DS failed| PaymentError[Show error, surface retry, preserve form state]
    PaymentError --> Payment
    PaymentResult -->|Network / Stripe outage| PaymentError
    PaymentResult -->|Abandoned| Exit2
    PaymentResult -->|Succeeded| Confirm[/get-started/confirmation<br/>Receipt summary, what's next, handoff CTA/]

    Confirm --> TokenGen[Backend: generate signed handoff token<br/>JWT/HMAC, 5–15 min TTL]
    TokenGen --> Redirect[Browser: redirect to Linus Remote Assessments domain<br/>with token as query param]
    Redirect --> Handoff([Linus Remote Assessments starts assessment session<br/>- VisualBoston scope ends here])

    Exit2 -.->|User clicks resume link in email| Signup

    style Start fill:#041632,color:#fbf9f4
    style Handoff fill:#446558,color:#fbf9f4
    style Exit1 fill:#ba1a1a,color:#fbf9f4
    style Exit2 fill:#ba1a1a,color:#fbf9f4
    style PaymentError fill:#fbf9f4,color:#041632
```

**Key events fired to GA4 along the way:**
`landing_viewed` → `cta_primary_clicked` → `signup_started` → `signup_completed` → `wellness_consent_signed` → `payment_started` → `payment_succeeded` (or `payment_failed`)

---

## 2. Payment + handoff sequence

What actually happens across systems when a user clicks Pay $149. This is the most complex interaction in the funnel and where most webhook + integration logic lives.

```mermaid
sequenceDiagram
    autonumber
    participant Browser
    participant PBH as PBH Backend<br/>(Next.js on Vercel)
    participant Stripe
    participant Neon as Neon DB<br/>(users, payments, audit_log)
    participant Resend
    participant HubSpot
    participant Wellness as Linus Remote Assessments<br/>(PBH-owned, vendor TBD)

    Browser->>PBH: POST /api/payment/intent<br/>(amount, customer info)
    PBH->>Stripe: Create Customer + PaymentIntent<br/>(setup_future_usage: 'off_session')
    Stripe-->>PBH: { clientSecret, intentId }
    PBH->>Neon: INSERT audit_log<br/>(PAYMENT_INTENT_CREATED)
    PBH-->>Browser: { clientSecret }

    Browser->>Stripe: Confirm payment via<br/>Payment Element (in-iframe)
    Stripe-->>Browser: 3DS challenge (if applicable)
    Browser->>Stripe: 3DS response
    Stripe-->>Browser: confirmPayment success

    Browser->>Browser: Show interstitial,<br/>navigate to /confirmation

    Stripe->>PBH: Webhook: payment_intent.succeeded<br/>(with signature header)
    PBH->>PBH: Verify signature + idempotency dedupe
    PBH->>Neon: INSERT audit_log<br/>(PAYMENT_SUCCEEDED, event.id)
    PBH->>Neon: INSERT payments row<br/>+ UPDATE consents (payment-confirmed)
    PBH->>Neon: SET user.hsa_fsa flag<br/>(from PaymentMethod metadata)

    par Async side effects (don't block webhook 200)
        PBH->>Resend: Send receipt email<br/>(HSA/FSA-formatted)
        PBH->>HubSpot: Update lifecycle to 'paid'<br/>(via retry queue)
    end

    PBH-->>Stripe: 200 OK

    Browser->>PBH: GET /api/handoff/token
    PBH->>PBH: Generate signed JWT<br/>(customer_id, user_id, payment_ref, 5–15 min TTL)
    PBH->>Neon: INSERT audit_log<br/>(HANDOFF_TOKEN_ISSUED)
    PBH-->>Browser: { token }

    Browser->>Wellness: Redirect with token<br/>(VisualBoston scope ends here)
    Wellness->>Wellness: Validate token + start session
```

---

## 3. System architecture

High-level component map. Shows what VisualBoston builds vs. what PBH (or PBH's vendor TBD) owns.

```mermaid
graph LR
    subgraph Visitor["Visitor's browser"]
        Browser[Browser<br/>Next.js + Tailwind]
    end

    subgraph VBScope["VisualBoston engineering scope"]
        Marketing[Marketing site<br/>primarybrainhealth.com<br/>Next.js + TinaCMS]
        Funnel[Funnel app<br/>app.primarybrainhealth.com<br/>Next.js + Auth.js]
        API[API routes<br/>/api/payment/intent<br/>/api/webhook/stripe<br/>/api/handoff/token<br/>/api/consent]
        Neon[(Neon Postgres<br/>Scale tier + BAA<br/>users, consents,<br/>payments, audit_log,<br/>jobs queue)]
        Resend[Resend<br/>transactional email<br/>via React Email]
    end

    subgraph ThirdParty["Third-party services"]
        Stripe[Stripe<br/>Payment Element + webhooks<br/>SAQ-A path]
        HubSpot[HubSpot<br/>CRM lifecycle + no-PHI events]
        GA4[Google Analytics 4<br/>funnel events]
        TinaCloud[Tina Cloud<br/>CMS backend]
    end

    subgraph PBHScope["PBH-owned (out of VisualBoston scope)"]
        WellnessApp[Linus Remote Assessments<br/>vendor TBD<br/>- assessment runner<br/>- BHN dashboard<br/>- intake gate<br/>- Athena handoff]
        Athena[athenahealth EMR<br/>MIM PA / Cognoa PC CA]
    end

    Browser --> Marketing
    Browser --> Funnel
    Funnel --> API
    API <--> Neon
    API <--> Stripe
    API --> Resend
    API --> HubSpot
    Browser --> GA4
    Marketing <--> TinaCloud
    Stripe -->|webhook| API
    API -.->|signed-token redirect| WellnessApp
    WellnessApp --> Athena

    style VBScope fill:#fbf9f4,color:#041632,stroke:#446558,stroke-width:2px
    style ThirdParty fill:#f4f0e4,color:#041632,stroke:#446558,stroke-width:1px,stroke-dasharray: 4 2
    style PBHScope fill:#e6e0cf,color:#041632,stroke:#ba1a1a,stroke-width:2px,stroke-dasharray: 6 3
    style Browser fill:#041632,color:#fbf9f4
```

**Legend:**
- 🟢 Cream box (VisualBoston scope) - we build, deploy, operate
- 🟡 Dashed yellow box (third-party services) - we integrate with, don't build
- 🔴 Dashed red box (PBH-owned scope) - out of scope, PBH or vendor TBD

The dotted arrow from API → Linus Remote Assessments is the **handoff seam** - VisualBoston's deliverable ends with the signed-token redirect. The Linus Remote Assessments and everything downstream is PBH's scope.

---

## How to edit / regenerate

These diagrams use [Mermaid](https://mermaid.js.org/) syntax. To view rendered:

- **GitHub**: renders inline in any `.md` file
- **VS Code / Cursor**: install the "Mermaid Preview" extension
- **Standalone**: paste into [mermaid.live](https://mermaid.live) for a quick edit + export to PNG/SVG

To add a new diagram, open a fenced code block with `mermaid` as the language and write the syntax. No build step required.
