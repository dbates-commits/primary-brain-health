#!/usr/bin/env node
// Reconcile locally-closed beads to Linear "Done".
//
// `bd linear sync --push` does NOT propagate a local close → Linear "Done" for
// issues that already existed in Linear (beads #2046), so we set the state via
// Linear's API. See ../beads-linear-sync.md ("Policy: a closed bead must be
// 'Done' in Linear").
//
// Usage:
//   set -a; . ./.env; set +a                 # LINEAR_API_KEY + LINEAR_TEAM_ID
//   # pass the Linear issue identifiers or numbers of the closed beads:
//   node docs/scripts/linear-mark-done.mjs PBH-83 PBH-90
//   # or pipe them in (one per line):
//   bd list --status closed --json \
//     | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>JSON.parse(s).forEach(i=>{const m=(i.external_ref||"").match(/([A-Z]+-\d+)/);if(m)console.log(m[1])}))' \
//     | xargs node docs/scripts/linear-mark-done.mjs
//
// It resolves the team's completed ("Done") state dynamically, skips issues that
// are already Done, and updates the rest. Read-only until it finds work to do.

const KEY = process.env.LINEAR_API_KEY;
const TEAM = process.env.LINEAR_TEAM_ID;
if (!KEY || !TEAM) {
  console.error("Set LINEAR_API_KEY and LINEAR_TEAM_ID (e.g. `set -a; . ./.env; set +a`).");
  process.exit(1);
}

// Accept "PBH-83" or "83"; dedupe to a set of issue numbers.
const numbers = [
  ...new Set(
    process.argv.slice(2).map((a) => {
      const m = String(a).match(/(\d+)\s*$/);
      return m ? Number(m[1]) : null;
    }).filter((n) => n !== null),
  ),
];
if (numbers.length === 0) {
  console.error("Pass one or more Linear issue identifiers/numbers (e.g. PBH-83).");
  process.exit(1);
}

async function gql(query, variables) {
  const r = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: KEY },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (j.errors) {
    throw new Error(JSON.stringify(j.errors));
  }
  return j.data;
}

// 1. Resolve the team's completed ("Done") workflow-state id.
const team = await gql(
  `query($t:String!){ team(id:$t){ name states{ nodes{ id name type } } } }`,
  { t: TEAM },
);
const done = team.team.states.nodes.find((s) => s.type === "completed");
if (!done) {
  throw new Error("No workflow state of type 'completed' found for the team.");
}
console.log(`Team "${team.team.name}" — Done state: ${done.name} (${done.id})`);

// 2. Fetch the target issues and update any that aren't already completed.
const data = await gql(
  `query($t:ID!,$nums:[Float!]){ issues(filter:{ team:{ id:{ eq:$t } }, number:{ in:$nums } }, first:250){ nodes{ id identifier state{ name type } } } }`,
  { t: TEAM, nums: numbers },
);
const toUpdate = data.issues.nodes.filter((i) => i.state.type !== "completed");
if (toUpdate.length === 0) {
  console.log("Nothing to do — every target issue is already Done.");
  process.exit(0);
}

for (const i of toUpdate) {
  process.stdout.write(`Updating ${i.identifier} [${i.state.type}/${i.state.name}] -> Done ... `);
  const res = await gql(
    `mutation($id:String!,$s:String!){ issueUpdate(id:$id, input:{ stateId:$s }){ success issue{ state{ type } } } }`,
    { id: i.id, s: done.id },
  );
  console.log(res.issueUpdate.success ? "ok" : "FAILED");
}
