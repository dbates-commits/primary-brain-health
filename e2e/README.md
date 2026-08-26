# E2E tests (Playwright)

End-to-end tests for the marketing booking → Stripe payment flow (`:3000`).

Config: [`playwright.config.ts`](../playwright.config.ts). Specs live here in `e2e/`.

> Scope note: the tests stop at the Stripe **payment outcome** and the welcome
> screen it leads to. There is nothing beyond the welcome screen to test — per
> the Jul 2026 direction, the **Linus Engagement App** owns login and the
> assessments themselves, so our surface ends at a link out to it. The payment
> path calls no Linus API at all (pbh-ek8), so no run needs a US IP.

## Run

```bash
pnpm test:e2e                 # headless
pnpm test:e2e:ui              # Playwright UI mode
pnpm test:e2e booking-smoke   # a single spec (substring match on the path)

# Watch it happen. UI mode gives a test picker, a live browser pane and
# time-travel through every step's DOM snapshot; --headed just shows the run.
E2E_FULL_FLOW=1 pnpm test:e2e:ui
E2E_FULL_FLOW=1 pnpm test:e2e --headed resume

# Against an already-running dev server (skip the managed webServer):
E2E_SKIP_WEBSERVER=1 pnpm test:e2e
```

First-time browser install (once per machine): `npx playwright install chromium`.

## Two tiers of spec

| Spec | Needs | Runs by default |
|---|---|---|
| `booking-smoke.spec.ts` | the app only, no secrets | ✅ yes |
| `booking-authz.spec.ts` | test DB | ⏭️ skipped unless `E2E_FULL_FLOW=1` |
| `onboarding.spec.ts` (payment path) | test DB + Stripe test keys | ⏭️ skipped unless `E2E_FULL_FLOW=1` |
| `resume.spec.ts` (abandon + return) | test DB + Stripe test keys | ⏭️ skipped unless `E2E_FULL_FLOW=1` |

The smoke spec proves the harness + booking entry work with no secrets. The rest
are skipped (not failed) unless you opt in, so a missing secret is never a false
red.

`resume.spec.ts` is the abandon-and-return path: it stops after every step,
leaves, comes back to `/?booking=resume#booking`, and asserts the step the
server resolved — through payment and once more afterwards. One leg drops the
booking cookie and recovers by signing in, which is the only automated cover for
a customer returning after the cookie's two hours.

`onboarding.spec.ts` drives the whole path (signup → email confirm → details →
consent → Stripe) for a fresh user per case and asserts the charge outcome:

- **accepted** — Visa and Mastercard → Stripe's "Thanks for your payment", then
  a navigation to `/welcome` with its CTA out to the Engagement App.
- **declined** — generic-decline and insufficient-funds test cards → the
  in-frame decline reason, and no success.

(Stripe test mode has no distinct HSA/FSA card and we don't flag them, so
HSA/FSA cards are covered as ordinary branded charges.)

## Full flow (`E2E_FULL_FLOW=1`)

**No Linus, no VPN.** It writes real rows and drives Stripe, so it needs:

- **`DATABASE_URL`** → a **dedicated Neon branch** (cheap, disposable). NEVER
  prod, and NEVER a Vercel preview URL — previews share the prod Neon DB, and the
  flow writes `users` / `consents` / `payments` rows. Apply migrations to the
  branch before the first run.
- **Stripe TEST keys + an ACTIVE price** (`STRIPE_SECRET_KEY`,
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_ASSESSMENT_PRICE_ID`). Reuse
  staging's — they're already test-mode.
- Optionally **`NEXT_PUBLIC_ENGAGEMENT_APP_URL`**, and the welcome screen's CTA
  href is asserted too; unset, the screen renders no button by design and that
  one check is skipped. Everything else on the welcome screen is asserted either
  way.

Put these in `apps/marketing/.env.local`. The config disables `RESEND_API_KEY`
for the run and tees the marketing server log so the test can read back the
email-confirmation link (signup gates on it) instead of needing a mailbox.

```bash
E2E_FULL_FLOW=1 pnpm test:e2e --project=marketing
```

## CI

`.github/workflows/e2e.yml` runs the **smoke tier only** on PRs. The payment
flow is skipped there (no `E2E_FULL_FLOW`). It could be added to CI without a
US-region runner — it no longer touches Linus — given a test DB and Stripe test
keys as Actions secrets; that's a separate task.

## Conventions

- Prefer role/label locators (`getByRole`, `getByLabel`) over `data-testid`.
- The Stripe card fields live in the `embedded-checkout` iframe — reach them with
  `frameLocator` and their stable ids (`#cardNumber`, `#cardExpiry`, `#cardCvc`);
  opt out of Link "save my info" (it forces a required phone).
