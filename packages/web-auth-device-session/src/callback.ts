import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { clearPkceState, readPkceState, type StringStorage } from "./auth-actions";
import { resolveSafeNextPath } from "./redirects";

export class AuthCallbackError extends Error {
  code: "pkce_state_missing" | "pkce_exchange_failed";

  constructor(code: "pkce_state_missing" | "pkce_exchange_failed", message: string) {
    super(message);
    this.code = code;
  }
}

export interface HandleAuthCallbackResult {
  session: Session;
  nextPath: string;
}

function resolveStorage(storage?: StringStorage | null): StringStorage | null {
  if (storage !== undefined) {
    return storage;
  }

  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
}

function resolveUrl(url?: URL | string): URL {
  if (url instanceof URL) {
    return url;
  }

  if (url) {
    return new URL(url);
  }

  if (typeof window !== "undefined") {
    return new URL(window.location.href);
  }

  throw new Error("callback_url_missing");
}

export async function handleAuthCallback(
  client: SupabaseClient,
  url?: URL | string,
  storage?: StringStorage | null
): Promise<HandleAuthCallbackResult> {
  const currentUrl = resolveUrl(url);
  const transientStore = resolveStorage(storage);
  const pkceState = readPkceState(transientStore);

  if (!pkceState) {
    throw new AuthCallbackError("pkce_state_missing", "PKCE callback state not found");
  }

  const code = currentUrl.searchParams.get("code");
  if (!code) {
    throw new AuthCallbackError("pkce_exchange_failed", "Callback code is missing");
  }

  const { data, error } = await client.auth.exchangeCodeForSession(code);
  if (error || !data.session) {
    throw new AuthCallbackError("pkce_exchange_failed", "Failed to exchange auth code");
  }

  const requestedNext = currentUrl.searchParams.get("next") ?? pkceState.nextPath;
  const nextPath = resolveSafeNextPath(requestedNext).path;

  clearPkceState(transientStore);
  return {
    session: data.session,
    nextPath
  };
}
