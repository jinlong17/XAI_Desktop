import { useEffect, useMemo, useSyncExternalStore, type PropsWithChildren } from "react";
import {
  DeviceSessionBridge,
  useDeviceBoundFetch,
  useWebAuthSession,
  WebAuthSessionProvider,
  createRestRpcDeviceTransport
} from "@repo/web-auth-device-session/web";

import { accountScope } from "@repo/plugin-web-storage";
import { invalidateAccountIdentity } from "./AccountStorageGate.js";

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
  nextCounter?: number;
  leaseEnd?: number;
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
      xai_todo_encryption_device_id: "1001",
      xai_todo_next_counter: 0,
      xai_todo_lease_end: 63,
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

function readNumericText(source: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && /^(0|[1-9]\d*)$/.test(value)) {
      return value;
    }
    if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) {
      return String(value);
    }
    if (typeof value === "bigint" && value >= 0n) {
      return value.toString();
    }
  }
  return null;
}

function readNonNegativeInt(source: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) {
      return value;
    }
    if (typeof value === "string") {
      const parsed = Number.parseInt(value, 10);
      if (Number.isSafeInteger(parsed) && parsed >= 0) {
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
      nextCounter:
        readNonNegativeInt(source, ["xai_todo_next_counter", "todo_next_counter", "todoNextCounter"])
        ?? undefined,
      leaseEnd:
        readNonNegativeInt(source, ["xai_todo_lease_end", "todo_lease_end", "todoLeaseEnd"])
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

function createTodoScopedFetch(
  fetchSync: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
  scope: { accountId?: string; supabaseUrl?: string; supabaseAnonKey?: string }
) {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const headers = new Headers(init?.headers);
    if (scope.accountId) {
      headers.set("X-Account-Id", scope.accountId);
    }
    if (scope.supabaseAnonKey && isSupabaseRequest(input, scope.supabaseUrl)) {
      headers.set("apikey", scope.supabaseAnonKey);
    }
    return fetchSync(input, { ...init, headers });
  };
}

function isSupabaseRequest(input: RequestInfo | URL, supabaseUrl?: string): boolean {
  if (!supabaseUrl) {
    return false;
  }

  const raw =
    input instanceof URL
      ? input.toString()
      : typeof input === "string"
        ? input
        : input.url;
  try {
    return new URL(raw).origin === new URL(supabaseUrl).origin;
  } catch {
    return false;
  }
}

function emitTodoRuntimeUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(TODO_RUNTIME_EVENT));
  }
}

function hasTodoNonceLease(snapshot: TodoCryptoRuntimeSnapshot): boolean {
  return typeof snapshot.encryptionDeviceId === "string" &&
    /^(0|[1-9]\d*)$/.test(snapshot.encryptionDeviceId) &&
    typeof snapshot.nextCounter === "number" &&
    Number.isSafeInteger(snapshot.nextCounter) &&
    typeof snapshot.leaseEnd === "number" &&
    Number.isSafeInteger(snapshot.leaseEnd) &&
    snapshot.nextCounter <= snapshot.leaseEnd;
}

async function requestTodoNonceLease(input: {
  supabaseUrl: string;
  fetchSync: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  accountId: string;
  keyId: number;
  count?: number;
}): Promise<Pick<TodoCryptoRuntimeSnapshot, "encryptionDeviceId" | "nextCounter" | "leaseEnd">> {
  const response = await input.fetchSync(`${input.supabaseUrl}/rest/v1/rpc/fn_grant_nonce_lease`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      p_account_id: input.accountId,
      p_key_id: input.keyId,
      p_count: input.count ?? 128
    })
  });

  if (!response.ok) {
    throw new Error(`todo_nonce_lease_failed:${response.status}`);
  }

  const payload = await response.json() as unknown;
  const row = Array.isArray(payload) ? payload[0] : payload;
  if (!isObject(row)) {
    throw new Error("todo_nonce_lease_invalid");
  }
  const encryptionDeviceId = readNumericText(row, ["encryption_device_id"]);
  const nextCounter = readNonNegativeInt(row, ["lease_start"]);
  const leaseEnd = readNonNegativeInt(row, ["lease_end"]);
  if (!encryptionDeviceId || nextCounter === null || leaseEnd === null) {
    throw new Error("todo_nonce_lease_invalid");
  }

  return {
    encryptionDeviceId,
    nextCounter,
    leaseEnd
  };
}

