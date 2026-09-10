/**
 * Every outside service the site depends on, in plain words.
 *
 * Written for someone who does not work in the code: what the thing is, what it
 * does for us, who owns it, and what exists in each environment. Sourced from
 * `docs/database.md`, `docs/stripe-integration.md`,
 * `docs/linus/api-integration.md`, `docs/auth.md` and the `.env.example` in this
 * app.
 *
 * Where the repository does not know who owns an account, the owner reads
 * "To confirm" rather than a guess. Those are the rows that need a human.
 */

export type ServiceStatus = "in-use" | "partly" | "not-set-up";

export type Environment = {
  name: string;
  detail: string;
};

export type Service = {
  id: string;
  name: string;
  /** The one-line category, e.g. "Hosting". */
  kind: string;
  status: ServiceStatus;
  /** What the thing is, to someone who has never heard of it. */
  what: string;
  /** What it does for Primary Brain Health specifically. */
  weUseItFor: string;
  /** Who owns the account, and who looks after it day to day. */
  owner: string;
  environments: Environment[];
  /** What happens to a customer if it stops working. */
  ifItBreaks: string;
  /** Where the settings live, for someone who does work in the code. */
  configuredIn: string;
};

export const STATUS_LABELS: Record<ServiceStatus, string> = {
  "in-use": "In use",
  partly: "Partly wired",
  "not-set-up": "Not set up yet",
};

