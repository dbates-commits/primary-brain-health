import { customType } from "drizzle-orm/pg-core";

/**
 * Case-insensitive text, backed by Postgres `citext`.
 *
 * Requires the `citext` extension in the database
 * (`create extension if not exists citext;`) — included in the initial
 * migration. Used for email so uniqueness/equality ignore case.
 */
export const citext = customType<{ data: string }>({
  dataType() {
    return "citext";
  },
});
