import type { Lane, ProcessEdge, ProcessNode } from "./process-model";

/**
 * The journey, as it runs on staging today.
 *
 * Sourced from `docs/booking-flow.md` (the step table and the state machine),
 * `docs/stripe-integration.md` (the outbound calls table) and
 * `docs/linus/api-integration.md` (the endpoints table). Where this file and
 * those documents disagree, the documents are right — and where they and the
 * code disagree, `resolveBookingResumeState` is right. Nothing here is derived
 * from the running code, so it goes stale the way a diagram does: change the
 * flow, change this file.
 *
 * **Sign-in is the magic link.** `tuily/auth0-provider` is unmerged; if it
 * lands, the confirmation-link mechanism below disappears entirely — email
 * verification moves to Auth0 and `/booking/confirm` goes with it.
 *
 * Positions are on a column grid (see `COL`) so the map reads like lines of
 * text: left to right, then down and back to the left. The three edges that
 * make that jump, and the one that loops back, are drawn as moving dashes —
 * they are the reader's cue that the line continues elsewhere.
 */

export const POOL_LABEL = "Primary Brain Health";

/**
 * The bands, with 20px of clear air between them. That gap is not decoration:
 * it is the corridor the four `wrap` and `loop` flows run along, which is what
 * keeps them from crossing a row of steps on their way back.
 */
export const LANES: Lane[] = [
  { id: "marketing", label: "Marketing site", y: 20, height: 150 },
  { id: "booking", label: "Booking", y: 190, height: 185 },
  { id: "payment", label: "Payment & fulfilment", y: 395, height: 250 },
  { id: "after", label: "After payment", y: 665, height: 220 },
];

/** The column grid every step is placed on. */
const COL = [210, 425, 640, 855, 1070, 1285, 1500, 1715];

/** Row centres, and the corridors between the bands. */
const ROW = { marketing: 95, booking: 265, pay1: 465, pay2: 580, after1: 735, after2: 835 };
const VIA = { toBooking: 180, resend: 212, toPayment: 385, toAfter: 655 };

export const MAP_WIDTH = 1880;
export const MAP_HEIGHT = 900;

