# keychain-bridge-macos — Test Strategy

> Test plan / mock strategy / acceptance criteria. Cross-vendor verify: NO (single-vendor automation).
> **Phase 1–4 implementation complete** (2026-05-19). Unattended test layers green. Real-hardware gates deferred to feature-verify.

## 1. Test Layers

### 1.1 Rust unit tests (`cargo test` in `apps/desktop/src-tauri/`)

Run unattended in CI (no login keychain required):

- **T-U1 Error prefixes**: every new E11xx `AppError` variant's `Display`
  begins with its `E11xx:` code prefix (mirrors existing `error.rs` test
  pattern; locks the JS-parseable contract). Also assert existing
  E1000/E3xxx prefixes still hold (regression — additive-only).
- **T-U2 Attribute construction**: the function that builds the keychain item
  attributes asserts the `com.jinlong.desktop.secret` service namespace and
  synchronizable=false (T13 regression). Pure-construction test, no Keychain I/O.
- **T-U3 Signed ACL release gate tracking**: the bundle id
  `com.jinlong.desktop` remains recorded as the production signed Data Protection
  ACL target, but the ACL is not attached in unsigned dev/debug builds after the
  2026-05-29 release-readiness smoke exposed OSStatus -34018.
- **T-U4 Non-macOS stub**: on a non-macOS `cfg`, the command path returns
  `KeychainUnsupportedPlatform` (E1104) — keeps web/CI compiling and
  contractually defined.
- **T-U5 OSStatus → AppError mapping**: representative Security.framework
  error codes map to the correct E11xx variant (locked → E1100,
  not-found → E1101, ACL → E1102, other → E1103).

### 1.2 Rust integration tests (real Keychain — gated)

`#[ignore]` or behind a `keychain-it` cargo feature; run manually on real
macOS hardware (cannot run on headless CI — R-3):

- **T-I1 Round-trip**: `secret_set("xai.test.<rand>", bytes)` → `secret_get`
  returns identical bytes → `secret_del` → subsequent `secret_get` →
  `KeychainItemNotFound`.
- **T-I2 Idempotent set**: `secret_set` twice (different values) → `secret_get`
  returns the latest (OQ-2).
- **T-I3 Idempotent delete**: `secret_del` on absent key → success (no error).
- **T-I4 Locked behavior** (manual, real hardware): with screen locked,
  `secret_get` → `KeychainLocked` (E1100), no panic (FR-SY-09).

### 1.3 TS contract tests (`pnpm --filter @repo/core-data test`, Vitest)

- **T-T1**: `secretSet/secretGet/secretDel` call the `useTauriInvoke` seam
  with the correct command name + argument shape (mocked invoke; no real
  Keychain — PLUGIN_SDK §7.2).
- **T-T2**: an `AppError` with an `E11xx:` Display prefix is parsed into the
  typed `KeychainError` carrying the right code; `E1101` (not-found) is
  distinguishable by callers from `E1100` (locked).
- **T-T3**: byte fidelity — `Uint8Array` in == `Uint8Array` out through the
  wrapper serialization boundary.

### 1.4 Multi-window / macOS native-API real-hardware gate

Required before the human ship gate (feature-verify runs / records):

- `pnpm dev` in `apps/desktop/` on real macOS — app launches with the new
  command + capability registered, no regression to existing window/Keychain
  behavior.
- T-I1 + T-I4 executed on real hardware (dev build).

## 2. Mock Strategy

- TS layer: mock `useTauriInvoke` / the invoke transport — never touch a real
  Keychain in Vitest. Downstream consumers (plugin-account) mock
  `@repo/core-data` keychain exports until `@repo/core-data` is Stable in
  PLUGIN_MAP.
- Rust unit layer: test attribute/error construction and signed-ACL release-gate
  tracking as pure functions;
  isolate Security.framework I/O behind the integration-test gate.

## 3. Acceptance Criteria

| ID | Criterion | Layer |
|---|---|---|
| AC-1 | `secret_set/get/del` registered in `commands/mod.rs` + `lib.rs` `invoke_handler!`; `cargo check` green | build |
| AC-2 | macOS impl under `platform/macos/keychain.rs`, `#[cfg(target_os = "macos")]`; non-macOS stub returns E1104 | T-U4 |
| AC-3 | Item attributes asserted: service namespace set, synchronizable never true (T13) | T-U2 |
| AC-4 | Signed Data Protection ACL target remains tracked for bundle id `com.jinlong.desktop` | T-U3 + production-signing gate |
| AC-5 | All E11xx variants have JS-parseable `E11xx:` Display prefixes; existing E1000/E3xxx unchanged | T-U1 |
| AC-6 | OSStatus → AppError mapping correct (locked/not-found/acl/other) | T-U5 |
| AC-7 | Round-trip set→get→del on real macOS dev build (gated test) | T-I1 |
| AC-8 | Locked-screen `secret_get` → E1100, no panic (FR-SY-09) | T-I4 |
| AC-9 | TS wrapper goes through `useTauriInvoke`; no direct `@tauri-apps/api` in `@repo/core-data` or consumers (red line #4 grep clean) | T-T1 + grep |
| AC-10 | Scoped capability allowlist restricts `secret_*` to plugin-account window(s) | review + manual |
| AC-11 | `pnpm --filter @repo/core-data check-types` + `test` green; `cargo test` green (unattended layer) | build/verify |
| AC-12 | `pnpm dev` macOS smoke: app launches, no window/Keychain regression | real-hardware gate |

## 4. Deferred / Documented Follow-up (NOT ship blockers)

- **D-1**: Real signed-build Data Protection ACL cross-process rejection (a non-bundle-id
  process is denied) — verifiable only on a codesigned build; gated by
  `apple-developer-account` (#10).
- **D-2**: MAS-sandbox `keychain-access-group` entitlement behavior — same
  gate (#10).
- These are recorded in `dev_log.md` Risks and must be re-surfaced when
  `apple-developer-account` ships; this feature reaches READY_TO_SHIP with
  attributes correct in code + the test layers above.
