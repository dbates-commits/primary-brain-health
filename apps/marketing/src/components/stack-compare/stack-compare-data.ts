import type { Dimension, Example, Source } from "./stack-compare-model";

/**
 * What we built versus building the same site in HubSpot Content Hub.
 *
 * Alec's ask, after the debrief with Mark and Stef: something that explains to
 * Ian and Melissa what they already have and what HubSpot would and would not
 * add. It is not a sales sheet. Two rows go to HubSpot outright and say so at
 * the top of the page, because a comparison where the incumbent wins every row
 * is one nobody believes — and because both of those rows are things we should
 * fix rather than argue with.
 *
 * Every claim about HubSpot carries a link. Every claim about us carries a path
 * in this repository. Anything neither of those could settle is written as a
 * question for a person, the way `services-data.ts` next door does it.
 *
 * HubSpot facts checked 18 September 2026. Tiers and prices move; the sources
 * are here so the next person can re-check rather than re-guess.
 */

/** The comparison is with Content Hub, HubSpot's website product. */
const CONTENT_HUB_PRICING: Source = {
  label: "HubSpot — Content Hub pricing (Jan 2026)",
  href: "https://blog.hubspot.com/website/hubspot-content-hub-pricing",
  vendor: true,
};

const OUR_VENDOR_COSTS: Source = {
  label: "SOW2 proposal — vendor cost table",
  href: "docs/sow2/proposal/SOW2-Proposal-v5-no-pricing.md",
};

