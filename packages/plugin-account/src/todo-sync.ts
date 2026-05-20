import type { SqliteDriver } from '@repo/core-data';
import type { OutboxEntry, QueueMutationInput, SyncEntityRef } from './sync-engine';

export interface TodoRecord {
  id: string;
  title: string;
  completed: boolean;
  updatedAtMs: number;
}

export interface TodoMutationOptions {
  mutationId: string;
  clientUpdatedAtMs?: number;
}

export interface TodoOutboxEntry extends OutboxEntry {
  sequence: number;
}

export interface TodoSyncStoreOptions {
  nowMs?: () => number;
}

export interface TodoSyncStore {
  init(): Promise<void>;
  putTodo(todo: TodoRecord, options: TodoMutationOptions): Promise<void>;
  applyRemoteTodo(todo: TodoRecord): Promise<void>;
  getTodo(id: string): Promise<TodoRecord | undefined>;
  listTodos(): Promise<TodoRecord[]>;
  listOutbox(): Promise<TodoOutboxEntry[]>;
  removeOutbox(mutationIds: readonly string[]): Promise<void>;
}

const TODOS_ENTITY_TYPE = 'todos';

const CREATE_TODOS_SQL = `
CREATE TABLE IF NOT EXISTS account_todos (
  id TEXT PRIMARY KEY,
  json TEXT NOT NULL,
  updated_at_ms INTEGER NOT NULL
)`;

const CREATE_OUTBOX_SQL = `
CREATE TABLE IF NOT EXISTS sync_outbox (
  sequence INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  mutation_id TEXT NOT NULL UNIQUE,
  plaintext_json TEXT NOT NULL,
  client_updated_at_ms INTEGER NOT NULL,
  UNIQUE(entity_type, entity_id)
)`;

const UPSERT_TODO_SQL = `
INSERT INTO account_todos (id, json, updated_at_ms)
VALUES (?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
  json = excluded.json,
  updated_at_ms = excluded.updated_at_ms`;

const INSERT_OUTBOX_SQL = `
INSERT INTO sync_outbox (
  entity_type,
  entity_id,
  mutation_id,
  plaintext_json,
  client_updated_at_ms
)
VALUES (?, ?, ?, ?, ?)
ON CONFLICT(entity_type, entity_id) DO UPDATE SET
  mutation_id = excluded.mutation_id,
  plaintext_json = excluded.plaintext_json,
  client_updated_at_ms = excluded.client_updated_at_ms`;

const SELECT_TODO_SQL = `
SELECT json FROM account_todos
WHERE id = ?`;

const SELECT_ALL_TODOS_SQL = `
SELECT json FROM account_todos
ORDER BY id ASC`;

const SELECT_OUTBOX_SQL = `
SELECT sequence, entity_type, entity_id, mutation_id, plaintext_json, client_updated_at_ms
FROM sync_outbox
ORDER BY sequence ASC`;

const DELETE_OUTBOX_SQL = `
DELETE FROM sync_outbox
WHERE mutation_id = ?`;

export function createTodoSyncStore(
  driver: SqliteDriver,
  options: TodoSyncStoreOptions = {},
): TodoSyncStore {
  const nowMs = options.nowMs ?? Date.now;

  async function init(): Promise<void> {
    await driver.execute(CREATE_TODOS_SQL);
    await driver.execute(CREATE_OUTBOX_SQL);
  }

  async function writeTodo(tx: SqliteDriver, todo: TodoRecord): Promise<void> {
    await tx.execute(UPSERT_TODO_SQL, [todo.id, JSON.stringify(todo), todo.updatedAtMs]);
  }

  return {
    init,

    async putTodo(todo, mutationOptions): Promise<void> {
      await init();
      await driver.transaction(async (tx) => {
        await writeTodo(tx, todo);
        await tx.execute(INSERT_OUTBOX_SQL, [
          TODOS_ENTITY_TYPE,
          todo.id,
          mutationOptions.mutationId,
          JSON.stringify(todo),
          mutationOptions.clientUpdatedAtMs ?? nowMs(),
        ]);
      });
    },

    async applyRemoteTodo(todo): Promise<void> {
      await init();
      await driver.transaction((tx) => writeTodo(tx, todo));
    },

    async getTodo(id): Promise<TodoRecord | undefined> {
      await init();
      const rows = await driver.query<{ json: string }>(SELECT_TODO_SQL, [id]);
      return rows[0] ? parseTodo(rows[0].json) : undefined;
    },

    async listTodos(): Promise<TodoRecord[]> {
      await init();
      const rows = await driver.query<{ json: string }>(SELECT_ALL_TODOS_SQL);
      return rows.map((row) => parseTodo(row.json));
    },

    async listOutbox(): Promise<TodoOutboxEntry[]> {
      await init();
      const rows = await driver.query<OutboxRow>(SELECT_OUTBOX_SQL);
      return rows.map((row) => ({
        sequence: row.sequence,
        entityType: row.entity_type,
        entityId: row.entity_id,
        mutationId: row.mutation_id,
        plaintext: new TextEncoder().encode(row.plaintext_json),
        clientUpdatedAtMs: row.client_updated_at_ms,
      }));
    },

    async removeOutbox(mutationIds): Promise<void> {
      await init();
      await driver.transaction(async (tx) => {
        for (const mutationId of mutationIds) {
          await tx.execute(DELETE_OUTBOX_SQL, [mutationId]);
        }
      });
    },
  };
}

export function todoQueueMutation(todo: TodoRecord, mutationId: string): QueueMutationInput {
  return {
    entityType: TODOS_ENTITY_TYPE,
    entityId: todo.id,
    plaintext: new TextEncoder().encode(JSON.stringify(todo)),
    mutationId,
    clientUpdatedAtMs: todo.updatedAtMs,
  };
}

export function isTodoEntity(entity: SyncEntityRef): boolean {
  return entity.entityType === TODOS_ENTITY_TYPE;
}

function parseTodo(json: string): TodoRecord {
  const value = JSON.parse(json) as Partial<TodoRecord>;
  if (
    typeof value.id !== 'string' ||
    typeof value.title !== 'string' ||
    typeof value.completed !== 'boolean' ||
    typeof value.updatedAtMs !== 'number'
  ) {
    throw new Error('E3005: invalid todo record JSON');
  }
  return value as TodoRecord;
}

interface OutboxRow extends Record<string, unknown> {
  sequence: number;
  entity_type: string;
  entity_id: string;
  mutation_id: string;
  plaintext_json: string;
  client_updated_at_ms: number;
}

export const TODO_SYNC_SQL = {
  createTodos: CREATE_TODOS_SQL,
  createOutbox: CREATE_OUTBOX_SQL,
  upsertTodo: UPSERT_TODO_SQL,
  insertOutbox: INSERT_OUTBOX_SQL,
  selectTodo: SELECT_TODO_SQL,
  selectAllTodos: SELECT_ALL_TODOS_SQL,
  selectOutbox: SELECT_OUTBOX_SQL,
  deleteOutbox: DELETE_OUTBOX_SQL,
} as const;
