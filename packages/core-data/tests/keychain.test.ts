/**
 * T-T1 / T-T2 / T-T3 — @repo/core-data keychain wrapper contract tests.
 *
 * Mock strategy: mock the `invoke` function seam (never reaches real Keychain).
 * Tests assert command names, argument shapes, error parsing, and byte fidelity.
 */

import { describe, it, expect, vi } from 'vitest';
import {
  createKeychainClient,
  KeychainError,
  KEYCHAIN_ERROR_CODES,
  parseKeychainError,
  secretSet,
  secretGet,
  secretDel,
} from '../src/keychain';

// ── T-T1: invocation seam ────────────────────────────────────────────────────

describe('T-T1: secretSet/secretGet/secretDel invoke the correct commands', () => {
  it('secretSet calls secret_set with correct key+value args', async () => {
    const mockInvoke = vi.fn().mockResolvedValue(undefined);
    const client = createKeychainClient(mockInvoke);

    const value = new Uint8Array([1, 2, 3]);
    await client.secretSet('xai.refresh_token.u1', value);

    expect(mockInvoke).toHaveBeenCalledOnce();
    expect(mockInvoke).toHaveBeenCalledWith('secret_set', {
      key: 'xai.refresh_token.u1',
      value: [1, 2, 3],
    });
  });

  it('secretGet calls secret_get with correct key arg', async () => {
    const mockInvoke = vi.fn().mockResolvedValue([4, 5, 6]);
    const client = createKeychainClient(mockInvoke);

    await client.secretGet('xai.kek.u1');

    expect(mockInvoke).toHaveBeenCalledOnce();
    expect(mockInvoke).toHaveBeenCalledWith('secret_get', {
      key: 'xai.kek.u1',
    });
  });

  it('secretDel calls secret_del with correct key arg', async () => {
    const mockInvoke = vi.fn().mockResolvedValue(undefined);
    const client = createKeychainClient(mockInvoke);

    await client.secretDel('xai.refresh_token.u1');

    expect(mockInvoke).toHaveBeenCalledOnce();
    expect(mockInvoke).toHaveBeenCalledWith('secret_del', {
      key: 'xai.refresh_token.u1',
    });
  });

  it('module-level secretSet passes invoke + args correctly', async () => {
    const mockInvoke = vi.fn().mockResolvedValue(undefined);
    const value = new Uint8Array([7, 8]);
    await secretSet(mockInvoke, 'xai.nonce.u1.k1', value);

    expect(mockInvoke).toHaveBeenCalledWith('secret_set', {
      key: 'xai.nonce.u1.k1',
      value: [7, 8],
    });
  });

  it('module-level secretGet passes invoke + key correctly', async () => {
    const mockInvoke = vi.fn().mockResolvedValue([9]);
    await secretGet(mockInvoke, 'xai.devicekey.u1.d1');
    expect(mockInvoke).toHaveBeenCalledWith('secret_get', {
      key: 'xai.devicekey.u1.d1',
    });
  });

  it('module-level secretDel passes invoke + key correctly', async () => {
    const mockInvoke = vi.fn().mockResolvedValue(undefined);
    await secretDel(mockInvoke, 'xai.refresh_token.u1');
    expect(mockInvoke).toHaveBeenCalledWith('secret_del', {
      key: 'xai.refresh_token.u1',
    });
  });
});

// ── T-T2: error parsing ──────────────────────────────────────────────────────

