import { GearSix, User } from "@phosphor-icons/react";
import type { Node, NodeProps } from "@xyflow/react";
import { cn } from "@pbh/ui/utils";

import { EmailBadge } from "./EmailBadge";
import { NODE_SIZE } from "./map-layout";
import { NodeHandles } from "./NodeHandles";
import { NodeHoverCard } from "./NodeHoverCard";
import { STATE_BORDER } from "./node-styles";
import type { ProcessNode } from "./process-model";

export type TaskNodeType = Node<{ node: ProcessNode }, "task">;

/** A step somebody or something performs: the rounded box of a BPMN task. */
export function TaskNode({ data, selected }: NodeProps<TaskNodeType>) {
  const { node } = data;
  const size = NODE_SIZE[node.kind];
  const Icon = node.kind === "user" ? User : GearSix;

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-center rounded-xl border bg-background-default px-3 text-center transition-shadow",
        STATE_BORDER[node.state],
        selected && "border-brand-default shadow-md ring-2 ring-brand-pale",
      )}
      style={{ width: size.width, height: size.height }}
    >
      <NodeHandles />
      <Icon weight="regular" className="absolute top-2 left-2 size-3.5 text-text-tertiary" />
      {node.plannedNote ? (
        <span className="absolute top-1.5 right-2 text-[10px] text-aqua-default">◇</span>
      ) : null}
      <p className="text-[11.5px] leading-snug font-medium text-text-heading">{node.name}</p>
      {node.sends.length > 0 ? <EmailBadge sends={node.sends} /> : null}
      <NodeHoverCard node={node} />
    </div>
  );
}
