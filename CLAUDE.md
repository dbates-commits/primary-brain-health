# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This is a **pnpm + Turborepo monorepo**. Run these from the repo root:

```bash
pnpm install                     # install all workspaces
pnpm dev                         # all apps in parallel (marketing :3000, app :3001)
pnpm build                       # build everything (Turborepo cached)
pnpm lint                        # eslint across the workspace
pnpm typecheck                   # tsc --noEmit across the workspace
pnpm --filter marketing dev      # run a single app/package (marketing | app | @pbh/ui …)
pnpm --filter app build
```

Marketing's Tina admin is at `/admin/index.html` during development. Note: the
`marketing` build runs `tinacms build` first, which needs TinaCloud creds (or
local mode); plain `next build` works without them.

## Workspace layout

- `apps/marketing/` — the Next.js + TinaCMS marketing site (formerly the repo root)
- `apps/app/` — the signed-in app: session, `/welcome`, `/assessments`, reports,
  and the Stripe webhook, `:3001`
- `packages/ui/` (`@pbh/ui`) — shared design-system primitives + `cn()`; consumed via `transpilePackages`
- `packages/tokens/` (`@pbh/tokens`) — Tailwind 4 theme + CSS variables (`theme.css`)
- `packages/types/` (`@pbh/types`) — shared TS types (signed-token handoff payload, …)
- `packages/config/` (`@pbh/config`) — shared ESLint flat config (`eslint/base`) + tsconfig presets

Path aliases `@/*` and `@tina/*` are scoped to each app. Cross-app sharing goes
through the `@pbh/*` packages. See `docs/sow2/technical/monorepo-plan.md`.

## Issue Tracking

This repo uses **beads** (`bd`) for issue tracking, stored in `.beads/`. Use `bd list`, `bd show <id>`, `bd create`, `bd update <id> --status done`. Issue data lives in a local Dolt DB (`.beads/dolt/`, gitignored); `main` tracks only the beads scaffolding. Issues are shared via the `beads-backup` branch (kept off `main`, pushed to `origin` only): `bd backup export-git` to publish, `bd backup fetch-git` to restore on a fresh clone. `.beads/.beads-credential-key` is a machine-local secret; never commit it.

## Architecture

**Stack**: Next.js 16 (App Router, async Server Components), React 19, TypeScript, Tailwind CSS 4, TinaCMS 3.

> Paths in this Architecture section are relative to **`apps/marketing/`** (the
> marketing app), unless prefixed with `packages/`.

### Content Pipeline

Tina CMS is the content layer. Schema definitions in `tina/collections/` and `tina/blocks/` generate GraphQL types into `tina/__generated__/`. Content lives as MDX/JSON files in `content/`.

**Rendering flow**:
1. Server Component calls `client.queries.page({ relativePath })` from `tina/__generated__/client`
2. Passes `{ data, query, variables }` to `<PageClient>` (client component)
3. `PageClient` wraps with `useTina()` hook for live visual editing
4. `<BlockRenderer>` switches on `block.__typename` to render the correct component

### Pages

- `/` renders `content/pages/home.mdx`
- `src/app/[slug]/page.tsx` handles all other pages from `content/pages/`
- Blog (`/blog/[slug]`) and Projects (`/projects/[slug]`) have their own routes and collections

### Block System

Pages are composed of blocks defined in `tina/blocks/`. Each block has a Tina schema template and a corresponding React component in `src/components/blocks/`. `BlockRenderer.tsx` is the central switch that maps block types to components.

Block components receive a `variant` prop for layout variations and `tinaFields` for visual editing integration via `data-tina-field`.

### Hero Component

The hero lives under `src/components/blocks/Hero/`:
- `Hero.tsx` — entry point, renders `HeroFullImage`
- `HeroFullImage.tsx` — full-bleed video hero with overlay text
- `hero-utils.tsx` — shared types (`HeroProps`), constants (`TRUST_AVATARS`), and helpers (`highlightBrainHealth`)

### Design System

Theme is called "The Cognitive Sanctuary", defined as CSS custom properties in `packages/tokens/theme.css` (`@pbh/tokens`) and wired into Tailwind 4 via `@theme inline`. Each app imports it from its `globals.css` (`@import "@pbh/tokens/theme.css";`). App-specific `@font-face` declarations and keyframes stay in the app's own `globals.css`.

- **Primary**: `#041632` (dark navy)
- **Secondary**: `#446558` (forest green)
- **Surface**: `#fbf9f4` (warm off-white) with 7 surface-level variants
- **Error**: `#ba1a1a`
- **Fonts**: Manrope (headlines, `font-headline`), Inter (body, `font-body`)

Use design token classes (`text-primary`, `bg-surface`, `text-on-surface-variant`, etc.) rather than raw hex values.

### Path Aliases

Scoped to each app (e.g. within `apps/marketing/`):
- `@/*` → `src/*`
- `@tina/*` → `tina/*`

Cross-app shared code is imported from the `@pbh/*` workspace packages, not via aliases.

### API

`src/app/api/intake/route.ts` handles consultation form POST submissions. HubSpot integration is planned but not yet implemented.

### Booking flow

The booking flow spans both apps: marketing owns the modal and Stripe checkout,
the app owns the session, `/assessments`, and the only Stripe webhook. See
[`docs/booking-flow.md`](docs/booking-flow.md) for the sequence, the resume state
machine, what each step writes, and the four different tokens involved. Read it
before changing anything in `packages/booking/src/server/`.

## Key Conventions

- Tina field paths use `tinaField()` from `tinacms/dist/react` to enable click-to-edit in the CMS admin
- `BlockRenderer` auto-generates section IDs by slugifying block headlines for scroll-anchored navigation
- The Header uses `IntersectionObserver` to highlight nav items as sections scroll into view
- `cn()` from `@pbh/ui/utils` combines `clsx` + `tailwind-merge` for class composition (shared design-system primitives also live in `@pbh/ui`)

## Code Style

- **Always use braces for `if` statements.** No single-line or braceless `if`s — every `if`/`else if`/`else` body goes on its own line(s) wrapped in `{ }`, even one-liners and early returns/guard clauses.

  ```ts
  // ✗ Do not
  if (!user) return null;
  if (count > 0) doThing();

  // ✓ Do
  if (!user) {
    return null;
  }
  if (count > 0) {
    doThing();
  }
  ```

- **One component per file.** Each React component lives in its own file, named after the component. Don't declare a second component (even a small helper/sub-component) in the same file — extract it into its own file and import it. This keeps files discoverable and matches the existing `src/components/**` layout (one component per directory + `index.ts`).
