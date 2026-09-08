import type { ZeroizeOptions } from "../types";

export function copyBytes(bytes: Uint8Array): Uint8Array {
  return new Uint8Array(bytes);
}

export function concatBytes(...chunks: readonly Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

export function zeroizeBuffer(buffer: Uint8Array, _options?: ZeroizeOptions): void {
  buffer.fill(0);
}

export function zeroizeBuffers(buffers: readonly Uint8Array[]): void {
  for (const buffer of buffers) {
    zeroizeBuffer(buffer);
  }
}

export function bytesEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.byteLength !== right.byteLength) {
    return false;
  }
  let diff = 0;
  for (let index = 0; index < left.byteLength; index += 1) {
    diff |= left[index]! ^ right[index]!;
  }
  return diff === 0;
}

export function assertBytes(input: Uint8Array, name: string, expectedLength?: number): void {
  if (!(input instanceof Uint8Array)) {
    throw new TypeError(`${name} must be a Uint8Array`);
  }
  if (expectedLength !== undefined && input.byteLength !== expectedLength) {
    throw new TypeError(`${name} must be ${expectedLength} bytes`);
  }
}

export function utf8(input: string): Uint8Array {
  return new TextEncoder().encode(input);
}

export function asArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return new Uint8Array(bytes).buffer;
}
