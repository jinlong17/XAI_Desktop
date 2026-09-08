import { describe, expect, it } from "vitest";
import { buildSecurityHeaders } from "./headers";

describe("buildSecurityHeaders", () => {
  it("builds report-only headers with nonce and reporting endpoints", () => {
    const headers = buildSecurityHeaders({ mode: "report-only", nonce: "abc123" });

    expect(headers["Content-Security-Policy-Report-Only"]).toContain("'nonce-abc123'");
    expect(headers["Content-Security-Policy-Report-Only"]).toContain("report-uri /__csp_report");
    expect(headers["Content-Security-Policy-Report-Only"]).toContain("report-to csp-endpoint");
    expect(headers["Reporting-Endpoints"]).toBe('csp-endpoint="/__csp_report"');
  });

  it("builds enforce mode headers", () => {
    const headers = buildSecurityHeaders({ mode: "enforce", nonce: "def456" });

    expect(headers["Content-Security-Policy"]).toContain("'nonce-def456'");
    expect(headers["Content-Security-Policy"]).toContain("report-uri /__csp_report");
    expect(headers["Content-Security-Policy"]).not.toContain("report-to");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
  });
});
