import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { AuditLogHashChain } from '../../../../packages/audit-log-integrity/src';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../../../..');
const migrationsDir = path.join(repoRoot, 'apps/web/supabase/migrations');

describe('sync audit log integrity mock', () => {
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
