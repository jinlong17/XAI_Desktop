import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

// Mock the event bus + reset utility so we can spy on them.
const emitWebEventMock = vi.fn();
const resetAllPrefsMock = vi.fn();

vi.mock("@repo/xai-web-event-bus", async () => {
  const actual = await vi.importActual<typeof import("@repo/xai-web-event-bus")>(
    "@repo/xai-web-event-bus",
  );
  return {
    ...actual,
    emitWebEvent: (...args: unknown[]) => emitWebEventMock(...args),
  };
});

vi.mock("../internal/resetAllPrefs.js", () => ({
  resetAllPrefs: () => resetAllPrefsMock(),
}));

// Import after the mocks so SettingsFooter picks them up.
import { SettingsFooter } from "../index.js";

beforeEach(() => {
  emitWebEventMock.mockClear();
  resetAllPrefsMock.mockClear();
});

describe("<SettingsFooter>", () => {
  it("F1: renders EN labels Reset to defaults + Save & apply", () => {
    render(<SettingsFooter lang="en" onSave={() => []} />);
    expect(screen.getByTestId("settings-footer-reset").textContent).toBe(
      "Reset to defaults",
    );
    expect(screen.getByTestId("settings-footer-save").textContent).toBe(
      "Save & apply",
    );
  });

  it("F2: renders ZH labels 恢复默认 + 保存生效", () => {
    render(<SettingsFooter lang="zh" onSave={() => []} />);
    expect(screen.getByTestId("settings-footer-reset").textContent).toBe(
      "恢复默认",
    );
    expect(screen.getByTestId("settings-footer-save").textContent).toBe(
      "保存生效",
    );
  });

  it("F3: Save click calls props.onSave once", () => {
    const onSave = vi.fn(() => []);
    render(<SettingsFooter lang="en" onSave={onSave} />);
    fireEvent.click(screen.getByTestId("settings-footer-save"));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("F4: Save click with theme change emits 1 event with payload + changedAt", () => {
    render(
      <SettingsFooter
        lang="en"
        onSave={() => [{ key: "theme", value: "dark" }]}
      />,
    );
    fireEvent.click(screen.getByTestId("settings-footer-save"));
    expect(emitWebEventMock).toHaveBeenCalledTimes(1);
    const [channel, payload] = emitWebEventMock.mock.calls[0]!;
    expect(channel).toBe("web:settings:preference-changed");
    expect(payload).toMatchObject({ key: "theme", value: "dark" });
    expect(typeof (payload as { changedAt: string }).changedAt).toBe("string");
  });

  it("F5: Save click with empty array — 0 events but still flashes Saved", () => {
    vi.useFakeTimers();
    render(<SettingsFooter lang="en" onSave={() => []} />);
    fireEvent.click(screen.getByTestId("settings-footer-save"));
    expect(emitWebEventMock).not.toHaveBeenCalled();
    expect(screen.getByTestId("settings-footer-save").textContent).toBe("Saved");
  });

  it("F6: After Save, button shows Saved then reverts after 1800ms", () => {
    vi.useFakeTimers();
    render(<SettingsFooter lang="en" onSave={() => []} />);
    fireEvent.click(screen.getByTestId("settings-footer-save"));
    expect(screen.getByTestId("settings-footer-save").textContent).toBe("Saved");
    act(() => {
      vi.advanceTimersByTime(1800);
    });
    expect(screen.getByTestId("settings-footer-save").textContent).toBe(
      "Save & apply",
    );
  });

  it("F7: Reset click with window.confirm=false — no resetAllPrefs / no onReset", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const onReset = vi.fn();
    render(<SettingsFooter lang="en" onSave={() => []} onReset={onReset} />);
    fireEvent.click(screen.getByTestId("settings-footer-reset"));
    expect(onReset).not.toHaveBeenCalled();
    expect(resetAllPrefsMock).not.toHaveBeenCalled();
  });

  it("F8: Reset click with confirm=true and no onReset — calls default resetAllPrefs", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<SettingsFooter lang="en" onSave={() => []} />);
    fireEvent.click(screen.getByTestId("settings-footer-reset"));
    expect(resetAllPrefsMock).toHaveBeenCalledTimes(1);
  });
});
