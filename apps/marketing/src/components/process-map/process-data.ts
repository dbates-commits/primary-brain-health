import type { Lane, ProcessEdge, ProcessNode } from "./process-model";

/**
 * The journey, as it runs on staging today.
 *
 * Sourced from `docs/booking-flow.md` (the step table and the state machine),
 * `docs/stripe-integration.md` (the outbound calls table) and
 * `docs/linus/api-integration.md`. Where this file and those documents
 * disagree, the documents are right — and where they and the code disagree,
 * `resolveBookingResumeState` is right. Nothing here is derived from the
 * running code, so it goes stale the way a diagram does: change the flow,
 * change this file.
 *
 * **Sign-in is the magic link.** `tuily/auth0-provider` is unmerged; if it
 * lands, the confirmation-link mechanism below disappears entirely — email
 * verification moves to Auth0 and `/booking/confirm` goes with it.
 */

export const POOL_LABEL = "Primary Brain Health";

export const LANES: Lane[] = [
  { id: "marketing", label: "Marketing site", y: 30, height: 200 },
  { id: "booking", label: "Booking", y: 240, height: 170 },
  { id: "payment", label: "Payment", y: 420, height: 230 },
  { id: "after", label: "After payment", y: 660, height: 210 },
];

export const MAP_WIDTH = 2180;
export const MAP_HEIGHT = 900;

