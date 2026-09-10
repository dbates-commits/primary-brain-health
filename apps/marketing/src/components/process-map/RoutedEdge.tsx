import { EdgeLabelRenderer, type Edge, type EdgeProps } from "@xyflow/react";

export type RoutedEdgeType = Edge<{ viaY: number; blocked?: boolean }, "routed">;

/**
 * A flow that has to travel back across the map: the wrap from the end of one
 * lane to the start of the next, and the loop from a decision to a step already
 * passed.
 *
 * Routed by hand rather than with `smoothstep`, which bends at the midpoint
 * between the two ends — for a line that runs the width of the map, that puts
 * the horizontal leg straight through the row it is passing. `viaY` is chosen
 * in `map-layout.ts` to sit in the gap above the target's row instead.
 */
export function RoutedEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  label,
  data,
  style,
  markerEnd,
}: EdgeProps<RoutedEdgeType>) {
  const viaY = data?.viaY ?? (sourceY + targetY) / 2;
  const path = `M ${sourceX} ${sourceY} L ${sourceX} ${viaY} L ${targetX} ${viaY} L ${targetX} ${targetY}`;

  return (
    <>
      <path d={path} fill="none" style={style} markerEnd={markerEnd} />
      {label ? (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan pointer-events-none absolute top-0 left-0 rounded bg-background-default px-1 text-[10px] text-text-secondary"
            style={{
              transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px, ${viaY}px)`,
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
