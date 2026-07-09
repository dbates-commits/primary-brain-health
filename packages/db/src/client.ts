import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { getDatabaseUrl } from "./env";
import * as schema from "./schema";

/**
 * Typed Drizzle client over Neon's HTTP driver — the right fit for serverless /
 * edge request handlers where each query is a single round-trip. If we later
 * need interactive multi-statement transactions (e.g. payment + audit_log in
 * one atomic unit), swap to the WebSocket `Pool` driver (`drizzle-orm/neon-serverless`).
 */
const sql = neon(getDatabaseUrl());

export const db = drizzle({ client: sql, schema });

export { schema };
