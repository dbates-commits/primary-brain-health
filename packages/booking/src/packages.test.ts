import { describe, expect, it } from "vitest";
import { findBannedTerms, type BannedTermHit } from "@pbh/copy";
import { ASSESSMENT_PACKAGES, DEFAULT_PACKAGE_KEY } from "./packages";
import { TRACK_BY_PACKAGE, trackForPackage } from "./track";

/**
 * The compliance guard, applied where the deliverables actually live.
 *
 * `@pbh/copy` sweeps its own lexicon, but the card bullets a customer reads
 * before paying are `ASSESSMENT_PACKAGES[].includes` — the highest-stakes copy
 * in the system, since it is the promise the charge is made against. Clinical
 * vocabulary on a wellness package is a claim about what was sold, not a
 * wording preference (see banned-terms.ts).
 */
describe("wellness packages carry no clinical vocabulary", () => {
  const wellnessPackages = ASSESSMENT_PACKAGES.filter(
    (pkg) => trackForPackage(pkg.key) === "wellness",
  );

  it("has at least one wellness package to check", () => {
    // Guards the guard: a filter that matched nothing would pass the sweep
    // below while enforcing nothing at all.
    expect(wellnessPackages.length).toBeGreaterThan(0);
  });

  it("is clean across every wellness package's customer-facing copy", () => {
    const hits: BannedTermHit[] = [];
    for (const pkg of wellnessPackages) {
      const fields: Array<[string, string]> = [
        ["name", pkg.name],
        ["ctaLabel", pkg.ctaLabel],
        ...pkg.includes.map(
          (item, i): [string, string] => [`includes[${i}]`, item.text],
        ),
      ];
      for (const [field, text] of fields) {
        hits.push(...findBannedTerms(text, `${pkg.key}.${field}`));
      }
    }
    expect(hits.map((hit) => `${hit.location}: "${hit.match}"`)).toEqual([]);
  });
});

describe("trackForPackage", () => {
  it("maps every package to a track", () => {
    for (const pkg of ASSESSMENT_PACKAGES) {
      expect(TRACK_BY_PACKAGE[pkg.key], pkg.key).toBeDefined();
    }
  });

  it("falls back to the default package's track for null and unknown keys", () => {
    // Rows written before packages existed have a null `package_key` and are
    // all the default package — see the note on `trackForPackage`.
    const fallback = TRACK_BY_PACKAGE[DEFAULT_PACKAGE_KEY];
    expect(trackForPackage(null)).toBe(fallback);
    expect(trackForPackage(undefined)).toBe(fallback);
    expect(trackForPackage("premium")).toBe(fallback);
  });
});
