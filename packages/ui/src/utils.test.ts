import { describe, expect, it } from "vitest";
import { TYPE_SCALE, cn } from "./utils";

/**
 * `cn()`'s font-size registration, which fails silently when wrong.
 *
 * One assertion is not enough, and not every assertion here discriminates. The
 * two that do are "a named size survives next to a colour" and "a stock size
 * loses to a named size": without the registration both named classes read as
 * colours, so the first drops the size and the second stops conflicting at all.
 * Size-vs-size passes either way — two colours also resolve last-wins — so it
 * documents the intent rather than guarding it.
 */
describe("cn", () => {
  it("keeps a named size and a colour together", () => {
    // The regression: `text-caption` used to fall into the colour group and be
    // dropped by `text-text-default`.
    expect(cn("text-caption", "text-text-default")).toBe(
      "text-caption text-text-default",
    );
  });

  it("resolves two named sizes to the last one", () => {
    // Documents intent; does not discriminate on its own (two unrecognised
    // classes would resolve last-wins as colours and pass anyway).
    expect(cn("text-caption", "text-body")).toBe("text-body");
  });

  it("resolves two colours to the last one", () => {
    expect(cn("text-text-default", "text-text-secondary")).toBe(
      "text-text-secondary",
    );
  });

  it("still resolves stock Tailwind sizes against named ones", () => {
    // Discriminating: unregistered, `text-body-lg` is a colour and does not
    // conflict with `text-sm`, so both would survive.
    expect(cn("text-sm", "text-body-lg")).toBe("text-body-lg");
  });

  it("registers every step of the scale", () => {
    // Catches a step present in TYPE_SCALE but rejected by the merge config.
    for (const step of TYPE_SCALE) {
      expect(cn(`text-${step}`, "text-body")).toBe("text-body");
    }
  });
});
