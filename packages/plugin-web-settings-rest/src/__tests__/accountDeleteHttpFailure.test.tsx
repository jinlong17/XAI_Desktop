/** Integration boundary: real deleteAccount and orchestrator; only auth context is supplied. */
import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { accountPrefix, accountScope } from "@repo/plugin-web-storage";
import { useWebAuthSession } from "@repo/web-auth-device-session/web";
import { useAccountDeleteOrchestrator } from "../internal/useAccountDeleteOrchestrator.js";

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
