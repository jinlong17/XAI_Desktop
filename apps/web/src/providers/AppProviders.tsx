import { useMemo, type PropsWithChildren } from "react";
import {
  DeviceSessionBridge,
  WebAuthSessionProvider,
  createRestRpcDeviceTransport
} from "@repo/web-auth-device-session";

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
  const config = resolveWebSupabaseConfig();
  const transport = useMemo(
    () =>
      config
        ? createRestRpcDeviceTransport({
            baseUrl: config.url
          })
        : null,
    [config]
  );

  return (
    <WebAuthSessionProvider config={config}>
      {transport ? <DeviceSessionBridge transport={transport}>{children}</DeviceSessionBridge> : children}
    </WebAuthSessionProvider>
  );
}
