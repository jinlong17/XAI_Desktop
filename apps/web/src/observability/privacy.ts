const SENSITIVE_KEY_PATTERN = /(?:token|secret|password|authorization|cookie|session|body|payload|query|email|user|account|device|id|key)/i;
const UUID_PATTERN = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i;
const LONG_ID_PATTERN = /\b[a-z0-9_-]{16,}\b/i;
const UUID_PATTERN_GLOBAL = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi;
const LONG_ID_PATTERN_GLOBAL = /\b[a-z0-9_-]{16,}\b/gi;
const NUMERIC_ID_SEGMENT = /^\d{3,}$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizePathSegments(pathname: string): string {
  const segments = pathname
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => {
      if (NUMERIC_ID_SEGMENT.test(segment)) {
        return ":id";
      }

      if (UUID_PATTERN.test(segment) || LONG_ID_PATTERN.test(segment)) {
        return ":entity";
      }

      return segment;
    });

  return segments.length > 0 ? `/${segments.join("/")}` : "/";
}

export function stripQueryAndHash(input: string): string {
  if (!input) {
    return "";
  }

  const queryIndex = input.indexOf("?");
  const hashIndex = input.indexOf("#");
  const cutIndex = [queryIndex, hashIndex].filter((index) => index >= 0).sort((a, b) => a - b)[0];

  if (cutIndex === undefined) {
    return input;
  }

  return input.slice(0, cutIndex);
}

export function sanitizeUrlPath(input: string): string {
  if (!input) {
    return "";
  }

  const stripped = stripQueryAndHash(input);

  try {
    const parsed = new URL(stripped);
    return sanitizePathSegments(parsed.pathname);
  } catch {
    return sanitizePathSegments(stripped);
  }
}

export function sanitizeText(input: string): string {
  if (!input) {
    return "";
  }

  return stripQueryAndHash(input)
    .replace(UUID_PATTERN_GLOBAL, "[redacted-uuid]")
    .replace(LONG_ID_PATTERN_GLOBAL, "[redacted-entity]");
}

export function sanitizeUnknown(value: unknown): unknown {
  if (value == null) {
    return value;
  }

  if (typeof value === "string") {
    return sanitizeText(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeUnknown(entry));
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(value)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      continue;
    }
    sanitized[key] = sanitizeUnknown(entry);
  }

  return sanitized;
}
