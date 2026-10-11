import { createContext, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { createHeartbeatScheduler } from "../heartbeat";
import {
  createDeviceSessionController,
  type DeviceSessionController,
  type DeviceSessionState
} from "../device-session";
import { createDeviceBoundFetch, type DeviceBoundContext } from "../device-fetch";
import { DeviceTransportError, type DeviceFailureReason, type DeviceTransport } from "../device-transport";
import { useWebAuthSession } from "../session";

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
  const currentAuth = useRef({ state, token: session?.access_token, cleanup: clearSessionStorage });
  currentAuth.current = { state, token: session?.access_token, cleanup: clearSessionStorage };
  const [ready, setReady] = useState<{ token: string; cleanup: typeof clearSessionStorage; fetch: DeviceBoundFetch } | null>(null);
  const deviceBoundFetch = state === 'authenticated' && ready?.token === session?.access_token
    && ready?.cleanup === clearSessionStorage ? ready.fetch : null;

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
    const isCurrent = () => active && currentAuth.current.state === 'authenticated'
      && currentAuth.current.token === authState.accessToken && currentAuth.current.cleanup === clearSessionStorage;

    const onFailure = async (reason: DeviceFailureReason) => {
      if (!isCurrent()) {
        return;
      }

      await controller.handleDeviceFailure(reason);
    };

    const scheduler = createHeartbeatScheduler({
      documentRef: typeof document === "undefined" ? undefined : document,
      onTick: async () => {
        if (!isCurrent()) return;
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
        if (!isCurrent()) {
          return;
        }

        const context = await controller.buildContext(authState);
        if (!isCurrent()) return;
        const deviceFetch = createDeviceBoundFetch({
          getContext: async (): Promise<DeviceBoundContext> => {
            if (!isCurrent()) throw new Error('device_session_superseded');
            return context;
          },
          fetchImpl: async (input, init) => {
            // getContext itself yields: recheck at the actual network boundary.
            if (!isCurrent()) throw new Error('device_session_superseded');
            const response = await fetch(input, init);
            if (!isCurrent()) throw new Error('device_session_superseded');
            return response;
          },
          onDeviceAuthFailure: onFailure
        });
        setReady({ token: authState.accessToken, cleanup: clearSessionStorage, fetch: deviceFetch });
        onReady?.(deviceFetch);
        if (isCurrent()) scheduler.start();
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
  }, [controller, onReady, session?.access_token, state, syncVersion, clearSessionStorage]);

  return <DeviceBoundFetchContext.Provider value={deviceBoundFetch}>{children}</DeviceBoundFetchContext.Provider>;
}

export function useDeviceBoundFetch(): DeviceBoundFetch | null {
  return useContext(DeviceBoundFetchContext);
}
