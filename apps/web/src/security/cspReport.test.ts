import { describe, expect, it } from "vitest";
import { normalizeCspReportPayload } from "./cspReport";

describe("normalizeCspReportPayload", () => {
  it("normalizes legacy csp-report payload with scrubbed fields", () => {
    const input = {
      "csp-report": {
        "document-uri": "https://xai.example.com/app/todos/12345?token=secret",
        disposition: "report",
        "effective-directive": "script-src-elem",
        "violated-directive": "script-src",
        "blocked-uri": "https://tracker.example.com/script.js?uid=777",
        "status-code": 200,
        "source-file": "/src/main.tsx",
        "script-sample": "user content should never persist",
      },
    };

    const output = normalizeCspReportPayload(input, {
      environment: "web-staging",
      now: new Date("2026-05-22T00:00:00.000Z"),
    });

    expect(output).toHaveLength(1);
    const first = output[0];
    expect(first).toBeDefined();
    expect(first).toMatchObject({
      environment: "web-staging",
      disposition: "report",
      effectiveDirective: "script-src-elem",
      violatedDirective: "script-src",
      blockedUriClass: "external",
      documentRouteGroup: "module",
      statusCode: 200,
      sourceFileClass: "self",
    });
    expect(Object.keys(first ?? {}).sort()).toEqual([
      "blockedUriClass",
      "disposition",
      "documentRouteGroup",
      "effectiveDirective",
      "environment",
      "receivedAt",
      "sourceFileClass",
      "statusCode",
      "violatedDirective",
    ]);
    expect(JSON.stringify(first)).not.toContain("token=secret");
    expect(JSON.stringify(first)).not.toContain("uid=777");
    expect(JSON.stringify(first)).not.toContain("script-sample");
    expect(JSON.stringify(first)).not.toContain("12345");
    expect(JSON.stringify(first)).not.toContain("user content should never persist");
  });

  it("normalizes reporting api payload", () => {
    const input = [
      {
        type: "csp-violation",
        url: "https://xai.example.com/auth/login?next=/app",
        body: {
          disposition: "enforce",
          effectiveDirective: "style-src-elem",
          violatedDirective: "style-src",
          blockedURL: "inline",
          sourceFile: "chrome-extension://plugin/script.js",
          statusCode: "403",
        },
      },
    ];

    const output = normalizeCspReportPayload(input, {
      environment: "web-prod",
      now: new Date("2026-05-22T00:00:00.000Z"),
    });

    expect(output).toHaveLength(1);
    const first = output[0];
    expect(first).toBeDefined();
    expect(first).toMatchObject({
      environment: "web-prod",
      disposition: "enforce",
      effectiveDirective: "style-src-elem",
      violatedDirective: "style-src",
      blockedUriClass: "inline",
      documentRouteGroup: "auth",
      statusCode: 403,
      sourceFileClass: "extension",
    });
    expect(JSON.stringify(first)).not.toContain("?next=");
    expect(JSON.stringify(first)).not.toContain("/auth/login");
  });
});
