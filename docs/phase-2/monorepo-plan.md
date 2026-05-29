# Monorepo Plan

How we structure the marketing site + funnel app in a single repo without it being hacky. This is the standard 2026 Vercel + Next.js monorepo pattern - same shape as Vercel's own example templates and what Linear, Notion, and Stripe use internally.

## The stack

Three tools. All mature, all first-class supported by Vercel.

| Tool | Role | Why |
| :---- | :---- | :---- |
| **pnpm workspaces** | Package manager + workspace declaration | Faster than npm/yarn, lower disk usage via hard-linking, native workspace support, Vercel-recommended |
| **Turborepo** | Task runner with build caching | Built by Vercel for this exact use case. Caches builds, runs tasks in topological order, only rebuilds what changed |
| **TypeScript project references** | Cross-package type checking | Standard TS feature; IDE jumps and refactors work seamlessly across packages |

Nothing custom, no submodules, no symlinks, no hacky scripts.

## Final repo structure

```
primary-brain-health/
├── apps/
│   ├── marketing/                ← current site lives here
│   │   ├── src/
│   │   ├── content/              ← TinaCMS content
│   │   ├── tina/
│   │   ├── public/
│   │   ├── next.config.ts
│   │   └── package.json
│   └── funnel/                   ← new app (auth + Stripe + DB)
│       ├── src/
│       │   ├── app/get-started/  ← funnel pages
│       │   └── app/api/          ← /api/payment/intent, /api/webhook/stripe, etc.
│       ├── next.config.ts
│       └── package.json
│
├── packages/
│   ├── ui/                       ← shared design system
│   │   ├── src/
│   │   │   ├── button.tsx
│   │   │   ├── hero.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   └── package.json
│   ├── tokens/                   ← Tailwind theme + CSS variables
│   │   ├── tailwind-preset.ts
│   │   └── globals.css
│   ├── types/                    ← shared TS types
│   │   └── src/handoff-token.ts  ← e.g. signed-token payload shape
│   └── config/                   ← shared ESLint, tsconfig base, Prettier
│       ├── eslint-config/
│       └── tsconfig/
│
├── docs/                         ← unchanged
├── package.json                  ← root, declares workspaces
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.json                 ← base config others extend
```

Imports look like:

```ts
// In apps/marketing/src/components/Header.tsx
import { Button } from "@pbh/ui";
import { cn } from "@pbh/ui/utils";

// In apps/funnel/src/app/get-started/page.tsx
import { Button, Input } from "@pbh/ui";
import type { HandoffTokenPayload } from "@pbh/types";
```

The `@pbh/*` aliases are real workspace packages, not path aliases. TypeScript treats them as proper modules. Refactoring a Button affects both apps atomically.

## Vercel setup

Two Vercel projects, both connected to the same GitHub repo. Each project has its own:

- **Root directory**: `apps/marketing` or `apps/funnel`
- **Domain**: `primarybrainhealth.com` or `app.primarybrainhealth.com`
- **Environment variables**: marketing has Tina tokens; funnel has Stripe secrets, DB URL, auth secrets
- **Build & deploy log**: independent

Vercel's "Ignored Build Step" config does the path-based gating: marketing only rebuilds when `apps/marketing/**` or `packages/**` changes; funnel only rebuilds when `apps/funnel/**` or `packages/**` changes. So a TinaCMS edit to a marketing page never touches the funnel deploy.

## Migration from current state

The existing repo becomes `apps/marketing` with minor changes. ~3–5 pts.

1. Create `apps/marketing/` directory at repo root
2. Move `src/`, `content/`, `tina/`, `public/`, `next.config.ts`, `tsconfig.json`, `package.json`, `tailwind.config.ts` into `apps/marketing/`
3. Update internal imports - Tina config paths, the `@/*` and `@tina/*` aliases stay scoped to the marketing app
4. Add root `package.json` with workspace declaration
5. Add `pnpm-workspace.yaml` listing `apps/*` and `packages/*`
6. Add `turbo.json` defining the build/dev/lint pipelines
7. Reconnect Vercel project with new root directory

Then extract design system into `packages/ui` - ~5–8 pts. We don't have to move everything at once; we move what both apps actually need (Button, Input, Hero, layout primitives, brand tokens). Marketing-specific components (BlockRenderer, the Hero variants) stay in `apps/marketing/src/components`.

