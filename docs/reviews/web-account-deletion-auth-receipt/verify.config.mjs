import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../../', import.meta.url));
export default {
  root,
  resolve: { alias: {
    vitest: root + 'packages/core/node_modules/vitest/dist/index.js',
    '@repo/plugin-web-storage': root + 'packages/plugin-web-storage/src/index.ts',
    '@repo/plugin-web-ai-chat': root + 'packages/plugin-web-ai-chat/src/index.ts',
    '@recovery-under-test': root + (process.env.RECEIPT_BEFORE === '1'
      ? 'docs/reviews/web-account-deletion-auth-receipt/recovery-before.ts'
      : 'packages/plugin-web-settings-rest/src/internal/accountDeletionRecovery.ts'),
  } },
  test: { environment: 'jsdom', include: ['docs/reviews/web-account-deletion-auth-receipt/recovery-contract.test.ts'], maxWorkers: 1 },
};
