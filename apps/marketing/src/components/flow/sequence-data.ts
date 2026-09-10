/**
 * The booking flow as a sequence diagram, in data.
 *
 * This is a transcription of the Figma board "PBH — Overview"
 * (file `xriyvvAtrcgCUGxs5Qg59h`, frame "Booking flow — sequence"), kept as
 * data so the React Flow screen and the Figma frame can be diffed by eye rather
 * than redrawn. Change the board, change this file — nothing here is derived
 * from the running code, so it goes stale the same way the board does.
 *
 * `planned` text is the "for me / for someone else" marker: asked for, not
 * built. It renders in aqua behind a ◇ on both surfaces.
 */

/** Index into {@link PARTICIPANTS} — a column of the diagram. */
export type Lane = 0 | 1 | 2 | 3 | 4 | 5;

export type MessageTone = "default" | "blocked" | "dead-end";

export type Message = {
  from: Lane;
  to: Lane;
  label: string;
  /** Appended after the label in the planned-work colour, behind a ◇. */
  planned?: string;
  tone?: MessageTone;
};

export type DetailRow = {
  label: string;
  value: string;
  /** Renders the whole row in the planned-work colour, behind a ◇. */
  planned?: boolean;
};

export type Step = {
  number: string;
  title: string;
  blurb: string;
  messages: Message[];
  details: DetailRow[];
};

export const PARTICIPANTS = [
  "Customer",
  "Our app",
  "Neon",
  "Resend",
  "Stripe",
  "Linus",
] as const;

export const DIAGRAM_TITLE = "Buying an assessment, step by step";

export const DIAGRAM_EYEBROW =
  "PRIMARY BRAIN HEALTH · STAGING, AS IT RUNS TODAY";

export const DIAGRAM_LEDE =
  "Read down the left for the story, across the middle for who is involved, " +
  "and on the right for what each step actually costs us — what it writes " +
  "down, what it emails, who it calls and how it fails. Nothing here is " +
  "deployed to primarybrainhealth.com yet.";

export const DIAGRAM_LEGEND = "Anything marked ◇ is not built yet.";

