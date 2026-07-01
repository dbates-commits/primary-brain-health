/**
 * Signed-token handoff contract types.
 *
 * Source of truth: docs/sow2/technical/handoff-token-contract.md (v1.0-draft).
 * The funnel signs a short-lived RS256 JWT after a successful $149 payment and
 * redirects the user to Linus Remote Assessments, which verifies and starts a session.
 *
 * The token carries identifiers only — NO PHI, no payment amounts, no card data.
 */

/** Current handoff contract version (the `contract_v` claim). */
export const HANDOFF_CONTRACT_VERSION = "1.0" as const;

/** Token time-to-live in seconds (`exp - iat`). 10 minutes. */
export const HANDOFF_TOKEN_TTL_SECONDS = 600 as const;

/**
 * JWT payload (claims) for the funnel → Linus Remote Assessments handoff.
 * See handoff-token-contract.md §3.
 */
export interface HandoffTokenPayload {
  /** Issuer — the funnel domain (e.g. "primarybrainhealth.com"). */
  iss: string;
  /** Audience — the Linus Remote Assessments domain (e.g. "app.primarybrainhealth.com"). */
  aud: string;
  /** Subject — the PBH user ID (UUID). */
  sub: string;
  /** Issued-at, unix seconds. */
  iat: number;
  /** Expiry, unix seconds (`iat + HANDOFF_TOKEN_TTL_SECONDS`). */
  exp: number;
  /** Unique token ID (UUIDv4) — used for replay protection. */
  jti: string;
  /** Stripe Customer ID (e.g. "cus_..."). */
  cust_id: string;
  /** Stripe PaymentIntent ID (e.g. "pi_...") — proof of payment. */
  pay_ref: string;
  /** Whether the payment used an HSA/FSA card. */
  hsa_fsa: boolean;
  /** Contract version this token conforms to. */
  contract_v: typeof HANDOFF_CONTRACT_VERSION | string;
}

/**
 * Response body from the funnel's `GET /api/handoff/token` endpoint.
 * See handoff-token-contract.md §5.
 */
export interface HandoffTokenResponse {
  /** The signed RS256 JWT. */
  token: string;
  /** ISO-8601 expiry timestamp. */
  expires_at: string;
  /** Fully-formed redirect URL the browser navigates to. */
  redirect_url: string;
}