export const DIMENSIONS: Dimension[] = [
  {
    id: "analytics",
    name: "Knowing what visitors do",
    whyItMatters:
      "Whether you can answer “how many people landed on the page, and how many of them started booking”.",
    ours: {
      summary: "Nothing. No tag, no numbers.",
      claim: {
        plain:
          "We cannot answer that question at all today. Nothing on the site counts visitors, so no traffic has ever been recorded.",
        technical:
          "No analytics tag ships in any bundle — no GA4, no product analytics, nothing. The ten-event taxonomy agreed at discovery (landing_viewed → payment_succeeded) is specified and unbuilt.",
      },
      pros: [
        "The tool is ours to pick; the website does not decide it.",
        "The consent banner and Consent Mode are in review (PR #88), which is the precondition for GA4.",
      ],
      cons: [
        "Nobody can say how many people visited yesterday.",
        "Unscheduled build work, on top of choosing a tool.",
      ],
    },
    hubspot: {
      summary: "Built in, from day one.",
      claim: {
        plain:
          "Counts visitors from day one, and ties a form fill back to the page and campaign it came from.",
        technical:
          "Traffic analytics, source attribution and campaign reporting are built into the platform and share the CRM's contact records, so page → contact → deal attribution needs no event plumbing.",
      },
      pros: [
        "Works on day one, with no engineering.",
        "Attribution and the CRM are the same system, so there is no join to get wrong.",
      ],
      cons: ["Covers HubSpot-hosted pages only."],
    },
    verdict: "hubspot",
    takeaway: "The clearest gap — and one we could close ourselves in days.",
    sources: [
      {
        label: "Our own services page: GA4 “not set up”, funnel analytics “not chosen”",
        href: "apps/marketing/src/components/services/services-data.ts",
      },
      {
        label: "Discovery: the ten-event measurement plan we committed to",
        href: "docs/sow2/technical/discovery-summary.md",
      },
    ],
  },
  {
    id: "ab-testing",
    name: "A/B testing",
    whyItMatters:
      "Showing half your visitors one headline and half another, then keeping the one that converts better.",
    ours: {
      summary: "Buildable, not built.",
      claim: {
        plain:
          "There is nothing in the site today that can show two versions of a page. It can be built, but it has not been.",
        technical:
          "No flag or experiment infrastructure exists in the repo — no Vercel Flags, no PostHog, Statsig or GrowthBook. The Flags SDK is the natural fit and would ship variants at the edge with no layout shift, but it is unwritten.",
      },
      pros: ["Once built, it could test the booking and payment steps too.", "No tier to buy."],
      cons: [
        "It does not exist, and no phase has scoped building it.",
        "Needs analytics first to read a result.",
      ],
    },
    hubspot: {
      summary: "Built in, on the $450 tier.",
      claim: {
        plain:
          "Duplicate a page, change the headline; HubSpot splits traffic and declares a winner.",
        technical:
          "Page-level A/B and adaptive testing (up to five variants, auto-allocated) are built in, wired to the same analytics that measure the result.",
      },
      pros: ["Self-serve — no deploy, no engineer.", "Measurement comes with it."],
      cons: [
        "Professional only — it alone forces $15/mo to $450/mo.",
        "Could never test our booking or payment steps.",
      ],
    },
    verdict: "hubspot",
    takeaway:
      "HubSpot wins outright — but could only ever test marketing pages, never where the money moves.",
    sources: [
      {
        label: "HubSpot — A/B testing requires Content Hub Professional or Enterprise",
        href: "https://knowledge.hubspot.com/website-pages/run-an-a-b-test-on-your-page",
        vendor: true,
      },
      {
        label: "HubSpot — adaptive testing, Professional and Enterprise",
        href: "https://knowledge.hubspot.com/website-pages/create-an-adaptive-test-for-a-page",
        vendor: true,
      },
      {
        label: "Nothing in the repo does this — no flag or experiment package is installed",
        href: "apps/marketing/package.json",
      },
    ],
  },
  {
    id: "performance",
    name: "Speed",
    whyItMatters:
      "How fast the page appears, which Google uses for ranking and which decides how many people leave before it loads.",
    ours: {
      summary: "Prebuilt files, untested.",
      claim: {
        plain:
          "Pages are built in advance and handed out as finished files. Nothing is left to do when a visitor arrives.",
        technical:
          "Marketing routes are statically generated at build and served from Vercel's CDN. Nothing renders per request, so a traffic spike is a cache read, not compute.",
      },
      pros: [
        "The fastest way a page can be served.",
        "No platform script we did not choose.",
        "Anything slow is ours to fix.",
      ],
      cons: [
        "Never measured. No Lighthouse run recorded, against a 90+ target in the contract.",
        "Images barely optimised: one file uses `next/image`, six raw `<img>` tags remain.",
      ],
    },
    hubspot: {
      summary: "Fast defaults, scripts you cannot remove.",
      claim: {
        plain:
          "Also a fast global network, with automatic image optimisation — but every page carries HubSpot scripts you cannot remove.",
        technical:
          "Cloudflare-fronted CDN with automatic WebP, HTTP/2, Brotli and minification. HubL output is prerendered where it can be, but a page drops to per-request rendering the moment it uses personalisation, cookies, query parameters or an adaptive test.",
      },
      pros: [
        "Image optimisation, compression and caching are automatic.",
        "Roughly 1,000 page views per second of capacity.",
      ],
      cons: [
        "Platform bundles load whether used or not; the forms script is render-blocking at ~521KB.",
        "Personalising a page silently drops it off the cached path.",
      ],
    },
    verdict: "ours",
    takeaway:
      "Our ceiling is higher; our floor is untested. HubSpot gives competent defaults and a script tax.",
    toConfirm:
      "Nobody has run Lighthouse here. Until somebody does, “ours is faster” is architecture, not measurement — and it is the number a sceptic asks for.",
    sources: [
      {
        label: "Our marketing pages are prebuilt at deploy",
        href: "apps/marketing/src/app/[slug]/page.tsx",
      },
      {
        label: "HubSpot — when a page falls back to dynamic rendering",
        href: "https://developers.hubspot.com/docs/cms/best-practices/testing-staging-performance/prerendering",
        vendor: true,
      },
      {
        label: "HubSpot — CDN, WebP, Brotli and minification",
        href: "https://developers.hubspot.com/docs/cms/best-practices/testing-staging-performance/speed",
        vendor: true,
      },
      {
        label: "Third-party: the platform bundles you cannot remove",
        href: "https://www.studionope.com/blog/how-to-fix-core-web-vitals-on-hubspot-cms",
      },
      {
        label: "Third-party: the HubSpot forms script is render-blocking",
        href: "https://www.corewebvitals.io/pagespeed/defer-hubspot-forms",
      },
    ],
  },
  {
    id: "cost",
    name: "Cost at 100–200k visitors a month",
    whyItMatters:
      "The Eisai landing page is expected to send a burst of traffic. The question is what that burst costs on each side.",
    ours: {
      summary: "~$140–220/mo. Spikes are near-free.",
      claim: {
        plain: "Around $140–220 a month at launch, and a spike barely moves it.",
        technical:
          "Neon Scale ~$100–150 (the tier is chosen for its BAA, not its performance), Resend Pro $20, Vercel Pro $20/seat, Tina $0–29. The variable cost tracks database activity from people who sign up, not pageviews.",
      },
      pros: [
        "Visitors who only read a page are close to free.",
        "Every line is a bill we can move independently.",
      ],
      cons: ["Several vendors to own, and the repo still says “to confirm” about some of them."],
    },
    hubspot: {
      summary: "Traffic free; features force $450–1,500/mo.",
      claim: {
        plain:
          "HubSpot does not charge for traffic either. The features cost: A/B testing needs $450/mo, anything near our booking flow needs $1,500/mo.",
        technical:
          "Content Hub is seat-priced, with hosting and CDN included and no documented pageview overage. Starter $15/mo; Professional $450/mo buys A/B testing; Enterprise from $1,500/mo is the floor for serverless functions and for the Sensitive Data (BAA) feature.",
      },
      pros: ["One bill, one vendor.", "Traffic genuinely is not a cost line."],
      cons: [
        "Features force the tier up, not traffic. Ours land on Enterprise.",
        "Marketing Hub contacts bill separately and do scale, if those visitors convert.",
      ],
    },
    verdict: "ours",
    takeaway:
      "The spike is cheap either way — retire that premise. It is ~$180/mo against a tier our requirements push to $1,500/mo.",
    sources: [
      CONTENT_HUB_PRICING,
      OUR_VENDOR_COSTS,
      {
        label: "HubSpot — hosting capacity, and no pageview charge",
        href: "https://knowledge.hubspot.com/reports/traffic-considerations-when-hosting-your-site-on-hubspot",
        vendor: true,
      },
      {
        label: "HubSpot — marketing contacts apply to Marketing Hub, not Content Hub",
        href: "https://knowledge.hubspot.com/records/marketing-contacts",
        vendor: true,
      },
    ],
  },
  {
    id: "staging",
    name: "Testing a change safely",
    whyItMatters: "Whether you can see a change, and let other people see it, before customers do.",
    ours: {
      summary: "A shareable copy per change.",
      claim: {
        plain:
          "Every proposed change gets its own full copy of the site, at its own address, that anyone can open.",
        technical:
          "One immutable preview deployment per pull request, plus a long-lived staging branch. Anonymously shareable, torn down automatically, and the internal pages sit behind a password on all of them.",
      },
      pros: [
        "Unlimited parallel copies, torn down when the change ships.",
        "A link you can paste to anyone, no login.",
      ],
      cons: [
        "The CMS half does not follow: the admin on staging reads and edits main, so editing copy there edits production copy.",
        "No HubSpot test portal, so a form filled in on a preview lands with the real ones.",
      ],
    },
    hubspot: {
      summary: "One shared staging area, login required.",
      claim: {
        plain:
          "A staging area exists, but it shares templates with the live site — editing one changes the real site immediately.",
        technical:
          "Content staging is Professional and up. Its own documentation warns that changes to any template, global content or HubDB table are reflected on live pages. True sandboxes are Enterprise-only (from $1,500/mo), with a 300-asset deploy-back cap and integrations reconnected by hand.",
      },
      pros: ["Enough for a page-copy change, and a real feature."],
      cons: [
        "No per-change environment — the unit is a whole account.",
        "Preview URLs require the viewer to be a logged-in HubSpot user.",
        "Protects pages but not templates — the half likelier to break something.",
      ],
    },
    verdict: "ours",
    takeaway:
      "The strongest row for what we have, and the one you can demonstrate: this page arrives as a preview link.",
    toConfirm:
      "The Tina admin on staging is the production CMS wearing a different hostname. Worth fixing either way.",
    sources: [
      {
        label: "TinaCloud never indexed staging — written down in our Tina config",
        href: "apps/marketing/tina/config.ts",
      },
      {
        label: "HubSpot — content staging shares templates with live pages",
        href: "https://knowledge.hubspot.com/website-pages/redesign-and-relaunch-your-site-with-content-staging",
        vendor: true,
      },
      {
        label: "HubSpot — preview URLs require a logged-in HubSpot user (2021)",
        href: "https://developers.hubspot.com/changelog/preview-urls-on-system-domains",
        vendor: true,
      },
      {
        label: "HubSpot — sandboxes are Enterprise-only",
        href: "https://knowledge.hubspot.com/account-management/set-up-a-hubspot-standard-sandbox-account",
        vendor: true,
      },
    ],
  },
  {
    id: "data",
    name: "Where the data lives",
    whyItMatters: "Whether HubSpot could be the database too, or whether we would be running both.",
    ours: {
      summary: "Postgres we control. Card numbers stay at Stripe.",
      claim: {
        plain:
          "Accounts, consent records, payments and the audit trail live in our own database. The card number itself never touches it — that stays at Stripe.",
        technical:
          "Neon Postgres via Drizzle: users, consents, payments, linus_enrollments, audit_log, auth sessions and rate limits. The payments table holds brand, last four and expiry only — never a PAN or CVV, which is what keeps the PCI scope at SAQ-A.",
      },
      pros: [
        "Real tables, real constraints, and a consent record we can prove the shape of.",
        "On the Scale tier specifically because it is the lowest one offering a BAA.",
        "No row ceiling worth thinking about.",
      ],
      cons: ["A database is ours to back up, migrate and pay for."],
    },
    hubspot: {
      summary: "Not a database. HubDB caps at 10,000 rows a table.",
      claim: {
        plain:
          "No. HubSpot stores contacts and deals well, but it is not a place to keep accounts, consent records and an audit trail — so we would be running a database anyway.",
        technical:
          "The only general store is HubDB: 10,000 rows per table, 1,000 tables and 1 million rows per account, with no documented guidance on personal or sensitive data. Sensitive Data designations are CRM-property-shaped and do not extend to it.",
      },
      pros: [
        "Contacts, deals and their properties are genuinely well handled.",
        "Card numbers would stay with the processor there too — that part is the same either way.",
      ],
      cons: [
        "HubDB's 10,000-row table ceiling is not a place for sessions, audit rows or consent records.",
        "No documented position on sensitive data in HubDB at all.",
        "Keeping it would mean two systems and a sync, not one system.",
      ],
    },
    verdict: "ours",
    takeaway:
      "We would still need Neon. HubSpot replacing the database is the one part of this that is not a trade-off — it is simply not what the product is.",
    sources: [
      {
        label: "What we store, and why the card number is not in it",
        href: "packages/db/src/schema/payments.ts",
      },
      {
        label: "Why Neon Scale, and the BAA",
        href: "docs/database.md",
      },
      {
        label: "HubSpot — HubDB limits",
        href: "https://developers.hubspot.com/docs/cms/data/hubdb",
        vendor: true,
      },
    ],
  },
  {
    id: "accounts",
    name: "Gated pages (welcome, profile, login)",
    whyItMatters:
      "Three pages are behind a gate today: the sign-in screen, the post-payment welcome screen, and account settings.",
    ours: {
      summary: "Ours. Gated on payment, not just on login.",
      claim: {
        plain:
          "We run the gate ourselves, so it can be as strict as the page needs — /welcome opens only for someone who has actually paid, not merely someone signed in — and the pages behind it can show anything we hold.",
        technical:
          "Auth.js with database-backed sessions in Neon, Auth0 as the sole identity provider (PR #85). `/profile` gates on a session; `/welcome` additionally requires an entitlement, because accounts exist from signup and a session alone would let an unpaid signup reach the confirmation screen.",
      },
      pros: [
        "The gate is a rule we write, so “signed in” and “has paid” can be different answers.",
        "/profile shows plan, payment method and account actions — all read from our own database.",
        "Sessions carry a 15-minute idle timeout and an 8-hour cap, set from a security review.",
      ],
      cons: [
        "Auth0 is on a personal tenant today; the production tenant is still an open ask.",
        "It is ours to run, and a login outage is a customer who cannot get back in.",
      ],
    },
    hubspot: {
      summary: "Memberships, but every member becomes a CRM contact.",
      claim: {
        plain:
          "HubSpot can put pages behind a login. The catch is that everybody who signs in becomes a contact record in the CRM — which is exactly what the booking flow has been kept out of.",
        technical:
          "Memberships are Content Hub Professional and up, built on the CRM: HubSpot's own wording is that the account system leverages HubSpot CRM and CRM Lists, with access controlled by list membership. SSO is SAML-only, Professional and up, documented for Okta and OneLogin.",
      },
      pros: [
        "Login, registration and password reset come built in, with no code.",
        "SSO exists, and Auth0 can act as a SAML provider, so it is probably reachable.",
      ],
      cons: [
        "A member is a CRM contact by construction — “a customer who pays leaves no trace in HubSpot” could not survive it.",
        "Access is by contact list, so “has paid” would have to become a CRM list rather than a fact checked at the door.",
        "/profile could not show plan or payment data without an Enterprise serverless function calling our database.",
        "SAML only. Our Auth0 setup is OIDC, and Auth0 is not among the documented providers.",
      ],
    },
    verdict: "ours",
    takeaway:
      "HubSpot can gate a page, but it gates it by turning the visitor into a CRM contact and the entitlement into a list. That is the opposite of the data rule we are working to.",
    toConfirm:
      "Auth0 is not named in HubSpot's SSO documentation, which lists Okta and OneLogin. Auth0 does speak SAML, so it would likely work — but nobody has tried it, and it is Professional-and-up either way.",
    sources: [
      {
        label: "Our sign-in and session model",
        href: "docs/auth.md",
      },
      {
        label: "Why /welcome checks payment and not just a session",
        href: "apps/marketing/src/app/welcome/page.tsx",
      },
      {
        label: "The Auth0 provider, still in review",
        href: "https://github.com/dbates-commits/primary-brain-health/pull/85",
      },
      {
        label: "HubSpot — memberships are built on the CRM",
        href: "https://developers.hubspot.com/docs/cms/data/memberships",
        vendor: true,
      },
      {
        label: "HubSpot — membership SSO is SAML-only, Okta and OneLogin",
        href: "https://developers.hubspot.com/docs/cms/start-building/features/memberships/sso",
        vendor: true,
      },
      {
        label: "HubSpot — private content needs Content Hub Professional or Enterprise",
        href: "https://knowledge.hubspot.com/website-pages/require-member-registration-to-access-private-content",
        vendor: true,
      },
    ],
  },
  {
    id: "booking",
    name: "The booking and payment flow",
    whyItMatters:
      "The site does not only describe the product — it sells it, takes consent, takes payment and hands the customer to Linus.",
    ours: {
      summary: "All of it, with no limits.",
      claim: {
        plain:
          "Signing up, consent, payment and the handover to the assessment are all ours — the larger half of what the site does.",
        technical:
          "Twenty-one server modules in `packages/booking/src/server/` — Stripe checkout and webhook, consent stamping, the resume state machine, Auth.js sessions in Neon, and the Linus enrolment call.",
      },
      pros: [
        "No limit on what a step can do or how long it takes.",
        "Tested, with an end-to-end test on the money path.",
      ],
      cons: ["Ours to maintain, and to be woken up by."],
    },
    hubspot: {
      summary: "Enterprise ($1,500/mo), 10 seconds, one file.",
      claim: {
        plain:
          "Custom logic runs only on the $1,500/mo Enterprise plan, must finish in ten seconds, and lives in a single file.",
        technical:
          "Serverless functions require Content Hub Enterprise: 10s max execution, 128MB, 100 endpoints, JSON only, and a single JavaScript file per function — you bundle it yourself.",
      },
      pros: ["Enough for a form handler or a lookup."],
      cons: [
        "Enterprise-only — this alone sets the floor at $1,500/mo.",
        "A webhook that writes to a database, stamps consent and calls Linus is not what that is for.",
        "Rebuilding something that works, somewhere more constrained.",
      ],
    },
    verdict: "ours",
    takeaway:
      "Where “just use HubSpot” stops being a small decision. The marketing pages are the easy part.",
    sources: [
      {
        label: "What the booking flow actually does",
        href: "docs/booking-flow.md",
      },
      {
        label: "HubSpot — serverless functions: Enterprise, 10s, single file",
        href: "https://developers.hubspot.com/docs/cms/start-building/features/serverless-functions/overview",
        vendor: true,
      },
    ],
  },
  {
    id: "hipaa",
    name: "Health data and the no-PHI rule",
    whyItMatters:
      "We are contractually bound to keep health information out of HubSpot. That constrains what could move there.",
    ours: {
      summary: "Ours, with a signed agreement.",
      claim: {
        plain:
          "Consent, payment and assessment data stay in our own database under a signed agreement. What does reach HubSpot today is the enquiry forms — name, email, phone, year of birth, gender, education level and a free-text message.",
        technical:
          "Neon is on the Scale tier specifically because it is the lowest tier offering a BAA. The booking flow calls HubSpot nowhere: a customer who signs up and pays leaves no trace there. The only path today is `src/lib/hubspot.ts`, reached from the two enquiry form routes.",
      },
      pros: [
        "Consent records, payment and the audit trail never leave our database.",
        "One module is the only path to HubSpot, so the rule has one place to be checked.",
      ],
      cons: [
        "Nothing enforces it. `src/lib/hubspot.ts` is an ordinary app module any route can import.",
        "The enquiry forms already send more than the phrase “no PHI” suggests — year of birth, gender and a free-text message.",
      ],
    },
    hubspot: {
      summary: "Enterprise ($1,500/mo), and CRM-shaped.",
      claim: {
        plain:
          "HubSpot will sign a health-data agreement, but only on the $1,500/mo Enterprise plan, and it covers CRM records rather than pages.",
        technical:
          "The Sensitive Data feature is Enterprise-only across hubs (from $1,500/mo) and is property-shaped: designations apply to CRM properties, with forms, attachments, limited workflows and the v3 API supported. Personalisation tokens, chatbots and sandboxes are explicitly unsupported.",
      },
      pros: ["A real BAA is available — more than is commonly assumed."],
      cons: [
        "Enterprise-only, so $1,500/mo before the feature’s own price, which is not published.",
        "Irreversible once enabled, and it locks the account out of data-centre migration.",
        "Website pages are not listed among the supported surfaces.",
      ],
    },
    verdict: "ours",
    takeaway:
      "HubSpot can hold health data on Enterprise, in the CRM — not documented as a place to run a consent flow. Worth noting the rule is a convention here, not a guardrail.",
    toConfirm:
      "Content Hub pages are simply absent from the supported list — missing documentation, not a documented “no”. Worth asking before relying on either reading.",
    sources: [
      {
        label: "The no-PHI rule, in the RFP",
        href: "docs/sow2/technical/PBH_Website_v2.1_RFP.md",
      },
      {
        label: "What the enquiry form actually sends to HubSpot",
        href: "apps/marketing/src/app/api/intake/route.ts",
      },
      {
        label: "Why Neon Scale, and the BAA",
        href: "docs/database.md",
      },
      {
        label: "HubSpot — storing sensitive data (Enterprise)",
        href: "https://knowledge.hubspot.com/account-security/store-sensitive-data",
        vendor: true,
      },
      {
        label: "HubSpot — which tools support sensitive data",
        href: "https://knowledge.hubspot.com/account-security/sensitive-data-in-hubspot-tools",
        vendor: true,
      },
    ],
  },
  {
    id: "editing",
    name: "Editing the words on a page",
    whyItMatters: "Who can change the copy, and what happens to the old version.",
    ours: {
      summary: "Anyone can edit; one history.",
      claim: {
        plain:
          "Anyone can edit page copy without an engineer, and every edit lands in the same history as the code.",
        technical:
          "TinaCMS writes MDX straight to the branch, so copy history and code history are one history — and a bad edit is revertible the same way a bad commit is.",
      },
      pros: [
        "One history, and copy rolls back precisely.",
        "Content is plain files we own — moving it is a copy, not an export.",
      ],
      cons: [
        "Less forgiving than HubSpot's, and new page shapes need an engineer.",
        "No safe place to draft a copy change, because staging edits main.",
      ],
    },
    hubspot: {
      summary: "Best-in-class editor; they hold the copy.",
      claim: {
        plain:
          "The best editor for a marketer working alone. The trade is that HubSpot holds the only copy.",
        technical:
          "Mature WYSIWYG with modules and themes. Export produces HTML for pages and CSV for metadata; HubL templates, modules and themes do not move to another platform.",
      },
      pros: [
        "A marketer can build a landing page unaided. Ours cannot, yet.",
        "No deploy between writing and publishing.",
      ],
      cons: [
        "Leaving means rebuilding templates — the export is content, not the site.",
        "No review between an edit and the public, which cuts both ways.",
      ],
    },
    verdict: "depends",
    takeaway:
      "Better for a marketer alone; ours is better for a team that wants one history and a precise undo.",
    sources: [
      {
        label: "How content is authored here",
        href: "apps/marketing/tina/config.ts",
      },
      {
        label: "HubSpot — what you can and cannot export",
        href: "https://knowledge.hubspot.com/website-and-landing-pages/export-web-content-and-data",
        vendor: true,
      },
    ],
  },
  {
    id: "design",
    name: "Matching the design",
    whyItMatters: "Whether the site can look exactly like what the designer drew.",
    ours: {
      summary: "Exactly what Figma says.",
      claim: {
        plain:
          "Colours and type come straight from the design file, so what is drawn is what ships.",
        technical:
          "Tokens mirror the Figma variables under Figma's own names, and stock Tailwind colours are switched off so an off-palette value emits nothing at all.",
      },
      pros: [
        "No ceiling on layout or motion.",
        "An off-palette colour fails loudly instead of shipping.",
      ],
      cons: ["The Figma sync is manual, so tokens drift until re-synced."],
    },
    hubspot: {
      summary: "Whatever the theme allows.",
      claim: {
        plain: "You work inside a theme. Unusual designs get negotiated down.",
        technical:
          "Themes and modules with HubL. React is supported as islands inside HubL templates rather than as the whole page, so the rendering model is theirs.",
      },
      pros: ["A theme keeps a non-designer from breaking the look."],
      cons: ["Bespoke layout and motion fight the template model."],
    },
    verdict: "ours",
    takeaway:
      "Ours is the one that can match Figma exactly. HubSpot's is the one that resists being broken.",
    sources: [
      {
        label: "How the design tokens work",
        href: "docs/design-tokens.md",
      },
      {
        label: "HubSpot — React inside HubL templates, not instead of them",
        href: "https://developers.hubspot.com/docs/cms/start-building/introduction/react-plus-hubl/overview",
        vendor: true,
      },
    ],
  },
];

