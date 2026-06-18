import { defineConfig, globalIgnores } from "eslint/config";
import astro from "astro-eslint-parser";
import tsEslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    "dist/**",
    ".astro/**",
    "node_modules/**",
  ]),
  ...tsEslint.configs.recommended(),
  {
    files: ["**/*.astro"],
    languageOptions: {
      parser: astro,
      parserOptions: {
        parser: tsEslint.parser,
        sourceType: "module",
      },
    },
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsEslint.parser,
    },
  },
]);
