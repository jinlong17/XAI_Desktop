import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@repo/core/hooks": resolve(__dirname, "../core/src/hooks/index.ts"),
      "@repo/core/registry": resolve(__dirname, "../core/src/registry/index.ts"),
      "@repo/core/types": resolve(__dirname, "../core/src/types/index.ts"),
      "@repo/ui/icons": resolve(__dirname, "../ui/src/icons.tsx"),
      "@repo/ui/tokens": resolve(__dirname, "../ui/src/tokens.ts"),
    },
  },
});
