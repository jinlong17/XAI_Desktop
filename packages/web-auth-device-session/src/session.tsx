import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import type { Session, SupabaseClient, SupportedStorage } from "@supabase/supabase-js";
import { createWebSupabaseClient, type WebSupabaseClientConfig } from "./client";
import { createAuthSessionStorage } from "./storage";
import { createDeviceIdentityStore, type DeviceIdentityStore } from "./device-store";

const WEB_SYNC_VERSION = "2026-05";

type AuthState = "loading" | "authenticated" | "unauthenticated" | "unconfigured";

export interface WebAuthSessionContextValue {
  state: AuthState;
  session: Session | null;
  client: SupabaseClient | null;
  deviceId: string | null;
  syncVersion: string;
  refreshSession(): Promise<Session | null>;
  ensureDeviceIdentity(): Promise<string>;
  clearSessionStorage(): Promise<void>;
  setSession(nextSession: Session | null): void;
}

export interface WebAuthSessionProviderProps extends PropsWithChildren {
  client?: SupabaseClient;
  config?: WebSupabaseClientConfig | null;
  storage?: SupportedStorage;
  deviceStore?: DeviceIdentityStore;
}

function createClientFromConfig(
  config: WebSupabaseClientConfig | null | undefined,
  storage?: SupportedStorage
): SupabaseClient | null {
  if (!config) {
    return null;
  }

  return createWebSupabaseClient(config, storage ?? createAuthSessionStorage());
}

const WebAuthSessionContext = createContext<WebAuthSessionContextValue | undefined>(undefined);

export function WebAuthSessionProvider({
  children,
  client,
  config,
  storage,
  deviceStore
}: WebAuthSessionProviderProps) {
  const runtimeClient = useMemo(
    () => client ?? createClientFromConfig(config, storage),
    [client, config, storage]
  );
  const identityStore = useMemo(() => deviceStore ?? createDeviceIdentityStore(), [deviceStore]);

  const [session, setSession] = useState<Session | null>(null);
  const [state, setState] = useState<AuthState>(runtimeClient ? "loading" : "unconfigured");
  const [deviceId, setDeviceId] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    if (!runtimeClient) {
      setSession(null);
      setState("unconfigured");
      return null;
    }

    const { data } = await runtimeClient.auth.getSession();
    const nextSession = data.session ?? null;
    setSession(nextSession);
    setState(nextSession ? "authenticated" : "unauthenticated");
    return nextSession;
  }, [runtimeClient]);

  const ensureDeviceIdentity = useCallback(async () => {
    const value = await identityStore.ensure();
    setDeviceId(value);
    return value;
  }, [identityStore]);

  const clearSessionStorage = useCallback(async () => {
    setSession(null);
    setState(runtimeClient ? "unauthenticated" : "unconfigured");
  }, [runtimeClient]);

  useEffect(() => {
    let active = true;

    void refreshSession();
    void identityStore.get().then((value) => {
      if (active) {
        setDeviceId(value);
      }
    });

    if (!runtimeClient) {
      return () => {
        active = false;
      };
    }

    const {
      data: { subscription }
    } = runtimeClient.auth.onAuthStateChange((_event, authSession) => {
      if (!active) {
        return;
      }

      setSession(authSession);
      setState(authSession ? "authenticated" : "unauthenticated");
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [identityStore, refreshSession, runtimeClient]);

  const value = useMemo<WebAuthSessionContextValue>(
    () => ({
      state,
      session,
      client: runtimeClient,
      deviceId,
      syncVersion: WEB_SYNC_VERSION,
      refreshSession,
      ensureDeviceIdentity,
      clearSessionStorage,
      setSession
    }),
    [state, session, runtimeClient, deviceId, refreshSession, ensureDeviceIdentity, clearSessionStorage]
  );

  return <WebAuthSessionContext.Provider value={value}>{children}</WebAuthSessionContext.Provider>;
}

export function useWebAuthSession(): WebAuthSessionContextValue {
  const value = useContext(WebAuthSessionContext);
  if (!value) {
    throw new Error("useWebAuthSession must be used within WebAuthSessionProvider");
  }

  return value;
}

export const webSyncVersion = WEB_SYNC_VERSION;
