import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const STYLES_CSS_PATH = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../../src/styles.css",
);

const cssText = fs.readFileSync(STYLES_CSS_PATH, "utf-8");

describe("responsive board workspace styles", () => {
  it("contains board-workspaces overflow containment for narrow viewports", () => {
    expect(cssText).toMatch(
      /\.board-workspaces-module\s*\{[^}]*overflow-x:\s*hidden;/s,
    );
    expect(cssText).toMatch(
      /\.board-workspaces-module \.board-toolbar\s*\{[^}]*min-width:\s*0;/s,
    );
  });

  it("keeps the mobile toolbar horizontally scrollable inside the module", () => {
    expect(cssText).toContain("@media (max-width: 900px)");
    expect(cssText).toMatch(
      /\.board-workspaces-module \.board-toolbar\s*\{[^}]*overflow-x:\s*auto;/s,
    );
  });

  it("keeps card detail modal inside the viewport with a stable close hit target", () => {
    expect(cssText).toMatch(
      /\.card-detail\s*\{[^}]*width:\s*min\(860px, calc\(100vw - 36px\)\);/s,
    );
    expect(cssText).toMatch(
      /\.card-detail \[data-testid="card-detail-close"\]\s*\{[^}]*flex:\s*0 0 32px;/s,
    );
    expect(cssText).toMatch(
      /\.card-detail\s*\{[^}]*width:\s*calc\(100vw - 20px\);/s,
    );
  });
});
