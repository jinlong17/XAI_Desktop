import { sanitizeUnknown, sanitizeUrlPath } from "./privacy";
import type { ObservabilityRouteGroup } from "./types";

const RUM_SENSITIVE_KEY_PATTERN =
  /(?:token|secret|password|authorization|cookie|session|body|payload|query|email|user|account|device|id|hash|fingerprint|entity|correlat|stable|deterministic)/i;

export type RumMetricName = "LCP" | "INP" | "CLS" | "TTFB";
export type RumMetricRating = "good" | "needs-improvement" | "poor";

export interface RumMetric {
  name: RumMetricName;
  value: number;
  rating: RumMetricRating;
  delta?: number;
  attribution?: Record<string, unknown>;
}

export interface RumMetricEnvelope {
  environment: "web-dev" | "web-staging" | "web-prod";
  release: string;
  routeGroup: ObservabilityRouteGroup;
  metrics: RumMetric[];
}

interface RumQueueItem {
  routeGroup: ObservabilityRouteGroup;
  metric: RumMetric;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isRumMetricName(value: unknown): value is RumMetricName {
  return value === "LCP" || value === "INP" || value === "CLS" || value === "TTFB";
}

function isRumMetricRating(value: unknown): value is RumMetricRating {
  return value === "good" || value === "needs-improvement" || value === "poor";
}

function sanitizeAttribution(input: unknown): Record<string, unknown> | undefined {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return undefined;
  }

  const sanitized = sanitizeUnknown(input) as Record<string, unknown>;
  const output: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(sanitized)) {
    if (RUM_SENSITIVE_KEY_PATTERN.test(key)) {
      continue;
    }

    if (typeof value === "string") {
      output[key] = value.includes("://") || value.startsWith("/") ? sanitizeUrlPath(value) : value;
      continue;
    }

    output[key] = value;
  }

  return Object.keys(output).length > 0 ? output : undefined;
}

export function normalizeRumMetric(input: unknown): RumMetric | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return null;
  }

  const record = input as Record<string, unknown>;

  if (!isRumMetricName(record.name) || !isFiniteNumber(record.value) || !isRumMetricRating(record.rating)) {
    return null;
  }

  return {
    name: record.name,
    value: record.value,
    rating: record.rating,
    delta: isFiniteNumber(record.delta) ? record.delta : undefined,
    attribution: sanitizeAttribution(record.attribution),
  };
}

export function normalizeRumPayload(
  payload: unknown,
  defaults: { environment: "web-dev" | "web-staging" | "web-prod"; release: string }
): RumMetricEnvelope[] {
  const values = Array.isArray(payload) ? payload : [payload];
  const normalized: RumMetricEnvelope[] = [];

  for (const value of values) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      continue;
    }

    const record = value as Record<string, unknown>;
    const metricsArray = Array.isArray(record.metrics) ? record.metrics : [];
    const metrics = metricsArray.map((metric) => normalizeRumMetric(metric)).filter((metric): metric is RumMetric => Boolean(metric));

    if (metrics.length === 0) {
      continue;
    }

    normalized.push({
      environment:
        record.environment === "web-dev" || record.environment === "web-staging" || record.environment === "web-prod"
          ? record.environment
          : defaults.environment,
      release: typeof record.release === "string" && record.release.length > 0 ? record.release : defaults.release,
      routeGroup:
        record.routeGroup === "landing" ||
        record.routeGroup === "auth" ||
        record.routeGroup === "app" ||
        record.routeGroup === "module" ||
        record.routeGroup === "not-found" ||
        record.routeGroup === "unknown"
          ? record.routeGroup
          : "unknown",
      metrics,
    });
  }

  return normalized;
}

function isSameOriginPath(endpoint: string): boolean {
  return endpoint.startsWith("/") && !endpoint.startsWith("//");
}

export function createRumBatcher(options: {
  environment: "web-dev" | "web-staging" | "web-prod";
  release: string;
  endpoint?: string;
  fetchImpl?: typeof fetch;
}) {
  const endpoint = options.endpoint ?? "/__rum";
  const fetchImpl = options.fetchImpl;
  const queue: RumQueueItem[] = [];

  async function flush(): Promise<void> {
    if (!fetchImpl || queue.length === 0 || !isSameOriginPath(endpoint)) {
      queue.length = 0;
      return;
    }

    const grouped = new Map<ObservabilityRouteGroup, RumMetric[]>();
    for (const item of queue) {
      const existing = grouped.get(item.routeGroup) ?? [];
      existing.push(item.metric);
      grouped.set(item.routeGroup, existing);
    }

    queue.length = 0;

    for (const [routeGroup, metrics] of grouped.entries()) {
      const payload: RumMetricEnvelope = {
        environment: options.environment,
        release: options.release,
        routeGroup,
        metrics,
      };

      await fetchImpl(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        keepalive: true,
        body: JSON.stringify(payload),
      });
    }
  }

  return {
    enqueue(routeGroup: ObservabilityRouteGroup, metricInput: unknown): boolean {
      const metric = normalizeRumMetric(metricInput);
      if (!metric) {
        return false;
      }

      queue.push({ routeGroup, metric });
      return true;
    },
    flush,
    size(): number {
      return queue.length;
    },
  };
}
