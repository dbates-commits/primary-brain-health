# Booking flow

How a customer goes from the signup form on the marketing home page to a paid
account handed off to the Linus Engagement App, and what is written along the way.

> **Linus registration happens in the Stripe webhook only** (pbh-73g). The
> customer-facing path records the payment, signs the customer in and sends them
> to `/welcome` without calling Linus; the webhook then registers + enrolls the
> payer out of band. That split is deliberate — an inline call is what stranded
> paying customers on the payment step during a Linus outage (pbh-ek8).

Kept next to the code on purpose: when the flow changes this should change in the
same PR, and it should be obvious when it hasn't.

---

## One app

Everything the customer touches is `apps/marketing`: the booking section, the
whole booking modal, Stripe Checkout, sign-in, the welcome screen, and the
**only** Stripe webhook endpoint. It uses `@pbh/db` (one Neon database),
`@pbh/booking/server` (every write path), `@pbh/emails` and `@pbh/payments`.
(`@pbh/linus` is reached only from the webhook, never from a page render.)

There used to be a second app (`apps/app`) holding the post-payment product —
`/assessments`, report downloads, and its own Auth.js session. It was retired in
August 2026: Linus decided the **Linus Engagement App** is the entry point for
both PBH experiences, so the assessments and reports live there. Our surface now
ends at a welcome screen with a link out to it.

That deletion took a whole class of design with it. Marketing could not set the
other app's session cookie — different origins — which is why there was a signed
handoff token in the URL. Same origin now, so the post-payment sign-in is simply
a cookie set by the server action that verified the payment.

The booking cookie still exists and still matters: `pbh_booking_session`, signed
and HttpOnly, issued server-side at signup. Until the customer is signed in it is
the **only** thing that says which account a booking step may write to — see
`resolveBookingUserId`.

---

## Who proves the email

Auth0, since Sep 2026. The signup form takes first name, last name and email,
writes the `users` row and the booking cookie, and then **redirects to Auth0**,
which emails a code. Entering it stamps `users.email_verified` (see
`markEmailVerified`, called from the `signIn` event in `apps/marketing/src/auth.ts`)
and returns the customer to `/?booking=resume`, where the resume state machine
puts them on Details.

The point is not the verification — our own one-time link did that perfectly
well. The point is that the customer now also holds an **Auth0 session**, which
is what makes the Engagement App link on `/welcome` a plain link rather than a
second login. Doing it at signup rather than at checkout means the session is
already there by the time it is needed.

What this replaced, and is gone: `booking_email_verifications` writes, the
`/booking/confirm` route, `email-verification.ts`, `sendConfirmEmail` and the
`confirm-email` template. The **table itself is still in the database** —
dropping it is a destructive migration and a separate, deliberate decision.

Two consequences worth knowing:

- **Signup now requires Auth0 to be configured.** With `AUTH0_*` unset,
  `signupAction` refuses rather than silently stranding a customer on a step
  with no way forward. There is no non-Auth0 path to a verified address.
- **The 24-hour "come back later from the email" resume is gone.** Closing the
  tab at the Auth0 screen means starting sign-in again — which the confirm step
  now offers as a button.

## The happy path

```mermaid
sequenceDiagram
    autonumber
    actor C as Customer
    participant M as Marketing
    participant DB as Neon
    participant R as Resend
    participant A as Auth0
    participant S as Stripe
    participant E as Linus Engagement App

    C->>M: Submit the signup form (on the page, not in the modal)
    Note over M: one package, so packageKey is always the default
    M->>DB: users row (+ selected_package_key)
    M-->>C: Signed pbh_booking_session cookie (identity, 2h)
    M-->>C: Redirect to Auth0 (login_hint = the address just typed)

    C->>A: Enter the emailed code
    A-->>M: /api/auth/callback/auth0
    M->>DB: accounts row, sessions row → Auth.js session cookie
    M->>DB: set users.email_verified
    M->>R: Welcome email
    M-->>C: → /?booking=resume

    C->>M: Resume
    M->>DB: resolveBookingResumeState → step + packageKey
    C->>M: Details → users demographics
    C->>M: Consent → consents rows

    M->>DB: read users.selected_package_key (authoritative)
    M->>S: Create Checkout Session (metadata: userId, packageKey)
    C->>S: Pay (Embedded Checkout)

    par Client path (fast)
        S-->>M: onComplete
        M->>S: Re-fetch session + intent
        M->>DB: payments row, audit, receipt email
        M->>DB: sessions row → Auth.js session cookie
        Note over M: still minted here — the Auth0 session is already live
    and Webhook path (backstop)
        S->>M: payment_intent.succeeded
        M->>DB: same idempotent writes
    end

    M-->>C: Redirect to /welcome
    C->>E: "Go to your app"
```

