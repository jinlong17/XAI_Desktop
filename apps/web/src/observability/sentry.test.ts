import { describe, expect, it } from "vitest";
import { sanitizeSentryBreadcrumb, sanitizeSentryEvent } from "./sentry";

describe("sentry privacy filters", () => {
  it("removes id/token/user/query-bearing fields from events", () => {
    const event = sanitizeSentryEvent({
      message: "failed at /app/todos/123?token=abc",
      tags: {
        route_group: "module",
        user_id: "u-1",
      },
      extra: {
        accountId: "account-1",
        requestBody: { token: "abc" },
        safe: "ok",
      },
      contexts: {
        correlation_hash: "stablehash",
        release: "web@1.0.0",
      },
      exception: {
        values: [{ type: "TypeError", value: "boom for user 550e8400-e29b-41d4-a716-446655440000" }],
      },
    });

    expect(event).not.toBeNull();
    expect(event?.message).toBe("failed at /app/todos/123");
    expect(event?.tags).toEqual({ route_group: "module" });
    expect(event?.extra).toEqual({ safe: "ok" });
    expect(event?.contexts).toEqual({ release: "web@1.0.0" });
    expect(JSON.stringify(event)).not.toContain("token=abc");
    expect(JSON.stringify(event)).not.toContain("u-1");
    expect(JSON.stringify(event)).not.toContain("stablehash");
  });

  it("sanitizes breadcrumbs and strips sensitive data", () => {
    const breadcrumb = sanitizeSentryBreadcrumb({
      category: "http",
      message: "POST /api/items?token=abc",
      data: {
        query: "token=abc",
        userId: "u-1",
        url: "https://xai.example.com/app/todos/888?token=secret",
      },
    });

    expect(breadcrumb).not.toBeNull();
    expect(breadcrumb?.message).toBe("POST /api/items");
    expect(breadcrumb?.data).toEqual({ url: "/app/todos/:id" });
  });
});
