import { describe, expect, it, vi } from "vitest";
import {
  clearPkceState,
  readPkceState,
  requestPasswordReset,
  signUpWithEmail,
  startOAuthLogin,
  deleteAccount,
  AccountDeleteError,
  type StringStorage
} from "./auth-actions";
import { FunctionsHttpError, type SupabaseClient } from "@supabase/supabase-js";

function createStorage(): StringStorage {
  const map = new Map<string, string>();
  return {
    getItem(key) {
      return map.get(key) ?? null;
    },
    setItem(key, value) {
      map.set(key, value);
    },
    removeItem(key) {
      map.delete(key);
    }
  };
}

function createClient() {
  return {
    auth: {
      signUp: vi.fn(async () => ({ data: { user: null }, error: null })),
      signInWithOAuth: vi.fn(async () => ({ data: { url: "https://example.test/oauth" }, error: null })),
      resetPasswordForEmail: vi.fn(async () => ({ data: {}, error: null }))
    }
  } as unknown as SupabaseClient;
}

describe("auth actions", () => {
  it("stores PKCE transient state on oauth start", async () => {
    const storage = createStorage();
    const client = createClient();

    await startOAuthLogin(client, "google", "/app/tasks", "https://xai.local", storage);

    const state = readPkceState(storage);
    expect(state?.nextPath).toBe("/app/tasks");
    expect(state?.createdAt).toBeTypeOf("number");
    expect(client.auth.signInWithOAuth).toHaveBeenCalledTimes(1);
  });

  it("uses safe fallback next path and clears transient state", async () => {
    const storage = createStorage();
    const client = createClient();

    await startOAuthLogin(client, "apple", "https://evil.example", "https://xai.local", storage);
    expect(readPkceState(storage)?.nextPath).toBe("/app");

    clearPkceState(storage);
    expect(readPkceState(storage)).toBeNull();
  });

  it("builds password reset callback url", async () => {
    const client = createClient();

    await requestPasswordReset(client, "a@test.dev", "/app/board", "https://xai.local");

    expect(client.auth.resetPasswordForEmail).toHaveBeenCalledWith("a@test.dev", {
      redirectTo: "https://xai.local/auth/reset-password?next=%2Fapp%2Fboard"
    });
  });

  it("sets email verification redirect to /auth/verify", async () => {
    const client = createClient();

    await signUpWithEmail(client, "a@test.dev", "password123", "/app/tasks", "https://xai.local");

    expect(client.auth.signUp).toHaveBeenCalledWith({
      email: "a@test.dev",
      password: "password123",
      options: {
        emailRedirectTo: "https://xai.local/auth/verify?next=%2Fapp%2Ftasks"
      }
    });
  });
});

// ---------------------------------------------------------------------------
// DAA-1..8 — deleteAccount() tests (extension 2026-05-26 — gap-closure row #9)
// ---------------------------------------------------------------------------

function createDeleteClient(
  invokeResult: { error?: { status?: number; context?: Response } | null; data?: unknown; response?: Response; status?: number } = { error: null, data: {} },
  signOutError: unknown = null,
  invokeThrows?: unknown
) {
  return {
    functions: {
      invoke: invokeThrows !== undefined
        ? vi.fn(async () => { throw invokeThrows; })
        : vi.fn(async () => invokeResult),
    },
    auth: {
      signOut: signOutError
        ? vi.fn(async () => { throw signOutError; })
        : vi.fn(async () => ({ error: null })),
    },
  } as unknown as SupabaseClient;
}

