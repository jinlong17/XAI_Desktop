import type { SqliteDriver } from '@repo/core-data';

export interface AuditSummary {
  accountId: string;
  entryCount: number;
  lastHash: string | null;
  updatedAtMs: number;
}

export interface ServerAuditSummary {
  accountId: string;
  entryCount: number;
  lastHash: string | null;
}

export interface AuditMirrorOptions {
  nowMs?: () => number;
}

export interface AuditMirror {
  init(): Promise<void>;
  getSummary(accountId: string): Promise<AuditSummary | undefined>;
  updateSummary(summary: ServerAuditSummary): Promise<void>;
  assertConsistent(summary: ServerAuditSummary): Promise<void>;
}

export class SyncAuditMismatchError extends Error {
  readonly code = 'E3025';

  constructor(readonly local: AuditSummary | undefined, readonly server: ServerAuditSummary) {
    super(`E3025: sync audit mismatch for account ${server.accountId}; sync paused`);
    this.name = 'SyncAuditMismatchError';
  }
}

const CREATE_AUDIT_MIRROR_SQL = `
CREATE TABLE IF NOT EXISTS sync_audit_mirror (
  account_id TEXT PRIMARY KEY,
  entry_count INTEGER NOT NULL,
  last_hash TEXT,
  updated_at_ms INTEGER NOT NULL
)`;

const UPSERT_AUDIT_MIRROR_SQL = `
INSERT INTO sync_audit_mirror (account_id, entry_count, last_hash, updated_at_ms)
VALUES (?, ?, ?, ?)
ON CONFLICT(account_id) DO UPDATE SET
  entry_count = excluded.entry_count,
  last_hash = excluded.last_hash,
  updated_at_ms = excluded.updated_at_ms`;

const SELECT_AUDIT_MIRROR_SQL = `
SELECT account_id, entry_count, last_hash, updated_at_ms
FROM sync_audit_mirror
WHERE account_id = ?`;

export function createAuditMirror(
  driver: SqliteDriver,
  options: AuditMirrorOptions = {},
): AuditMirror {
  const nowMs = options.nowMs ?? Date.now;

  async function init(): Promise<void> {
    await driver.execute(CREATE_AUDIT_MIRROR_SQL);
  }

  return {
    init,

    async getSummary(accountId): Promise<AuditSummary | undefined> {
      await init();
      const rows = await driver.query<AuditMirrorRow>(SELECT_AUDIT_MIRROR_SQL, [accountId]);
      return rows[0] ? rowToSummary(rows[0]) : undefined;
    },

    async updateSummary(summary): Promise<void> {
      await init();
      await driver.transaction((tx) =>
        tx.execute(UPSERT_AUDIT_MIRROR_SQL, [
          summary.accountId,
          summary.entryCount,
          summary.lastHash,
          nowMs(),
        ]),
      );
    },

    async assertConsistent(server): Promise<void> {
      const local = await this.getSummary(server.accountId);
      if (
        local &&
        (local.entryCount !== server.entryCount || local.lastHash !== server.lastHash)
      ) {
        throw new SyncAuditMismatchError(local, server);
      }
      await this.updateSummary(server);
    },
  };
}

function rowToSummary(row: AuditMirrorRow): AuditSummary {
  return {
    accountId: row.account_id,
    entryCount: row.entry_count,
    lastHash: row.last_hash,
    updatedAtMs: row.updated_at_ms,
  };
}

interface AuditMirrorRow extends Record<string, unknown> {
  account_id: string;
  entry_count: number;
  last_hash: string | null;
  updated_at_ms: number;
}

export const AUDIT_MIRROR_SQL = {
  create: CREATE_AUDIT_MIRROR_SQL,
  upsert: UPSERT_AUDIT_MIRROR_SQL,
  select: SELECT_AUDIT_MIRROR_SQL,
} as const;
