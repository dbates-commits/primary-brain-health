# E2E tests (Playwright)

End-to-end tests for the onboarding flow, which spans both apps:
marketing booking (`:3000`) → app handoff → `/assessments` (`:3001`).

Config: [`playwright.config.ts`](../playwright.config.ts). Specs live here in `e2e/`.

## Run

```bash
pnpm test:e2e                 # headless, boots both apps via webServer
pnpm test:e2e:ui              # Playwright UI mode
pnpm test:e2e booking-smoke   # a single spec

# Against already-running dev servers (skip the managed webServer):
E2E_SKIP_WEBSERVER=1 pnpm test:e2e
```

First-time browser install (once per machine): `npx playwright install chromium`.

## Two tiers of spec

| Spec | Needs | Runs by default |
|---|---|---|
| `booking-smoke.spec.ts` | marketing app only | ✅ yes |
| `onboarding.spec.ts` (money path) | test DB + Stripe + Linus | ⏭️ skipped unless `E2E_FULL_FLOW=1` |

The smoke spec proves the harness + booking entry work with no secrets. The full
money-path spec is skipped (not failed) unless you opt in, so a missing secret is
never a false red.

## Full-flow env (`E2E_FULL_FLOW=1`)

Put these in `.env.e2e` (gitignored) or the shell:

- **`DATABASE_URL`** → a **dedicated test DB / Neon branch**. NEVER prod, and
  NEVER a Vercel preview URL — previews currently share the prod Neon DB.
  The flow writes `users` / `consents` / `payments` rows; seed/clean per run.
- **Stripe** → TEST keys (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
  and an **ACTIVE** assessment price (an archived price makes "start payment"
  fail). If asserting fulfillment via the webhook, also wire
  `STRIPE_WEBHOOK_SECRET` + `stripe listen`.
- **Linus** → sandbox creds (`LINUS_*`). The Linus sandbox API is **US-only**;
  enrollment 403s off a US IP. In CI, stub Linus or use a US-region runner.
- **`NEXT_PUBLIC_APP_URL`** (marketing → app handoff target).

## CI

No GitHub Actions workflow yet (`.github/` doesn't exist). Adding one — with the
secrets above and a cached browser — is tracked separately, not in this setup.

## Conventions

- Prefer role/label locators (`getByRole`, `getByLabel`) over `data-testid`; add
  a `data-testid` only where semantic targeting is genuinely ambiguous.
- The Stripe card fields live in an iframe — target them with `frameLocator`.
