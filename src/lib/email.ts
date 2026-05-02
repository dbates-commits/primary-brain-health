import { Resend } from "resend";

let cached: Resend | null = null;

/**
 * Get a singleton Resend client. Returns null if RESEND_API_KEY isn't set so
 * API routes can degrade gracefully (e.g. log + return success in dev) rather
 * than crash.
 */
export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!cached) cached = new Resend(key);
  return cached;
}

export const FROM_ADDRESS =
  process.env.RESEND_FROM_ADDRESS || "Primary Brain Health <noreply@example.com>";
