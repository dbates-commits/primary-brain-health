import type { Node, NodeProps } from "@xyflow/react";
import { cn } from "@pbh/ui/utils";

import { NODE_SIZE } from "./map-layout";
import { NodeHandles } from "./NodeHandles";
import { NodeHoverCard } from "./NodeHoverCard";
import { STATE_BORDER } from "./node-styles";
import type { ProcessNode } from "./process-model";

export type GatewayNodeType = Node<{ node: ProcessNode }, "gateway">;

/**
 * A decision. Drawn as a square rotated 45°, with the glyph and the label
 * counter-rotated back so they stay level — an SVG diamond would need its own
 * handle geometry for no gain.
 */
export function GatewayNode({ data, selected }: NodeProps<GatewayNodeType>) {
  const { node } = data;
  const size = NODE_SIZE[node.kind];
  const glyph = node.kind === "gateway-and" ? "+" : "×";

  return (
    <div className="group relative" style={{ width: size.width, height: size.height }}>
      <NodeHandles />
      <div
        className={cn(
          "size-full rotate-45 rounded-[6px] border bg-background-default",
          STATE_BORDER[node.state],
          selected && "border-brand-default ring-2 ring-brand-pale",
        )}
      />
      <span className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-text-tertiary">
        {glyph}
      </span>
      <p className="absolute top-full left-1/2 mt-2 w-40 -translate-x-1/2 text-center text-[10px] leading-tight text-text-secondary">
        {node.name}
      </p>
      <NodeHoverCard node={node} />
    </div>
  );
}
