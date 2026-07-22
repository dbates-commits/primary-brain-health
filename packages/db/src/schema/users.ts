import { sql } from "drizzle-orm";
import { char, date, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { citext } from "./_types";

/**
 * Account identity. PII; conservatively HIPAA-adjacent.
 *
 * No card data ever lives here (that stays at Stripe) and no clinical /
 * assessment data (owned by Linus Remote Assessments). See
 * docs/sow2/technical/database-plan.md.
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
  // Collected in step 2 of signup, so nullable until that step completes.
  passwordHash: text("password_hash"),
  // `string` mode: a plain calendar date ("YYYY-MM-DD"), no time/timezone.
  dateOfBirth: date("date_of_birth", { mode: "string" }),
  zip: text(),
  stateOfResidence: char("state_of_residence", { length: 2 }),
  // Intake-form fields (marketing consultation form). Nullable: the funnel
  // signup flow does not collect these.
  //
  // Deliberately no free-text field here. An open-text "concerns" box was
  // removed (and its column dropped) because customers could type symptoms,
  // diagnoses, or treatment history into it — PHI that would breach the
  // data-minimisation boundary this schema exists to hold. Clinical narrative
  // belongs in Linus, never here.
  phone: text(),
  gender: text(),
  educationLevel: text("education_level"),
  // "Self" | "Someone else" — captured at signup, because it decides what every
  // later question means.
  patientIdentification: text("patient_identification"),
  // The person being assessed, set only when patientIdentification is
  // "Someone else". Read this together with the flag above: when it is set, the
  // demographic columns (dateOfBirth, gender, zip, phone, educationLevel)
  // describe THIS person, not the account holder named by first_name/last_name.
  // `buildRegisterInput` relies on that to register the right Linus subject.
  patientFirstName: text("patient_first_name"),
  patientLastName: text("patient_last_name"),
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