/**
 * Named sites, for the Facebook-and-Instagram move.
 *
 * “Checked live” means the response headers said so on 18 September 2026 —
 * `x-powered-by: next.js` and `/_next/static` for one side, a HubSpot generator
 * tag and `x-hs-hub-id` for the other. That check is worth doing in front of
 * somebody rather than asserting; it takes one command.
 *
 * Deliberately short. A long list with one wrong name in it is worse than a
 * short list nobody can dispute, and several of the names on HubSpot's own
 * showcase have since moved off HubSpot.
 */
export const OUR_EXAMPLES: Example[] = [
  {
    name: "Carbon Health",
    runs: "Next.js, hosted on Vercel",
    soWhat: "Same stack as ours, down to the host.",
    href: "https://carbonhealth.com",
    evidence: "checked-live",
  },
  {
    name: "Oura",
    runs: "Next.js",
    soWhat: "Consumer health, with a marketing site this shape.",
    href: "https://ouraring.com",
    evidence: "checked-live",
  },
  {
    name: "Headspace",
    runs: "Next.js",
    soWhat: "Consumer scale, self-hosted — the stack is not tied to one vendor.",
    href: "https://www.headspace.com",
    evidence: "checked-live",
  },
  {
    name: "The Washington Post",
    runs: "Next.js",
    soWhat: "Breaking-news spikes — the shape of the Eisai burst.",
    href: "https://www.washingtonpost.com",
    evidence: "checked-live",
  },
  {
    name: "Nike, Walmart, Target",
    runs: "Next.js",
    soWhat: "The “nobody gets fired for this” answer.",
    href: "https://www.nike.com",
    evidence: "checked-live",
  },
  {
    name: "The Weather Company",
    runs: "Next.js on Vercel",
    soWhat: "350 million daily users on our hosting. Scale is not the constraint.",
    href: "https://vercel.com/customers/how-the-weather-company-serves-real-time-forecasts-to-350-million-daily-active-users-on-vercel",
    evidence: "vendor",
  },
];

export const HUBSPOT_EXAMPLES: Example[] = [
  {
    name: "Care New England",
    runs: "HubSpot CMS",
    soWhat: "A real healthcare system on Content Hub — the strongest example for that side.",
    href: "https://www.carenewengland.org",
    evidence: "checked-live",
  },
  {
    name: "Kelly Services",
    runs: "HubSpot CMS",
    soWhat: "A large staffing firm, and a HubSpot case study.",
    href: "https://www.kellyservices.com",
    evidence: "checked-live",
  },
  {
    name: "Morehouse College",
    runs: "HubSpot CMS",
    soWhat: "Content-heavy and admissions-driven — what Content Hub is built for.",
    href: "https://morehouse.edu",
    evidence: "checked-live",
  },
  {
    name: "hubspot.com",
    runs: "HubSpot CMS",
    soWhat: "They do run their own site on it.",
    href: "https://www.hubspot.com",
    evidence: "checked-live",
  },
];
