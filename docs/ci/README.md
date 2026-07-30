# Branch protection — applying the ruleset

`branch-ruleset.json` is the merge gate for `main` and `staging`. It is checked
in so the configuration is reviewable and restorable; GitHub does not read it
from the repository, so **someone with admin must apply it**.

This exists because the previous configuration lived in `.github/settings.yml`,
which depended on a third-party GitHub App that was never installed on this
repo. The config looked present and did nothing for months, then was deleted as
dead weight (`ce863b0`, `99d29b3`). Applying the ruleset directly to GitHub —
rather than through another app — is what stops that from recurring.

## Who can apply it

Only repository admins. As of 2026-07-30 that is **`dbates-commits`**;
`Tuily`, `mstenquist`, `mmcguire91` and `IronCityIT` have `write`.

## Steps

1. **Create the ruleset.**

   ```bash
   gh api --method POST repos/dbates-commits/primary-brain-health/rulesets \
     --input docs/ci/branch-ruleset.json
   ```

2. **Add the bypass list — in the web UI, not the API.**

   Settings → Rules → Rulesets → `protected-branches` → **Bypass list** →
   *Add bypass* → add **`Tuily`** and **`mstenquist`**, mode **Always**.

   The UI is specified deliberately. The REST API's `bypass_actors.actor_type`
   accepts roles, teams, apps and deploy keys, and naming *individual users*
   through it is not reliably supported; the UI is the path that unambiguously
   works. Do not substitute `RepositoryRole` with the `write` role to make the
   API call succeed — that would grant bypass to all five collaborators, which
   is not the decision that was made.

3. **Enable secret scanning and push protection.**

   Settings → Code security → *Secret scanning* and *Push protection*: enable
   both. Free on this repo because it is public. The `secrets` job in `ci.yml`
   (gitleaks) covers pull requests, but push protection is what stops a secret
   reaching the remote in the first place.

4. **Verify, and save the evidence.**

   ```bash
   gh api repos/dbates-commits/primary-brain-health/rulesets --jq '.[] | {name,enforcement}'
   gh api repos/dbates-commits/primary-brain-health/rulesets/RULESET_ID \
     --jq '{bypass:[.bypass_actors[].actor_id], rules:[.rules[].type]}'
   ```

   Screenshot the ruleset page and the bypass list into `pbh-docs`. `pbh-9yb.1`
   asks for that screenshot as the control evidence.

## The bypass is a recorded deviation, not an oversight

"Pull request approval required" is a row on the security checklist. With two
active developers who cannot wait on each other, the rule is kept and the two of
them are exempted, rather than the rule being dropped for everyone.

What that buys: the requirement still binds the other three write-holders and
anyone added later, `CODEOWNERS` still puts an owner on the review request, and
the status checks (`quality`, `secrets`, `smoke`) still block a red merge for
*everyone* — bypass actors included, because bypass covers the review
requirement, not the checks.

What it costs: for the two named developers, no second pair of eyes is enforced.

This needs a written risk acceptance on the control evidence map (`pbh-9yb.7`),
naming the bypassed accounts, the compensating controls above, and a review at
each administrative-access review. Revisit when the team grows past two active
developers — at which point the bypass should be removed, not extended.
