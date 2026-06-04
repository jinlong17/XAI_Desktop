import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const LAYOUT_CSS_PATH = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../../src/layout.css",
);

const cssText = fs.readFileSync(LAYOUT_CSS_PATH, "utf-8");

describe("layout.css responsive shell contract", () => {
  it("keeps app-main shrinkable inside the shell grid", () => {
    expect(cssText).toMatch(/\.app-main\s*\{[^}]*min-width:\s*0;/s);
  });

  it("keeps topbar and search input shrinkable at narrow widths", () => {
    expect(cssText).toMatch(/\.topbar\s*\{[^}]*min-width:\s*0;/s);
    expect(cssText).toMatch(/\.search-box\s*\{[^}]*min-width:\s*0;/s);
    expect(cssText).toMatch(/\.search-box input\s*\{[^}]*min-width:\s*0;/s);
  });
});
