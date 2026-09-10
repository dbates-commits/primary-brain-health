import { Handle, Position } from "@xyflow/react";

const HIDDEN_HANDLE = {
  width: 1,
  height: 1,
  minWidth: 1,
  minHeight: 1,
  left: "50%",
  top: "50%",
  border: "none",
  background: "transparent",
  transform: "translate(-50%, -50%)",
} as const;

/**
 * The anchor a message edge attaches to: one per end, sitting on its lane.
 *
 * Both handles are stacked at the node's centre rather than on its left and
 * right edges, so an edge lands exactly on the lifeline whichever way it
 * points — a sequence diagram has no notion of an arrow leaving from a side.
 */
export function PortNode() {
  return (
    <div className="h-1.5 w-1.5">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={false}
        style={HIDDEN_HANDLE}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={false}
        style={HIDDEN_HANDLE}
      />
    </div>
  );
}
