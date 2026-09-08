import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import type { SqlParams, SqliteDriver, SqlValue } from '@repo/core-data';
import { processPushBatch, type PushDatabase, type StoredBlob } from '../../../../apps/release-site/supabase/functions/sync-push/handler';
import {
  TODO_SYNC_SQL,
  SyncPushRevisionMismatchError,
  applyServerRecords,
  createTodoSyncStore,
  pushBatch,
  type EntityState,
  type EntityStateStore,
  type PullRecord,
  type PushBatchResponse,
  type SyncCryptoClient,
  type SyncPushTransport,
  type TodoRecord,
} from '../../src';

describe('single-table todos local E2E', () => {
  it('writes todo and sync_outbox rows in one transaction', async () => {
    const driver = createTodoTestDriver();
    const store = createTodoSyncStore(driver, { nowMs: () => 10 });

    await store.putTodo(todo('todo-1', 'buy milk', 10), {
      mutationId: '018f0000-0000-7000-8000-000000000101',
    });

    const writeOps = driver.operations.filter((op) =>
      [normalizeSql(TODO_SYNC_SQL.upsertTodo), normalizeSql(TODO_SYNC_SQL.insertOutbox)].includes(
        op.sql,
      ),
    );
    expect(writeOps).toHaveLength(2);
    expect(writeOps[0]!.txId).toBe(writeOps[1]!.txId);
    expect(writeOps[0]!.txId).toBeGreaterThan(0);
    await expect(store.listOutbox()).resolves.toMatchObject([
      { entityType: 'todos', entityId: 'todo-1' },
    ]);
  });

  it('syncs one todo between two local devices and records conflict shadow on stale write', async () => {
    const server = new InMemoryPushServer();
    const key = createHash('sha256').update('test-account-secret').digest();
    const macA = createDevice('mac-a', 1n, key, server);
    const macB = createDevice('mac-b', 2n, key, server);

    await macA.store.putTodo(todo('todo-1', 'buy milk', 100), {
      mutationId: '018f0000-0000-7000-8000-000000000201',
      clientUpdatedAtMs: 100,
    });
    await macA.flushOutbox();

    expect(server.dumpBlobBytes()).not.toContain('buy milk');
    expect(() => decryptTodo(server.onlyBlob().blob, randomBytes(32))).toThrow();

    await macB.pull();
    await expect(macB.store.getTodo('todo-1')).resolves.toMatchObject({
      title: 'buy milk',
      completed: false,
    });

    await macA.store.putTodo(todo('todo-1', 'buy oat milk', 200), {
      mutationId: '018f0000-0000-7000-8000-000000000202',
      clientUpdatedAtMs: 200,
    });
    await macA.flushOutbox();

    await macB.store.putTodo(todo('todo-1', 'buy tea', 210), {
      mutationId: '018f0000-0000-7000-8000-000000000203',
      clientUpdatedAtMs: 210,
    });
    await expect(macB.flushOutbox()).rejects.toBeInstanceOf(SyncPushRevisionMismatchError);

    expect(server.conflicts).toHaveLength(1);
    expect(server.conflicts[0]).toMatchObject({
      accountId: 'account-1',
      winnerCommitSeq: 2n,
    });
    expect(decryptTodo(server.conflicts[0]!.incoming.blob, key)).toMatchObject({
      title: 'buy tea',
    });

    await macB.pull();
    await expect(macB.store.getTodo('todo-1')).resolves.toMatchObject({
      title: 'buy oat milk',
    });
  });
});

