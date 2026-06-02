# Phase 1 - MVP DTC Funnel - Work Plan (beads)

**Tracked in:** beads (`bd`), prefix `pbh`, epic **`pbh-bws`**. Initialized in **stealth mode** - local only via `.git/info/exclude`, nothing committed to the shared repo, no collaborator impact.
**Window:** Jun 1 - Aug 14, 2026 (go-live). 35 beads across 7 tracks, fully dependency-wired.

```
bd ready              # what's actionable right now
bd show pbh-bws.1     # the first agentic dev task
bd dep tree pbh-bws   # full graph
bd list --label track:build-funnel
```

---

## The answer: your first agentic development task

### `pbh-bws.1` - Funnel technical architecture + data-model plan  (P0)

This is the one piece of **development** work that is unblocked today. Everything else ready now is human (discovery kickoff) or ops (account provisioning, specialist sourcing). It is a **planning task by design** - the agent's first job is to think, not to ship production code - which is the lowest-risk, highest-leverage way to start, and it unblocks the entire build.

**Why this first:**
- The RFP + signed SOW are detailed enough to draft the architecture now (the proposal explicitly says discovery *synthesizes* the RFP rather than re-interviewing). It runs in parallel with the Jun 1 discovery kickoff (`pbh-bws.6`), which only refines it - hence a *related*, not blocking, link.
- It produces the artifacts the next 4 build beads depend on: the scaffold, the schema, the payment boundary, and the handoff seam.

**What the agent should produce (acceptance):**
1. **App architecture** - Next.js 16 App Router structure (single-app vs monorepo decision), rendering/data-fetching strategy, Vercel deployment shape.
2. **Data model** - Drizzle schema draft for `account`, `consent` (versioned), `payment`, and `audit_log`. **No PHI on the web tier** - everything clinical sits behind the signed-token redirect.
3. **Signed-token handoff seam contract** - the token format, claims, redirect endpoint, and the boundary VisualBoston owns vs. the wellness-app vendor. (Highest-stakes interface in the engagement.)
4. **Stripe SAQ-A boundary** - exactly where cardholder data does/doesn't flow, to keep the funnel in SAQ-A scope. Feeds the compliance track.
5. **Integration points** - GA4 events, HubSpot lifecycle, Resend transactional email - named and stubbed, not built.

**Output:** an architecture decision doc + schema draft committed to the repo. That closes `pbh-bws.1` and makes the scaffold (`pbh-bws.2`) and schema (`pbh-bws.4`) ready.

---

## Ready right now (`bd ready`)

| Bead | P | Task | Owner |
|---|---|---|---|
| **`pbh-bws.1`** | P0 | **Funnel technical architecture + data-model plan** | **agentic dev** |
| `pbh-bws.6` | P0 | Discovery kickoff with David (founder) | human |
| `pbh-bws.11` | P0 | Source + onboard HIPAA/PCI specialist | ops |
| `pbh-bws.3` | P1 | Provision infra accounts (Neon BAA, Resend, Stripe) | ops |

Start `pbh-bws.1` (agent) and `pbh-bws.6` + `pbh-bws.11` + `pbh-bws.3` (you/ops) in parallel on day one.

---

## The 7 tracks

| Track | Beads | Gist |
|---|---|---|
| **Foundation** (code) | `pbh-bws.1`-`.5` | architecture plan -> scaffold -> Drizzle schema -> env/audit-log |
| **Discovery** | `.6`-`.10` | kickoff -> inventory / handoff-contract / payment-spec -> decision doc (invoice 1B gate) |
| **Compliance** | `.11`-`.14` | specialist sourcing -> SAQ-A artifacts -> Neon BAA -> pre-launch sign-off |
| **Design** | `.15`-`.19` | component-lib -> landing / consent-payment / handoff -> sign-off (invoice 2 gate) |
| **Build: Funnel** | `.20`-`.24` | landing, account+consent, Stripe+HSA/FSA, confirmation, signed-token handoff |
| **Build: Integrations** | `.25`-`.28` | GA4, HubSpot, Resend email, webhook hardening + audit-log |
| **QA / Launch** | `.29`-`.34` | E2E+payment, chaos/load, WCAG, UAT -> go-live (Aug 14) -> hypercare |

---

## Critical path to go-live

```
pbh-bws.1 (architecture plan)        <- first agentic dev
  -> pbh-bws.2 (scaffold) + pbh-bws.4 (schema)
    -> pbh-bws.21 (account+consent) + pbh-bws.22 (Stripe payment)
      -> pbh-bws.24 (signed-token handoff)  +  pbh-bws.28 (webhook+audit)
        -> pbh-bws.29 (E2E + live payment)
          -> pbh-bws.32 (UAT)
            -> pbh-bws.33 (go-live, Aug 14)   [also gated by pbh-bws.14 compliance sign-off]
              -> pbh-bws.34 (hypercare)
```

Two human/ops gates feed this and must not slip:
- **`pbh-bws.10`** discovery decision doc (invoice 1B) and **`pbh-bws.19`** design sign-off (invoice 2) unblock the build.
- **`pbh-bws.14`** pre-launch compliance sign-off co-gates go-live alongside QA.

---

## Notes

- **Agentic vs. not:** beads labeled `agentic` are agent-runnable dev work; `ops`/`seam` flag account provisioning and the high-stakes handoff/payment interfaces that want human eyes.
- **`seam` label** marks the three highest-risk surfaces: signed-token handoff (`.24`), Stripe payment (`.22`), webhook+audit (`.28`). These carry the elevated post-launch SLA.
- This plan is a snapshot; the beads db is the source of truth. Re-run `bd ready` after closing any bead to see what opens up next.
