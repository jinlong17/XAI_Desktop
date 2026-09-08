import { resolve } from "node:path";

export default {
  test: {
    environment: "node",
  },
  resolve: {
    alias: [
      { find: "@repo/core-data/testing", replacement: resolve(__dirname, "../core-data/src/testing.ts") },
      { find: "@repo/core/registry", replacement: resolve(__dirname, "../core/src/registry/index.ts") },
      { find: "@repo/core/types", replacement: resolve(__dirname, "../core/src/types/index.ts") },
      { find: "@repo/core/events", replacement: resolve(__dirname, "../core/src/events/index.ts") },
      { find: "@repo/core/hooks", replacement: resolve(__dirname, "../core/src/hooks/index.ts") },
      { find: "@repo/core-data", replacement: resolve(__dirname, "../core-data/src/index.ts") },
      { find: "@repo/core", replacement: resolve(__dirname, "../core/src/index.ts") },
    ],
  },
};
