import { fileURLToPath } from 'node:url';
const path = value => fileURLToPath(new URL(value, import.meta.url));
export default {
  resolve: { alias: { react: path('../../../packages/plugin-web-board-workspaces/node_modules/react'), '@testing-library/react': path('../../../packages/plugin-web-board-workspaces/node_modules/@testing-library/react') } },
  esbuild: { jsx: 'automatic' },
  test: { environment: 'jsdom', setupFiles: [path('../../../packages/plugin-web-board-workspaces/vitest.setup.ts')], include: ['docs/reviews/web-board-workspace-save-fix/save-contract.test.tsx'] },
};
