# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server with Tina CMS (Next.js + TinaCMS)
npm run build        # Production build (tinacms build && next build)
npm run lint         # ESLint
```

Tina admin is at `/admin/index.html` during development.

## Architecture

**Stack**: Next.js 16 (App Router, async Server Components), React 19, TypeScript, Tailwind CSS 4, TinaCMS 3.

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

Theme is called "The Cognitive Sanctuary", defined as CSS custom properties in `src/app/globals.css` and wired into Tailwind 4 via `@theme inline`.

- **Primary**: `#041632` (dark navy)
- **Secondary**: `#446558` (forest green)
- **Surface**: `#fbf9f4` (warm off-white) with 7 surface-level variants
- **Error**: `#ba1a1a`
- **Fonts**: Manrope (headlines, `font-headline`), Inter (body, `font-body`)

Use design token classes (`text-primary`, `bg-surface`, `text-on-surface-variant`, etc.) rather than raw hex values.

### Path Aliases

- `@/*` → `src/*`
- `@tina/*` → `tina/*`

### API

`src/app/api/intake/route.ts` handles consultation form POST submissions. HubSpot integration is planned but not yet implemented.

## Key Conventions

- Tina field paths use `tinaField()` from `tinacms/dist/react` to enable click-to-edit in the CMS admin
- `BlockRenderer` auto-generates section IDs by slugifying block headlines for scroll-anchored navigation
- The Header uses `IntersectionObserver` to highlight nav items as sections scroll into view
- `cn()` from `src/lib/utils.ts` combines `clsx` + `tailwind-merge` for class composition