export const NODES: ProcessNode[] = [
  // ---- Marketing site ----
  {
    id: "arrive",
    kind: "start",
    lane: "marketing",
    x: COL[0],
    y: ROW.marketing,
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
    x: COL[1],
    y: ROW.marketing,
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
    x: COL[2],
    y: ROW.marketing,
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
    x: COL[3],
    y: ROW.marketing,
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
    x: COL[0],
    y: ROW.booking,
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
    x: COL[1],
    y: ROW.booking,
    name: "Sends the confirmation",
    description:
      "A random token, SHA-256 hashed at rest, good for 24 hours and single-use. The flow stops dead here: nothing downstream is reachable until the address is proven.",
    systems: ["resend", "neon"],
    writes: ["booking_email_verifications row", "audit: email_verification_sent"],
    sends: ["confirm-email"],
    owner: {
      package: "@pbh/booking",
      file: "packages/booking/src/server/email-verification.ts",
      team: "Platform",
    },
    failure:
      "RESEND_API_KEY unset → sends become logged no-ops and the URL is printed to the server console. That is how local testing works.",
    state: "built",
  },
  {
    id: "click_link",
    kind: "user",
    lane: "booking",
    x: COL[2],
    y: ROW.booking,
    name: "Opens the link",
    description:
      "Possibly on another device — the link is the only way past this point, and nothing downstream is reachable until it is opened.",
    systems: [],
    writes: [],
    sends: [],
    owner: {
      package: "marketing",
      file: "apps/marketing/src/app/booking/confirm/route.ts",
      team: "Platform",
    },
    state: "built",
  },
  {
    id: "link_valid",
    kind: "gateway-xor",
    lane: "booking",
    x: COL[3],
    y: ROW.booking,
    name: "Link still good?",
    description:
      "The token is single-use and lasts 24 hours. One click is all it takes — but a link that has already been used, or has aged out, is refused rather than replayed.",
    systems: ["neon"],
    writes: [],
    sends: [],
    owner: {
      package: "@pbh/booking",
      file: "packages/booking/src/server/email-verification.ts",
      team: "Platform",
    },
    failure: "Expired or already used → they are offered a fresh one, once a minute.",
    state: "built",
  },
  {
    id: "verified",
    kind: "service",
    lane: "booking",
    x: COL[4],
    y: ROW.booking,
    name: "Address proven",
    description:
      "Burns the token, marks the address verified and renews the booking cookie. The welcome email fires here rather than at signup — two emails at once buries the one they have to act on.",
    systems: ["resend", "neon"],
    writes: [
      "booking_email_verifications.consumed_at",
      "users.email_verified",
      "audit: email_verified",
    ],
    sends: ["welcome"],
    owner: {
      package: "@pbh/booking",
      file: "packages/booking/src/server/email-verification.ts",
      team: "Platform",
    },
    state: "built",
  },
  {
    id: "resume",
    kind: "service",
    lane: "booking",
    x: COL[5],
    y: ROW.booking,
    name: "Works out where they left off",
    description:
      "Recomputed from what is stored, every time — nothing is held in the browser. The modal reopens at confirm, details, consent, payment or done.",
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
    x: COL[6],
    y: ROW.booking,
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
    x: COL[7],
    y: ROW.booking,
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

  // ---- Payment & fulfilment ----
  {
    id: "checkout",
    kind: "service",
    lane: "payment",
    x: COL[0],
    y: ROW.pay1,
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
    x: COL[1],
    y: ROW.pay1,
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
    state: "built",
  },
  {
    id: "paid",
    kind: "gateway-xor",
    lane: "payment",
    x: COL[2],
    y: ROW.pay1,
    name: "Payment succeeded?",
    description:
      "Decided on what Stripe says, never on what the browser says. Two paths run from a success — the browser's, and Stripe's own callback — and either may win.",
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
    id: "recorded",
    kind: "service",
    lane: "payment",
    x: COL[1],
    y: ROW.pay2,
    name: "Recorded, and signed in",
    description:
      "The browser's path: it asks Stripe directly rather than trusting the page, records the payment exactly once, and is the only path that signs them in — it is the one with a browser to set a cookie on.",
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
    failure: "If this fails the charge still stands — the webhook is the backstop.",
    state: "built",
  },
  {
    id: "declined",
    kind: "end",
    lane: "payment",
    x: COL[3],
    y: ROW.pay2,
    name: "Declined",
    description:
      "Recorded once per intent, unless they have already paid. They stay on the step and can try another card.",
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
    id: "webhook",
    kind: "service",
    lane: "payment",
    x: COL[3],
    y: ROW.pay1,
    name: "Stripe calls us back",
    description:
      "The source of truth, and deliberately the only Stripe endpoint we have — Stripe fans every event out to all of them. It makes the same write again (a repeat changes nothing) and is the only place that hands the payer to Linus.",
    systems: ["stripe", "neon"],
    writes: ["payments row — the same write, idempotent"],
    sends: [],
    owner: {
      package: "@pbh/booking",
      file: "packages/booking/src/server/webhook.ts",
      team: "Platform",
    },
    failure:
      "A transient failure throws so Stripe redelivers; a permanent one is acknowledged and logged, and the customer never finds out.",
    state: "built",
  },
  {
    id: "linus_register",
    kind: "service",
    lane: "payment",
    x: COL[4],
    y: ROW.pay1,
    name: "Registers the subject",
    description:
      "POST /participants, behind an OAuth client-credentials token. The name, email, date of birth, gender and education from the details step become the Linus subject.",
    systems: ["linus", "neon"],
    writes: ["users.linus_participant_id — unique, set on first registration"],
    sends: [],
    owner: {
      package: "@pbh/linus",
      file: "packages/booking/src/server/register-and-enroll.ts",
      team: "Platform",
    },
    failure:
      "No date of birth, or an education value outside Linus's set (pbh-a0n), is permanent: the customer holds a paid row with no participant id and nothing notices (pbh-3cy). The API is US-only.",
    state: "built",
  },
  {
    id: "linus_enroll",
    kind: "service",
    lane: "payment",
    x: COL[5],
    y: ROW.pay1,
    name: "Enrols in three campaigns",
    description:
      "POST /participants/{id}/enrollments, once per campaign, with the campaign ids chosen by environment. A GET on the same path gives the active set back.",
    systems: ["linus", "neon"],
    writes: ["one linus_enrollments row per campaign"],
    sends: [],
    owner: {
      package: "@pbh/linus",
      file: "packages/booking/src/server/register-and-enroll.ts",
      team: "Platform",
    },
    failure:
      "Only partially idempotent — a re-POST is safe for assigned enrolments only. Comprehensive ($449) provisions exactly what Basic ($149) does (pbh-eaj).",
    state: "built",
  },
  {
    id: "assessments_ready",
    kind: "end",
    lane: "payment",
    x: COL[6],
    y: ROW.pay1,
    name: "Assessments ready",
    description:
      "They exist in Linus, and the reports are fetched there (GET …/reports/patient-report). Nothing is emailed about it: the Engagement App owns telling the customer.",
    systems: ["linus"],
    writes: [],
    sends: [],
    owner: {
      package: "@pbh/linus",
      file: "packages/linus/src/client.ts",
      team: "Linus",
    },
    failure: "Ready, and unreachable — see the two dead ends below.",
    state: "built",
  },

  // ---- After payment ----
  {
    id: "welcome",
    kind: "user",
    lane: "after",
    x: COL[0],
    y: ROW.after1,
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
    x: COL[1],
    y: ROW.after1,
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
    x: COL[2],
    y: ROW.after1,
    name: "No Engagement App address",
    description:
      "The assessments are ready in Linus and there is nowhere to send the customer: no Engagement App URL, and no agreed way to arrive there already signed in. Linus owns the first half of that answer.",
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
    x: COL[2],
    y: ROW.after2,
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
  { from: "cta", to: "bounce", label: "no" },
  { from: "cta", to: "signup", label: "yes", kind: "wrap", via: VIA.toBooking },

  { from: "signup", to: "send_confirm" },
  { from: "send_confirm", to: "click_link" },
  { from: "click_link", to: "link_valid" },
  { from: "link_valid", to: "verified", label: "yes" },
  {
    from: "link_valid",
    to: "send_confirm",
    label: "no · another link, once a minute",
    kind: "loop",
    via: VIA.resend,
  },
  { from: "verified", to: "resume" },
  { from: "resume", to: "details" },
  { from: "details", to: "consent" },
  { from: "consent", to: "checkout", kind: "wrap", via: VIA.toPayment },

  { from: "checkout", to: "pays" },
  { from: "pays", to: "paid" },
  { from: "paid", to: "recorded", label: "yes" },
  { from: "paid", to: "declined", label: "no" },
  // Stripe's own callback, running beside the browser's path rather than after
  // it — either may win, and both writes are idempotent.
  { from: "paid", to: "webhook", label: "and, server to server", kind: "async" },
  { from: "webhook", to: "linus_register" },
  { from: "linus_register", to: "linus_enroll" },
  { from: "linus_enroll", to: "assessments_ready" },

  { from: "recorded", to: "welcome", kind: "wrap", via: VIA.toAfter },
  { from: "welcome", to: "picks" },
  { from: "picks", to: "dead_assessments", label: "assessments" },
  { from: "picks", to: "dead_coach", label: "coaching" },
];
