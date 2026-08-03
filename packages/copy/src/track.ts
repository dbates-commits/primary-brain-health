/**
 * The product axis every piece of track-sensitive copy branches on.
 *
 * Deliberately NOT keyed on price: amounts change, and a `449` in a conditional
 * would silently mislabel copy the day the price moves. `track` is the stable
 * name for "which product did this person buy".
 */
export type Track = "clinical" | "wellness";

/** Ordered lowest → highest entitlement. */
export const TRACKS = ["wellness", "clinical"] as const;

/**
 * Entitlement ordering. A user who has bought both holds the higher one — this
 * is what makes "current track" a `max()` over their succeeded payments rather
 * than a mutable flag someone has to remember to update.
 */
export const TRACK_RANK: Record<Track, number> = {
  wellness: 0,
  clinical: 1,
};

export function isTrack(value: unknown): value is Track {
  return value === "clinical" || value === "wellness";
}

/**
 * Parse a track that came from outside the type system (a DB column, Stripe
 * metadata, a route segment). Returns null rather than defaulting: silently
 * falling back to one of the two products is exactly the failure this whole
 * mapping exists to prevent, so callers must decide what an unknown value means.
 */
export function parseTrack(value: unknown): Track | null {
  return isTrack(value) ? value : null;
}

/** The higher-entitlement of two tracks. */
export function higherTrack(a: Track, b: Track): Track {
  return TRACK_RANK[a] >= TRACK_RANK[b] ? a : b;
}

/**
 * The highest track in a list, or null when the list is empty — i.e. when the
 * user has no succeeded payment and therefore no entitlement at all. Callers
 * render pre-purchase copy for null; they must not substitute a default track.
 */
export function highestTrack(tracks: readonly Track[]): Track | null {
  return tracks.reduce<Track | null>(
    (best, track) => (best === null ? track : higherTrack(best, track)),
    null,
  );
}

/**
 * Everything a surface needs to pick its words.
 *
 * `canUpgrade` is a flag rather than a third track: a wellness user who can
 * upgrade needs extra copy, not a different vocabulary, and modelling it as
 * `"wellness-upgradable"` would triple the lexicon for no gain.
 */
export interface CopyContext {
  track: Track;
  /** True when this wellness user is eligible to upgrade to clinical. */
  canUpgrade?: boolean;
}
