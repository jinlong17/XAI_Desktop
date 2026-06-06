/**
 * TT-NO-INLINE-MOCK — source-text guard (Phase 4).
 *
 * Enforces AC-2's "no inline mock globals": every page under src/pages/ must read
 * its data through the typed adapters (`../adapters`) and must NOT carry inline
 * fixture data arrays. This keeps the Typed Contract Mock seam intact — a page
 * that inlined fixtures could not be swapped to a contract-backed service without
 * a UI rewrite.
 *
 * Two binary contracts, robust against false positives on UI config arrays
 * (e.g. `const columns: Column<T>[] = [{ header, cell }, …]` are page UI, not data):
 *   1. each page file imports from "../adapters" (or "../adapters/...") — it reads
 *      data through the typed seam.
 *   2. NO page file imports from "../fixtures" — raw fixtures are adapter-internal;
 *      a page reaching into fixtures directly would bypass the swappable seam. This
 *      is the precise "no inline mock globals" boundary: pages never touch the mock
 *      data source, only the typed read-model.
 *
 * Design authority: apps/admin/docs/test.md §3 (TT-NO-INLINE-MOCK).
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PAGES_DIR = join(__dirname, "..", "pages");

function pageFiles(): string[] {
  return readdirSync(PAGES_DIR)
    .filter((f) => f.endsWith(".tsx") && !f.includes(".test."))
    .map((f) => join(PAGES_DIR, f));
}

describe("TT-NO-INLINE-MOCK: pages read through typed adapters, no inline fixtures", () => {
  const files = pageFiles();

  it("there are 10 page components (matching the 10 prototype views)", () => {
    // 10 .tsx pages; the registry (index.ts) is not counted here.
    expect(files.length).toBe(10);
  });

  for (const file of files) {
    const name = file.split("/").pop()!;
    const content = readFileSync(file, "utf-8");

    it(`${name} imports from ../adapters`, () => {
      const importsAdapters = /from\s+["']\.\.\/adapters(\/[a-zA-Z]+)?["']/.test(content);
      expect(
        importsAdapters,
        `${name} must read data through ../adapters (Typed Contract Mock seam)`,
      ).toBe(true);
    });

    it(`${name} does NOT import from ../fixtures (fixtures are adapter-internal)`, () => {
      const importsFixtures = /from\s+["']\.\.\/fixtures(\/[a-zA-Z]+)?["']/.test(content);
      expect(
        importsFixtures,
        `${name} must NOT import raw fixtures directly — read through ../adapters so the mock is swappable without a UI change`,
      ).toBe(false);
    });
  }
});
