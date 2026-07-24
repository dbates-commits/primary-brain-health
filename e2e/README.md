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

## Full-flow (`E2E_FULL_FLOW=1`) — run locally behind a US VPN

The money path is a **local-only** run: the Linus sandbox is **US-only**, so it
must be driven from a **US IP (VPN)** against the real sandbox. It is
deliberately **not** in CI, and there is no Linus stub (a test-only stub in the
Linus client risks handing out fake enrollments if the flag ever reaches prod).

Reuse **staging's env** for most of it — copy staging's values into both
`apps/marketing/.env.local` and `apps/app/.env.local`, then override only the
database:

- **`DATABASE_URL`** → a **dedicated Neon branch** (cheap, disposable). NEVER
  prod, and NEVER staging's own URL / a Vercel preview URL — previews share the
  prod Neon DB, and the flow writes `users` / `consents` / `payments` rows.
  Apply migrations to the branch before the first run.
- **Stripe** → staging already runs TEST keys with an **ACTIVE** price; reuse
  them. Values that are shared across the two apps (`STRIPE_*`,
  `BOOKING_RESUME_SECRET`, `AUTH_HANDOFF_SECRET`) must **match** in both.
- **Linus** → staging's `LINUS_*` sandbox creds; connect a **US VPN** before
  running or the enroll step 403s.
- **Handoff URLs** → `NEXT_PUBLIC_FUNNEL_URL` / `APP_BASE_URL` =
  `http://localhost:3001`, `BOOKING_BASE_URL` = `http://localhost:3000`.

Then, on the VPN:

```bash
E2E_FULL_FLOW=1 pnpm test:e2e --project=marketing
```

## CI

`.github/workflows/e2e.yml` runs the **smoke tier only** on PRs. The full flow
stays out of CI by design (US-only Linus). If it ever needs to run headless,
that's a separate task: a US-region runner + the secrets above as Actions
secrets.

## Conventions

- Prefer role/label locators (`getByRole`, `getByLabel`) over `data-testid`; add
  a `data-testid` only where semantic targeting is genuinely ambiguous.
- The Stripe card fields live in an iframe — target them with `frameLocator`.
