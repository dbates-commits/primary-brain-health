import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { findBannedTerms, type BannedTermHit } from "@pbh/copy";
import { MODAL_STEPS } from "../src/components/booking/steps";

/**
 * Compliance guard for the CMS-authored booking-modal step headers.
 *
 * `ui.validate` on the Modals collection (tina/collections/modals.ts) stops an
 * editor saving clinical vocabulary through the admin form. That runs in the
 * browser, so it never sees a hand-edited JSON file, and it never sees a
 * TinaCloud save either — those land on the branch as a commit with no PR. This
 * sweep is the layer that does.
 *
 * Scope is deliberately narrow: the Modals documents, nothing else. The rest of
 * the marketing copy legitimately fails today ("Book Your Brain Health
 * Consultation" in home.mdx) and rewriting it is a copy decision tracked
 * separately — see docs/track-copy-mapping.md.
 */
const MODALS_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "modals",
);

/**
 * The fields an editor can write that a customer then reads, and that the
 * wellness vocabulary rule applies to. `step` is the admin's own list label and
 * `termsVersion` is an identifier — neither is prose a customer reads.
 *
 * `terms` is deliberately absent: legal text needs the clinical words in order
 * to disclaim them ("this is not medical treatment"), so it carries no
 * banned-terms guard in the admin either. Sweeping it here would fail the build
 * over wording the CMS accepts.
 */
const EDITABLE_FIELDS = ["title", "subtitle"] as const;

/** Which template each document must declare, since it decides its fields. */
const TEMPLATE_BY_STEP: Record<string, string> = {
  confirm: "step",
  details: "step",
  consent: "consentStep",
  payment: "step",
};

function documentFiles(): string[] {
  return readdirSync(MODALS_DIR).filter((file) => file.endsWith(".json"));
}

/** Every CMS-authored modal string on disk, tagged with where it came from. */
function modalCopy(): Array<{ location: string; text: string }> {
  const found: Array<{ location: string; text: string }> = [];
  for (const file of documentFiles()) {
    const document: Record<string, unknown> = JSON.parse(
      readFileSync(path.join(MODALS_DIR, file), "utf8"),
    );
    for (const field of EDITABLE_FIELDS) {
      const value = document[field];
      if (typeof value === "string" && value.trim() !== "") {
        found.push({ location: `${file}: ${field}`, text: value });
      }
    }
  }
  return found;
}

/** `consent.json: subtitle: "consultation"` — readable on failure. */
function describeHits(hits: BannedTermHit[]): string[] {
  return hits.map((hit) => `${hit.location}: "${hit.match}"`);
}

describe("booking modal step headers", () => {
  it("use no clinical vocabulary", () => {
    const hits: BannedTermHit[] = [];
    for (const { location, text } of modalCopy()) {
      hits.push(...findBannedTerms(text, location));
    }
    expect(describeHits(hits)).toEqual([]);
  });

  it("catches a planted violation", () => {
    // Guards the guard, as lexicon.test.ts does: a sweep whose matcher had
    // stopped matching would pass the test above while enforcing nothing.
    const hits = findBannedTerms(
      "Book your consultation with a Specialist.",
      "planted",
    );
    expect(describeHits(hits)).toEqual([
      'planted: "Specialist"',
      'planted: "consultation"',
    ]);
  });

  it("has one document per modal step", () => {
    // The other half of guarding the guard — and the drift guard for the step
    // names. Every field starts empty, so without this the sweep above would
    // pass vacuously forever if the directory moved or a file were renamed.
    // It also fails if a step is added to MODAL_STEPS without its document,
    // which would leave the flow with a step nothing can title.
    const onDisk = documentFiles().map((file) => file.replace(/\.json$/, ""));
    expect(onDisk.sort()).toEqual([...MODAL_STEPS].sort());
  });

  it("declares the right template on each document", () => {
    // The template decides which fields the admin offers, so a wrong value
    // here doesn't fail loudly — it just quietly removes the consent terms
    // field from the only step that has one.
    const declared = Object.fromEntries(
      documentFiles().map((file) => [
        file.replace(/\.json$/, ""),
        JSON.parse(readFileSync(path.join(MODALS_DIR, file), "utf8"))._template,
      ]),
    );
    expect(declared).toEqual(TEMPLATE_BY_STEP);
  });
});
