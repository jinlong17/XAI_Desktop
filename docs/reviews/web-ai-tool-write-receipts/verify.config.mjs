import { fileURLToPath } from 'node:url';
const path = value => fileURLToPath(new URL(value, import.meta.url));
export default {
  resolve: { alias: { react: path('../../../packages/xai-web-tasks/node_modules/react'), '@testing-library/react': path('../../../packages/xai-web-tasks/node_modules/@testing-library/react') } },
  esbuild: { jsx: 'automatic' },
  test: {globals:true, environment: 'jsdom', setupFiles: [path('../../../packages/xai-web-tasks/vitest.setup.ts')], include: ['docs/reviews/web-ai-tool-write-receipts/save-contract.test.tsx'] },
};
