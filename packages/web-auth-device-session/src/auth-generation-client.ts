import { createClient, type SupportedStorage } from '@supabase/supabase-js';
import type { AuthGenerationLease, AuthGenerationStore, AuthGenerationMutationResult } from './auth-generation-store';
import type { WebSupabaseClientConfig } from './client';

export class AuthGenerationClientStorageError extends Error {
  constructor(readonly reason: string) {
    super(`auth_generation_client_${reason}`);
    this.name = 'AuthGenerationClientStorageError';
  }
}

export interface AuthGenerationClientOptions {
  config: WebSupabaseClientConfig;
  store: AuthGenerationStore;
  /** Already created candidate, or current published generation. Never mutable. */
  lease: AuthGenerationLease;
  transientStorage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> | null;
  fetch?: typeof globalThis.fetch;
}

/** Stable logical key also used by the legacy compare/copy/publish transaction. */
export const AUTH_GENERATION_SESSION_KEY = 'session';

function requireApplied(result: AuthGenerationMutationResult): void {
  if (result.status !== 'applied') throw new AuthGenerationClientStorageError(result.reason);
}

/**
 * Generation-specific SDK storageKey isolates both BroadcastChannel and SDK locks.
 * Creating this participant does not publish a login or authorize UI/navigation.
 * The coordinator must compare/publish first, then subscribe to that generation.
 */
export function createAuthGenerationClient(options: AuthGenerationClientOptions) {
  const { config, store } = options;
  const lease = Object.freeze({ generation: options.lease.generation });
  if (!lease.generation || lease.generation.length > 512) throw new AuthGenerationClientStorageError('invalid-generation');
  const baseKey = config.storageKey ?? 'xai-web-auth';
  const storageKey = `xai.auth-client.v1:${encodeURIComponent(baseKey)}:${encodeURIComponent(lease.generation)}`;
  const verifierKey = `${storageKey}-code-verifier`;
  const verifierPermissionKey = 'pkce-participant';
  function transient() {
    try {
      const target = options.transientStorage === undefined
        ? (typeof window === 'undefined' ? null : window.sessionStorage)
        : options.transientStorage;
      if (!target) throw new Error('unavailable');
      return target;
    } catch {
      throw new AuthGenerationClientStorageError('transient-unavailable');
    }
  }
  function logicalKey(key: string): string {
    if (key === storageKey) return AUTH_GENERATION_SESSION_KEY;
    if (key === `${storageKey}-user`) return 'user';
    throw new AuthGenerationClientStorageError('unknown-sdk-key');
  }
  function sessionOwner(raw: string): string {
    try {
      const value: unknown = JSON.parse(raw);
      if (value && typeof value === 'object' && 'user' in value
        && value.user && typeof value.user === 'object' && 'id' in value.user
        && typeof value.user.id === 'string' && value.user.id.length > 0) return value.user.id;
    } catch { /* Do not expose raw credentials in an error. */ }
    throw new AuthGenerationClientStorageError('invalid-session-owner');
  }
  const storage: SupportedStorage = {
    async getItem(key) {
      if (key !== verifierKey) return store.getItem(lease, logicalKey(key));
      // Revocation/supersession makes old transient credentials unreadable.
      if (await store.getItem(lease, verifierPermissionKey) !== '1') return null;
      return transient().getItem(verifierKey);
    },
    async setItem(key, value) {
      if (key !== verifierKey) {
        const logical = logicalKey(key);
        if (logical !== AUTH_GENERATION_SESSION_KEY) throw new AuthGenerationClientStorageError('unsupported-user-storage');
        requireApplied(await store.setSessionItem(lease, logical, value, sessionOwner(value)));
        return;
      }
      // No secrets in the durable marker. Transient writes are scoped to this
      // never-reused generation; a late A write cannot address B's verifier.
      requireApplied(await store.setItem(lease, verifierPermissionKey, '1'));
      try { transient().setItem(verifierKey, value); }
      catch { throw new AuthGenerationClientStorageError('transient-write-failed'); }
    },
    async removeItem(key) {
      if (key !== verifierKey) {
        requireApplied(await store.removeItem(lease, logicalKey(key)));
        return;
      }
      // Even a superseded SDK may remove its own transient bytes. Never clear
      // shared keys or other generations, and never hide a storage failure.
      try { transient().removeItem(verifierKey); }
      catch { throw new AuthGenerationClientStorageError('transient-remove-failed'); }
    }
  };
  const client = createClient(config.url, config.anonKey, {
    auth: {
      flowType: 'pkce', storage, storageKey, persistSession: true,
      detectSessionInUrl: false,
      autoRefreshToken: config.autoRefreshToken ?? true
    },
    ...(options.fetch ? { global: { fetch: options.fetch } } : {})
  });
  return { client, storage, storageKey, lease };
}
