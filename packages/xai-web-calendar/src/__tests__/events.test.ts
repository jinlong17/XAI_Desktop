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

  it("AC-EVENT-7-EXT: new WeekView/DayView/TimeGrid/EventBlock files also have no emitWebEvent", () => {
    // Explicitly verify the new gap-closure row #4 files preserve the listen-only invariant.
    const newFiles = [
      resolve(__dirname, "..", "WeekView.tsx"),
      resolve(__dirname, "..", "DayView.tsx"),
      resolve(__dirname, "..", "TimeGrid.tsx"),
      resolve(__dirname, "..", "EventBlock.tsx"),
      resolve(__dirname, "..", "TimeGridDayColumn.tsx"),
      resolve(__dirname, "..", "TimeGridAllDayStrip.tsx"),
      resolve(__dirname, "..", "TimeGridHourRow.tsx"),
    ];
    const offenders: string[] = [];
    for (const f of newFiles) {
      try {
        const content = readFileSync(f, "utf-8");
        if (/\bemitWebEvent\b/.test(content)) {
          offenders.push(f);
        }
      } catch {
        // File not yet created (earlier phases) — skip silently
      }
    }
    expect(offenders).toEqual([]);
  });

  it("AC-EVENT-7-CREATE: event-create extension files also have no emitWebEvent", () => {
    // Explicit listen-only invariant check for the 2026-05-27 extension
    // (HC8 lift) files. EventComposer + EmptyStateHint land in P2/P3 — the
    // try/catch lets this test pass before they exist.
    const newFiles = [
      resolve(__dirname, "..", "EventComposer.tsx"),
      resolve(__dirname, "..", "EmptyStateHint.tsx"),
      resolve(__dirname, "..", "internal", "strings.ts"),
      resolve(__dirname, "..", "internal", "eventStore", "types.ts"),
      resolve(__dirname, "..", "internal", "eventStore", "ids.ts"),
      resolve(__dirname, "..", "internal", "eventStore", "eventStore.ts"),
      resolve(__dirname, "..", "internal", "eventStore", "useUserCalEvents.ts"),
      resolve(__dirname, "..", "internal", "eventStore", "expandRecurrence.ts"),
      resolve(__dirname, "..", "internal", "eventStore", "mergeEventsForViewport.ts"),
      resolve(__dirname, "..", "internal", "eventStore", "validators.ts"),
    ];
    const offenders: string[] = [];
    for (const f of newFiles) {
      try {
        const content = readFileSync(f, "utf-8");
        if (/\bemitWebEvent\b/.test(content)) {
          offenders.push(f);
        }
      } catch {
        // File not yet created (earlier phases) — skip silently
      }
    }
    expect(offenders).toEqual([]);
  });
});
