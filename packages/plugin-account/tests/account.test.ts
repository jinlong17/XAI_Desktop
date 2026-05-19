import { describe, expect, it, vi } from 'vitest';

import {
  RefreshTokenManager,
  loginAccount,
  refreshTokenKey,
  shouldRefresh,
  signupAccount,
  type AccountAuthTransport,
  type AccountCryptoClient,
  type AccountDeps,
  type AuthResponse,
  type SignupRequest,
} from '../src/account';
import type { KeychainClient } from '@repo/core-data';
import type { KeyHandle } from '../src/types';

function keyHandle(value: number): KeyHandle {
  return value as KeyHandle;
}

function authResponse(overrides: Partial<AuthResponse> = {}): AuthResponse {
  return {
    accountId: 'acct_1',
    accessToken: 'access_1',
    refreshToken: 'refresh_1',
    expiresAtMs: 10_000,
    kekSalt: 'salt_1',
    ...overrides,
  };
}

function createKeychain(): KeychainClient & { writes: Map<string, Uint8Array> } {
  const writes = new Map<string, Uint8Array>();
  return {
    writes,
    async secretSet(key: string, value: Uint8Array): Promise<void> {
      writes.set(key, value);
    },
    async secretGet(key: string): Promise<Uint8Array> {
      const value = writes.get(key);
      if (!value) {
        throw new Error('E1101: keychain item not found');
      }
      return value;
    },
    async secretDel(key: string): Promise<void> {
      writes.delete(key);
    },
  };
}

function createCrypto(): AccountCryptoClient {
  return {
    async prepareSignup(input) {
      return {
        authPassword: `auth:${input.email}:${input.secretKey.length}`,
        kekSalt: 'salt_1',
        secretKeyCheck: `sk-check:${input.secretKey.length}`,
        dekCheck: 'dek-check-v1',
        keyId: 1,
        deviceId: 'dev_1',
        devicePub: new Uint8Array([1, 2, 3]),
        deviceDekWrap: new Uint8Array([4, 5, 6]),
        recoverySigningPub: new Uint8Array([7, 8, 9]),
        dekHandle: keyHandle(1),
        devicePrivHandle: keyHandle(2),
      };
    },
    async deriveLoginAuthPassword(input) {
      return {
        authPassword: `auth:${input.email}:${input.secretKey.length}`,
      };
    },
  };
}

describe('signupAccount', () => {
  it('sends derived checks and never sends raw master password or secret key', async () => {
    let request: SignupRequest | undefined;
    const auth: AccountAuthTransport = {
      signup: vi.fn(async (payload: SignupRequest) => {
        request = payload;
        return authResponse();
      }),
      login: vi.fn(),
      refresh: vi.fn(),
    };
    const keychain = createKeychain();
    const deps: AccountDeps = { auth, crypto: createCrypto(), keychain };

    const session = await signupAccount(deps, {
      email: 'user@example.com',
      masterPassword: 'correct horse battery staple',
      secretKey: 'sk_live_secret',
      displayName: 'User',
    });

    expect(session.accountId).toBe('acct_1');
    expect(request).toMatchObject({
      email: 'user@example.com',
      displayName: 'User',
      authPassword: 'auth:user@example.com:14',
      secretKeyCheck: 'sk-check:14',
      dekCheck: 'dek-check-v1',
      deviceId: 'dev_1',
      devicePub: [1, 2, 3],
      deviceDekWrap: [4, 5, 6],
      recoverySigningPub: [7, 8, 9],
    });
    expect(JSON.stringify(request)).not.toContain('correct horse battery staple');
    expect(JSON.stringify(request)).not.toContain('sk_live_secret');
    expect(new TextDecoder().decode(keychain.writes.get('xai.refresh_token.acct_1'))).toBe(
      'refresh_1',
    );
  });
});

describe('loginAccount', () => {
  it('fails wrong secret key at auth step and does not persist a refresh token', async () => {
    const auth: AccountAuthTransport = {
      signup: vi.fn(),
      login: vi.fn(async ({ authPassword }) => {
        if (authPassword !== 'auth:user@example.com:15') {
          throw new Error('E3005: invalid credentials');
        }
        return authResponse();
      }),
      refresh: vi.fn(),
    };
    const keychain = createKeychain();
    const deps: AccountDeps = { auth, crypto: createCrypto(), keychain };

    await expect(
      loginAccount(deps, {
        email: 'user@example.com',
        masterPassword: 'pw',
        secretKey: 'wrong_secret',
        kekSalt: 'salt_1',
      }),
    ).rejects.toThrow('E3005');

    expect(auth.login).toHaveBeenCalledOnce();
    expect(keychain.writes.size).toBe(0);
  });

  it('persists refresh token on successful login', async () => {
    const auth: AccountAuthTransport = {
      signup: vi.fn(),
      login: vi.fn(async () => authResponse({ refreshToken: 'refresh_login' })),
      refresh: vi.fn(),
    };
    const keychain = createKeychain();
    const deps: AccountDeps = { auth, crypto: createCrypto(), keychain };

    await loginAccount(deps, {
      email: 'user@example.com',
      masterPassword: 'pw',
      secretKey: 'expected_secret',
      kekSalt: 'salt_1',
    });

    expect(new TextDecoder().decode(keychain.writes.get('xai.refresh_token.acct_1'))).toBe(
      'refresh_login',
    );
  });
});

describe('refresh token lifecycle', () => {
  it('refreshes 60 seconds before expiry and stores the rotated token', async () => {
    const auth: AccountAuthTransport = {
      signup: vi.fn(),
      login: vi.fn(),
      refresh: vi.fn(async (refreshToken: string) => {
        expect(refreshToken).toBe('refresh_old');
        return authResponse({
          accessToken: 'access_new',
          refreshToken: 'refresh_new',
          expiresAtMs: 20_000,
        });
      }),
    };
    const keychain = createKeychain();
    await keychain.secretSet(refreshTokenKey('acct_1'), new TextEncoder().encode('refresh_old'));
    const manager = new RefreshTokenManager({ auth, crypto: createCrypto(), keychain });

    expect(shouldRefresh(10_000, -50_000)).toBe(true);
    const result = await manager.refreshIfNeeded(
      { accountId: 'acct_1', accessToken: 'access_old', expiresAtMs: 10_000, kekSalt: 'salt_1' },
      -50_000,
    );

    expect(result.status).toBe('refreshed');
    expect(result.session.accessToken).toBe('access_new');
    expect(new TextDecoder().decode(keychain.writes.get('xai.refresh_token.acct_1'))).toBe(
      'refresh_new',
    );
  });

  it('requires relogin after three refresh failures', async () => {
    const auth: AccountAuthTransport = {
      signup: vi.fn(),
      login: vi.fn(),
      refresh: vi.fn(async () => {
        throw new Error('network down');
      }),
    };
    const keychain = createKeychain();
    await keychain.secretSet(refreshTokenKey('acct_1'), new TextEncoder().encode('refresh_old'));
    const manager = new RefreshTokenManager({ auth, crypto: createCrypto(), keychain });
    const session = {
      accountId: 'acct_1',
      accessToken: 'access_old',
      expiresAtMs: 10_000,
      kekSalt: 'salt_1',
    };

    await expect(manager.refreshIfNeeded(session, -50_000)).rejects.toThrow('network down');
    await expect(manager.refreshIfNeeded(session, -50_000)).rejects.toThrow('network down');
    await expect(manager.refreshIfNeeded(session, -50_000)).resolves.toMatchObject({
      status: 'relogin-required',
    });
  });
});
