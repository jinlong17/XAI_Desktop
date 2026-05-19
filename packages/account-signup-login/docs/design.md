# account-signup-login — Design Snapshot

## Scope

- Feature: `account-signup-login` (#17)
- Package: `@repo/plugin-account`
- Source: `docs/reviews/account-signup-login/20260514-roadmap-seed.md`
- Status: local orchestration shipped; external/runtime gates deferred

## Architecture

`packages/plugin-account/src/account.ts` owns the account signup/login business flow. It is deliberately split into three injected seams:

- `AccountCryptoClient`: local-only derivation and provisioning. This is the only seam that receives `masterPassword` and `secretKey`.
- `AccountAuthTransport`: signup/login/refresh transport. It receives derived auth material and public device/proof fields only.
- `KeychainClient`: refresh-token persistence through the `@repo/core-data` Keychain bridge contract.

The package still has no direct `@tauri-apps/api` dependency. Real Rust crypto commands and Supabase transport are downstream wiring work.

## Security Properties

- `masterPassword` and `secretKey` do not leave the device-side crypto seam.
- Signup sends derived `authPassword`, `secretKeyCheck`, `dekCheck`, device public key, device DEK wrap, and recovery signing public key.
- Login derives `authPassword` from both password and secret-key input before auth transport runs; wrong secret-key failure occurs at the auth step.
- Refresh tokens are stored under `xai.refresh_token.<account_id>` and are never returned as part of the public `AccountSession`.
- Refresh attempts start 60 seconds before expiry; three consecutive refresh failures return `relogin-required`.

## Deferred Runtime Wiring

- Supabase signup/login/refresh transport and staging verification.
- Tauri `crypto_*` command implementation for the `AccountCryptoClient` seam.
- Real macOS signed-build Keychain ACL verification.
- UI flow for re-login after refresh exhaustion.
