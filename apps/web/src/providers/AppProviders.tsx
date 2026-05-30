import { useEffect, useMemo, useState, type ReactNode, type PropsWithChildren } from "react";
import {
  isDesktopHost,
  resolveDesktopHost,
} from "@repo/core";
import {
  DeviceSessionBridge,
  useDeviceBoundFetch,
  useWebAuthSession,
  WebAuthSessionProvider,
  createRestRpcDeviceTransport
} from "@repo/web-auth-device-session/web";
import { DesktopNativeNotificationsBridge } from "@repo/desktop-native-notifications-reminders/web";
import { DesktopStatusbarQuickActionsBridge } from "@repo/desktop-statusbar-quick-actions/web";
import { DesktopGlobalHotkeyQuickOpenBridge } from "@repo/desktop-global-hotkey-quick-open/web";
import { DesktopAutoUpdateReleaseChannelBridge } from "@repo/desktop-auto-update-release-channel/web";
import {
  createDesktopLocalFirstBackupArtifact,
  getDesktopLocalFirstBackupReport,
  getDesktopLocalFirstReconnectSyncPreflight,
  runDesktopLocalFirstCalendarProviderReconnect,
  getDesktopLocalFirstWebDataImportReport,
  importDesktopLocalFirstBackupArtifact,
  mountDesktopLocalFirstRepositoryBridge,
  runDesktopLocalFirstReconnectSync,
  verifyDesktopLocalFirstBackupArtifact,
  runDesktopLocalFirstWebDataImport,
} from "@repo/plugin-web-storage";

type WebAuthMode = "live" | "mock-authenticated" | "mock-unauthenticated";
type MockAuthSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: "bearer";
  user: {
    id: string;
    aud: string;
    role: string;
    email: string;
    email_confirmed_at: string;
    phone: string;
    confirmed_at: string;
    last_sign_in_at: string;
    app_metadata: { provider: string; providers: string[] };
    user_metadata: Record<string, unknown>;
    identities: unknown[];
    created_at: string;
    updated_at: string;
    is_anonymous: boolean;
  };
};

const MOCK_TODO_DEK_BASE64 = "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=";
const TODO_RUNTIME_EVENT = "xai:web:todo-runtime-updated";

type TodoSessionRuntimeSnapshot = {
  authState: string;
  accountId?: string;
  deviceId?: string;
  fetchSync?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

type TodoCryptoRuntimeSnapshot = {
  dekBase64: string;
  keyId: number;
  encryptionDeviceId?: string;
};

type MockSupabaseLikeClient = {
  auth: {
    getSession: () => Promise<{ data: { session: MockAuthSession | null }; error: null }>;
    onAuthStateChange: () => {
      data: {
        subscription: {
          unsubscribe: () => void;
        };
      };
    };
  };
};

function resolveWebAuthMode(): WebAuthMode {
  const env = import.meta.env as Record<string, string | undefined>;
  const mode = env.VITE_WEB_AUTH_MODE;

  if (mode === "mock-authenticated" || mode === "mock-unauthenticated") {
    return mode;
  }

  return "live";
}

function createMockSession(): MockAuthSession {
  const now = new Date().toISOString();
  const user = {
    id: "mock-user",
    aud: "authenticated",
    role: "authenticated",
    email: "mock@example.com",
    email_confirmed_at: now,
    phone: "",
    confirmed_at: now,
    last_sign_in_at: now,
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {
      xai_todo_dek_base64: MOCK_TODO_DEK_BASE64,
      xai_todo_key_id: 1,
      xai_todo_encryption_device_id: "mock-user",
    },
    identities: [],
    created_at: now,
    updated_at: now,
    is_anonymous: false,
  };

  return {
    access_token: "mock-access-token",
    refresh_token: "mock-refresh-token",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: "bearer",
    user,
  };
}

function createMockSupabaseClient(session: MockAuthSession | null): MockSupabaseLikeClient {
  const auth = {
    getSession: async () => ({ data: { session }, error: null }),
    onAuthStateChange: () => ({
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    }),
  };

  return { auth };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readText(source: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}

function readPositiveInt(source: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isSafeInteger(value) && value > 0) {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number.parseInt(value, 10);
      if (Number.isSafeInteger(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }
  return null;
}

function readTodoCryptoRuntimeSnapshot(
  session: {
    user?: {
      user_metadata?: Record<string, unknown>;
      app_metadata?: Record<string, unknown>;
    };
  } | null,
  fallbackDeviceId: string | null
): TodoCryptoRuntimeSnapshot | null {
  if (!session?.user) {
    return null;
  }

  const candidates: Record<string, unknown>[] = [];
  if (isObject(session.user.user_metadata)) {
    candidates.push(session.user.user_metadata);
  }
  if (isObject(session.user.app_metadata)) {
    candidates.push(session.user.app_metadata);
  }

  for (const source of candidates) {
    const dekBase64 = readText(source, ["xai_todo_dek_base64", "todo_dek_base64", "todoDekBase64"]);
    const keyId = readPositiveInt(source, ["xai_todo_key_id", "todo_key_id", "todoKeyId"]);
    if (!dekBase64 || !keyId) {
      continue;
    }

    return {
      dekBase64,
      keyId,
      encryptionDeviceId:
        readText(source, ["xai_todo_encryption_device_id", "todo_encryption_device_id", "todoEncryptionDeviceId"])
        ?? fallbackDeviceId
        ?? undefined,
    };
  }

  return null;
}

function createSessionBoundFetch(accessToken: string, deviceId: string, syncVersion: string) {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);
    headers.set("X-Device-Id", deviceId);
    headers.set("X-Sync-Version", syncVersion);
    return fetch(input, { ...init, headers });
  };
}

function emitTodoRuntimeUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(TODO_RUNTIME_EVENT));
  }
}

