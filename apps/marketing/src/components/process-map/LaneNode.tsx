import type { Node, NodeProps } from "@xyflow/react";
import { LANE_GUTTER } from "./map-layout";

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
        className="absolute inset-y-0 left-0 grid place-items-center border-r border-border-subtle"
        style={{ width: LANE_GUTTER }}
      >
        <span className="-rotate-90 text-[11px] font-medium tracking-wide whitespace-nowrap text-text-secondary uppercase">
          {data.label}
        </span>
      </div>
    </div>
  );
}
