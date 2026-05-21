import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fc from 'fast-check';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { runRlsIsolationFuzz } from '../../../../packages/rls-fuzz-property/src';

describe('[smoke] sync-v1 RLS fuzz property mock', () => {
  it('never exposes cross-account rows or other-device wraps in generated cases', () => {
    expect(runRlsIsolationFuzz(2000)).toEqual([]);
  });
});

describe.skipIf(!process.env.SUPABASE_INTEGRATION_TESTS)('[integration] sync-v1 RLS property fuzz', () => {
  const testDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(testDir, '../../../..');
  const migrationsDir = path.join(repoRoot, 'apps/web/supabase/migrations');
  const containerName = `xai-sync-rls-fuzz-${process.pid}`;

  const userCount = 1000;
  const devicesPerUser = 100;

  const migrations = readdirSync(migrationsDir)
    .filter((migration) => migration.endsWith('.sql'))
    .sort();

  type DeviceStatus = 'active' | 'pending_dek_wrap' | 'revoked';

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

  function asAuthenticated(accountId: string, deviceId: string, sql: string): string {
    const claims = JSON.stringify({ sub: accountId, device_id: deviceId });

    return psql(`
  BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL row_security = on;
  SET LOCAL "request.jwt.claim.sub" = ${sqlLiteral(accountId)};
  SET LOCAL "request.jwt.claims" = ${sqlLiteral(claims)};
  ${sql}
  ROLLBACK;
  `);
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

  CREATE TEMP TABLE fuzz_accounts AS
  SELECT
    idx,
    ('00000000-0000-4000-8000-' || lpad(to_hex(idx), 12, '0'))::uuid AS account_id
  FROM generate_series(1, ${userCount}) AS idx;

  CREATE TEMP TABLE fuzz_devices AS
  SELECT
    a.idx AS account_idx,
    d.idx AS device_idx,
    ('10000000-0000-4000-8000-' || lpad(to_hex(((a.idx - 1) * ${devicesPerUser}) + d.idx), 12, '0'))::uuid AS device_id,
    CASE
      WHEN d.idx % 10 = 0 THEN 'revoked'
      WHEN d.idx % 10 = 1 THEN 'pending_dek_wrap'
      ELSE 'active'
    END AS status
  FROM generate_series(1, ${userCount}) AS a(idx)
  CROSS JOIN generate_series(1, ${devicesPerUser}) AS d(idx);

  INSERT INTO accounts (
    id, email, kek_salt, secret_key_check, dek_check, recovery_signing_pub
  )
  SELECT account_id, 'fuzz-' || idx || '@example.test', '\\x01', '\\x02', '\\x03', '\\x04'
  FROM fuzz_accounts;

  INSERT INTO account_keyring (account_id, key_id, status)
  SELECT account_id, 1, 'active'
  FROM fuzz_accounts;

  INSERT INTO sync_devices (
    device_id, account_id, device_pub, encryption_device_id, status, revoked_at
  )
  SELECT
    d.device_id,
    a.account_id,
    '\\xaa',
    ((d.account_idx - 1) * ${devicesPerUser}) + d.device_idx,
    d.status,
    CASE WHEN d.status = 'revoked' THEN now() ELSE NULL END
  FROM fuzz_devices d
  JOIN fuzz_accounts a ON a.idx = d.account_idx;

  INSERT INTO device_dek_wraps (account_id, device_id, key_id, wrap)
  SELECT a.account_id, d.device_id, 1, '\\x10'
  FROM fuzz_devices d
  JOIN fuzz_accounts a ON a.idx = d.account_idx;

  INSERT INTO encrypted_blobs (
    account_id, entity_type, entity_id, revision, key_id, encryption_device_id,
    counter, blob, commit_seq, client_updated_at, originator_device_id,
    mutation_id, blob_size
  )
  SELECT
    a.account_id,
    'todos',
    'todo-' || a.idx,
    1,
    1,
    ((a.idx - 1) * ${devicesPerUser}) + 2,
    1,
    '\\x10',
    a.idx,
    1,
    ('10000000-0000-4000-8000-' || lpad(to_hex(((a.idx - 1) * ${devicesPerUser}) + 2), 12, '0'))::uuid,
    ('20000000-0000-4000-8000-' || lpad(to_hex(a.idx), 12, '0'))::uuid,
    1
  FROM fuzz_accounts a;

  INSERT INTO encrypted_blobs_conflict_shadow (
    account_id, entity_type, entity_id, loser_blob, loser_key_id,
    loser_encryption_device_id, loser_counter, loser_revision,
    loser_deleted_flag, loser_schema_version, loser_blob_size,
    loser_mutation_id, loser_device_id, loser_commit_seq, winner_commit_seq
  )
  SELECT
    a.account_id,
    'todos',
    'shadow-' || a.idx,
    '\\x20',
    1,
    ((a.idx - 1) * ${devicesPerUser}) + 2,
    2,
    1,
    0,
    1,
    1,
    ('30000000-0000-4000-8000-' || lpad(to_hex(a.idx), 12, '0'))::uuid,
    ('10000000-0000-4000-8000-' || lpad(to_hex(((a.idx - 1) * ${devicesPerUser}) + 2), 12, '0'))::uuid,
    a.idx,
    a.idx + ${userCount}
  FROM fuzz_accounts a;

  INSERT INTO staging_blobs (
    account_id, rekey_session_id, snapshot_commit_seq, new_key_id, entity_type,
    entity_id, preserved_revision, new_encryption_device_id, new_counter,
    new_blob, preserved_deleted_flag, preserved_schema_version, source_mutation_id
  )
  SELECT
    a.account_id,
    ('40000000-0000-4000-8000-' || lpad(to_hex(a.idx), 12, '0'))::uuid,
    a.idx,
    1,
    'todos',
    'stage-' || a.idx,
    1,
    ((a.idx - 1) * ${devicesPerUser}) + 2,
    3,
    '\\x30',
    0,
    1,
    ('50000000-0000-4000-8000-' || lpad(to_hex(a.idx), 12, '0'))::uuid
  FROM fuzz_accounts a;
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
    it('has the required 1000-user x 100-device dataset', () => {
      expect(psql('SELECT count(*) FROM accounts;')).toBe('1000');
      expect(psql('SELECT count(*) FROM sync_devices;')).toBe('100000');
    });

    it(
      'leaks zero cross-tenant rows and denies revoked/pending devices',
      () => {
        const attemptArb = fc.record({
          actorAccount: fc.integer({ min: 1, max: userCount }),
          actorDevice: fc.integer({ min: 1, max: devicesPerUser }),
          targetAccount: fc.integer({ min: 1, max: userCount }),
        });

        let crossTenantLeaks = 0;
        let inactiveDeviceLeaks = 0;
        let inactiveAttempts = 0;

        fc.assert(
          fc.property(fc.array(attemptArb, { minLength: 60, maxLength: 60 }), (attempts) => {
            for (const attempt of attempts) {
              const actorAccountId = accountUuid(attempt.actorAccount);
              const actorDeviceId = deviceUuid(attempt.actorAccount, attempt.actorDevice);
              const targetAccountId = accountUuid(attempt.targetAccount);
              const status = deviceStatus(attempt.actorDevice);
              const counts = protectedCounts(actorAccountId, actorDeviceId, targetAccountId);
              const visibleRows = counts.reduce((sum, count) => sum + count, 0);

              if (status !== 'active') {
                inactiveAttempts += 1;
                inactiveDeviceLeaks += visibleRows;
                expect(counts).toEqual([0, 0, 0, 0]);
              } else if (attempt.targetAccount !== attempt.actorAccount) {
                crossTenantLeaks += visibleRows;
                expect(counts).toEqual([0, 0, 0, 0]);
              }
            }
          }),
          { numRuns: 3, seed: 20260519 },
        );

        expect(crossTenantLeaks).toBe(0);
        expect(inactiveDeviceLeaks).toBe(0);
        expect(inactiveAttempts).toBeGreaterThan(0);
      },
      180_000,
    );

    it('explicitly denies revoked and pending devices on active-gated tables', () => {
      const accountId = accountUuid(42);
      const revokedDevice = deviceUuid(42, 10);
      const pendingDevice = deviceUuid(42, 11);

      expect(protectedCounts(accountId, revokedDevice, accountId)).toEqual([0, 0, 0, 0]);
      expect(protectedCounts(accountId, pendingDevice, accountId)).toEqual([0, 0, 0, 0]);
    });
  });

  function protectedCounts(actorAccountId: string, actorDeviceId: string, targetAccountId: string): number[] {
    return asAuthenticated(
      actorAccountId,
      actorDeviceId,
      `
  SELECT concat_ws(':',
    (SELECT count(*) FROM encrypted_blobs WHERE account_id = '${targetAccountId}'),
    (SELECT count(*) FROM encrypted_blobs_conflict_shadow WHERE account_id = '${targetAccountId}'),
    (SELECT count(*) FROM staging_blobs WHERE account_id = '${targetAccountId}'),
    (SELECT count(*) FROM device_dek_wraps WHERE account_id = '${targetAccountId}')
  );
  `,
    )
      .split(':')
      .map((value) => Number.parseInt(value, 10));
  }

  function accountUuid(index: number): string {
    return `00000000-0000-4000-8000-${hex12(index)}`;
  }

  function deviceUuid(accountIndex: number, deviceIndex: number): string {
    return `10000000-0000-4000-8000-${hex12((accountIndex - 1) * devicesPerUser + deviceIndex)}`;
  }

  function deviceStatus(deviceIndex: number): DeviceStatus {
    if (deviceIndex % 10 === 0) {
      return 'revoked';
    }
    if (deviceIndex % 10 === 1) {
      return 'pending_dek_wrap';
    }
    return 'active';
  }

  function hex12(value: number): string {
    return value.toString(16).padStart(12, '0');
  }
});
