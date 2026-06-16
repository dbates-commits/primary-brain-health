# Syncing beads issues with Linear (without duplicating them)

This repo tracks issues with [**beads**](https://github.com/steveyegge/beads) (`bd`) and
mirrors them to **Linear** with `bd linear sync`. This guide is the source of truth for how
to pull and push issues **without creating duplicates**.

> **If issues already got duplicated in Linear**, jump to
> [Recovery: cleaning up duplicates](#recovery-cleaning-up-duplicates).

---

## TL;DR — the golden rules

1. **`bd backup fetch-git` BEFORE every sync.** This is the single rule that prevents
   duplicates. It pulls the latest issue↔Linear mappings onto your machine.
2. **`bd linear sync --dry-run` (or `--push --dry-run`) before any real push.** Read what it
   *will* do before it does it.
3. **`bd backup export-git` AFTER a successful sync.** This publishes the new mappings so the
   next person doesn't re-create what you just created.
4. **Never pass `--update-refs=false`** and **never hand-edit `external_ref`.** Both break the
   link that stops duplication.
5. **Don't two people push new issues at the same time.** Coordinate, or designate one syncer.

If you only remember one thing: **`fetch-git` → sync → `export-git`.**

---

## Why issues get duplicated

beads links each local issue to its Linear counterpart through a field called
**`external_ref`** — it stores the Linear issue's ID on the bead. Every time you sync, beads
uses `external_ref` to decide: *does this issue already exist in Linear (update it) or not
(create it)?*

The catch: **`external_ref` lives only in the local Dolt database** (`.beads/dolt/`), which is
**gitignored**. It is **not** in `main`. The only way it travels between machines is the
`beads-backup` branch, via `bd backup fetch-git` / `bd backup export-git`.

So when someone runs `bd linear sync` from a **fresh or stale clone that skipped
`bd backup fetch-git`**, their local DB has no `external_ref` links. beads concludes that
*none* of the issues exist in Linear yet — and **creates a brand-new copy of every issue.**
That is exactly how the recent duplication happened.

```
Linear ID stored on bead (external_ref)  ──►  beads matches & UPDATES the existing Linear issue
external_ref missing (un-restored clone) ──►  beads thinks it's new & CREATES a duplicate
```

The mapping is one-directional: beads knows the Linear ID, but Linear does **not** store the
beads ID back. That's why a missing local mapping can't be recovered from Linear's side — you
must restore it from `beads-backup`.

---

## One-time setup

1. **Credentials.** Set these as environment variables (they're already listed in
   `.env.example`). Prefer env vars over `bd config set` — `bd config list` prints the API key
   in plaintext.

   ```bash
   export LINEAR_API_KEY=lin_api_...      # from .env / your password manager
   export LINEAR_TEAM_ID=4d2378da-...     # the PBH Linear team UUID
   ```

2. **Restore the shared issue DB** (carries the `external_ref` mappings):

   ```bash
   git fetch origin
   bd bootstrap            # creates the local pbh DB if missing
   bd backup fetch-git     # restore issues + mappings from beads-backup
   ```

3. **Verify the connection and the mapping state:**

   ```bash
   bd linear teams         # confirms the API key works; lists teams
   bd linear status        # should show "Local Only: 0" in a healthy repo
   ```

   A healthy `bd linear status` looks like this — note **Local Only: 0**, meaning every issue
   is already linked to Linear:

   ```
   Total Issues: 41
   With Linear:  41
   Local Only:   0
   ```

   If `Local Only` is **not** 0 and you didn't just create those issues, **stop** — you
   probably have a stale DB. Run `bd backup fetch-git` again before doing anything.

---

## Fresh clone / fresh install

On a brand-new clone, beads has no local issues yet — the `.beads/dolt/` database is
gitignored runtime state and does **not** travel with `main`. All 41 issues live in the
`beads-backup` branch and must be restored. Run these once, from the repo root:

```bash
# 0. Prereqs: `bd` installed, and .env has LINEAR_API_KEY + LINEAR_TEAM_ID filled in.
set -a; . ./.env; set +a    # load Linear creds into the shell (env vars only — never `bd config set`)

# 1. Create the local pbh database
bd bootstrap

# 2. Restore issues + the external_ref → Linear mappings from beads-backup
git fetch origin
bd backup fetch-git

# 3. Verify
bd list                     # should list the issues (41 in a healthy repo)
bd linear teams             # confirms the API key works
bd linear status            # MUST show "Local Only: 0"
```

A successful `bd backup fetch-git` reports what it restored, e.g.:

```
Fetched backup snapshot from git branch beads-backup and restored local database
  Issues: 41
  Dependencies: 111
  Labels: 112
```

### Gotcha: `database "pbh" not found` on a fresh clone

If every `bd` command fails with:

```
Error: failed to open database: database "pbh" not found on Dolt server at 127.0.0.1:5XXXX
```

…and `bd bootstrap` reports **"Database already exists … Nothing to do"** (so it never restores
from `beads-backup`), the clone shipped a **stale, empty `.beads/dolt/` Dolt repo**. Bootstrap
sees that directory and bails, but the empty repo isn't a usable `pbh` database, so every
command — including `bd backup fetch-git` — errors out.

Confirm the local Dolt repo is empty (no real data) before clearing it:

```bash
git check-ignore .beads/dolt                 # should print ".beads/dolt" (it's gitignored)
cat .beads/dolt/.dolt/repo_state.json        # empty repo: no "branches" / "remotes" entries
```

The real issues are safe in `origin/beads-backup`, so removing the empty local Dolt repo is
non-destructive. Then re-run the fresh-install steps:

```bash
bd dolt stop
rm -rf .beads/dolt .beads/dolt-server.*      # gitignored, empty — real data is in beads-backup
bd bootstrap                                 # now creates pbh fresh
git fetch origin
bd backup fetch-git                          # restores the 41 issues + mappings
bd linear status                             # verify "Local Only: 0"
```

> ⚠️ Only do this when `repo_state.json` shows an **empty** repo (no branches/remotes). If the
> local Dolt repo contains issues you haven't published with `bd backup export-git`, removing it
> loses them.

### Other fresh-install snags

- **`LINEAR_API_KEY NOT set`** — you opened a new shell and forgot to load `.env`. Re-run
  `set -a; . ./.env; set +a`. The Linear keys are env-vars-only by design (see the warning in
  `.env.example`); they are never stored in the beads config.
- **`bd linear teams` errors / empty** — bad or missing `LINEAR_API_KEY`. Regenerate it at
  Linear → Settings → Security & access → Personal API keys.
- **`bd linear status` shows `Local Only` ≠ 0 right after a fresh restore** — your
  `bd backup fetch-git` didn't actually run against the restored DB. Re-run it and re-check
  before any `--push` (pushing with stale mappings is what creates duplicates).

---

## Daily workflow: pull new/updated issues FROM Linear

Use this when teammates created or changed issues in Linear and you want them locally.

```bash
bd backup fetch-git          # 1. get the latest shared DB + mappings
bd linear sync --pull        # 2. import Linear → beads
bd list                      # 3. confirm
# ... do your work ...
bd backup export-git         # 4. publish the updated snapshot
```

`--pull` only imports; it never writes to Linear, so it cannot create duplicates *in Linear*.
Restoring first (step 1) still matters so your push later in the day is safe.

---

## Pushing new local issues TO Linear

This is the duplication-prone direction. Follow every step.

```bash
bd backup fetch-git                      # 1. ALWAYS restore first — this prevents duplicates
bd linear status                         # 2. check "Local Only" = the new issues you expect
bd linear sync --push --dry-run          # 3. PREVIEW — read exactly what will be created/updated
# ----- review the dry-run output. Only continue if it matches your expectation -----
bd linear sync --push --create-only      # 4. push: create new issues, never touch existing
bd linear status                         # 5. verify "Local Only" is back to 0
bd backup export-git                     # 6. publish the new mappings so others don't re-create
```

Why `--create-only`? It tells beads to only *add* new Linear issues and never modify existing
ones — a safe default when all you've done is create local issues. Drop it (use plain
`--push`) only when you intentionally want local edits to overwrite Linear.

`--update-refs` is **true by default** and must stay that way — it's what writes the new
Linear ID back into `external_ref` after creation. If you disable it, the next push won't see
the link and will duplicate the issue.

---

## Full two-way sync

Running `bd linear sync` with **no mode flag** does a bidirectional sync: **pull, then push**,
reconciling conflicts. Because it pulls first, it's safer than a bare `--push`, but you must
**still `bd backup fetch-git` first** — the pull reconciles against Linear, not against
teammates' un-pushed mappings.

```bash
bd backup fetch-git
bd linear sync --dry-run     # preview the two-way reconcile
bd linear sync               # pull then push
bd backup export-git
```

Conflict resolution (when the same issue changed on both sides): the **newer timestamp wins**
by default. Override with `--prefer-local` or `--prefer-linear`.

---

## Recovery: cleaning up duplicates

If a push already created duplicate issues in Linear, clean up like this. beads will **not**
auto-merge duplicates — the dedup itself is a manual step in the Linear UI.

1. **Restore the authoritative mappings** so your local DB knows which Linear issue is the
   "real" one for each bead:

   ```bash
   bd backup fetch-git
   bd linear status        # expect "Local Only: 0" once restored
   ```

2. **Identify the duplicates in Linear.** For each title you'll see two (or more) copies. The
   *real* one is the issue that a bead's `external_ref` points to; the *duplicate* is the one
   nothing points to. To find what a bead is linked to:

   ```bash
   bd show <id> --json | grep external_ref     # shows the Linear ID beads considers canonical
   ```

3. **Delete the duplicates in the Linear UI** — delete the copies that are **not** referenced
   by any bead's `external_ref`. Keep the referenced ones. (Do this in Linear; beads has no
   delete-from-Linear command.)

