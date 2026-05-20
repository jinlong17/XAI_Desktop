import type { KeychainClient } from '@repo/core-data';

import type { KeyHandle } from './types';

export const REFRESH_TOKEN_KEY_PREFIX = 'xai.refresh_token';
export const REFRESH_SKEW_MS = 60_000;
export const MAX_REFRESH_FAILURES = 3;

export interface AccountCredentials {
  email: string;
  masterPassword: string;
  secretKey: string;
}

export interface SignupInput extends AccountCredentials {
  displayName?: string;
}

export type Bytes = Uint8Array;

export interface SignupCryptoBundle {
  authPassword: string;
  kekSalt: string;
  secretKeyCheck: string;
  dekCheck: string;
  keyId: number;
  deviceId: string;
  devicePub: Bytes;
  deviceDekWrap: Bytes;
  recoverySigningPub: Bytes;
  dekHandle: KeyHandle;
  devicePrivHandle: KeyHandle;
}

export interface LoginCryptoResult {
  authPassword: string;
}

export interface AccountCryptoClient {
  prepareSignup(input: AccountCredentials): Promise<SignupCryptoBundle>;
  deriveLoginAuthPassword(
    input: AccountCredentials & { kekSalt: string },
  ): Promise<LoginCryptoResult>;
}

export interface SignupRequest {
  email: string;
  displayName?: string;
  authPassword: string;
  kekSalt: string;
  secretKeyCheck: string;
  dekCheck: string;
  keyId: number;
  deviceId: string;
  devicePub: number[];
  deviceDekWrap: number[];
  recoverySigningPub: number[];
}

export interface LoginRequest {
  email: string;
  authPassword: string;
}

export interface AuthResponse {
  accountId: string;
  accessToken: string;
  refreshToken: string;
  expiresAtMs: number;
  kekSalt: string;
}

export interface AccountAuthTransport {
  signup(request: SignupRequest): Promise<AuthResponse>;
  login(request: LoginRequest): Promise<AuthResponse>;
  refresh(refreshToken: string): Promise<AuthResponse>;
}

export interface AccountSession {
  accountId: string;
  accessToken: string;
  expiresAtMs: number;
  kekSalt: string;
}

export interface AccountDeps {
  auth: AccountAuthTransport;
  crypto: AccountCryptoClient;
  keychain: KeychainClient;
}

export type RefreshResult =
  | { status: 'fresh'; session: AccountSession }
  | { status: 'refreshed'; session: AccountSession }
  | { status: 'relogin-required'; session: AccountSession };

export async function signupAccount(
  deps: AccountDeps,
  input: SignupInput,
): Promise<AccountSession> {
  const crypto = await deps.crypto.prepareSignup(input);
  const response = await deps.auth.signup({
    email: input.email,
    displayName: input.displayName,
    authPassword: crypto.authPassword,
    kekSalt: crypto.kekSalt,
    secretKeyCheck: crypto.secretKeyCheck,
    dekCheck: crypto.dekCheck,
    keyId: crypto.keyId,
    deviceId: crypto.deviceId,
    devicePub: Array.from(crypto.devicePub),
    deviceDekWrap: Array.from(crypto.deviceDekWrap),
    recoverySigningPub: Array.from(crypto.recoverySigningPub),
  });
  await persistRefreshToken(deps.keychain, response.accountId, response.refreshToken);
  return sessionFromAuth(response);
}

export async function loginAccount(
  deps: AccountDeps,
  input: AccountCredentials & { kekSalt: string },
): Promise<AccountSession> {
  const crypto = await deps.crypto.deriveLoginAuthPassword(input);
  const response = await deps.auth.login({
    email: input.email,
    authPassword: crypto.authPassword,
  });
  await persistRefreshToken(deps.keychain, response.accountId, response.refreshToken);
  return sessionFromAuth(response);
}

export function refreshTokenKey(accountId: string): string {
  if (accountId.trim().length === 0) {
    throw new Error('E3004: account_id is required for refresh token key');
  }
  return `${REFRESH_TOKEN_KEY_PREFIX}.${accountId}`;
}

export async function persistRefreshToken(
  keychain: KeychainClient,
  accountId: string,
  refreshToken: string,
): Promise<void> {
  await keychain.secretSet(refreshTokenKey(accountId), encodeUtf8(refreshToken));
}

export async function readRefreshToken(
  keychain: KeychainClient,
  accountId: string,
): Promise<string> {
  return decodeUtf8(await keychain.secretGet(refreshTokenKey(accountId)));
}

export function shouldRefresh(expiresAtMs: number, nowMs: number): boolean {
  return expiresAtMs - nowMs <= REFRESH_SKEW_MS;
}

export class RefreshTokenManager {
  private failureCount = 0;

  constructor(private readonly deps: AccountDeps) {}

  async refreshIfNeeded(session: AccountSession, nowMs = Date.now()): Promise<RefreshResult> {
    if (!shouldRefresh(session.expiresAtMs, nowMs)) {
      return { status: 'fresh', session };
    }

    try {
      const refreshToken = await readRefreshToken(this.deps.keychain, session.accountId);
      const response = await this.deps.auth.refresh(refreshToken);
      await persistRefreshToken(this.deps.keychain, response.accountId, response.refreshToken);
      this.failureCount = 0;
      return { status: 'refreshed', session: sessionFromAuth(response) };
    } catch (error) {
      this.failureCount += 1;
      if (this.failureCount >= MAX_REFRESH_FAILURES) {
        return { status: 'relogin-required', session };
      }
      throw error;
    }
  }
}

function sessionFromAuth(response: AuthResponse): AccountSession {
  return {
    accountId: response.accountId,
    accessToken: response.accessToken,
    expiresAtMs: response.expiresAtMs,
    kekSalt: response.kekSalt,
  };
}

function encodeUtf8(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function decodeUtf8(value: Uint8Array): string {
  return new TextDecoder().decode(value);
}
