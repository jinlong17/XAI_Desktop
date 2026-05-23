export type CspPolicyMode = "report-only" | "enforce";

export interface BuildCspPolicyOptions {
  mode: CspPolicyMode;
  nonce: string;
  reportEndpoint?: string;
  reportGroup?: string;
  connectSrc?: string[];
}

function normalizeConnectSrc(origins: string[] | undefined): string {
  if (!origins || origins.length === 0) {
    return "'self'";
  }

  const normalized = origins.map((origin) => origin.trim()).filter((origin) => origin.length > 0);
  return normalized.length > 0 ? normalized.join(" ") : "'self'";
}

export function buildCspPolicy({
  mode,
  nonce,
  reportEndpoint = "/__csp_report",
  reportGroup = "csp-endpoint",
  connectSrc,
}: BuildCspPolicyOptions): string {
  const policyParts = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data: blob:",
    `connect-src ${normalizeConnectSrc(connectSrc)}`,
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ];

  policyParts.push(`report-uri ${reportEndpoint}`);
  if (mode === "report-only") {
    policyParts.push(`report-to ${reportGroup}`);
  }

  return policyParts.join("; ");
}

export function buildReportingEndpointsHeader(reportEndpoint = "/__csp_report", reportGroup = "csp-endpoint"): string {
  return `${reportGroup}=\"${reportEndpoint}\"`;
}
