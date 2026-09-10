import type { Node, NodeProps } from "@xyflow/react";

export type ParticipantNodeType = Node<{ name: string }, "participant">;

/** The column header: who this lifeline belongs to. */
export function ParticipantNode({ data }: NodeProps<ParticipantNodeType>) {
  return (
    <div className="w-26 rounded-full bg-brand-subtle px-2 py-1.5 text-center text-[9px] font-medium tracking-wide text-brand-default uppercase">
      {data.name}
    </div>
  );
}
