export type ObservabilityConsentState = "unknown" | "granted" | "denied";

export type ObservabilityRouteGroup =
  | "landing"
  | "auth"
  | "app"
  | "module"
  | "not-found"
  | "unknown";

export interface ObservabilityEvent {
  channel: "error" | "rum" | "csp";
  routeGroup: ObservabilityRouteGroup;
  message: string;
  context?: Record<string, unknown>;
}

export interface ObservabilityTransport {
  initialize?: () => void;
  send: (event: ObservabilityEvent) => void;
}
