/**
 * AC-EVENT-7: the module does NOT emit any web:* event.
 *
 * Verified by greping the src tree for any `emitWebEvent` import.
 */
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, "..");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "__tests__" || entry === "node_modules" || entry === "dist") continue;
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(p);
  }
  return out;
}

describe("emit-only contract", () => {
  it("AC-EVENT-7: no `emitWebEvent` import anywhere in src/", () => {
    const files = walk(SRC);
    const offenders: string[] = [];
    for (const f of files) {
      const content = readFileSync(f, "utf-8");
      if (/\bemitWebEvent\b/.test(content)) {
        offenders.push(f);
      }
    }
    expect(offenders).toEqual([]);
  });
});
