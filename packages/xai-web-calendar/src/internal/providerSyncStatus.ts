import type { CalendarProviderStateEntity } from "@repo/plugin-web-storage";

export type CalendarProviderSyncStatus =
  | "local-ready"
  | "provider-offline"
  | "provider-auth-required"
  | "provider-transport-unavailable"
  | "provider-needs-reconnect"
  | "provider-sync-failed";

export function resolveCalendarProviderSyncStatus(input: {
  providerConnected: boolean;
  desktopOfflineRuntime: boolean;
  providerState: CalendarProviderStateEntity | null;
}): CalendarProviderSyncStatus {
  const { providerConnected, desktopOfflineRuntime, providerState } = input;

  if (!providerConnected && !providerState) {
    return "local-ready";
  }

  if (providerState?.needsReconnectRefresh) {
    return "provider-needs-reconnect";
  }

  if (
    providerState?.lastFailureCode &&
    providerState.availability === "ready"
  ) {
    return "provider-sync-failed";
  }

  if (
    desktopOfflineRuntime &&
    (providerConnected || providerState?.connectionState === "connected")
  ) {
    return "provider-offline";
  }

  if (providerState?.availability === "auth-required") {
    return "provider-auth-required";
  }
  if (providerState?.availability === "transport-unavailable") {
    return "provider-transport-unavailable";
  }
  if (providerState?.availability === "offline") {
    return "provider-offline";
  }

  return "local-ready";
}
