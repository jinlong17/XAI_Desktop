import { describe, expect, it } from 'vitest';

import {
  buildProtocolAad,
  deserializeDeterministicCbor,
  serializeDeterministicCbor,
  toHex,
  verifyProtocolAad,
  type CborValue,
} from '../src';

describe('deterministic CBOR protocol integrity', () => {
  it('emits a stable canonical vector independent of object key order', () => {
    const left = serializeDeterministicCbor({ b: 2, a: 1, nested: { z: 'last', c: true } });
    const right = serializeDeterministicCbor({ nested: { c: true, z: 'last' }, a: 1, b: 2 });

    expect(toHex(left)).toBe('a3616101616202666e6573746564a26163f5617a646c617374');
    expect(left).toEqual(right);
  });

  it('round-trips supported payload shapes', () => {
    const corpus: CborValue[] = [
      null,
      true,
      false,
      0,
      23,
      24,
      65536,
      'sync',
      new Uint8Array([1, 2, 3]),
      ['a', 1, null],
      { entity: 'todo', revision: 7, flags: [true, false] },
    ];

    for (const value of corpus) {
      expect(deserializeDeterministicCbor(serializeDeterministicCbor(value))).toEqual(value);
    }
  });

  it('binds AAD to account, entity, revision, key and nonce coordinates', () => {
    const input = {
      accountId: 'acct-1',
      entityType: 'todos',
      entityId: 'todo-1',
      revision: 9n,
      keyId: 2,
      encryptionDeviceId: 1001n,
      counter: 44n,
    };
    const aad = buildProtocolAad(input);

    expect(verifyProtocolAad(input, aad)).toBe(true);
    expect(verifyProtocolAad({ ...input, revision: 8n }, aad)).toBe(false);
  });
});
