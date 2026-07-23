import { describe, expect, it } from "vitest";
import { findBannedTerms, type BannedTermHit } from "./banned-terms";
import {
  INCLUDES,
  PHRASES,
  TERMS,
  UPGRADE_PHRASES,
  type PhraseVars,
  type UpgradeVars,
} from "./lexicon";
import { copyFor, TRACKS, type Track } from "./index";

/**
 * Sample values for rendering every phrase that takes them. A phrase function
 * reading a var we don't supply here renders "undefined", which the
 * banned-terms scan below would not catch — so keep this in step with the vars
 * the lexicon actually destructures.
 */
const SAMPLE_VARS: PhraseVars = { assessmentName: "Core Cognitive Assessment" };
const SAMPLE_UPGRADE_VARS: UpgradeVars = { credit: "$149.00" };

/** Render every string a track can produce, tagged with where it came from. */
function renderTrack(track: Track): Array<{ location: string; text: string }> {
  const out: Array<{ location: string; text: string }> = [];
  for (const [key, term] of Object.entries(TERMS[track])) {
    out.push({ location: `TERMS.${track}["${key}"].one`, text: term.one });
    out.push({ location: `TERMS.${track}["${key}"].many`, text: term.many });
  }
  for (const key of Object.keys(PHRASES[track])) {
    const value = PHRASES[track][key as keyof (typeof PHRASES)[typeof track]];
    const text =
      typeof value === "function" ? (value as (vars: PhraseVars) => string)(SAMPLE_VARS) : value;
    out.push({ location: `PHRASES.${track}["${key}"]`, text });
  }
  INCLUDES[track].forEach((item, i) => {
    out.push({ location: `INCLUDES.${track}[${i}]`, text: item });
  });
  return out;
}

describe("lexicon shape", () => {
  it("defines the same keys for both tracks", () => {
    expect(Object.keys(TERMS.wellness).sort()).toEqual(Object.keys(TERMS.clinical).sort());
    expect(Object.keys(PHRASES.wellness).sort()).toEqual(Object.keys(PHRASES.clinical).sort());
  });

  it("has no empty strings", () => {
    for (const track of TRACKS) {
      for (const { location, text } of renderTrack(track)) {
        expect(text.trim(), location).not.toBe("");
      }
    }
  });

  it("renders every phrase without leaving an unsubstituted var", () => {
    for (const track of TRACKS) {
      for (const { location, text } of renderTrack(track)) {
        expect(text, location).not.toContain("undefined");
      }
    }
  });
});

/**
 * The compliance guard. Clinical vocabulary on a wellness surface is a claim
 * about what was sold, not a wording preference — see banned-terms.ts.
 */
describe("wellness copy carries no clinical vocabulary", () => {
  it("is clean across every wellness term and phrase", () => {
    const hits: BannedTermHit[] = [];
    for (const { location, text } of renderTrack("wellness")) {
      hits.push(...findBannedTerms(text, location));
    }
    expect(describeHits(hits)).toEqual([]);
  });

  /**
   * Called out separately from the sweep above because this is the slice most
   * likely to acquire clinical language: it renders on a wellness-coded
   * purchase and exists to sell the clinical product.
   */
  it("is clean across the upgrade slice", () => {
    const hits: BannedTermHit[] = [];
    for (const [key, build] of Object.entries(UPGRADE_PHRASES)) {
      hits.push(...findBannedTerms(build(SAMPLE_UPGRADE_VARS), `UPGRADE_PHRASES["${key}"]`));
    }
    expect(describeHits(hits)).toEqual([]);
  });

  it("catches a planted violation", () => {
    // Guards the guard: a scan that silently matched nothing would pass every
    // test above while enforcing nothing at all.
    const hits = findBannedTerms("Your Specialist will review the results.", "planted");
    expect(hits).toHaveLength(1);
    expect(hits[0].match).toBe("Specialist");
  });
});

/** Readable failure output: "PHRASES.wellness[…]: \"Specialist\"". */
function describeHits(hits: BannedTermHit[]): string[] {
  return hits.map((hit) => `${hit.location}: "${hit.match}"`);
}

describe("copyFor", () => {
  it("resolves terms per track, singular and plural", () => {
    expect(copyFor({ track: "clinical" }).term("role.reviewer")).toBe("Specialist");
    expect(copyFor({ track: "clinical" }).term("role.reviewer", { plural: true })).toBe(
      "Specialists",
    );
    expect(copyFor({ track: "wellness" }).term("role.reviewer")).toBe("Brain Health Navigator");
  });

  it("interpolates phrase vars", () => {
    const text = copyFor({ track: "wellness" }).phrase("email.reportReady.body", {
      assessmentName: "Core Cognitive Assessment",
    });
    expect(text).toContain("Core Cognitive Assessment");
  });

  it("defaults canUpgrade to false", () => {
    expect(copyFor({ track: "wellness" }).canUpgrade).toBe(false);
  });
});
