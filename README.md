# Primary Brain Health

Marketing site and DTC consultation funnel for Primary Brain Health, built on Next.js + TinaCMS.

## Stack

- **Next.js 16** (App Router, async Server Components), **React 19**, **TypeScript**
- **Tailwind CSS 4** with the "Cognitive Sanctuary" design system (tokens in `src/app/globals.css`)
- **TinaCMS 3** as the content layer — content lives as MDX/JSON in `content/`

## Getting Started

```bash
npm install
npm run dev      # Next.js + TinaCMS dev server
```

Open [http://localhost:3000](http://localhost:3000). The Tina admin is at
[http://localhost:3000/admin/index.html](http://localhost:3000/admin/index.html).

```bash
npm run build    # tinacms build && next build
npm run lint     # ESLint
```

## Project Layout

- `content/` — page/blog/project content (MDX + JSON), edited via TinaCMS
- `tina/` — Tina schema (`collections/`, `blocks/`) and generated GraphQL client
- `src/components/blocks/` — block components mapped by `BlockRenderer.tsx`
- `src/app/` — App Router routes; `api/intake/` handles consultation form POSTs

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

> Use `--port 4000` (not the default 3000) while `npm run dev` is running, or the
> two will collide on port 3000. If the board ever looks stale, `bdui restart --port 4000`.
