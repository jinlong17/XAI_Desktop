import { invoke as tauriInvoke } from '@tauri-apps/api/core';

/**
 * Type-safe wrapper around Tauri invoke.
 *
 * The ONLY place plugins are permitted to reach IPC (red line #4 / STRIDE TB-3).
 * Plugins MUST use this hook; importing `@tauri-apps/api` directly from a plugin
 * is a red-line #4 violation.
 *
 * Error semantics: rejects with the raw Tauri error string today.
 * Hardening (validation, capability checks) is deferred to a later crypto row.
 */
export function useTauriInvoke(): {
  invoke: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
} {
  return {
    invoke: <T>(cmd: string, args?: Record<string, unknown>): Promise<T> => {
      return tauriInvoke<T>(cmd, args);
    },
  };
}
