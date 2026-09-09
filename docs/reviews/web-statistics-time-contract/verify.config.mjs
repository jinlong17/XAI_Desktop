import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../../', import.meta.url));
export default {
  root,
  resolve: { alias: { vitest: root + 'packages/plugin-web-statistics/node_modules/vitest/dist/index.js' } },
  test: { environment: 'node', include: ['docs/reviews/web-statistics-time-contract/reproduction.test.ts'], maxWorkers: 1 },
};
