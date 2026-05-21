# XAI v1 Track F - Release GA Log

## 2026-05-21 Checkpoint

Scope: `codex/track-f-release-ga`, no ship, no push.

Implemented G8 remaining stories and G10 Release GA prep:

- G8-S2: web account login with mock OAuth, password mock, passkey/WebAuthn stub, and plugin-account `LoginPage` export.
- G8-S3: web paired-device list with revoke UI, plugin-account `DeviceCard`/`DeviceListPage`, and mock G9 device revoke transport.
- G8-S4: web export/import UI using the plugin-account-compatible `xai.encrypted-export.v2` envelope and mock validation.
- G10-E1: Tauri version `1.0.0-rc.1`, updater endpoint/public-key placeholders, crash-reporting placeholder, and versioning doc.
- G10-S1: DMG RC build doc and local desktop/Rust release checks.
- G10-S2: MAS checklist, capability review notes, entitlement list, no-default-feature check, and `mas-sandbox` check.
- G10-E2: `/privacy`, `/terms`, `/delete-account`, and legal checklist.
- G10-E3/E4: RC landing page, quick-start docs page, icon inventory, and App Store listing draft.
- G10-E5/E6: support SOP and GA acceptance checklist.

Verification:

- `pnpm --filter @repo/plugin-account check-types` passed.
- `pnpm --filter desktop build` passed.
- `pnpm --filter web build` passed.
- `pnpm --filter @repo/core-data test` passed: 76 tests.
- `pnpm --filter @repo/plugin-account test` passed: 53 tests.
- `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --release` passed with existing dead-code warnings.
- `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --no-default-features` passed with existing dead-code warnings.
- `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --no-default-features --features mas-sandbox` passed with existing dead-code warnings.
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` passed: 41 tests.
- Local web dev server route smoke passed with HTTP 200 for `/`, `/login`, `/devices`, `/export`, `/import`, `/delete-account`, `/privacy`, `/terms`, and `/docs`.

Known verification gaps:

- Exact `pnpm check` is not defined in the root workspace and failed with `Command "check" not found`.
- Root `pnpm typecheck` was run as the closest available whole-workspace gate and failed in out-of-scope packages: `plugin-labels` cannot resolve `@repo/core-data/testing` and `vitest`; `plugin-widgets` cannot resolve `vitest`.
- Browser plugin control was not exposed in this session, so visual browser automation was not available; route smoke and production build were used instead.

Deferred gates:

- Supabase Auth and hosted `device_revoke` RPC.
- Real passkey challenge/assertion ceremonies.
- Account deletion service-role execution.
- Apple Developer signing, DMG notarization, MAS provisioning, App Review, and signed-build Keychain ACL validation.
- Production Sentry DSN, symbol upload, and support/privacy inbox.
- Real two-device sync/revoke/re-key rehearsal and long-run stability run.
