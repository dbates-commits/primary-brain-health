import type { Node, NodeProps } from "@xyflow/react";
import { LANE_GUTTER } from "./node-sizes";

export type LaneNodeType = Node<{ label: string; width: number; height: number }, "lane">;

/**
 * A swimlane band, with its name turned on its side in the left gutter.
 *
 * Sits at `zIndex: -1` so the flow lines paint over it rather than under it.
 */
export function LaneNode({ data }: NodeProps<LaneNodeType>) {
  return (
    <div
      className="relative rounded-lg border border-border-subtle bg-background-default"
      style={{ width: data.width, height: data.height }}
    >
      <div
        className="absolute inset-y-0 left-0 border-r border-border-subtle"
        style={{ width: LANE_GUTTER }}
      >
        {/* Sized to the band's height and rotated about its own centre, rather
            than centred by the layout: a label longer than the 56px gutter
            overflows its box, and the browser resolves that by shifting it —
            which is why the four names did not line up with each other. */}
        <span
          className="absolute top-1/2 left-1/2 block text-center text-[11px] font-medium tracking-wide whitespace-nowrap text-text-secondary uppercase"
          style={{
            width: data.height,
            transform: "translate(-50%, -50%) rotate(-90deg)",
          }}
        >
          {data.label}
        </span>
      </div>
    </div>
  );
}
