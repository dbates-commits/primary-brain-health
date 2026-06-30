# Signed-Token Handoff Contract

**Status:** v1.0 — ready for PBH product team review
**Owners:** VisualBoston engineering (Mark Stenquist) + compliance specialist (Bill Laukaitis)
**Version:** 1.0
**Date:** June 26, 2026

> This document governs the cryptographic handoff between PBH's marketing funnel (post-Stripe-payment) and Linus Remote Assessments (assessment session entry). It defines the funnel's issuance contract and the receiving platform's validation requirements. Changes require a version bump and written sign-off from VisualBoston and PBH before implementation.

---

## 1. Purpose

After a user pays $149 via the funnel, the funnel must hand them off to the Linus Remote Assessments to begin the cognitive assessment. The handoff must:

- Prove to the Linus Remote Assessments that this user has paid (without re-checking with Stripe)
- Carry identifiers the Linus Remote Assessments needs to start a session (Stripe Customer, PBH user ID, payment reference)
- Be tamper-proof, short-lived, and replay-resistant
- Contain no PHI or health data (those flow server-to-server post-handoff)
- Survive cross-domain redirects (`primarybrainhealth.com` → Linus Remote Assessments domain)

A signed token (JWT, RS256) achieves all of these.

---

## 2. Token format

**JWT (RFC 7519)** signed with **RS256** (RSA + SHA-256, 2048-bit minimum).

Why RS256 over HS256:
- Asymmetric — private key stays on the funnel side, public key shared with the Linus Remote Assessments vendor. Linus Remote Assessments vendor can verify without holding the signing secret. Lower coordination burden, lower blast radius on key compromise.
- Industry standard for cross-team / cross-vendor token exchange.

---

## 3. Token claims (payload)

```json
{
  "iss": "primarybrainhealth.com",
  "aud": "app.primarybrainhealth.com",
  "sub": "9d2f...e1b3",
  "iat": 1748765432,
  "exp": 1748766032,
  "jti": "a4c1f2d8-91ab-4cde-9876-543210fedcba",
  "cust_id": "cus_RxYz123abcDEF",
  "pay_ref": "pi_3RxYz12abcDEF45",
  "hsa_fsa": true,
  "contract_v": "1.0"
}
```

| Claim | Type | Purpose |
| :---- | :---- | :---- |
| `iss` | string | Issuer (funnel domain). Linus Remote Assessments validates this matches the expected issuer |
| `aud` | string | Audience (Linus Remote Assessments domain). Prevents tokens issued for one app being replayed at another |
| `sub` | UUID | PBH user ID (subject of the handoff) |
| `iat` | unix timestamp | Issued-at time |
| `exp` | unix timestamp | Expiration time (`iat + 600`, i.e. 10 minutes) |
| `jti` | UUIDv4 | Unique token ID — used for replay protection |
| `cust_id` | string | Stripe Customer ID — lets Linus Remote Assessments re-use the saved payment method for any downstream charges |
| `pay_ref` | string | Stripe PaymentIntent ID — proof of which payment this handoff corresponds to |
| `hsa_fsa` | boolean | Whether the payment was made with an HSA/FSA card (drives receipt formatting and downstream UX) |
| `contract_v` | string | Contract version — Linus Remote Assessments can route differently if future versions add claims |

**What's NOT in the token:**
- Name, email, DOB, address — Linus Remote Assessments fetches these from PBH's identity API using `sub`
- Any clinical or health data — none exists at this point in the flow anyway
- Payment amount, card details — Linus Remote Assessments fetches from Stripe using `pay_ref` if needed
- Plaintext secrets of any kind

---

## 4. TTL

`exp - iat = 600 seconds (10 minutes)`

**Rationale:**
- Long enough to handle: confirmation page render → user click → cross-domain redirect → Linus Remote Assessments session creation → potential retry on first load
- Short enough to limit the replay window for stolen/leaked tokens
- 10 min is the industry sweet spot for redirect-handoff tokens (Auth0, Okta, Stripe Connect OAuth all use 5-15 min)

