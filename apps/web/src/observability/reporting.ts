import { resolveRouteGroup } from "./routeGroup";
import { sanitizeText, sanitizeUnknown } from "./privacy";
import { reportObservabilityEvent } from "./runtime";

export function reportRouteError(scope: string, error: unknown): void {
  const message = resolveErrorMessage(error);
  const routeGroup = resolveRouteGroup(typeof window === "undefined" ? "/" : window.location.pathname);

  reportObservabilityEvent({
    channel: "error",
    routeGroup,
    message,
    context: sanitizeUnknown({ scope, name: error instanceof Error ? error.name : "route_error" }) as Record<string, unknown>,
  });
}

function resolveErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return sanitizeText(error.message || "error");
  }

  if (typeof error === "string") {
    return sanitizeText(error);
  }

  return "unknown_route_error";
}
