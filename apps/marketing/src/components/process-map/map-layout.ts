import type { Edge, Node } from "@xyflow/react";

import { EDGES, LANES, MAP_WIDTH, NODES } from "./process-data";
import type { NodeKind, ProcessNode } from "./process-model";

/**
 * Turns the process model into React Flow's arrays.
 *
 * Positions are hand-placed in `process-data.ts` as centres, because a process
 * map is read left to right and no auto-layout preserves that. Everything here
 * is the mechanical part: centre → top-left, which handle each edge leaves and
 * enters by, and the lane bands behind it all.
 */

/** Rendered size per shape, so a centre can become a top-left corner. */
export const NODE_SIZE: Record<NodeKind, { width: number; height: number }> = {
  start: { width: 34, height: 34 },
  end: { width: 34, height: 34 },
  user: { width: 152, height: 62 },
  service: { width: 152, height: 62 },
  "gateway-xor": { width: 52, height: 52 },
  "gateway-and": { width: 52, height: 52 },
};

/** The gutter on the left of each band that holds the rotated lane label. */
export const LANE_GUTTER = 56;

const NODE_TYPE: Record<NodeKind, string> = {
  start: "event",
  end: "event",
  user: "task",
  service: "task",
  "gateway-xor": "gateway",
  "gateway-and": "gateway",
};

const byId = new Map(NODES.map((node) => [node.id, node]));

export function findNode(id: string): ProcessNode | undefined {
  return byId.get(id);
}

export function buildNodes(): Node[] {
  const lanes: Node[] = LANES.map((lane) => ({
    id: `lane-${lane.id}`,
    type: "lane",
    position: { x: 0, y: lane.y },
    data: { label: lane.label, width: MAP_WIDTH, height: lane.height },
    draggable: false,
    selectable: false,
    // Below the edge layer, which sits at 0 — otherwise the band paints over
    // every flow line, since React Flow draws nodes after edges.
    zIndex: -1,
  }));

  const steps: Node[] = NODES.map((node) => {
    const size = NODE_SIZE[node.kind];
    return {
      id: node.id,
      type: NODE_TYPE[node.kind],
      position: { x: node.x - size.width / 2, y: node.y - size.height / 2 },
      data: { node },
      draggable: false,
      zIndex: 1,
    };
  });

  return [...lanes, ...steps];
}

/**
 * Which side an edge leaves and enters by.
 *
 * A flow runs along the lane unless it changes lane, in which case it leaves
 * from the bottom and enters by whichever side it is actually coming from —
 * entering a step from behind reads as a loop back.
 */
function handlesFor(from: ProcessNode, to: ProcessNode) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (Math.abs(dy) <= 40) {
    return { source: "s-r", target: "t-l" };
  }
  const source = dy > 0 ? "s-b" : "s-t";
  if (dx > 40) {
    return { source, target: "t-l" };
  }
  if (dx < -40) {
    return { source, target: "t-r" };
  }
  return { source, target: dy > 0 ? "t-t" : "t-b" };
}

export function buildEdges(): Edge[] {
  return EDGES.flatMap((edge) => {
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    if (!from || !to) {
      return [];
    }
    const handles = handlesFor(from, to);
    return [
      {
        id: `flow-${edge.from}-${edge.to}`,
        source: edge.from,
        target: edge.to,
        sourceHandle: handles.source,
        targetHandle: handles.target,
        type: "smoothstep",
        label: edge.label,
      },
    ];
  });
}

/** Every step either side of this one, for the panel's "Connected to". */
export function neighboursOf(id: string) {
  return EDGES.filter((edge) => edge.from === id || edge.to === id).flatMap((edge) => {
    const outgoing = edge.from === id;
    const other = byId.get(outgoing ? edge.to : edge.from);
    if (!other) {
      return [];
    }
    const direction = outgoing ? "then" : "after";
    return [{ other, direction, label: edge.label }];
  });
}