---

## Where a customer resumes

The verification step is **blocking**, so every customer leaves the site and
comes back to a fresh page. Their step is therefore recomputed from persisted
state — never from anything the browser claims.

`resolveBookingResumeState` (`packages/booking/src/server/resume.ts`) is the
authority. If this diagram and that function disagree, the function is right.

The modal owns four of these. Signup happens on the page, so a customer who has
not started yet has no modal to be at.

```mermaid
stateDiagram-v2
    [*] --> signup
    signup --> confirm: users row created (on-page form)
    confirm --> details: users.email_verified set (by Auth0)
    details --> consent: users.date_of_birth set
    consent --> payment: consents row exists
    payment --> done: payments.status = 'succeeded'
    done --> [*]
```

### The overview pane

Someone coming back to a booking that already has progress behind it lands on an
overview pane (Figma 2063:583) before the step itself — where they are, what is
left, and one button into the next thing. It greets by state rather than
identity: **"Welcome Back!"** once anything is behind them, **"Welcome!"** when
nothing is.

**It does not show on the way into the verification gate.** Filling in a name and
an email opens the modal straight at the gate: a summary of four untaken steps in
front of someone who has taken none is an obstacle, not orientation. The same
goes for an expired link, which lands on that gate whatever else is done — so in
practice the pane always reads "Welcome Back!", and the other branch is the
component's own business rather than a state the flow produces.

The greeting never asks whether a cookie exists, which matters because the
booking cookie is HttpOnly and the browser cannot read it — the honest answer for
*no cookie*, *expired cookie* and *deleted account* alike is "no progress".

The pane is a second axis (`pane`) beside `stepIndex`, not a fifth entry in
`MODAL_STEPS` — that array is asserted against the four CMS documents on disk.
Its rows and the stepper band above the step body (2060:5600) both come from
`components/booking/step-model.ts`, which is a **display** list and deliberately
not the same four:

- **`confirm` has no row of ours.** Proving the address is a precondition, not a step: it
  happens once, before there is any progress to show, and both designs omit it.
  Someone at the gate sees the step with no stepper and no overview.
- **`assessments` is not a modal step at all** — it is `/welcome`, shown as the
  outbound promise and never actionable.

Row status is derived from the ordinal rather than read per-step, because
`resolveBookingResumeState` is a short-circuited chain that returns at the first
unmet gate. Asking it for a per-step map would run all four queries on every open
to report what the ordering already implies, and would admit states the flow
cannot reach.

### Going back

Only **details** is re-enterable, from either the stepper tab or the overview
row. It is a plain idempotent `UPDATE` with no audit row and no email. The others
are locked, and the lock is structural — an inert row renders no focusable
element at all, so there is no click to refuse:

- **consent** writes append-only rows that no constraint stops it duplicating
  (`pbh-3u1`), possibly at a different CMS `version`.
- **payment** mints a fresh Stripe Checkout Session on every mount, and
  `createCheckoutSessionCore` has no already-paid guard (`pbh-ypf`) — re-entry
  after payment is a reachable double charge.

Re-entering details fetches the current row through `getBookingDetailsValues` and
prefills the form. Without that it would come up blank, and
`validateProfileFields` would then refuse to submit it — so a customer going back
to fix one field would have to retype five.

### When the cookie has aged out

The booking cookie lives two hours. There is no confirmation token any more —
the Auth0 session is what survives instead. So someone who abandons **after**
verifying and returns the next day
has a dead cookie and a spent link. They are routed back in through sign-in
rather than by widening either lifetime:

