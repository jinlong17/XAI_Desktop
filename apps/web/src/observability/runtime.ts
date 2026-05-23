import { createObservabilityController } from "./controller";
import { readObservabilityConsent } from "./consent";
import { resolveRouteGroup } from "./routeGroup";
import { createBrowserObservabilityTransport } from "./transport";
import type { ObservabilityEvent } from "./types";
import type { ObservabilityController } from "./controller";

const controller = createObservabilityController(
  typeof window === "undefined" ? "unknown" : readObservabilityConsent(window.localStorage)
);

function withDefaultRouteGroup(event: Omit<ObservabilityEvent, "routeGroup"> & { routeGroup?: ObservabilityEvent["routeGroup"] }) {
  return {
    ...event,
    routeGroup: event.routeGroup ?? resolveRouteGroup(typeof window === "undefined" ? "/" : window.location.pathname),
  };
}

export function getObservabilityController(): ObservabilityController {
  return controller;
}

function resolveEnvironment(): "web-dev" | "web-staging" | "web-prod" {
  const raw = (import.meta.env.MODE ?? "").toLowerCase();
  if (raw === "production") {
    return "web-prod";
  }
  if (raw === "staging") {
    return "web-staging";
  }
  return "web-dev";
}

function resolveRelease(): string {
  const raw = import.meta.env.VITE_RELEASE;
  return typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : "web@dev";
}

async function bootstrapWebVitalsAttribution(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const mod = await import("web-vitals/attribution");
    const callbacks = ["onCLS", "onINP", "onLCP", "onTTFB"] as const;

    for (const callbackName of callbacks) {
      const register = mod[callbackName];
      if (typeof register !== "function") {
        continue;
      }

      (register as (fn: (metric: unknown) => void) => void)((metric) => {
        reportRumMetric(metric);
      });
    }
  } catch {
    // Runtime keeps functioning without web-vitals/attribution dependency.
  }
}

export function bootstrapObservability(): void {
  const transport = createBrowserObservabilityTransport({
    environment: resolveEnvironment(),
    release: resolveRelease(),
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
    fetchImpl: typeof fetch === "function" ? fetch : undefined,
  });
  controller.setTransport(transport);
  controller.initialize();
  void bootstrapWebVitalsAttribution();
}

export function reportObservabilityEvent(event: Omit<ObservabilityEvent, "routeGroup"> & { routeGroup?: ObservabilityEvent["routeGroup"] }): boolean {
  return controller.capture(withDefaultRouteGroup(event));
}

export function reportRumMetric(metric: unknown): boolean {
  return reportObservabilityEvent({
    channel: "rum",
    message: "web_vital",
    context: {
      metric,
    },
  });
}
