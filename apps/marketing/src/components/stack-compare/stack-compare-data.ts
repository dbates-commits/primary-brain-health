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
        "Whatever we choose later, the events go wherever we point them — the tool is not decided by the website.",
        "A cookie banner with Google Consent Mode is already open in review, so the consent half is nearly done.",
      ],
      cons: [
        "Right now: zero. Nobody can say how many people visited the site yesterday.",
        "This is build work that has not been scheduled, on top of choosing a tool.",
      ],
    },
    hubspot: {
      summary: "Built in, from day one.",
      claim: {
        plain:
          "It counts visitors from the day you turn it on, and ties a form fill back to the page and the campaign it came from, with nothing to build.",
        technical:
          "Traffic analytics, source attribution and campaign reporting are built into the platform and share the CRM's contact records, so page → contact → deal attribution needs no event plumbing.",
      },
      pros: [
        "Works on day one, with no engineering.",
        "Attribution and the CRM are the same system, so there is no join to get wrong.",
      ],
      cons: [
        "Only covers what happens on HubSpot-hosted pages — anything elsewhere still needs its own tracking.",
      ],
    },
    verdict: "hubspot",
    takeaway:
      "This is the clearest thing HubSpot would give us that we do not have. It is also the one we could close ourselves in days rather than weeks.",
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
      pros: [
        "Once built, a test can cover anything — the booking modal and the payment step, not only marketing pages.",
        "No tier to buy: the testing tool would be ours to pick.",
      ],
      cons: [
        "It does not exist. Somebody has to build it, and A/B testing strategy is explicitly outside the current contract.",
        "Without analytics in place first, a test has nothing to read its result from.",
      ],
    },
    hubspot: {
      summary: "Built in, on the $450 tier.",
      claim: {
        plain:
          "You duplicate a page in the editor, change the headline, and HubSpot splits the traffic and declares a winner. A marketer can do it without asking anyone.",
        technical:
          "Page-level A/B and adaptive testing (up to five variants, auto-allocated) are built in, wired to the same analytics that measure the result.",
      },
      pros: [
        "Self-serve for a marketer — no deploy, no engineer, no waiting.",
        "The measurement comes with it, which is the half that usually gets skipped.",
      ],
      cons: [
        "Locked to Professional. It is the single feature that forces the jump from $15/mo to $450/mo.",
        "Tests only HubSpot-hosted pages — it could never test our booking or payment steps.",
      ],
    },
    verdict: "hubspot",
    takeaway:
      "HubSpot wins this outright today, and it is worth saying plainly. The catch is that it could only ever test the marketing pages, never the steps where the money actually moves.",
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
        label: "SOW2: A/B testing strategy is named as out of scope",
        href: "docs/sow2/proposal/SOW2-Proposal-v5-no-pricing.md",
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
          "Pages are built once, in advance, and handed to visitors as finished files from servers near them. There is no work left to do when someone arrives.",
        technical:
          "Marketing routes are statically generated at build and served from Vercel's CDN. Nothing renders per request, so a traffic spike is a cache read, not compute.",
      },
      pros: [
        "The fastest way a page can be served, and it is what we already do.",
        "No platform script we did not choose is injected into the page.",
        "Only our own code is on the page, so anything slow is ours to fix.",
      ],
      cons: [
        "We have never actually measured it. No Lighthouse run has been recorded, despite a 90+ mobile target in the contract.",
        "Images are barely optimised: `next/image` is used in exactly one file, and six raw `<img>` tags remain.",
      ],
    },
    hubspot: {
      summary: "Fast defaults, scripts you cannot remove.",
      claim: {
        plain:
          "Pages are also served from a fast global network, and images are optimised automatically — but every page carries HubSpot's own scripts, which you cannot remove.",
        technical:
          "Cloudflare-fronted CDN with automatic WebP, HTTP/2, Brotli and minification. HubL output is prerendered where it can be, but a page drops to per-request rendering the moment it uses personalisation, cookies, query parameters or an adaptive test.",
      },
      pros: [
        "Image optimisation, compression and caching are automatic — the things we have not done.",
        "Generous capacity: roughly 1,000 page views per second, far beyond anything we expect.",
      ],
      cons: [
        "Platform bundles load on every page whether a module uses them or not, and the forms script is render-blocking at around 521KB uncompressed.",
        "Personalising a page silently loses the prerendered, edge-cached path — the feature you would buy it for is the one that slows it down.",
      ],
    },
    verdict: "ours",
    takeaway:
      "Our ceiling is higher and our floor is untested. HubSpot would hand us competent defaults and a script tax we could never remove.",
    toConfirm:
      "Nobody has run Lighthouse against our site. Until somebody does, “ours is faster” is an argument from architecture, not a measurement — and that is the one number a sceptic will ask for.",
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
        plain:
          "Around $140–220 a month at launch, and a traffic spike barely moves it — finished files handed out by a cache cost almost nothing extra.",
        technical:
          "Neon Scale ~$100–150 (the tier is chosen for its BAA, not its performance), Resend Pro $20, Vercel Pro $20/seat, Tina $0–29. The variable cost tracks database activity from people who sign up, not pageviews.",
      },
      pros: [
        "Visitors who only read a page are close to free, which is exactly the shape of a sponsored traffic burst.",
        "Every line is a separate bill we can move independently.",
      ],
      cons: [
        "Several small vendor relationships to own rather than one, and the repo still says “to confirm” about who holds some of those accounts.",
      ],
    },
    hubspot: {
      summary: "Traffic free; features force $450–1,500/mo.",
      claim: {
        plain:
          "HubSpot does not charge for traffic either, so the spike is free on both sides. What costs money is the features: A/B testing needs the $450/mo plan, and anything close to our booking flow needs the $1,500/mo one.",
        technical:
          "Content Hub is seat-priced, with hosting and CDN included and no documented pageview overage. Starter $15/mo; Professional $450/mo buys A/B testing; Enterprise from $1,500/mo is the floor for serverless functions and for the Sensitive Data (BAA) feature.",
      },
      pros: [
        "One bill, one vendor, one account to own.",
        "Traffic genuinely is not a cost line — this premise is worth correcting out loud.",
      ],
      cons: [
        "The tier is forced upward by features, not by traffic. Our requirements land on Enterprise.",
        "Marketing Hub contacts are billed separately and do scale — that is where a 200k-visitor burst actually shows up on a HubSpot invoice, if those visitors convert.",
      ],
    },
    verdict: "ours",
    takeaway:
      "The traffic spike is cheap either way — that premise was wrong and should be retired. The real comparison is ~$180/mo against a HubSpot tier our own requirements push to $1,500/mo.",
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
          "Every proposed change gets its own complete copy of the site at its own web address, which anyone can open. It disappears when the change ships.",
        technical:
          "One immutable preview deployment per pull request, plus a long-lived staging branch. Anonymously shareable, torn down automatically, and the internal pages sit behind a password on all of them.",
      },
      pros: [
        "Unlimited parallel copies — two people can review two different changes at once without either seeing the other.",
        "A link you can paste to Alec, Mark or Melissa without asking them to log into anything.",
      ],
      cons: [
        "The CMS half does not follow: TinaCloud never indexed the staging branch, so the admin on staging both reads and edits main. Editing copy on “staging” edits production copy.",
        "HubSpot has no test portal either, so a form filled in on a preview lands in the same place as a real one.",
      ],
    },
    hubspot: {
      summary: "One shared staging area, login required.",
      claim: {
        plain:
          "There is a staging area, but it shares its templates with the live site — so editing a template while testing changes the real site immediately. Preview links also require the viewer to log into HubSpot.",
        technical:
          "Content staging is Professional and up. Its own documentation warns that changes to any template, global content or HubDB table are reflected on live pages. True sandboxes are Enterprise-only, with a 300-asset deploy-back cap and integrations reconnected by hand.",
      },
      pros: [
        "Content staging is enough for a page-copy change, and it is a real feature rather than a workaround.",
      ],
      cons: [
        "No per-change environment exists. The unit of environment is a whole HubSpot account.",
        "Since 2021, preview URLs on HubSpot domains require the viewer to be a logged-in HubSpot user — you cannot simply send Melissa a link.",
        "Staging protects pages but not templates, which is the half most likely to break something.",
      ],
    },
    verdict: "ours",
    takeaway:
      "This is the strongest row for what we have, and the one Alec can demonstrate rather than assert — this very page will arrive as a preview link.",
    toConfirm:
      "Our own weak spot is real: the Tina admin on staging is the production CMS wearing a different hostname. Worth fixing regardless of this comparison.",
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
    id: "booking",
    name: "The booking and payment flow",
    whyItMatters:
      "The site does not only describe the product — it sells it, takes consent, takes payment and hands the customer to Linus.",
    ours: {
      summary: "All of it, with no limits.",
      claim: {
        plain:
          "All of it is ours: signing up, agreeing to the consent form, paying, and being handed over to the assessment. It is the larger half of what the site does.",
        technical:
          "Twenty-three server modules in `packages/booking/src/server/` — Stripe checkout and webhook, consent stamping, the resume state machine, Auth.js sessions in Neon, and the Linus enrolment call.",
      },
      pros: [
        "No limits on what a step can do, how long it can take, or what it can talk to.",
        "It is tested, and the money path has an end-to-end test.",
      ],
      cons: ["It is ours to maintain, and ours to be woken up by."],
    },
    hubspot: {
      summary: "Enterprise only, 10 seconds, one file.",
      claim: {
        plain:
          "HubSpot can host custom logic, but only on its most expensive plan, and each piece must finish in ten seconds and live in a single file.",
        technical:
          "Serverless functions require Content Hub Enterprise: 10s max execution, 128MB, 100 endpoints, JSON only, and a single JavaScript file per function — you bundle it yourself.",
      },
      pros: ["Enough for a form handler or a lookup, which is what it is designed for."],
      cons: [
        "Enterprise-only, so this requirement alone sets the price floor at $1,500/mo.",
        "A Stripe webhook that writes to a database, stamps consent and calls Linus is not what a 10-second single-file function is for.",
        "We would be rebuilding something that works, to run it somewhere more constrained.",
      ],
    },
    verdict: "ours",
    takeaway:
      "This is where “just use HubSpot” stops being a small decision. The marketing pages are the easy part; this is the rest of the site.",
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
          "Sensitive information stays in our own database, with a signed agreement covering it, and only a name, an email and a paid flag ever reach HubSpot.",
        technical:
          "Neon is on the Scale tier specifically because it is the lowest tier offering a BAA. The HubSpot contact integration is deliberately not exported from `@pbh/booking/server`, so an app cannot reach past the data rule by accident.",
      },
      pros: [
        "The rule is enforced by the shape of the code, not by remembering it.",
        "Consent records and the audit trail live somewhere we control.",
      ],
      cons: [
        "It is a rule we maintain; a future change could still breach it if nobody is looking.",
      ],
    },
    hubspot: {
      summary: "Enterprise only, and CRM-shaped.",
      claim: {
        plain:
          "HubSpot will sign a health-data agreement, but only on its top plan, and it covers CRM records rather than website pages.",
        technical:
          "The Sensitive Data feature is Enterprise-only across hubs and is property-shaped: designations apply to CRM properties, with forms, attachments, limited workflows and the v3 API supported. Personalisation tokens, chatbots and sandboxes are explicitly unsupported.",
      },
      pros: ["A real BAA is available, which is more than is commonly assumed."],
      cons: [
        "Enterprise-only, and the cost of the feature is not published.",
        "Enabling it is irreversible — a property's designation is permanent, and declaring HIPAA data locks the account out of data-centre migration.",
        "Website pages are never listed among the supported surfaces.",
      ],
    },
    verdict: "ours",
    takeaway:
      "HubSpot can hold health data, on Enterprise, in the CRM. It is not documented as a place to run a consent flow — and our contract already draws that line.",
    toConfirm:
      "HubSpot does not say whether Content Hub pages can carry sensitive data — they are simply absent from the supported list. That is missing documentation, not a documented “no”, and it would need asking before anyone relied on either reading.",
    sources: [
      {
        label: "The no-PHI rule, in the RFP",
        href: "docs/sow2/technical/PBH_Website_v2.1_RFP.md",
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
          "Anyone on the team can edit page copy in a visual editor without an engineer, and every edit is saved into the same history as the code.",
        technical:
          "TinaCMS writes MDX straight to the branch, so copy history and code history are one history — and a bad edit is revertible the same way a bad commit is.",
      },
      pros: [
        "One history for everything, and copy can be rolled back precisely.",
        "Content is plain files we own; moving it elsewhere is a copy, not an export.",
      ],
      cons: [
        "The editor is less forgiving than HubSpot's, and new page shapes still need an engineer to define.",
        "Because staging edits main, there is currently no safe place to draft a copy change.",
      ],
    },
    hubspot: {
      summary: "Best-in-class editor; they hold the copy.",
      claim: {
        plain:
          "The best-in-class editor for a marketer working alone — drag, drop, publish. The trade is that HubSpot then holds the only copy.",
        technical:
          "Mature WYSIWYG with modules and themes. Export produces HTML for pages and CSV for metadata; HubL templates, modules and themes do not move to another platform.",
      },
      pros: [
        "A non-technical marketer can build a new landing page unaided. Ours cannot, yet.",
        "No deploy step between writing and publishing.",
      ],
      cons: [
        "Leaving means rebuilding templates from scratch; the export is content, not the site.",
        "No engineering review sits between an edit and the public — which cuts both ways.",
      ],
    },
    verdict: "depends",
    takeaway:
      "HubSpot's editor is genuinely better for a marketer alone. Ours is better for a team that wants one history and the ability to undo precisely.",
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
          "The site's colours and type come straight from the design file, so what is drawn is what ships.",
        technical:
          "Tokens mirror the Figma variables under Figma's own names, and stock Tailwind colours are switched off so an off-palette value emits nothing at all.",
      },
      pros: [
        "No ceiling on layout or motion.",
        "A colour outside the palette fails loudly instead of quietly shipping.",
      ],
      cons: ["The Figma sync is manual, so the tokens drift until somebody re-syncs them."],
    },
    hubspot: {
      summary: "Whatever the theme allows.",
      claim: {
        plain:
          "You work inside a theme. Most designs are achievable; the unusual ones get negotiated down.",
        technical:
          "Themes and modules with HubL. React is supported as islands inside HubL templates rather than as the whole page, so the rendering model is theirs.",
      },
      pros: ["A theme keeps a non-designer from breaking the look."],
      cons: ["Bespoke layout and motion fight the template model rather than fit it."],
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
    soWhat: "A healthcare provider running the same stack as ours, down to the host.",
    href: "https://carbonhealth.com",
    evidence: "checked-live",
  },
  {
    name: "Oura",
    runs: "Next.js",
    soWhat: "Consumer health hardware, with a marketing site the same shape as this one.",
    href: "https://ouraring.com",
    evidence: "checked-live",
  },
  {
    name: "Headspace",
    runs: "Next.js",
    soWhat:
      "Health and wellbeing at consumer scale — self-hosted, which shows the stack is not tied to one vendor.",
    href: "https://www.headspace.com",
    evidence: "checked-live",
  },
  {
    name: "The Washington Post",
    runs: "Next.js",
    soWhat:
      "Breaking-news traffic spikes, which is the shape of the Eisai burst we are planning for.",
    href: "https://www.washingtonpost.com",
    evidence: "checked-live",
  },
  {
    name: "Nike, Walmart, Target",
    runs: "Next.js",
    soWhat:
      "The “nobody gets fired for this” answer, if the question is whether the technology is proven.",
    href: "https://www.nike.com",
    evidence: "checked-live",
  },
  {
    name: "The Weather Company",
    runs: "Next.js on Vercel",
    soWhat: "350 million daily users on the hosting we use. Scale is not the constraint.",
    href: "https://vercel.com/customers/how-the-weather-company-serves-real-time-forecasts-to-350-million-daily-active-users-on-vercel",
    evidence: "vendor",
  },
];

