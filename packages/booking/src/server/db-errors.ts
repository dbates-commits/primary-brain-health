import "server-only";

import { NeonDbError } from "@neondatabase/serverless";

/**
 * Helpers for turning raw Neon driver errors into something we can branch on.
 * Drizzle wraps the underlying driver error, so the actual `NeonDbError` (with
 * the SQLSTATE `code` and `constraint` name) is usually nested on a `cause`
 * rather than the thrown error itself — `getNeonDbError` walks that chain.
 *
 * `NeonDbError` already types the PG fields (code, constraint, detail, table,
 * column, …); Neon doesn't ship an enum of SQLSTATE *codes*, so we keep the few
 * we care about here. https://www.postgresql.org/docs/current/errcodes-appendix.html
 */

export const PgErrorCode = {
  UniqueViolation: "23505",
  ForeignKeyViolation: "23503",
  NotNullViolation: "23502",
  CheckViolation: "23514",
} as const;

/**
 * Walk an unknown error (and its `cause` chain) and return the first
 * `NeonDbError`, or null if none is found.
 */
export function getNeonDbError(err: unknown): NeonDbError | null {
  const seen = new Set<unknown>();
  let current: unknown = err;

  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    if (current instanceof NeonDbError) {
      return current;
    }
    current = (current as { cause?: unknown }).cause;
  }

  return null;
}

/** Does this error match the given SQLSTATE (and optionally a named constraint)? */
export function isPgError(
  err: unknown,
  code: string,
  constraint?: string,
): boolean {
  const pg = getNeonDbError(err);
  if (!pg || pg.code !== code) {
    return false;
  }
  if (constraint && pg.constraint !== constraint) {
    return false;
  }
  return true;
}
