import { defineConfig, devices } from "@playwright/test";
import { MARKETING_LOG } from "./e2e/helpers/confirm";

/**
 * E2E config for the PBH onboarding flow, which spans two apps:
 *   - marketing (booking modal) on :3000
 *   - app (post-payment product: login, /assessments) on :3001
 *
 * Specs live in `e2e/`. Locators prefer role/label over data-testid.
 *
 * The full happy path writes to a database and drives Stripe + Linus, so it
 * needs real test env (a dedicated test DB/Neon branch, Stripe TEST keys with an
 * ACTIVE price, Linus sandbox on a US IP). Provide those via `.env.e2e`
 * (gitignored) or the shell; without them, only the env-free smoke specs pass.
 * Set E2E_SKIP_WEBSERVER=1 to test against already-running dev servers.
 *
 * Base URLs are overridable so the same suite can point at a preview/staging
 * deploy — but NEVER a Vercel preview, which shares the prod Neon DB.
 */
const MARKETING_URL = process.env.E2E_MARKETING_URL ?? "http://localhost:3000";
const APP_URL = process.env.E2E_APP_URL ?? "http://localhost:3001";
const skipWebServer = process.env.E2E_SKIP_WEBSERVER === "1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // The full flow recovers each signup's confirmation link by reading the *last*
  // one printed to the marketing log (`helpers/confirm.ts`) — the raw token
  // exists nowhere else. That only identifies this test's link if one signup is
  // in flight at a time, so the DB-backed tier is serial, not just CI.
  workers: process.env.CI || process.env.E2E_FULL_FLOW === "1" ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",

  use: {
    baseURL: MARKETING_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  // Specs are rooted at the app they start on. The onboarding flow begins on
  // marketing and crosses to the app by navigation (the Done step links to the
  // app URL), so it's a marketing-project spec. App-only specs (e.g. login) live
  // under e2e/app/ and run against the app baseURL.
  projects: [
    {
      name: "marketing",
      testIgnore: "app/**",
      use: { ...devices["Desktop Chrome"], baseURL: MARKETING_URL },
    },
    {
      name: "app",
      testMatch: "app/**/*.spec.ts",
      use: { ...devices["Desktop Chrome"], baseURL: APP_URL },
    },
  ],

  // Boot the app servers the run needs. Marketing is always required; the app
  // (:3001) needs a database, so it's only booted for the full money path
  // (E2E_FULL_FLOW=1) — the smoke tier never touches it. `reuseExistingServer`
  // lets a local `pnpm dev` satisfy these; CI starts them fresh. Skipped
  // entirely when E2E_SKIP_WEBSERVER=1 (point base URLs at running servers).
  webServer: skipWebServer
    ? undefined
    : [
        // For the full flow, tee marketing's stdout to a log the test reads (to
        // recover the email-confirmation link) and disable Resend so that link
        // is logged instead of mailed — and so signup doesn't 422 on test
        // addresses. The smoke tier keeps the plain command untouched. The full
        // flow ends at Stripe payment success, entirely within marketing, so the
        // app (:3001) is not booted here — add it back if an app-side spec needs it.
        process.env.E2E_FULL_FLOW === "1"
          ? {
              command: `sh -c 'pnpm --filter marketing dev 2>&1 | tee ${MARKETING_LOG}'`,
              url: MARKETING_URL,
              reuseExistingServer: !process.env.CI,
              timeout: 120_000,
              env: { RESEND_API_KEY: "" },
            }
          : {
              command: "pnpm --filter marketing dev",
              url: MARKETING_URL,
              reuseExistingServer: !process.env.CI,
              timeout: 120_000,
            },
      ],
});
