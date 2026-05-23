import { sanitizeText, sanitizeUnknown, sanitizeUrlPath } from "./privacy";
import type { ObservabilityEvent, ObservabilityRouteGroup } from "./types";

const SENSITIVE_KEY_PATTERN =
  /(?:token|secret|password|authorization|cookie|session|body|payload|query|email|user|account|device|id|hash|fingerprint|entity|correlat|stable|deterministic)/i;

export interface SentryLikeBreadcrumb {
  category?: string;
  message?: string;
  data?: Record<string, unknown>;
  level?: string;
}

export interface SentryLikeEvent {
  message?: string;
  level?: string;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  contexts?: Record<string, unknown>;
  exception?: {
    values?: Array<{
      type?: string;
      value?: string;
    }>;
  };
}

export interface SentryCaptureContext {
  level: "error" | "warning" | "info";
  tags: {
    route_group: ObservabilityRouteGroup;
    environment: string;
    release: string;
    error_category: string;
  };
  extra: Record<string, unknown>;
}

export interface SentryInitOptions {
  dsn: string;
  environment: string;
  release: string;
  sendDefaultPii: boolean;
  allowUrls: RegExp[];
  denyUrls: RegExp[];
  tracePropagationTargets: string[];
  beforeSend: (event: SentryLikeEvent) => SentryLikeEvent | null;
  beforeBreadcrumb: (breadcrumb: SentryLikeBreadcrumb) => SentryLikeBreadcrumb | null;
}

export interface SentryClient {
  init: (options: SentryInitOptions) => void;
  captureMessage: (message: string, context: SentryCaptureContext) => void;
}

function sanitizeObject(record: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      continue;
    }
    if (typeof value === "string") {
      const looksLikePath = value.startsWith("/") || value.includes("://");
      sanitized[key] = looksLikePath ? sanitizeUrlPath(value) : sanitizeText(value);
      continue;
    }

    sanitized[key] = sanitizeUnknown(value);
  }
  return sanitized;
}

function sanitizeTags(record: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(record)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      continue;
    }

    sanitized[key] = sanitizeText(value);
  }
  return sanitized;
}

export function sanitizeSentryEvent(event: SentryLikeEvent): SentryLikeEvent | null {
  const message = event.message ? sanitizeText(event.message) : undefined;

  const values = (event.exception?.values ?? [])
    .map((value) => ({
      type: value.type ? sanitizeText(value.type) : undefined,
      value: value.value ? sanitizeText(value.value) : undefined,
    }))
    .filter((value) => value.type || value.value);

  const tags = event.tags ? sanitizeTags(event.tags) : undefined;
  const extra = event.extra ? sanitizeObject(event.extra) : undefined;
  const contexts = event.contexts ? sanitizeObject(event.contexts) : undefined;

  if (!message && values.length === 0) {
    return null;
  }

  return {
    message,
    level: event.level,
    tags,
    extra,
    contexts,
    exception: values.length > 0 ? { values } : undefined,
  };
}

export function sanitizeSentryBreadcrumb(breadcrumb: SentryLikeBreadcrumb): SentryLikeBreadcrumb | null {
  const message = breadcrumb.message ? sanitizeText(breadcrumb.message) : undefined;
  const data = breadcrumb.data ? sanitizeObject(breadcrumb.data) : undefined;

  if (!breadcrumb.category && !message && !data) {
    return null;
  }

  return {
    category: breadcrumb.category ? sanitizeText(breadcrumb.category) : undefined,
    message,
    data,
    level: breadcrumb.level,
  };
}

function resolveErrorCategory(event: ObservabilityEvent): string {
  if (event.channel === "csp") {
    return "csp_violation";
  }

  if (event.channel === "rum") {
    return "rum_metric";
  }

  return "runtime_error";
}

export function toSentryCaptureContext(event: ObservabilityEvent, runtime: { environment: string; release: string }): SentryCaptureContext {
  return {
    level: "error",
    tags: {
      route_group: event.routeGroup,
      environment: runtime.environment,
      release: runtime.release,
      error_category: resolveErrorCategory(event),
    },
    extra: (sanitizeUnknown(event.context ?? {}) as Record<string, unknown>) ?? {},
  };
}
