import { createObservabilityController } from "./controller";
import { readObservabilityConsent } from "./consent";
import { resolveRouteGroup } from "./routeGroup";
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

export function bootstrapObservability(): void {
  controller.initialize();
}

export function reportObservabilityEvent(event: Omit<ObservabilityEvent, "routeGroup"> & { routeGroup?: ObservabilityEvent["routeGroup"] }): boolean {
  return controller.capture(withDefaultRouteGroup(event));
}
