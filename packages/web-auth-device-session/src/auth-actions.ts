import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveSafeNextPath } from "./redirects";

const PKCE_TRANSIENT_KEY = "xai.web-auth.pkce";

type OAuthProvider = "google" | "apple";

interface PkceTransientState {
  nextPath: string;
  createdAt: number;
}

export interface StringStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function resolveSessionStorage(): StringStorage | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
}

function writePkceState(nextPath: string, storage: StringStorage | null = resolveSessionStorage()): void {
  if (!storage) {
    return;
  }

  const payload: PkceTransientState = {
    nextPath,
    createdAt: Date.now()
  };

  storage.setItem(PKCE_TRANSIENT_KEY, JSON.stringify(payload));
}

export function readPkceState(storage: StringStorage | null = resolveSessionStorage()): PkceTransientState | null {
  if (!storage) {
    return null;
  }

  const raw = storage.getItem(PKCE_TRANSIENT_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PkceTransientState>;
    if (!parsed.nextPath || typeof parsed.createdAt !== "number") {
      return null;
    }

    return {
      nextPath: parsed.nextPath,
      createdAt: parsed.createdAt
    };
  } catch {
    return null;
  }
}

export function clearPkceState(storage: StringStorage | null = resolveSessionStorage()): void {
  if (!storage) {
    return;
  }

  storage.removeItem(PKCE_TRANSIENT_KEY);
}

function resolveOrigin(origin?: string): string {
  if (origin) {
    return origin;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  throw new Error("auth_origin_missing");
}

export async function signUpWithEmail(client: SupabaseClient, email: string, password: string): Promise<void> {
  const { error } = await client.auth.signUp({ email, password });
  if (error) {
    throw error;
  }
}

export async function signInWithEmail(client: SupabaseClient, email: string, password: string): Promise<void> {
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }
}

export async function requestPasswordReset(
  client: SupabaseClient,
  email: string,
  nextPath: string,
  origin?: string
): Promise<void> {
  const resolvedNext = resolveSafeNextPath(nextPath).path;
  const redirectTo = `${resolveOrigin(origin)}/auth/reset-password?next=${encodeURIComponent(resolvedNext)}`;

  const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) {
    throw error;
  }
}

export async function completePasswordReset(client: SupabaseClient, password: string): Promise<void> {
  const { error } = await client.auth.updateUser({ password });
  if (error) {
    throw error;
  }
}

export async function startOAuthLogin(
  client: SupabaseClient,
  provider: OAuthProvider,
  nextPath: string,
  origin?: string,
  storage: StringStorage | null = resolveSessionStorage()
): Promise<void> {
  const resolvedNext = resolveSafeNextPath(nextPath).path;
  writePkceState(resolvedNext, storage);

  const redirectTo = `${resolveOrigin(origin)}/auth/callback?next=${encodeURIComponent(resolvedNext)}`;
  const { error } = await client.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: false
    }
  });

  if (error) {
    clearPkceState(storage);
    throw error;
  }
}
