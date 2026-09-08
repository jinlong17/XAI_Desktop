import { resolveRouteGroup } from "../observability/routeGroup";
import { sanitizeUrlPath } from "../observability/privacy";

export type BlockedUriClass = "self" | "inline" | "eval" | "data" | "blob" | "external" | "other";

export type SourceFileClass = "self" | "extension" | "external" | "unknown";

export interface ScrubbedCspViolation {
  receivedAt: string;
  environment: "web-dev" | "web-staging" | "web-prod";
  disposition: "report" | "enforce";
  effectiveDirective: string;
  violatedDirective?: string;
  blockedUriClass: BlockedUriClass;
  documentRouteGroup: string;
  statusCode?: number;
  sourceFileClass?: SourceFileClass;
}

interface NormalizeOptions {
  environment: "web-dev" | "web-staging" | "web-prod";
  receivedAt: string;
}

function parseStatusCode(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function toRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function inferBlockedUriClass(blockedUri: string | undefined): BlockedUriClass {
  if (!blockedUri || blockedUri === "self" || blockedUri === "'self'") {
    return "self";
  }

  const normalized = blockedUri.trim().toLowerCase();
  if (normalized === "inline") {
    return "inline";
  }
  if (normalized === "eval") {
    return "eval";
  }
  if (normalized.startsWith("data:")) {
    return "data";
  }
  if (normalized.startsWith("blob:")) {
    return "blob";
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return "external";
  }

  return "other";
}

function inferSourceFileClass(sourceFile: string | undefined): SourceFileClass {
  if (!sourceFile) {
    return "unknown";
  }

  const normalized = sourceFile.trim().toLowerCase();
  if (normalized.startsWith("chrome-extension://") || normalized.startsWith("moz-extension://")) {
    return "extension";
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return "external";
  }

  if (normalized.startsWith("/")) {
    return "self";
  }

  return "unknown";
}

function normalizeFromLegacyReport(report: Record<string, unknown>, options: NormalizeOptions): ScrubbedCspViolation | null {
  const effectiveDirective = report["effective-directive"];
  const violatedDirective = report["violated-directive"];
  if (typeof effectiveDirective !== "string" || effectiveDirective.trim().length === 0) {
    return null;
  }

  const rawDocumentUri = typeof report["document-uri"] === "string" ? report["document-uri"] : "/";
  const sanitizedPath = sanitizeUrlPath(rawDocumentUri);

  return {
    receivedAt: options.receivedAt,
    environment: options.environment,
    disposition: report.disposition === "enforce" ? "enforce" : "report",
    effectiveDirective: effectiveDirective.trim(),
    violatedDirective: typeof violatedDirective === "string" ? violatedDirective.trim() : undefined,
    blockedUriClass: inferBlockedUriClass(
      typeof report["blocked-uri"] === "string" ? report["blocked-uri"] : undefined
    ),
    documentRouteGroup: resolveRouteGroup(sanitizedPath),
    statusCode: parseStatusCode(report["status-code"]),
    sourceFileClass: inferSourceFileClass(typeof report["source-file"] === "string" ? report["source-file"] : undefined),
  };
}

function normalizeFromReportingApi(report: Record<string, unknown>, options: NormalizeOptions): ScrubbedCspViolation | null {
  const body = toRecord(report.body);
  if (!body) {
    return null;
  }

  const effectiveDirective = body.effectiveDirective;
  if (typeof effectiveDirective !== "string" || effectiveDirective.trim().length === 0) {
    return null;
  }

  const rawDocumentUrl = typeof report.url === "string" ? report.url : "/";
  const sanitizedPath = sanitizeUrlPath(rawDocumentUrl);

  return {
    receivedAt: options.receivedAt,
    environment: options.environment,
    disposition: body.disposition === "enforce" ? "enforce" : "report",
    effectiveDirective: effectiveDirective.trim(),
    violatedDirective: typeof body.violatedDirective === "string" ? body.violatedDirective.trim() : undefined,
    blockedUriClass: inferBlockedUriClass(typeof body.blockedURL === "string" ? body.blockedURL : undefined),
    documentRouteGroup: resolveRouteGroup(sanitizedPath),
    statusCode: parseStatusCode(body.statusCode),
    sourceFileClass: inferSourceFileClass(typeof body.sourceFile === "string" ? body.sourceFile : undefined),
  };
}

export function normalizeCspReportPayload(
  payload: unknown,
  options: { environment: "web-dev" | "web-staging" | "web-prod"; now?: Date } = { environment: "web-dev" }
): ScrubbedCspViolation[] {
  const receivedAt = (options.now ?? new Date()).toISOString();
  const normalizeOptions: NormalizeOptions = {
    environment: options.environment,
    receivedAt,
  };

  const values = Array.isArray(payload) ? payload : [payload];
  const normalized: ScrubbedCspViolation[] = [];

  for (const value of values) {
    const record = toRecord(value);
    if (!record) {
      continue;
    }

    if (record.type === "csp-violation") {
      const parsedReporting = normalizeFromReportingApi(record, normalizeOptions);
      if (parsedReporting) {
        normalized.push(parsedReporting);
      }
      continue;
    }

    const legacyWrapper = toRecord(record["csp-report"]);
    if (legacyWrapper) {
      const parsedLegacy = normalizeFromLegacyReport(legacyWrapper, normalizeOptions);
      if (parsedLegacy) {
        normalized.push(parsedLegacy);
      }
    }
  }

  return normalized;
}
