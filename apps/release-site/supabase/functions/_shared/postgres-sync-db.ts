import type {
  PushDatabase,
  PushRecordResult,
  StoredBlob,
} from '../sync-push/handler.ts';
import type {
  PullDatabase,
  StoredPullBlob,
} from '../sync-pull/handler.ts';

type Row = Record<string, unknown>;

interface SqlTag {
  <T extends Row = Row>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T[]>;
  begin<T>(fn: (sql: SqlTag) => Promise<T>): Promise<T>;
  end(): Promise<void>;
}

interface PostgresFactory {
  (url: string, options?: Record<string, unknown>): SqlTag;
}

export interface PostgresSyncDatabase extends PushDatabase, PullDatabase {
  close(): Promise<void>;
}

export async function createPostgresSyncDatabase(
  databaseUrl: string,
): Promise<PostgresSyncDatabase> {
  const postgres = await loadPostgres();
  const rootSql = postgres(databaseUrl, { prepare: false });
  const txStack: SqlTag[] = [];
  const currentSql = () => txStack[txStack.length - 1] ?? rootSql;

  return {
    async transaction<T>(fn: () => Promise<T>): Promise<T> {
      if (txStack.length > 0) {
        return fn();
      }
      return rootSql.begin(async (txSql) => {
        txStack.push(txSql);
        try {
          return await fn();
        } finally {
          txStack.pop();
        }
      });
    },

    async getKeyQuarantine(accountId) {
      const sql = currentSql();
      const rows = await sql<{
        current_dek_key_id: number;
        key_quarantine_at: string | null;
      }>`
        SELECT current_dek_key_id, key_quarantine_at
        FROM accounts
        WHERE id = ${accountId}::uuid
        LIMIT 1
      `;
      const row = rows[0];
      if (!row) {
        return undefined;
      }
      return {
        currentDekKeyId: Number(row.current_dek_key_id),
        keyQuarantineAt:
          row.key_quarantine_at === null ? null : String(row.key_quarantine_at),
      };
    },

    async getMutationDedup(accountId, mutationId) {
      const sql = currentSql();
      const rows = await sql<{ result: unknown }>`
        SELECT result
        FROM mutation_dedup
        WHERE account_id = ${accountId}::uuid
          AND mutation_id = ${mutationId}::uuid
        LIMIT 1
      `;
      const result = rows[0]?.result;
      if (!result) {
        return undefined;
      }
      return coercePushRecordResult(result);
    },

    async putMutationDedup(accountId, mutationId, result) {
      const sql = currentSql();
      await sql`
        INSERT INTO mutation_dedup (account_id, mutation_id, result)
        VALUES (
          ${accountId}::uuid,
          ${mutationId}::uuid,
          ${JSON.stringify(result)}::jsonb
        )
        ON CONFLICT (account_id, mutation_id)
        DO UPDATE SET result = EXCLUDED.result
      `;
    },

    async getCurrentBlob(accountId, entityType, entityId) {
      const sql = currentSql();
      const rows = await sql<Row>`
        SELECT account_id, entity_type, entity_id, revision, key_id,
               encryption_device_id, counter, blob, commit_seq,
               client_updated_at, originator_device_id, mutation_id, blob_size
        FROM encrypted_blobs
        WHERE account_id = ${accountId}::uuid
          AND entity_type = ${entityType}::sync_entity_type
          AND entity_id = ${entityId}
        LIMIT 1
      `;
      return rows[0] ? toStoredBlob(rows[0]) : undefined;
    },

    async upsertBlob(blob) {
      const sql = currentSql();
      await sql`
        INSERT INTO encrypted_blobs (
          account_id, entity_type, entity_id, revision, key_id,
          encryption_device_id, counter, blob, commit_seq, client_updated_at,
          deleted_at, hard_deleted, originator_device_id, mutation_id, blob_size
        )
        VALUES (
          ${blob.accountId}::uuid,
          ${blob.entityType}::sync_entity_type,
          ${blob.entityId},
          ${blob.revision.toString()}::bigint,
          ${blob.keyId},
          ${blob.encryptionDeviceId.toString()}::bigint,
          ${blob.counter.toString()}::bigint,
          ${toUint8Array(blob.blob)},
          ${blob.commitSeq.toString()}::bigint,
          ${blob.clientUpdatedAtMs},
          ${blob.hardDeleted ? new Date().toISOString() : null}::timestamptz,
          ${blob.hardDeleted},
          ${blob.originatorDeviceId}::uuid,
          ${blob.mutationId}::uuid,
          ${blob.blobSize}
        )
        ON CONFLICT (account_id, entity_type, entity_id)
        DO UPDATE SET
          revision = EXCLUDED.revision,
          key_id = EXCLUDED.key_id,
          encryption_device_id = EXCLUDED.encryption_device_id,
          counter = EXCLUDED.counter,
          blob = EXCLUDED.blob,
          commit_seq = EXCLUDED.commit_seq,
          client_updated_at = EXCLUDED.client_updated_at,
          server_updated_at = now(),
          deleted_at = EXCLUDED.deleted_at,
          hard_deleted = EXCLUDED.hard_deleted,
          originator_device_id = EXCLUDED.originator_device_id,
          mutation_id = EXCLUDED.mutation_id,
          blob_size = EXCLUDED.blob_size
      `;
    },

    async insertConflictShadow(input) {
      const sql = currentSql();
      const incoming = input.incoming;
      await sql`
        INSERT INTO encrypted_blobs_conflict_shadow (
          account_id, entity_type, entity_id, loser_blob, loser_key_id,
          loser_encryption_device_id, loser_counter, loser_revision,
          loser_deleted_flag, loser_schema_version, loser_blob_size,
          loser_mutation_id, loser_device_id, loser_commit_seq,
          winner_commit_seq
        )
        VALUES (
          ${input.accountId}::uuid,
          ${incoming.entityType}::sync_entity_type,
          ${incoming.entityId},
          ${toUint8Array(incoming.blob)},
          ${incoming.keyId},
          ${incoming.encryptionDeviceId.toString()}::bigint,
          ${incoming.counter.toString()}::integer,
          ${incoming.revision.toString()}::bigint,
          ${incoming.hardDeleted ? 2 : 0},
          1,
          ${incoming.blobSize},
          ${incoming.mutationId}::uuid,
          ${incoming.originatorDeviceId}::uuid,
          ${incoming.commitSeq.toString()}::bigint,
          ${input.winnerCommitSeq.toString()}::bigint
        )
      `;
    },

    async allocCommitSeq(accountId) {
      const sql = currentSql();
      const rows = await sql<{ seq: string | number | bigint }>`
        SELECT fn_alloc_commit_seq(${accountId}::uuid) AS seq
      `;
      return BigInt(rows[0]!.seq);
    },

    async getCurrentAccountCommitSeq(accountId) {
      const sql = currentSql();
      const rows = await sql<{ current_account_commit_seq: string | number | bigint }>`
        SELECT current_account_commit_seq
        FROM accounts
        WHERE id = ${accountId}::uuid
        LIMIT 1
      `;
      return BigInt(rows[0]?.current_account_commit_seq ?? 0);
    },

    async listBlobs(input) {
      const sql = currentSql();
      const rows = input.entityType
        ? await sql<Row>`
            SELECT account_id, entity_type, entity_id, revision, key_id,
                   blob, commit_seq, deleted_at, hard_deleted,
                   originator_device_id
            FROM encrypted_blobs
            WHERE account_id = ${input.accountId}::uuid
              AND commit_seq > ${input.sinceCommitSeq.toString()}::bigint
              AND entity_type = ${input.entityType}::sync_entity_type
            ORDER BY commit_seq ASC
            LIMIT ${input.limit}
          `
        : await sql<Row>`
            SELECT account_id, entity_type, entity_id, revision, key_id,
                   blob, commit_seq, deleted_at, hard_deleted,
                   originator_device_id
            FROM encrypted_blobs
            WHERE account_id = ${input.accountId}::uuid
              AND commit_seq > ${input.sinceCommitSeq.toString()}::bigint
            ORDER BY commit_seq ASC
            LIMIT ${input.limit}
          `;
      return rows.map(toStoredPullBlob);
    },

    async close() {
      await rootSql.end();
    },
  };
}

