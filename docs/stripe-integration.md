# Stripe Integration Reference — keys, endpoints & flow

Operational reference for the Stripe integration (issue `pbh-bws.28`):
what keys are required, what endpoints exist, and how a payment moves through the
system. For design rationale and the SAQ-A / HSA-FSA notes, see
[stripe-architecture.md](./sow2/technical/stripe-architecture.md); this doc is the "wiring".

Scope: `apps/marketing`. Card data never touches PBH servers (Stripe-hosted
**Embedded Checkout** — `ui_mode: "embedded_page"`); the backend only handles
Stripe objects.

---

## 1. Required keys

Three keys, each set **per environment** (local `.env.local`, Vercel Preview,
Vercel Production). Use **test** keys everywhere except Production.

| Key | Where it lives | Exposure | What it's for |
| :---- | :---- | :---- | :---- |
| `STRIPE_SECRET_KEY` | server only | **secret** — never ship to client | Server-side Stripe SDK: create/retrieve Checkout Sessions, verify webhook signatures |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | browser bundle | public (safe) | Loads Stripe.js + mounts Embedded Checkout in the browser |
| `STRIPE_WEBHOOK_SECRET` | server only | **secret** | Verifies inbound webhook events actually came from Stripe |

Key facts that trip people up:

- **`STRIPE_WEBHOOK_SECRET` is per-endpoint.** The `whsec_…` printed by
  `stripe listen` locally is **different** from each hosted endpoint's signing
  secret in the Stripe Dashboard. Local, Preview, and Production each need their
  own value.
- **Test vs live keys must match the mode of the webhook endpoint.** A test-mode
  endpoint's secret only verifies test-mode events.
- Missing `STRIPE_SECRET_KEY` → payments fail on first request. Missing
  `STRIPE_WEBHOOK_SECRET` → every webhook delivery returns `400`.

Accessors: `getStripeSecretKey()` / `getStripeWebhookSecret()` in
`src/lib/stripe/env.ts` throw a helpful error if their var is unset.

---

## 2. Endpoints

### Inbound (HTTP routes we expose)

| Method + path | Auth | Purpose |
| :---- | :---- | :---- |
| `POST /api/stripe/webhook` | Stripe signature (`stripe-signature` header) | Authoritative fulfillment + async lifecycle events. Must stay **public** — no cookie/session auth in front of it. |

### Server actions (RPC, not public HTTP)

| Action | File | Purpose |
| :---- | :---- | :---- |
| `createAssessmentCheckoutSession(userId)` | `apps/marketing/src/components/booking/payment/actions.ts` | Creates the Checkout Session (`ui_mode: "embedded_page"`), returns its `client_secret` + `sessionId` to mount Embedded Checkout |
| `finalizeCheckoutSession(userId, checkoutSessionId)` | same | Client fast path, called from Embedded Checkout's `onComplete`: re-verify → record → sign in → return success, on which the flow navigates to `/welcome` |
| `openBillingPortalAction(formData)` | `apps/marketing/src/components/account/actions.ts` | Both links on the account page's Payment Details card. Mints a one-shot Customer Portal URL and returns it — the card opens it in a new tab, so the customer keeps their place. The portal home for "View Receipts", the `payment_method_update` flow for "Update Payment Information" |

### Outbound (calls we make to Stripe)

