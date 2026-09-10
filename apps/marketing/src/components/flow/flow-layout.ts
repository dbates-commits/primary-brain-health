import type { Edge, Node } from "@xyflow/react";

import {
  PARTICIPANTS,
  STEPS,
  type Lane,
  type Message,
  type Step,
} from "./sequence-data";

/**
 * Geometry for the sequence diagram, in the same units as the Figma frame it
 * mirrors — the numbers below are the Figma frame's own, so a node that looks
 * wrong on screen can be checked against the board without arithmetic.
 *
 * React Flow does no layout of its own: every node here is placed absolutely,
 * and the edges are the messages. Lifelines are nodes rather than edges on
 * purpose — an edge needs two endpoints, and a lifeline is a column, not a
 * message between two of them.
 */
export const LANE_GAP = 116;
export const LANE_ORIGIN = 288;
export const ROW_HEIGHT = 44;
/** Where the arrow sits inside its row — the label takes the space above it. */
export const ROW_BASELINE = 34;
/** A step is at least four rows tall, so short steps still read as a band. */
export const MIN_STEP_ROWS = 4;
export const HEADER_HEIGHT = 50;
export const STEP_COLUMN_WIDTH = 230;
export const DETAIL_COLUMN_X = 926;
export const DETAIL_COLUMN_WIDTH = 320;
export const PORT_SIZE = 6;

export function laneX(lane: Lane): number {
  return LANE_ORIGIN + lane * LANE_GAP;
}

export function stepHeight(step: Step): number {
  return Math.max(MIN_STEP_ROWS, step.messages.length) * ROW_HEIGHT;
}

/** Top edge of each step band, in canvas coordinates. */
export function stepTops(): number[] {
  const tops: number[] = [];
  let y = HEADER_HEIGHT;
  for (const step of STEPS) {
    tops.push(y);
    y += stepHeight(step);
  }
  return tops;
}

export function diagramHeight(): number {
  return HEADER_HEIGHT + STEPS.reduce((sum, step) => sum + stepHeight(step), 0);
}

function messageY(stepTop: number, index: number): number {
  return stepTop + index * ROW_HEIGHT + ROW_BASELINE;
}

/**
 * A message needs two endpoints React Flow can measure, so each end gets a
 * 6px port node on its lane. They are invisible; the dot and the arrowhead are
 * drawn by the edge, which is the only thing that knows the direction.
 */
function portId(stepIndex: number, messageIndex: number, end: "from" | "to") {
  return `port-${stepIndex}-${messageIndex}-${end}`;
}

function portNode(
  stepIndex: number,
  messageIndex: number,
  end: "from" | "to",
  lane: Lane,
  y: number,
): Node {
  return {
    id: portId(stepIndex, messageIndex, end),
    type: "port",
    position: { x: laneX(lane) - PORT_SIZE / 2, y: y - PORT_SIZE / 2 },
    data: {},
    draggable: false,
    selectable: false,
    zIndex: 2,
  };
}

export function buildNodes(): Node[] {
  const nodes: Node[] = [];
  const height = diagramHeight();

  PARTICIPANTS.forEach((name, index) => {
    const lane = index as Lane;
    nodes.push({
      id: `lifeline-${lane}`,
      type: "lifeline",
      position: { x: laneX(lane), y: HEADER_HEIGHT },
      data: { height: height - HEADER_HEIGHT },
      draggable: false,
      selectable: false,
      zIndex: 0,
    });
    nodes.push({
      id: `participant-${lane}`,
      type: "participant",
      position: { x: laneX(lane) - 52, y: 10 },
      data: { name },
      draggable: false,
      selectable: false,
      zIndex: 3,
    });
  });

  const tops = stepTops();
  STEPS.forEach((step, stepIndex) => {
    const top = tops[stepIndex];
    nodes.push({
      id: `step-${stepIndex}`,
      type: "step",
      position: { x: 0, y: top },
      data: { step },
      draggable: false,
      zIndex: 1,
    });
    nodes.push({
      id: `detail-${stepIndex}`,
      type: "detail",
      position: { x: DETAIL_COLUMN_X, y: top },
      data: { step },
      draggable: false,
      zIndex: 1,
    });
    step.messages.forEach((message, messageIndex) => {
      const y = messageY(top, messageIndex);
      nodes.push(portNode(stepIndex, messageIndex, "from", message.from, y));
      nodes.push(portNode(stepIndex, messageIndex, "to", message.to, y));
    });
  });

  return nodes;
}

export function buildEdges(): Edge[] {
  const edges: Edge[] = [];
  STEPS.forEach((step, stepIndex) => {
    step.messages.forEach((message: Message, messageIndex) => {
      edges.push({
        id: `message-${stepIndex}-${messageIndex}`,
        source: portId(stepIndex, messageIndex, "from"),
        target: portId(stepIndex, messageIndex, "to"),
        type: "message",
        data: {
          label: message.label,
          planned: message.planned,
          tone: message.tone ?? "default",
        },
        zIndex: 2,
      });
    });
  });
  return edges;
}
