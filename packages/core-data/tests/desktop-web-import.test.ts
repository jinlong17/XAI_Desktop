import { describe, expect, it } from "vitest";

import {
  DESKTOP_WEB_IMPORT_SURFACES,
  buildDesktopWebImportLedgerId,
  buildDesktopWebImportRunRecordId,
  createDesktopWebImportFingerprint,
  normalizeImportBoundaryKey,
} from "../src/desktop-web-import";

describe("desktop web import contract", () => {
  it("normalizes empty boundary key to local-session", () => {
    expect(normalizeImportBoundaryKey(undefined)).toBe("local-session");
    expect(normalizeImportBoundaryKey("")).toBe("local-session");
    expect(normalizeImportBoundaryKey("   ")).toBe("local-session");
    expect(normalizeImportBoundaryKey(" user-1 ")).toBe("user-1");
  });

  it("builds deterministic ledger and run ids", () => {
    expect(buildDesktopWebImportLedgerId(" user-1 ", "tasks")).toBe(
      "desktop-web-import-ledger:user-1:tasks",
    );
    expect(buildDesktopWebImportRunRecordId("run-123")).toBe(
      "desktop-web-import-run:run-123",
    );
    expect(buildDesktopWebImportRunRecordId("   ")).toBe(
      "desktop-web-import-run:unknown-run",
    );
  });

  it("keeps surface list stable for representative row #12 import scope", () => {
    expect(DESKTOP_WEB_IMPORT_SURFACES).toEqual([
      "tasks",
      "habits",
      "pomodoro",
      "boards",
      "board-workspace",
      "pet",
      "settings",
    ]);
  });

  it("creates stable fingerprints regardless of object key order", () => {
    const left = {
      a: 1,
      b: { y: true, x: [3, 2, 1] },
      c: null,
    };

    const right = {
      c: null,
      b: { x: [3, 2, 1], y: true },
      a: 1,
    };

    expect(createDesktopWebImportFingerprint(left)).toBe(
      createDesktopWebImportFingerprint(right),
    );
  });

  it("changes fingerprint when payload changes", () => {
    const baseline = createDesktopWebImportFingerprint({
      tasks: ["t1", "t2"],
      done: false,
    });

    const changed = createDesktopWebImportFingerprint({
      tasks: ["t1", "t3"],
      done: false,
    });

    expect(changed).not.toBe(baseline);
  });
});
