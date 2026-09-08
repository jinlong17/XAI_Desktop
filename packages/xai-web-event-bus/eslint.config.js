import { config as reactInternalConfig } from '@repo/eslint-config/react-internal';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...reactInternalConfig,
  {
    rules: {
      // Prevent any payload definitions from regressing to `any`
      '@typescript-eslint/no-explicit-any': 'error',
      // Public-surface boundary: only `./index.ts` is the allowed entry point.
      // Consumers outside the package must NOT deep-import src/internal/**,
      // src/__fixtures__/**, or any other subpath. This is the lint companion
      // to the structural enforcement provided by package.json `exports`.
      // See packages/xai-web-event-bus/docs/api.md §"Public Surface".
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@repo/xai-web-event-bus/src/*',
                '@repo/xai-web-event-bus/src/internal/*',
                '@repo/xai-web-event-bus/src/__fixtures__*',
              ],
              message:
                'Deep imports from @repo/xai-web-event-bus are forbidden. Import from the package root only (see api.md §"Public Surface").',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
];
