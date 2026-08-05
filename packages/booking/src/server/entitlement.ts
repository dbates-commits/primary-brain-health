import "server-only";

/**
 * What product a user currently holds, derived rather than stored.
 *
 * Derived twice over, deliberately. `payments.package_key` records what each
 * purchase *was* — written server-side at Session creation and read back off
 * the signed webhook event — and `trackForPackage` says which product that is.
 * Entitlement is then the highest track across the rows that actually
 * succeeded.
 *
 * Deriving it is what makes refunds correct for free: flipping a comprehensive
 * row to `refunded` drops the user back to wellness copy on the next render,
 * where a denormalised `users.current_track` column would leave them reading
 * Specialist vocabulary for a product they no longer hold. It also means there
 * is no second track column to keep in step with the package key — the two
 * could only ever disagree, and the disagreement would be invisible.
 */

import { and, eq } from "drizzle-orm";
import { highestTrack, type CopyContext, type Track } from "@pbh/copy";
import { db, payments } from "@pbh/db";
import { trackForPackage } from "../track";

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
    .select({ packageKey: payments.packageKey })
    .from(payments)
    .where(and(eq(payments.userId, id), eq(payments.status, "succeeded")));

  return highestTrack(rows.map((row) => trackForPackage(row.packageKey)));
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
