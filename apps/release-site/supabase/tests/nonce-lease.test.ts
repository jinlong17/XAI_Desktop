import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { InMemoryNonceLeaseServer } from '../../../../packages/nonce-lease-server/src';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../../../..');
const migrationsDir = path.join(repoRoot, 'apps/release-site/supabase/migrations');

describe('[smoke] sync-v1 nonce lease server mock', () => {
  it('issues strictly monotone non-overlapping leases for the active JWT device', () => {
    const server = seededServer();

    expect(server.grantNonceLease({ accountId: 'acct-a', deviceId: 'dev-active', keyId: 1, count: 3 })).toMatchObject({
      encryptionDeviceId: 3001n,
      leaseStart: 0n,
      leaseEnd: 2n,
    });
    expect(server.grantNonceLease({ accountId: 'acct-a', deviceId: 'dev-active', keyId: 1, count: 2 })).toMatchObject({
      leaseStart: 3n,
      leaseEnd: 4n,
    });
  });

  it('rejects revoked devices, duplicate used nonce tuples, and progress rollback', () => {
    const server = seededServer();

    expect(() => server.grantNonceLease({ accountId: 'acct-a', deviceId: 'dev-revoked', keyId: 1, count: 1 })).toThrow(
      /nonce_lease_not_owned/,
    );

    server.recordUsedNonce({
      accountId: 'acct-a',
      keyId: 1,
      encryptionDeviceId: 3001n,
      counter: 10n,
      source: 'blob',
    });
    expect(() =>
      server.recordUsedNonce({
        accountId: 'acct-a',
        keyId: 1,
        encryptionDeviceId: 3001n,
        counter: 10n,
        source: 'conflict_shadow',
      }),
    ).toThrow(/E3027/);

    server.updateProgress('acct-a', 'dev-active', 22n);
    expect(() => server.updateProgress('acct-a', 'dev-active', 21n)).toThrow(/E3024/);
  });

  it('keeps nonce lease SQL migration parseable for local review', () => {
    const sql = readFileSync(path.join(migrationsDir, '20260519000008_nonce_lease_rpc.sql'), 'utf8');

    expect(sql).toContain('fn_grant_nonce_lease');
    expect(sql).toContain('nonce_lease_exhausted');
    expect(sql).not.toContain('TODO');
  });
});

function seededServer(): InMemoryNonceLeaseServer {
  const server = new InMemoryNonceLeaseServer({ nowMs: () => 1000 });
  server.addDevice({ accountId: 'acct-a', deviceId: 'dev-active', encryptionDeviceId: 3001n, status: 'active' });
  server.addDevice({ accountId: 'acct-a', deviceId: 'dev-revoked', encryptionDeviceId: 3002n, status: 'revoked' });
  server.addKey({ accountId: 'acct-a', keyId: 1, status: 'active' });
  return server;
}

