import { EdgeLabelRenderer, type Edge, type EdgeProps } from "@xyflow/react";

import type { MessageTone } from "./sequence-data";

export type MessageEdgeType = Edge<
  { label: string; planned?: string; tone: MessageTone },
  "message"
>;

/** How far short of the lane a dead end stops, leaving room for the ✕. */
const DEAD_END_GAP = 46;
const ARROW = 7;
const DOT = 3;

function strokeFor(tone: MessageTone): string {
  if (tone === "default") {
    return "var(--color-brand-default)";
  }
  return "var(--color-error)";
}

/**
 * One message: a horizontal line from the sender's lane to the receiver's,
 * with the label sitting above it and left-aligned to the line, as on the
 * board.
 *
 * A dead end stops short of the lane it was aimed at and ends in a ✕ — the
 * call that has nowhere to land is the point of those rows, so it must not
 * look like an arrow that arrived.
 */
export function MessageEdge({
  sourceX,
  sourceY,
  targetX,
  data,
  selected,
}: EdgeProps<MessageEdgeType>) {
  const tone = data?.tone ?? "default";
  const stroke = strokeFor(tone);
  const direction = targetX >= sourceX ? 1 : -1;
  const endX =
    tone === "dead-end" ? targetX - direction * DEAD_END_GAP : targetX;
  const labelX = (sourceX + endX) / 2;

  return (
    <>
      <path
        d={`M ${sourceX} ${sourceY} L ${endX} ${sourceY}`}
        stroke={stroke}
        strokeWidth={selected ? 2.5 : 1.5}
        fill="none"
      />
      <circle cx={sourceX} cy={sourceY} r={DOT} fill={stroke} />
      {tone === "dead-end" ? (
        <g stroke={stroke} strokeWidth={1.5}>
          <line
            x1={endX + direction * 4}
            y1={sourceY - 5}
            x2={endX + direction * 14}
            y2={sourceY + 5}
          />
          <line
            x1={endX + direction * 14}
            y1={sourceY - 5}
            x2={endX + direction * 4}
            y2={sourceY + 5}
          />
        </g>
      ) : (
        <polygon
          points={`${endX},${sourceY} ${endX - direction * ARROW},${
            sourceY - 4
          } ${endX - direction * ARROW},${sourceY + 4}`}
          fill={stroke}
        />
      )}
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-none absolute top-0 left-0 text-[9px] leading-3 whitespace-nowrap"
          style={{
            transform: `translate(-50%, 0) translate(${labelX}px, ${sourceY - 28}px)`,
          }}
        >
          <span
            className={
              tone === "default" ? "text-text-default" : "text-error"
            }
          >
            {data?.label}
          </span>
          {data?.planned ? (
            <span className="text-aqua-default"> ◇ {data.planned}</span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
