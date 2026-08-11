/**
 * Environment-separation guard.
 *
 * Until pbh-9yb.3, every Vercel Preview deploy read and wrote the **production**
 * Neon branch: the Preview scope carried the production `DATABASE_URL`, which is
 * also why `apps/marketing/vercel.json` gates migrations to production (see commit
 * 84a8da0). So every PR preview touched live patient rows, and — because Preview
 * points at the Linus *sandbox* — wrote sandbox participant ids and enrollment
 * records onto production users.
 *
 * The fix is a Preview-scoped database of its own. This module is what stops it
 * silently regressing: an env var can be repointed by anyone with Vercel access,
 * and nothing in the app would have noticed.
 *
 * `DATABASE_ENV` is the declaration — set next to `DATABASE_URL` in each Vercel
 * scope, and in `.env.local` for local work. It is not a secret; it names which
 * database the connection string leads to. Deriving this from the host instead
 * would mean committing our production hostname and re-deriving it every time
 * the branch moves.
 *
 * Deliberately throws rather than warns: a preview writing production rows is
 * not a degraded mode to run in, and a compliance attestation about environment
 * separation has to be enforced by something other than intent.
 */

export const DATABASE_ENVS = ["production", "preview", "development"] as const;
export type DatabaseEnv = (typeof DATABASE_ENVS)[number];

function readDatabaseEnv(): DatabaseEnv | "invalid" | null {
  const raw = (process.env.DATABASE_ENV ?? "").trim().toLowerCase();
  if (!raw) {
    return null;
  }
  if ((DATABASE_ENVS as readonly string[]).includes(raw)) {
    return raw as DatabaseEnv;
  }
  return "invalid";
}

/**
 * Whether Linus is pointed at its sandbox, or null when we can't tell (the
 * production scope currently sets no Linus credentials at all, so "unset" must
 * mean "no opinion" rather than "not sandbox").
 */
function linusIsSandbox(): boolean | null {
  const base = process.env.LINUS_BASE_URL ?? process.env.LINUS_AUDIENCE ?? "";
  if (!base) {
    return null;
  }
  return base.includes("stgint");
}

function fail(message: string): never {
  throw new Error(
    `[env] Environment separation check failed.\n${message}\n` +
      "Set DATABASE_ENV (production | preview | development) alongside " +
      "DATABASE_URL in each Vercel scope and in .env.local. See " +
      "docs/sow2/technical/database-plan.md § Environments.",
  );
}

/**
 * Refuse to boot when the database we're connected to doesn't match the
 * environment we're running as. Called from each app's `instrumentation.ts`.
 *
 * A missing `DATABASE_ENV` warns instead of throwing: it means the declaration
 * hasn't been rolled out to that scope yet, and crashing every deploy over a
 * var nobody set would be its own outage.
 */
export function assertDatabaseEnvironment(): void {
  const dbEnv = readDatabaseEnv();
  // `VERCEL_ENV` is production | preview | development on Vercel, and unset
  // locally — where the only rule that can apply is the Linus pairing.
  const vercelEnv = process.env.VERCEL_ENV;

  if (dbEnv === null) {
    console.error(
      "[env] DATABASE_ENV is not set, so environment separation cannot be " +
        "verified. Set it (production | preview | development) next to " +
        `DATABASE_URL${vercelEnv ? ` in the Vercel ${vercelEnv} scope` : ""}.`,
    );
    return;
  }

  if (dbEnv === "invalid") {
    fail(`DATABASE_ENV is "${process.env.DATABASE_ENV}", which is not one of ${DATABASE_ENVS.join(" | ")}.`);
  }

  if (dbEnv === "production" && vercelEnv && vercelEnv !== "production") {
    fail(
      `This is a ${vercelEnv} deployment holding the PRODUCTION database. ` +
        "Point this scope's DATABASE_URL at the preview Neon branch.",
    );
  }

  if (vercelEnv === "production" && dbEnv !== "production") {
    fail(
      `The production deployment is connected to the ${dbEnv} database. ` +
        "Live traffic would read and write the wrong branch.",
    );
  }

  // Sandbox Linus writes sandbox participant ids and enrollment rows; landing
  // those on production users corrupts real records with test data.
  if (dbEnv === "production" && linusIsSandbox() === true) {
    fail(
      "The production database is paired with SANDBOX Linus credentials " +
        `(${process.env.LINUS_BASE_URL ?? process.env.LINUS_AUDIENCE}).`,
    );
  }
}
