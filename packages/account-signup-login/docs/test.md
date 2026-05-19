# account-signup-login — Test Strategy

## Local Tests

- `pnpm --filter @repo/plugin-account check-types`
- `pnpm --filter @repo/plugin-account test`

## Covered Assertions

- Signup sends derived fields and does not send raw `masterPassword` or `secretKey` to auth transport.
- Login with the wrong `secretKey` fails at auth and does not persist a refresh token.
- Successful login persists the refresh token through the injected Keychain client.
- Refresh starts 60 seconds before expiry and persists rotated refresh tokens.
- Three consecutive refresh failures produce `relogin-required`.

## Deferred Gates

- Real Supabase signup/login/refresh E2E.
- Real Tauri crypto command wiring.
- Signed-build Keychain ACL verification.
- UI re-login transition after refresh failure.
