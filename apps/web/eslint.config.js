import { config as reactInternalConfig } from "@repo/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...reactInternalConfig,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: ["@tauri-apps/*"],
          paths: [
            {
              name: "@repo/plugin-console",
              message: "Use @repo/plugin-console/web to avoid desktop-only transitive imports in apps/web.",
            },
            {
              name: "@repo/web-auth-device-session",
              message: "Use @repo/web-auth-device-session/web to keep apps/web on browser-safe exports.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        process: "readonly",
      },
    },
  },
];