1. The duplicate-email error on the signup form now offers a link to `/login` —
   the message already gave that advice with nothing to press.
2. **Every** booking action resolves identity through `resolveActorId` — the
   booking cookie, or an Auth.js session behind it. It has to be every one: give
   only the read path the fallback and a signed-in customer sees their step and
   then fails on submit with "we couldn't find your booking", which is the dead
   end signing in was meant to fix. A session is the stronger of the two proofs
   (it took an Auth0 sign-in as the address) and grants nothing on its own; there is
   still no fallback to anything the client sends, which is the vulnerability the
   booking cookie exists to close.
3. `/welcome` bounces an unpaid-but-identified visitor to `/?booking=resume`
   rather than to `/`, which is what reopens the modal at their step.

An unpaid signed-in visitor is therefore a supported state. It grants nothing:
`/welcome`'s own gate still turns on a succeeded payment.

---

## Step by step

All server actions live in `apps/marketing/src/components/booking/actions.ts` and
`…/payment/actions.ts`; they are thin wrappers over shared cores in
`packages/booking/src/server/`.

| Step | Client | Action | Shared core | Writes |
|---|---|---|---|---|
| Signup | `BookingSection` → `SignupForm`, on the page | `signupAction` | `createAccountCore` | `users` row incl. `selected_package_key`; audit `signup`; issues `pbh_booking_session` |
| — | — | — | (redirect to Auth0) | — |
| Confirm | `EmailConfirmationStep` | Auth0 Universal Login | `markEmailVerified` (from the `signIn` event) | `accounts`, `sessions`, `users.email_verified`; audit `email_verified` |
| Resume | `BookingStepFlow` (on mount) | `getBookingResumeState` | `resolveBookingResumeState` | — (read only) |
| Details | `DetailsForm` | `detailsAction` | `completeProfileCore` | `users` demographics (DOB, zip, phone, gender, education) + the account holder's name |
| Consent | `ConsentForm` | `consentAction` | `recordConsentCore` | two `consents` rows — `wellness` + `hipaa_npp` — with `ip_hash`, `user_agent` and the terms `version` |
| Payment | `PaymentStep` | `createAssessmentCheckoutSession` | `createCheckoutSessionCore` | audit `payment_pending`; Stripe Session |
| Fulfilment | — | `finalizeCheckoutSession` | `recordSucceededPayment` | `payments` row incl. `package_key`; audit `payment_succeeded` |
| Sign-in | — | `finalizeCheckoutSession` | `createSessionForUser` | `sessions` row; audit `login` (`method: post-payment`) |
| Welcome | `/welcome` route | — | — | — (links out to the Engagement App) |

### Who is being assessed

The account holder, always. Nobody is asked, and there is no second name on the
row to ask about: `users.patient_first_name` / `patient_last_name` were dropped
in migration 0022, because one person with two names is a pair that can disagree
— and the account settings card, which edits the account name, could rename a
Linus subject by writing them in step. The details step's name fields are the
account holder's own, prefilled from signup and written back in case they were
corrected, and `buildRegisterInput` registers that name.
`users.patient_identification` is the retired question (`pbh-4by`), now read by
nothing and kept only for the rows that answered it.

### The chosen package

Captured at signup and stored on `users.selected_package_key`, because the
verification gate destroys in-memory state before payment. That stored value —
not the key the client re-sends — is what `createCheckoutSessionCore` charges.
Trusting the client would let someone drive the $449 flow while checking out at
the $149 price, and fulfilment would accept it, since it validates the amount
against whichever package the client named.

### Which terms were agreed to

The agreement on the consent step is CMS-editable (the `Modals` collection's
`consent` document), and each `consents` row carries the version naming the text
that customer accepted. Those rows are append-only, so there is no correcting a
wrong one.

The version therefore travels with the terms rather than being looked up again:
`resolveConsentTerms` returns the two together — a version with no terms beside
it is dropped, not recorded — and the page that renders them mints a signed
`consentStamp` naming them. `consentAction` reads that stamp instead of
re-querying the CMS, so a submission is always recorded against the words that
were actually on screen, however stale the render. A stamp that is missing or
doesn't verify is refused (`CONSENT_STAMP_ERROR`) rather than falling back to a
guess.

