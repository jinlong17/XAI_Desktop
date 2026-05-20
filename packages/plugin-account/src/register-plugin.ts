import { PluginRegistry } from '@repo/core/registry';
import type { PluginManifest } from '@repo/core/types';
import type { EventMap } from '@repo/core/types';
import { emitEvent } from '@repo/core/events';

/**
 * Compile-time fixture: every account event key we declare in manifest.json
 * must be a valid keyof EventMap. Per advisory A1, PluginManifest.events.emit
 * is typed as string[] at runtime, so this is a test-fixture check, not a
 * satisfies-on-the-manifest constraint.
 *
 * To add a new account event: add it to EventMap, add here, then add to manifest.
 */
type AccountEmitKeys =
  | 'account:logged-in'
  | 'account:logged-out'
  | 'account:sync-started'
  | 'account:sync-completed'
  | 'account:sync-failed';

// This type check ensures each AccountEmitKeys entry is a keyof EventMap.
// If a key is removed from EventMap this line will error.
type _AssertAccountKeysInEventMap = AccountEmitKeys extends keyof EventMap ? true : never;
const _check: _AssertAccountKeysInEventMap = true;
void _check;

/**
 * Manifest for plugin-account.
 * Aligned with manifest.json on disk and with the live PluginManifest interface.
 */
const accountManifest: PluginManifest = {
  name: 'account',
  version: '0.1.0',
  displayName: '账户与同步',
  description:
    'Account login, logout and cross-device sync (scaffold). Planned status — no active functionality in wave-W0.',
  author: 'Jinlong',
  enabled: false,
  contentTypes: [],
  windows: {},
  events: {
    emit: [
      'account:logged-in',
      'account:logged-out',
      'account:sync-started',
      'account:sync-completed',
      'account:sync-failed',
    ],
    listen: [],
  },
  dependencies: ['@repo/core'],
  tauriCommands: [],
};

/**
 * Compile-smoke: verifies account:sync-started is a valid EventMap key.
 * This function is never called at runtime; it exists only as a type gate
 * for the EventMap lifecycle contract (api.md §1, AC-3).
 */
function _compileSmokeTypingOnly(): void {
  // Positive case: valid account event + correct payload shape
  void emitEvent('account:sync-started', { kind: 'push' });

  // @ts-expect-error — wrong payload: 'kind' must be 'push'|'pull', not 'invalid'
  void emitEvent('account:sync-started', { kind: 'invalid' });
}

// Prevent TypeScript from complaining that _compileSmokeTypingOnly is unused
void (_compileSmokeTypingOnly as unknown);

/**
 * Register plugin-account with the PluginRegistry.
 *
 * Call this ONCE from apps/desktop/src/main.tsx above ReactDOM.createRoot.
 * Safe to call multiple times (PluginRegistry.register is a Map.set — idempotent).
 *
 * Red line #1/#8: no sync logic here — only structural registration.
 */
export function registerAccountPlugin(): void {
  PluginRegistry.register(accountManifest, {
    // No components in wave-W0 scaffold. Future rows will add OverlayLayer etc.
  });
}
