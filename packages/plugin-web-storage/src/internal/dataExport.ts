import { LOCAL_KEY_OWNERSHIP } from './accountOwnership.js';
import { lifecycleForKey, recoveryKeyExclusion } from './lifecycleDeclaration.js';

export type ExportSection = 'account' | 'device' | 'legacy' | 'archives';
export type ExportOmission = { section: ExportSection; key: string; reason: string };
export interface DataExportManifest {
  format: 'xai-local-data';
  version: 1;
  scope: 'account-current-generation' | 'device-recovery';
  createdAt: string;
  restoreSupported: false;
  counts: Record<ExportSection, number>;
  categories: { section: ExportSection; feature: string; keys: string[] }[];
  included: string[];
  excluded: string[];
  omitted: ExportOmission[];
}
export type ExportStore = Pick<Storage, 'getItem' | 'key' | 'length'>;
export function exportStorageKeys(storage: ExportStore): string[] {
  const keys: string[] = [];
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index);
    if (key !== null) keys.push(key);
  }
  return keys.sort();
}
export function makeExportManifest(
  scope: DataExportManifest['scope'],
  sections: Partial<Record<ExportSection, Record<string, string>>>,
  included: string[], excluded: string[], omitted: ExportOmission[] = [],
): DataExportManifest {
  const counts: DataExportManifest['counts'] = { account: 0, device: 0, legacy: 0, archives: 0 };
  const categories: DataExportManifest['categories'] = [];
  for (const section of ['account', 'device', 'legacy', 'archives'] as const) {
    const keys = Object.keys(sections[section] ?? {}).sort();
    counts[section] = keys.length;
    const grouped = new Map<string, string[]>();
    for (const key of keys) {
      const feature = section === 'archives' ? 'unassigned-recovery-archives' : lifecycleForKey(key).feature;
      const group = grouped.get(feature) ?? [];
      group.push(key);
      grouped.set(feature, group);
    }
    for (const [feature, keys] of grouped) categories.push({ section, feature, keys });
  }
  return { format: 'xai-local-data', version: 1, scope, createdAt: new Date().toISOString(), restoreSupported: false, counts, categories, included, excluded, omitted };
}

export interface DeviceRecoveryExportOptions { includeLegacy?: boolean; includeArchives?: boolean }
export interface DeviceRecoveryExport {
  version: 1;
  kind: 'device-recovery';
  manifest: DataExportManifest;
  device: { records: Record<string, string> };
  legacy: { records: Record<string, string> };
  archives: { records: Record<string, string> };
}
function compactJSON(raw: string): string {
  let result = '', quoted = false, escaped = false;
  for (const character of raw) {
    if (quoted) {
      result += character;
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') quoted = false;
    } else if (character === '"') { quoted = true; result += character; }
    else if (!/\s/.test(character)) result += character;
  }
  return result;
}
function archiveExclusion(raw: string): string | null {
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return 'unreadable-archive-envelope'; }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 'unrecognized-archive-envelope';
  // Retain raw bytes only when parsing did not hide duplicate/ambiguous fields.
  if (compactJSON(raw) !== JSON.stringify(value)) return 'ambiguous-archive-encoding';
  const archive = value as Record<string, unknown>;
  if (archive.version !== 1 || archive.owner !== 'unassigned' || !archive.source || typeof archive.source !== 'object' || Array.isArray(archive.source)) return 'unrecognized-archive-envelope';
  // Unknown envelope fields could contain secrets; do not alter or silently redact a raw archive.
  if (Object.keys(archive).some(key => !['version', 'owner', 'source'].includes(key))) return 'unrecognized-archive-fields';
  for (const [key, value] of Object.entries(archive.source)) {
    if (typeof value !== 'string' || recoveryKeyExclusion(key)) return 'archive-contains-unclassified-or-sensitive-keys';
  }
  return null;
}
/** Device-wide export is an explicit separate choice; it never assigns history to an account. */
export function exportDeviceRecoveryData(options: DeviceRecoveryExportOptions = {}, storage: ExportStore = localStorage): DeviceRecoveryExport {
  const device: Record<string, string> = {};
  const legacy: Record<string, string> = {};
  const archives: Record<string, string> = {};
  const omitted: ExportOmission[] = [];
  for (const key of exportStorageKeys(storage)) {
    if (LOCAL_KEY_OWNERSHIP[key] === 'device') {
      const raw = storage.getItem(key);
      if (raw !== null) device[key] = raw;
    } else if (options.includeLegacy && key.startsWith('xai_')) {
      const reason = recoveryKeyExclusion(key);
      if (reason) { omitted.push({ section: 'legacy', key, reason }); continue; }
      const raw = storage.getItem(key);
      if (raw !== null) legacy[key] = raw;
    } else if (options.includeArchives && key.startsWith('xai:legacy:v1:archive:')) {
      const raw = storage.getItem(key);
      if (raw === null) continue;
      const reason = archiveExclusion(raw);
      if (reason) omitted.push({ section: 'archives', key, reason });
      else archives[key] = raw;
    }
  }
  const included = ['declared-device-preferences'];
  if (options.includeLegacy) included.push('selected-unassigned-originals');
  if (options.includeArchives) included.push('selected-unassigned-archives');
  const excluded = ['account-namespaces', 'auth-session-and-oauth-state', 'byok-and-device-cryptographic-material', 'unclassified-or-sensitive-keys', 'cloud-data'];
  if (!options.includeLegacy) excluded.push('unassigned-originals');
  if (!options.includeArchives) excluded.push('unassigned-archives');
  return { version: 1, kind: 'device-recovery', manifest: makeExportManifest('device-recovery', { device, legacy, archives }, included, excluded, omitted), device: { records: device }, legacy: { records: legacy }, archives: { records: archives } };
}
