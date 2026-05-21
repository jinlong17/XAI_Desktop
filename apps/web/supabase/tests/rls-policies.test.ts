import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { assertUserFilter, canMutateDirectly, canSelect } from '../../../../packages/rls-policies-and-tests/src';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../../../..');
const migrationsDir = path.join(repoRoot, 'apps/web/supabase/migrations');

describe('[smoke] sync-v1 RLS policy mock', () => {
  it('allows an active device to read only its account blobs and own DEK wrap', () => {
    const context = { role: 'authenticated' as const, userId: 'acct-a', deviceId: 'dev-a' };

    expect(canSelect('encrypted_blobs', context, { accountId: 'acct-a', status: 'active' })).toBe(true);
    expect(canSelect('encrypted_blobs', context, { accountId: 'acct-b', status: 'active' })).toBe(false);
    expect(canSelect('device_dek_wraps', context, { accountId: 'acct-a', deviceId: 'dev-a', status: 'active' })).toBe(true);
    expect(canSelect('device_dek_wraps', context, { accountId: 'acct-a', deviceId: 'dev-b', status: 'active' })).toBe(false);
  });

  it('denies anon reads, revoked-device reads and direct client writes', () => {
    expect(canSelect('encrypted_blobs', { role: 'anon', userId: null, deviceId: null }, { accountId: 'acct-a' })).toBe(false);
    expect(
      canSelect(
        'encrypted_blobs',
        { role: 'authenticated', userId: 'acct-a', deviceId: 'dev-revoked' },
        { accountId: 'acct-a', status: 'revoked' },
      ),
    ).toBe(false);
    expect(canMutateDirectly('encrypted_blobs', { role: 'authenticated', userId: 'acct-a', deviceId: 'dev-a' }, { accountId: 'acct-a' })).toBe(false);
  });

  it('verifies mock Supabase queries carry the user_id/account_id filter', () => {
    expect(() =>
      assertUserFilter({ table: 'encrypted_blobs', filters: { account_id: 'acct-a' } }, {
        role: 'authenticated',
        userId: 'acct-a',
        deviceId: 'dev-a',
      }),
    ).not.toThrow();
    expect(() =>
      assertUserFilter({ table: 'encrypted_blobs', filters: {} }, {
        role: 'authenticated',
        userId: 'acct-a',
        deviceId: 'dev-a',
      }),
    ).toThrow(/E3030/);
  });

  it('keeps RLS SQL migration parseable for local review', () => {
    const sql = readFileSync(path.join(migrationsDir, '20260519000006_rls_policies.sql'), 'utf8');

    expect(sql).toContain('ENABLE ROW LEVEL SECURITY');
    expect(sql).toContain('sync_devices');
    expect(sql).not.toContain('TODO');
  });
});

