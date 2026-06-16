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
]);

export default base;
