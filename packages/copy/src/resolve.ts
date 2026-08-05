/**
 * Resolve a `CopyContext` into the words a surface should render.
 *
 * Every consumer takes its context explicitly — as a prop, an argument, or a
 * value read from the request. There is deliberately no module-level default
 * and no ambient React context fallback: a missing track should be a type
 * error at the call site, never a silent render of the wrong product's
 * vocabulary.
 */
import {
  PHRASES,
  TERMS,
  UPGRADE_PHRASES,
  type PhraseKey,
  type PhraseVars,
  type TermKey,
  type UpgradePhraseKey,
  type UpgradeVars,
} from "./lexicon";
import type { CopyContext, Track } from "./track";

export interface Copy {
  track: Track;
  canUpgrade: boolean;
  /** A noun for inline use, e.g. `term("role.reviewer")` → "Specialist". */
  term(key: TermKey, opts?: { plural?: boolean }): string;
  /** A whole sentence, with any interpolated values. */
  phrase(key: PhraseKey, vars?: PhraseVars): string;
  /**
   * Upgrade-path copy. Only meaningful when `canUpgrade` — callers should gate
   * on that flag rather than calling this and inspecting the result.
   */
  upgradePhrase(key: UpgradePhraseKey, vars: UpgradeVars): string;
}

export function copyFor(context: CopyContext): Copy {
  const { track, canUpgrade = false } = context;
  return {
    track,
    canUpgrade,
    term(key, opts) {
      const entry = TERMS[track][key];
      return opts?.plural ? entry.many : entry.one;
    },
    phrase(key, vars) {
      const value = PHRASES[track][key];
      return typeof value === "function" ? value(vars ?? {}) : value;
    },
    upgradePhrase(key, vars) {
      return UPGRADE_PHRASES[key](vars);
    },
  };
}
