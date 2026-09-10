"use client";

import { useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { DetailNode } from "./DetailNode";
import { LifelineNode } from "./LifelineNode";
import { MessageEdge } from "./MessageEdge";
import { ParticipantNode } from "./ParticipantNode";
import { PortNode } from "./PortNode";
import { StepNode } from "./StepNode";
import { buildEdges, buildNodes } from "./flow-layout";

/**
 * Declared once, outside the component: React Flow warns (and re-renders every
 * node) if these object identities change between renders.
 */
const NODE_TYPES = {
  participant: ParticipantNode,
  lifeline: LifelineNode,
  step: StepNode,
  detail: DetailNode,
  port: PortNode,
};

const EDGE_TYPES = { message: MessageEdge };

/**
 * The booking flow sequence diagram, on a pan-and-zoom canvas.
 *
 * Nothing is editable and nothing is connectable — the diagram is data (see
 * `sequence-data.ts`), and React Flow is here for the canvas, not for graph
 * editing. Dragging a node would only let a reader shift a lifeline off its
 * column.
 */
export function SequenceFlow() {
  const nodes = useMemo(() => buildNodes(), []);
  const edges = useMemo(() => buildEdges(), []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      nodesDraggable={false}
      nodesConnectable={false}
      // Read it like a document: the wheel pans, ⌘/ctrl + wheel zooms.
      panOnScroll
      zoomOnScroll={false}
      elementsSelectable
      minZoom={0.2}
      maxZoom={2}
      // Opens at 1:1 rather than fitView: the diagram is a tall column, so
      // fitting it to a landscape viewport shrinks the labels past reading.
      // The reader pans down; Controls still offers fit-to-screen.
      defaultViewport={{ x: 24, y: 16, zoom: 1 }}
      proOptions={{ hideAttribution: false }}
    >
      <Background variant={BackgroundVariant.Dots} gap={24} size={1} />
      {/* Top-right: bottom-left is where the step column's text runs. */}
      <Controls showInteractive={false} position="top-right" />
      <MiniMap
        pannable
        zoomable
        ariaLabel="Diagram overview"
        nodeColor="var(--color-grey-300)"
        // Literal rather than a token: the mask has to be translucent to let
        // the nodes under it show through, and no token carries an alpha.
        maskColor="rgba(17, 24, 39, 0.08)"
      />
    </ReactFlow>
  );
}
