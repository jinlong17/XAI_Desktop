/** Integration boundary: real deleteAccount and orchestrator; only auth context is supplied. */
import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { accountPrefix, accountScope } from "@repo/plugin-web-storage";
import { useWebAuthSession } from "@repo/web-auth-device-session/web";
import { useAccountDeleteOrchestrator } from "../internal/useAccountDeleteOrchestrator.js";
import { AccountDeletionRecoveryNotice } from "../AccountDeletionRecoveryNotice.js";
import { render, screen } from "@testing-library/react";

vi.mock("@repo/web-auth-device-session/web", () => ({ useWebAuthSession: vi.fn() }));
afterEach(() => vi.unstubAllEnvs());

it.each([401, 403, 404, 500])("HTTP %s cannot authorize local erasure or a completion receipt", async status => {
  vi.stubEnv("VITE_WEB_AUTH_MODE", "live");
  accountScope.activate(accountScope.lock("delete-http-A"), "generation-A");
  const key = accountScope.physicalKey("xai_task_cols");
  localStorage.setItem(key, "original account content");
  const clearSessionStorage = vi.fn();
  const signOut = vi.fn();
  const response = new Response('{"code":"already_deleted"}', { status });
  const invoke = vi.fn().mockResolvedValue({ error: { context: response }, response, data: null });
  vi.mocked(useWebAuthSession).mockReturnValue({
    session: { user: { id: "delete-http-A" }, access_token: "synthetic-captured-token" },
    client: { functions: { invoke }, auth: { signOut } }, clearSessionStorage,
  } as unknown as ReturnType<typeof useWebAuthSession>);
  const { result } = renderHook(() => useAccountDeleteOrchestrator());
  await act(async () => result.current.submit());
  expect(result.current.state).toBe("failure");
  expect(localStorage.getItem(key)).toBe("original account content");
  expect(localStorage.getItem(`${accountPrefix("delete-http-A")}deleted`)).toBeNull();
  expect(clearSessionStorage).not.toHaveBeenCalled();
  expect(signOut).not.toHaveBeenCalled();
  expect(invoke).toHaveBeenCalledWith("account-delete", expect.objectContaining({ headers: { Authorization: "Bearer synthetic-captured-token" } }));
});

it("refuses to call the server if the durable intent cannot be written", async () => {
  vi.stubEnv("VITE_WEB_AUTH_MODE", "live");
  accountScope.activate(accountScope.lock("intent-A"), "generation-A");
  const invoke = vi.fn();
  vi.mocked(useWebAuthSession).mockReturnValue({ session: { user: { id: "intent-A" }, access_token: "synthetic-token" }, client: { functions: { invoke } }, clearSessionStorage: vi.fn() } as unknown as ReturnType<typeof useWebAuthSession>);
  const original = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
    if (key.endsWith(":deletion-intent")) throw new DOMException("Synthetic quota", "QuotaExceededError");
    original.call(this, key, value);
  });
  const { result } = renderHook(() => useAccountDeleteOrchestrator());
  await act(async () => result.current.submit());
  expect(result.current.state).toBe("failure");
  expect(invoke).not.toHaveBeenCalled();
});

it("retains an uncertain request after a lost response and remount without enabling cleanup", async () => {
  vi.stubEnv("VITE_WEB_AUTH_MODE", "live");
  accountScope.activate(accountScope.lock("uncertain-A"), "generation-A");
  const key = accountScope.physicalKey("xai_task_cols");
  localStorage.setItem(key, "preserve-A");
  const invoke = vi.fn().mockRejectedValue(new TypeError("Synthetic response loss"));
  vi.mocked(useWebAuthSession).mockReturnValue({ session: { user: { id: "uncertain-A" }, access_token: "synthetic-token" }, client: { functions: { invoke } }, clearSessionStorage: vi.fn() } as unknown as ReturnType<typeof useWebAuthSession>);
  const { result, unmount } = renderHook(() => useAccountDeleteOrchestrator());
  await act(async () => result.current.submit());
  expect(result.current.state).toBe("failure");
  unmount();
  accountScope.activate(accountScope.lock("B"), "generation-B");
  render(<AccountDeletionRecoveryNotice />);
  expect(screen.getByRole("status")).toHaveTextContent("no confirmed server outcome");
  expect(screen.queryByRole("button", { name: "Retry local cleanup" })).toBeNull();
  expect(localStorage.getItem(key)).toBe("preserve-A");
  const raw = localStorage.getItem(`${accountPrefix("uncertain-A")}deletion-intent`)!;
  expect(JSON.parse(raw)).toMatchObject({ accountId: "uncertain-A", phase: "server-outcome-unknown" });
  expect(raw).not.toContain("synthetic-token");
  expect(invoke).toHaveBeenCalledTimes(1);
  accountScope.activate(accountScope.lock("uncertain-A"), "generation-A");
  invoke.mockResolvedValue({ error: { context: new Response(null, { status: 401 }) } });
  const retried = renderHook(() => useAccountDeleteOrchestrator());
  await act(async () => retried.result.current.submit());
  expect(invoke).toHaveBeenCalledTimes(1);
  expect(localStorage.getItem(`${accountPrefix("uncertain-A")}deletion-intent`)).toBe(raw);
});

it("keeps the intent if recording server success fails before local cleanup", async () => {
  vi.stubEnv("VITE_WEB_AUTH_MODE", "live");
  accountScope.activate(accountScope.lock("confirmed-A"), "generation-A");
  const key = accountScope.physicalKey("xai_task_cols");
  localStorage.setItem(key, "preserve-A");
  const invoke = vi.fn().mockResolvedValue({ error: null, response: new Response(null, { status: 204 }) });
  vi.mocked(useWebAuthSession).mockReturnValue({ session: { user: { id: "confirmed-A" }, access_token: "synthetic-token" }, client: { functions: { invoke } }, clearSessionStorage: vi.fn() } as unknown as ReturnType<typeof useWebAuthSession>);
  const original = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
    if (key.endsWith(":deleted")) throw new DOMException("Synthetic quota", "QuotaExceededError");
    original.call(this, key, value);
  });
  const { result } = renderHook(() => useAccountDeleteOrchestrator());
  await act(async () => result.current.submit());
  expect(result.current.state).toBe("failure");
  expect(invoke).toHaveBeenCalledTimes(1);
  expect(localStorage.getItem(key)).toBe("preserve-A");
  expect(localStorage.getItem(`${accountPrefix("confirmed-A")}deletion-intent`)).not.toBeNull();
  render(<AccountDeletionRecoveryNotice />);
  expect(screen.queryByRole("button", { name: "Retry local cleanup" })).toBeNull();
});
