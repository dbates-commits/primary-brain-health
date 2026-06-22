/**
 * Validated database environment access.
 *
 * `DATABASE_URL` is auto-wired by the Vercel + Neon integration per environment
 * (production / preview / development). Locally it comes from `.env.local`.
 */

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Locally, copy .env.example to .env.local and " +
        "fill in your Neon connection string. On Vercel it is provided by the " +
        "Neon integration.",
    );
  }
  return url;
}
