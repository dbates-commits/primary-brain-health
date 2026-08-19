import { assertDatabaseEnvironment } from "@pbh/db";
import { assertIdentifierHashSecret } from "@pbh/booking/server";

/**
 * Runs once per server start, before any request is handled — the earliest
 * place we can refuse to serve a deployment that is pointed at the wrong
 * database (pbh-9yb.3), or one that would write identifiers it cannot claim to
 * have anonymised.
 *
 * Marketing needs this as much as the app does: it owns the booking writes, and
 * its `vercel.json` has never had a database gate of any kind.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }
  assertDatabaseEnvironment();
  assertIdentifierHashSecret();
}