function createDevice(
  deviceId: string,
  encryptionDeviceId: bigint,
  key: Buffer,
  server: InMemoryPushServer,
) {
  const store = createTodoSyncStore(createTodoTestDriver());
  const entityStates = createEntityStateStore();
  let lastSeenAccountCommitSeq = 0n;
  let counter = 0;

  const crypto: SyncCryptoClient = {
    async encryptFor(input) {
      counter += 1;
      return encryptTodo(new TextDecoder().decode(input.plaintext), key, encryptionDeviceId, counter);
    },
  };

  const transport: SyncPushTransport = {
    async pushBatch(request) {
      const response = await processPushBatch(server, {
        accountId: 'account-1',
        records: request.records.map((record) => ({
          ...record,
          baseRevision: record.baseRevision,
          originatorDeviceId: deviceId,
        })),
      });
      return {
        status: 207,
        results: response.results.map((result) => ({
          ...result,
          status:
            result.status === 'duplicate_mutation_id'
              ? 'duplicate'
              : result.status,
        })),
      } as PushBatchResponse;
    },
  };

  return {
    store,

    async flushOutbox() {
      const entries = await store.listOutbox();
      const response = await pushBatch(
        {
          crypto,
          revisions: entityStates,
          transport,
        },
        { entries },
      );
      const applied = response.results.filter((result) =>
        result.status === 'ok' || result.status === 'duplicate',
      );
      await store.removeOutbox(applied.map((result) => result.mutationId));
      for (const result of applied) {
        const entry = entries.find((candidate) => candidate.mutationId === result.mutationId);
        if (entry && result.appliedRevision && result.commitSeq) {
          await entityStates.put({
            entityType: entry.entityType,
            entityId: entry.entityId,
            maxSeenRevision: BigInt(result.appliedRevision),
            lastBlobHash: `local:${result.mutationId}`,
            lastCommitSeq: BigInt(result.commitSeq),
            lastKeyId: 1,
          });
          lastSeenAccountCommitSeq = BigInt(result.commitSeq);
        }
      }
      return response;
    },

    async pull() {
      const response = await applyServerRecords(
        {
          entityStates,
          applier: {
            async apply(record: PullRecord) {
              await store.applyRemoteTodo(decryptTodo(record.envelope, key));
            },
          },
        },
        {
          records: server.pullSince(lastSeenAccountCommitSeq),
          currentAccountCommitSeq: server.currentCommitSeq.toString(),
          lastSeenAccountCommitSeq: lastSeenAccountCommitSeq.toString(),
        },
      );
      lastSeenAccountCommitSeq = response.currentAccountCommitSeq;
      return response;
    },
  };
}

class InMemoryPushServer implements PushDatabase {
  readonly conflicts: Array<{ accountId: string; incoming: StoredBlob; winnerCommitSeq: bigint }> = [];
  currentCommitSeq = 0n;

  private readonly blobs = new Map<string, StoredBlob>();
  private readonly dedup = new Map<string, PushBatchResponse['results'][number]>();

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    return fn();
  }

  async getMutationDedup(accountId: string, mutationId: string) {
    return this.dedup.get(`${accountId}:${mutationId}`);
  }

  async putMutationDedup(
    accountId: string,
    mutationId: string,
    result: PushBatchResponse['results'][number],
  ): Promise<void> {
    this.dedup.set(`${accountId}:${mutationId}`, result);
  }

  async getCurrentBlob(accountId: string, entityType: string, entityId: string) {
    return this.blobs.get(blobKey(accountId, entityType, entityId));
  }

  async upsertBlob(blob: StoredBlob): Promise<void> {
    this.blobs.set(blobKey(blob.accountId, blob.entityType, blob.entityId), blob);
  }

  async insertConflictShadow(input: {
    accountId: string;
    incoming: StoredBlob;
    winnerCommitSeq: bigint;
  }): Promise<void> {
    this.conflicts.push(input);
  }

  async allocCommitSeq(): Promise<bigint> {
    this.currentCommitSeq += 1n;
    return this.currentCommitSeq;
  }

  pullSince(sinceCommitSeq: bigint): PullRecord[] {
    return [...this.blobs.values()]
      .filter((blob) => blob.commitSeq > sinceCommitSeq)
      .sort((left, right) => Number(left.commitSeq - right.commitSeq))
      .map((blob) => ({
        entityType: blob.entityType,
        entityId: blob.entityId,
        revision: blob.revision.toString(),
        commitSeq: blob.commitSeq.toString(),
        blobHash: createHash('sha256').update(Uint8Array.from(blob.blob)).digest('hex'),
        keyId: blob.keyId,
        envelope: blob.blob,
      }));
  }

  onlyBlob(): StoredBlob {
    const blobs = [...this.blobs.values()];
    if (blobs.length !== 1) {
      throw new Error(`expected one blob, got ${blobs.length}`);
    }
    return blobs[0]!;
  }

  dumpBlobBytes(): string {
    return JSON.stringify([...this.blobs.values()].map((blob) => blob.blob));
  }
}

interface TodoTestDriver extends SqliteDriver {
  operations: Array<{ txId: number; sql: string }>;
}

