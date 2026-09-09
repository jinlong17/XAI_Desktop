import {fileURLToPath} from 'node:url';
export default {resolve:{alias:{react:fileURLToPath(new URL('../../../packages/xai-web-tasks/node_modules/react',import.meta.url))}},esbuild:{jsx:'automatic'},test:{environment:'jsdom',include:['docs/reviews/web-save-consumer-inventory/consumer.test.tsx']}};
