/**
 * Validated Linus Health API environment access, mirroring db/env.ts: read
 * `process.env`, throw a helpful error if anything required is missing.
 *
 * Set per Vercel environment — Preview/dev point at the sandbox, Production at
 * the prod URLs/audience and prod campaign IDs. Locally these come from
 * `.env.local`.
 */

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
