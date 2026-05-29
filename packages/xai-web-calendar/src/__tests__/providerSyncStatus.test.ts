import { describe, expect, it } from "vitest";
import { resolveCalendarProviderSyncStatus } from "../internal/providerSyncStatus.js";

describe("resolveCalendarProviderSyncStatus", () => {
  it("returns local-ready when provider is disconnected and no provider state exists", () => {
    expect(
      resolveCalendarProviderSyncStatus({
        providerConnected: false,
        desktopOfflineRuntime: false,
        providerState: null,
      }),
    ).toBe("local-ready");
  });

  it("returns provider-offline when desktop offline runtime is active", () => {
    expect(
      resolveCalendarProviderSyncStatus({
        providerConnected: true,
        desktopOfflineRuntime: true,
        providerState: {
          id: "calendar.provider_state:gcal",
          entityType: "calendar.provider_state",
          schemaVersion: 1,
          createdAt: "2026-05-29T00:00:00.000Z",
          updatedAt: "2026-05-29T00:00:00.000Z",
          syncScope: "device-local",
          providerId: "gcal",
          syncMode: "online-only",
          connectionState: "connected",
          availability: "ready",
          needsReconnectRefresh: false,
        },
      }),
    ).toBe("provider-offline");
  });

  it("prioritizes reconnect-needed over other ready/offline status", () => {
    expect(
      resolveCalendarProviderSyncStatus({
        providerConnected: true,
        desktopOfflineRuntime: false,
        providerState: {
          id: "calendar.provider_state:gcal",
          entityType: "calendar.provider_state",
          schemaVersion: 1,
          createdAt: "2026-05-29T00:00:00.000Z",
          updatedAt: "2026-05-29T00:00:00.000Z",
          syncScope: "device-local",
          providerId: "gcal",
          syncMode: "online-only",
          connectionState: "connected",
          availability: "ready",
          needsReconnectRefresh: true,
        },
      }),
    ).toBe("provider-needs-reconnect");
  });
});
