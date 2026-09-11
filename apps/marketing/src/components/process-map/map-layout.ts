import "server-only";

import type { Edge, Node } from "@xyflow/react";

import { NODE_SIZE } from "./node-sizes";
import { EDGES, LANES, MAP_WIDTH, NODES } from "./process-data";
import type { EdgeKind, NodeKind, ProcessNode, SystemId } from "./process-model";

/**
 * Turns the process model into React Flow's arrays.
 *
 * Positions are hand-placed in `process-data.ts` as centres, because a process
 * map is read left to right and no auto-layout preserves that. Everything here
 * is the mechanical part: centre → top-left, which handle each edge leaves and
 * enters by, and the lane bands behind it all.
 *
 * `server-only` on purpose. Everything the map says about the system lives in
 * `process-data.ts`, and a client component importing any of this would bundle
 * that text into a public `/_next/static` chunk — a URL the password on
 * `/internal` never sees. The page builds these arrays on the server and hands
 * them down as props instead.
 */

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
 * A flow runs along the row unless it changes row, in which case it leaves from
 * the bottom and enters by whichever side it is actually coming from — entering
 * a step from behind reads as a loop back. A wrap always drops from the bottom
 * into the top, because that is the shape a reader already knows from a line of
 * text running out of width.
 */
function handlesFor(from: ProcessNode, to: ProcessNode, kind?: EdgeKind) {
  if (kind === "wrap") {
    return { source: "s-b", target: "t-t" };
  }
  if (kind === "loop") {
    return { source: "s-t", target: "t-t" };
  }

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
    const handles = handlesFor(from, to, edge.kind);
    const routed = edge.kind === "wrap" || edge.kind === "loop";
    return [
      {
        id: `flow-${edge.from}-${edge.to}`,
        source: edge.from,
        target: edge.to,
        sourceHandle: handles.source,
        targetHandle: handles.target,
        type: routed ? "routed" : "smoothstep",
        animated: edge.kind !== undefined,
        label: edge.label,
        data: {
          kind: edge.kind,
          viaY: edge.via,
          blocked: to.state === "blocked",
        },
      },
    ];
  });
}

/** One end of a flow, as the detail panel lists it. */
export type NeighbourLink = {
  id: string;
  name: string;
  direction: string;
  label?: string;
};

/** Every step either side of each step, for the panel's "Connected to". */
export function buildNeighbours(): Record<string, NeighbourLink[]> {
  const out: Record<string, NeighbourLink[]> = {};
  for (const edge of EDGES) {
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    if (!from || !to) {
      continue;
    }
    (out[from.id] ??= []).push({
      id: to.id,
      name: to.name,
      direction: "then",
      label: edge.label,
    });
    (out[to.id] ??= []).push({
      id: from.id,
      name: from.name,
      direction: "after",
      label: edge.label,
    });
  }
  return out;
}

/**
 * The vendors any step actually calls, in a fixed order.
 *
 * Derived rather than listed: a hand-written list of filter chips silently
 * omitted one, and the first step tagged with it would have been unfilterable.
 */
export function usedSystems(): SystemId[] {
  const order: SystemId[] = ["neon", "resend", "stripe", "linus", "authjs"];
  const used = new Set(NODES.flatMap((node) => node.systems));
  return order.filter((system) => used.has(system));
}
