import { config as reactInternalConfig } from '@repo/eslint-config/react-internal';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...reactInternalConfig,
  {
    rules: {
      // Prevent any payload definitions from regressing to `any`
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    // Exclude test fixtures from strict rules (they use React.FC patterns)
    files: ['src/__fixtures__/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
