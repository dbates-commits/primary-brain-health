/**
 * Validated Linus Health API environment access, mirroring db/env.ts: read
 * `process.env`, throw a helpful error if anything required is missing.
 *
 * Set per Vercel environment — Preview/dev point at the sandbox, Production at
 * the prod URLs/audience and prod campaign IDs. Locally these come from
 * `.env.local`.
 */

import type { LinusCampaign } from "./types";

export interface LinusConfig {
  clientId: string;
  clientSecret: string;
  /** Includes the `/v1` path segment, e.g. https://…/v1 */
  baseUrl: string;
  tokenUrl: string;
  audience: string;
}

export function getLinusConfig(): LinusConfig {
  const clientId = process.env.LINUS_CLIENT_ID;
  const clientSecret = process.env.LINUS_CLIENT_SECRET;
  const baseUrl = process.env.LINUS_BASE_URL;
  const tokenUrl = process.env.LINUS_TOKEN_URL;
  const audience = process.env.LINUS_AUDIENCE;

  if (!clientId || !clientSecret || !baseUrl || !tokenUrl || !audience) {
    const missing = (
      [
        ["LINUS_CLIENT_ID", clientId],
        ["LINUS_CLIENT_SECRET", clientSecret],
        ["LINUS_BASE_URL", baseUrl],
        ["LINUS_TOKEN_URL", tokenUrl],
        ["LINUS_AUDIENCE", audience],
      ] as const
    )
      .filter(([, value]) => !value)
      .map(([name]) => name);
    throw new Error(
      `Linus API is not configured. Missing: ${missing.join(", ")}. ` +
        "Locally, copy .env.example to .env.local and fill in the sandbox " +
        "credentials. On Vercel, set them per environment.",
    );
  }

  return { clientId, clientSecret, baseUrl, tokenUrl, audience };
}

/**
 * The configured campaigns, parsed from `LINUS_CAMPAIGNS` (a JSON array of
 * `{ key, name, campaignId }`). This is the single place a campaign is wired
 * up — add or remove one by editing that env var, no code change. Returns an
 * empty list when unset (the page renders an empty state); throws if the value
 * is present but malformed, so a typo fails loudly rather than silently.
 */
export function getCampaigns(): LinusCampaign[] {
  const raw = process.env.LINUS_CAMPAIGNS;
  if (!raw) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      "LINUS_CAMPAIGNS is not valid JSON. Expected an array of " +
        '{ "key", "name", "campaignId" }.',
    );
  }
  if (!Array.isArray(parsed)) {
    throw new Error(
      'LINUS_CAMPAIGNS must be a JSON array of { "key", "name", "campaignId" }.',
    );
  }

  return parsed.map((entry, index) => {
    const e = entry as Record<string, unknown>;
    if (
      typeof entry !== "object" ||
      entry === null ||
      typeof e.key !== "string" ||
      typeof e.name !== "string" ||
      typeof e.campaignId !== "string"
    ) {
      throw new Error(
        `LINUS_CAMPAIGNS[${index}] must have string "key", "name", and "campaignId".`,
      );
    }
    return { key: e.key, name: e.name, campaignId: e.campaignId };
  });
}
