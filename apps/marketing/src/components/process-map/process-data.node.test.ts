import { describe, expect, it } from "vitest";

import { EDGES, LANES, NODES } from "./process-data";
import { SYSTEM_LABELS, type LaneId } from "./process-model";

/**
 * The map is hand-written data, so these are the mistakes a hand makes: an edge
 * naming a step that isn't there, two steps sharing an id, a lane that no node
 * lives in. None of them throw at runtime — they just quietly drop a line from
 * the diagram, which is exactly the kind of wrong a reader can't see.
 */
describe("process map data", () => {
  const ids = new Set(NODES.map((node) => node.id));
  const laneIds = new Set<LaneId>(LANES.map((lane) => lane.id));

  it("has no duplicate node ids", () => {
    expect(ids.size).toBe(NODES.length);
  });

  it("only connects steps that exist", () => {
    for (const edge of EDGES) {
      expect(ids, `edge from ${edge.from}`).toContain(edge.from);
      expect(ids, `edge to ${edge.to}`).toContain(edge.to);
    }
  });

  it("puts every step in a declared lane", () => {
    for (const node of NODES) {
      expect(laneIds, node.id).toContain(node.lane);
    }
  });

  it("names a vendor on every step that calls one", () => {
    // The filter chips are derived from this set, so a vendor that appears on a
    // step and nowhere else still gets a chip.
    const used = new Set(NODES.flatMap((node) => node.systems));
    for (const system of used) {
      expect(Object.keys(SYSTEM_LABELS)).toContain(system);
    }
  });

  it("names a real system on every call", () => {
    for (const node of NODES) {
      for (const system of node.systems) {
        expect(Object.keys(SYSTEM_LABELS), node.id).toContain(system);
      }
    }
  });

  it("gives every step an owner to open first", () => {
    for (const node of NODES) {
      expect(node.owner.file, node.id).toMatch(/^(apps|packages)\//);
      expect(node.owner.package.length, node.id).toBeGreaterThan(0);
      expect(node.owner.team.length, node.id).toBeGreaterThan(0);
    }
  });

  it("keeps every step inside its lane band", () => {
    for (const node of NODES) {
      const lane = LANES.find((candidate) => candidate.id === node.lane);
      expect(lane, node.id).toBeDefined();
      expect(node.y, node.id).toBeGreaterThan(lane!.y);
      expect(node.y, node.id).toBeLessThan(lane!.y + lane!.height);
    }
  });
});
