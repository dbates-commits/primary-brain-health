import { Handle, Position } from "@xyflow/react";

const HIDDEN = {
  width: 1,
  height: 1,
  minWidth: 1,
  minHeight: 1,
  border: "none",
  background: "transparent",
} as const;

const SIDES = [
  { id: "t", position: Position.Top },
  { id: "r", position: Position.Right },
  { id: "b", position: Position.Bottom },
  { id: "l", position: Position.Left },
];

/**
 * Four invisible source handles and four targets, one per side.
 *
 * Every shape carries the full set so `handlesFor` in `map-layout.ts` can pick
 * the side an edge should actually leave and enter by. Deciding that per edge
 * rather than per node is what keeps a flow that changes lane from entering the
 * next step backwards.
 */
export function NodeHandles() {
  return (
    <>
      {SIDES.map((side) => (
        <Handle
          key={`s-${side.id}`}
          id={`s-${side.id}`}
          type="source"
          position={side.position}
          isConnectable={false}
          style={HIDDEN}
        />
      ))}
      {SIDES.map((side) => (
        <Handle
          key={`t-${side.id}`}
          id={`t-${side.id}`}
          type="target"
          position={side.position}
          isConnectable={false}
          style={HIDDEN}
        />
      ))}
    </>
  );
}
