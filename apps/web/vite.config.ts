import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Vite plugin — strips __XAI_CSP_NONCE__ placeholders from index.html at
 * build time (xai-web-deploy-cloudflare P2 Decision 3 Candidate A.1).
 *
 * Under Cloudflare Pages static hosting, no per-request nonce is injected.
 * The CSP is delivered via apps/web/public/_headers instead.
 * readRuntimeNonce() in nonce.ts gracefully returns null when no nonce
 * attribute or meta tag is present — no runtime error.
 *
 * AC-C3-1: dist/index.html must not contain __XAI_CSP_NONCE__ after build.
 * AC-C3-4: mechanism emits a log line confirming substitution happened.
 */
function stripCspNoncePlaceholder() {
  return {
    name: "strip-csp-nonce-placeholder",
    transformIndexHtml(html: string) {
      const PLACEHOLDER = "__XAI_CSP_NONCE__";
      if (html.includes(PLACEHOLDER)) {
        console.log(
          "[strip-csp-nonce-placeholder] Removing nonce placeholders from index.html (static deploy — Decision 3 Candidate A.1)"
        );
        return html
          .replace(/\s*data-csp-nonce="[^"]*"/g, "")
          .replace(new RegExp(PLACEHOLDER, "g"), "")
          .replace(/<meta\s+name="xai-csp-nonce"[^>]*>/g, "");
      }
      return html;
    },
  };
}

export default defineConfig({
  plugins: [react(), stripCspNoncePlaceholder()],
  build: {
    sourcemap: "hidden",
    // Enable Vite manifest so BM-BUNDLE tests can assert real chunk split.
    // Generates dist/.vite/manifest.json after `pnpm build`.
    // Verify B5: gap-closure row #6 bundle-budget acceptance gate.
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
            return "vendor-react";
          }
          if (id.includes("node_modules/react-router")) {
            return "vendor-router";
          }
          if (id.includes("node_modules/@sentry") || id.includes("node_modules/web-vitals")) {
            return "vendor-observability";
          }
          if (id.includes("/packages/plugin-web-ai-chat/")) {
            return "feature-ai-chat";
          }
          if (id.includes("/packages/plugin-web-board-views/src/MapView.tsx")) {
            return "map-view";
          }
          if (
            id.includes("/packages/plugin-web-board-core/") ||
            id.includes("/packages/plugin-web-board-views/") ||
            id.includes("/packages/plugin-web-board-workspaces/") ||
            id.includes("/packages/xai-web-tasks/") ||
            id.includes("/packages/xai-web-calendar/") ||
            id.includes("/packages/xai-web-matrix/")
          ) {
            return "feature-board-planning";
          }
          if (
            id.includes("/packages/plugin-web-dashboard-grid/") ||
            id.includes("/packages/plugin-web-dashboard-widgets/")
          ) {
            return "feature-dashboard";
          }
          if (
            id.includes("/packages/plugin-web-time-tracker/") ||
            id.includes("/packages/plugin-web-bookkeeping/") ||
            id.includes("/packages/plugin-web-metric-tracker/") ||
            id.includes("/packages/xai-web-cmdk/") ||
            id.includes("/packages/plugin-web-pet/")
          ) {
            return "feature-utilities";
          }
          if (id.includes("/packages/web-auth-device-session/")) {
            return "feature-auth";
          }
          if (
            id.includes("/packages/plugin-web-settings-shell/") ||
            id.includes("/packages/plugin-web-settings-features-panel/") ||
            id.includes("/packages/plugin-web-settings-appearance/") ||
            id.includes("/packages/plugin-web-settings-rest/")
          ) {
            return "feature-settings";
          }
          if (
            id.includes("/packages/plugin-web-pomodoro/") ||
            id.includes("/packages/plugin-web-habits/") ||
            id.includes("/packages/plugin-web-meditation/") ||
            id.includes("/packages/plugin-web-countdown/") ||
            id.includes("/packages/plugin-web-statistics/")
          ) {
            return "feature-wellbeing";
          }
        },
      },
    },
  },
});