function TodoWebRuntimeBridge({
  children,
  supabaseAnonKey,
  supabaseUrl
}: PropsWithChildren<{ supabaseAnonKey?: string; supabaseUrl?: string }>) {
  const { state, session, deviceId, syncVersion } = useWebAuthSession();
  const scope = useSyncExternalStore(accountScope.subscribe, accountScope.capture, accountScope.capture);
  const deviceBoundFetch = useDeviceBoundFetch();

  const sessionFetch = useMemo(() => {
    const token = typeof session?.access_token === "string" ? session.access_token : null;
    if (!token || !deviceId) {
      return null;
    }
    return createSessionBoundFetch(token, deviceId, syncVersion);
  }, [deviceId, session?.access_token, syncVersion]);

  useEffect(() => {
    let active = true;
    const runtime = globalThis as unknown as {
      __XAI_WEB_TODO_SESSION__?: TodoSessionRuntimeSnapshot;
      __XAI_WEB_TODO_CRYPTO__?: TodoCryptoRuntimeSnapshot;
    };

    const accountId = typeof session?.user?.id === "string" ? session.user.id : undefined;
    if (scope.kind === "locked" || scope.accountId !== accountId || state !== "authenticated") {
      delete runtime.__XAI_WEB_TODO_SESSION__;
      delete runtime.__XAI_WEB_TODO_CRYPTO__;
      emitTodoRuntimeUpdated();
      return () => { active = false; };
    }
    const baseFetchSync = deviceBoundFetch ?? sessionFetch ?? undefined;
    const fetchSync = baseFetchSync
      ? createTodoScopedFetch(baseFetchSync, { accountId, supabaseAnonKey, supabaseUrl })
      : undefined;

    runtime.__XAI_WEB_TODO_SESSION__ = {
      authState: state,
      accountId,
      deviceId: deviceId ?? undefined,
      fetchSync,
    };

    const cryptoSnapshot = readTodoCryptoRuntimeSnapshot(session, deviceId);
    if (cryptoSnapshot) {
      runtime.__XAI_WEB_TODO_CRYPTO__ = cryptoSnapshot;
      if (!hasTodoNonceLease(cryptoSnapshot) && supabaseUrl && accountId && fetchSync) {
        void requestTodoNonceLease({
          supabaseUrl,
          fetchSync,
          accountId,
          keyId: cryptoSnapshot.keyId
        })
          .then((lease) => {
            if (!active || accountScope.capture() !== scope) {
              return;
            }
            runtime.__XAI_WEB_TODO_CRYPTO__ = {
              ...cryptoSnapshot,
              ...lease
            };
            emitTodoRuntimeUpdated();
          })
          .catch(() => undefined);
      }
    } else {
      delete runtime.__XAI_WEB_TODO_CRYPTO__;
    }

    emitTodoRuntimeUpdated();
    return () => {
      active = false;
    };
  }, [deviceBoundFetch, deviceId, session, sessionFetch, state, supabaseAnonKey, supabaseUrl, scope]);

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

export function AppProviders({ children }: PropsWithChildren) {
  const authMode = resolveWebAuthMode();
  const config = resolveWebSupabaseConfig();
  const mockSession = authMode === "mock-authenticated" ? createMockSession() : null;
  const mockClient = useMemo<MockSupabaseLikeClient | null>(
    () => (authMode === "live" ? null : createMockSupabaseClient(mockSession)),
    [authMode, mockSession]
  );
  const transport = useMemo(
    () =>
      config && authMode === "live"
        ? createRestRpcDeviceTransport({
            baseUrl: config.url
          })
        : null,
    [authMode, config]
  );

  return (
    <WebAuthSessionProvider client={mockClient as never} config={authMode === "live" ? config : null} onIdentityChange={invalidateAccountIdentity}>
      {transport ? (
        <DeviceSessionBridge transport={transport}>
          <TodoWebRuntimeBridge supabaseAnonKey={config?.anonKey} supabaseUrl={config?.url}>
            {children}
          </TodoWebRuntimeBridge>
        </DeviceSessionBridge>
      ) : (
        <TodoWebRuntimeBridge supabaseAnonKey={config?.anonKey} supabaseUrl={config?.url}>
          {children}
        </TodoWebRuntimeBridge>
      )}
    </WebAuthSessionProvider>
  );
}
