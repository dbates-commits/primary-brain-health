import "server-only";

// RFC 5321 size caps: the whole address is ≤ 254 chars, the local-part ≤ 64,
// and the domain ≤ 255.
const MAX_EMAIL_LENGTH = 254;
const MAX_LOCAL_LENGTH = 64;
const MAX_DOMAIN_LENGTH = 255;

// Local-part: dot-separated runs of unreserved chars — rejects leading,
// trailing, and consecutive dots. Quoted local-parts (`"a b"@x.com`) are legal
// but never appear in a signup form, so we deliberately don't accept them.
const LOCAL_PART =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;

// Domain: dot-separated labels (letters/digits/hyphen, no leading or trailing
// hyphen, ≤ 63 chars each) ending in an alphabetic TLD of ≥ 2 chars — so
// `bar..com`, `y.`, and single-char TLDs like `b.c` all fail.
const DOMAIN =
  /^(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

/**
 * Canonical form for storage and comparison: trimmed and lowercased. The `users`
 * table stores email as `citext` (case-insensitive unique), so lowercasing keeps
 * what we persist consistent with how uniqueness is enforced, and avoids
 * near-duplicate accounts differing only in case.
 */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * Structural email validation — considerably stricter than the old
 * `[^@\s]+@[^@\s]+\.[^@\s]+`: it enforces the RFC 5321 length caps, requires a
 * real (≥ 2-char alphabetic) TLD, and rejects consecutive/leading/trailing dots
 * and malformed labels. Purely syntactic — it does not check that the domain can
 * actually receive mail. Pass a `normalizeEmail`-d value; surrounding whitespace
 * fails here anyway, since whitespace isn't allowed in the pattern.
 */
export function isValidEmail(email: string): boolean {
  if (email.length === 0 || email.length > MAX_EMAIL_LENGTH) {
    return false;
  }
  // Split on the last `@` so the local-part regex owns any earlier ones.
  const at = email.lastIndexOf("@");
  if (at <= 0 || at === email.length - 1) {
    return false;
  }
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (local.length > MAX_LOCAL_LENGTH || domain.length > MAX_DOMAIN_LENGTH) {
    return false;
  }
  if (!LOCAL_PART.test(local)) {
    return false;
  }
  if (!DOMAIN.test(domain)) {
    return false;
  }
  return true;
}
