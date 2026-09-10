import type { Node, NodeProps } from "@xyflow/react";
import { cn } from "@pbh/ui/utils";

import { EmailBadge } from "./EmailBadge";
import { NODE_SIZE } from "./map-layout";
import { NodeHandles } from "./NodeHandles";
import { NodeHoverCard } from "./NodeHoverCard";
import { STATE_BORDER } from "./node-styles";
import type { ProcessNode } from "./process-model";

export type EventNodeType = Node<{ node: ProcessNode }, "event">;

/**
 * Start and end events: a thin circle and a thick one, as in BPMN. The name
 * sits under the circle, which is why it is absolutely positioned — the shape
 * has to stay the size the layout thinks it is.
 */
export function EventNode({ data, selected }: NodeProps<EventNodeType>) {
  const { node } = data;
  const size = NODE_SIZE[node.kind];

  return (
    <div className="group relative" style={{ width: size.width, height: size.height }}>
      <NodeHandles />
      <div
        className={cn(
          "size-full rounded-full bg-background-default",
          node.kind === "end" ? "border-[3px]" : "border",
          STATE_BORDER[node.state],
          selected && "border-brand-default ring-2 ring-brand-pale",
        )}
      />
      <p className="absolute top-full left-1/2 mt-1 w-36 -translate-x-1/2 text-center text-[10px] leading-tight text-text-secondary">
        {node.name}
      </p>
      {node.sends.length > 0 ? (
        <span className="absolute top-full left-1/2 mt-6 block -translate-x-1/2">
          <EmailBadge sends={node.sends} />
        </span>
      ) : null}
      <NodeHoverCard node={node} />
    </div>
  );
}
