import { describe, expect, it } from "vitest";

import { DIMENSIONS, EXAMPLES_CAVEAT, HUBSPOT_EXAMPLES, OUR_EXAMPLES } from "./stack-compare-data";
import { VERDICT_LABELS } from "./stack-compare-model";

/**
 * This page is an argument, and its credibility is the whole deliverable. These
 * are the ways a hand-written argument goes quietly wrong: a claim with no
 * source behind it, a row that only says nice things about us, or a page that
 * has drifted into never conceding anything.
 *
 * None of them throw at runtime. They just make the page less true, which is
 * exactly the kind of wrong a reader cannot see and a sceptic can.
 */
describe("stack comparison data", () => {
  it("has no duplicate row ids", () => {
    const ids = new Set(DIMENSIONS.map((dimension) => dimension.id));
    expect(ids.size).toBe(DIMENSIONS.length);
  });

  it("cites a source on every row", () => {
    for (const dimension of DIMENSIONS) {
      expect(dimension.sources.length, dimension.id).toBeGreaterThan(0);
    }
  });

  it("gives every source a label and somewhere to go", () => {
    for (const dimension of DIMENSIONS) {
      for (const source of dimension.sources) {
        expect(source.label, dimension.id).not.toBe("");
        expect(source.href, dimension.id).not.toBe("");
      }
    }
  });

  it("says both things about both sides of every row", () => {
    // A side with no cons is an advert. If a row genuinely has nothing bad to
    // say about one side, it is the row that is wrong, not this test.
    for (const dimension of DIMENSIONS) {
      for (const [name, side] of [
        ["ours", dimension.ours],
        ["hubspot", dimension.hubspot],
      ] as const) {
        expect(side.pros.length, `${dimension.id}.${name} pros`).toBeGreaterThan(0);
        expect(side.cons.length, `${dimension.id}.${name} cons`).toBeGreaterThan(0);
      }
    }
  });

  it("keeps every table cell short enough to scan", () => {
    // The summary is the only thing the table shows before a row is opened. The
    // whole point of the table was that the page had become too much text, so a
    // summary that grows into a sentence quietly undoes it.
    for (const dimension of DIMENSIONS) {
      for (const [name, side] of [
        ["ours", dimension.ours],
        ["hubspot", dimension.hubspot],
      ] as const) {
        expect(side.summary, `${dimension.id}.${name}`).not.toBe("");
        expect(side.summary.length, `${dimension.id}.${name}`).toBeLessThanOrEqual(56);
      }
    }
  });

  it("says every claim twice, and differently", () => {
    // The toggle exists to swap one whole sentence for another. A row where the
    // two are identical is a row somebody forgot to translate.
    for (const dimension of DIMENSIONS) {
      for (const [name, side] of [
        ["ours", dimension.ours],
        ["hubspot", dimension.hubspot],
      ] as const) {
        expect(side.claim.plain, `${dimension.id}.${name}`).not.toBe("");
        expect(side.claim.technical, `${dimension.id}.${name}`).not.toBe("");
        expect(side.claim.plain, `${dimension.id}.${name}`).not.toBe(side.claim.technical);
      }
    }
  });

  it("concedes at least one row to HubSpot", () => {
    // The guard against the page drifting into a sales sheet. Today it is
    // analytics and A/B testing; if both are ever fixed, this test should be
    // changed deliberately, not deleted quietly.
    const conceded = DIMENSIONS.filter((dimension) => dimension.verdict === "hubspot");
    expect(conceded.length).toBeGreaterThan(0);
  });

  it("only uses verdicts that have a label", () => {
    for (const dimension of DIMENSIONS) {
      expect(Object.keys(VERDICT_LABELS), dimension.id).toContain(dimension.verdict);
    }
  });

  it("gives every row a sentence to say out loud", () => {
    for (const dimension of DIMENSIONS) {
      expect(dimension.takeaway, dimension.id).not.toBe("");
      expect(dimension.whyItMatters, dimension.id).not.toBe("");
    }
  });

  it("names sites on both sides, each with a link and a reason", () => {
    expect(OUR_EXAMPLES.length).toBeGreaterThan(0);
    expect(HUBSPOT_EXAMPLES.length).toBeGreaterThan(0);
    for (const example of [...OUR_EXAMPLES, ...HUBSPOT_EXAMPLES]) {
      expect(example.href, example.name).toMatch(/^https:\/\//);
      expect(example.soWhat, example.name).not.toBe("");
      expect(example.runs, example.name).not.toBe("");
    }
  });

  it("keeps the caveat on the examples", () => {
    // The examples section is the one most likely to be screenshotted without
    // its context, so the context is data rather than markup.
    expect(EXAMPLES_CAVEAT).not.toBe("");
  });
});
