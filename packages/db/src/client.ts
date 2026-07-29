import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { getDatabaseUrl } from "./env";
import * as schema from "./schema";

/**
 * Typed Drizzle client over Neon's HTTP driver — the right fit for serverless /
 * edge request handlers where each query is a single round-trip. If we later
 * need interactive multi-statement transactions (e.g. payment + audit_log in
 * one atomic unit), swap to the WebSocket `Pool` driver (`drizzle-orm/neon-serverless`).
 */
type Schema = typeof schema;
type Db = NeonHttpDatabase<Schema>;

// Lazily construct the client on first use, NOT at module load. `getDatabaseUrl`
// throws when `DATABASE_URL` is unset, and importing this module happens during
// `next build`'s page-data collection (which evaluates every route module) — so
// an eager client would make the build require a runtime secret it doesn't
// actually need. Deferring to first query keeps the build DB-free while runtime
// still fails loudly if the URL is missing.
let instance: Db | null = null;

/**
 * The real Drizzle client, constructed on first call. Exported for the rare
 * consumer that needs the genuine instance rather than the `db` Proxy below —
 * notably anything that type-sniffs it. Drizzle's `is()` walks the prototype
 * chain, which the Proxy's plain-object target defeats, so e.g. the Auth.js
 * Drizzle adapter must be handed this. Call it lazily; calling it at module
 * scope reintroduces the build-time `DATABASE_URL` requirement.
 */
export function getDb(): Db {
  if (!instance) {
    instance = drizzle({ client: neon(getDatabaseUrl()), schema });
  }
  return instance;
}

/**
 * The shared Drizzle client. A thin Proxy so `db.select()`, `db.insert()`, … work
 * exactly as before while the underlying connection is created on first access.
 * Methods are bound to the real instance so drizzle's internal `this` is intact.
 */
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    const real = getDb();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
}) as Db;

export { schema };
