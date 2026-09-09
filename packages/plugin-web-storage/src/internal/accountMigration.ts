import { accountMigrationIssue } from './accountMigrationValidation.js';
import { ACCOUNT_LOCAL_KEYS, LOCAL_KEY_OWNERSHIP, ownershipForKey } from './accountOwnership.js';
import { accountPrefix, generationKey, generationMarkerKey, type AccountScope, type AccountScopeController } from './accountScope.js';

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>;
export interface GenerationMarker { generation: string; migrationId: string; previous: string | null }
export interface SecretMigrationContext { accountId: string; generation: string; previousGeneration: string | null; migrationId: string; demo: boolean; adoptLegacy: boolean }
export interface SecretMigrationParticipant {
  /** Stage ciphertext only. Never remove or change the original provider-only rows. */
  stage(input: SecretMigrationContext): Promise<void>;
  verify(input: SecretMigrationContext): Promise<void>;
}
export type MigrationLock = <T>(name: string, run: () => Promise<T>) => Promise<T>;
export const browserMigrationLock: MigrationLock = async (name, run) => {
  if (typeof navigator === 'undefined' || !navigator.locks) throw new Error('Exclusive migration lock unavailable. Close other tabs and use a supported browser.');
  return navigator.locks.request(name, run);
};

export function readGeneration(storage: Pick<Storage, 'getItem'>, accountId: string, demo = false): GenerationMarker | null {
  if (storage.getItem(`${accountPrefix(accountId, demo)}deleted`) !== null) throw new Error('This account has been deleted on this device.');
  const raw = storage.getItem(generationMarkerKey(accountId, demo));
  if (raw === null) return null;
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object' || !('generation' in value) || typeof value.generation !== 'string' || !value.generation || !('migrationId' in value) || typeof value.migrationId !== 'string' || !('previous' in value) || (value.previous !== null && typeof value.previous !== 'string')) throw new Error('Invalid account generation marker; recovery is required.');
  return value as GenerationMarker;
}

/** Does not parse or normalize private content; original bytes remain recoverable. */
export function inspectLegacy(storage: Store): Record<string, string> {
  const records: Record<string, string> = {};
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index);
    if (!key || !key.startsWith('xai_') || LOCAL_KEY_OWNERSHIP[key] === 'device') continue;
    const value = storage.getItem(key);
    if (value !== null) records[key] = value;
  }
  return records;
}

export async function migrateAccount(input: {
  storage: Store;
  controller: AccountScopeController;
  transition: AccountScope;
  choice: 'empty' | 'import';
  selectedKeys?: readonly string[];
  demo?: boolean;
  secrets?: SecretMigrationParticipant;
  adoptLegacySecrets?: boolean;
  lock?: MigrationLock;
  newId?: () => string;
}): Promise<GenerationMarker> {
  const { storage, controller, transition } = input;
  const accountId = transition.accountId;
  if (!accountId || transition.kind !== 'locked') throw new Error('Migration requires a locked, identified account.');
  const demo = input.demo ?? false;
  if (input.adoptLegacySecrets && (input.choice !== 'import' || !input.secrets)) throw new Error('Secret adoption requires explicit import and a secret participant.');
  if (demo && input.choice === 'import') throw new Error('Demo mode cannot adopt unowned production data.');
  const prefix = accountPrefix(accountId, demo);
  return (input.lock ?? browserMigrationLock)(`${prefix}migration`, async () => {
    controller.assertCurrent(transition);
    const previousRaw = storage.getItem(generationMarkerKey(accountId, demo));
    const previous = readGeneration(storage, accountId, demo);
    const migrationId = (input.newId ?? (() => crypto.randomUUID()))();
    const generation = `migration-${migrationId}`;
    const journalKey = `${prefix}migration:${encodeURIComponent(migrationId)}`;
    if (storage.getItem(journalKey) !== null) throw new Error('Migration identifier already exists.');
    const source = demo ? {} : inspectLegacy(storage);
    const selected = input.choice === 'import' ? [...new Set(input.selectedKeys ?? [])] : [];
    for (const key of selected) {
      if (!ACCOUNT_LOCAL_KEYS.includes(key)) throw new Error(`Cannot import unclassified or device key: ${key}`);
      if (source[key] === undefined) throw new Error(`Legacy source missing: ${key}`);
      const issue = accountMigrationIssue(key, source[key]!);
      if (issue) throw new Error(`${key}: ${issue}`);
    }
    // Never silently replace an existing category in a populated account.
    for (const key of selected) {
      if (previous && storage.getItem(generationKey(accountId, previous.generation, key, demo)) !== null) throw new Error(`Import conflict requires explicit resolution: ${key}`);
    }
    const candidate: Record<string, string> = {};
    if (previous) {
      const ownedPrefix = generationKey(accountId, previous.generation, '', demo);
      for (let index = 0; index < storage.length; index++) {
        const physical = storage.key(index);
        if (!physical?.startsWith(ownedPrefix)) continue;
        const logical = decodeURIComponent(physical.slice(ownedPrefix.length));
        if (ownershipForKey(logical) !== 'account') throw new Error('Invalid key found inside account generation; recovery required.');
        const raw = storage.getItem(physical);
        if (raw !== null) candidate[logical] = raw;
      }
    }
    for (const key of selected) candidate[key] = source[key]!;
    const archive = JSON.stringify({ version: 1, owner: 'unassigned', source });
    const archiveKey = `xai:legacy:v1:archive:${encodeURIComponent(migrationId)}`;
    if (storage.getItem(archiveKey) !== null) throw new Error('Legacy archive identifier already exists.');
    storage.setItem(archiveKey, archive);
    if (storage.getItem(archiveKey) !== archive) throw new Error('Legacy archive verification failed.');
    // Journal precedes staging, so a crash leaves a discoverable, invisible candidate.
    storage.setItem(journalKey, JSON.stringify({ version: 1, accountId, generation, previousRaw, archiveKey, selected, phase: 'prepared' }));
    for (const [key, raw] of Object.entries(candidate)) storage.setItem(generationKey(accountId, generation, key, demo), raw);
    const participant: SecretMigrationContext = { accountId, generation, previousGeneration: previous?.generation ?? null, migrationId, demo, adoptLegacy: input.adoptLegacySecrets ?? false };
    if (input.secrets) {
      await input.secrets.stage(participant);
      controller.assertCurrent(transition);
      await input.secrets.verify(participant);
    }
    controller.assertCurrent(transition);
    for (const [key, raw] of Object.entries(candidate)) {
      if (storage.getItem(generationKey(accountId, generation, key, demo)) !== raw) throw new Error(`Staged value verification failed: ${key}`);
    }
    if (storage.getItem(generationMarkerKey(accountId, demo)) !== previousRaw) throw new Error('Account generation changed during migration.');
    const marker: GenerationMarker = { generation, migrationId, previous: previous?.generation ?? null };
    // Sole visibility commit, written last. No fallible post-commit writes.
    storage.setItem(generationMarkerKey(accountId, demo), JSON.stringify(marker));
    return marker;
  });
}

