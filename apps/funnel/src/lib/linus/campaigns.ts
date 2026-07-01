/**
 * The configured assessment campaigns — the single source of truth.
 *
 * Everything env-independent (display copy, ordering, whether a report is
 * produced) lives once in `CAMPAIGNS`, keyed by `key`. The only thing that
 * differs between the Linus sandbox and production is the `campaignId`, so those
 * are kept in per-environment maps and joined on read by `getCampaigns()`, which
 * selects by `VERCEL_ENV` (Production → prod IDs; Preview and local dev →
 * sandbox). Add or edit an assessment here — no env var, no second file.
 *
 * Copy is verbatim from the Figma "Welcome Back" design (node 472-1102). `order`
 * sorts the cards (lowest first; the first renders under "Start Here").
 * `producesReport` defaults to `false` — set `true` only for campaigns Linus
 * generates a patient report for (today: LHQ); the rest settle into "Completed"
 * once finished instead of spinning on the report.
 */

import type { LinusCampaign } from "./types";

/** A campaign's env-independent attributes (everything but the campaignId). */
type CampaignDef = Omit<LinusCampaign, "campaignId">;

const CAMPAIGNS: Record<string, CampaignDef> = {
  DAC: {
    key: "DAC",
    name: "DAC / Digital Assessment of Cognition",
    description:
      "This is the description of the text that is simple and easy to understand.",
    duration: "less than 10 min",
    order: 0,
  },
  LHQ: {
    key: "LHQ",
    name: "LHQ / Lifestyle Health Questionnaire",
    description:
      "This is the description of the text that is simple and easy to understand.",
    duration: "less than 2 min",
    order: 1,
    producesReport: true,
  },
  ePSOM: {
    key: "ePSOM",
    name: "Personal Priorities Assessment",
    description:
      "Describe, in your own words, the aspects of your brain health that matter most to you—then see how they change over time.",
    duration: "less than 2 min",
    order: 2,
  },
};

/** Linus sandbox (staging) campaign IDs, keyed by campaign `key`. */
const SANDBOX_IDS: Record<string, string> = {
  LHQ: "9d4d1962-9913-4efd-8020-38b00db9d96b",
  ePSOM: "f427c353-f1f0-48e8-bff2-24abbe50b63b",
  DAC: "b47446fa-594e-4df5-97e1-fbf39d830474",
};

/**
 * Linus production campaign IDs. TODO: fill in once confirmed (see PR #9). Until
 * then a Production deploy has no campaigns and renders the empty state.
 */
const PRODUCTION_IDS: Record<string, string> = {};

/**
 * The campaigns for the current environment, sorted by `order`. A campaign with
 * no id for the active environment is omitted (so Production stays empty until
 * its IDs are added).
 */
export function getCampaigns(): LinusCampaign[] {
  const ids =
    process.env.VERCEL_ENV === "production" ? PRODUCTION_IDS : SANDBOX_IDS;
  return Object.values(CAMPAIGNS)
    .filter((c) => ids[c.key])
    .sort((a, b) => a.order - b.order)
    .map((c) => ({ ...c, campaignId: ids[c.key] }));
}
