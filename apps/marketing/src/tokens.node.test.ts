import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Structural guard for `@pbh/tokens/theme.css`.
 *
 * Tailwind 4 generates utilities from the `@theme inline` block, not from
 * `:root`. The two are a hand-maintained duplicate of each other, and a token
 * declared in `:root` but missing from the mirror fails **silently** — the
 * utility simply isn't emitted, so `bg-brand-default` renders as nothing at all
 * and the class in the source looks perfectly correct in review.
 *
 * That has already happened twice (`--color-primary-fixed`,
 * `--color-secondary-fixed-dim`). This test is what makes the duplication
 * checkable rather than merely disciplined, which matters most right now: the
 * Figma sync roughly doubles the token count.
 *
 * It only proves the *declaration* is present. Whether Tailwind actually emits
 * the utility is proved by the token swatch story, which measures computed
 * styles in a real browser.
 */
const THEME_CSS = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../packages/tokens/theme.css",
);

/** Token families Tailwind turns into utilities, and that the mirror must carry. */
const MIRRORED_PREFIXES = ["--color-", "--text-", "--radius-", "--shadow-"];

interface Theme {
  root: Map<string, string>;
  /** name → the raw declaration value, so a typo'd `var()` target is visible. */
  mirror: Map<string, string>;
  /** Names declared twice in the same block, in either block. */
  duplicates: string[];
}

/**
 * Split the file into its `:root` and `@theme inline` blocks and collect the
 * custom-property declarations in each. Brace counting rather than a regex over
 * the whole file: the two blocks are siblings, and a `{` inside a comment would
 * otherwise throw the boundaries off.
 */
function parseTheme(css: string): Theme {
  const blockBody = (opener: RegExp): string => {
    const match = opener.exec(css);
    if (!match) {
      throw new Error(`theme.css has no ${opener} block`);
    }
    let depth = 0;
    const start = css.indexOf("{", match.index);
    for (let i = start; i < css.length; i += 1) {
      if (css[i] === "{") {
        depth += 1;
      } else if (css[i] === "}") {
        depth -= 1;
        if (depth === 0) {
          return css.slice(start + 1, i);
        }
      }
    }
    throw new Error(`theme.css has an unclosed ${opener} block`);
  };

  const declarations = (body: string): Map<string, string> => {
    // Strip comments first — several token comments quote example declarations.
    const stripped = body.replace(/\/\*[\s\S]*?\*\//g, "");
    const found = new Map<string, string>();
    for (const line of stripped.split("\n")) {
      const decl = /^\s*(--[a-z0-9-]+)\s*:\s*(.+?);/i.exec(line);
      if (decl) {
        // Last-wins, matching CSS. `duplicates` below is what notices.
        found.set(decl[1], decl[2].trim());
      }
    }
    return found;
  };

  const rootBody = blockBody(/:root\s*\{/);
  const mirrorBody = blockBody(/@theme\s+inline\s*\{/);
  return {
    root: declarations(rootBody),
    mirror: declarations(mirrorBody),
    duplicates: [...duplicated(rootBody), ...duplicated(mirrorBody)],
  };
}

/**
 * Names declared more than once in a block. CSS takes the last, so a duplicate
 * is not an error — but it means two places claim to own the token and only one
 * of them is read, which is how a value silently stops tracking its comment.
 */
function duplicated(body: string): string[] {
  const stripped = body.replace(/\/\*[\s\S]*?\*\//g, "");
  const counts = new Map<string, number>();
  for (const line of stripped.split("\n")) {
    const decl = /^\s*(--[a-z0-9-]+)\s*:/i.exec(line);
    if (decl) {
      counts.set(decl[1], (counts.get(decl[1]) ?? 0) + 1);
    }
  }
  return [...counts.entries()].filter(([, n]) => n > 1).map(([name]) => name);
}

const isMirrored = (name: string) =>
  MIRRORED_PREFIXES.some((prefix) => name.startsWith(prefix));

describe("theme.css @theme inline mirror", () => {
  const { root, mirror, duplicates } = parseTheme(readFileSync(THEME_CSS, "utf8"));

  it("declares each token exactly once per block", () => {
    expect(duplicates).toEqual([]);
  });

  it("declares tokens to mirror at all", () => {
    // Guards the parser itself: a refactor that renames the blocks would
    // otherwise make every assertion below pass vacuously.
    expect([...root.keys()].filter(isMirrored).length).toBeGreaterThan(20);
  });

  it("mirrors every :root token into @theme inline", () => {
    const missing = [...root.keys()].filter(
      (name) => isMirrored(name) && !mirror.has(name),
    );
    expect(missing).toEqual([]);
  });

  it("mirrors nothing that :root does not declare", () => {
    // The reverse miss: a mirror left behind for a deleted token emits a
    // utility whose value is an undefined variable.
    const orphaned = [...mirror.keys()].filter(
      (name) => isMirrored(name) && !root.has(name),
    );
    expect(orphaned).toEqual([]);
  });

  it("points every mirror at its own :root variable", () => {
    // `--color-brand-default: var(--color-brand-defualt)` is silent too.
    const misdirected = [...mirror.entries()]
      .filter(([name]) => isMirrored(name))
      .filter(([name, value]) => value !== `var(${name})`)
      .map(([name, value]) => `${name}: ${value}`);
    expect(misdirected).toEqual([]);
  });
});
