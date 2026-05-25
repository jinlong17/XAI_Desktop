/**
 * keyboardCombo — KC1..KC8
 * api.md §10 + test.md §3 P1
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { matchesCmdK } from "../internal/keyboardCombo.js";

// Helper to create a mock KeyboardEvent
function makeEvent(overrides: Partial<KeyboardEvent>): KeyboardEvent {
  return {
    key: "k",
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    target: null,
    ...overrides,
  } as unknown as KeyboardEvent;
}

// Helper to mock navigator.platform
function mockPlatform(platform: string, userAgent?: string) {
  Object.defineProperty(navigator, "platform", {
    get: () => platform,
    configurable: true,
  });
  if (userAgent !== undefined) {
    Object.defineProperty(navigator, "userAgent", {
      get: () => userAgent,
      configurable: true,
    });
  }
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("matchesCmdK", () => {
  it("KC1 — Cmd+K on Mac → true", () => {
    mockPlatform("MacIntel", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)");
    const e = makeEvent({ key: "k", metaKey: true, ctrlKey: false });
    expect(matchesCmdK(e)).toBe(true);
  });

  it("KC2 — Ctrl+K on Linux → true", () => {
    mockPlatform("Linux x86_64", "Mozilla/5.0 (X11; Linux x86_64)");
    const e = makeEvent({ key: "k", ctrlKey: true, metaKey: false });
    expect(matchesCmdK(e)).toBe(true);
  });

  it("KC3 — Cmd+K on Linux → false (Cmd is Meta key, not Ctrl)", () => {
    mockPlatform("Linux x86_64", "Mozilla/5.0 (X11; Linux x86_64)");
    const e = makeEvent({ key: "k", metaKey: true, ctrlKey: false });
    expect(matchesCmdK(e)).toBe(false);
  });

  it("KC4 — Ctrl+K on Mac → false", () => {
    mockPlatform("MacIntel", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)");
    const e = makeEvent({ key: "k", ctrlKey: true, metaKey: false });
    expect(matchesCmdK(e)).toBe(false);
  });

  it("KC5 — Cmd+J on Mac → false (wrong key)", () => {
    mockPlatform("MacIntel", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)");
    const e = makeEvent({ key: "j", metaKey: true, ctrlKey: false });
    expect(matchesCmdK(e)).toBe(false);
  });

  it("KC6 — Cmd+K with Shift modifier → false", () => {
    mockPlatform("MacIntel", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)");
    const e = makeEvent({ key: "k", metaKey: true, ctrlKey: false, shiftKey: true });
    expect(matchesCmdK(e)).toBe(false);
  });

  it("KC7 — Cmd+K with target=<textarea> → false", () => {
    mockPlatform("MacIntel", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)");
    const textarea = document.createElement("textarea");
    const e = makeEvent({ key: "k", metaKey: true, ctrlKey: false, target: textarea });
    expect(matchesCmdK(e)).toBe(false);
  });

  it("KC8 — Cmd+K with target.contentEditable=true → false", () => {
    mockPlatform("MacIntel", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)");
    const div = document.createElement("div");
    div.contentEditable = "true";
    const e = makeEvent({ key: "k", metaKey: true, ctrlKey: false, target: div });
    expect(matchesCmdK(e)).toBe(false);
  });
});
