import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AuditLogHashChain } from '../../../../packages/audit-log-integrity/src';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../../../..');
const migrationsDir = path.join(repoRoot, 'apps/web/supabase/migrations');

describe('[smoke] sync audit log integrity mock', () => {
  it('appends events and exposes count/last-hash summary without payload telemetry', () => {
    const chain = new AuditLogHashChain();
    const first = chain.append({ accountId: 'acct-a', eventType: 'push', timestampMs: 1 });
    const second = chain.append({ accountId: 'acct-a', eventType: 'conflict', timestampMs: 2 });

    expect(first.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(second.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(second.previousHash).toBe(first.hash);
    expect(chain.telemetry()).toEqual([
      { eventType: 'push', timestampMs: 1 },
      { eventType: 'conflict', timestampMs: 2 },
    ]);
  });

  it('detects tampering in the local hash chain verifier', () => {
    const chain = new AuditLogHashChain();
    chain.append({ accountId: 'acct-a', eventType: 'push', timestampMs: 1 });
    chain.append({ accountId: 'acct-a', eventType: 'rekey_complete', timestampMs: 2 });
    const tampered = chain.list();
    tampered[0] = { ...tampered[0]!, eventType: 'pull' };

    expect(() => chain.verify()).not.toThrow();
    expect(() => chain.verify(tampered)).toThrow(/E3025/);
  });

  it('keeps audit SQL migration parseable for local review', () => {
    const sql = readFileSync(path.join(migrationsDir, '20260519000009_audit_log_integrity.sql'), 'utf8');

    expect(sql).toContain('sync_audit_log');
    expect(sql).toContain('fn_append_sync_audit_log');
    expect(sql).not.toContain('TODO');
  });
});

describe.skipIf(!process.env.SUPABASE_INTEGRATION_TESTS)('[integration] sync audit log integrity', () => {
  const testDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(testDir, '../../../..');
  const migrationsDir = path.join(repoRoot, 'apps/web/supabase/migrations');
  const containerName = `xai-sync-audit-${process.pid}`;

  const accountA = '44444444-4444-4444-8444-444444444444';
  const accountB = '55555555-5555-4555-8555-555555555555';
  const deviceA = 'dddddddd-dddd-4ddd-8ddd-ddddddddddd1';
  const mutationA = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1';

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
    ('${accountA}', 'audit-a@example.test', '\\x01', '\\x02', '\\x03', '\\x04'),
    ('${accountB}', 'audit-b@example.test', '\\x01', '\\x02', '\\x03', '\\x04');

  INSERT INTO account_keyring (account_id, key_id, status) VALUES
    ('${accountA}', 1, 'active'),
    ('${accountB}', 1, 'active');

  INSERT INTO sync_devices (
    device_id, account_id, device_pub, encryption_device_id, status, revoked_at
  ) VALUES
    ('${deviceA}', '${accountA}', '\\xda', 4001, 'active', NULL);
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
    it('appends events, hashes device_id, and exposes count/last-hash summary', () => {
      const first = psql(`
  SELECT entry_count || ':' || encode(last_hash, 'hex')
  FROM fn_append_sync_audit_log(
    '${accountA}',
    'push',
    '${deviceA}',
    1,
    'todos',
    'todo-a',
    '${mutationA}',
    '{"status":"ok"}'::jsonb
  );
  `);
      const second = psql(`
  SELECT entry_count || ':' || encode(last_hash, 'hex')
  FROM fn_append_sync_audit_log(
    '${accountA}',
    'conflict',
    '${deviceA}',
    2,
    'todos',
    'todo-a',
    NULL,
    '{"status":"revision_mismatch"}'::jsonb
  );
  `);

      expect(first).toMatch(/^1:[0-9a-f]{64}$/);
      expect(second).toMatch(/^2:[0-9a-f]{64}$/);
      expect(second).not.toBe(first);
      expect(
        psql(`SELECT entry_count || ':' || encode(last_hash, 'hex') FROM fn_sync_audit_summary('${accountA}');`),
      ).toBe(second);

      const deviceHash = psql(`SELECT encode(device_hash, 'hex') FROM sync_audit_log WHERE id = 1;`);
      expect(deviceHash).toMatch(/^[0-9a-f]{64}$/);
      expect(deviceHash).not.toContain(deviceA.replaceAll('-', ''));
    });

    it('blocks UPDATE and DELETE on sync_audit_log', () => {
      expect(() =>
        psql(`UPDATE sync_audit_log SET event_type = 'pull' WHERE account_id = '${accountA}';`),
      ).toThrow();
      expect(() =>
        psql(`DELETE FROM sync_audit_log WHERE account_id = '${accountA}';`),
      ).toThrow();
    });
  });
});
