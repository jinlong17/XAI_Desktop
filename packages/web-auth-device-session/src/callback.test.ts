import { describe, expect, it, vi } from "vitest";
import { AuthCallbackError, handleAuthCallback } from "./callback";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { StringStorage } from "./auth-actions";

function createStorage(seed?: string): StringStorage {
  const map = new Map<string, string>();
  if (seed) {
    map.set("xai.web-auth.pkce", seed);
  }

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
      exchangeCodeForSession: vi.fn(async () => ({ data: { session: { access_token: "token" } }, error: null }))
    }
  } as unknown as SupabaseClient;
}

describe("handleAuthCallback", () => {
  it("fails when PKCE state is missing", async () => {
    const client = createClient();

    await expect(
      handleAuthCallback(client, "https://xai.local/auth/callback?code=123", { storage: createStorage() })
    ).rejects.toMatchObject({ code: "pkce_state_missing" satisfies AuthCallbackError["code"] });
  });

  it("exchanges code and clears state", async () => {
    const storage = createStorage(JSON.stringify({ nextPath: "/app/inbox", createdAt: 1 }));
    const client = createClient();

    const result = await handleAuthCallback(client, "https://xai.local/auth/callback?code=123", { storage });

    expect(result.nextPath).toBe("/app/inbox");
    expect(result.session.access_token).toBe("token");
    expect(client.auth.exchangeCodeForSession).toHaveBeenCalledWith("123");
    expect(storage.getItem("xai.web-auth.pkce")).toBeNull();
  });

  it("rejects missing auth code", async () => {
    const storage = createStorage(JSON.stringify({ nextPath: "/app", createdAt: 1 }));
    const client = createClient();

    await expect(
      handleAuthCallback(client, "https://xai.local/auth/callback", { storage })
    ).rejects.toMatchObject({ code: "pkce_exchange_failed" satisfies AuthCallbackError["code"] });
  });

  it("supports email verification callback without PKCE state", async () => {
    const client = createClient();

    const result = await handleAuthCallback(client, "https://xai.local/auth/verify?code=123&next=%2Fapp%2Finbox", {
      requirePkceState: false
    });

    expect(result.nextPath).toBe("/app/inbox");
    expect(result.session.access_token).toBe("token");
    expect(client.auth.exchangeCodeForSession).toHaveBeenCalledWith("123");
  });
});
