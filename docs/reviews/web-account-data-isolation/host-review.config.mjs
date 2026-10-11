import { createRequire } from 'node:module';
const require = createRequire(new URL('../../../apps/web/package.json', import.meta.url));
export default {
 resolve: { alias: [
 ...['react/jsx-dev-runtime','react/jsx-runtime','react-dom/client','react-dom','react'].map(name=>({find:name,replacement:require.resolve(name)})),
 {find:'@repo/web-auth-device-session/web',replacement:new URL('../../../packages/web-auth-device-session/src/web.ts',import.meta.url).pathname},
 {find:'@repo/plugin-web-ai-chat',replacement:new URL('../../../packages/plugin-web-ai-chat/src/index.ts',import.meta.url).pathname},
 {find:'@repo/plugin-web-settings-rest',replacement:new URL('../../../packages/plugin-web-settings-rest/src/index.ts',import.meta.url).pathname},
 {find:'react-router',replacement:require.resolve('react-router')},
 {find:'vitest',replacement:require.resolve('vitest/package.json').replace('package.json','dist/index.js')},
 {find:'@repo/plugin-web-storage',replacement:new URL('../../../packages/plugin-web-storage/src/index.ts',import.meta.url).pathname},
 ] },
 test:{environment:'jsdom',include:['../../docs/reviews/web-account-data-isolation/*-review.test.tsx']},
 esbuild:{jsx:'automatic'}
};
