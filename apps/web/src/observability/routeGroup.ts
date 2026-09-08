import type { ObservabilityRouteGroup } from "./types";

function normalizePath(pathname: string): string {
  if (!pathname) {
    return "/";
  }

  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const compact = withLeadingSlash.replace(/\/+/g, "/");
  return compact.length > 1 && compact.endsWith("/") ? compact.slice(0, -1) : compact;
}

export function resolveRouteGroup(pathname: string): ObservabilityRouteGroup {
  const normalized = normalizePath(pathname);

  if (normalized === "/") {
    return "landing";
  }

  if (normalized.startsWith("/auth")) {
    return "auth";
  }

  if (normalized === "/app") {
    return "app";
  }

  if (normalized.startsWith("/app/")) {
    return "module";
  }

  if (normalized.startsWith("/404") || normalized.startsWith("/not-found")) {
    return "not-found";
  }

  return "unknown";
}