export const NODES: ProcessNode[] = [
  // ---- Marketing site ----
  {
    id: "arrive",
    kind: "start",
    lane: "marketing",
    x: 150,
    y: 105,
    name: "Visitor arrives",
    description:
      "Someone lands on primarybrainhealth.com. Nothing is known about them and nothing is written down.",
    systems: [],
    writes: [],
    sends: [],
    owner: {
      package: "marketing",
      file: "apps/marketing/src/app/page.tsx",
      team: "Web",
    },
    state: "built",
  },
  {
    id: "landing",
    kind: "user",
    lane: "marketing",
    x: 320,
    y: 105,
    name: "Reads the page",
    description:
      "The marketing page, rendered from TinaCMS content, with the signup card and the two package prices on it.",
    systems: [],
    writes: [],
    sends: [],
    owner: {
      package: "marketing",
      file: "apps/marketing/src/components/booking/BookingSection.tsx",
      team: "Web",
    },
    state: "built",
  },
  {
    id: "cta",
    kind: "gateway-xor",
    lane: "marketing",
    x: 490,
    y: 105,
    name: "Starts the booking?",
    description:
      "Either they fill in the signup card or they leave. There is no other entry to the flow.",
    systems: [],
    writes: [],
    sends: [],
    owner: {
      package: "marketing",
      file: "apps/marketing/src/components/booking/BookingSection.tsx",
      team: "Web",
    },
    state: "built",
  },
  {
    id: "bounce",
    kind: "end",
    lane: "marketing",
    x: 490,
    y: 190,
    name: "Leaves",
    description: "No account, no row, nothing to follow up. We never know.",
    systems: [],
    writes: [],
    sends: [],
    owner: {
      package: "marketing",
      file: "apps/marketing/src/app/page.tsx",
      team: "Web",
    },
    state: "built",
  },

  // ---- Booking ----
  {
    id: "signup",
    kind: "user",
    lane: "booking",
    x: 660,
    y: 325,
    name: "Signs up",
    description:
      "Name, email and the chosen package. The package is stored on the row because the confirmation gate destroys in-memory state before payment.",
    systems: ["neon"],
    writes: [
      "users row, incl. selected_package_key",
      "audit: signup",
      "pbh_booking_session cookie — signed, 2 hours",
    ],
    sends: [],
    owner: {
      package: "@pbh/booking",
      file: "packages/booking/src/server/signup-core.ts",
      team: "Platform",
    },
    failure: "BOOKING_RESUME_SECRET missing → signup throws; it is what signs the booking cookie.",
    state: "built",
    plannedNote:
      "for me | for someone else — the marker Stefanie asked for, kept on the signup event and carried to payment and paid so the funnel can be split.",
  },
  {
    id: "send_confirm",
    kind: "service",
    lane: "booking",
    x: 830,
    y: 325,
    name: "Sends the confirmation",
    description:
      "A random token, SHA-256 hashed at rest, good for 24 hours and single-use. The flow stops here until the link is clicked.",
    systems: ["resend", "neon"],
    writes: ["booking_email_verifications row", "audit: email_verification_sent"],
    sends: ["confirm-email"],
    owner: {
      package: "@pbh/booking",
      file: "packages/booking/src/server/email-verification.ts",
      team: "Platform",
    },
    failure:
      "RESEND_API_KEY unset → sends become logged no-ops and the URL is printed to the server console. They can ask for another, once a minute.",
    state: "built",
  },
  {
    id: "click_link",
    kind: "user",
    lane: "booking",
    x: 1000,
    y: 325,
    name: "Clicks the link",
    description:
      "Possibly on another device. Burns the token, marks the address proven, renews the booking cookie and drops them back into the flow. The welcome email fires here, not at signup — two emails at once buries the one they have to act on.",
    systems: ["resend", "neon"],
    writes: [
      "booking_email_verifications.consumed_at",
      "users.email_verified",
      "audit: email_verified",
    ],
    sends: ["welcome"],
    owner: {
      package: "marketing",
      file: "apps/marketing/src/app/booking/confirm/route.ts",
      team: "Platform",
    },
    failure: "Expired or already used → they are offered a fresh link.",
    state: "built",
  },
  {
    id: "resume",
    kind: "gateway-xor",
    lane: "booking",
    x: 1170,
    y: 325,
    name: "How far did they get?",
    description:
      "Worked out from what is stored, every time — nothing is held in the browser. The modal reopens at confirm, details, consent, payment or done.",
    systems: ["neon"],
    writes: [],
    sends: [],
    owner: {
      package: "@pbh/booking",
      file: "packages/booking/src/server/resume.ts",
      team: "Platform",
    },
    failure:
      "No booking cookie, or one signed with a different secret → every step says “We couldn't find your booking”.",
    state: "built",
  },
  {
    id: "details",
    kind: "user",
    lane: "booking",
    x: 1340,
    y: 325,
    name: "Gives their details",
    description:
      "Date of birth, ZIP, phone, gender and education — the demographics Linus needs to register them. The name fields are the account holder's own: the person assessed is always the account holder.",
    systems: ["neon"],
    writes: ["users — demographics and the account holder's name"],
    sends: [],
    owner: {
      package: "@pbh/booking",
      file: "packages/booking/src/server/details-core.ts",
      team: "Platform",
    },
    failure: "Date of birth is required; without it Linus cannot register them at all.",
    state: "built",
  },
  {
    id: "consent",
    kind: "user",
    lane: "booking",
    x: 1510,
    y: 325,
    name: "Consents",
    description:
      "Wellness terms and the HIPAA notice behind one checkbox, recorded against a signed stamp naming the words that were on screen — not against a re-query of the CMS.",
    systems: ["neon"],
    writes: ["two consents rows — version, ip_hash, user_agent"],
    sends: [],
    owner: {
      package: "@pbh/booking",
      file: "packages/booking/src/server/consent-core.ts",
      team: "Platform",
    },
    failure:
      "Append-only: consenting again adds rows rather than replacing them (pbh-3u1). A missing or bad stamp is refused, not guessed.",
    state: "built",
  },

  // ---- Payment ----
  {
    id: "checkout",
    kind: "service",
    lane: "payment",
    x: 1680,
    y: 490,
    name: "Opens the payment step",
    description:
      "Claims a Stripe customer onto the row and creates an embedded Checkout session. The card form is Stripe's, inside our page.",
    systems: ["stripe", "neon"],
    writes: ["users.stripe_customer_id", "audit: payment_pending"],
    sends: [],
    owner: {
      package: "@pbh/booking",
      file: "packages/booking/src/server/checkout-core.ts",
      team: "Platform",
    },
    failure: "There is no already-paid guard here — a second charge is reachable (pbh-ypf).",
    state: "built",
  },
  {
    id: "pays",
    kind: "user",
    lane: "payment",
    x: 1850,
    y: 490,
    name: "Pays",
    description:
      "Card details go straight to Stripe. They never pass through us, and no card data is stored in Neon.",
    systems: ["stripe"],
    writes: [],
    sends: [],
    owner: {
      package: "@pbh/booking",
      file: "packages/booking/src/PaymentStep.tsx",
      team: "Platform",
    },
    failure: "Declined → they stay on the step and can try another card.",
    state: "built",
  },
  {
    id: "paid",
    kind: "gateway-xor",
    lane: "payment",
    x: 2010,
    y: 490,
    name: "Payment succeeded?",
    description: "Decided on what Stripe says, never on what the browser says.",
    systems: ["stripe"],
    writes: [],
    sends: [],
    owner: {
      package: "@pbh/booking",
      file: "packages/booking/src/server/fulfill.ts",
      team: "Platform",
    },
    state: "built",
  },
  {
    id: "declined",
    kind: "end",
    lane: "payment",
    x: 2010,
    y: 600,
    name: "Declined",
    description: "The failure is recorded once per intent, unless they have already paid.",
    systems: ["neon", "resend"],
    writes: ["payments row — failed", "audit: payment_failed"],
    sends: ["payment-failed"],
    owner: {
      package: "@pbh/booking",
      file: "packages/booking/src/server/fulfill.ts",
      team: "Platform",
    },
    state: "built",
  },
  {
    id: "recorded",
    kind: "service",
    lane: "payment",
    x: 1680,
    y: 600,
    name: "Recorded, and signed in",
    description:
      "The client path: it asks Stripe directly rather than trusting the browser, records the payment exactly once, and is the only path that signs them in — it is the one with a browser to set a cookie on.",
    systems: ["stripe", "neon", "resend"],
    writes: [
      "payments row, incl. package_key",
      "sessions row + cookie",
      "audit: payment_succeeded, login",
    ],
    sends: ["payment-receipt"],
    owner: {
      package: "@pbh/booking",
      file: "packages/booking/src/server/fulfill.ts",
      team: "Platform",
    },
    failure: "If this fails the charge still stands — the webhook below is the backstop.",
    state: "built",
  },
  {
    id: "webhook",
    kind: "service",
    lane: "payment",
    x: 1850,
    y: 600,
    name: "Stripe calls us back",
    description:
      "The source of truth, and deliberately the only Stripe endpoint we have — Stripe fans every event out to all of them. It makes the same write again (a repeat changes nothing) and is the only place that registers and enrols the payer with Linus.",
    systems: ["stripe", "neon", "linus"],
    writes: [
      "payments row — the same write, idempotent",
      "users.linus_participant_id",
      "one linus_enrollments row per campaign",
    ],
    sends: [],
    owner: {
      package: "@pbh/booking",
      file: "packages/booking/src/server/webhook.ts",
      team: "Platform",
    },
    failure:
      "Linus down → it throws, Stripe redelivers. A permanent failure (no DOB, a Linus 4xx) is only a log line: the customer holds a paid row with no participant id and nothing notices (pbh-3cy).",
    state: "built",
  },

  // ---- After payment ----
  {
    id: "welcome",
    kind: "user",
    lane: "after",
    x: 1680,
    y: 730,
    name: "Welcome",
    description:
      "“Choose How to Start” — two cards: talk to a Brain Health Coach, or start with assessments. Reached with either an Auth.js session or the booking cookie plus a succeeded payment.",
    systems: ["neon"],
    writes: [],
    sends: [],
    owner: {
      package: "marketing",
      file: "apps/marketing/src/app/welcome/page.tsx",
      team: "Web",
    },
    failure: "Both cards are `#` placeholders. This is where it stops today.",
    state: "built",
  },
  {
    id: "picks",
    kind: "gateway-xor",
    lane: "after",
    x: 1850,
    y: 730,
    name: "Picks a card",
    description: "Either card. Neither goes anywhere.",
    systems: [],
    writes: [],
    sends: [],
    owner: {
      package: "marketing",
      file: "apps/marketing/src/components/welcome/WelcomeActions.tsx",
      team: "Web",
    },
    state: "blocked",
  },
  {
    id: "dead_assessments",
    kind: "end",
    lane: "after",
    x: 2010,
    y: 700,
    name: "No Engagement App address",
    description:
      "The assessments hand-off has no destination: no Engagement App URL, and no agreed way for a customer to arrive there already signed in. Linus owns the first half of that answer.",
    systems: ["linus"],
    writes: [],
    sends: [],
    owner: {
      package: "marketing",
      file: "apps/marketing/src/components/welcome/EngagementAppCta.tsx",
      team: "Linus, then Web",
    },
    state: "blocked",
  },
  {
    id: "dead_coach",
    kind: "end",
    lane: "after",
    x: 2010,
    y: 810,
    name: "No way to book a Coach call",
    description: "No scheduling tool has been picked and nothing is built. Ours to answer.",
    systems: [],
    writes: [],
    sends: [],
    owner: {
      package: "marketing",
      file: "apps/marketing/src/components/welcome/WelcomeActions.tsx",
      team: "Web",
    },
    state: "blocked",
  },
];

export const EDGES: ProcessEdge[] = [
  { from: "arrive", to: "landing" },
  { from: "landing", to: "cta" },
  { from: "cta", to: "signup" },
  { from: "cta", to: "bounce" },
  { from: "signup", to: "send_confirm" },
  { from: "send_confirm", to: "click_link" },
  { from: "click_link", to: "resume" },
  { from: "resume", to: "details" },
  { from: "details", to: "consent" },
  { from: "consent", to: "checkout" },
  { from: "checkout", to: "pays" },
  { from: "pays", to: "paid" },
  // Two paths race after a success, and either may win — see `recorded`.
  { from: "paid", to: "recorded", label: "yes" },
  { from: "paid", to: "webhook" },
  { from: "paid", to: "declined", label: "no" },
  { from: "recorded", to: "welcome" },
  { from: "welcome", to: "picks" },
  { from: "picks", to: "dead_assessments", label: "assessments" },
  { from: "picks", to: "dead_coach", label: "coaching" },
];
