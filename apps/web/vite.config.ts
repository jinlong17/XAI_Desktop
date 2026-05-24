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
  },
});