describe("deleteAccount (gap-closure row #9)", () => {
  it("DAA-1: happy path — functions.invoke called once with account-delete", async () => {
    const client = createDeleteClient();
    await deleteAccount(client);
    expect((client.functions.invoke as ReturnType<typeof vi.fn>)).toHaveBeenCalledTimes(1);
    expect((client.functions.invoke as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith(
      "account-delete",
      { method: "POST" }
    );
  });

  it("DAA-2: happy path — auth.signOut called once after invoke resolves", async () => {
    const client = createDeleteClient();
    await deleteAccount(client);
    expect((client.auth.signOut as ReturnType<typeof vi.fn>)).toHaveBeenCalledTimes(1);
  });

  it("DAA-3: network throw — throws AccountDeleteError with kind=network", async () => {
    const client = createDeleteClient({}, null, new TypeError("fetch failed"));
    await expect(deleteAccount(client)).rejects.toMatchObject({
      kind: "network",
    });
  });

  it("DAA-4: 401 response — throws AccountDeleteError with kind=unauthorized", async () => {
    const client = createDeleteClient({ error: { status: 401 } });
    await expect(deleteAccount(client)).rejects.toMatchObject({
      kind: "unauthorized",
    });
    expect((client.auth.signOut as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
  });

  it("DAA-5: 403 response — throws AccountDeleteError with kind=forbidden", async () => {
    const client = createDeleteClient({ error: { status: 403 } });
    await expect(deleteAccount(client)).rejects.toMatchObject({
      kind: "forbidden",
    });
  });

  it("DAA-6: 500 response — throws AccountDeleteError with kind=server", async () => {
    const client = createDeleteClient({ error: { status: 500 } });
    await expect(deleteAccount(client)).rejects.toMatchObject({
      kind: "server",
    });
  });

  it("DAA-7: a generic 404 cannot authorize local deletion or sign-out", async () => {
    const client = createDeleteClient({ error: { status: 404 } });
    await expect(deleteAccount(client)).rejects.toMatchObject({ kind: "server" });
    expect(client.auth.signOut).not.toHaveBeenCalled();
  });

  it.each([
    '{"code":"NOT_FOUND","message":"Requested function was not found"}',
    '{"code":"already_deleted"}',
    '<html>Route not found</html>',
    '{invalid',
  ])("rejects real FunctionsHttpError 404 without inventing a business contract: %s", async (body) => {
    const response = new Response(body, { status: 404 });
    const client = createDeleteClient({ error: new FunctionsHttpError(response), data: null });
    await expect(deleteAccount(client)).rejects.toMatchObject({ kind: "server" });
    expect(client.auth.signOut).not.toHaveBeenCalled();
    // Unknown error payloads are not consumed or treated as deletion authority.
    expect(await response.clone().text()).toBe(body);
  });

  it.each([401, 403, 500])("maps SDK Response status %s", async (status) => {
    const response = new Response('{}', { status });
    const client = createDeleteClient({ error: new FunctionsHttpError(response), response });
    await expect(deleteAccount(client)).rejects.toMatchObject({
      kind: status === 401 ? "unauthorized" : status === 403 ? "forbidden" : "server",
    });
    expect(client.auth.signOut).not.toHaveBeenCalled();
  });

  it("rejects response-only 404 even if an adapter supplies no error", async () => {
    const client = createDeleteClient({ error: null, data: { code: "already_deleted" }, response: new Response('{}', { status: 404 }) });
    await expect(deleteAccount(client, { signOutAfterDelete: false })).rejects.toMatchObject({ kind: "server" });
    expect(client.auth.signOut).not.toHaveBeenCalled();
  });

  it.each([200, 204])("preserves existing successful HTTP %s receipts", async (status) => {
    const client = createDeleteClient({ error: null, data: status === 200 ? { success: true } : null, response: new Response(null, { status }) });
    await expect(deleteAccount(client)).resolves.toBeUndefined();
    expect(client.auth.signOut).toHaveBeenCalledTimes(1);
  });

  it("DAA-8: signOut failure — does NOT throw (best-effort, R9: account is gone)", async () => {
    const client = createDeleteClient({ error: null, data: {} }, new Error("sign-out network error"));
    // Should resolve without throwing even when signOut throws.
    await expect(deleteAccount(client)).resolves.toBeUndefined();
  });

  it("DAA-TYPED: AccountDeleteError is instanceof AccountDeleteError and Error", () => {
    const err = new AccountDeleteError("network", "test");
    expect(err).toBeInstanceOf(AccountDeleteError);
    expect(err).toBeInstanceOf(Error);
    expect(err.kind).toBe("network");
    expect(err.name).toBe("AccountDeleteError");
  });
});

it('binds deletion to the initiating token and leaves replacement account sign-out to the owner', async () => {
  const client = createDeleteClient();
  await deleteAccount(client, { accessToken: 'synthetic-account-A-token', signOutAfterDelete: false });
  expect(client.functions.invoke).toHaveBeenCalledWith('account-delete', {
    method: 'POST', headers: { Authorization: 'Bearer synthetic-account-A-token' },
  });
  expect(client.auth.signOut).not.toHaveBeenCalled();
});
