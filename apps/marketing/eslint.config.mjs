// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";
import { defineConfig, globalIgnores } from "eslint/config";

import base from "@pbh/config/eslint/base";

const eslintConfig = defineConfig([
  ...base,
  // Tina CMS generated/config files — marketing-specific ignores.
  globalIgnores(["tina/__generated__/**", "tina/config.ts"]),
  ...storybook.configs["flat/recommended"],
]);

export default eslintConfig;
