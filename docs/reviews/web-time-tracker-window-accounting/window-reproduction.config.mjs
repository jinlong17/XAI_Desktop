import { fileURLToPath } from 'node:url';
export default { resolve: { alias: { react: fileURLToPath(new URL('../../../packages/plugin-web-time-tracker/node_modules/react', import.meta.url)) } }, esbuild: { jsx: 'automatic' }, test: { environment: 'jsdom', include: ['docs/reviews/web-time-tracker-window-accounting/window-reproduction.test.tsx'] } };
