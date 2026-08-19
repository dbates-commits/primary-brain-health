import "server-only";

import { eq } from "drizzle-orm";
import { db, users } from "@pbh/db";
import {
  normalizeEducationLevel,
  normalizeGender,
  type ProfileInitialValues,
} from "./profile-values";

/**
 * Everything the Profile Information card renders on first paint.
 *
 * Neon only, deliberately: `@pbh/linus`'s client has no `getParticipant`, and
 * the Linus API is US-only, so a call during render would 403 for anyone
 * outside it and take the whole page down. Every field this card shows is in
 * `users` anyway — Linus's participant record holds no name, email, phone or
 * ZIP, only the three demographics we sent it in the first place.
 */
export async function getProfileValues(
  userId: string,
): Promise<ProfileInitialValues | null> {
  // An explicit column list, never `select()`: the full row carries
  // `linusParticipantId`, the Linus registration claim and the Auth.js columns,
  // none of which should be one prop-spread away from a client component.
  const [row] = await db
    .select({
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      phone: users.phone,
      dateOfBirth: users.dateOfBirth,
      zip: users.zip,
      gender: users.gender,
      educationLevel: users.educationLevel,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    // The account holder's name — the one the header greets them by. We assume
    // a customer always registers themselves, so this and the `patient_*`
    // columns describe one person; see `profile-core.ts`.
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    // `date` in `mode: "string"` is always "YYYY-MM-DD", which is exactly the
    // value format of `<input type="date">`. No conversion in either direction.
    dateOfBirth: row.dateOfBirth ?? "",
    phone: row.phone ?? "",
    zip: row.zip ?? "",
    gender: normalizeGender(row.gender),
    educationLevel: normalizeEducationLevel(row.educationLevel),
  };
}