export const HUBSPOT_EXAMPLES: Example[] = [
  {
    name: "Care New England",
    runs: "HubSpot CMS",
    soWhat:
      "A real healthcare system on Content Hub — the strongest example for the other side of this page.",
    href: "https://www.carenewengland.org",
    evidence: "checked-live",
  },
  {
    name: "Kelly Services",
    runs: "HubSpot CMS",
    soWhat: "A large staffing firm, and one of HubSpot's own case studies.",
    href: "https://www.kellyservices.com",
    evidence: "checked-live",
  },
  {
    name: "Morehouse College",
    runs: "HubSpot CMS",
    soWhat: "Content-heavy, form-heavy, admissions-driven — exactly what Content Hub is built for.",
    href: "https://morehouse.edu",
    evidence: "checked-live",
  },
  {
    name: "hubspot.com",
    runs: "HubSpot CMS",
    soWhat: "They do run their own site on it, which is more than several platforms can say.",
    href: "https://www.hubspot.com",
    evidence: "checked-live",
  },
];

/**
 * The caveat that keeps the examples section honest, and the one most likely to
 * come up in the room: most “big brand uses HubSpot” claims are about the CRM or
 * the marketing email, not the website product.
 */
export const EXAMPLES_CAVEAT =
  "Content Hub is about 0.2% of the web against Next.js's 3.4%, and there are no household-name consumer brands running their main site on it — the names above are mid-market, healthcare and education, which is the market it serves well. Worth knowing before repeating any “big brand uses HubSpot” claim: almost all of them mean the CRM or the marketing email, not the website. At least one site on HubSpot's own showcase has since moved off it.";