describe.skipIf(!process.env.SUPABASE_INTEGRATION_TESTS)('[integration] sync-v1 nonce lease server', () => {
  const testDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(testDir, '../../../..');
  const migrationsDir = path.join(repoRoot, 'apps/release-site/supabase/migrations');
  const containerName = `xai-sync-nonce-${process.pid}`;

  const accountA = '33333333-3333-4333-8333-333333333333';
  const activeDeviceA = 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1';
  const revokedDeviceA = 'cccccccc-cccc-4ccc-8ccc-ccccccccccc2';

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

  function asAuthenticated(accountId: string, deviceId: string, sql: string, commit = false): string {
    const claims = JSON.stringify({ sub: accountId, device_id: deviceId });

    return psql(`
  BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL row_security = on;
  SET LOCAL "request.jwt.claim.sub" = ${sqlLiteral(accountId)};
  SET LOCAL "request.jwt.claims" = ${sqlLiteral(claims)};
  ${sql}
  ${commit ? 'COMMIT;' : 'ROLLBACK;'}
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

  INSERT INTO accounts (
    id, email, kek_salt, secret_key_check, dek_check, recovery_signing_pub
  ) VALUES (
    '${accountA}', 'nonce@example.test', '\\x01', '\\x02', '\\x03', '\\x04'
  );

  INSERT INTO account_keyring (account_id, key_id, status) VALUES
    ('${accountA}', 1, 'active');

  INSERT INTO sync_devices (
    device_id, account_id, device_pub, encryption_device_id, status, revoked_at
  ) VALUES
    ('${activeDeviceA}', '${accountA}', '\\xca', 3001, 'active', NULL),
    ('${revokedDeviceA}', '${accountA}', '\\xcb', 3002, 'revoked', now());
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
    it('issues strictly monotone non-overlapping leases for the active JWT device', () => {
      expect(
        asAuthenticated(
          accountA,
          activeDeviceA,
          `SELECT encryption_device_id || ':' || lease_start || ':' || lease_end
           FROM fn_grant_nonce_lease('${accountA}', 1, 3);`,
          true,
        ),
      ).toBe('3001:0:2');

      expect(
        asAuthenticated(
          accountA,
          activeDeviceA,
          `SELECT encryption_device_id || ':' || lease_start || ':' || lease_end
           FROM fn_grant_nonce_lease('${accountA}', 1, 2);`,
          true,
        ),
      ).toBe('3001:3:4');

      expect(psql(`SELECT count(*) FROM nonce_lease WHERE account_id = '${accountA}' AND lease_start <= 4;`)).toBe('2');
    });

    it('rejects revoked-device leases and direct client nonce_lease mutation', () => {
      expect(() =>
        asAuthenticated(
          accountA,
          revokedDeviceA,
          `SELECT * FROM fn_grant_nonce_lease('${accountA}', 1, 1);`,
        ),
      ).toThrow();

      expect(asAuthenticated(accountA, activeDeviceA, 'SELECT count(*) FROM nonce_lease;')).toBe('0');
      expect(() =>
        asAuthenticated(
          accountA,
          activeDeviceA,
          `INSERT INTO nonce_lease (
            account_id, encryption_device_id, key_id, lease_start, lease_end
          ) VALUES ('${accountA}', 3001, 1, 100, 101);`,
        ),
      ).toThrow();
    });

    it('records used_nonces for blob writes and blocks reuse after hard delete', () => {
      psql(`
  INSERT INTO encrypted_blobs (
    account_id, entity_type, entity_id, revision, key_id, encryption_device_id,
    counter, blob, commit_seq, client_updated_at, originator_device_id,
    mutation_id, blob_size
  ) VALUES (
    '${accountA}', 'todos', 'nonce-a', 1, 1, 3001, 10, '\\x10', 10, 10,
    '${activeDeviceA}', 'cccccccc-1111-4111-8111-111111111111', 1
  );
  UPDATE encrypted_blobs
    SET hard_deleted = true
    WHERE account_id = '${accountA}' AND entity_id = 'nonce-a';
  `);

      expect(psql(`SELECT source FROM used_nonces WHERE account_id = '${accountA}' AND counter = 10;`)).toBe('blob');
      expect(() =>
        psql(`
  INSERT INTO encrypted_blobs (
    account_id, entity_type, entity_id, revision, key_id, encryption_device_id,
    counter, blob, commit_seq, client_updated_at, originator_device_id,
    mutation_id, blob_size
  ) VALUES (
    '${accountA}', 'todos', 'nonce-b', 1, 1, 3001, 10, '\\x11', 11, 11,
    '${activeDeviceA}', 'cccccccc-2222-4222-8222-222222222222', 1
  );
  `),
      ).toThrow();
    });

    it('records staging/shadow nonces and keeps used_nonces append-only', () => {
      psql(`
  INSERT INTO staging_blobs (
    account_id, rekey_session_id, snapshot_commit_seq, new_key_id, entity_type,
    entity_id, preserved_revision, new_encryption_device_id, new_counter,
    new_blob, preserved_deleted_flag, preserved_schema_version, source_mutation_id
  ) VALUES (
    '${accountA}', 'cccccccc-3333-4333-8333-333333333333', 1, 1, 'todos',
    'nonce-staging', 1, 3001, 20, '\\x20', 0, 1,
    'cccccccc-4444-4444-8444-444444444444'
  );

  INSERT INTO encrypted_blobs_conflict_shadow (
    account_id, entity_type, entity_id, loser_blob, loser_key_id,
    loser_encryption_device_id, loser_counter, loser_revision,
    loser_deleted_flag, loser_schema_version, loser_blob_size,
    loser_mutation_id, loser_device_id, winner_commit_seq
  ) VALUES (
    '${accountA}', 'todos', 'nonce-shadow', '\\x30', 1, 3001, 21, 1,
    0, 1, 1, 'cccccccc-5555-4555-8555-555555555555', '${activeDeviceA}', 21
  );
  `);

      expect(
        psql(
          `SELECT string_agg(source, ',' ORDER BY source)
           FROM used_nonces
           WHERE account_id = '${accountA}' AND counter IN (20, 21);`,
        ),
      ).toBe('shadow_loser,staging');
      expect(() => psql(`DELETE FROM used_nonces WHERE account_id = '${accountA}';`)).toThrow();
    });
  });
});
