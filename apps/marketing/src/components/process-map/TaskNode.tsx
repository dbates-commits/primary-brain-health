import { GearSix, User } from "@phosphor-icons/react";
import type { Node, NodeProps } from "@xyflow/react";
import { cn } from "@pbh/ui/utils";

import { EmailBadge } from "./EmailBadge";
import { NODE_SIZE } from "./node-sizes";
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
        "group relative rounded-xl border bg-background-default text-center transition-shadow",
        STATE_BORDER[node.state],
        selected && "border-brand-default shadow-md ring-2 ring-brand-pale",
      )}
      style={{ width: size.width, height: size.height }}
    >
      <NodeHandles />
      {/* Pinned to the top rather than laid out above the name: in a column the
          glyph rode up and down with the number of lines the name took, and no
          two nodes agreed on where it sat. */}
      <Icon
        weight="regular"
        className="absolute top-2 left-1/2 size-3.5 -translate-x-1/2 text-text-tertiary"
      />
      {node.plannedNote ? (
        <span className="absolute top-1.5 right-2 text-[10px] text-aqua-default">◇</span>
      ) : null}
      <div
        className={cn(
          // Clears the glyph above, and — where there is one — the email pill
          // straddling the bottom border.
          "flex h-full flex-col justify-center px-3 pt-6",
          node.sends.length > 0 ? "pb-4" : "pb-2",
        )}
      >
        <p className="text-[11.5px] leading-snug font-medium text-text-heading">{node.name}</p>
      </div>
      {node.sends.length > 0 ? <EmailBadge sends={node.sends} /> : null}
      <NodeHoverCard node={node} />
    </div>
  );
}
