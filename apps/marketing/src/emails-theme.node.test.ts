import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Keeps `@pbh/emails`' colour mirror honest.
 *
 * Email clients cannot read CSS custom properties, so `packages/emails/src/theme.ts`
 * repeats a dozen token values as literal hex. That duplication used to be held
 * together by a comment — "if a token changes there, update it here too" — with
 * nothing to notice when it didn't. A drift shows up only as a slightly wrong
 * colour in a customer's inbox, which nobody diffs.
 *
 * Each entry now carries an `@token --color-x` annotation. This reads them back
 * out, resolves the variable through theme.css (following `var()` aliases), and
 * asserts the hex still matches.
 *
 * It deliberately does NOT require every token to be mirrored — emails need a
 * dozen values, not a hundred. It requires that the ones claimed are real.
 *
 * `theme.ts` is read as text rather than imported: `emailColors` is internal to
 * `@pbh/emails` and exporting it from the package index just to test it would
 * widen the public surface for no caller's benefit. The map is literal hex, so
 * the source and the runtime value are the same thing.
 */
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const THEME_CSS = path.join(ROOT, "../../../packages/tokens/theme.css");
const EMAIL_THEME = path.join(ROOT, "../../../packages/emails/src/theme.ts");

/** name → declared value, comments stripped. */
function themeVariables(): Map<string, string> {
  const css = readFileSync(THEME_CSS, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const root = css.slice(css.indexOf(":root"), css.indexOf("@theme inline"));
  const vars = new Map<string, string>();
  for (const line of root.split("\n")) {
    const decl = /^\s*(--[a-z0-9-]+)\s*:\s*(.+?);/i.exec(line);
    if (decl) {
      vars.set(decl[1], decl[2].trim());
    }
  }
  return vars;
}

/** Follow `var()` aliases down to the literal hex. */
function resolve(vars: Map<string, string>, name: string): string | null {
  let value = vars.get(name);
  for (let hops = 0; value && hops < 10; hops += 1) {
    const alias = /^var\((--[a-z0-9-]+)\)$/i.exec(value);
    if (!alias) {
      return value.toLowerCase();
    }
    value = vars.get(alias[1]);
  }
  return value ? value.toLowerCase() : null;
}

interface EmailEntry {
  key: string;
  hex: string;
  /** The `--color-*` its JSDoc claims, or null when it carries no annotation. */
  token: string | null;
}

/** Every key in the `emailColors` literal, with its hex and its annotation. */
function emailEntries(): EmailEntry[] {
  const src = readFileSync(EMAIL_THEME, "utf8");
  const start = src.indexOf("export const emailColors");
  const block = src.slice(start, src.indexOf("} as const;", start));
  const entries: EmailEntry[] = [];
  let pending: string | null = null;
  for (const line of block.split("\n")) {
    const annotation = /@token\s+(--[a-z0-9-]+)/.exec(line);
    if (annotation) {
      pending = annotation[1];
      continue;
    }
    const decl = /^\s*([A-Za-z0-9_]+)\s*:\s*"(#[0-9a-fA-F]{3,8})"/.exec(line);
    if (decl) {
      entries.push({ key: decl[1], hex: decl[2].toLowerCase(), token: pending });
      pending = null;
    }
  }
  return entries;
}

describe("emailColors mirrors theme.css", () => {
  const vars = themeVariables();
  const entries = emailEntries();

  it("finds the entries at all", () => {
    // Guards the parser: a reformat that defeated the regex would otherwise
    // make every assertion below pass over an empty list.
    expect(entries.length).toBeGreaterThan(8);
  });

  it("annotates every entry", () => {
    // An entry with no `@token` is invisible to the checks below, which would
    // let its value drift while this file still reports green.
    expect(entries.filter((e) => !e.token).map((e) => e.key)).toEqual([]);
  });

  it("names a variable that exists", () => {
    const missing = entries
      .filter((e) => e.token && !vars.has(e.token))
      .map((e) => `${e.key} → ${e.token}`);
    expect(missing).toEqual([]);
  });

  it("matches the value theme.css resolves to", () => {
    const drifted = entries
      .filter((e) => e.token)
      .map((e) => ({ ...e, theme: resolve(vars, e.token as string) }))
      .filter((e) => e.hex !== e.theme)
      .map((e) => `${e.key}: ${e.hex} but ${e.token} is ${e.theme}`);
    expect(drifted).toEqual([]);
  });
});
