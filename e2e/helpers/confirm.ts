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
