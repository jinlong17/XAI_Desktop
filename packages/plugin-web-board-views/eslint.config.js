import { config as reactInternalConfig } from "@repo/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...reactInternalConfig,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@repo/plugin-web-board-core/*/internal*", "@repo/plugin-web-board-core/src/internal*"],
              message: "Import from @repo/plugin-web-board-core barrel (index.ts) only. Direct internal imports are forbidden.",
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
