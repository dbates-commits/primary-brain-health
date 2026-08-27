-- One acknowledgment per (user, consent type, version) — pbh-3u1.
--
-- Re-submitting the consent step inserted a second identical pair, leaving two
-- append-only evidence rows with nothing to say which is operative.
--
-- The delete removes only exact duplicates, keeping the earliest row of each
-- group — the acknowledgment that actually gated the booking. Production held
-- none when this was written (checked against the `production` Neon branch: 2
-- consent rows, 0 duplicate groups), so there it is a no-op; the dev and preview
-- branches each carry 2 extras from E2E runs.
DELETE FROM "consents" a
USING "consents" b
WHERE a.user_id = b.user_id
  AND a.consent_type = b.consent_type
  AND a.version = b.version
  AND (a.acknowledged_at, a.id) > (b.acknowledged_at, b.id);
--> statement-breakpoint
CREATE UNIQUE INDEX "consents_user_id_consent_type_version_key" ON "consents" USING btree ("user_id","consent_type","version");