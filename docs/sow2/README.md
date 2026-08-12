# SOW2 artifacts

Everything under this folder is a **point-in-time record**: what was proposed,
specified, or delivered to PBH during SOW2, with the dates and owners it carried
at the time. It is kept so the reasoning and the commitments stay recoverable —
not as a description of the system.

**It does not describe how the code works today.** For that:

| Question | Read |
|---|---|
| How a customer books, pays, and is handed off | [`../booking-flow.md`](../booking-flow.md) |
| Sign-in, sessions, automatic-logoff controls | [`../auth.md`](../auth.md) |
| Database choice, what it holds, environment separation | [`../database.md`](../database.md) |
| Stripe keys, endpoints, and wiring | [`../stripe-integration.md`](../stripe-integration.md) |
| The Linus Health API integration | [`../linus/api-integration.md`](../linus/api-integration.md) |
| wellness/clinical vocabulary | [`../track-copy-mapping.md`](../track-copy-mapping.md) · [`../GLOSSARY.md`](../GLOSSARY.md) |

Two things here have been overtaken by events and are worth flagging before you
read them as current:

- **The signed-token handoff** (`technical/handoff-token-contract.md`, and §2 of
  `technical/stripe-architecture.md`) was built and then removed in August 2026.
  Linus decided the **Linus Engagement App** is the entry point for both PBH
  experiences, so `apps/app` — the signed-in product the token existed to reach —
  was retired along with the token itself.
- **The two-app architecture** these documents assume (a marketing site plus a
  separate funnel app on `app.primarybrainhealth.com`) is now one app. The plan
  documents that only described that structure — the monorepo plan, the funnel
  flow diagrams, and the auth plan — were deleted rather than annotated; `git log`
  has them if the reasoning is ever needed.

Edits here should be limited to fixing links. These are records of what was sent;
correcting their content after the fact defeats the point of keeping them.
