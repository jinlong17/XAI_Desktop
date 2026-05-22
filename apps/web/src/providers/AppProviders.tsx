import { useMemo, type PropsWithChildren } from "react";
import {
  DeviceSessionBridge,
  WebAuthSessionProvider,
  createRestRpcDeviceTransport
} from "@repo/web-auth-device-session/web";

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
    user_metadata: {},
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
    <WebAuthSessionProvider client={mockClient as never} config={authMode === "live" ? config : null}>
      {transport ? <DeviceSessionBridge transport={transport}>{children}</DeviceSessionBridge> : children}
    </WebAuthSessionProvider>
  );
}