export const STEPS: Step[] = [
  {
    number: "01",
    title: "Lands on the site",
    blurb: "The marketing page, with the signup card on it.",
    messages: [
      { from: 0, to: 1, label: "opens the site" },
      { from: 1, to: 0, label: "the page, and the form" },
    ],
    details: [
      { label: "writes", value: "—" },
      { label: "sends", value: "—" },
      { label: "calls", value: "—" },
      { label: "fails", value: "—" },
    ],
  },
  {
    number: "02",
    title: "Signs up",
    blurb:
      "Name, email, and who the assessment is for — then a screen telling " +
      "them to check their inbox.",
    messages: [
      { from: 0, to: 1, label: "name, email, package,", planned: "who it’s for" },
      { from: 1, to: 2, label: "creates the account" },
      { from: 1, to: 0, label: "a signed cookie, good for 2 hours" },
      { from: 1, to: 3, label: "confirmation email — link lasts 24h" },
      { from: 1, to: 0, label: "⛔ blocked until they click it", tone: "blocked" },
    ],
    details: [
      { label: "writes", value: "users row · a hashed 24h token · audit: signup" },
      { label: "sends", value: "confirm-email" },
      { label: "calls", value: "Resend" },
      {
        label: "fails",
        value: "Send fails → they can ask for another, once a minute",
      },
      {
        label: "marks",
        value:
          "for me | for someone else — kept on signup, payment and paid",
        planned: true,
      },
    ],
  },
  {
    number: "03",
    title: "Clicks the link",
    blurb: "Dropped back into the flow, wherever they had got to.",
    messages: [
      { from: 0, to: 1, label: "the link — possibly on another device" },
      { from: 1, to: 2, label: "burns the token, marks the email proven" },
      { from: 1, to: 3, label: "welcome email" },
      { from: 1, to: 0, label: "back to the booking, cookie renewed" },
    ],
    details: [
      { label: "writes", value: "token consumed · users.email_verified · audit" },
      { label: "sends", value: "welcome" },
      { label: "calls", value: "Resend" },
      { label: "fails", value: "Expired or already used → offered a fresh link" },
    ],
  },
  {
    number: "04",
    title: "Picks up where they left off",
    blurb: "The booking reopens at whatever step they had reached.",
    messages: [
      { from: 0, to: 1, label: "comes back" },
      { from: 1, to: 2, label: "works out how far they got, from what is stored" },
      { from: 1, to: 0, label: "opens at the right step" },
    ],
    details: [
      { label: "writes", value: "—" },
      { label: "sends", value: "—" },
      { label: "calls", value: "—" },
      {
        label: "fails",
        value: "Nothing is held in the browser — it is worked out again each time",
      },
    ],
  },
  {
    number: "05",
    title: "Gives their details",
    blurb: "Date of birth, ZIP, phone, gender, education.",
    messages: [
      { from: 0, to: 1, label: "the form" },
      { from: 1, to: 2, label: "saves them onto the account" },
      { from: 1, to: 0, label: "on to consent" },
    ],
    details: [
      {
        label: "writes",
        value: "users — the demographics Linus needs to register them",
      },
      { label: "sends", value: "—" },
      { label: "calls", value: "—" },
      {
        label: "fails",
        value: "Date of birth is required; without it Linus cannot register them",
      },
    ],
  },
  {
    number: "06",
    title: "Consents",
    blurb: "Wellness terms and the HIPAA notice, behind one checkbox.",
    messages: [
      { from: 0, to: 1, label: "ticks the box" },
      { from: 1, to: 2, label: "records both consents" },
      { from: 1, to: 0, label: "on to payment" },
    ],
    details: [
      {
        label: "writes",
        value: "two consents rows — version, hashed IP, user agent",
      },
      { label: "sends", value: "—" },
      { label: "calls", value: "—" },
      {
        label: "fails",
        value: "Never overwritten — consenting again adds a row, it replaces nothing",
      },
    ],
  },
  {
    number: "07",
    title: "The payment step opens",
    blurb: "Stripe’s card form, embedded in our page.",
    messages: [
      { from: 0, to: 1, label: "opens the payment step" },
      { from: 1, to: 2, label: "checks they have not already paid" },
      { from: 1, to: 4, label: "creates the customer and the payment session" },
      { from: 1, to: 2, label: "notes that a payment is pending" },
      { from: 1, to: 0, label: "the card form" },
    ],
    details: [
      {
        label: "writes",
        value: "users.stripe_customer_id · audit: payment_pending",
      },
      { label: "sends", value: "—" },
      { label: "calls", value: "Stripe" },
      {
        label: "fails",
        value: "Already paid → refused before a second charge is possible",
      },
    ],
  },
  {
    number: "08",
    title: "Pays",
    blurb: "Enters the card. It goes straight to Stripe — it never passes through us.",
    messages: [
      { from: 0, to: 4, label: "card details, direct to Stripe" },
      { from: 4, to: 0, label: "cleared" },
    ],
    details: [
      { label: "writes", value: "—" },
      { label: "sends", value: "—" },
      { label: "calls", value: "Stripe" },
      {
        label: "fails",
        value: "Declined → they stay on this step and can try another card",
      },
    ],
  },
  {
    number: "09",
    title: "Recorded, and signed in",
    blurb: "A receipt arrives, and they are signed in without doing anything.",
    messages: [
      { from: 0, to: 1, label: "tells us it went through" },
      { from: 1, to: 4, label: "asks Stripe directly — the browser is not trusted" },
      { from: 1, to: 2, label: "records the payment, exactly once" },
      { from: 1, to: 3, label: "receipt" },
      { from: 1, to: 0, label: "signed in, and a button to continue" },
    ],
    details: [
      { label: "writes", value: "payments row · sessions row + cookie · audit" },
      { label: "sends", value: "payment-receipt" },
      { label: "calls", value: "Stripe" },
      {
        label: "fails",
        value: "If this fails the charge still stands — the step below catches it",
      },
    ],
  },
  {
    number: "10",
    title: "Stripe calls us back",
    blurb:
      "Nothing at all. Look at the Customer line: it is untouched the whole way down.",
    messages: [
      { from: 4, to: 1, label: "payment_intent.succeeded — signed, server to server" },
      { from: 1, to: 2, label: "the same write again — a repeat changes nothing" },
      { from: 1, to: 5, label: "registers them, enrols them in three campaigns" },
      { from: 1, to: 2, label: "stores the participant id" },
      { from: 1, to: 3, label: "assessments are ready" },
    ],
    details: [
      { label: "writes", value: "users.linus_participant_id · one row per enrolment" },
      { label: "sends", value: "assessment-ready" },
      { label: "calls", value: "Linus" },
      {
        label: "fails",
        value: "Linus down → Stripe just retries. The customer never finds out",
      },
    ],
  },
  {
    number: "11",
    title: "Welcome",
    blurb: "“Choose How to Start” — two cards: coaching, or assessments.",
    messages: [
      { from: 0, to: 1, label: "arrives at /welcome" },
      { from: 1, to: 2, label: "checks they actually paid" },
      { from: 1, to: 0, label: "the two cards" },
    ],
    details: [
      { label: "writes", value: "—" },
      { label: "sends", value: "—" },
      { label: "calls", value: "—" },
      {
        label: "fails",
        value: "⚠ Both cards link to nothing. This is where it stops today",
      },
    ],
  },
  {
    number: "12",
    title: "Blocked",
    blurb: "They have paid, and there is nowhere to send them.",
    messages: [
      { from: 0, to: 1, label: "picks either card" },
      {
        from: 1,
        to: 5,
        label: "no Engagement App address — nowhere to send them",
        tone: "dead-end",
      },
      {
        from: 1,
        to: 5,
        label: "no way to book a Coach call — no tool chosen, nothing built",
        tone: "dead-end",
      },
    ],
    details: [
      {
        label: "needs",
        value:
          "the Engagement App address, and how a customer arrives already signed in",
      },
      { label: "needs", value: "somewhere to book a Coach call — no tool has been picked" },
      { label: "owner", value: "Linus for the first. Ours for the second" },
      {
        label: "until",
        value: "Both cards stay dead. Everything above this line already works",
      },
    ],
  },
];
