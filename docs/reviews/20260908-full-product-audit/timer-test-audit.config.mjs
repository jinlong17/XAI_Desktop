import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../../', import.meta.url));
export default {
  root,
  resolve: { alias: {
    'vitest': root + 'packages/plugin-web-time-tracker/node_modules/vitest/dist/index.js',
    '@testing-library/react': root + 'packages/plugin-web-time-tracker/node_modules/@testing-library/react/dist/index.js',
  } },
  test: { environment: 'jsdom', include: ['docs/reviews/20260908-full-product-audit/timer-test-audit.test.ts'], maxWorkers: 1 }
};
