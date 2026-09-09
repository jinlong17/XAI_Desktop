import { accountScope } from "@repo/plugin-web-storage";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ACTIVE_KEY, HISTORY_KEY, command, getPomodoroSnapshot, retainPomodoroController, retryPomodoro, exportPomodoroRecovery } from "../internal/sessionController.js";
const minute = 60_000;
let release: () => void;
beforeEach(() => { localStorage.clear(); release = retainPomodoroController(); });
afterEach(() => { release(); vi.restoreAllMocks(); });
const read = (key: string) => JSON.parse(localStorage.getItem(accountScope.physicalKey(key)) ?? "null");
it("durably starts and restores a stable session through controller teardown", async () => {
  expect(await command("start", { mode: "focus", durationMs: 25 * minute })).toBe(true);
  const original = read(ACTIVE_KEY); release(); vi.setSystemTime(Date.now() + minute); release = retainPomodoroController();
  expect(getPomodoroSnapshot().active?.sessionId).toBe(original.sessionId);
  expect(getPomodoroSnapshot().active?.deadline).toBe(original.deadline);
});
it("pause survives away time; resume updates deadline but excludes pause time", async () => {
  await command("start", { mode: "focus", durationMs: 25 * minute });
  vi.setSystemTime(Date.now() + minute); await command("pause");
  const paused = read(ACTIVE_KEY); vi.setSystemTime(Date.now() + 60 * minute);
  await command("resume"); const resumed = read(ACTIVE_KEY);
  expect(resumed.sessionId).toBe(paused.sessionId);
  expect(resumed.accumulatedElapsedMs).toBe(minute);
  expect(resumed.deadline).toBe(Date.now() + 24 * minute);
});
it("late settlement preserves deadline and first commit time, then replays only once", async () => {
  const start = Date.now(); await command("start", { mode: "focus", durationMs: minute });
  vi.setSystemTime(start + 10 * minute); await command("reconcile"); await command("reconcile");
  const history = read(HISTORY_KEY); expect(history).toHaveLength(1);
  expect(history[0]).toMatchObject({ finishedAt: new Date(start + minute).toISOString(), recordedAt: new Date(start + 10 * minute).toISOString(), elapsedMs: minute, completed: true });
});
it.each(["pending", "history", "clear"])("%s failure retains retryable state; recovery commits once", async phase => {
  await command("start", { mode: "focus", durationMs: minute });
  vi.setSystemTime(Date.now() + 10_000);
  const activeKey = accountScope.physicalKey(ACTIVE_KEY), historyKey = accountScope.physicalKey(HISTORY_KEY);
  const set = Storage.prototype.setItem, remove = Storage.prototype.removeItem;
  const setSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(function(this: Storage, key, value) {
    if (phase === "pending" && key === activeKey || phase === "history" && key === historyKey) throw new DOMException("full", "QuotaExceededError");
    return set.call(this, key, value);
  });
  const removeSpy = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function(this: Storage, key) {
    if (phase === "clear" && key === activeKey) throw new DOMException("full", "QuotaExceededError");
    return remove.call(this, key);
  });
  const intendedEnd = Date.now();
  expect(await command("end")).toBe(false);
  expect(JSON.parse(exportPomodoroRecovery()).uncommittedSettlement?.settlement?.finishedAt).toBe(new Date(intendedEnd).toISOString());
  expect(read(ACTIVE_KEY)).not.toBeNull();
  expect(read(HISTORY_KEY)?.length ?? 0).toBe(phase === "clear" ? 1 : 0);
  expect(getPomodoroSnapshot().error).toContain(phase === "clear" ? "was saved, but" : "could not be saved");
  setSpy.mockRestore(); removeSpy.mockRestore();
  vi.setSystemTime(Date.now() + 2 * minute);
  expect(await retryPomodoro()).toBe(true); expect(read(HISTORY_KEY)).toHaveLength(1); expect(read(ACTIVE_KEY)).toBeNull();
  expect(read(HISTORY_KEY)[0].finishedAt).toBe(new Date(intendedEnd).toISOString());
  expect(read(HISTORY_KEY)[0].completed).toBe(false);
});
it("A state stays private during B activation, and old captured export rejects", async () => {
  await command("start", { mode: "focus", durationMs: minute }); const scopeA = accountScope.capture();
  accountScope.activate(accountScope.lock("other-account"), "fixture");
  expect(getPomodoroSnapshot().active).toBeNull(); expect(() => exportPomodoroRecovery(scopeA)).toThrow();
  expect(await command("start", { mode: "focus", durationMs: minute })).toBe(true);
});
it("missing Web Locks blocks writes with a reason", async () => {
  Object.defineProperty(navigator, "locks", { configurable: true, value: undefined });
  expect(await command("start", { mode: "focus", durationMs: minute })).toBe(false);
  expect(read(ACTIVE_KEY)).toBeNull(); expect(getPomodoroSnapshot().error).toContain("Web Locks");
});
it("corrupt history is preserved byte-for-byte and blocks completion", async () => {
  await command("start", { mode: "focus", durationMs: minute });
  localStorage.setItem(accountScope.physicalKey(HISTORY_KEY), '[{"bad":true}]');
  expect(await command("end")).toBe(false);
  expect(localStorage.getItem(accountScope.physicalKey(HISTORY_KEY))).toBe('[{"bad":true}]');
});
it("an A command queued on a real lock boundary cannot settle into B after identity changes", async () => {
  await command("start", { mode: "focus", durationMs: minute });
  const scopeA = accountScope.capture();
  const aHistoryKey = accountScope.physicalKey(HISTORY_KEY, scopeA);
  let grant: () => void = () => undefined;
  Object.defineProperty(navigator, "locks", { configurable: true, value: {
    request: (_name: string, run: () => unknown) => new Promise((resolve, reject) => { grant = () => { try { resolve(run()); } catch (error) { reject(error); } }; }),
  } });
  const pending = command("end");
  accountScope.activate(accountScope.lock("queued-B"), "fixture");
  grant();
  expect(await pending).toBe(false);
  expect(localStorage.getItem(aHistoryKey)).toBeNull();
  expect(read(HISTORY_KEY)).toBeNull();
  expect(getPomodoroSnapshot().active).toBeNull();
});
it("an End queued before deadline retains command time even if the lock is granted late", async () => {
  await command("start", { mode: "focus", durationMs: minute });
  vi.setSystemTime(Date.now() + 10_000); const endTime = Date.now();
  let grant: () => void = () => undefined;
  Object.defineProperty(navigator, "locks", { configurable: true, value: {
    request: (_name: string, run: () => unknown) => new Promise((resolve, reject) => { grant = () => { try { resolve(run()); } catch (error) { reject(error); } }; }),
  } });
  const pending = command("end"); vi.setSystemTime(Date.now() + 2 * minute); grant();
  expect(await pending).toBe(true);
  expect(read(HISTORY_KEY)[0]).toMatchObject({ completed: false, elapsedMs: 10_000, finishedAt: new Date(endTime).toISOString() });
});
