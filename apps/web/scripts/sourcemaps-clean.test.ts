import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { listSourceMapFiles, removeSourceMapFiles } from "./sourcemaps-lib.mjs";

describe("sourcemap cleanup", () => {
  it("finds and removes .map artifacts from dist", () => {
    const root = mkdtempSync(join(tmpdir(), "xai-web-sourcemaps-"));
    mkdirSync(join(root, "assets"), { recursive: true });
    writeFileSync(join(root, "assets", "main-123.js"), "console.log('ok')\n", "utf8");
    writeFileSync(join(root, "assets", "main-123.js.map"), "{}\n", "utf8");
    writeFileSync(join(root, "assets", "chunk-456.css.map"), "{}\n", "utf8");

    const before = listSourceMapFiles(root);
    expect(before).toHaveLength(2);

    const removed = removeSourceMapFiles(root);
    expect(removed).toHaveLength(2);
    expect(listSourceMapFiles(root)).toHaveLength(0);
  });
});
