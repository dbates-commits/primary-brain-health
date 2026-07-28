import { assertDatabaseEnvironment } from "@pbh/db";

/**
 * Runs once per server start, before any request is handled — the earliest
 * place we can refuse to serve a deployment that is pointed at the wrong
 * database (pbh-9yb.3).
 *
 * Node runtime only: the check reads env vars that exist in both runtimes, but
 * `register()` fires once per runtime and a duplicated crash message helps
 * nobody.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }
  assertDatabaseEnvironment();
}
