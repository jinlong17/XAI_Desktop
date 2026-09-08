import { config as reactInternalConfig } from "@repo/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...reactInternalConfig,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      // Allow intentionally-unused variables that start with "_" (common in
      // for-await loops where we only want the side-effect of consuming the
      // iterator, e.g. `for await (const _c of stream) { ... }`).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "after-used",
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
