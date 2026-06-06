import { describe, expect, it } from "vitest";
import { createMockBoardShareEnvelope } from "../internal/shareContract.js";

describe("createMockBoardShareEnvelope", () => {
  it("SCON-1: creates an explicit mock share envelope", async () => {
    const envelope = await createMockBoardShareEnvelope("b-default");

    expect(envelope).toMatchObject({
      schemaVersion: 1,
      mode: "mock",
      boardId: "b-default",
      visibility: "private",
      permission: "view",
      expiresAt: null,
      backend: "unimplemented",
    });
    expect(envelope.url).toMatch(/^https:\/\/xai-web\.example\/share\/[0-9a-f]{8}$/);
  });

  it("SCON-2: remains deterministic for the same board id", async () => {
    const first = await createMockBoardShareEnvelope("b-default");
    const second = await createMockBoardShareEnvelope("b-default");

    expect(second).toEqual(first);
  });

  it("SCON-3: includes the supplied board visibility", async () => {
    const envelope = await createMockBoardShareEnvelope("b-default", "shared");

    expect(envelope.visibility).toBe("shared");
  });
});
