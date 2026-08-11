# Primary Brain Health

Marketing site and DTC booking flow for Primary Brain Health — a
**pnpm + Turborepo monorepo** built on Next.js + TinaCMS.

## Stack

- **pnpm workspaces** + **Turborepo** — package management and cached task running
- **Next.js 16** (App Router, async Server Components), **React 19**, **TypeScript**
- **Tailwind CSS 4** with the "Cognitive Sanctuary" design system (tokens in `@pbh/tokens`)
- **TinaCMS 3** as the content layer for the marketing app — content as MDX/JSON in `apps/marketing/content/`

## Workspace layout

```
apps/
  marketing/   Next.js + TinaCMS marketing site, booking flow, sign-in,
               Stripe webhook — the whole customer surface              → :3000
packages/
  ui/          @pbh/ui      — shared design-system primitives (Button, Heading, …) + cn()
  tokens/      @pbh/tokens  — Tailwind 4 theme + CSS variables (theme.css)
  booking/     @pbh/booking — the booking flow: forms + every server write path
  db/          @pbh/db      — Drizzle schema + Neon client
  emails/      @pbh/emails  — transactional email templates
  linus/       @pbh/linus   — Linus Health API client
  payments/    @pbh/payments— Stripe client + catalog
  copy/        @pbh/copy    — wellness/clinical track vocabulary
  config/      @pbh/config  — shared ESLint flat config + tsconfig presets
```

`@pbh/*` are real workspace packages (not path aliases); the app consumes them
via `transpilePackages` in `next.config.ts`. The two-app split that
[`docs/sow2/technical/monorepo-plan.md`](docs/sow2/technical/monorepo-plan.md)
describes is design history — `apps/app` was retired in August 2026, see
[`docs/booking-flow.md`](docs/booking-flow.md).

## Getting Started

```bash
pnpm install
pnpm dev            # everything in parallel: marketing :3000, email preview :3002
```

Open marketing at [http://localhost:3000](http://localhost:3000) (Tina admin at
`/admin/index.html`) and the email preview at
[http://localhost:3002](http://localhost:3002).

```bash
pnpm build                       # build everything (cached, only rebuilds what changed)
pnpm --filter marketing build    # build just one workspace
pnpm --filter marketing dev      # run just one workspace
pnpm email                       # email templates only, on :3002
pnpm lint                        # eslint across the workspace
pnpm typecheck                   # tsc --noEmit across the workspace
pnpm format                      # prettier --write
```

`pnpm email` starts the React Email preview on its own — useful when you're
iterating on a template and don't want the two Next apps running. It renders each
template from its `PreviewProps`, so no database or API keys are needed.

> **Tina builds** (`tinacms build`, run as part of `marketing` build) require
> TinaCloud credentials (`NEXT_PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`) or local
> mode. Without them, `next build` still succeeds — content fetches fall back to
> empty. Env/secrets wiring is tracked in pbh-bws.5.

See [`CLAUDE.md`](./CLAUDE.md) for architecture and conventions.

## Issue Tracking

This repo uses [**beads**](https://github.com/steveyegge/beads) (`bd`), a CLI issue
tracker that lives alongside the code in `.beads/`.

```bash
bd list                 # view issues
bd create "Title"       # new issue
bd show <id>            # issue detail
bd update <id> --status done
```

Issue data is stored in a local Dolt database (`.beads/dolt/`, not committed). On
`main`, git tracks only the beads scaffolding (`config.yaml`, `metadata.json`,
`README.md`, `.gitignore`) — never the issues themselves.

**Fresh clone / new machine** — restore the shared issue snapshot:

```bash
git fetch origin
bd bootstrap            # creates the local pbh DB if missing
bd backup fetch-git     # restores issues from the beads-backup branch
bd list
```

**Sharing changes** — publish your issue snapshot to the `beads-backup` branch
(pushed to `origin` only, kept off `main`):

```bash
bd backup export-git    # commit + push issue snapshot to beads-backup
```

**Linear sync** — issues mirror to Linear via `bd linear sync`. See
[`docs/beads-linear-sync.md`](docs/beads-linear-sync.md) for the pull/push workflow. Always
run `bd backup fetch-git` **before** syncing, or you will duplicate every issue in Linear.

> `.beads/.beads-credential-key` is a machine-local secret and is gitignored — never commit it.

### Visual issue board (beads-ui)

[beads-ui](https://github.com/mantoni/beads-ui) is a local web viewer for `bd`. It
shells out to your `bd` CLI and reads your own local `.beads` DB — there's no extra
server to run and no change to how issues sync (still `export-git` / `fetch-git`).

```bash
npm install -g beads-ui          # one-time
bdui start --port 4000 --open    # open the board at http://127.0.0.1:4000
bdui stop                        # shut it down
```

> Use `--port 4000` (not the default 3000) while `pnpm dev` is running, or the
> two will collide on port 3000. If the board ever looks stale, `bdui restart --port 4000`.
