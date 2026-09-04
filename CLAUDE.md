# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This is a **pnpm + Turborepo monorepo**. Run these from the repo root:

```bash
pnpm install                     # install all workspaces
pnpm dev                         # all apps in parallel (marketing :3000, funnel :3001)
pnpm build                       # build everything (Turborepo cached)
pnpm lint                        # eslint across the workspace
pnpm typecheck                   # tsc --noEmit across the workspace
pnpm --filter marketing dev      # run a single app/package (marketing | funnel | @pbh/ui …)
pnpm --filter funnel build
```

Marketing's Tina admin is at `/admin/index.html` during development. Note: the
`marketing` build runs `tinacms build` first, which needs TinaCloud creds (or
local mode); plain `next build` works without them.

## Workspace layout

- `apps/marketing/` — the Next.js + TinaCMS marketing site (formerly the repo root)
- `apps/funnel/` — the funnel app (auth + Stripe + signed-token handoff), `:3001`
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

**Figma is the source of truth.** `packages/tokens/theme.css` (`@pbh/tokens`)
mirrors the variables of Figma file `SppKdzsaH6rQ14u90UpNSq` under Figma's own
names and wires them into Tailwind 4 via `@theme inline`. Each app imports it
from its `globals.css` (`@import "@pbh/tokens/theme.css";`); app-specific
`@font-face` declarations and keyframes stay in the app's own `globals.css`.

A token's name is its Figma variable path with `/` replaced by `-`, so a Figma
variable name is greppable here: `background/default` →
`--color-background-default` → `bg-background-default`. The stutter in
`text-text-default` is deliberate — do not collapse it.

**Two vocabularies are live at once, and only one of them is correct for new
code.** The Figma set above is what to write. Below it sits a frozen Material 3
block — `primary` / `secondary` / `surface` / `on-*` / `*-container` — kept
declared because forty-two files still reference it: nineteen in
`apps/marketing`, fourteen in `apps/funnel`, nine in `packages/ui`. Never reach
for those names in anything new. A component that picks one compiles here and
renders nothing on `staging`, with no error anywhere. Tailwind's stock palette
(`bg-indigo-600`, `text-gray-600`) is likewise still resolving only because
twelve un-migrated files need it; it is not part of the design system.

**No values are listed here on purpose.** This section described a navy /
forest-green / Manrope palette long after it was replaced, because restating
values is how they go stale. Read `theme.css`.

Headlines are Larken, served by Adobe Fonts (kit `qrz4jhn`, linked from
`layout.tsx`). There are no Larken files under `public/fonts` — do not add an
`@font-face` for it, which is what shadowed the kit and dropped every headline
to Georgia.

### Path Aliases

Scoped to each app (e.g. within `apps/marketing/`):
- `@/*` → `src/*`
- `@tina/*` → `tina/*`

Cross-app shared code is imported from the `@pbh/*` workspace packages, not via aliases.

### API

`src/app/api/intake/route.ts` handles consultation form POST submissions. HubSpot integration is planned but not yet implemented.

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
