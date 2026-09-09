import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren
} from "react";
import type { Session, SupabaseClient, SupportedStorage } from "@supabase/supabase-js";
import { createWebSupabaseClient, type WebSupabaseClientConfig } from "./client";
import { createAuthSessionStorage } from "./storage";
import { createDeviceIdentityStore, type DeviceIdentityStore } from "./device-store";

const WEB_SYNC_VERSION = "2026-05";
const DEFAULT_STORAGE_KEY = "xai-web-auth";

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
  /** Synchronous invalidation before publishing a different identity; never await auth APIs here. */
  onIdentityChange?: (accountId: string | null) => void;
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
  deviceStore,
  onIdentityChange
}: WebAuthSessionProviderProps) {
  const resolvedStorage = useMemo(
    () => storage ?? (config ? createAuthSessionStorage() : undefined),
    [config, storage]
  );
  const runtimeClient = useMemo(
    () => client ?? createClientFromConfig(config, resolvedStorage),
    [client, config, resolvedStorage]
  );
  const identityStore = useMemo(() => deviceStore ?? createDeviceIdentityStore(), [deviceStore]);

  const [session, setSessionState] = useState<Session | null>(null);
  const [state, setState] = useState<AuthState>(runtimeClient ? "loading" : "unconfigured");
  const [deviceId, setDeviceId] = useState<string | null>(null);

  const sessionRef = useRef<Session | null>(null);
  const revision = useRef(0);
  const identity = useRef<string | null | undefined>(undefined);
  const setSession = useCallback((next: Session | null) => {
    revision.current += 1;
    const accountId = next?.user?.id ?? null;
    if (identity.current !== accountId) {
      onIdentityChange?.(accountId);
      identity.current = accountId;
    }
    sessionRef.current = next;
    setSessionState(next);
    setState(next ? "authenticated" : runtimeClient ? "unauthenticated" : "unconfigured");
  }, [onIdentityChange, runtimeClient]);

  const refreshSession = useCallback(async () => {
    const requestRevision = ++revision.current;
    if (!runtimeClient) { setSession(null); return null; }
    try {
      const { data, error } = await runtimeClient.auth.getSession();
      if (requestRevision !== revision.current) return sessionRef.current;
      const next = error ? null : data.session ?? null;
      setSession(next);
      return next;
    } catch {
      if (requestRevision === revision.current) setSession(null);
      return sessionRef.current;
    }
  }, [runtimeClient, setSession]);

  const ensureDeviceIdentity = useCallback(async () => {
    const value = await identityStore.ensure();
    setDeviceId(value);
    return value;
  }, [identityStore]);

  const clearSessionStorage = useCallback(async () => {
    // Revoke pending reads and account handles before any asynchronous clearing.
    setSession(null);
    const storageKey = config?.storageKey ?? DEFAULT_STORAGE_KEY;
    try {
      await resolvedStorage?.removeItem(storageKey);
      await resolvedStorage?.removeItem(`${storageKey}-code-verifier`);
    } catch {
      // Best-effort local auth clear; React state below is still authoritative.
    }
  }, [config?.storageKey, resolvedStorage, setSession]);

  useEffect(() => {
    let active = true;

    void refreshSession();
    void identityStore.get().then((value) => {
      if (active) {
        setDeviceId(value);
      }
    }).catch(() => undefined);

    if (!runtimeClient) {
      return () => {
        active = false;
        revision.current += 1;
      };
    }

    const {
      data: { subscription }
    } = runtimeClient.auth.onAuthStateChange((_event, authSession) => {
      if (!active) {
        return;
      }

      setSession(authSession);
    });

    return () => {
      active = false;
      revision.current += 1;
      subscription.unsubscribe();
    };
  }, [identityStore, refreshSession, runtimeClient, setSession]);

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
    [state, session, runtimeClient, deviceId, refreshSession, ensureDeviceIdentity, clearSessionStorage, setSession]
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
