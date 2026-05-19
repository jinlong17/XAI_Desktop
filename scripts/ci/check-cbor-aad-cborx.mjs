import { readFileSync } from 'node:fs';
import { Encoder } from 'cbor-x';

const fixturePath = 'apps/desktop/src-tauri/tests/fixtures/cbor_aad_vectors.json';
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));
const expected = new Map(fixture.vectors.map((vector) => [vector.name, vector.expected_cbor_hex]));
const encoder = new Encoder({ mapsAsObjects: false, useRecords: false });

const vectors = new Map([
  [
    'blob_aad_v1',
    new Map([
      [1, 1],
      [2, bytes('000102030405060708090a0b0c0d0e0f')],
      [3, 'todos'],
      [4, 'todo-1'],
      [5, 7],
      [6, 1],
      [7, 0],
      [8, 1],
      [9, 100042],
    ]),
  ],
  [
    'wrap_aad_v2',
    new Map([
      [1, 2],
      [2, bytes('101112131415161718191a1b1c1d1e1f')],
      [3, bytes('202122232425262728292a2b2c2d2e2f')],
      [4, 3],
      [5, bytes('303132333435363738393a3b3c3d3e3f')],
    ]),
  ],
  [
    'recovery_message_v1',
    new Map([
      [1, 1],
      [2, bytes('404142434445464748494a4b4c4d4e4f')],
      [3, bytes('000102030405060708090a0b0c0d0e0f')],
      [4, bytes('808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9f')],
      [5, 1000],
    ]),
  ],
]);

for (const [name, value] of vectors) {
  const encoded = Buffer.from(encoder.encode(value)).toString('hex');
  const fixtureHex = expected.get(name);
  if (encoded !== fixtureHex) {
    throw new Error(`${name}: cbor-x produced ${encoded}, expected ${fixtureHex}`);
  }
}

function bytes(hex) {
  return Buffer.from(hex, 'hex');
}