Empty means the terms that ship in code, described by `CONSENT_VERSION` — the
normal state, since the CMS document starts empty.

### The welcome screen

The `/welcome` route, rendering `EngagementAppCta`, is where the flow ends.
Payment is the last step the modal owns: `PaymentStep`'s `onComplete` navigates
there rather than advancing to an in-modal confirmation, so the screen survives a
reload and a returning customer sees exactly the same thing. A booking resumed at
step `done` (already paid) is sent there too, instead of opening the modal.

`/welcome` allows two ways in, in order: an Auth.js session, or the booking
cookie plus a succeeded payment (`getEntitledTrack`). The second covers a
customer whose post-payment session mint failed, or who closed the modal and came
back, for the cookie's 2h life. It grants nothing beyond rendering an external
link.

The screen offers two paths — "Talk to a Brain Health Coach" and "Start with
Assessments" (Figma 1988:7030). **Both CTAs are `#` placeholders**: scheduling
and the assessments hand-off are not wired up yet. The Engagement App link that
used to live here, targeting `NEXT_PUBLIC_ENGAGEMENT_APP_URL`, is gone;
`EngagementAppCta.tsx` is still on disk, unused. Restoring a real destination
here is what makes this screen a hand-off again.

---

## Fulfilment runs twice, on purpose

Two paths race after a successful payment, and either may win:

- **Client path** — Embedded Checkout's `onComplete` → `finalizeCheckoutSession`.
  Fast, gives the customer immediate feedback, and is the only path that signs
  them in (it is the one with a browser to set a cookie on).
- **Webhook path** — Stripe → `POST /api/stripe/webhook` →
  `handleStripeWebhook`. The source of truth; survives a browser that closed
  mid-flow.

Both call `recordSucceededPayment`, which is idempotent. Its `firstWrite` flag is
the exactly-once signal that gates the audit row and the receipt email — so a
redelivered event doesn't double-charge the audit log or email the customer
twice.

The webhook — and only the webhook — then registers + enrolls the payer with
Linus (`registerAndEnrollUserById`, `retryOnContention: true`). It runs on every
delivery, not just `firstWrite`, because it is idempotent and a delivery that
recorded the payment but died before registering must still be covered.

Failure handling splits on the state's `retryable` flag, which is what keeps this
from repeating pbh-ek8: a transient failure (Linus 5xx/429, DB, a concurrent
registration still in flight) **throws** → 500 → Stripe redelivers, which is the
recovery mechanism; a permanent one (no date of birth, a Linus 4xx) is logged and acknowledged, because three days of redeliveries will not make
that subject valid. Either way the customer is already on `/welcome` and sees
none of it.

> The webhook is deliberately the **only** endpoint. Stripe endpoints are
> account-scoped and Stripe fans every event out to all of them, so a second one
> would process every payment twice. See the comment in
> `apps/marketing/src/app/api/stripe/webhook/route.ts`.

---

## Emails

All sends go through `packages/booking/src/server/send-email.ts`, which is
env-gated (`RESEND_API_KEY`), never throws, and writes an `email_sent` audit row.
Emails carry links only — never assessment results or report content.

| Email | Fired from | Trigger |
|---|---|---|
| Welcome | `email-verified.ts` | address proven at Auth0 |
| Payment receipt | `fulfill.ts` | first `succeeded` write |
| Payment failed | `fulfill.ts` | first `failed` write per intent, unless already paid |
| Payment refunded | `fulfill.ts` | `charge.refunded` |

Welcome deliberately fires on **verification**, not signup: the flow is blocked on
Auth0, and two emails arriving together buries the one the
customer has to act on.

Every link is built from `siteBaseUrl()` in `@pbh/emails` (`BOOKING_BASE_URL` →
`VERCEL_URL` → `localhost:3000`).

`sendAssessmentReadyEmail` still exists but nothing calls it: its only caller was
`register-and-enroll.ts`, now dormant. There is no "report ready" email either —
reports are read in the Engagement App, which owns notifying about them.

---

## Four signed values, easily confused

