import { accountScope } from "@repo/plugin-web-storage";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MetricTrackerModule } from "../MetricTrackerModule.js";
import { readMetricTrackerState, useMetricTrackerState } from "../internal/storage.js";
import { METRIC_TRACKER_STATE_KEY } from "../internal/seed.js";

afterEach(() => vi.restoreAllMocks());
function blockWrite() {
  const key = accountScope.physicalKey(METRIC_TRACKER_STATE_KEY);
  const original = Storage.prototype.setItem;
  return vi.spyOn(Storage.prototype, "setItem").mockImplementation(function(this: Storage, name, value) {
    if (name === key) throw new DOMException("Synthetic quota", "QuotaExceededError");
    original.call(this, name, value);
  });
}
it("retains the editor and latest draft after quota, then saves exactly one record", () => {
  render(<MetricTrackerModule lang="en" />);
  const initial = readMetricTrackerState().records.length;
  fireEvent.click(screen.getByRole("button", { name: "Log" }));
  fireEvent.change(screen.getByLabelText("Weight value"), { target: { value: "81" } });
  const reject = blockWrite();
  fireEvent.click(screen.getByRole("button", { name: "Save record" }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.getByRole("alert")).toHaveTextContent("Saving failed");
  expect(readMetricTrackerState().records).toHaveLength(initial);
  expect(screen.getByLabelText("Weight value")).toHaveValue("81");
  fireEvent.change(screen.getByLabelText("Weight value"), { target: { value: "82" } });
  reject.mockRestore();
  fireEvent.click(screen.getByRole("button", { name: "Retry save" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(readMetricTrackerState().records).toHaveLength(initial + 1);
  expect(readMetricTrackerState().records[0]?.value).toBe(82);
});
it("retains a proposed profile when read access fails and can retry when access returns", () => {
  const { result } = renderHook(() => useMetricTrackerState());
  const key = accountScope.physicalKey(METRIC_TRACKER_STATE_KEY);
  const original = Storage.prototype.getItem;
  const denied = vi.spyOn(Storage.prototype, "getItem").mockImplementation(function(this: Storage, name) {
    if (name === key) throw new DOMException("Denied", "SecurityError");
    return original.call(this, name);
  });
  act(() => { expect(result.current[1](old => ({ ...old, profile: { ...old.profile, targetWeightKg: 63 } }))).toBe(false); });
  expect(result.current[2].failure).toBe("write");
  denied.mockRestore();
  act(() => { expect(result.current[2].retry()).toBe(true); });
  expect(readMetricTrackerState().profile.targetWeightKg).toBe(63);
});
it("does not overwrite a newer external value when retrying", () => {
  const { result } = renderHook(() => useMetricTrackerState());
  const reject = blockWrite();
  act(() => { result.current[1](old => ({ ...old, profile: { ...old.profile, targetWeightKg: 63 } })); });
  reject.mockRestore();
  const key = accountScope.physicalKey(METRIC_TRACKER_STATE_KEY);
  localStorage.setItem(key, "new external bytes");
  act(() => { expect(result.current[2].retry()).toBe(false); });
  expect(result.current[2].failure).toBe("conflict");
  expect(localStorage.getItem(key)).toBe("new external bytes");
});
it("refuses stale account retry and pending snapshot export", () => {
  const { result } = renderHook(() => useMetricTrackerState());
  const reject = blockWrite();
  act(() => { result.current[1](old => ({ ...old, profile: { ...old.profile, targetWeightKg: 63 } })); });
  reject.mockRestore();
  accountScope.activate(accountScope.lock("B"), "B-generation");
  const keyB = accountScope.physicalKey(METRIC_TRACKER_STATE_KEY);
  localStorage.setItem(keyB, "B original bytes");
  act(() => { expect(result.current[2].retry()).toBe(false); });
  expect(() => result.current[2].snapshot()).toThrow();
  expect(localStorage.getItem(keyB)).toBe("B original bytes");
});
it("downloads the pending snapshot together with the latest edited record draft", async () => {
  vi.useRealTimers();
  let blob!: Blob;
  Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn((value: Blob) => { blob = value; return "blob:metric-draft"; }) });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
  render(<MetricTrackerModule lang="en" />);
  fireEvent.click(screen.getByRole("button", { name: "Log" }));
  fireEvent.change(screen.getByLabelText("Weight value"), { target: { value: "81" } });
  blockWrite();
  fireEvent.click(screen.getByRole("button", { name: "Save record" }));
  fireEvent.change(screen.getByLabelText("Weight value"), { target: { value: "82" } });
  fireEvent.click(screen.getByRole("button", { name: "Export unsaved draft" }));
  const text = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsText(blob); });
  const downloaded = JSON.parse(text);
  expect(downloaded).toMatchObject({ kind: "metric-unsaved-draft", recordDraft: { weight: "82" } });
  expect(downloaded.snapshot.records[0]).toMatchObject({ value: 81 });
});
