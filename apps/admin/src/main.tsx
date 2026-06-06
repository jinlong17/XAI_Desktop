/**
 * apps/admin — Admin Dashboard entry point.
 *
 * This surface is physically isolated from apps/web.
 * It has its own package.json, vite.config.ts, wrangler.toml, and _headers CSP.
 * It is NOT mounted in the apps/web module rail.
 *
 * ADR-lite #1: separate Cloudflare Pages project + own _headers CSP (design.md).
 * Auth posture: mock-authenticated (slice #1, design.md assumption #3).
 * D3 = W0 (web-only); no dev promotion.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("[admin] Root element #root not found in index.html");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
