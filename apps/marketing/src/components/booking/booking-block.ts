/**
 * The block type the booking flow mounts on. Reuses the already-indexed
 * `intakeForm` block rather than adding a schema Tina would have to index —
 * see the note in `BlockRenderer`.
 */
const BOOKING_BLOCK_TYPENAME = "PageBlocksIntakeForm";

/**
 * Whether a page carries the booking flow.
 *
 * Asked before fetching the Modals collection, because the consent agreement is
 * a whole rich-text tree: fetched unconditionally it is serialized into the RSC
 * payload of every page on the site, including the ones with no booking block
 * to read it. Only the booking block does.
 *
 * The typename is Tina's, so this takes `unknown` and narrows — the blocks
 * array is generated and its element type is a union of every block on the
 * site.
 */
export function hasBookingBlock(blocks: unknown): boolean {
  return (
    Array.isArray(blocks) &&
    blocks.some(
      (block) =>
        (block as { __typename?: string } | null)?.__typename ===
        BOOKING_BLOCK_TYPENAME,
    )
  );
}