Create `apps/funnel/` from scratch (`pnpm create next-app`) - ~1 pt.

## What "hacky" looks like (and we're avoiding)

| Anti-pattern | Why it sucks |
| :---- | :---- |
| Git submodules | Broken PR experience, separate clone steps, version mismatch hell |
| Manual symlinks | Works on your machine, breaks in CI, undocumented magic |
| `../../shared/components/Button` relative imports across apps | Brittle, breaks if structure moves, no real package boundary |
| Lerna with npm | Older pattern, slower, more config |
| Yarn 1 workspaces | Deprecated, slower than pnpm |
| Custom monorepo scripts in `scripts/` | Reinventing Turborepo poorly |
| Single Vercel project building two apps in series | Defeats the deploy-isolation purpose |

What we're doing is the pattern documented in the [Turborepo + Vercel guide](https://vercel.com/docs/monorepos/turborepo), the same shape the Vercel team ships in `vercel/turborepo/examples/with-tailwind/`.

## Setup tasks (one-time, before Phase 1 build clock)

| Task | Pts |
| :---- | ---: |
| Migrate current app to `apps/marketing/` | 5 |
| pnpm workspaces + Turborepo setup + root config | 3 |
| Extract design system to `packages/ui` (initial pass - common primitives + Hero) | 8 |
| Set up `packages/tokens` (Tailwind preset + CSS vars) | 3 |
| Set up `packages/config` (shared ESLint, TS, Prettier) | 3 |
| Scaffold `apps/funnel` (`pnpm create next-app` + base imports from `@pbh/ui`) | 3 |
| Configure two Vercel projects + Ignored Build Step | 2 |
| Update CI / pre-commit hooks for monorepo (if any) | 2 |
| README + dev docs (commands, common workflows) | 2 |
| **Total setup** | **31** |

That's ~43 hours at 1.4x multiplier, or about a week of focused engineering. Happens during the discovery + design weeks (late May), before the Phase 1 build clock starts on June 1.

## Dev experience

What it looks like day-to-day:

```bash
# install everything once
pnpm install

# start both apps in dev (Turborepo runs in parallel)
pnpm dev
# → marketing on :3000, funnel on :3001

# build everything (Turborepo caches, only rebuilds changed)
pnpm build

# build just one app
pnpm --filter marketing build
pnpm --filter funnel build

# lint everything
pnpm lint

# typecheck everything
pnpm typecheck
```

VS Code / Cursor / your editor of choice: opens the root, sees both apps and all packages, IDE features work across the whole repo. Claude Code likewise - it sees the full graph and edits across packages naturally.

## Open decisions to make in discovery

- **Stripe webhook origin**: presumably `app.primarybrainhealth.com/api/webhook/stripe`. Stripe dashboard configured to send there.
- **Auth domain**: cookies set at `.primarybrainhealth.com` (apex domain) so they span both `primarybrainhealth.com` and `app.primarybrainhealth.com`. Validates with the chosen auth provider.
- **GA4 cross-domain measurement**: configure GA4 to track sessions across both domains as one user journey.
- **Local dev domains**: dev runs on `localhost:3000` and `localhost:3001` by default; we can map to `pbh.test` and `app.pbh.test` via `/etc/hosts` if cookie testing requires it.
- **Whether `apps/funnel` needs TinaCMS at all** - probably not. Funnel pages aren't content-driven. Saves complexity.

## Estimate impact

| | Before monorepo | After monorepo |
| :---- | ---: | ---: |
| Phase 1 engineering pts | 228 | 259 (+31) |
| Phase 1 engineering hrs (1.4x) | 320 | 363 (+43) |

Roughly +43 hrs of Phase 1 effort for monorepo setup. Pays for itself in deploy isolation, design-system sharing, and future flexibility.

## What's NOT in this plan (yet)

- Whether `apps/funnel` uses the same auth provider as a future portal - that's a discovery decision
- Whether `packages/ui` becomes a publishable npm package down the road - not for this engagement
- Storybook for the design system - possible Phase 2 addition, separate decision
- E2E test infrastructure - likely Playwright at repo root running against both apps; scope in Phase 1 QA
