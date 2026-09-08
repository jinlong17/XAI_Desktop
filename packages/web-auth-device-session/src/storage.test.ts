import { describe, expect, it } from "vitest";
import { createAuthSessionStorage, createMemoryKeyValueStore } from "./storage";

describe("createAuthSessionStorage", () => {
  it("supports get/set/remove", async () => {
    const store = createMemoryKeyValueStore();
    const storage = createAuthSessionStorage({ store });

    await storage.setItem("token", "abc");
    expect(await storage.getItem("token")).toBe("abc");

    await storage.removeItem("token");
    expect(await storage.getItem("token")).toBeNull();
  });

  it("routes PKCE verifier keys to transient storage", async () => {
    const durableStore = createMemoryKeyValueStore();
    const transientStore = createMemoryKeyValueStore();
    const storage = createAuthSessionStorage({ store: durableStore, transientStore });

    await storage.setItem("xai-web-auth-auth-token", "session-token");
    await storage.setItem("xai-web-auth-code-verifier", "pkce-verifier");

    expect(await durableStore.getItem("xai-web-auth-auth-token")).toBe("session-token");
    expect(await transientStore.getItem("xai-web-auth-auth-token")).toBeNull();

    expect(await durableStore.getItem("xai-web-auth-code-verifier")).toBeNull();
    expect(await transientStore.getItem("xai-web-auth-code-verifier")).toBe("pkce-verifier");
  });
});
