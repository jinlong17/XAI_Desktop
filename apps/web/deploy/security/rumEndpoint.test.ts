import { describe, expect, it } from "vitest";
import { ingestRumPayload } from "./rumEndpoint";

describe("ingestRumPayload", () => {
  it("normalizes same-origin rum payloads and strips sensitive fields", () => {
    const result = ingestRumPayload(
      {
        environment: "web-prod",
        release: "web@2.0.0",
        routeGroup: "module",
        metrics: [
          {
            name: "LCP",
            value: 1200,
            rating: "good",
            attribution: {
              url: "https://xai.example.com/app/todos/1234?token=abc",
              userId: "u-1",
              query: "token=abc",
              navigationType: "navigate",
              note: "Buy milk",
            },
          },
        ],
      },
      { environment: "web-dev", release: "fallback" }
    );

    expect(result.status).toBe(202);
    expect(result.accepted).toBe(1);
    expect(result.payloads).toHaveLength(1);
    expect(result.payloads[0].routeGroup).toBe("module");
    expect(result.payloads[0].metrics[0].attribution).toEqual({
      url: "/app/todos/:id",
      navigationType: "navigate",
    });
    expect(JSON.stringify(result.payloads)).not.toContain("token=abc");
    expect(JSON.stringify(result.payloads)).not.toContain("u-1");
    expect(JSON.stringify(result.payloads)).not.toContain("Buy milk");
  });
});
