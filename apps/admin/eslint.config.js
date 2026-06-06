import { config as reactInternalConfig } from "@repo/eslint-config/react-internal";

/**
 * apps/admin/eslint.config.js — ESLint 9 flat config (row #6 RR-1, clears task_1a68bff9).
 *
 * Mirrors apps/web/eslint.config.js: extends the shared `@repo/eslint-config/react-internal`
 * preset (which pulls base.js → `dist/**` ignore + the `only-warn` plugin + typescript-eslint +
 * react/react-hooks). Before this file existed, `pnpm --filter @repo/admin lint` had no config and
 * could not run; now it runs and is green at `--max-warnings 0`.
 *
 * Discipline (design.md D4 / R1): any rule a shipped admin file trips is resolved with a SCOPED
 * `files`-targeted override or a justified inline disable — never a global rule-off. A finding that
 * implies a real bug is fixed in code, not suppressed.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export default [
  ...reactInternalConfig,
];
