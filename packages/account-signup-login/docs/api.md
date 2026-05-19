# account-signup-login — API Contract

## Public Exports

`@repo/plugin-account` exports:

- `signupAccount(deps, input): Promise<AccountSession>`
- `loginAccount(deps, input): Promise<AccountSession>`
- `RefreshTokenManager`
- `refreshTokenKey(accountId): string`
- `persistRefreshToken(keychain, accountId, refreshToken): Promise<void>`
- `readRefreshToken(keychain, accountId): Promise<string>`
- `shouldRefresh(expiresAtMs, nowMs): boolean`
- Account orchestration types from `src/account.ts`

## Contracts

`AccountCryptoClient.prepareSignup(input)` receives `{ email, masterPassword, secretKey }` and returns derived auth/check fields plus device/recovery public material and local key handles.

`AccountAuthTransport.signup(request)` receives only transport-safe fields:

```ts
{
  email,
  displayName,
  authPassword,
  kekSalt,
  secretKeyCheck,
  dekCheck,
  keyId,
  deviceId,
  devicePub,
  deviceDekWrap,
  recoverySigningPub,
}
```

`AccountAuthTransport.login(request)` receives `{ email, authPassword }`.

`AccountAuthTransport.refresh(refreshToken)` returns a rotated auth response. The manager persists the rotated refresh token before returning the refreshed session.

## Session Shape

```ts
interface AccountSession {
  accountId: string;
  accessToken: string;
  expiresAtMs: number;
  kekSalt: string;
}
```

The refresh token is intentionally excluded from `AccountSession`.