4. **Re-verify** that beads is no longer trying to create anything:

   ```bash
   bd linear sync --push --dry-run      # should report NO creates
   bd linear status                     # Local Only: 0
   ```

5. **Publish the clean state:**

   ```bash
   bd backup export-git
   ```

---

## Pitfalls & known limitations

**What causes duplicates (avoid these):**

- Syncing from a clone that **skipped `bd backup fetch-git`** — the #1 cause.
- Passing **`--update-refs=false`** — disables writing the Linear ID back; the next push
  re-creates the issue.
- **Hand-editing or clearing `external_ref`** on a bead.
- **Two people pushing new issues simultaneously** before either runs `export-git`.

**Upstream beads limitations (not bugs in this repo):**

- Parent/child issues push to Linear as **flat, independent issues**, not sub-issues
  ([beads #1528](https://github.com/steveyegge/beads/issues/1528)).
- A `--push` may **not propagate status changes** (e.g. local `close` → Linear "Done") in
  current versions ([beads #2046](https://github.com/steveyegge/beads/issues/2046)).
- Linear does not store the beads ID back, so the link is one-way
  ([beads #1192](https://github.com/steveyegge/beads/issues/1192)).

---

## Command reference

| Command | What it does |
|---|---|
| `bd linear status` | Show sync status (issue counts, last sync, **Local Only**). Read-only. |
| `bd linear teams` | List Linear teams (verifies the API key works). Read-only. |
| `bd linear sync --pull` | Import issues Linear → beads. |
| `bd linear sync --push` | Export issues beads → Linear. |
| `bd linear sync` | Bidirectional: pull then push, with conflict resolution. |

| `bd linear sync` flag | Effect |
|---|---|
| `--dry-run` | Preview without making changes. **Use before every real push.** |
| `--create-only` | Only create new Linear issues; never update existing ones. |
| `--update-refs` | Write Linear ID into `external_ref` after creating (**default true — leave it on**). |
| `--state open\|closed\|all` | Which issues to sync (default `all`). |
| `--type` / `--exclude-type` | Filter by issue type (push only). |
| `--include-ephemeral` | Include wisps/ephemeral issues when pushing (default: excluded). |
| `--prefer-local` / `--prefer-linear` | Override the default "newer wins" conflict resolution. |

Related backup commands (how mappings travel between machines):

| Command | What it does |
|---|---|
| `bd backup fetch-git` | Restore issues + `external_ref` mappings from the `beads-backup` branch. |
| `bd backup export-git` | Publish your issue snapshot (incl. new mappings) to `beads-backup`. |

See also the root [`README.md`](../README.md) "Issue Tracking" section for general beads usage
and the [`.env.example`](../.env.example) for the Linear credentials.
