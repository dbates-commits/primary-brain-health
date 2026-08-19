# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This is a **pnpm + Turborepo monorepo**. Run these from the repo root:

```bash
pnpm install                     # install all workspaces
pnpm dev                         # everything in parallel (marketing :3000, emails :3002)
pnpm build                       # build everything (Turborepo cached)
pnpm email                       # React Email preview only, on :3002
pnpm lint                        # eslint across the workspace
pnpm typecheck                   # tsc --noEmit across the workspace
pnpm --filter marketing dev      # run a single app/package (marketing | @pbh/ui …)
pnpm --filter marketing build
```

Marketing's Tina admin is at `/admin/index.html` during development. Note: the
`marketing` build runs `tinacms build` first, which needs TinaCloud creds (or
local mode); plain `next build` works without them.

## Workspace layout

- `apps/marketing/` — the only app: the Next.js + TinaCMS marketing site, the
  booking flow, magic-link sign-in, the welcome screen, and the Stripe webhook
- `packages/ui/` (`@pbh/ui`) — shared design-system primitives + `cn()`; consumed via `transpilePackages`
- `packages/tokens/` (`@pbh/tokens`) — Tailwind 4 theme + CSS variables (`theme.css`)
- `packages/config/` (`@pbh/config`) — shared ESLint flat config (`eslint/base`) + tsconfig presets

Path aliases `@/*` and `@tina/*` are scoped to the app; shared code lives in the
`@pbh/*` packages.

Current-state docs live directly in `docs/`: `booking-flow.md`, `auth.md`,
`database.md`, `stripe-integration.md`, `linus/api-integration.md`. Everything
under `docs/sow2/` is a point-in-time SOW2 artifact — proposals, specs and
deliverables as they were sent — and is not a description of the code.

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

**Figma is the source of truth.** `packages/tokens/theme.css` (`@pbh/tokens`) mirrors
the `Primitives`, `Colors` and `Fonts` collections of Figma file
`SppKdzsaH6rQ14u90UpNSq`, under Figma's own variable names, and wires them into
Tailwind 4 via `@theme inline`. Each app imports it from its `globals.css`
(`@import "@pbh/tokens/theme.css";`). App-specific `@font-face` declarations and
keyframes stay in the app's own `globals.css`.

The sync is manual — the Figma plan tier is `starter`, so the Variables REST API is
unavailable and the only programmatic access is the Plugin API via the Figma MCP
server, which needs the desktop app open. The steps are in `theme.css`'s header.

Token names are Figma's variable paths with `/` replaced by `-`, so a Figma variable
name is greppable in the code:

| Figma variable       | code token                   | utility                 |
| -------------------- | ---------------------------- | ----------------------- |
| `background/default` | `--color-background-default` | `bg-background-default` |
| `text/default`       | `--color-text-default`       | `text-text-default`     |
| `border/subtle`      | `--color-border-subtle`      | `border-border-subtle`  |
| `brand/on-brand`     | `--color-brand-on-brand`     | `text-brand-on-brand`   |

The stutter is unavoidable: Tailwind 4 has a single `--color-*` namespace, and `default`
is a leaf name in **five** Figma groups (`background`, `border`, `brand`, `teal`, `text`),
`subtle` in four, `brand` in three. `--color-default` can only hold one value, so
`bg-default` and `text-default` would paint the same colour.

Two groups are renamed, and only because Tailwind already ships those names:

| Figma              | code     | why                               |
| ------------------ | -------- | --------------------------------- |
| `colors/neutral/*` | `grey-*` | Tailwind owns `--color-neutral-*` |
| `teal/*`           | `aqua-*` | Tailwind owns `--color-teal-*`    |

Figma defines 15 neutral steps and 4 teal steps; any other step — `bg-neutral-800`,
`text-teal-500` — still compiles, silently, to a stock Tailwind colour with nothing to do
with the brand. **Map by value, never by index**: `grey-*` uses Figma's step numbers,
which do not match the pre-2026-08 code ramp.

- **Brand**: `#006e8a` (dark teal) · **Aqua**: `#009ea1` · **Body text**: `#45474d`
- **Fonts**: Larken (headlines, `font-headline`), Inter (body, `font-body`); type scale
  `text-caption` / `text-body-sm` / `text-body` / `text-body-lg` / `text-h5`…`text-display`
- `cn()` is `extendTailwindMerge`-configured with that scale — without it, tailwind-merge
  reads `text-caption` as a colour and silently drops it next to `text-text-label`

Use token classes rather than raw hex. Values Figma has no variable for, and the open
questions for the designer, are listed in [`docs/design-tokens-gaps.md`](docs/design-tokens-gaps.md).

### Path Aliases

Scoped to each app (e.g. within `apps/marketing/`):

- `@/*` → `src/*`
- `@tina/*` → `tina/*`

Cross-app shared code is imported from the `@pbh/*` workspace packages, not via aliases.

### API

`src/app/api/intake/route.ts` handles consultation form POST submissions. HubSpot integration is planned but not yet implemented.

### Booking flow

Signup → email confirmation → details → consent → Stripe checkout → a welcome
screen that links out to the Linus Engagement App, all in `apps/marketing` (which
also owns the only Stripe webhook). See
[`docs/booking-flow.md`](docs/booking-flow.md) for the sequence, the resume state
machine, what each step writes, and the three different tokens involved. Read it
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
