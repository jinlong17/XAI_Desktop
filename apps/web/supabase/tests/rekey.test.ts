import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';

import { processPushBatch, type ConflictShadowInput, type PushDatabase, type PushRecordResult, type StoredBlob } from '../functions/sync-push/handler';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../../../..');
const migrationsDir = path.join(repoRoot, 'apps/web/supabase/migrations');
const containerName = `xai-sync-rekey-${process.pid}`;

const accountId = '66666666-6666-4666-8666-666666666666';
const deviceId = '66666666-aaaa-4aaa-8aaa-666666666666';
const rekeySessionId = '77777777-7777-4777-8777-777777777777';

const migrations = [
  '20260519000001_extensions_and_enum.sql',
  '20260519000002_core_tables.sql',
  '20260519000003_blob_tables_and_nonce_defense.sql',
  '20260519000004_lease_dedup_progress.sql',
  '20260519000005_commit_seq_rpc.sql',
  '20260519000006_rls_policies.sql',
  '20260519000007_realtime_private_channels.sql',
  '20260519000008_nonce_lease_rpc.sql',
  '20260519000009_audit_log_integrity.sql',
  '20260519000010_rekey_two_phase.sql',
];

function docker(args: string[], input?: string): string {
  return execFileSync('docker', args, {
    encoding: 'utf8',
    input,
    stdio: input === undefined ? ['ignore', 'pipe', 'pipe'] : ['pipe', 'pipe', 'pipe'],
  }).trim();
}

function psql(sql: string): string {
  return docker(
    [
      'exec',
      '-i',
      containerName,
      'psql',
      '-U',
      'postgres',
      '-d',
      'postgres',
      '-v',
      'ON_ERROR_STOP=1',
      '-X',
      '-q',
      '-t',
      '-A',
    ],
    sql,
  );
}

function waitForPostgres(): void {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      docker(['exec', containerName, 'pg_isready', '-U', 'postgres']);
      return;
    } catch {
      execFileSync('sleep', ['1']);
    }
  }
  throw new Error('postgres container did not become ready');
}

beforeAll(() => {
  docker(['run', '--rm', '-d', '--name', containerName, '-e', 'POSTGRES_PASSWORD=postgres', 'postgres:16-alpine']);
  waitForPostgres();

  psql(`
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE anon NOLOGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA auth;
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

CREATE OR REPLACE FUNCTION auth.jwt()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(NULLIF(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb);
$$;

CREATE SCHEMA realtime;
CREATE TABLE realtime.messages (
  id BIGSERIAL PRIMARY KEY,
  extension TEXT NOT NULL DEFAULT 'postgres_changes',
  topic TEXT NOT NULL
);
CREATE OR REPLACE FUNCTION realtime.topic()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT current_setting('realtime.topic', true);
$$;
`);

  for (const migration of migrations) {
    psql(readFileSync(path.join(migrationsDir, migration), 'utf8'));
  }

  psql(`
GRANT USAGE ON SCHEMA public, auth, realtime TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public, realtime TO authenticated, anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO authenticated, anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public, realtime TO authenticated, anon;

INSERT INTO accounts (
  id, email, kek_salt, secret_key_check, dek_check, recovery_signing_pub
) VALUES (
  '${accountId}', 'rekey@example.test', '\\x01', '\\x02', '\\x03', '\\x04'
);

INSERT INTO account_keyring (account_id, key_id, status) VALUES
  ('${accountId}', 1, 'active');

INSERT INTO sync_devices (
  device_id, account_id, device_pub, encryption_device_id, status, revoked_at
) VALUES (
  '${deviceId}', '${accountId}', '\\xaa', 6001, 'active', NULL
);

INSERT INTO encrypted_blobs (
  account_id, entity_type, entity_id, revision, key_id, encryption_device_id,
  counter, blob, commit_seq, client_updated_at, originator_device_id,
  mutation_id, blob_size
) VALUES (
  '${accountId}', 'todos', 'todo-1', 7, 1, 6001, 1, '\\x10', 7, 1,
  '${deviceId}', '66666666-1111-4111-8111-111111111111', 1
);
`);
});

afterAll(() => {
  try {
    docker(['rm', '-f', containerName]);
  } catch {
    // Container cleanup is best effort; failed setup may leave nothing to remove.
  }
});

