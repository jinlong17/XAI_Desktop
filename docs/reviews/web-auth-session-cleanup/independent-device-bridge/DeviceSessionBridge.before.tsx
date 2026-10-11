import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { createHeartbeatScheduler } from "../../../../packages/web-auth-device-session/src/heartbeat";
import {
  createDeviceSessionController,
  type DeviceSessionController,
  type DeviceSessionState
} from "../../../../packages/web-auth-device-session/src/device-session";
import { createDeviceBoundFetch, type DeviceBoundContext } from "../../../../packages/web-auth-device-session/src/device-fetch";
import { DeviceTransportError, type DeviceFailureReason, type DeviceTransport } from "../../../../packages/web-auth-device-session/src/device-transport";
import { useWebAuthSession } from "../../../../packages/web-auth-device-session/src/session";

export interface DeviceSessionBridgeProps extends PropsWithChildren {
  transport: DeviceTransport;
  onReady?: (fetcher: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) => void;
}

type DeviceBoundFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

const DeviceBoundFetchContext = createContext<DeviceBoundFetch | null>(null);

function isDeviceFailure(reason?: DeviceFailureReason): reason is DeviceFailureReason {
  return reason === "unknown_device" || reason === "device_revoked";
}

export function DeviceSessionBridge({ children, transport, onReady }: DeviceSessionBridgeProps) {
  const { state, session, syncVersion, clearSessionStorage } = useWebAuthSession();
  const [deviceBoundFetch, setDeviceBoundFetch] = useState<DeviceBoundFetch | null>(null);

  const controller: DeviceSessionController = useMemo(
    () =>
      createDeviceSessionController({
        transport,
        onFailureCleanup: async () => {
          await clearSessionStorage();
        }
      }),
    [clearSessionStorage, transport]
  );

  useEffect(() => {
    if (state !== "authenticated" || !session?.access_token) {
      return;
    }

    const authState: DeviceSessionState = {
      accessToken: session.access_token,
      syncVersion
    };

    let active = true;

    const onFailure = async (reason: DeviceFailureReason) => {
      if (!active) {
        return;
      }

      await controller.handleDeviceFailure(reason);
    };

    const scheduler = createHeartbeatScheduler({
      documentRef: typeof document === "undefined" ? undefined : document,
      onTick: async () => {
        try {
          await controller.heartbeat(authState);
        } catch (error) {
          if (error instanceof DeviceTransportError && isDeviceFailure(error.reason)) {
            await onFailure(error.reason);
          }
        }
      }
    });

    void controller
      .ensureRegistered(authState)
      .then(async () => {
        if (!active) {
          return;
        }

        const context = await controller.buildContext(authState);
        const deviceFetch = createDeviceBoundFetch({
          getContext: async (): Promise<DeviceBoundContext> => context,
          onDeviceAuthFailure: onFailure
        });
        setDeviceBoundFetch(() => deviceFetch);
        onReady?.(deviceFetch);
        scheduler.start();
      })
      .catch(async (error: unknown) => {
        if (error instanceof DeviceTransportError && isDeviceFailure(error.reason)) {
          await onFailure(error.reason);
        }
      });

    return () => {
      active = false;
      scheduler.stop();
    };
  }, [controller, onReady, session?.access_token, state, syncVersion]);

  return <DeviceBoundFetchContext.Provider value={deviceBoundFetch}>{children}</DeviceBoundFetchContext.Provider>;
}

export function useDeviceBoundFetch(): DeviceBoundFetch | null {
  return useContext(DeviceBoundFetchContext);
}
