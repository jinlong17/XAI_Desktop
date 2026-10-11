import { fileURLToPath } from 'node:url';
const path = value => fileURLToPath(new URL(value, import.meta.url));
export default {
  resolve: { alias: { react: path('../../../packages/plugin-web-ai-chat/node_modules/react'), '@testing-library/react': path('../../../packages/plugin-web-ai-chat/node_modules/@testing-library/react') } },
  esbuild: { jsx: 'automatic' },
  test: { environment: 'jsdom', setupFiles: [path('../../../packages/plugin-web-ai-chat/vitest.setup.ts')], include: ['docs/reviews/web-ai-calendar-invalid-date/*.test.tsx'] },
};
