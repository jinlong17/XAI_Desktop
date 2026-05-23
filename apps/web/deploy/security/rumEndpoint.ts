import { normalizeRumPayload, type RumMetricEnvelope } from "../../src/observability/rum";

export interface RumEndpointResult {
  status: number;
  accepted: number;
  payloads: RumMetricEnvelope[];
}

export function ingestRumPayload(
  payload: unknown,
  options: { environment: "web-dev" | "web-staging" | "web-prod"; release: string }
): RumEndpointResult {
  const payloads = normalizeRumPayload(payload, options);
  const accepted = payloads.reduce((total, entry) => total + entry.metrics.length, 0);

  return {
    status: 202,
    accepted,
    payloads,
  };
}
