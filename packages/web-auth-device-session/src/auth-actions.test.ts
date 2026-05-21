import { describe, expect, it, vi } from "vitest";
import {
  clearPkceState,
  readPkceState,
  requestPasswordReset,
  signUpWithEmail,
  startOAuthLogin,
  type StringStorage
} from "./auth-actions";
import type { SupabaseClient } from "@supabase/supabase-js";

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
