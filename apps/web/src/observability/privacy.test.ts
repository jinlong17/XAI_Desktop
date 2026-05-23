import { describe, expect, it } from "vitest";
import { sanitizeText, sanitizeUnknown, sanitizeUrlPath, stripQueryAndHash } from "./privacy";

describe("privacy helpers", () => {
  it("strips query and hash data", () => {
    expect(stripQueryAndHash("/app/todos?token=abc#section")).toBe("/app/todos");
  });

  it("scrubs ids from URL-like paths", () => {
    expect(sanitizeUrlPath("https://example.com/app/todos/123456?token=abc")).toBe("/app/todos/:id");
    expect(sanitizeUrlPath("/app/todos/550e8400-e29b-41d4-a716-446655440000")).toBe("/app/todos/:entity");
  });

  it("scrubs identifier-like tokens from text", () => {
    expect(sanitizeText("failure user=550e8400-e29b-41d4-a716-446655440000?token=abc")).toBe(
      "failure user=[redacted-uuid]"
    );
    expect(sanitizeText("task 777 failed")).toBe("task [redacted-id] failed");
  });

  it("drops sensitive object keys recursively", () => {
    const output = sanitizeUnknown({
      route: "/app/todos/123",
      token: "abc",
      nested: {
        userId: "u-1",
        label: "safe",
      },
    }) as Record<string, unknown>;

    expect(output).toEqual({
      route: "/app/todos/[redacted-id]",
      nested: {
        label: "safe",
      },
    });
  });
});
