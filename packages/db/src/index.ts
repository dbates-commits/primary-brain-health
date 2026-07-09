/**
 * `@pbh/db` — the shared Drizzle/Neon data layer. Schema, the typed client, and
 * the audit-log writer live here so every app (funnel, marketing) reads and
 * writes the same tables through one source of truth. Migrations are owned by
 * this package (`drizzle.config.ts` + `src/migrations`).
 */
export * from "./schema";
export * from "./client";
export * from "./audit";
