---
name: db-migrate
description: Run database migrations against Neon after schema changes. Use when the user modifies a Drizzle schema, adds tables/columns, or says anything about migrations, db changes, or schema updates.
---

When the schema has been modified (or the user asks to migrate), follow these steps:

## 1. Find the Neon project

Use `mcp__Neon__list_projects` and match by the current repo/directory name to identify the correct project. If ambiguous, ask the user which project.

## 2. Identify what changed

- Read the Drizzle schema file (usually `src/db/schema.ts` or similar — find it via the `drizzle.config.*` file)
- Use `mcp__Neon__get_database_tables` to see existing tables
- Use `mcp__Neon__describe_table_schema` for tables that may have changed

## 3. Generate the migration SQL

Run `npx drizzle-kit generate` via Bash to generate migration files.

Read the generated SQL file from the drizzle output directory to understand what will be executed.

## 4. Apply the migration to Neon

Use `mcp__Neon__run_sql_transaction` with the project_id and the SQL from the generated migration file. Using a transaction keeps changes atomic.

If the migration is a single simple statement, `mcp__Neon__run_sql` is fine.

## 5. Verify

Use `mcp__Neon__describe_table_schema` to confirm the changes landed correctly.

Report what changed (tables created, columns added/modified, etc.).
