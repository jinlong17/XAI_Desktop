import { LOCAL_KEY_OWNERSHIP, ownershipForKey, type LocalOwnership } from './accountOwnership.js';
import { PREF_REGISTRY, type WebPrefKey } from './registry.js';

export interface LocalDataLifecycle {
  key: string;
  feature: string;
  ownership: LocalOwnership;
  dataClass: 'account-record' | 'device-preference';
  exportScope: 'account-current-generation' | 'device-recovery';
  accountDeletion: 'erase-owned-generations' | 'retain';
  legacyMigration: 'explicit-validated-adoption' | 'retain-on-device';
}

/** Feature routing is descriptive; ownership always comes from its existing single source. */
function featureForKey(key: string): string {
  if (key.startsWith('xai_tt_')) return 'time-tracker';
  if (key.startsWith('xai_bk_')) return 'bookkeeping';
  if (key.startsWith('xai_metric_tracker_')) return 'metric-tracker';
  const owner = PREF_REGISTRY[key as WebPrefKey]?.owner;
  if (owner) return owner.replace(/^(?:xai|plugin)-web-/, '');
  if (key.startsWith('xai_pref_dashboard_')) return 'dashboard-widgets';
  if (key === 'xai:web:observability-consent') return 'observability';
  return 'custom-preferences';
}
export function lifecycleForKey(key: string): LocalDataLifecycle {
  const ownership = ownershipForKey(key);
  return {
    key, feature: featureForKey(key), ownership,
    dataClass: ownership === 'account' ? 'account-record' : 'device-preference',
    exportScope: ownership === 'account' ? 'account-current-generation' : 'device-recovery',
    accountDeletion: ownership === 'account' ? 'erase-owned-generations' : 'retain',
    legacyMigration: ownership === 'account' ? 'explicit-validated-adoption' : 'retain-on-device',
  };
}
export const LOCAL_DATA_LIFECYCLE: readonly Readonly<LocalDataLifecycle>[] = Object.freeze(
  Object.keys(LOCAL_KEY_OWNERSHIP).map(key => Object.freeze(lifecycleForKey(key))),
);

/** Control/secret/history families are declared separately from user-record key codecs. */
export const LOCAL_DATA_FAMILIES = Object.freeze([
  { pattern: 'xai_pref_* (unregistered)', dataClass: 'account-record', handling: 'Private by default; credential-named values excluded from JSON export.' },
  { pattern: 'xai:account:v1:* / xai:demo:v1:*', dataClass: 'account-control-and-records', handling: 'Only active-generation records exported; all captured owner generations erased; tombstone retained.' },
  { pattern: 'original unnamespaced account keys', dataClass: 'unassigned-originals', handling: 'Explicit recovery export choice; retained during account deletion.' },
  { pattern: 'xai:legacy:v1:archive:*', dataClass: 'unassigned-archive', handling: 'Explicit recovery export choice; raw safe archive envelopes retained byte-for-byte.' },
  { pattern: 'xai_oauth_pending_* (sessionStorage)', dataClass: 'temporary-auth', handling: 'Never exported; identity-scoped lifecycle.' },
  { pattern: 'xai.auth-attempt.v1:<base>:<generation> / pending (sessionStorage)', dataClass: 'temporary-auth', handling: 'Never exported by business JSON APIs; coordinator removes captured-generation envelope and removes pending pointer only when it still targets that generation. Cleanup failure is reported separately.' },
  { pattern: 'xai.auth-client.v1:<base>:<generation>-code-verifier (sessionStorage)', dataClass: 'temporary-auth-secret', handling: 'Never exported; SDK participant gates reads/writes by durable generation lease. Coordinator cleanup targets the captured verifier only; replacement-generation verifiers are retained.' },
  { pattern: 'xai-web-auth (IndexedDB)', dataClass: 'auth-and-device-material', handling: 'Never exported by local data JSON APIs.' },
  { pattern: 'xai-web-ai-secrets (IndexedDB)', dataClass: 'encrypted-secret', handling: 'Never exported by local data JSON APIs; captured-owner secret erasure uses the AI participant.' },
  { pattern: 'web-encrypted-cache-<namespace>-<accountId> (IndexedDB)', dataClass: 'dormant-account-cache', handling: 'No active Web consumer; lifecycle participant required before activation.' },
] as const);

/** Unknown names cannot smuggle login or key material into a device history export. */
export function recoveryKeyExclusion(key: string): string | null {
  if (LOCAL_KEY_OWNERSHIP[key] === 'account') return null;
  if (LOCAL_KEY_OWNERSHIP[key] === 'device') return 'device-preference-is-exported-in-device-section';
  if (!/^xai_pref_[^/]+$/.test(key)) return 'unclassified-key';
  const classifiedName = key.replace(/([a-z0-9])([A-Z])/g, '$1_$2');
  if (/(?:^|[_:-])(?:auth|oauth|token|secret|password|credential|apikey|api_key|private_key|device_key|access_key|encryption|dek|refresh|byok|bearer|session|crypto_key|key_material)(?:[_:-]|$)/i.test(classifiedName)) return 'credential-named-key';
  return null;
}