/** Rollback keeps candidate records and ciphertext archived; it never deletes source data. */
export async function rollbackAccount(input: {
  storage: Store; controller: AccountScopeController; transition: AccountScope; demo?: boolean; lock?: MigrationLock;
}): Promise<GenerationMarker | null> {
  const { storage, controller, transition } = input;
  if (!transition.accountId || transition.kind !== 'locked') throw new Error('Rollback requires a locked account.');
  const accountId = transition.accountId, demo = input.demo ?? false;
  return (input.lock ?? browserMigrationLock)(`${accountPrefix(accountId, demo)}migration`, async () => {
    controller.assertCurrent(transition);
    const marker = readGeneration(storage, accountId, demo);
    if (!marker) return null;
    const journalKey = `${accountPrefix(accountId, demo)}migration:${encodeURIComponent(marker.migrationId)}`;
    const journalRaw = storage.getItem(journalKey);
    if (!journalRaw) throw new Error('Rollback journal missing; current data retained.');
    const journal = JSON.parse(journalRaw) as { accountId?: string; generation?: string; previousRaw?: string | null };
    if (journal.accountId !== accountId || journal.generation !== marker.generation || (journal.previousRaw !== null && typeof journal.previousRaw !== 'string')) throw new Error('Invalid rollback journal; current data retained.');
    if (typeof journal.previousRaw === 'string') readGeneration({ getItem: key => key === generationMarkerKey(accountId, demo) ? journal.previousRaw! : null }, accountId, demo);
    if (journal.previousRaw === null) storage.removeItem(generationMarkerKey(accountId, demo));
    else storage.setItem(generationMarkerKey(accountId, demo), journal.previousRaw!);
    return readGeneration(storage, accountId, demo);
  });
}

export interface MigrationJournalInfo {
  migrationId: string;
  generation: string | null;
  previousGeneration: string | null;
  selectedKeys: string[];
  archiveKey: string | null;
  status: 'active' | 'prepared' | 'archived' | 'invalid';
}
/** Recovery UI metadata only: no archived content or secret material is exposed here. */
export function listAccountMigrations(storage: Store, accountId: string, demo = false): MigrationJournalInfo[] {
  const prefix = `${accountPrefix(accountId, demo)}migration:`;
  const marker = readGeneration(storage, accountId, demo);
  const result: MigrationJournalInfo[] = [];
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index);
    if (!key?.startsWith(prefix)) continue;
    const fallback: MigrationJournalInfo = { migrationId: key.slice(prefix.length), generation: null, previousGeneration: null, selectedKeys: [], archiveKey: null, status: 'invalid' };
    try {
      const raw = storage.getItem(key);
      if (!raw) { result.push(fallback); continue; }
      const value = JSON.parse(raw) as Record<string, unknown>;
      if (value.accountId !== accountId || typeof value.generation !== 'string' || typeof value.archiveKey !== 'string' || !Array.isArray(value.selected) || !value.selected.every(key => typeof key === 'string')) { result.push(fallback); continue; }
      const previous = typeof value.previousRaw === 'string' ? JSON.parse(value.previousRaw) as GenerationMarker : null;
      result.push({ migrationId: fallback.migrationId, generation: value.generation, previousGeneration: previous?.generation ?? null, selectedKeys: value.selected, archiveKey: value.archiveKey, status: marker?.generation === value.generation ? 'active' : marker?.previous === value.generation ? 'archived' : 'prepared' });
    } catch { result.push(fallback); }
  }
  return result;
}
