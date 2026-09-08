import { buildCspPolicy, buildReportingEndpointsHeader, type CspPolicyMode } from "../../src/security/cspPolicy";

export interface BuildSecurityHeadersOptions {
  mode: CspPolicyMode;
  nonce: string;
  reportEndpoint?: string;
  reportGroup?: string;
  connectSrc?: string[];
}

export function buildSecurityHeaders({
  mode,
  nonce,
  reportEndpoint = "/__csp_report",
  reportGroup = "csp-endpoint",
  connectSrc,
}: BuildSecurityHeadersOptions): Record<string, string> {
  const cspHeaderName = mode === "report-only" ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy";

  return {
    [cspHeaderName]: buildCspPolicy({ mode, nonce, reportEndpoint, reportGroup, connectSrc }),
    "Reporting-Endpoints": buildReportingEndpointsHeader(reportEndpoint, reportGroup),
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  };
}