function TodoWebRuntimeBridge({ children }: PropsWithChildren) {
  const { state, session, deviceId, syncVersion } = useWebAuthSession();
  const deviceBoundFetch = useDeviceBoundFetch();

  const sessionFetch = useMemo(() => {
    const token = typeof session?.access_token === "string" ? session.access_token : null;
    if (!token || !deviceId) {
      return null;
    }
    return createSessionBoundFetch(token, deviceId, syncVersion);
  }, [deviceId, session?.access_token, syncVersion]);

  useEffect(() => {
    const runtime = globalThis as unknown as {
      __XAI_WEB_TODO_SESSION__?: TodoSessionRuntimeSnapshot;
      __XAI_WEB_TODO_CRYPTO__?: TodoCryptoRuntimeSnapshot;
    };

    const accountId = typeof session?.user?.id === "string" ? session.user.id : undefined;
    const fetchSync = deviceBoundFetch ?? sessionFetch ?? undefined;

    runtime.__XAI_WEB_TODO_SESSION__ = {
      authState: state,
      accountId,
      deviceId: deviceId ?? undefined,
      fetchSync,
    };

    const cryptoSnapshot = readTodoCryptoRuntimeSnapshot(session, deviceId);
    if (cryptoSnapshot) {
      runtime.__XAI_WEB_TODO_CRYPTO__ = cryptoSnapshot;
    } else {
      delete runtime.__XAI_WEB_TODO_CRYPTO__;
    }

    emitTodoRuntimeUpdated();
  }, [deviceBoundFetch, deviceId, session, sessionFetch, state]);

  return children;
}

function resolveWebSupabaseConfig() {
  const env = import.meta.env as Record<string, string | undefined>;
  const url = env.VITE_SUPABASE_URL;
  const anonKey = env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return {
    url,
    anonKey,
    detectSessionInUrl: false,
    persistSession: true,
    autoRefreshToken: true
  } as const;
}

type TauriInvoke = (command: string, args?: Record<string, unknown>) => Promise<unknown>;

type DesktopHostRuntime = typeof globalThis & {
  __TAURI_INTERNALS__?: {
    invoke?: TauriInvoke;
  };
  __XAI_DESKTOP_NOTIFICATION__?: {
    isPermissionGranted: () => Promise<unknown>;
    requestPermission: () => Promise<unknown>;
    sendNotification: (input: Record<string, unknown>) => Promise<unknown>;
  };
  __XAI_DESKTOP_STATUSBAR__?: {
    publishSnapshot: (snapshot: Record<string, unknown>) => Promise<unknown>;
    subscribe: (handler: (action: unknown) => void) => () => void;
  };
  __XAI_DESKTOP_GLOBAL_HOTKEY__?: {
    getSnapshot: () => Promise<unknown>;
    setPreference: (input: Record<string, unknown>) => Promise<unknown>;
    subscribe: (handler: (event: unknown) => void) => () => void;
  };
  __XAI_DESKTOP_UPDATER__?: {
    getSnapshot: () => Promise<unknown>;
    check: () => Promise<unknown>;
    subscribe: (handler: (snapshot: unknown) => void) => () => void;
  };
};

function hasDesktopHostCapabilityAdapters(runtime: DesktopHostRuntime): boolean {
  return Boolean(
    runtime.__XAI_DESKTOP_NOTIFICATION__
    && runtime.__XAI_DESKTOP_STATUSBAR__
    && runtime.__XAI_DESKTOP_GLOBAL_HOTKEY__
    && runtime.__XAI_DESKTOP_UPDATER__,
  );
}