async function loadPostgres(): Promise<PostgresFactory> {
  // @ts-expect-error Deno resolves the remote postgresjs module at deploy time.
  const postgresModule = await import('https://deno.land/x/postgresjs@v3.4.5/mod.js');
  return postgresModule.default as unknown as PostgresFactory;
}

function coercePushRecordResult(input: unknown): PushRecordResult {
  if (typeof input === 'string') {
    return JSON.parse(input) as PushRecordResult;
  }
  return input as PushRecordResult;
}

function toStoredBlob(row: Row): StoredBlob {
  return {
    accountId: String(row.account_id),
    entityType: String(row.entity_type),
    entityId: String(row.entity_id),
    revision: BigInt(row.revision as string | number | bigint),
    keyId: Number(row.key_id),
    encryptionDeviceId: BigInt(row.encryption_device_id as string | number | bigint),
    counter: BigInt(row.counter as string | number | bigint),
    blob: toByteArray(row.blob),
    commitSeq: BigInt(row.commit_seq as string | number | bigint),
    clientUpdatedAtMs: Number(row.client_updated_at),
    originatorDeviceId: String(row.originator_device_id),
    mutationId: String(row.mutation_id),
    blobSize: Number(row.blob_size),
    hardDeleted: Boolean(row.hard_deleted),
  };
}

function toStoredPullBlob(row: Row): StoredPullBlob {
  return {
    accountId: String(row.account_id),
    entityType: String(row.entity_type),
    entityId: String(row.entity_id),
    revision: BigInt(row.revision as string | number | bigint),
    keyId: Number(row.key_id),
    blob: toByteArray(row.blob),
    commitSeq: BigInt(row.commit_seq as string | number | bigint),
    deletedAt:
      row.deleted_at === null || row.deleted_at === undefined
        ? null
        : String(row.deleted_at),
    hardDeleted: Boolean(row.hard_deleted),
    originatorDeviceId: String(row.originator_device_id),
  };
}

function toUint8Array(bytes: readonly number[]): Uint8Array {
  return Uint8Array.from(bytes);
}

function toByteArray(input: unknown): number[] {
  if (input instanceof Uint8Array) {
    return Array.from(input);
  }
  if (ArrayBuffer.isView(input)) {
    const view = input as ArrayBufferView;
    return Array.from(new Uint8Array(view.buffer, view.byteOffset, view.byteLength));
  }
  if (Array.isArray(input)) {
    return input.map((value) => Number(value));
  }
  if (typeof input === 'string' && input.startsWith('\\x')) {
    const bytes: number[] = [];
    for (let index = 2; index < input.length; index += 2) {
      bytes.push(Number.parseInt(input.slice(index, index + 2), 16));
    }
    return bytes;
  }
  throw new Error('E3005: unsupported bytea value from database');
}