| Token | Signed with | TTL | Single-use via |
|---|---|---|---|
| Email verification | none — Auth0 owns the code | Auth0's OTP expiry | Auth0-side, single-use |
| Booking cookie (`pbh_booking_session`) | `BOOKING_RESUME_SECRET` | 2h | no — re-readable until expiry |
| Consent stamp (`consentStamp` form field) | `BOOKING_RESUME_SECRET`, domain-tagged | none, by design | no — it is a label, not an authorization |
| Sign-in | Auth0 owns it entirely | Auth0's OTP expiry | Auth0-side, single-use |

There used to be another — the cross-app payment handoff, signed with
`AUTH_HANDOFF_SECRET`. It existed only to carry a session across an origin
boundary that no longer exists.

The stamp and the cookie share a key, so each is signed over a domain tag
(`signing.ts`) — their formats both end in `.<hmac>`, and without the tag a
customer could paste their own cookie into the consent form and have it recorded
as the terms version.

### Session lifetimes

15-minute inactivity timeout, 8-hour absolute cap, 15-minute single-use sign-in
link — the automatic-logoff control set from PBH's compliance review. The values,
the reasoning, and what was considered and dropped live in
[`auth.md`](./auth.md#hipaa-automatic-logoff-controls); they are deliberately
recorded in one place so the numbers here can't drift from the ones in the code.

---

## Alternative entry: signing in

Independent of booking. `/login` → Auth0 → back to `/welcome`. The `signIn`
callback rejects an address with no PBH account, so signing in can never create
one — and because the rejection happens before Auth.js reaches the adapter, no
row of any kind is written for a stranger.

Used by anyone returning after the booking cookie has expired. It is the same
door the booking flow uses mid-signup, which is why an abandoned booking can be
picked up simply by signing in.

The magic link that used to live here was removed in Sep 2026; see
[`auth.md`](./auth.md), particularly what happened to the enumeration throttle.

---

## Failure modes

Each of these has actually happened:

| Symptom | Cause |
|---|---|
| Signup throws | `BOOKING_RESUME_SECRET` missing — it signs the booking cookie |
| Every step after signup says "We couldn't find your booking" | The `pbh_booking_session` cookie is absent, expired (2h), or signed with a different `BOOKING_RESUME_SECRET` than the one reading it |
| Welcome screen's buttons do nothing | Expected — both are `#` until scheduling and the assessments hand-off land |
| No code arrives; flow stalls at Auth0 | Auth0-side: the passwordless Email connection is off, has "Disable Sign Ups" on, or the tenant has no real email provider. Check Auth0 → Monitoring → Logs, not ours |
| Session silently never found | Cookie-name mismatch: Auth.js derives the `__Secure-` prefix from the request protocol, not `NODE_ENV` |

`"Couldn't register with Linus (status …)"` no longer reaches a customer — it is
logged by the webhook instead. A 500 means an `education` value outside Linus's
set (`pbh-a0n`) and a 503 means Linus itself is down; the 503 is retried by
Stripe's redeliveries, the 500 is not (it is a permanent 4xx-class data problem
from our side and needs the row fixed).

---

## Known gaps

Documented so nobody mistakes them for intent:

- **A registration that never succeeds is only a log line.** The webhook retries
  transient failures through Stripe's redeliveries, but once those are exhausted
  (or the failure is permanent — no DOB, a Linus 4xx) the customer holds a paid
  row with no `linus_participant_id` and nothing notices. Needs an alert or a
  reconciliation job over that state; tracked on `pbh-3cy`.
- **Comprehensive ($449) provisions exactly what Basic ($149) does** — the same
  three Linus campaigns. There is no per-package fulfilment, and the consent copy is still the
  wellness + HIPAA NPP text rather than anything written for a diagnostic
  service. Tracked on `pbh-eaj`.
- **The account-enumeration bound now lives in Auth0**, not in our code, and is
  unverified. See [`auth.md`](./auth.md) — it is the open compliance item from
  removing the magic link.
- **Retired columns still in the schema** — `users.welcome_seen_at`,
  `users.password_hash`, `payments.handoff_consumed_at`. Left in place so a
  revert stays clean; a follow-up drops them.
