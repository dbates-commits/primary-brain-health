import type { Node, NodeProps } from "@xyflow/react";

export type LifelineNodeType = Node<{ height: number }, "lifeline">;

/**
 * The vertical line under a participant. A node rather than an edge: it spans
 * the whole diagram and connects nothing.
 */
export function LifelineNode({ data }: NodeProps<LifelineNodeType>) {
  return (
    <div
      className="w-px bg-grey-300"
      style={{ height: data.height }}
      aria-hidden
    />
  );
}
