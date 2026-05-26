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

export async function signUpWithEmail(
  client: SupabaseClient,
  email: string,
  password: string,
  nextPath: string = "/app",
  origin?: string
): Promise<void> {
  const resolvedNext = resolveSafeNextPath(nextPath).path;
  const emailRedirectTo = `${resolveOrigin(origin)}/auth/verify?next=${encodeURIComponent(resolvedNext)}`;
  const { error } = await client.auth.signUp({ email, password, options: { emailRedirectTo } });
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

// ---------------------------------------------------------------------------
// Account delete (extension 2026-05-26 — gap-closure row #9)
// ---------------------------------------------------------------------------

/**
 * Discriminated error kind for the account-delete Edge Function call.
 * Consumers should map these to bilingual UI copy in deleteModal.error_*.
 */
export type AccountDeleteErrorKind =
  | "network"
  | "unauthorized"
  | "forbidden"
  | "server"
  | "already_deleted"
  | "unknown";

/**
 * Thrown by `deleteAccount()` when the backend call fails.
 * Consumers switch on `.kind` to display bilingual error messages.
 */
export class AccountDeleteError extends Error {
  readonly kind: AccountDeleteErrorKind;
  readonly cause?: unknown;

  constructor(kind: AccountDeleteErrorKind, message: string, cause?: unknown) {
    super(message);
    this.name = "AccountDeleteError";
    this.kind = kind;
    this.cause = cause;
  }
}

/**
 * Options for `deleteAccount()`.
 */
export interface DeleteAccountOptions {
  /**
   * Optional progress callback — called at each phase.
   * Consumers may use this to show in-progress UI copy.
   */
  readonly onProgress?: (phase: "invoking" | "signing-out") => void;
}

/**
 * Deletes the current user's account via the `account-delete` Supabase Edge Function.
 *
 * Flow:
 * 1. Call `client.functions.invoke("account-delete")`.
 * 2. On HTTP 200 or 404 (already_deleted): call `client.auth.signOut()` (best-effort, non-throwing).
 * 3. Throw `AccountDeleteError` on all other outcomes.
 *
 * The caller is responsible for local-clear (localStorage wipe + IDB wipe + redirect)
 * AFTER this function resolves. NEVER mutate local state before this resolves.
 *
 * Edge Function deployment: apps/web/deploy/README.md §"Account-Delete Edge Function"
 *
 * @since 2026-05-26 (gap-closure row #9)
 */
export async function deleteAccount(
  client: SupabaseClient,
  options: DeleteAccountOptions = {}
): Promise<void> {
  const { onProgress } = options;

  onProgress?.("invoking");

  let status: number | undefined;
  let invokeError: unknown;

  try {
    const result = await client.functions.invoke("account-delete", {
      method: "POST",
    });
    status = (result as { error?: { status?: number }; data?: unknown }).error?.status
      ?? (typeof (result as Record<string, unknown>).status === "number"
        ? (result as Record<string, unknown>).status as number
        : undefined);
    invokeError = (result as { error?: unknown }).error ?? null;
  } catch (err) {
    throw new AccountDeleteError("network", "Network error during account-delete invoke", err);
  }

  // Map HTTP status to AccountDeleteErrorKind.
  if (invokeError) {
    const kind: AccountDeleteErrorKind =
      status === 401 ? "unauthorized"
      : status === 403 ? "forbidden"
      : status === 404 ? "already_deleted"
      : status != null && status >= 500 ? "server"
      : "unknown";

    if (kind === "already_deleted") {
      // 404 is idempotent — treat as success (proceed to signOut).
      // Fall through to signOut below.
    } else {
      throw new AccountDeleteError(kind, `account-delete returned ${status ?? "unknown"}`, invokeError);
    }
  }

  // Sign out (best-effort — account is gone, so sign-out failure is non-blocking).
  onProgress?.("signing-out");
  try {
    await client.auth.signOut();
  } catch {
    // Sign-out failure is logged conceptually but does NOT abort (R9: account is gone).
  }
}