function createTodoTestDriver(): TodoTestDriver {
  const todos = new Map<string, { json: string; updatedAtMs: number }>();
  const outbox = new Map<string, OutboxRow>();
  const operations: Array<{ txId: number; sql: string }> = [];
  let activeTxId = 0;
  let nextTxId = 0;
  let nextSequence = 0;

  const driver: TodoTestDriver = {
    operations,

    async execute(sql, params = []) {
      const normalized = normalizeSql(sql);
      operations.push({ txId: activeTxId, sql: normalized });

      if (
        normalized === normalizeSql(TODO_SYNC_SQL.createTodos) ||
        normalized === normalizeSql(TODO_SYNC_SQL.createOutbox)
      ) {
        return;
      }

      if (normalized === normalizeSql(TODO_SYNC_SQL.upsertTodo)) {
        const [id, json, updatedAtMs] = params;
        todos.set(asString(id), {
          json: asString(json),
          updatedAtMs: asNumber(updatedAtMs),
        });
        return;
      }

      if (normalized === normalizeSql(TODO_SYNC_SQL.insertOutbox)) {
        const [entityType, entityId, mutationId, plaintextJson, clientUpdatedAtMs] = params;
        const key = `${asString(entityType)}:${asString(entityId)}`;
        const current = outbox.get(key);
        outbox.set(key, {
          sequence: current?.sequence ?? ++nextSequence,
          entity_type: asString(entityType),
          entity_id: asString(entityId),
          mutation_id: asString(mutationId),
          plaintext_json: asString(plaintextJson),
          client_updated_at_ms: asNumber(clientUpdatedAtMs),
        });
        return;
      }

      if (normalized === normalizeSql(TODO_SYNC_SQL.deleteOutbox)) {
        const [mutationId] = params;
        for (const [key, row] of outbox) {
          if (row.mutation_id === mutationId) {
            outbox.delete(key);
          }
        }
        return;
      }

      throw new Error(`unsupported execute SQL: ${normalized}`);
    },

    async query<T extends Record<string, unknown>>(sql: string, params: SqlParams = []) {
      const normalized = normalizeSql(sql);
      operations.push({ txId: activeTxId, sql: normalized });

      if (normalized === normalizeSql(TODO_SYNC_SQL.selectTodo)) {
        const [id] = params;
        const row = todos.get(asString(id));
        return (row ? [{ json: row.json }] : []) as unknown as T[];
      }

      if (normalized === normalizeSql(TODO_SYNC_SQL.selectAllTodos)) {
        return [...todos.entries()]
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([, row]) => ({ json: row.json })) as unknown as T[];
      }

      if (normalized === normalizeSql(TODO_SYNC_SQL.selectOutbox)) {
        return [...outbox.values()].sort((left, right) => left.sequence - right.sequence) as T[];
      }

      throw new Error(`unsupported query SQL: ${normalized}`);
    },

    async transaction<T>(fn: (tx: SqliteDriver) => Promise<T>): Promise<T> {
      const previousTxId = activeTxId;
      activeTxId = ++nextTxId;
      try {
        return await fn(driver);
      } finally {
        activeTxId = previousTxId;
      }
    },
  };

  return driver;
}

function createEntityStateStore(): EntityStateStore & {
  maxSeenRevision(entity: { entityType: string; entityId: string }): Promise<bigint>;
} {
  const states = new Map<string, EntityState>();
  return {
    async maxSeenRevision(entity) {
      return states.get(`${entity.entityType}:${entity.entityId}`)?.maxSeenRevision ?? 0n;
    },
    async get(entity) {
      return states.get(`${entity.entityType}:${entity.entityId}`);
    },
    async put(state) {
      states.set(`${state.entityType}:${state.entityId}`, state);
    },
  };
}

function encryptTodo(
  plaintextJson: string,
  key: Buffer,
  encryptionDeviceId: bigint,
  counter: number,
): Uint8Array {
  const nonce = createHash('sha256')
    .update(`${encryptionDeviceId}:${counter}`)
    .digest()
    .subarray(0, 12);
  const cipher = createCipheriv('aes-256-gcm', key, nonce);
  const ciphertext = Buffer.concat([cipher.update(plaintextJson, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Uint8Array.from([
    1,
    1,
    ...u32Le(1),
    ...u64Le(encryptionDeviceId),
    ...u32Le(counter),
    ...nonce,
    ...tag,
    ...ciphertext,
  ]);
}

function decryptTodo(envelope: readonly number[], key: Buffer): TodoRecord {
  const bytes = Buffer.from(envelope);
  const nonce = bytes.subarray(18, 30);
  const tag = bytes.subarray(30, 46);
  const ciphertext = bytes.subarray(46);
  const decipher = createDecipheriv('aes-256-gcm', key, nonce);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  return JSON.parse(plaintext) as TodoRecord;
}

function todo(id: string, title: string, updatedAtMs: number): TodoRecord {
  return { id, title, completed: false, updatedAtMs };
}

function blobKey(accountId: string, entityType: string, entityId: string): string {
  return `${accountId}:${entityType}:${entityId}`;
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

function asNumber(value: SqlValue | undefined): number {
  if (typeof value !== 'number') {
    throw new Error('expected number SQL param');
  }
  return value;
}

function u32Le(value: number): number[] {
  return [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff];
}

function u64Le(value: bigint): number[] {
  const bytes: number[] = [];
  let remaining = value;
  for (let index = 0; index < 8; index += 1) {
    bytes.push(Number(remaining & 0xffn));
    remaining >>= 8n;
  }
  return bytes;
}

interface OutboxRow extends Record<string, unknown> {
  sequence: number;
  entity_type: string;
  entity_id: string;
  mutation_id: string;
  plaintext_json: string;
  client_updated_at_ms: number;
}
