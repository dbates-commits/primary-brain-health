import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Where the full-flow run tees the marketing server's stdout (see
 * playwright.config.ts). The booking flow gates signup on email confirmation and
 * stores only the token *hash*, so the raw confirmation link exists nowhere but
 * the email — and, outside production with Resend disabled, the server log. The
 * E2E disables Resend for the run and reads the link back from here.
 */
export const MARKETING_LOG = path.join(os.tmpdir(), "pbh-e2e-marketing.log");

/**
 * Poll the marketing log for the most recent booking confirmation URL. With
 * `workers=1` and a unique signup per run, the last match is this test's link.
 */
export async function waitForConfirmUrl(timeoutMs = 15_000): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  const re = /http:\/\/localhost:3000\/booking\/confirm\?token=[^\s]+/g;
  while (Date.now() < deadline) {
    if (existsSync(MARKETING_LOG)) {
      const matches = readFileSync(MARKETING_LOG, "utf8").match(re);
      if (matches && matches.length > 0) {
        return matches[matches.length - 1];
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(
    `No booking confirmation URL found in ${MARKETING_LOG} within ${timeoutMs}ms. ` +
      "Is the marketing server tee-ing to it, and is RESEND_API_KEY disabled for the run?",
  );
}

/**
 * Poll for a line matching `re`, whose first capture group is the URL.
 *
 * Shared by both scoped readers below. They exist because the unscoped
 * `waitForConfirmUrl` takes the last match in the whole file, and the file is
 * only truncated when the server starts — so a reused `pnpm dev`, or a CI retry,
 * leaves it holding another run's links. Scoping to a user id or an address the
 * test minted itself removes that entirely.
 */
async function waitForLoggedUrl(
  re: RegExp,
  what: string,
  timeoutMs: number,
): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (existsSync(MARKETING_LOG)) {
      const log = readFileSync(MARKETING_LOG, "utf8");
      // Last, not first: a resend appends a newer link, and the newest is the
      // one still worth clicking.
      let found: string | undefined;
      for (const match of log.matchAll(re)) {
        found = match[1];
      }
      if (found) {
        return found;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(
    `No ${what} found in ${MARKETING_LOG} within ${timeoutMs}ms. ` +
      "Is the marketing server tee-ing to it, and is RESEND_API_KEY disabled for the run?",
  );
}

/**
 * This user's booking-confirmation link.
 *
 * The id comes from the booking cookie, which is `<userId>.<expiryMs>.<hmac>`.
 * Matches the log's own format, written by `sendConfirmEmail`:
 *
 *     [email] Dev confirmation URL for user <id>:
 *     http://localhost:3000/booking/confirm?token=...
 */
export function waitForConfirmUrlForUser(
  userId: string,
  timeoutMs = 15_000,
): Promise<string> {
  return waitForLoggedUrl(
    new RegExp(
      `Dev confirmation URL for user ${userId}:\\s*(http://localhost:3000/booking/confirm\\?token=\\S+)`,
      "g",
    ),
    `confirmation URL for user ${userId}`,
    timeoutMs,
  );
}

/**
 * This address's magic-link sign-in URL, for the leg where the booking cookie
 * has gone and signing in is the only way back into the flow.
 *
 * Logged by `sendMagicLinkEmail` on the same `RESEND_API_KEY`-unset branch the
 * confirmation link uses:
 *
 *     [auth] Dev sign-in URL for <email>:
 *     http://localhost:3000/api/auth/callback/...
 */
export function waitForSignInUrl(
  email: string,
  timeoutMs = 15_000,
): Promise<string> {
  return waitForLoggedUrl(
    new RegExp(
      `Dev sign-in URL for ${email.replace(/[.+]/g, "\\$&")}:\\s*(http\\S+)`,
      "g",
    ),
    `sign-in URL for ${email}`,
    timeoutMs,
  );
}
