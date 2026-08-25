import { sql } from "drizzle-orm";
import { char, date, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { citext } from "./_types";

/**
 * Account identity. PII; conservatively HIPAA-adjacent.
 *
 * No card data ever lives here (that stays at Stripe) and no clinical /
 * assessment data (owned by Linus Remote Assessments). See
 * docs/database.md.
 */
export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  email: citext().notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  // --- Auth.js (NextAuth) adapter columns ---
  // The Drizzle adapter reads/writes these by name on the users table. We keep
  // firstName/lastName as our canonical identity; `name` is Auth.js's single
  // display field (nullable — the funnel populates first/last, not name), and
  // `image` is unused today but part of the AdapterUser shape. `emailVerified`
  // is stamped when a user proves control of their inbox via a magic link.
  name: text("name"),
  image: text("image"),
  emailVerified: timestamp("email_verified", { withTimezone: true, mode: "date" }),
  // Which assessment package this person chose on the landing card, captured at
  // signup. Persisted because the booking is no longer a single sitting: the
  // email-confirmation gate sends them away and they come back to a fresh page,
  // so in-memory state is gone by the time they reach payment. This is also the
  // authoritative value at checkout — the client re-sends a key, but it is only
  // a hint, or someone could show themselves the $449 flow and pay the $149
  // price. See ASSESSMENT_PACKAGES in @pbh/booking.
  selectedPackageKey: text("selected_package_key"),
  // `string` mode: a plain calendar date ("YYYY-MM-DD"), no time/timezone.
  dateOfBirth: date("date_of_birth", { mode: "string" }),
  zip: text(),
  // DEPRECATED (pbh-4by): the details step dropped this field to match the
  // design, so nothing writes it. Kept, not dropped: the RFP calls state of
  // residence required for the primary-care handoff and the intake gate's
  // eligibility check, existing rows hold real data, and re-instating it should
  // be a form change rather than a migration.
  stateOfResidence: char("state_of_residence", { length: 2 }),
  // Intake-form fields (marketing consultation form). Nullable: the funnel
  // signup flow does not collect these.
  //
  // Deliberately no free-text field here. An open-text "concerns" box was
  // removed (and its column dropped) because customers could type symptoms,
  // diagnoses, or treatment history into it — PHI that would breach the
  // data-minimisation boundary this schema exists to hold. Clinical narrative
  // belongs in Linus, never here.
  //
  // These demographics — and `first_name` / `last_name` with them — describe the
  // account holder, who is the person assessed. There is no second name pair:
  // `patient_first_name` / `patient_last_name` were dropped in 0022 because the
  // funnel registers the buyer as the Linus subject, and a second pair only
  // gave the same person two names that could disagree.
  phone: text(),
  gender: text(),
  educationLevel: text("education_level"),
  // DEPRECATED (pbh-4by): signup no longer asks who the assessment is for, and
  // nothing reads this any more — the patient/account distinction it belonged to
  // was retired with `patient_first_name` / `patient_last_name` (0022). Kept
  // rather than dropped only because existing rows hold a real answer; drop it
  // once those are aged out.
  patientIdentification: text("patient_identification"),
  // Linus Health subject id, set the first time we register this user as a
  // subject. Persisted so we never re-register (which would create a duplicate
  // Linus subject) — once set, we reuse it and skip straight to enrollment.
  linusParticipantId: text("linus_participant_id").unique(),
  // Atomic claim used to elect a single registrar when the client action and the
  // webhook race to register a first-time subject (they run in separate
  // instances, so this DB claim — not an in-process lock — is what serializes
  // them). Set the moment a caller wins the right to call Linus; a staleness
  // window lets a crashed registrar's claim be retried. See registerAndEnrollUser.
  linusRegistrationClaimedAt: timestamp("linus_registration_claimed_at", {
    withTimezone: true,
  }),
  // DEPRECATED (pbh-23g): /welcome is now the terminal screen — it links out to
  // the Linus Engagement App and there is nowhere to skip ahead to, so it is
  // always shown and nothing stamps this. A follow-up drops it.
  welcomeSeenAt: timestamp("welcome_seen_at", {
    withTimezone: true,
  }),
  // Set when the customer files a deletion request from the account page. The
  // row and every value in it are kept: `payments`, `consents` and `audit_log`
  // all reference this table with ON DELETE no action and are retention-bearing
  // (the first two append-only, the last on a six-year HIPAA clock), so there is
  // nothing here we are free to erase on request. The erasure itself is an
  // operator-run routine for now, and `deactivated_at IS NOT NULL` is its
  // worklist.
  //
  // This single column carries the whole state. It locks sign-in — see
  // `findAuthUserByEmail`, which stops treating the address as an account — and
  // it makes the stamping UPDATE its own idempotency claim, so a double-submit
  // or a replayed POST can only win once. See `deactivate-account-core.ts`.
  deactivatedAt: timestamp("deactivated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`)
    // Return a Date, not sql`now()`: drizzle's UPDATE builder params the
    // $onUpdate result through the column encoder without checking for SQL
    // (unlike the INSERT path), so a raw SQL value hits `value.toISOString()`
    // and throws. A Date encodes cleanly.
    .$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
