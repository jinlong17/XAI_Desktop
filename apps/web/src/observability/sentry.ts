import { sanitizeUrlPath } from "./privacy";
import type { ObservabilityEvent, ObservabilityRouteGroup } from "./types";

const SENSITIVE_KEY_PATTERN =
  /(?:token|secret|password|authorization|cookie|session|body|payload|query|email|user|account|device|id|hash|fingerprint|entity|correlat|stable|deterministic)/i;
const SAFE_VALUE_PATTERN = /^[a-z0-9_.:@-]{1,128}$/i;
const ALLOWED_TAG_KEYS = new Set(["route_group", "environment", "release", "error_category"]);
const REDACTED_EVENT_MESSAGE = "redacted_error";
const REDACTED_BREADCRUMB_MESSAGE = "redacted_breadcrumb";

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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeSafeToken(input: string): string | undefined {
  if (!SAFE_VALUE_PATTERN.test(input)) {
    return undefined;
  }

  return input;
}

function sanitizeStrictValue(value: unknown): unknown {
  if (typeof value === "string") {
    if (value.startsWith("/") || value.includes("://")) {
      return sanitizeUrlPath(value);
    }
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    const entries = value.map((entry) => sanitizeStrictValue(entry)).filter((entry) => entry !== undefined);
    return entries.length > 0 ? entries : undefined;
  }

  if (isPlainObject(value)) {
    const nested = sanitizeObject(value);
    return Object.keys(nested).length > 0 ? nested : undefined;
  }

  return undefined;
}

function sanitizeObject(record: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      continue;
    }
    const sanitizedValue = sanitizeStrictValue(value);
    if (sanitizedValue !== undefined) {
      sanitized[key] = sanitizedValue;
    }
  }
  return sanitized;
}

function sanitizeTags(record: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(record)) {
    if (!ALLOWED_TAG_KEYS.has(key) || SENSITIVE_KEY_PATTERN.test(key)) {
      continue;
    }

    const safeValue = sanitizeSafeToken(value);
    if (safeValue) {
      sanitized[key] = safeValue;
    }
  }
  return sanitized;
}

export function sanitizeSentryEvent(event: SentryLikeEvent): SentryLikeEvent | null {
  const hasSignal = Boolean(event.message) || Boolean(event.exception?.values?.length);
  if (!hasSignal) {
    return null;
  }

  const values = (event.exception?.values ?? [])
    .map((value) => ({
      type: value.type ? sanitizeSafeToken(value.type) : undefined,
    }))
    .filter((value) => value.type);

  const tags = event.tags ? sanitizeTags(event.tags) : undefined;
  const extra = event.extra ? sanitizeObject(event.extra) : undefined;
  const contexts = event.contexts ? sanitizeObject(event.contexts) : undefined;

  return {
    message: REDACTED_EVENT_MESSAGE,
    level: event.level,
    tags,
    extra,
    contexts,
    exception: values.length > 0 ? { values } : undefined,
  };
}

export function sanitizeSentryBreadcrumb(breadcrumb: SentryLikeBreadcrumb): SentryLikeBreadcrumb | null {
  const message = breadcrumb.message ? REDACTED_BREADCRUMB_MESSAGE : undefined;
  const data = breadcrumb.data ? sanitizeObject(breadcrumb.data) : undefined;
  const category = breadcrumb.category ? sanitizeSafeToken(breadcrumb.category) : undefined;

  if (!category && !message && !data) {
    return null;
  }

  return {
    category,
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
    extra: {
      event_channel: event.channel,
    },
  };
}
