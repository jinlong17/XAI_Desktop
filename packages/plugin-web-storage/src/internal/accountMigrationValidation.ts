import { PREF_REGISTRY, type WebPrefKey } from './registry.js';
import { ACCOUNT_LOCAL_KEYS } from './accountOwnership.js';
import { decode } from './codec.js';
import { isCanonicalCommandKey, readCanonicalCommandState } from './canonicalCommandState.js';

const validators = new Map<string, (value: unknown) => boolean>();
/** Owner-provided guards prevent a corrupt imported blob being normalized into a seed. */
export function registerAccountMigrationValidator(key: string, validate: (value: unknown) => boolean): () => void {
  if (!ACCOUNT_LOCAL_KEYS.includes(key)) throw new Error(`Not an account migration key: ${key}`);
  const previous = validators.get(key);
  validators.set(key, validate);
  return () => { if (previous) validators.set(key, previous); else validators.delete(key); };
}
const primitiveJsonKeys = new Set(['xai_ai_provider','xai_ai_base_url','xai_ai_model_default']);
const stringArrayKeys = new Set(['xai_zones','xai_tt_category_collapsed_v1']);
const stringMapKeys = new Set(['xai_board_view_by_id','xai_pref_smart_lists']);
export function accountMigrationIssue(key: string, raw: string): string | null {
  if (!ACCOUNT_LOCAL_KEYS.includes(key)) return 'Unclassified legacy key remains in quarantine.';
  const entry = PREF_REGISTRY[key as WebPrefKey];
  const codec = key === 'xai_pref_dashboard_header_note' ? 'string' : entry?.codec ?? 'json';
  let value: unknown;
  try { value = codec === "json" ? JSON.parse(raw) : decode(codec, raw); } catch { return "Stored value cannot be decoded; original data is retained."; }
  if (value === null && codec !== "json") return 'Stored value cannot be decoded; original data is retained.';
  if (isCanonicalCommandKey(key)) {
    const state = readCanonicalCommandState(value);
    if (state.status === 'corrupt') return 'Stored canonical command data is invalid; original data is retained.';
    if (state.status === 'unsupported') return 'Stored canonical command version is unsupported; original data is retained.';
    if (state.status === 'envelope' || state.status === 'legacy') value = state.data;
  }
  if (codec === 'string' || codec === 'boolean' || codec === 'number') return null;
  if (primitiveJsonKeys.has(key)) return typeof value === 'string' ? null : 'Expected a text setting.';
  if (stringArrayKeys.has(key)) return Array.isArray(value) && value.every(item => typeof item === 'string') ? null : 'Expected an array of strings.';
  if (stringMapKeys.has(key)) return value !== null && typeof value === 'object' && !Array.isArray(value) && Object.values(value as object).every(item => typeof item === 'string') ? null : 'Expected a mapping of strings.';
  const validate = validators.get(key);
  if (!validate) return 'Module format validator is unavailable; retain this category until validation is available.';
  try { return validate(value) ? null : 'Stored module format is invalid; original data is retained.'; }
  catch { return 'Module format validation failed; original data is retained.'; }
}
