/**
 * Banner copy.
 *
 * DRAFT — NOT APPROVED. This wording is a compliance artifact, not chrome: it
 * has to clear the Washington MHMDA bar for consent to collecting consumer
 * health data (clear, specific, opt-in), which generic cookie language does
 * not. Bill reviews it before this ships; see pbh-bws.46. It is written out in
 * full rather than left as lorem so the review has something to mark up —
 * pbh-3v0 is what the other failure mode looks like.
 */
export const COOKIE_CONSENT_COPY = {
  title: "Your privacy choices",
  bodyLead:
    "We use analytics cookies to understand how people move through this site, including which parts of our brain health services they look at. That is optional, and we only do it if you say yes.",
  bodyTrail:
    "Necessary cookies — the ones that keep you signed in and your booking secure — are always on. You can change your mind at any time from the footer.",
  policyLinkLabel: "Read our Privacy Policy",
  policyHref: "/privacy",
  acceptLabel: "Accept analytics",
  declineLabel: "Decline",
  reopenLabel: "Your privacy choices",
} as const;
