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
 *
 * Phase 5 security hardening: sourcemaps are DISABLED for the admin production
 * build. The admin surface ships to its own public Cloudflare Pages origin; a
 * sourcemap embeds full original source (comments, fixtures, test-pattern
 * strings) and, even when "hidden" (emitted but unreferenced), the `.map` file
 * is still fetchable from that public origin — an unnecessary information-
 * disclosure surface for an admin control plane. Disabling emission removes the
 * artifact entirely and lets the TT-NO-SECRET-BUNDLE guard scan dist/** uniformly.
 */
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
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