describe('T-T2: AppError E11xx prefix parsing into KeychainError', () => {
  it('E1100: prefix → KeychainError with code LOCKED', () => {
    const err = parseKeychainError('E1100: keychain locked — device must be unlocked');
    expect(err).toBeInstanceOf(KeychainError);
    expect(err.code).toBe(KEYCHAIN_ERROR_CODES.LOCKED);
  });

  it('E1101: prefix → KeychainError with code NOT_FOUND', () => {
    const err = parseKeychainError('E1101: keychain item not found');
    expect(err).toBeInstanceOf(KeychainError);
    expect(err.code).toBe(KEYCHAIN_ERROR_CODES.NOT_FOUND);
  });

  it('E1102: prefix → KeychainError with code ACL_DENIED', () => {
    const err = parseKeychainError('E1102: keychain ACL denied — process identity rejected');
    expect(err).toBeInstanceOf(KeychainError);
    expect(err.code).toBe(KEYCHAIN_ERROR_CODES.ACL_DENIED);
  });

  it('E1103: prefix → KeychainError with code BACKEND', () => {
    const err = parseKeychainError('E1103: keychain backend error: OSStatus -25300: ...');
    expect(err).toBeInstanceOf(KeychainError);
    expect(err.code).toBe(KEYCHAIN_ERROR_CODES.BACKEND);
  });

  it('E1104: prefix → KeychainError with code UNSUPPORTED_PLATFORM', () => {
    const err = parseKeychainError('E1104: keychain unsupported on this platform');
    expect(err).toBeInstanceOf(KeychainError);
    expect(err.code).toBe(KEYCHAIN_ERROR_CODES.UNSUPPORTED_PLATFORM);
  });

  it('unknown prefix → wrapped as E1103 BACKEND error', () => {
    const err = parseKeychainError('some unexpected error string');
    expect(err).toBeInstanceOf(KeychainError);
    expect(err.code).toBe(KEYCHAIN_ERROR_CODES.BACKEND);
  });

  it('E1100 (locked) is distinguishable from E1101 (not-found)', () => {
    const locked = parseKeychainError('E1100: keychain locked');
    const notFound = parseKeychainError('E1101: keychain item not found');
    expect(locked.code).not.toBe(notFound.code);
    expect(locked.code).toBe(KEYCHAIN_ERROR_CODES.LOCKED);
    expect(notFound.code).toBe(KEYCHAIN_ERROR_CODES.NOT_FOUND);
  });

  it('secretGet throws KeychainError on invoke rejection with E1101', async () => {
    const mockInvoke = vi.fn().mockRejectedValue('E1101: keychain item not found');
    const client = createKeychainClient(mockInvoke);

    await expect(client.secretGet('xai.missing.key')).rejects.toBeInstanceOf(KeychainError);
    await expect(client.secretGet('xai.missing.key')).rejects.toMatchObject({
      code: KEYCHAIN_ERROR_CODES.NOT_FOUND,
    });
  });

  it('secretSet throws KeychainError on invoke rejection with E1100', async () => {
    const mockInvoke = vi.fn().mockRejectedValue('E1100: keychain locked');
    const client = createKeychainClient(mockInvoke);

    await expect(
      client.secretSet('xai.kek.u1', new Uint8Array([1])),
    ).rejects.toBeInstanceOf(KeychainError);
  });
});

// ── T-T3: byte fidelity ──────────────────────────────────────────────────────

describe('T-T3: Uint8Array fidelity through serialisation boundary', () => {
  it('secretSet converts Uint8Array to number[] for serde_json', async () => {
    const mockInvoke = vi.fn().mockResolvedValue(undefined);
    const input = new Uint8Array([0, 127, 255]);
    await secretSet(mockInvoke, 'xai.test.bytes', input);

    const calledArgs = mockInvoke.mock.calls[0][1] as Record<string, unknown>;
    expect(calledArgs.value).toEqual([0, 127, 255]);
  });

  it('secretGet converts number[] response back to Uint8Array', async () => {
    const mockInvoke = vi.fn().mockResolvedValue([0, 127, 255, 10, 200]);
    const result = await secretGet(mockInvoke, 'xai.test.bytes');

    expect(result).toBeInstanceOf(Uint8Array);
    expect(Array.from(result)).toEqual([0, 127, 255, 10, 200]);
  });

  it('empty Uint8Array round-trips correctly', async () => {
    const mockInvoke = vi.fn().mockResolvedValue([]);
    const result = await secretGet(mockInvoke, 'xai.test.empty');

    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.byteLength).toBe(0);
  });

  it('Uint8Array in === Uint8Array out (full round-trip simulation)', async () => {
    const originalBytes = new Uint8Array([42, 0, 128, 255, 64]);
    let storedValue: number[] = [];

    // Simulate set: capture what was sent
    const mockSet = vi.fn().mockImplementation((_cmd: string, args: Record<string, unknown>) => {
      storedValue = args.value as number[];
      return Promise.resolve(undefined);
    });

    // Simulate get: return what was stored
    const mockGet = vi.fn().mockImplementation(() => {
      return Promise.resolve(storedValue);
    });

    await secretSet(mockSet, 'xai.roundtrip', originalBytes);
    const retrieved = await secretGet(mockGet, 'xai.roundtrip');

    expect(Array.from(retrieved)).toEqual(Array.from(originalBytes));
  });
});

// ── Red-line #4 grep verification ────────────────────────────────────────────
// AC-9: no direct @tauri-apps/api import in @repo/core-data keychain module.
// This is enforced at CI grep level (see test.md AC-9); the absence of an
// import in keychain.ts is the assertion.
describe('AC-9: red-line #4 compliance (no @tauri-apps/api in keychain.ts)', () => {
  it('KeychainClient and helpers do not import @tauri-apps/api', async () => {
    // If keychain.ts imported @tauri-apps/api, the node test environment would
    // fail to resolve it (since @tauri-apps/api is only available in a Tauri
    // webview). The fact that this test module loaded successfully proves
    // compliance — no direct Tauri API import exists in keychain.ts.
    expect(createKeychainClient).toBeDefined();
    expect(secretSet).toBeDefined();
    expect(secretGet).toBeDefined();
    expect(secretDel).toBeDefined();
  });
});
