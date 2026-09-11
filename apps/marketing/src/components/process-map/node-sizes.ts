import type { NodeKind } from "./process-model";

/**
 * Rendered size per shape, so a centre can become a top-left corner.
 *
 * Its own module, not part of `map-layout.ts`: the shapes need these numbers in
 * the browser, and `map-layout` reads the whole journey. Importing one from the
 * other would pull every step's text into a public JavaScript chunk — see the
 * note on the page that builds the map.
 */
export const NODE_SIZE: Record<NodeKind, { width: number; height: number }> = {
  start: { width: 34, height: 34 },
  end: { width: 34, height: 34 },
  user: { width: 152, height: 72 },
  service: { width: 152, height: 72 },
  // 74 so the 52px square inside can rotate: its diagonal is 73.5, and a box
  // the size of the square's side clips the two points off it.
  "gateway-xor": { width: 74, height: 74 },
  "gateway-and": { width: 74, height: 74 },
};

/** The gutter on the left of each band that holds the rotated lane label. */
export const LANE_GUTTER = 56;
