# Primary Brain Health

Marketing site and DTC consultation funnel for Primary Brain Health — a
**pnpm + Turborepo monorepo** built on Next.js + TinaCMS.

## Stack

- **pnpm workspaces** + **Turborepo** — package management and cached task running
- **Next.js 16** (App Router, async Server Components), **React 19**, **TypeScript**
- **Tailwind CSS 4** with the "Cognitive Sanctuary" design system (tokens in `@pbh/tokens`)
- **TinaCMS 3** as the content layer for the marketing app — content as MDX/JSON in `apps/marketing/content/`

## Workspace layout

```
apps/
  marketing/   Next.js + TinaCMS marketing site (the V1 site)  → :3000
  app/         Signed-in app (session, assessments, webhook)    → :3001
packages/
  ui/          @pbh/ui     — shared design-system primitives (Button, Heading, …) + cn()
  tokens/      @pbh/tokens — Tailwind 4 theme + CSS variables (theme.css)
  types/       @pbh/types  — shared TS types (e.g. signed-token handoff payload)
  config/      @pbh/config — shared ESLint flat config + tsconfig presets
```

`@pbh/*` are real workspace packages (not path aliases); apps consume them via
`transpilePackages` in `next.config.ts`. See
[`docs/sow2/technical/monorepo-plan.md`](docs/sow2/technical/monorepo-plan.md).

## Getting Started

```bash
pnpm install
pnpm dev            # everything in parallel: marketing :3000, app :3001, email preview :3002
```

Open marketing at [http://localhost:3000](http://localhost:3000) (Tina admin at
`/admin/index.html`), the app at [http://localhost:3001](http://localhost:3001),
and the email preview at [http://localhost:3002](http://localhost:3002).

```bash
pnpm build                       # build everything (cached, only rebuilds what changed)
pnpm --filter marketing build    # build just one app
pnpm --filter app dev            # run just one app
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
