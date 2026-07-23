import "server-only";

/**
 * What product a user currently holds, derived rather than stored.
 *
 * `payments.track` records what each purchase *was*; entitlement is the highest
 * track across the rows that actually succeeded. Deriving it is what makes
 * refunds correct for free: flipping a clinical row to `refunded` drops the user
 * back to wellness copy on the next render, where a denormalised
 * `users.current_track` column would leave them reading Specialist vocabulary
 * for a product they no longer hold.
 */

import { and, eq } from "drizzle-orm";
import {
  highestTrack,
  parseTrack,
  type CopyContext,
  type Track,
} from "@pbh/copy";
import { db, payments } from "@pbh/db";

/**
 * The user's current entitlement, or null when they have no succeeded payment
 * at all. Null means "pre-purchase" — callers must render pre-purchase copy for
 * it and must not substitute a default track.
 */
export async function getEntitledTrack(userId: string): Promise<Track | null> {
  const id = userId.trim();
  if (!id) {
    return null;
  }
  const rows = await db
    .select({ track: payments.track })
    .from(payments)
    .where(and(eq(payments.userId, id), eq(payments.status, "succeeded")));

  // An unrecognised value (hand-edited row, a track added to the DB but not to
  // the code) is dropped rather than guessed at: it can only be one of the two
  // products, and picking the wrong one is the failure this mapping prevents.
  const tracks = rows
    .map((row) => parseTrack(row.track))
    .filter((track): track is Track => track !== null);

  return highestTrack(tracks);
}

/**
 * The full copy context for a paying user: their track plus whether the upgrade
 * offer applies to them.
 *
 * Eligibility is "holds wellness, doesn't hold clinical" — deriving the track as
 * a max means a user who already upgraded reports `clinical` and is no longer
 * offered it. If the credit turns out to be time-limited (an open question with
 * David), the window check belongs here, alongside the succeeded-payment date.
 */
export async function getCopyContext(
  userId: string,
): Promise<(CopyContext & { track: Track }) | null> {
  const track = await getEntitledTrack(userId);
  if (track === null) {
    return null;
  }
  return { track, canUpgrade: track === "wellness" };
}
