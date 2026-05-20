import { createCipheriv, createDecipheriv, createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import {
  SyncRevisionRollbackError,
  applyServerRecords,
  type EntityState,
  type EntityStateStore,
  type PullRecord,
} from '../../src';

describe('protocol integrity integration checks', () => {
  it('rejects blob swap by binding decrypt AAD to entity position', () => {
    const key = createHash('sha256').update('aad-binding-key').digest();
    const blobA = encryptWithAad('todo-a plaintext', key, blobAad('todo-a', 1));

    expect(decryptWithAad(blobA, key, blobAad('todo-a', 1))).toBe('todo-a plaintext');
    expect(() => decryptWithAad(blobA, key, blobAad('todo-b', 1))).toThrow();
  });

  it('rejects old revision rollback with E3015', async () => {
    const states = createEntityStates([
      {
        entityType: 'todos',
        entityId: 'todo-1',
        maxSeenRevision: 2n,
        lastBlobHash: 'hash-new',
        lastCommitSeq: 5n,
        lastKeyId: 1,
      },
    ]);

    await expect(
      applyServerRecords(
        {
          entityStates: states,
          applier: {
            async apply() {
              throw new Error('rollback record must not be applied');
            },
          },
        },
        {
          currentAccountCommitSeq: '5',
          lastSeenAccountCommitSeq: '5',
          records: [
            {
              entityType: 'todos',
              entityId: 'todo-1',
              revision: '1',
              commitSeq: '4',
              blobHash: 'hash-old',
              keyId: 1,
              envelope: [1],
            },
          ],
        },
      ),
    ).rejects.toMatchObject({ code: 'E3015' });
  });
});

function encryptWithAad(plaintext: string, key: Buffer, aad: Buffer): Buffer {
  const nonce = Buffer.alloc(12, 7);
  const cipher = createCipheriv('aes-256-gcm', key, nonce);
  cipher.setAAD(aad);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return Buffer.concat([nonce, cipher.getAuthTag(), ciphertext]);
}

function decryptWithAad(blob: Buffer, key: Buffer, aad: Buffer): string {
  const nonce = blob.subarray(0, 12);
  const tag = blob.subarray(12, 28);
  const ciphertext = blob.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', key, nonce);
  decipher.setAAD(aad);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

function blobAad(entityId: string, revision: number): Buffer {
  return Buffer.from(`account-1:todos:${entityId}:${revision}:key-1`, 'utf8');
}

function createEntityStates(initial: readonly EntityState[]): EntityStateStore {
  const states = new Map<string, EntityState>();
  for (const state of initial) {
    states.set(`${state.entityType}:${state.entityId}`, state);
  }
  return {
    async get(entity) {
      return states.get(`${entity.entityType}:${entity.entityId}`);
    },
    async put(state) {
      states.set(`${state.entityType}:${state.entityId}`, state);
    },
  };
}
