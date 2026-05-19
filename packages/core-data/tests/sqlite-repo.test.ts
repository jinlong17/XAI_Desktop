import { describe, expect, it, vi } from 'vitest';

import { createInMemorySqliteDriver } from '@repo/core-data/testing';

import { migrateLocalStorageToRepo } from '../src/local-storage';
import { createSqliteRepo } from '../src/sqlite';
import type { RepoRecord } from '../src/types';

interface TodoRecord extends RepoRecord {
  title: string;
  done: boolean;
}

function createStorage(initial: Record<string, string>) {
  const values = new Map(Object.entries(initial));
  return {
    get length() {
      return values.size;
    },
    key(index: number): string | null {
      return [...values.keys()][index] ?? null;
    },
    getItem(key: string): string | null {
      return values.get(key) ?? null;
    },
    removeItem(key: string): void {
      values.delete(key);
    },
  };
}

describe('createSqliteRepo', () => {
  it('performs CRUD through the SQLite driver boundary', async () => {
    const driver = createInMemorySqliteDriver();
    const repo = createSqliteRepo<TodoRecord>(driver, { namespace: 'todos' });

    await repo.put({ id: 'todo-2', title: 'second', done: false });
    await repo.put({ id: 'todo-1', title: 'first', done: true });

    await expect(repo.get('todo-1')).resolves.toEqual({
      id: 'todo-1',
      title: 'first',
      done: true,
    });
    await expect(repo.list()).resolves.toEqual([
      { id: 'todo-1', title: 'first', done: true },
      { id: 'todo-2', title: 'second', done: false },
    ]);

    await repo.delete('todo-1');
    await expect(repo.get('todo-1')).resolves.toBeUndefined();
  });

  it('runs mutation hooks inside put and delete transactions', async () => {
    const driver = createInMemorySqliteDriver();
    const onMutation = vi.fn(async () => undefined);
    const repo = createSqliteRepo<TodoRecord>(driver, {
      namespace: 'todos',
      onMutation,
    });

    await repo.put({ id: 'todo-1', title: 'first', done: false });
    await repo.delete('todo-1');

    expect(onMutation).toHaveBeenNthCalledWith(
      1,
      {
        kind: 'put',
        namespace: 'todos',
        id: 'todo-1',
        record: { id: 'todo-1', title: 'first', done: false },
      },
      driver,
    );
    expect(onMutation).toHaveBeenNthCalledWith(
      2,
      {
        kind: 'delete',
        namespace: 'todos',
        id: 'todo-1',
      },
      driver,
    );
  });
});

describe('migrateLocalStorageToRepo', () => {
  it('is idempotent when rerun against the same legacy keys', async () => {
    const driver = createInMemorySqliteDriver();
    const repo = createSqliteRepo<TodoRecord>(driver, { namespace: 'todos' });
    const storage = createStorage({
      'todo:1': JSON.stringify({ id: 'todo-1', title: 'first', done: false }),
      'todo:2': JSON.stringify({ id: 'todo-2', title: 'second', done: true }),
      'other:1': JSON.stringify({ id: 'other-1', title: 'ignored', done: false }),
    });

    await expect(
      migrateLocalStorageToRepo({ storage, keyPrefix: 'todo:', repo }),
    ).resolves.toEqual({ migrated: 2, skipped: 0, removed: 0 });
    await expect(
      migrateLocalStorageToRepo({ storage, keyPrefix: 'todo:', repo }),
    ).resolves.toEqual({ migrated: 2, skipped: 0, removed: 0 });
    await expect(repo.list()).resolves.toEqual([
      { id: 'todo-1', title: 'first', done: false },
      { id: 'todo-2', title: 'second', done: true },
    ]);
  });

  it('can remove migrated legacy keys after a successful put', async () => {
    const driver = createInMemorySqliteDriver();
    const repo = createSqliteRepo<TodoRecord>(driver, { namespace: 'todos' });
    const storage = createStorage({
      'todo:1': JSON.stringify({ id: 'todo-1', title: 'first', done: false }),
    });

    await expect(
      migrateLocalStorageToRepo({
        storage,
        keyPrefix: 'todo:',
        repo,
        removeAfterMigrate: true,
      }),
    ).resolves.toEqual({ migrated: 1, skipped: 0, removed: 1 });
    expect(storage.length).toBe(0);
    await expect(repo.get('todo-1')).resolves.toEqual({
      id: 'todo-1',
      title: 'first',
      done: false,
    });
  });
});