If the user delays and the token expires:
- Funnel `/api/handoff/token` endpoint is idempotent on the user's session — they can request a fresh token as long as their authenticated funnel session is still valid
- After funnel session expires (default 30 days), user clicks the resume link in their receipt email, which re-validates them and issues a fresh handoff token

---

## 5. Issuance flow (funnel side)

```
GET /api/handoff/token
Authorization: <Auth.js v5 session cookie>
```

**Server logic:**
1. Verify authenticated session (Auth.js v5)
2. Look up `user_id` from session
3. Query `payments` table: confirm latest payment for this user is `succeeded` (not pending, not failed)
4. If no successful payment found → 403 "no paid session"
5. Build claims payload (see Section 3)
6. Sign with current signing key (`HANDOFF_KEY_VERSION` env var picks which)
7. Insert audit log row: `HANDOFF_TOKEN_ISSUED` (user_id, payment_ref, jti, exp)
8. Return:

```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InYxIn0...",
  "expires_at": "2026-08-01T14:23:32Z",
  "redirect_url": "https://app.primarybrainhealth.com/start?token=eyJh..."
}
```

The browser then performs `window.location = redirect_url`.

---

## 6. Validation flow (Linus Remote Assessments side)

On receiving a token (query param or POST body — vendor's choice), the Linus Remote Assessments MUST:

1. **Decode** the JWT header to get `kid` (key ID, e.g. `"v1"`)
2. **Look up** the public key matching `kid` from the Linus Remote Assessments's key store
3. **Verify** the RS256 signature using that public key
4. **Validate** standard JWT claims:
   - `iss` exactly equals `"primarybrainhealth.com"`
   - `aud` exactly equals the Linus Remote Assessments's expected audience
   - `exp` is in the future (UTC, with no clock-skew tolerance beyond 30 seconds)
   - `iat` is not in the future (sanity check)
5. **Check replay:** look up `jti` in the `processed_tokens` table
   - If found → reject (replay attempt)
   - If not found → continue
6. **Persist** `jti` to `processed_tokens` with `processed_at = now()` (TTL 24 hours)
7. **Start session** for `sub` (user_id), referencing `cust_id` and `pay_ref` as needed
8. **Audit log** on Linus Remote Assessments side: `HANDOFF_TOKEN_VALIDATED` (jti, validation result, latency)

If any step fails, return `401 Unauthorized` and log the failure with the specific reason. Do not start the session.

---

## 7. Replay protection

- Every token has a `jti` (UUIDv4)
- Linus Remote Assessments maintains a `processed_tokens(jti, processed_at)` table
- `jti` is persisted for 24 hours after first use (well beyond the 10-min TTL — catches replays of already-expired tokens too)
- Funnel never re-issues a token with the same `jti` (UUIDv4 collision probability is effectively zero)
- Funnel's `/api/handoff/token` is idempotent on `payment_intent.id` — same payment can produce multiple tokens (new `jti` each time) but always points to the same paid session

---

## 8. Key management + rotation

**Key storage:**
- **Signing key (private):** funnel side only. Stored as Vercel environment variable `HANDOFF_SIGNING_KEY` (2048-bit RSA PEM). Never logged, never exposed in API responses.
- **Verification key (public):** shared with the Linus Remote Assessments vendor via secure channel (signed PR into their repo, or 1Password vault share). Public — can be rotated openly.
- **Key version envelope:** `HANDOFF_KEY_VERSION` env var (e.g. `"v1"`, `"v2"`) included in JWT header as `kid`. Lets Linus Remote Assessments hold multiple keys during rotation overlap.

**Routine rotation:** every 6 months, or sooner on incident.

**Rotation procedure (non-emergency):**

1. **T+0** — Generate new RSA keypair (`v2`)
2. **T+0** — Distribute `v2` public key to Linus Remote Assessments vendor; they load it alongside `v1`
3. **T+24h** — Confirm Linus Remote Assessments reports both keys loaded
4. **T+24h** — Funnel switches `HANDOFF_KEY_VERSION` to `v2`. New tokens signed with v2, old in-flight tokens still verified against v1 (overlap)
5. **T+72h** — Confirm no v1-signed tokens have been seen for >24h (TTL has fully expired)
6. **T+72h** — Linus Remote Assessments drops v1 public key. Funnel can scrub `v1` private key from env vars.

**Emergency rotation:** if `v1` private key is compromised, skip the overlap. Linus Remote Assessments drops `v1` public key immediately. Any in-flight v1-signed tokens will fail validation; users see "session expired" UX and can request a fresh token via the resume-link email flow.

---

## 9. Error handling

| Failure mode | Linus Remote Assessments response | User-facing UX | Severity |
| :---- | :---- | :---- | :---- |
| Invalid signature | 401 | "Session error — contact support" | Alert (potential attack or key drift) |
| Expired (`exp < now`) | 401 | "Session expired — click here to resume" (re-fetches token) | Info (normal) |
| Replayed `jti` | 401 | "Session already used — if you're not in the assessment, contact support" | Alert (potential attack) |
| Wrong `aud` | 401 | "Session error — contact support" | Alert (potential misconfig) |
| Missing required claim | 401 | "Session error — contact support" | Alert (contract violation) |
| Unknown `kid` | 401 | "Session error — contact support" | Alert (rotation incomplete) |
| `contract_v` newer than supported | 401 with version-mismatch reason | "Please update your app" or error | Alert (vendor needs to update) |

---

## 10. Audit logging

**Funnel side** (`audit_log` table, see audit-log infrastructure spec):

- `HANDOFF_TOKEN_ISSUED` — actor=user_id, payload={ jti, payment_ref, exp, contract_v }
- `HANDOFF_TOKEN_REQUEST_FAILED` — when /api/handoff/token returns non-200, with reason

**Linus Remote Assessments side** (vendor's audit log):

- `HANDOFF_TOKEN_VALIDATED` — jti, validation result, latency, user_id (sub)
- `HANDOFF_TOKEN_REJECTED` — jti, reject reason (signature / expired / replayed / etc.)

PBH should be able to correlate funnel-side `ISSUED` with wellness-side `VALIDATED` via `jti` — any `ISSUED` without a matching `VALIDATED` within the TTL window is a candidate for investigation (browser failure, user closed tab, etc.).

---

## 11. PHI / data minimization

**In scope of this contract:** identifiers (user_id, customer_id, payment_id) + payment-context flag (`hsa_fsa`).

**Explicitly NOT in scope:** name, email, DOB, address, payment amount, payment method last-4, any clinical/health data, any consent text.

**Why:** the token may transit through the browser URL bar, be captured in browser history, or appear in webhook capture tools. Keep it identifier-only. Any data the Linus Remote Assessments needs beyond identifiers, it fetches server-to-server via PBH's identity API (authenticated separately, not via this token).

---

## 12. Security threats addressed (and not)

**Addressed by this contract:**

- ✅ **Tampering** — RS256 signature; any modification breaks verification
- ✅ **Forgery** — only the funnel holds the private key
- ✅ **Replay** — `jti` + `processed_tokens` table
- ✅ **Eavesdropping in transit** — TLS 1.2+ enforced on both domains (cookie-domain config plus HSTS)
- ✅ **Stolen old signing key** — version envelope + rotation procedure
- ✅ **Misdirection between apps** — `aud` claim ties token to specific Linus Remote Assessments domain

**NOT addressed (out of contract scope, handled elsewhere or accepted):**

- ❌ User-side malware capturing the redirect URL → orthogonal to handoff design; mitigated by short TTL
- ❌ Vulnerabilities in the Linus Remote Assessments itself → Linus Remote Assessments vendor's responsibility
- ❌ Stripe-side compromises → Stripe's responsibility (PCI DSS / SAQ-A)
- ❌ Social engineering of PBH staff to leak the private key → operational security, not contract scope
- ❌ Quantum attacks on RS256 → not a near-term threat; revisit at next major contract version

---

## 13. Contract change process

Any change to this document — new claims, TTL adjustment, algorithm change, etc. — requires:

1. Version bump (`contract_v` increments)
2. Updated public key if signing keys change
3. Written sign-off from both teams (VisualBoston + PBH product team)
4. Coordinated rollout (overlap window like a key rotation)
5. Audit-log row noting the change

Backward compatibility for at least one minor version is expected (i.e. v1.1 should still parse v1.0 tokens during transition).

---

## 14. Open decisions

- **Linus Remote Assessments domain** — the receiving platform is Linus Remote Assessments (DAC → LHQ → Epsom sequence confirmed Jun 25). Exact domain/endpoint to be confirmed by PBH product team before implementation
- **Token transport** — **locked: query parameter** `?token=...` with `Referrer-Policy: no-referrer` on the redirect. POST body rejected — adds round-trip complexity with no meaningful security gain over short-TTL query param + no-referrer policy
- **Platform session model** — Linus Remote Assessments session creation requirements to be confirmed; this spec defines minimum required claims; additional claims can be added via minor version bump
- **Key rotation cadence** — proposing 6 months; to be agreed with PBH product team at implementation kickoff
- **Multi-region** — if Linus Remote Assessments is multi-region, all regions need synchronized `processed_tokens` (or accept per-region replay window); confirm with Linus engineering

---

## 15. Change log

| Version | Date | Author | Notes |
| :---- | :---- | :---- | :---- |
| 1.0-draft | — | Mark Stenquist | Initial draft. |
| 1.0 | Jun 26, 2026 | Mark Stenquist | Finalized for PBH review. Removed Linus Remote Assessments vendor as co-signer; receiving-side requirements now stated as implementation requirements for Linus Remote Assessments. Token transport locked (query param). Open decisions updated to reflect Jun 25 call. |

---

## Appendix A: Sample issuance + validation sequence

```
Browser            Funnel (PBH)         Linus Remote Assessments (vendor)        Audit
   │                  │                       │                       │
   │  Click "Start"   │                       │                       │
   ├─────────────────►│                       │                       │
   │                  │ Verify session        │                       │
   │                  │ Verify payment OK     │                       │
   │                  │ Build claims          │                       │
   │                  │ Sign w/ private key   │                       │
   │                  │ Insert audit row      │                       │
   │                  │                       │                       │
   │  { token, exp }  │                       │       HANDOFF_        │
   │◄─────────────────┤                       │       TOKEN_          │
   │                  │                       │       ISSUED          │
   │                  │                       │           ───────────►│
   │  Redirect with   │                       │                       │
   │  ?token=...      │                       │                       │
   ├──────────────────┼──────────────────────►│                       │
   │                  │                       │ Verify signature      │
   │                  │                       │ Verify iss/aud/exp    │
   │                  │                       │ Check jti not replayed│
   │                  │                       │ Persist jti           │
   │                  │                       │ Start session         │
   │                  │                       │ Insert audit row      │
   │                  │                       │                       │
   │  Session ready   │                       │       HANDOFF_        │
   │◄──────────────────────────────────────────┤       TOKEN_          │
   │                  │                       │       VALIDATED       │
   │                  │                       │           ───────────►│
```

---

## Appendix B: Sample failure (replayed token)

```
Browser            Funnel               Linus Remote Assessments                  Audit
   │                  │                       │                       │
   │  (attacker has captured a valid token from an earlier session)   │
   │                                          │                       │
   │  Replay ?token=...                       │                       │
   ├──────────────────────────────────────────►│                       │
   │                                          │ Verify signature  ✅  │
   │                                          │ Verify exp        ✅  │
   │                                          │ Check jti         ❌  │
   │                                          │  (already in          │
   │                                          │   processed_tokens)   │
   │                                          │                       │
   │  401 "session already used"              │       HANDOFF_        │
   │◄──────────────────────────────────────────┤       TOKEN_          │
   │                                          │       REJECTED        │
   │                                          │       reason=replay   │
   │                                          │           ───────────►│
   │                                          │                       │
   │                                          │ Alert fires           │
   │                                          │ (replay attempt is    │
   │                                          │  high-signal)         │
```