| Call | When |
| :---- | :---- |
| `customers.create(...)` | First time an account reaches checkout (or opens the portal, for an account that paid as a guest). Claimed onto `users.stripe_customer_id` with `WHERE stripe_customer_id IS NULL`, so a race can't leave invoices on a customer no row points at |
| `checkout.sessions.create(...)` | On reaching the payment step. Carries `customer` (never `customer_email` — they are mutually exclusive) and `invoice_creation: { enabled: true }`, which is what gives the portal's billing history anything to list |
| `billingPortal.sessions.create(...)` | On either link of the Payment Details card. The URL is single-use and expires, so it is minted per click and never stored |
| `checkout.sessions.retrieve(id, { expand: ['payment_intent.latest_charge'] })` | On client finalize (re-verify the Session's PaymentIntent + capture brand/last4) |
| `paymentIntents.retrieve(id, { expand: ['latest_charge'] })` | Inside the webhook (re-verify + capture brand/last4) |
| `webhooks.constructEvent(rawBody, sig, secret)` | Every inbound webhook (signature verification) |

### Stripe → us: subscribed events

Register these on the Dashboard endpoint (and they're what `route.ts` switches on):

| Event | Effect |
| :---- | :---- |
| `payment_intent.succeeded` | record `succeeded` (+ brand/last4) → audit |
| `payment_intent.payment_failed` | record `failed` → audit → payment-failed email |
| `charge.refunded` | record `refunded` → audit |

### External hosts in play

| Host | Role |
| :---- | :---- |
| `js.stripe.com` | Stripe.js + Embedded Checkout iframe (loaded in the browser) |
| `api.stripe.com` | Server-side SDK calls |
| `<your-domain>/api/stripe/webhook` | Where Stripe POSTs events |

---

## 3. How it works

### 3.1 System overview (keys & who talks to whom)

```mermaid
flowchart LR
    subgraph Browser
        PE[Embedded Checkout<br/>Stripe-hosted iframe]
    end
    subgraph Site[Marketing app on Vercel]
        SA[Server actions<br/>create / finalize]
        WH[POST /api/stripe/webhook]
        DB[(Neon: payments<br/>+ audit_log)]
    end
    Stripe[(Stripe)]

    PE -->|publishable key| Stripe
    SA -->|secret key: create/retrieve| Stripe
    Stripe -->|signed events| WH
    WH -->|webhook secret: verify| WH
    SA --> DB
    WH --> DB
    PE -.client_secret + sessionId.-> SA
```

> Neither path calls Linus any more (`pbh-ek8`) — see
> [`booking-flow.md`](./booking-flow.md#known-gaps).

### 3.2 Happy path (client stays on the page)

Both the client fast path and the webhook run; idempotent writes make the
overlap safe. The webhook typically lands a second or two after the client.

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser (Embedded Checkout)
    participant A as Server action
    participant S as Stripe
    participant W as Webhook route
    participant D as DB (payments/audit)

    B->>A: createAssessmentCheckoutSession(userId)
    A->>S: checkout.sessions.create (embedded_page, amount, metadata.userId)
    S-->>A: client_secret + sessionId
    A-->>B: client_secret + sessionId
    B->>S: pay in Embedded Checkout form (card in iframe)
    S-->>B: succeeded → onComplete (stays on page)

    par Client fast path
        B->>A: finalizeCheckoutSession(userId, sessionId)
        A->>S: retrieve session → PaymentIntent (verify amount/user/status)
        A->>D: upsert payments=succeeded + audit (once)
        A-->>B: set session cookie + success → navigate to /welcome → user clicks "Go to your app"
    and Webhook backstop
        S->>W: payment_intent.succeeded (signed)
        W->>W: verify signature (webhook secret)
        W->>S: retrieve intent (expand latest_charge)
        W->>D: upsert (no-op if already succeeded)
        W-->>S: 200
    end
```

### 3.3 Backstop path (browser drops after charge)

The reason the webhook exists: fulfillment no longer depends on the client
returning.

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser
    participant S as Stripe
    participant W as Webhook route
    participant D as DB

    B->>S: pay in Embedded Checkout — succeeded
    Note over B: tab closed / connection lost before<br/>onComplete — finalize never runs
    S->>W: payment_intent.succeeded (signed)
    W->>D: record payments=succeeded + audit
    alt recorded
        W-->>S: 200 (done)
    else unexpected handler failure
        W-->>S: 500 → Stripe retries w/ backoff
        Note over W,S: every write is idempotent,<br/>so a redelivery is safe
    end
    Note over B: user returns later via /login →<br/>lands back on /welcome
```

### 3.4 Payment status state machine

`payments.status`, keyed on the unique `stripe_payment_intent_id`:

```mermaid
stateDiagram-v2
    [*] --> failed: payment_failed
    [*] --> succeeded: payment_intent.succeeded
    failed --> succeeded: retry on same intent succeeds
    succeeded --> refunded: charge.refunded
    succeeded --> succeeded: duplicate delivery (no-op)
    refunded --> refunded: duplicate delivery (no-op)
```

Transitions are guarded (`setWhere` / `WHERE status <> target`) so redeliveries
and the client/webhook race are no-ops, and each audit entry is written once.

---

## 4. Setup checklist

### Local

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook   # prints whsec_…
```
1. Put the printed `whsec_…` in `apps/marketing/.env.local` as `STRIPE_WEBHOOK_SECRET`
   (alongside the test `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`).
2. `pnpm --filter app dev`
3. Pay with test card `4242 4242 4242 4242`, any future expiry, any CVC.

### Vercel

1. **Stripe Dashboard → Developers → Webhooks → Add endpoint**
   - URL: `https://<domain>/api/stripe/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
   - Copy the endpoint's signing secret.
2. **Set env vars per environment** (Project → Settings → Environment Variables):
   `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
   (test for Preview, live for Production; webhook secret = the hosted endpoint's).
3. **Preview caveat:** preview URLs change per deploy, so a static endpoint can't
   reach them — use `stripe listen` locally or a stable preview alias.
4. **Keep the route public** — if middleware (e.g. Clerk) is added, exclude
   `/api/stripe/webhook`.
5. **The Customer Portal is Dashboard-side, and per mode.** The account page's
   "View Receipts" and "Update Payment Information" both open it, and an
   inactive configuration makes both fail. Under **Settings → Billing →
   Customer portal**, activate a configuration with *Invoice history* and
   *Payment methods → allow customers to update* enabled. Turn
   *Subscriptions → cancel* **off**: nothing here is a subscription, so it would
   draw a cancel section with nothing to cancel. The portal's own default return
   URL is a single value per mode and would send Preview traffic to staging, so
   `createBillingPortalUrl` passes `return_url` explicitly from `siteBaseUrl()`.
6. **Receipt emails are off by default in live mode.** `receipt_email` on the
   PaymentIntent sends nothing until **Settings → Payments → Customer emails →
   Successful payments** is on. Test mode never sends them at all.
7. **Branding is Dashboard-side.** Embedded Checkout renders Stripe's prebuilt
   form, so brand colors/logo/fonts are set under **Stripe Dashboard → Settings →
   Branding**, not via code (the old Elements `appearance` tokens are gone). Set
   this per mode (test vs live) so Preview and Production match.

No code changes are needed to deploy: the route is already serverless-ready
(`runtime = 'nodejs'`, raw-body read, `force-dynamic`).

---

## 5. Verifying it works

- **Stripe CLI / Dashboard:** delivery attempts show `200`. Re-send an event to
  confirm idempotency (still exactly one `payment_succeeded` audit row).
- **DB:**
  ```sql
  select status, amount_cents, card_brand, card_last4, stripe_payment_intent_id
  from payments order by created_at desc limit 5;
  select event_type, user_id, metadata from audit_log order by occurred_at desc limit 10;
  ```
