# Turning on branch protection

Branch protection stops changes reaching `main` or `staging` without passing the
automated checks. This repository has none today, which is why a change can go
live even when the tests are failing and nobody has looked at it.

Someone with **admin** access has to switch it on. As of 2026-07-30 that is
**David (`dbates-commits`)**. Everyone else — `Tuily`, `mstenquist`,
`mmcguire91`, `IronCityIT` — has write access, which is not enough.

**This takes about five minutes and needs no technical knowledge.** It is all
tick-boxes on GitHub's settings pages. Nothing below can break the site: these
settings only control what is allowed to merge from here on, and any of it can
be undone the same way it is switched on.

---

## Part 1 — Create the rule (about 3 minutes)

1. Go to the repository on GitHub and click **Settings** (top right of the repo,
   next to Insights).
2. In the left sidebar, click **Rules**, then **Rulesets**.
3. Click **New ruleset** → **New branch ruleset**.
4. **Ruleset name**: type `protected-branches`
5. **Enforcement status**: change it from *Disabled* to **Active**. (If you would
   rather watch it for a day before it starts blocking anything, choose
   *Evaluate* instead — it reports what it would have done without stopping
   anyone. Remember to come back and set it to Active.)
6. **Bypass list** → click **Add bypass** → search for and tick **`Tuily`** and
   **`mstenquist`** → **Add selected**. Leave each set to **Always**.

   *Why:* these are the two people writing code day to day. The rule below asks
   for a second person to approve every change, and with a team of two that
   means each of them waiting on the other before anything can ship. Putting
   them on the bypass list lets them merge their own work, while the rule still
   applies to everybody else — including anyone who joins later.

7. **Target branches** → **Add target** → **Include by pattern** → type `main` →
   **Add Inclusion pattern**. Repeat for `staging`.
8. Under **Branch rules**, tick these four:

   | Tick this | What it does |
   |---|---|
   | **Restrict deletions** | Nobody can delete `main` or `staging` |
   | **Block force pushes** | Nobody can overwrite history on those branches |
   | **Require a pull request before merging** | Changes arrive as a reviewable proposal, not a direct edit |
   | **Require status checks to pass** | The automated tests must be green before anything merges |

9. Under **Require a pull request before merging**, set:
   - **Required approvals**: `1`
   - Tick **Dismiss stale pull request approvals when new commits are pushed**
     (an approval stops counting if the code changes afterwards)
   - Tick **Require review from Code Owners**

10. Under **Require status checks to pass**, click **Add checks** and add these
    three by name — type each one and select it:
    - `quality`
    - `secrets`
    - `smoke`

    If a name does not appear in the list, it is because that check has not run
    yet on this repository. Come back after the first pull request has run and
    add the missing one.

11. Click **Create** at the bottom.

---

## Part 2 — Turn on secret scanning (about 2 minutes)

This watches for passwords and API keys accidentally committed into the code,
and blocks them before they are uploaded. It is free for this repository.

1. **Settings** → in the left sidebar, **Code security** (it may read *Code
   security and analysis*).
2. Find **Secret scanning** → click **Enable**.
3. Find **Push protection** → click **Enable**.

---

## Part 3 — Save the evidence (1 minute)

The compliance checklist asks for proof that this was done.

1. Take a screenshot of the finished ruleset page, and one of the bypass list.
2. Put both in the `pbh-docs` repository alongside the other compliance
   evidence.

---

## What to expect afterwards

- Tuily and Mark carry on merging their own pull requests as they do now.
- Anyone else's pull request needs one approval before it can merge.
- **Everybody**, including Tuily and Mark, now needs the automated checks to
  pass. The bypass covers the approval requirement only — it does not let anyone
  merge failing code.
- If something urgently needs to go out and a check is stuck, an admin can edit
  the ruleset and set **Enforcement status** to *Disabled* temporarily. Please
  set it back.

---

## A note for the record

"Pull request approval required" is a row on the security checklist, and the
bypass above means it is not enforced for the two active developers. That is a
deliberate decision, not an oversight — but it has to be written down as an
accepted risk on the control evidence map (`pbh-9yb.7`), naming the two accounts
and the reasoning, and revisited whenever the team changes.

The compensating controls are: the requirement still binds everyone else, code
owners are still requested for review on every change, and the automated checks
block a failing merge for everyone without exception.

When the team grows past two active developers, the bypass should be removed
rather than extended.

---

## For developers: the equivalent as an API call

`branch-ruleset.json` in this folder is the same configuration in machine
form — checked in so it is reviewable and restorable, though GitHub does not
read it from the repository.

```bash
gh api --method POST repos/dbates-commits/primary-brain-health/rulesets \
  --input docs/ci/branch-ruleset.json
```

The bypass list still has to be added through the web UI afterwards: the REST
API's `bypass_actors.actor_type` covers roles, teams, apps and deploy keys, and
does not reliably name individual users. Do not substitute the `write`
repository role to make the call succeed — that grants bypass to all five
collaborators, which is not the decision that was made.

Verify and capture evidence:

```bash
gh api repos/dbates-commits/primary-brain-health/rulesets --jq '.[] | {name,enforcement}'
```

### Why this is not in `.github/settings.yml`

It used to be. That file depended on a third-party GitHub App that was never
installed on the repo, so the configuration looked present and did nothing for
months, then was deleted as dead weight (`ce863b0`, `99d29b3`, Jul 24 2026).
Applying the rules to GitHub directly — rather than through another app that has
to be installed and kept working — is what stops that happening again.