describe.skipIf(!process.env.SUPABASE_INTEGRATION_TESTS)('[integration] sync-v1 RLS policies', () => {
  const testDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(testDir, '../../../..');
  const migrationsDir = path.join(repoRoot, 'apps/web/supabase/migrations');
  const containerName = `xai-sync-rls-${process.pid}`;

  const accountA = '11111111-1111-4111-8111-111111111111';
  const accountB = '22222222-2222-4222-8222-222222222222';
  const activeDeviceA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
  const revokedDeviceA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2';
  const pendingDeviceA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3';
  const activeDeviceB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1';

  const migrations = readdirSync(migrationsDir)
    .filter((migration) => migration.endsWith('.sql'))
    .sort();

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

  function sqlLiteral(value: string): string {
    return `'${value.replaceAll("'", "''")}'`;
  }

  function asRole(role: 'authenticated' | 'anon', accountId: string | null, deviceId: string | null, sql: string): string {
    const claims = accountId === null ? {} : { sub: accountId, device_id: deviceId };

    return psql(`
  BEGIN;
  SET LOCAL ROLE ${role};
  SET LOCAL row_security = on;
  SET LOCAL "request.jwt.claim.sub" = ${sqlLiteral(accountId ?? '')};
  SET LOCAL "request.jwt.claims" = ${sqlLiteral(JSON.stringify(claims))};
  ${sql}
  ROLLBACK;
  `);
  }

  function countAs(role: 'authenticated' | 'anon', accountId: string | null, deviceId: string | null, sql: string): number {
    return Number.parseInt(asRole(role, accountId, deviceId, sql), 10);
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
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA realtime TO authenticated, anon;
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public, realtime TO authenticated, anon;
  GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO authenticated, anon;
  GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public, realtime TO authenticated, anon;

  INSERT INTO accounts (
    id, email, kek_salt, secret_key_check, dek_check, recovery_signing_pub
  ) VALUES
    ('${accountA}', 'a@example.test', '\\x01', '\\x02', '\\x03', '\\x04'),
    ('${accountB}', 'b@example.test', '\\x01', '\\x02', '\\x03', '\\x04');

  INSERT INTO account_keyring (account_id, key_id, status) VALUES
    ('${accountA}', 1, 'active'),
    ('${accountB}', 1, 'active');

  INSERT INTO sync_devices (
    device_id, account_id, device_pub, encryption_device_id, status, revoked_at
  ) VALUES
    ('${activeDeviceA}', '${accountA}', '\\xaa', 1001, 'active', NULL),
    ('${revokedDeviceA}', '${accountA}', '\\xab', 1002, 'revoked', now()),
    ('${pendingDeviceA}', '${accountA}', '\\xac', 1003, 'pending_dek_wrap', NULL),
    ('${activeDeviceB}', '${accountB}', '\\xba', 2001, 'active', NULL);

  INSERT INTO device_dek_wraps (account_id, device_id, key_id, wrap) VALUES
    ('${accountA}', '${activeDeviceA}', 1, '\\x10'),
    ('${accountA}', '${revokedDeviceA}', 1, '\\x11'),
    ('${accountB}', '${activeDeviceB}', 1, '\\x20');

  INSERT INTO encrypted_blobs (
    account_id, entity_type, entity_id, revision, key_id, encryption_device_id,
    counter, blob, commit_seq, client_updated_at, originator_device_id,
    mutation_id, blob_size
  ) VALUES
    ('${accountA}', 'todos', 'todo-a', 1, 1, 1001, 1, '\\x10', 1, 1, '${activeDeviceA}', 'aaaaaaaa-1111-4111-8111-111111111111', 1),
    ('${accountB}', 'todos', 'todo-b', 1, 1, 2001, 1, '\\x20', 1, 1, '${activeDeviceB}', 'bbbbbbbb-1111-4111-8111-111111111111', 1);

  INSERT INTO mutation_dedup (account_id, mutation_id, result) VALUES
    ('${accountA}', 'aaaaaaaa-2222-4222-8222-222222222222', '{"ok":true}'::jsonb);

  INSERT INTO device_sync_progress (account_id, device_id, last_ack_commit_seq) VALUES
    ('${accountA}', '${activeDeviceA}', 1);
  `);
  });

  afterAll(() => {
    try {
      docker(['rm', '-f', containerName]);
    } catch {
      // Container cleanup is best effort; failed setup may leave nothing to remove.
    }
  });

  describe('Docker Postgres behavior', () => {
    it('allows an active device to read only its account blobs and own DEK wrap', () => {
      expect(countAs('authenticated', accountA, activeDeviceA, 'SELECT count(*) FROM encrypted_blobs;')).toBe(1);
      expect(
        countAs('authenticated', accountA, activeDeviceA, `SELECT count(*) FROM encrypted_blobs WHERE account_id = '${accountB}';`),
      ).toBe(0);
      expect(countAs('authenticated', accountA, activeDeviceA, 'SELECT count(*) FROM device_dek_wraps;')).toBe(1);
    });

    it('denies revoked devices active-gated reads', () => {
      expect(countAs('authenticated', accountA, revokedDeviceA, 'SELECT count(*) FROM encrypted_blobs;')).toBe(0);
      expect(countAs('authenticated', accountA, revokedDeviceA, 'SELECT count(*) FROM device_dek_wraps;')).toBe(0);
      expect(countAs('authenticated', accountA, revokedDeviceA, 'SELECT count(*) FROM mutation_dedup;')).toBe(0);
      expect(countAs('authenticated', accountA, revokedDeviceA, 'SELECT count(*) FROM device_sync_progress;')).toBe(0);
    });

    it('keeps sync_devices active-only while allowing a pending device to poll itself', () => {
      expect(asRole('authenticated', accountA, activeDeviceA, "SELECT string_agg(status, ',' ORDER BY status) FROM sync_devices;")).toBe(
        'active',
      );
      expect(countAs('authenticated', accountA, pendingDeviceA, 'SELECT count(*) FROM sync_devices;')).toBe(1);
      expect(countAs('authenticated', accountA, revokedDeviceA, 'SELECT count(*) FROM sync_devices;')).toBe(0);
    });

    it('denies anon reads and direct client writes', () => {
      expect(countAs('anon', null, null, 'SELECT count(*) FROM encrypted_blobs;')).toBe(0);
      expect(
        asRole(
          'authenticated',
          accountA,
          activeDeviceA,
          `UPDATE accounts SET encrypted_display_name = '\\x99' WHERE id = '${accountA}';
           SELECT count(*) FROM accounts WHERE id = '${accountA}' AND encrypted_display_name = '\\x99';`,
        ),
      ).toBe('0');
      expect(() =>
        asRole(
          'authenticated',
          accountA,
          revokedDeviceA,
          `INSERT INTO encrypted_blobs (
            account_id, entity_type, entity_id, revision, key_id, encryption_device_id,
            counter, blob, commit_seq, client_updated_at, originator_device_id,
            mutation_id, blob_size
          ) VALUES (
            '${accountA}', 'todos', 'forbidden', 2, 1, 1002, 2, '\\x30', 2, 2,
            '${revokedDeviceA}', 'aaaaaaaa-3333-4333-8333-333333333333', 1
          );`,
        ),
      ).toThrow();
    });
  });
});
