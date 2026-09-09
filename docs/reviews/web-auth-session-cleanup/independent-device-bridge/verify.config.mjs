import { fileURLToPath } from 'node:url';
export default { resolve: { alias: { react: fileURLToPath(new URL('../../../../packages/web-auth-device-session/node_modules/react', import.meta.url)) } }, esbuild: { jsx: 'automatic' }, test: { environment: 'jsdom', include: ['docs/reviews/web-auth-session-cleanup/independent-device-bridge/reproduction.test.tsx'] } };
