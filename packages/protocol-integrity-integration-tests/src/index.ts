export type CborValue =
  | null
  | boolean
  | number
  | string
  | Uint8Array
  | readonly CborValue[]
  | { readonly [key: string]: CborValue };

export interface ProtocolAadInput {
  accountId: string;
  entityType: string;
  entityId: string;
  revision: bigint | number;
  keyId: number;
  encryptionDeviceId: bigint | number;
  counter: bigint | number;
}

export function serializeDeterministicCbor(value: CborValue): Uint8Array {
  const out: number[] = [];
  writeCbor(value, out);
  return new Uint8Array(out);
}

export function deserializeDeterministicCbor(bytes: Uint8Array): CborValue {
  const decoder = new CborDecoder(bytes);
  const value = decoder.read();
  decoder.assertDone();
  return value;
}

export function buildProtocolAad(input: ProtocolAadInput): Uint8Array {
  return serializeDeterministicCbor({
    v: 1,
    account_id: input.accountId,
    entity_type: input.entityType,
    entity_id: input.entityId,
    revision: Number(input.revision),
    key_id: input.keyId,
    encryption_device_id: Number(input.encryptionDeviceId),
    counter: Number(input.counter),
  });
}

export function verifyProtocolAad(expected: ProtocolAadInput, actual: Uint8Array): boolean {
  return bytesEqual(buildProtocolAad(expected), actual);
}

export function toHex(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function writeCbor(value: CborValue, out: number[]): void {
  if (value === null) {
    out.push(0xf6);
    return;
  }
  if (typeof value === 'boolean') {
    out.push(value ? 0xf5 : 0xf4);
    return;
  }
  if (typeof value === 'number') {
    assertSafeUint(value);
    writeUint(0, value, out);
    return;
  }
  if (typeof value === 'string') {
    const bytes = new TextEncoder().encode(value);
    writeUint(3, bytes.length, out);
    out.push(...bytes);
    return;
  }
  if (value instanceof Uint8Array) {
    writeUint(2, value.length, out);
    out.push(...value);
    return;
  }
  if (Array.isArray(value)) {
    writeUint(4, value.length, out);
    for (const item of value) {
      writeCbor(item, out);
    }
    return;
  }

  const entries = Object.entries(value).sort(([left], [right]) =>
    left < right ? -1 : left > right ? 1 : 0,
  );
  writeUint(5, entries.length, out);
  for (const [key, item] of entries) {
    writeCbor(key, out);
    writeCbor(item, out);
  }
}

function writeUint(majorType: number, value: number, out: number[]): void {
  assertSafeUint(value);
  const prefix = majorType << 5;
  if (value < 24) {
    out.push(prefix | value);
    return;
  }
  if (value <= 0xff) {
    out.push(prefix | 24, value);
    return;
  }
  if (value <= 0xffff) {
    out.push(prefix | 25, value >> 8, value & 0xff);
    return;
  }
  if (value <= 0xffffffff) {
    out.push(prefix | 26, (value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff);
    return;
  }
  out.push(prefix | 27);
  let next = BigInt(value);
  const bytes = new Array<number>(8);
  for (let index = 7; index >= 0; index -= 1) {
    bytes[index] = Number(next & 0xffn);
    next >>= 8n;
  }
  out.push(...bytes);
}

function assertSafeUint(value: number): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error('E3005: deterministic CBOR only supports non-negative safe integers');
  }
}

function bytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) {
    return false;
  }
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left[index]! ^ right[index]!;
  }
  return diff === 0;
}

class CborDecoder {
  private offset = 0;

  constructor(private readonly bytes: Uint8Array) {}

  read(): CborValue {
    const initial = this.take();
    const major = initial >> 5;
    const addl = initial & 0x1f;
    const value = this.readUint(addl);

    if (major === 0) {
      return value;
    }
    if (major === 2) {
      return this.takeBytes(value);
    }
    if (major === 3) {
      return new TextDecoder().decode(this.takeBytes(value));
    }
    if (major === 4) {
      return Array.from({ length: value }, () => this.read());
    }
    if (major === 5) {
      const out: Record<string, CborValue> = {};
      for (let index = 0; index < value; index += 1) {
        const key = this.read();
        if (typeof key !== 'string') {
          throw new Error('E3005: CBOR object keys must decode as strings');
        }
        out[key] = this.read();
      }
      return out;
    }
    if (major === 7 && addl === 20) {
      return false;
    }
    if (major === 7 && addl === 21) {
      return true;
    }
    if (major === 7 && addl === 22) {
      return null;
    }
    throw new Error(`E3005: unsupported CBOR major type ${major}`);
  }

  assertDone(): void {
    if (this.offset !== this.bytes.length) {
      throw new Error('E3005: trailing CBOR bytes');
    }
  }

  private readUint(addl: number): number {
    if (addl < 24) {
      return addl;
    }
    if (addl === 24) {
      return this.take();
    }
    if (addl === 25) {
      return (this.take() << 8) | this.take();
    }
    if (addl === 26) {
      return ((this.take() * 0x1000000) + (this.take() << 16) + (this.take() << 8) + this.take());
    }
    if (addl === 27) {
      let value = 0n;
      for (let index = 0; index < 8; index += 1) {
        value = (value << 8n) | BigInt(this.take());
      }
      if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw new Error('E3005: decoded CBOR integer exceeds JS safe integer');
      }
      return Number(value);
    }
    throw new Error(`E3005: unsupported CBOR additional info ${addl}`);
  }

  private take(): number {
    const byte = this.bytes[this.offset];
    if (byte === undefined) {
      throw new Error('E3005: truncated CBOR');
    }
    this.offset += 1;
    return byte;
  }

  private takeBytes(length: number): Uint8Array {
    const end = this.offset + length;
    if (end > this.bytes.length) {
      throw new Error('E3005: truncated CBOR byte string');
    }
    const out = this.bytes.slice(this.offset, end);
    this.offset = end;
    return out;
  }
}