export const SERVICES: Service[] = [
  {
    id: "vercel",
    name: "Vercel",
    kind: "Hosting",
    status: "in-use",
    what: "The company that runs the website. Every time code is merged, Vercel rebuilds the site and puts the new version online.",
    weUseItFor:
      "Serving primarybrainhealth.com, and giving every pull request its own throwaway copy of the site to review before it goes live.",
    owner: "Vercel team “dbates-commits-projects”. To confirm: who holds the billing account.",
    environments: [
      {
        name: "Production",
        detail: "primarybrainhealth.com — what customers see. Built from the main branch.",
      },
      {
        name: "Preview",
        detail: "One URL per pull request, plus the staging branch. Same code, separate data.",
      },
      {
        name: "Local",
        detail: "An engineer's own machine, on localhost.",
      },
    ],
    ifItBreaks: "The site is down. There is no second host.",
    configuredIn: "apps/marketing/next.config.ts, and the Vercel dashboard",
  },
  {
    id: "neon",
    name: "Neon",
    kind: "Database",
    status: "in-use",
    what: "The database: the filing cabinet that remembers customers between visits. Neon is a hosted version of Postgres, a standard, decades-old database.",
    weUseItFor:
      "Accounts, the details someone gives during booking, their consent records, a mirror of every payment, and an append-only log of what happened when.",
    owner: "Scale plan with a signed BAA (the HIPAA agreement). To confirm: whose account.",
    environments: [
      { name: "Production", detail: "The production branch — live customer rows." },
      {
        name: "Preview",
        detail:
          "One shared preview branch behind every pull request. Test data only, never live rows.",
      },
      { name: "Local", detail: "The dev branch, for engineers." },
    ],
    ifItBreaks:
      "Nobody can sign up, resume a booking or pay. Card details are unaffected — they are never stored here.",
    configuredIn: "packages/db, docs/database.md",
  },
  {
    id: "stripe",
    name: "Stripe",
    kind: "Payments",
    status: "in-use",
    what: "The payment company. It shows the card form, takes the money, and tells us afterwards whether it worked.",
    weUseItFor:
      "Charging for the assessment packages, emailing nothing itself, and calling us back on a private address when a payment settles — that callback is what we trust, not the browser.",
    owner: "To confirm: who owns the Stripe account and its payouts.",
    environments: [
      { name: "Production", detail: "Live keys and a live webhook endpoint." },
      {
        name: "Preview",
        detail: "Test keys and a test webhook. Test cards only — no real money moves.",
      },
      {
        name: "Local",
        detail: "Test keys, with the webhook forwarded to the laptop by the Stripe CLI.",
      },
    ],
    ifItBreaks:
      "Nobody can pay. Bookings already paid for are unaffected — the record is in our database too.",
    configuredIn: "packages/payments, docs/stripe-integration.md",
  },
  {
    id: "resend",
    name: "Resend",
    kind: "Email",
    status: "in-use",
    what: "The service that actually delivers our emails to an inbox. Not marketing email — the ones the flow depends on.",
    weUseItFor:
      "Six emails: confirm your address, welcome, payment receipt, payment failed, payment refunded, and the sign-in link.",
    owner: "BAA available on the Pro tier. To confirm: whose account, and which tier we are on.",
    environments: [
      { name: "Production", detail: "Real sends from the live domain." },
      { name: "Preview", detail: "Real sends, to whoever is testing." },
      {
        name: "Local",
        detail:
          "Usually switched off: with no key set, sends are logged and the link is printed to the console instead.",
      },
    ],
    ifItBreaks:
      "The confirmation email never arrives and the booking stalls at that step — the flow is blocked there until the link is clicked.",
    configuredIn: "packages/emails, packages/booking/src/server/send-email.ts",
  },
  {
    id: "linus",
    name: "Linus Health",
    kind: "Assessments",
    status: "in-use",
    what: "The clinical partner. Their software runs the actual brain-health assessments and holds the results; we never see the answers.",
    weUseItFor:
      "Registering a paying customer as a participant, and enrolling them in three assessment campaigns. Their Engagement App is where the customer would take the assessments.",
    owner: "Linus Health. Ours to call their API; theirs to run it.",
    environments: [
      { name: "Production", detail: "Live participants and live campaign ids." },
      {
        name: "Preview and local",
        detail: "Linus's sandbox, with separate campaign ids.",
      },
    ],
    ifItBreaks:
      "The customer still pays and still gets a receipt; the hand-off retries in the background. A permanent failure is only a log line today — nothing alerts anyone.",
    configuredIn: "packages/linus, docs/linus/api-integration.md",
  },
  {
    id: "tinacms",
    name: "TinaCMS",
    kind: "Content",
    status: "in-use",
    what: "The editor for the words and pictures on the marketing pages, so copy changes do not need an engineer.",
    weUseItFor:
      "Page content, blog posts, and the images that go with them. Edits are saved back into the code repository, which is why the site's history and its copy history are the same history.",
    owner: "TinaCloud. To confirm: whose account.",
    environments: [
      {
        name: "All",
        detail:
          "Content is read from the indexed branch — main — whichever deployment is asking. A branch that has not been indexed shows main's content.",
      },
    ],
    ifItBreaks: "The site keeps serving the copy it was built with. Editing stops.",
    configuredIn: "apps/marketing/tina/",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    kind: "CRM",
    status: "partly",
    what: "The sales and marketing database — where enquiries land so somebody can follow them up.",
    weUseItFor:
      "The consultation-request form and the contact form post straight into a HubSpot form, which creates or updates the contact. The booking flow does not touch HubSpot at all: a customer who signs up and pays leaves no trace there.",
    owner: "To confirm: who owns the portal.",
    environments: [
      {
        name: "All",
        detail:
          "One portal, one form per surface. There is no test portal — a form filled in on a preview lands in the same place as a real one.",
      },
    ],
    ifItBreaks: "The enquiry is refused with an error rather than silently lost.",
    configuredIn: "apps/marketing/src/lib/hubspot.ts",
  },
  {
    id: "authjs",
    name: "Auth.js",
    kind: "Sign-in",
    status: "in-use",
    what: "Not a company — a piece of software running inside our own site that handles signing in. It was chosen over paid alternatives because a HIPAA-ready hosted login costs considerably more.",
    weUseItFor:
      "The emailed sign-in link, and the session that keeps someone signed in afterwards. Sessions are rows in our own database.",
    owner: "Ours. No third-party account, no separate bill.",
    environments: [
      { name: "All", detail: "Same code everywhere; the signing secret differs per environment." },
    ],
    ifItBreaks: "A returning customer cannot get back in. New bookings still work.",
    configuredIn: "apps/marketing/src/auth.ts, docs/auth.md",
  },
  {
    id: "github",
    name: "GitHub",
    kind: "Source code",
    status: "in-use",
    what: "Where the code lives, and the record of every change ever made to it — including the copy edited in TinaCMS.",
    weUseItFor:
      "Holding the repository, reviewing changes before they ship, and triggering a Vercel build on merge.",
    owner:
      "Repository “dbates-commits/primary-brain-health”. To confirm: who owns the organisation.",
    environments: [
      { name: "main branch", detail: "What production is built from." },
      { name: "staging branch", detail: "What the shared preview is built from." },
    ],
    ifItBreaks: "The live site keeps running. Nothing new can ship.",
    configuredIn: "The repository itself",
  },
  {
    id: "ga4",
    name: "Google Analytics",
    kind: "Web analytics",
    status: "not-set-up",
    what: "The standard tool for counting visitors and seeing which pages they land on.",
    weUseItFor:
      "Nothing yet. There is no analytics tag anywhere in the site today, so no traffic is being recorded.",
    owner: "To confirm: who would own the property.",
    environments: [{ name: "None", detail: "Not installed." }],
    ifItBreaks: "Nothing to break.",
    configuredIn: "Nowhere",
  },
  {
    id: "product-analytics",
    name: "Funnel analytics",
    kind: "Product analytics",
    status: "not-set-up",
    what: "A tool that follows one person through the booking flow and shows where people drop out — a different job from counting pageviews.",
    weUseItFor:
      "Nothing yet; no tool has been chosen. This is what would answer “how many people who start the booking finish it”, and, once the for-me / for-someone-else marker exists, whether family members convert differently.",
    owner: "To confirm: ours to choose.",
    environments: [{ name: "None", detail: "Not chosen." }],
    ifItBreaks: "Nothing to break.",
    configuredIn: "Nowhere",
  },
];
