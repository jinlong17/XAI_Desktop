export interface ResolveSafeNextPathOptions {
  fallbackPath?: string;
  allowlist?: readonly string[];
}

export interface ResolvedNextPath {
  path: string;
  rejected: boolean;
  reason?: "empty" | "absolute_url" | "protocol_relative" | "path_not_allowed";
}

const DEFAULT_FALLBACK_PATH = "/app";
const DEFAULT_ALLOWLIST = ["/app", "/app/*", "/auth/callback", "/auth/verify", "/auth/reset-password"] as const;

function hasScheme(value: string): boolean {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value);
}

function normalizePath(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/")) {
    return trimmed;
  }

  const [pathPart = "", hash = ""] = trimmed.split("#", 2);
  const [pathname = "", search = ""] = pathPart.split("?", 2);
  const cleaned = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

  const suffix = [search ? `?${search}` : "", hash ? `#${hash}` : ""].join("");
  return `${cleaned}${suffix}`;
}

function matchesAllowlist(pathname: string, allowlist: readonly string[]): boolean {
  return allowlist.some((pattern) => {
    if (pattern.endsWith("/*")) {
      const prefix = pattern.slice(0, -1);
      return pathname.startsWith(prefix);
    }

    return pathname === pattern;
  });
}

export function resolveSafeNextPath(
  value: string | null | undefined,
  options: ResolveSafeNextPathOptions = {}
): ResolvedNextPath {
  const fallbackPath = options.fallbackPath ?? DEFAULT_FALLBACK_PATH;
  const allowlist = options.allowlist ?? DEFAULT_ALLOWLIST;

  if (!value) {
    return { path: fallbackPath, rejected: false, reason: "empty" };
  }

  const decoded = decodeURIComponent(value);
  const normalized = normalizePath(decoded);

  if (normalized.startsWith("//")) {
    return { path: fallbackPath, rejected: true, reason: "protocol_relative" };
  }

  if (hasScheme(normalized)) {
    return { path: fallbackPath, rejected: true, reason: "absolute_url" };
  }

  if (!normalized.startsWith("/")) {
    return { path: fallbackPath, rejected: true, reason: "path_not_allowed" };
  }

  const pathname = normalized.split("?")[0]?.split("#")[0] ?? normalized;
  if (!matchesAllowlist(pathname, allowlist)) {
    return { path: fallbackPath, rejected: true, reason: "path_not_allowed" };
  }

  return { path: normalized, rejected: false };
}