function readTauriInvoke(runtime: DesktopHostRuntime): TauriInvoke | null {
  const internalsInvoke = runtime.__TAURI_INTERNALS__?.invoke;
  if (typeof internalsInvoke === "function") {
    return internalsInvoke;
  }

  const tauriGlobal = (runtime as unknown as Record<string, {
    core?: { invoke?: TauriInvoke };
  } | undefined>)[globalThis.atob("X19UQVVSSV9f")];
  const globalInvoke = tauriGlobal?.core?.invoke;
  return typeof globalInvoke === "function" ? globalInvoke : null;
}

function installDesktopHostCapabilityAdapters(isDesktopHostRuntime: boolean): boolean {
  if (!isDesktopHostRuntime || typeof globalThis === "undefined") {
    return false;
  }

  const runtime = globalThis as DesktopHostRuntime;
  if (hasDesktopHostCapabilityAdapters(runtime)) {
    return true;
  }

  if (!readTauriInvoke(runtime)) {
    return false;
  }

  const readInvoke = (): TauriInvoke => {
    const invoke = readTauriInvoke(runtime);
    if (!invoke) {
      throw new Error("tauri_invoke_unavailable");
    }
    return invoke;
  };

  if (!runtime.__XAI_DESKTOP_NOTIFICATION__) {
    runtime.__XAI_DESKTOP_NOTIFICATION__ = {
      isPermissionGranted: () => readInvoke()("plugin:notification|is_permission_granted"),
      requestPermission: async () => {
        const state = await readInvoke()("plugin:notification|request_permission");
        return state === "prompt-with-rationale" ? "prompt" : state;
      },
      sendNotification: (input) => readInvoke()("plugin:notification|notify", { options: input }),
    };
  }

  if (!runtime.__XAI_DESKTOP_STATUSBAR__) {
    runtime.__XAI_DESKTOP_STATUSBAR__ = {
      publishSnapshot: (snapshot) => readInvoke()("statusbar_set_snapshot", { payload: snapshot }),
      subscribe: (handler) => {
        if (typeof handler !== "function") {
          return () => {};
        }

        const listener = (event: Event) => {
          handler((event as CustomEvent).detail);
        };

        globalThis.addEventListener("xai:desktop-statusbar-quick-action", listener);
        return () => {
          globalThis.removeEventListener("xai:desktop-statusbar-quick-action", listener);
        };
      },
    };
  }

  if (!runtime.__XAI_DESKTOP_GLOBAL_HOTKEY__) {
    runtime.__XAI_DESKTOP_GLOBAL_HOTKEY__ = {
      getSnapshot: () => readInvoke()("desktop_global_hotkey_get_snapshot"),
      setPreference: (input) => readInvoke()("desktop_global_hotkey_set_preference", { input }),
      subscribe: (handler) => {
        if (typeof handler !== "function") {
          return () => {};
        }

        const listener = (event: Event) => {
          handler((event as CustomEvent).detail);
        };

        globalThis.addEventListener("xai:desktop-global-hotkey-snapshot", listener);
        return () => {
          globalThis.removeEventListener("xai:desktop-global-hotkey-snapshot", listener);
        };
      },
    };
  }

  if (!runtime.__XAI_DESKTOP_UPDATER__) {
    runtime.__XAI_DESKTOP_UPDATER__ = {
      getSnapshot: () => readInvoke()("desktop_updater_get_snapshot"),
      check: () => readInvoke()("desktop_updater_check"),
      subscribe: (handler) => {
        if (typeof handler !== "function") {
          return () => {};
        }

        const listener = (event: Event) => {
          handler((event as CustomEvent).detail);
        };

        globalThis.addEventListener("xai:desktop-updater-snapshot", listener);
        return () => {
          globalThis.removeEventListener("xai:desktop-updater-snapshot", listener);
        };
      },
    };
  }

  return hasDesktopHostCapabilityAdapters(runtime);
}

function DesktopRuntimeBridges({ children }: PropsWithChildren): ReactNode {
  return (
    <TodoWebRuntimeBridge>
      <DesktopNativeNotificationsBridge>
        <DesktopAutoUpdateReleaseChannelBridge>
          <DesktopGlobalHotkeyQuickOpenBridge>
            <DesktopStatusbarQuickActionsBridge>{children}</DesktopStatusbarQuickActionsBridge>
          </DesktopGlobalHotkeyQuickOpenBridge>
        </DesktopAutoUpdateReleaseChannelBridge>
      </DesktopNativeNotificationsBridge>
    </TodoWebRuntimeBridge>
  );
}

