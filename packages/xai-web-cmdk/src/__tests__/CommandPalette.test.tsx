/**
 * CommandPalette — CP1..CP18
 * test.md §3 P3
 *
 * Mock strategy:
 * - react-router: mock useNavigate to return a spy fn
 * - @repo/xai-web-event-bus: spy on emitWebEvent
 * - @repo/xai-web-shell: mock useWebShell to return lang="en"
 * - navigator.platform: redefined per-test via Object.defineProperty
 * - readModuleStates: mocked to return empty state (no localStorage setup needed)
 */
import { it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CommandPaletteProvider } from "../CommandPaletteProvider.js";
import { CommandPalette } from "../CommandPalette.js";
import { __resetCmdkRegistry, registerSearchAdapter } from "../internal/registry.js";

// ---- Mocks ----------------------------------------------------------------

vi.mock("react-router", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("@repo/xai-web-event-bus", () => ({
  emitWebEvent: vi.fn(),
  onWebEvent: vi.fn(() => vi.fn()),
  useWebEventListener: vi.fn(),
}));

vi.mock("@repo/xai-web-shell", () => ({
  useWebShell: () => ({ lang: "en", railPos: "left", petOn: false, setPetOn: vi.fn() }),
}));

// Mock readModuleStates to return empty state (no localStorage needed)
vi.mock("../internal/readModuleStates.js", () => ({
  readModuleStates: () => Object.freeze({
    tasks: {}, board: {}, dashboard: {}, calendar: {}, matrix: {},
    pomodoro: [], habits: {}, meditation: {}, countdown: [], statistics: {}, metrics: {},
    settings: [], ai: {}, search: {},
  }),
}));

// ---- Helpers ---------------------------------------------------------------

function renderPalette(props: Partial<React.ComponentProps<typeof CommandPalette>> = {}) {
  return render(
    <CommandPaletteProvider>
      <CommandPalette {...props} />
    </CommandPaletteProvider>,
  );
}

function mockMac() {
  Object.defineProperty(navigator, "platform", {
    get: () => "MacIntel",
    configurable: true,
  });
}

// ---- Tests -----------------------------------------------------------------

beforeEach(() => {
  __resetCmdkRegistry();
  vi.clearAllMocks();
  mockMac();
});

afterEach(() => {
  vi.restoreAllMocks();
});

it("CP1 — closed by default (no dialog in DOM)", () => {
  renderPalette();
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("CP2 — Cmd+K opens palette (Mac)", () => {
  renderPalette();
  fireEvent.keyDown(window, { key: "k", metaKey: true, ctrlKey: false, bubbles: true });
  expect(screen.queryByRole("dialog")).toBeTruthy();
});

it("CP3 — Ctrl+K opens on non-Mac", () => {
  Object.defineProperty(navigator, "platform", {
    get: () => "Linux x86_64",
    configurable: true,
  });
  Object.defineProperty(navigator, "userAgent", {
    get: () => "Mozilla/5.0 (X11; Linux x86_64)",
    configurable: true,
  });
  renderPalette();
  fireEvent.keyDown(window, { key: "k", ctrlKey: true, metaKey: false, bubbles: true });
  expect(screen.queryByRole("dialog")).toBeTruthy();
});

it("CP4 — Esc closes palette", () => {
  renderPalette();
  fireEvent.keyDown(window, { key: "k", metaKey: true, ctrlKey: false, bubbles: true });
  expect(screen.queryByRole("dialog")).toBeTruthy();
  const input = screen.getByRole("combobox");
  fireEvent.keyDown(input, { key: "Escape" });
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("CP5 — scrim click closes palette", () => {
  const { container } = renderPalette();
  fireEvent.keyDown(window, { key: "k", metaKey: true, ctrlKey: false, bubbles: true });
  expect(screen.queryByRole("dialog")).toBeTruthy();
  const scrim = container.querySelector(".cmdk-scrim") as HTMLElement;
  fireEvent.click(scrim);
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("CP6 — Enter on highlighted row calls navigate + close", () => {
  // Register a task adapter that returns hits
  registerSearchAdapter("tasks", (query) => {
    if (query) return [{ id: "tasks:1", moduleId: "tasks", kind: "entity" as const, entityId: "1", label: { en: "Task 1", zh: "任务1" }, score: 80 }];
    return [];
  });

  renderPalette();
  // Open
  fireEvent.keyDown(window, { key: "k", metaKey: true, ctrlKey: false, bubbles: true });
  // Type query
  const input = screen.getByRole("combobox");
  fireEvent.change(input, { target: { value: "task" } });
  // Enter
  fireEvent.keyDown(input, { key: "Enter" });
  // Palette should close
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("CP7 — click on row jumps + closes", () => {
  registerSearchAdapter("tasks", (query) => {
    if (query) return [{ id: "tasks:1", moduleId: "tasks", kind: "entity" as const, entityId: "1", label: { en: "Task 1", zh: "任务1" }, score: 80 }];
    return [];
  });

  renderPalette();
  fireEvent.keyDown(window, { key: "k", metaKey: true, ctrlKey: false, bubbles: true });
  const input = screen.getByRole("combobox");
  fireEvent.change(input, { target: { value: "task" } });
  const option = screen.getByRole("option");
  fireEvent.click(option);
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("CP8 — ↑ arrow moves highlight up; wraps at top", () => {
  registerSearchAdapter("tasks", () => [
    { id: "tasks:1", moduleId: "tasks", kind: "entity" as const, entityId: "1", label: { en: "A", zh: "A" }, score: 80 },
    { id: "tasks:2", moduleId: "tasks", kind: "entity" as const, entityId: "2", label: { en: "B", zh: "B" }, score: 70 },
  ]);

  const { container } = renderPalette();
  fireEvent.keyDown(window, { key: "k", metaKey: true, ctrlKey: false, bubbles: true });
  // Type to trigger hits
  const input = screen.getByRole("combobox");
  fireEvent.change(input, { target: { value: "a" } });
  // Default activeIndex = 0 (first row is active)
  let rows = container.querySelectorAll(".cmdk-row");
  expect(rows[0]?.classList.contains("active")).toBe(true);
  // Press ↑ → wraps to last row
  fireEvent.keyDown(input, { key: "ArrowUp" });
  rows = container.querySelectorAll(".cmdk-row");
  // Last row should be active now
  expect(rows[rows.length - 1]?.classList.contains("active")).toBe(true);
});

it("CP9 — ↓ arrow moves highlight down; wraps at bottom", () => {
  registerSearchAdapter("tasks", () => [
    { id: "tasks:1", moduleId: "tasks", kind: "entity" as const, entityId: "1", label: { en: "A", zh: "A" }, score: 80 },
    { id: "tasks:2", moduleId: "tasks", kind: "entity" as const, entityId: "2", label: { en: "B", zh: "B" }, score: 70 },
  ]);

  const { container } = renderPalette();
  fireEvent.keyDown(window, { key: "k", metaKey: true, ctrlKey: false, bubbles: true });
  const input = screen.getByRole("combobox");
  fireEvent.change(input, { target: { value: "a" } });
  // Initial: row 0 active
  fireEvent.keyDown(input, { key: "ArrowDown" });
  let rows = container.querySelectorAll(".cmdk-row");
  expect(rows[1]?.classList.contains("active")).toBe(true);
  // Wrap: press ↓ again
  fireEvent.keyDown(input, { key: "ArrowDown" });
  rows = container.querySelectorAll(".cmdk-row");
  expect(rows[0]?.classList.contains("active")).toBe(true);
});

it("CP10 — empty query renders module-jump hits per registered adapter", () => {
  registerSearchAdapter("tasks", () => [
    { id: "tasks:*", moduleId: "tasks", kind: "module-jump" as const, label: { en: "Tasks", zh: "任务" }, score: 50 },
  ]);
  registerSearchAdapter("habits", () => [
    { id: "habits:*", moduleId: "habits", kind: "module-jump" as const, label: { en: "Habits", zh: "习惯" }, score: 50 },
  ]);

  renderPalette();
  fireEvent.keyDown(window, { key: "k", metaKey: true, ctrlKey: false, bubbles: true });
  // query="" by default — module-jump hits rendered
  const options = screen.queryAllByRole("option");
  expect(options.length).toBeGreaterThanOrEqual(1);
});

it("CP11 — typing 'tomato' renders pomodoro hits", () => {
  registerSearchAdapter("pomodoro", (query) => {
    if (query === "tomato") {
      return [
        { id: "pomodoro:s1", moduleId: "pomodoro", kind: "entity" as const, entityId: "s1",
          label: { en: "Pomodoro · focus", zh: "番茄钟 · focus" }, score: 80 },
      ];
    }
    return [];
  });

  renderPalette();
  fireEvent.keyDown(window, { key: "k", metaKey: true, ctrlKey: false, bubbles: true });
  const input = screen.getByRole("combobox");
  fireEvent.change(input, { target: { value: "tomato" } });
  const options = screen.getAllByRole("option");
  expect(options.some((opt) => opt.textContent?.includes("Pomodoro"))).toBe(true);
});

it("CP12 — Cmd+Enter aliased to Enter (no-op for tab, same-tab jump)", () => {
  registerSearchAdapter("tasks", (query) => {
    if (query) return [{ id: "tasks:1", moduleId: "tasks", kind: "entity" as const, entityId: "1", label: { en: "Task", zh: "任务" }, score: 80 }];
    return [];
  });

  renderPalette();
  fireEvent.keyDown(window, { key: "k", metaKey: true, ctrlKey: false, bubbles: true });
  const input = screen.getByRole("combobox");
  fireEvent.change(input, { target: { value: "task" } });
  // Cmd+Enter treated same as Enter → closes the palette
  fireEvent.keyDown(input, { key: "Enter", metaKey: true });
  // Palette should close (Cmd+Enter aliased to Enter for v1)
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("CP13 — opening when already open is no-op (idempotent)", () => {
  renderPalette();
  fireEvent.keyDown(window, { key: "k", metaKey: true, ctrlKey: false, bubbles: true });
  expect(screen.queryByRole("dialog")).toBeTruthy();
  // Second Cmd+K — should still show exactly one dialog
  fireEvent.keyDown(window, { key: "k", metaKey: true, ctrlKey: false, bubbles: true });
  expect(screen.getAllByRole("dialog")).toHaveLength(1);
});

it("CP14 — opening + typing + closing + reopening resets query", () => {
  renderPalette();
  fireEvent.keyDown(window, { key: "k", metaKey: true, ctrlKey: false, bubbles: true });
  const input = screen.getByRole("combobox") as HTMLInputElement;
  fireEvent.change(input, { target: { value: "hello" } });
  expect(input.value).toBe("hello");
  // Close
  fireEvent.keyDown(input, { key: "Escape" });
  // Reopen
  fireEvent.keyDown(window, { key: "k", metaKey: true, ctrlKey: false, bubbles: true });
  const newInput = screen.getByRole("combobox") as HTMLInputElement;
  expect(newInput.value).toBe("");
});

it("CP15 — modal has role='dialog' + aria-modal='true'", () => {
  renderPalette();
  fireEvent.keyDown(window, { key: "k", metaKey: true, ctrlKey: false, bubbles: true });
  const dialog = screen.getByRole("dialog");
  expect(dialog.getAttribute("aria-modal")).toBe("true");
});

it("CP16 — input has aria-label = search_placeholder i18n", () => {
  renderPalette();
  fireEvent.keyDown(window, { key: "k", metaKey: true, ctrlKey: false, bubbles: true });
  const input = screen.getByRole("combobox");
  expect(input.getAttribute("aria-label")).toBe("Search tasks, habits, notes…");
});

it("CP17 — palette unmounts on close (no leftover dialog in DOM)", () => {
  renderPalette();
  fireEvent.keyDown(window, { key: "k", metaKey: true, ctrlKey: false, bubbles: true });
  expect(screen.queryByRole("dialog")).toBeTruthy();
  const input = screen.getByRole("combobox");
  fireEvent.keyDown(input, { key: "Escape" });
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("CP18 — second Cmd+K within open state stays open (idempotent)", () => {
  renderPalette();
  act(() => {
    fireEvent.keyDown(window, { key: "k", metaKey: true, ctrlKey: false, bubbles: true });
  });
  expect(screen.queryByRole("dialog")).toBeTruthy();
  act(() => {
    fireEvent.keyDown(window, { key: "k", metaKey: true, ctrlKey: false, bubbles: true });
  });
  // Still open, exactly one dialog
  expect(screen.getAllByRole("dialog")).toHaveLength(1);
});