describe('rekey two-phase server primitives', () => {
  it('quarantines old key and rejects old-key push with E3033', async () => {
    psql(`SELECT fn_start_rekey('${accountId}', 2);`);
    expect(psql(`SELECT count(*) FROM account_keyring WHERE account_id = '${accountId}' AND key_id = 2 AND status = 'staging';`)).toBe('1');
    expect(psql(`SELECT key_quarantine_at IS NOT NULL FROM accounts WHERE id = '${accountId}';`)).toBe('t');

    expect(() =>
      psql(`
INSERT INTO encrypted_blobs (
  account_id, entity_type, entity_id, revision, key_id, encryption_device_id,
  counter, blob, commit_seq, client_updated_at, originator_device_id,
  mutation_id, blob_size
) VALUES (
  '${accountId}', 'todos', 'blocked', 1, 1, 6001, 2, '\\x11', 8, 2,
  '${deviceId}', '66666666-2222-4222-8222-222222222222', 1
);`),
    ).toThrow(/E3033/);

    const response = await processPushBatch(pushDb({ currentDekKeyId: 1, keyQuarantineAt: 'now' }), {
      accountId,
      records: [record({ entityId: 'blocked-by-handler', mutationId: 'mut-rekey-e3033' })],
    });
    expect(response.results[0]).toMatchObject({ status: 'error', errorCode: 'E3033' });
  });

  it('keeps quarantine on failed proof gates and atomically swaps staged blobs', () => {
    psql(`
INSERT INTO staging_blobs (
  account_id, rekey_session_id, snapshot_commit_seq, new_key_id, entity_type,
  entity_id, preserved_revision, new_encryption_device_id, new_counter,
  new_blob, preserved_deleted_flag, preserved_schema_version, source_mutation_id
) VALUES (
  '${accountId}', '${rekeySessionId}', 7, 2, 'todos',
  'todo-1', 7, 6001, 3, '\\x20', 0, 1,
  '66666666-3333-4333-8333-333333333333'
);`);

    expect(() =>
      psql(`SELECT fn_complete_rekey_swap('${accountId}', '${rekeySessionId}', 1, 2, '\\x99', false, true);`),
    ).toThrow(/E3028/);
    expect(psql(`SELECT key_quarantine_at IS NOT NULL FROM accounts WHERE id = '${accountId}';`)).toBe('t');

    expect(() =>
      psql(`SELECT fn_complete_rekey_swap('${accountId}', '${rekeySessionId}', 1, 2, '\\x99', true, false);`),
    ).toThrow(/E3028/);

    expect(psql(`SELECT fn_complete_rekey_swap('${accountId}', '${rekeySessionId}', 1, 2, '\\x99', true, true);`)).toBe('1');
    expect(psql(`SELECT current_dek_key_id || ':' || (key_quarantine_at IS NULL) FROM accounts WHERE id = '${accountId}';`)).toBe('2:true');
    expect(psql(`SELECT string_agg(key_id || '=' || status, ',' ORDER BY key_id) FROM account_keyring WHERE account_id = '${accountId}';`)).toBe('1=retired,2=active');
    expect(psql(`SELECT revision || ':' || key_id || ':' || encode(blob, 'hex') FROM encrypted_blobs WHERE account_id = '${accountId}' AND entity_id = 'todo-1';`)).toBe('7:2:20');
    expect(psql(`SELECT count(*) FROM staging_blobs WHERE account_id = '${accountId}' AND rekey_session_id = '${rekeySessionId}';`)).toBe('0');
  });
});

function pushDb(quarantine: { currentDekKeyId: number; keyQuarantineAt: string | null }): PushDatabase & { nextCommitSeq: bigint } {
  const dedup = new Map<string, PushRecordResult>();
  const blobs = new Map<string, StoredBlob>();
  const conflictShadow: ConflictShadowInput[] = [];
  return {
    nextCommitSeq: 1n,
    async transaction(fn) {
      return fn();
    },
    async getKeyQuarantine() {
      return quarantine;
    },
    async getMutationDedup(_accountId, mutationId) {
      return dedup.get(mutationId);
    },
    async putMutationDedup(_accountId, mutationId, result) {
      dedup.set(mutationId, result);
    },
    async getCurrentBlob(_accountId, entityType, entityId) {
      return blobs.get(`${entityType}:${entityId}`);
    },
    async upsertBlob(blob) {
      blobs.set(`${blob.entityType}:${blob.entityId}`, blob);
    },
    async insertConflictShadow(input) {
      conflictShadow.push(input);
    },
    async allocCommitSeq() {
      const seq = this.nextCommitSeq;
      this.nextCommitSeq += 1n;
      return seq;
    },
  };
}

function record(overrides: Partial<{ entityId: string; mutationId: string }> = {}) {
  return {
    entityType: 'todos',
    entityId: 'todo-new',
    mutationId: 'mut-1',
    baseRevision: null,
    proposedRevision: '1',
    clientUpdatedAtMs: 1,
    originatorDeviceId: deviceId,
    envelope: envelope(1),
    ...overrides,
  };
}

function envelope(keyId: number): number[] {
  return [
    1,
    1,
    ...u32Le(keyId),
    ...u64Le(6001n),
    ...u32Le(9),
    ...Array.from({ length: 20 }, () => 7),
  ];
}

function u32Le(value: number): number[] {
  return [value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >> 24) & 0xff];
}

function u64Le(value: bigint): number[] {
  const out: number[] = [];
  let next = value;
  for (let index = 0; index < 8; index += 1) {
    out.push(Number(next & 0xffn));
    next >>= 8n;
  }
  return out;
}
