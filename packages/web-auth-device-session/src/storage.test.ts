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
});
