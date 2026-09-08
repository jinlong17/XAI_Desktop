import { createClient, type SupabaseClient, type SupportedStorage } from "@supabase/supabase-js";
import { createAuthSessionStorage } from "./storage";

export interface WebSupabaseClientConfig {
  url: string;
  anonKey: string;
  storageKey?: string;
  detectSessionInUrl?: boolean;
  persistSession?: boolean;
  autoRefreshToken?: boolean;
}

const DEFAULT_STORAGE_KEY = "xai-web-auth";

export function createWebSupabaseClient(
  config: WebSupabaseClientConfig,
  storage: SupportedStorage = createAuthSessionStorage()
): SupabaseClient {
  return createClient(config.url, config.anonKey, {
    auth: {
      flowType: "pkce",
      storage,
      storageKey: config.storageKey ?? DEFAULT_STORAGE_KEY,
      detectSessionInUrl: config.detectSessionInUrl ?? false,
      persistSession: config.persistSession ?? true,
      autoRefreshToken: config.autoRefreshToken ?? true
    }
  });
}
