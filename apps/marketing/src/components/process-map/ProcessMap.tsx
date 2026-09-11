"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { DetailPanel } from "./DetailPanel";
import { EventNode } from "./EventNode";
import { GatewayNode } from "./GatewayNode";
import { LaneNode } from "./LaneNode";
import { MapToolbar, type MapFilters } from "./MapToolbar";
import { RoutedEdge } from "./RoutedEdge";
import { TaskNode } from "./TaskNode";
import type { NeighbourLink } from "./map-layout";
import { isPlanned, type ProcessNode, type SystemId } from "./process-model";

/** Stable identities: React Flow re-renders every node if these change. */
const NODE_TYPES = {
  lane: LaneNode,
  task: TaskNode,
  event: EventNode,
  gateway: GatewayNode,
};

/** Only `routed` is ours; the rest are React Flow's own straight-run edges. */
const EDGE_TYPES = { routed: RoutedEdge };

/**
 * Literal hex rather than the `--color-*` tokens they mirror: React Flow builds
 * one `<marker>` per colour and keys its id off the string, and a `var(…)` there
 * gives every arrowhead the same id and no fill. Keep these in step with
 * `@pbh/tokens` — grey/500, brand/700 and error.
 */
const STROKE = {
  flow: "#888884",
  aside: "#006e8a",
  blocked: "#ba1a1a",
};

const DIM_OPACITY = 0.18;

const EMPTY_FILTERS: MapFilters = { systems: [], states: [] };

function matches(node: ProcessNode, filters: MapFilters): boolean {
  const bySystem =
    filters.systems.length === 0 || node.systems.some((system) => filters.systems.includes(system));
  const byState =
    filters.states.length === 0 ||
    filters.states.includes(node.state) ||
    (filters.states.includes("planned") && isPlanned(node));
  return bySystem && byState;
}

export type ProcessMapProps = {
  nodes: Node[];
  edges: Edge[];
  neighbours: Record<string, NeighbourLink[]>;
  systems: SystemId[];
};

/**
 * The customer journey as a swimlane process map.
 *
 * Takes the built arrays as props rather than building them: everything the map
 * says about the system would otherwise be bundled into a public
 * `/_next/static` chunk, outside the password on `/internal`. See the note in
 * `map-layout.ts`.
 *
 * Filters **dim** rather than hide, so a reader keeps the shape of the whole
 * journey while looking at one slice of it. Nothing is draggable: the lanes
 * carry meaning, so a step moved out of one would be a lie.
 */
export function ProcessMap({
  nodes: baseNodes,
  edges: baseEdges,
  neighbours,
  systems,
}: ProcessMapProps) {
  const [filters, setFilters] = useState<MapFilters>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /** The model behind each node, for filtering and for the panel. */
  const models = useMemo(() => {
    const map = new Map<string, ProcessNode>();
    for (const node of baseNodes) {
      const model = (node.data as { node?: ProcessNode } | undefined)?.node;
      if (model) {
        map.set(node.id, model);
      }
    }
    return map;
  }, [baseNodes]);

  const nodes = useMemo<Node[]>(() => {
    return baseNodes.map((node) => {
      const model = models.get(node.id);
      if (!model) {
        return node;
      }
      const dim = !matches(model, filters);
      return {
        ...node,
        selected: node.id === selectedId,
        style: { opacity: dim ? DIM_OPACITY : 1 },
      };
    });
  }, [baseNodes, models, filters, selectedId]);

  const edges = useMemo<Edge[]>(() => {
    return baseEdges.map((edge) => {
      const data = edge.data as { kind?: string; blocked?: boolean } | undefined;
      const from = models.get(edge.source);
      const to = models.get(edge.target);
      const dim = (from ? !matches(from, filters) : false) || (to ? !matches(to, filters) : false);
      // A flow into a dead end is drawn in the dead end's colour: the reader
      // should see where the journey stops without reading a single label.
      const stroke = data?.blocked ? STROKE.blocked : data?.kind ? STROKE.aside : STROKE.flow;
      return {
        ...edge,
        style: {
          stroke,
          strokeWidth: 1.5,
          opacity: dim ? DIM_OPACITY : 1,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color: stroke,
        },
        labelStyle: { fill: "var(--color-text-secondary)", fontSize: 10 },
        labelBgStyle: { fill: "var(--color-background-default)" },
        labelBgPadding: [5, 3] as [number, number],
        labelBgBorderRadius: 4,
      };
    });
  }, [baseEdges, models, filters]);

  const onNodeClick = useCallback((_: unknown, node: Node) => {
    if (node.type === "lane") {
      return;
    }
    setSelectedId(node.id);
  }, []);

  const selected = selectedId ? (models.get(selectedId) ?? null) : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <MapToolbar filters={filters} systems={systems} onChange={setFilters} />
      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border-default bg-background-default">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          onNodeClick={onNodeClick}
          nodesDraggable={false}
          nodesConnectable={false}
          panOnScroll
          zoomOnScroll={false}
          minZoom={0.2}
          maxZoom={2}
          fitView
          fitViewOptions={{ padding: 0.08, maxZoom: 1 }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
          <Controls showInteractive={false} position="top-right" />
        </ReactFlow>
      </div>
      <DetailPanel
        node={selected}
        neighbours={selected ? (neighbours[selected.id] ?? []) : []}
        onClose={() => setSelectedId(null)}
        onSelect={setSelectedId}
      />
    </div>
  );
}
