/**
 * The configured assessment campaigns.
 *
 * This replaces the old `LINUS_CAMPAIGNS` env var so campaigns are edited in code
 * (typed and reviewable) instead of a JSON blob. Add or remove an assessment by
 * editing the lists below — no env change needed.
 *
 * Campaign IDs differ between the Linus sandbox and production, so we keep one
 * list per environment and select by `VERCEL_ENV` — mirroring how the Linus
 * credentials/URLs are already split per Vercel environment (Preview and local
 * dev → sandbox; Production → prod).
 *
 * Display copy (label / description / duration / order) lives in
 * `app/assessments/assessment-content.ts`, keyed by `key`; the `name` here is a
 * fallback only. `producesReport` defaults to `false` — set `true` for campaigns
 * Linus generates a patient report for (today only LHQ does); the rest settle
 * into "Completed" once finished instead of spinning on the report.
 */

import type { LinusCampaign } from "./types";

/** Linus sandbox (staging) — used by local dev and Vercel Preview. */
const SANDBOX_CAMPAIGNS: LinusCampaign[] = [
  {
    key: "LHQ",
    name: "LHQ",
    campaignId: "9d4d1962-9913-4efd-8020-38b00db9d96b",
    producesReport: true,
  },
  {
    key: "ePSOM",
    name: "ePSOM",
    campaignId: "f427c353-f1f0-48e8-bff2-24abbe50b63b",
  },
  {
    key: "DAC",
    name: "DAC",
    campaignId: "b47446fa-594e-4df5-97e1-fbf39d830474",
  },
];

/**
 * Linus production. TODO: fill in once the production campaign IDs are confirmed
 * (see PR #9). Until then a Production deploy renders the empty state.
 */
const PRODUCTION_CAMPAIGNS: LinusCampaign[] = [];

/** The campaigns for the current environment (prod on Production, else sandbox). */
export function getCampaigns(): LinusCampaign[] {
  return process.env.VERCEL_ENV === "production"
    ? PRODUCTION_CAMPAIGNS
    : SANDBOX_CAMPAIGNS;
}
