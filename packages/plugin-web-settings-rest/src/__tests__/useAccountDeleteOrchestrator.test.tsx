import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { accountScope, generationKey } from "@repo/plugin-web-storage";
import { deleteAccount, wipeRegisteredIDB, AccountDeleteError } from "@repo/web-auth-device-session";
import { useWebAuthSession } from "@repo/web-auth-device-session/web";
import { clearAccountAiSecrets } from "@repo/plugin-web-ai-chat";
import { useAccountDeleteOrchestrator } from "../internal/useAccountDeleteOrchestrator.js";

vi.mock("@repo/web-auth-device-session", async (original) => ({
  ...await original<Record<string, unknown>>(), deleteAccount: vi.fn(), wipeRegisteredIDB: vi.fn(),
}));
vi.mock("@repo/web-auth-device-session/web", () => ({ useWebAuthSession: vi.fn() }));
vi.mock("@repo/plugin-web-ai-chat", () => ({ clearAccountAiSecrets: vi.fn() }));

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>(done => { resolve = done; });
  return { promise, resolve };
}
function activate(id: string, demo = false) { return accountScope.activate(accountScope.lock(id), "g1", demo); }
let assign: ReturnType<typeof vi.fn>;
let clear: ReturnType<typeof vi.fn>;
let scope: ReturnType<typeof accountScope.capture>;
const rawKey = (id: string, demo = false) => generationKey(id, "g1", "xai_task_cols", demo);
function checkPreserved() {
  expect(localStorage.getItem(rawKey("B"))).toBe("B content");
  expect(localStorage.getItem("xai_task_cols")).toBe("unowned archive");
  expect(localStorage.getItem("xai_lang")).toBe("zh");
}
beforeEach(() => {
  vi.clearAllMocks(); vi.stubEnv("VITE_WEB_AUTH_MODE", "");
  vi.mocked(deleteAccount).mockResolvedValue(undefined);
  vi.mocked(clearAccountAiSecrets).mockResolvedValue(undefined);
  scope = activate("A");
  localStorage.setItem(rawKey("A"), "A content");
  localStorage.setItem(rawKey("B"), "B content");
  localStorage.setItem("xai_task_cols", "unowned archive");
  localStorage.setItem("xai_lang", "zh");
  assign = vi.fn();
  Object.defineProperty(window, "location", { configurable: true, value: { assign, href: "http://localhost/" } });
  clear = vi.fn(async () => { accountScope.lock(null); });
  vi.mocked(useWebAuthSession).mockReturnValue({
    client: { auth: {} }, session: { user: { id: "A" }, access_token: "captured-A-token" }, clearSessionStorage: clear,
  } as unknown as ReturnType<typeof useWebAuthSession>);
});
afterEach(() => vi.unstubAllEnvs());