export function AppProviders({ children }: PropsWithChildren) {
  const authMode = resolveWebAuthMode();
  const isDesktopHostRuntime = isDesktopHost(
    resolveDesktopHost(import.meta.env as Record<string, string | undefined>),
  );
  const adaptersInstalled = installDesktopHostCapabilityAdapters(isDesktopHostRuntime);
  const [adapterBootstrapKey, setAdapterBootstrapKey] = useState(0);
  const config = resolveWebSupabaseConfig();
  const mockSession = authMode === "mock-authenticated" ? createMockSession() : null;
  const mockClient = useMemo<MockSupabaseLikeClient | null>(
    () => (authMode === "live" ? null : createMockSupabaseClient(mockSession)),
    [authMode, mockSession]
  );
  const transport = useMemo(
    () =>
      config && authMode === "live" && !isDesktopHostRuntime
        ? createRestRpcDeviceTransport({
            baseUrl: config.url
          })
        : null,
    [authMode, config, isDesktopHostRuntime]
  );

  useEffect(() => {
    mountDesktopLocalFirstRepositoryBridge(isDesktopHostRuntime);
  }, [isDesktopHostRuntime]);

  useEffect(() => {
    if (!isDesktopHostRuntime || adaptersInstalled) {
      return;
    }

    let attempts = 0;
    const interval = globalThis.setInterval(() => {
      attempts += 1;
      if (installDesktopHostCapabilityAdapters(isDesktopHostRuntime)) {
        globalThis.clearInterval(interval);
        setAdapterBootstrapKey((value) => value + 1);
        return;
      }

      if (attempts >= 100) {
        globalThis.clearInterval(interval);
      }
    }, 50);

    return () => {
      globalThis.clearInterval(interval);
    };
  }, [adaptersInstalled, isDesktopHostRuntime]);

  useEffect(() => {
    const runtime = globalThis as typeof globalThis & {
      __XAI_DESKTOP_WEB_IMPORT__?: {
        run: typeof runDesktopLocalFirstWebDataImport;
        getLastReport: typeof getDesktopLocalFirstWebDataImportReport;
      };
      __XAI_DESKTOP_RECONNECT_SYNC__?: {
        preflight: typeof getDesktopLocalFirstReconnectSyncPreflight;
        runOnce: typeof runDesktopLocalFirstReconnectSync;
        reconcileCalendarProviders: typeof runDesktopLocalFirstCalendarProviderReconnect;
      };
      __XAI_DESKTOP_BACKUP__?: {
        create: typeof createDesktopLocalFirstBackupArtifact;
        verify: typeof verifyDesktopLocalFirstBackupArtifact;
        importBundle: typeof importDesktopLocalFirstBackupArtifact;
        getLastReport: typeof getDesktopLocalFirstBackupReport;
      };
    };

    if (!isDesktopHostRuntime) {
      delete runtime.__XAI_DESKTOP_WEB_IMPORT__;
      delete runtime.__XAI_DESKTOP_RECONNECT_SYNC__;
      delete runtime.__XAI_DESKTOP_BACKUP__;
      return;
    }

    runtime.__XAI_DESKTOP_WEB_IMPORT__ = {
      run: runDesktopLocalFirstWebDataImport,
      getLastReport: getDesktopLocalFirstWebDataImportReport,
    };
    runtime.__XAI_DESKTOP_RECONNECT_SYNC__ = {
      preflight: getDesktopLocalFirstReconnectSyncPreflight,
      runOnce: runDesktopLocalFirstReconnectSync,
      reconcileCalendarProviders: runDesktopLocalFirstCalendarProviderReconnect,
    };
    runtime.__XAI_DESKTOP_BACKUP__ = {
      create: createDesktopLocalFirstBackupArtifact,
      verify: verifyDesktopLocalFirstBackupArtifact,
      importBundle: importDesktopLocalFirstBackupArtifact,
      getLastReport: getDesktopLocalFirstBackupReport,
    };

    return () => {
      delete runtime.__XAI_DESKTOP_WEB_IMPORT__;
      delete runtime.__XAI_DESKTOP_RECONNECT_SYNC__;
      delete runtime.__XAI_DESKTOP_BACKUP__;
    };
  }, [isDesktopHostRuntime]);

  return (
    <WebAuthSessionProvider client={mockClient as never} config={authMode === "live" ? config : null}>
      {transport ? (
        <DeviceSessionBridge transport={transport}>
          <DesktopRuntimeBridges key={adapterBootstrapKey}>{children}</DesktopRuntimeBridges>
        </DeviceSessionBridge>
      ) : (
        <DesktopRuntimeBridges key={adapterBootstrapKey}>{children}</DesktopRuntimeBridges>
      )}
    </WebAuthSessionProvider>
  );
}
