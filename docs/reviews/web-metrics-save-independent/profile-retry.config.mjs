import {fileURLToPath} from 'node:url';
export default {resolve:{alias:{react:fileURLToPath(new URL('../../../packages/plugin-web-metric-tracker/node_modules/react',import.meta.url))}},esbuild:{jsx:'automatic'},test:{environment:'jsdom',include:['docs/reviews/web-metrics-save-independent/profile-retry.test.tsx']}};
