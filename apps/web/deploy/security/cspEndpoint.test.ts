import { describe, expect, it } from "vitest";
import { ingestCspReport } from "./cspEndpoint";

describe("ingestCspReport", () => {
  it("accepts both legacy and reporting-api payloads through one scrub-first path", () => {
    const result = ingestCspReport(
      [
        {
          type: "csp-violation",
          url: "https://xai.example.com/app/todos/777?token=abc",
          body: {
            disposition: "report",
            effectiveDirective: "script-src",
            blockedURL: "data:text/plain,hello",
          },
        },
        {
          "csp-report": {
            "document-uri": "https://xai.example.com/auth/login?next=/app",
            disposition: "report",
            "effective-directive": "style-src",
            "blocked-uri": "inline",
          },
        },
      ],
      {
        environment: "web-dev",
        now: new Date("2026-05-22T00:00:00.000Z"),
      }
    );

    expect(result.status).toBe(202);
    expect(result.accepted).toBe(2);
    expect(result.violations[0].blockedUriClass).toBe("data");
    expect(result.violations[0].documentRouteGroup).toBe("module");
    expect(result.violations[1].blockedUriClass).toBe("inline");
    expect(result.violations[1].documentRouteGroup).toBe("auth");
    expect(JSON.stringify(result.violations)).not.toContain("token=abc");
    expect(JSON.stringify(result.violations)).not.toContain("/todos/777");
    expect(JSON.stringify(result.violations)).not.toContain("?next=/app");
  });
});