describe("account deletion captures the initiating owner", () => {
  it("pins the server token, removes only A content/secrets, and preserves device, B and archive", async () => {
    const { result } = renderHook(() => useAccountDeleteOrchestrator());
    await act(async () => result.current.submit());
    expect(deleteAccount).toHaveBeenCalledWith(expect.anything(), { accessToken: "captured-A-token", signOutAfterDelete: false });
    expect(localStorage.getItem(rawKey("A"))).toBeNull(); checkPreserved();
    expect(clearAccountAiSecrets).toHaveBeenCalledWith(expect.objectContaining({ accountId: scope.accountId, kind: scope.kind, generation: scope.generation }));
    expect(wipeRegisteredIDB).not.toHaveBeenCalled();
    expect(clear).toHaveBeenCalledOnce(); expect(assign).toHaveBeenCalledWith("/");
    expect(result.current.state).toBe("success");
  });
  it("mock-auth deletes only the demo scope and never invokes the real server", async () => {
    vi.stubEnv("VITE_WEB_AUTH_MODE", "mock-authenticated"); scope = activate("A", true);
    localStorage.setItem(rawKey("A", true), "demo content");
    const { result } = renderHook(() => useAccountDeleteOrchestrator());
    await act(async () => result.current.submit());
    expect(deleteAccount).not.toHaveBeenCalled();
    expect(localStorage.getItem(rawKey("A", true))).toBeNull();
    expect(localStorage.getItem(rawKey("A"))).toBe("A content"); checkPreserved();
  });
  it("does not allow mock mode to delete a real account namespace", async () => {
    vi.stubEnv("VITE_WEB_AUTH_MODE", "mock-authenticated");
    const { result } = renderHook(() => useAccountDeleteOrchestrator());
    await act(async () => result.current.submit());
    expect(result.current.state).toBe("failure"); expect(deleteAccount).not.toHaveBeenCalled();
    expect(localStorage.getItem(rawKey("A"))).toBe("A content");
  });
  it("server failure preserves all local content and exposes the failure", async () => {
    vi.mocked(deleteAccount).mockRejectedValue(new AccountDeleteError("network", "offline"));
    const { result } = renderHook(() => useAccountDeleteOrchestrator());
    await act(async () => result.current.submit());
    expect(result.current.error?.kind).toBe("network"); expect(result.current.state).toBe("failure");
    expect(localStorage.getItem(rawKey("A"))).toBe("A content"); checkPreserved();
    expect(clearAccountAiSecrets).not.toHaveBeenCalled(); expect(clear).not.toHaveBeenCalled(); expect(assign).not.toHaveBeenCalled();
    act(() => result.current.reset()); expect(result.current.state).toBe("idle");
  });
  it("already-deleted server outcome still performs scoped local cleanup", async () => {
    vi.mocked(deleteAccount).mockRejectedValue(new AccountDeleteError("already_deleted", "gone"));
    const { result } = renderHook(() => useAccountDeleteOrchestrator());
    await act(async () => result.current.submit());
    expect(result.current.state).toBe("success"); expect(localStorage.getItem(rawKey("A"))).toBeNull(); checkPreserved();
  });
  it("secret cleanup failure is not reported as successful deletion", async () => {
    vi.mocked(clearAccountAiSecrets).mockRejectedValue(new Error("IDB blocked"));
    const { result } = renderHook(() => useAccountDeleteOrchestrator());
    await act(async () => result.current.submit());
    expect(result.current.state).toBe("failure"); expect(clear).not.toHaveBeenCalled(); expect(assign).not.toHaveBeenCalled(); checkPreserved();
  });
  it("suppresses duplicate submit while the server request is pending", async () => {
    const pending = deferred(); vi.mocked(deleteAccount).mockReturnValue(pending.promise);
    const { result } = renderHook(() => useAccountDeleteOrchestrator());
    let first!: Promise<void>; act(() => { first = result.current.submit(); });
    await act(async () => result.current.submit());
    expect(deleteAccount).toHaveBeenCalledOnce();
    await act(async () => { pending.resolve(); await first; });
    expect(clearAccountAiSecrets).toHaveBeenCalledOnce();
  });
  it("A server completion after switching to B deletes only A and leaves B session/navigation alone", async () => {
    const pending = deferred(); vi.mocked(deleteAccount).mockReturnValue(pending.promise);
    const { result } = renderHook(() => useAccountDeleteOrchestrator());
    let first!: Promise<void>; act(() => { first = result.current.submit(); });
    activate("B");
    await act(async () => { pending.resolve(); await first; });
    expect(localStorage.getItem(rawKey("A"))).toBeNull(); checkPreserved();
    expect(clearAccountAiSecrets).toHaveBeenCalledWith(expect.objectContaining({ accountId: scope.accountId, kind: scope.kind, generation: scope.generation }));
    expect(clear).not.toHaveBeenCalled(); expect(assign).not.toHaveBeenCalled();
    expect(accountScope.capture().accountId).toBe("B");
  });
  it("switching during asynchronous secret cleanup does not clear B authentication", async () => {
    const pending = deferred(); vi.mocked(clearAccountAiSecrets).mockReturnValue(pending.promise);
    const { result } = renderHook(() => useAccountDeleteOrchestrator());
    let first!: Promise<void>; await act(async () => { first = result.current.submit(); });
    activate("B"); await act(async () => { pending.resolve(); await first; });
    expect(clear).not.toHaveBeenCalled(); expect(assign).not.toHaveBeenCalled(); checkPreserved();
  });
  it("switching during auth storage clearing does not navigate away from B", async () => {
    const pending = deferred(); clear.mockImplementation(() => { accountScope.lock(null); return pending.promise; });
    const { result } = renderHook(() => useAccountDeleteOrchestrator());
    let first!: Promise<void>; await act(async () => { first = result.current.submit(); });
    activate("B"); await act(async () => { pending.resolve(); await first; });
    expect(assign).not.toHaveBeenCalled(); checkPreserved();
  });
  it("a callback captured before account switch cannot start deletion as B", async () => {
    const { result } = renderHook(() => useAccountDeleteOrchestrator()); activate("B");
    await act(async () => result.current.submit());
    expect(deleteAccount).not.toHaveBeenCalled(); expect(localStorage.getItem(rawKey("A"))).toBe("A content"); checkPreserved();
  });
  it("locked scope rejects deletion before any backend or local action", async () => {
    accountScope.lock(null); const { result } = renderHook(() => useAccountDeleteOrchestrator());
    await act(async () => result.current.submit());
    expect(result.current.error?.kind).toBe("unauthorized"); expect(deleteAccount).not.toHaveBeenCalled(); expect(clearAccountAiSecrets).not.toHaveBeenCalled();
  });
});
