/**
 * build-manifest.test.ts — BM-BUNDLE-1 + BM-BUNDLE-2
 *
 * Verifies the Vite build manifest contains a separate MapView chunk (HC5
 * lazy-load) and that the chunk file size is below the 80KB budget.
 *
 * HC5: MapView is lazy-loaded via React.lazy + dynamic import so it does NOT
 * bloat the initial bundle (ADR-0008 §S4 FA-15; gap-closure row #6 P5 + P6).
 *
 * These tests are skipped when the build artifact is absent (dev workflow).
 * They are intended to run in CI after `pnpm --filter @repo/web build`.
 *
 * Test strategy: packages/plugin-web-board-views/docs/test.md §S15.6
 */
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, statSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// apps/web/src/__tests__/ → apps/web/dist/.vite/manifest.json
const MANIFEST_PATH = resolve(__dirname, "../../dist/.vite/manifest.json");
const DIST_PATH = resolve(__dirname, "../../dist");

const BUDGET_BYTES = 80 * 1024; // 80 KB

describe("Vite build manifest — MapView chunk budget (HC5)", () => {
  it("BM-BUNDLE-1: MapView chunk exists as a separate JS file in the build manifest", () => {
    if (!existsSync(MANIFEST_PATH)) {
      console.warn(
        "BM-BUNDLE-1 SKIPPED: dist/.vite/manifest.json not found. Run `pnpm --filter @repo/web build` first.",
      );
      // Skip gracefully in dev workflow
      return;
    }
    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf-8")) as Record<
      string,
      { file: string; isEntry?: boolean }
    >;
    // Find any chunk key that references MapView
    const mapViewEntry = Object.entries(manifest).find(
      ([key]) => key.includes("MapView") || key.includes("map-view"),
    );
    expect(
      mapViewEntry,
      "MapView chunk not found in build manifest. Ensure the React.lazy() split in packages/plugin-web-board-views/src/index.ts is effective.",
    ).toBeDefined();
  });

  it("BM-BUNDLE-2: MapView chunk file size is below 80 KB budget", () => {
    if (!existsSync(MANIFEST_PATH)) {
      console.warn(
        "BM-BUNDLE-2 SKIPPED: dist/.vite/manifest.json not found. Run `pnpm --filter @repo/web build` first.",
      );
      return;
    }
    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf-8")) as Record<
      string,
      { file: string; isEntry?: boolean }
    >;
    // Find all chunks that contain MapView
    const mapViewEntries = Object.entries(manifest).filter(
      ([key]) => key.includes("MapView") || key.includes("map-view"),
    );
    if (mapViewEntries.length === 0) {
      // Test BM-BUNDLE-1 already fails — no need to fail again here
      return;
    }
    for (const [, entry] of mapViewEntries) {
      const filePath = resolve(DIST_PATH, entry.file);
      if (!existsSync(filePath)) continue;
      const size = statSync(filePath).size;
      expect(
        size,
        `MapView chunk ${entry.file} is ${Math.round(size / 1024)}KB — exceeds 80KB budget. Review imports in MapView.tsx.`,
      ).toBeLessThan(BUDGET_BYTES);
    }
  });
});
