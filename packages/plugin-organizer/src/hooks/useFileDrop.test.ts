// @vitest-environment jsdom
/**
 * `useFileDrop` regression tests (P0-Foxtrot).
 *
 * The hook is intentionally visual-only on the click-through `main`
 * window after P0-Foxtrot. These tests guard against accidental
 * regressions:
 *
 * 1. The hook MUST NOT call `finderClient.registerBookmark`. Real
 *    bookmark registration lives in `OrganizerGridContent` because
 *    that is the only surface that receives absolute filesystem paths
 *    (Tauri native drag-drop). Calling `register_path_bookmark` with
 *    HTML5 basenames would deterministically fail the Rust-side
 *    `validate_user_path` lexical gate and create the illusion of
 *    honest provenance.
 *
 * 2. The hook MUST still fire `onDrop` and `onHover` for the HTML5
 *    drag lifecycle so the dashed-outline animation on the `main`
 *    window keeps working.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useFileDrop } from "./useFileDrop";
import type { FinderClient } from "../finderClient";

function makeStubFinderClient(): FinderClient & {
  __calls: { name: string; args: unknown[] }[];
} {
  const calls: { name: string; args: unknown[] }[] = [];
  return {
    __calls: calls,
    revealInFinder: vi.fn(async (...args: unknown[]) => {
      calls.push({ name: "revealInFinder", args });
    }),
    openPath: vi.fn(async (...args: unknown[]) => {
      calls.push({ name: "openPath", args });
    }),
    registerBookmark: vi.fn(async (...args: unknown[]) => {
      calls.push({ name: "registerBookmark", args });
    }),
    clearBookmark: vi.fn(async (...args: unknown[]) => {
      calls.push({ name: "clearBookmark", args });
    }),
    readFinderTags: vi.fn(async (...args: unknown[]) => {
      calls.push({ name: "readFinderTags", args });
      return [];
    }),
    writeFinderTags: vi.fn(async (...args: unknown[]) => {
      calls.push({ name: "writeFinderTags", args });
    }),
  };
}

function dispatchDragEvent(
  type: "dragenter" | "dragover" | "dragleave" | "drop",
  files: File[],
  position = { x: 100, y: 200 },
) {
  // jsdom doesn't implement DragEvent properly. Construct an Event of
  // the same name and attach a minimal `dataTransfer` shape the hook
  // expects.
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "clientX", { value: position.x });
  Object.defineProperty(event, "clientY", { value: position.y });
  // Minimal DataTransfer fake — only `files` and `dropEffect` are read.
  const dataTransfer = {
    files: {
      length: files.length,
      ...Object.fromEntries(files.map((file, idx) => [idx, file])),
      [Symbol.iterator]: function* () {
        for (const file of files) yield file;
      },
    },
    dropEffect: "none",
  } as unknown as DataTransfer;
  Object.defineProperty(event, "dataTransfer", { value: dataTransfer });
  document.dispatchEvent(event);
  return event;
}

describe("useFileDrop (post-P0-Foxtrot)", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    (window as unknown as { __droppedFiles?: Map<string, File> }).__droppedFiles = undefined;
  });

  it("invokes onDrop with HTML5 basenames on `drop`", () => {
    const onDrop = vi.fn();
    renderHook(() => useFileDrop({ onDrop }));

    const file = new File(["x"], "photo.png", { type: "image/png" });
    act(() => {
      dispatchDragEvent("drop", [file]);
    });

    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onDrop).toHaveBeenCalledWith(["photo.png"], { x: 100, y: 200 });
  });

  it("fires onHover(true) on dragenter and onHover(false) on dragleave", () => {
    const onHover = vi.fn();
    renderHook(() => useFileDrop({ onDrop: vi.fn(), onHover }));

    act(() => {
      dispatchDragEvent("dragenter", []);
    });
    expect(onHover).toHaveBeenCalledWith(true);

    act(() => {
      dispatchDragEvent("dragleave", []);
    });
    expect(onHover).toHaveBeenLastCalledWith(false);
  });

  it("does NOT call finderClient.registerBookmark when a deprecated client is passed (P0-Foxtrot regression guard)", () => {
    const onDrop = vi.fn();
    const finderClient = makeStubFinderClient();
    renderHook(() => useFileDrop({ onDrop, finderClient }));

    const file = new File(["x"], "photo.png", { type: "image/png" });
    act(() => {
      dispatchDragEvent("drop", [file]);
    });

    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(finderClient.registerBookmark).not.toHaveBeenCalled();
    expect(finderClient.__calls).toEqual([]);
  });

  it("does NOT fire onDrop when enabled is false", () => {
    const onDrop = vi.fn();
    renderHook(() => useFileDrop({ onDrop, enabled: false }));

    const file = new File(["x"], "photo.png");
    act(() => {
      dispatchDragEvent("drop", [file]);
    });

    expect(onDrop).not.toHaveBeenCalled();
  });
});
