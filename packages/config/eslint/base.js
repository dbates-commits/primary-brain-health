// Shared ESLint flat-config base for all PBH apps.
// Apps spread this and append app-specific plugins (e.g. Storybook).
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/** Base config shared across apps in the monorepo. */
export const base = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Always require braces on control statements — no single-line/braceless
      // `if`s. See the Code Style section in CLAUDE.md.
      curly: ["error", "all"],
    },
  },
]);

export default base;
