import { describe, expect, it } from 'vitest';

import type { SqlParams, SqliteDriver, SqlValue } from '@repo/core-data';
import {
  AUDIT_MIRROR_SQL,
  SyncAuditMismatchError,
  createAuditMirror,
} from '../src';

describe('createAuditMirror', () => {
  it('stores server summary and accepts matching count/last-hash', async () => {
    const driver = createAuditTestDriver();
    const mirror = createAuditMirror(driver, { nowMs: () => 123 });

    await mirror.assertConsistent({
      accountId: 'account-1',
      entryCount: 2,
      lastHash: 'abc123',
    });
    await expect(mirror.getSummary('account-1')).resolves.toEqual({
      accountId: 'account-1',
      entryCount: 2,
      lastHash: 'abc123',
      updatedAtMs: 123,
    });

    await expect(
      mirror.assertConsistent({
        accountId: 'account-1',
        entryCount: 2,
        lastHash: 'abc123',
      }),
    ).resolves.toBeUndefined();
  });

  it('raises E3025 and leaves local mirror unchanged on server mismatch', async () => {
    const mirror = createAuditMirror(createAuditTestDriver(), { nowMs: () => 1 });
    await mirror.updateSummary({ accountId: 'account-1', entryCount: 4, lastHash: 'known' });

    await expect(
      mirror.assertConsistent({
        accountId: 'account-1',
        entryCount: 3,
        lastHash: 'tampered',
      }),
    ).rejects.toBeInstanceOf(SyncAuditMismatchError);
    await expect(mirror.getSummary('account-1')).resolves.toMatchObject({
      entryCount: 4,
      lastHash: 'known',
    });
  });
});

interface AuditTestDriver extends SqliteDriver {
  rows: Map<string, AuditRow>;
}

function createAuditTestDriver(): AuditTestDriver {
  const rows = new Map<string, AuditRow>();

  const driver: AuditTestDriver = {
    rows,

    async execute(sql, params = []) {
      const normalized = normalizeSql(sql);
      if (normalized === normalizeSql(AUDIT_MIRROR_SQL.create)) {
        return;
      }
      if (normalized === normalizeSql(AUDIT_MIRROR_SQL.upsert)) {
        const [accountId, entryCount, lastHash, updatedAtMs] = params;
        rows.set(asString(accountId), {
          account_id: asString(accountId),
          entry_count: asNumber(entryCount),
          last_hash: asNullableString(lastHash),
          updated_at_ms: asNumber(updatedAtMs),
        });
        return;
      }
      throw new Error(`unsupported audit execute SQL: ${normalized}`);
    },

    async query<T extends Record<string, unknown>>(sql: string, params: SqlParams = []) {
      const normalized = normalizeSql(sql);
      if (normalized === normalizeSql(AUDIT_MIRROR_SQL.select)) {
        const [accountId] = params;
        const row = rows.get(asString(accountId));
        return (row ? [row] : []) as unknown as T[];
      }
      throw new Error(`unsupported audit query SQL: ${normalized}`);
    },

    async transaction<T>(fn: (tx: SqliteDriver) => Promise<T>): Promise<T> {
      return fn(driver);
    },
  };

  return driver;
}

interface AuditRow extends Record<string, unknown> {
  account_id: string;
  entry_count: number;
  last_hash: string | null;
  updated_at_ms: number;
}

function normalizeSql(sql: string): string {
  return sql.replace(/\s+/g, ' ').trim();
}

function asString(value: SqlValue | undefined): string {
  if (typeof value !== 'string') {
    throw new Error('expected string SQL param');
  }
  return value;
}

function asNullableString(value: SqlValue | undefined): string | null {
  if (value === null || typeof value === 'string') {
    return value;
  }
  throw new Error('expected nullable string SQL param');
}

function asNumber(value: SqlValue | undefined): number {
  if (typeof value !== 'number') {
    throw new Error('expected number SQL param');
  }
  return value;
}
