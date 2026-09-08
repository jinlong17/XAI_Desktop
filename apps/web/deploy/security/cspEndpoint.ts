import { normalizeCspReportPayload, type ScrubbedCspViolation } from "../../src/security/cspReport";

export interface CspReportEndpointResult {
  status: number;
  accepted: number;
  violations: ScrubbedCspViolation[];
}

export function ingestCspReport(
  payload: unknown,
  options: { environment: "web-dev" | "web-staging" | "web-prod"; now?: Date }
): CspReportEndpointResult {
  const violations = normalizeCspReportPayload(payload, options);

  return {
    status: 202,
    accepted: violations.length,
    violations,
  };
}
