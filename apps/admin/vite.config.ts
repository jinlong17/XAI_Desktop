import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * apps/admin/vite.config.ts
 *
 * Isolated admin surface build target — separate from apps/web.
 * Deploy boundary: own Cloudflare Pages project (see wrangler.toml).
 * CSP: delivered via public/_headers (see ADR-lite #1 in design.md).
 *
 * ADR-lite #1 (deploy/CSP isolation):
 *   Separate Vite app + own Cloudflare Pages project + own public/_headers CSP.
 *   This is a clean extension of ADR-0008's mechanism, NOT an amendment to
 *   apps/web's _headers content. The admin _headers carries a tighter CSP:
 *   connect-src 'self' only (no provider/OAuth/Stripe/OSM origins this slice).
 *   ADR-0008 §S6 extension protocol applies to the admin _headers too.
 *
 * No nonce-strip plugin needed for Phase 1 (no CSP nonce placeholder used).
 */
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: "hidden",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom")
          ) {
            return "vendor-react";
          }
          if (id.includes("node_modules/react-router")) {
            return "vendor-router";
          }
        },
      },
    },
  },
});
