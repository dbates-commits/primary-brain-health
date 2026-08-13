-- IF EXISTS: the column was already dropped by hand on at least one database
-- (which is what broke signup — the schema still named it in every INSERT),
-- while others still have it. Both have this migration recorded as applied
-- afterwards, so the ledger and the tables finally agree.
ALTER TABLE "users" DROP COLUMN IF EXISTS "password_hash";
