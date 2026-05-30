# Desktop Roadmap Release Readiness Repair Review - 2026-05-29

## 1. Executive Verdict

**Verdict: CONDITIONAL_RELEASE.**

Repo-side release-candidate preparation is now a **GO** after the repair pass: the local-first SQLite blocker was fixed, `desktop` dev/build/DMG scripts now compile the crypto/SQLCipher command surface, the DMG-launched app created `app-config.json` plus encrypted `xai-repo-v0.db`, and the real macOS Keychain KEK smoke passes (`apps/desktop/package.json:6-10`, `apps/desktop/src-tauri/src/commands/database.rs:8-12`, `apps/desktop/src-tauri/src/commands/database_runtime.rs:123-139`, `packages/desktop-local-first-sqlite-foundation/docs/dev_log.md:19-22`, `packages/desktop-local-first-sqlite-foundation/docs/dev_log.md:122`).

This is **not** a notarized/public external release GO yet. The roadmap still records `desktop-real-macos-release-smoke` as `BLOCKED`, the updater still uses placeholder endpoint/key material, and the DMG is unsigned/rejected by Gatekeeper command evidence (`docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:23`, `apps/desktop/src-tauri/tauri.conf.json:51-55`, `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:120-122`).

## 2. Status Matrix

| Feature slug | dev_log status | Evidence path:line | Review verdict |
| --- | --- | --- | --- |
| Phase 1 baseline rows | SHIPPED | `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:16` | Accepted; normal-window desktop baseline remains intact. |
| desktop-real-macos-release-smoke | BLOCKED | `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:23`, `packages/desktop-real-macos-release-smoke/docs/dev_log.md:10-17` | Still incomplete as workflow row; repaired run covers DMG launch/data smoke only, not all human menu/topology checks. |
| desktop-native-notifications-reminders | SHIPPED | `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:24` | Repo-side accepted; Notification Center UX remains manual release smoke. |
| desktop-statusbar-quick-actions | SHIPPED | `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:25` | Repo-side accepted; status bar click/focus remains manual release smoke. |
| desktop-global-hotkey-quick-open | SHIPPED | `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:26` | Repo-side accepted; conflict/focus behavior remains manual release smoke. |
| desktop-full-macos-menu-polish | SHIPPED | `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:27` | Repo-side accepted; direct menu exercise remains manual release smoke. |
| desktop-auto-update-release-channel | SHIPPED | `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:28` | Not production-ready until real endpoint/pubkey/signing smoke replaces placeholders. |
| desktop-last-data-cache-polish | SHIPPED | `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:29` | Repo-side accepted; true network-disabled relaunch remains manual release smoke. |
| desktop-phase2-integrated-rc-gate | SHIPPED | `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:30` | Accepted repo-side; external release still depends on row #1 and signing/updater gates. |
| desktop-local-first-storage-adr | SHIPPED | `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:31` | Accepted. |
| desktop-local-first-sqlite-foundation | SHIPPED | `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:32`, `packages/desktop-local-first-sqlite-foundation/docs/dev_log.md:19-22` | Repaired and accepted: SQLCipher keying is now applied before bootstrap. |
| desktop-local-first-repository-bridge | SHIPPED | `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:33` | Accepted after tracking its review/docs artifacts. |
| desktop-local-first-web-data-migration | SHIPPED | `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:34` | Accepted after tracking its review/docs artifacts. |
| desktop-local-first-offline-edit-queue | SHIPPED | `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:35` | Repo-side accepted; offline edit/relaunch UX remains manual smoke. |
| desktop-local-first-sync-reconnect | SHIPPED | `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:36` | Repo-side accepted; hosted/two-device reconnect remains manual or integration-gated. |
| desktop-ai-offline-provider-policy | SHIPPED | `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:37` | Accepted if release notes preserve online-only degraded behavior. |
| desktop-calendar-sync-degraded-mode | SHIPPED | `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:38` | Accepted if release notes preserve provider/device-local limits. |
| desktop-local-first-backup-export-import | SHIPPED | `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:39` | Repo-side accepted; partial restore/export semantics should be documented. |
| desktop-phase3-integrated-rc-gate | SHIPPED | `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:40` | Accepted repo-side after storage encryption repair. |
| desktop-overlay-host-v2 | SHIPPED | `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:41` | Accepted as optional/future-mode only. |
| desktop-smart-container-file-organizer | SHIPPED | `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:42` | Accepted as optional organizer work, not normal startup. |
| desktop-organizer-plugin-restoration | SHIPPED | `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:43` | Accepted; roadmap implementation complete except row #1 external release smoke. |

## 3. Phase Boundary Review

### Phase 1

ADR-0011 defines P1 as a normal React+Tauri+local-first hybrid app, not a transparent click-through overlay (`docs/adr/0011-p1-react-tauri-local-first-hybrid.md:86-94`, `docs/adr/0011-p1-react-tauri-local-first-hybrid.md:115-130`). The current Tauri window is decorated, non-transparent, visible, and not skipped from taskbar/Dock behavior (`apps/desktop/src-tauri/tauri.conf.json:15-33`).

### Phase 2

Phase 2 native rows remain post-baseline polish and did not move overlay/control/grid behavior back into the default path (`docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:24-30`, `apps/desktop/src-tauri/capabilities/default.json:1-13`). The remaining Phase 2 risk is hardware UX evidence and production updater configuration.

### Phase 3

The main Phase 3 defect found in the first audit is fixed: `db_init` derives a SQLCipher DB key from a Keychain KEK and zeroizes raw material after use (`apps/desktop/src-tauri/src/commands/database.rs:168-204`, `apps/desktop/src-tauri/src/commands/database.rs:241-256`). Bootstrap applies the SQLCipher key before schema/meta access (`apps/desktop/src-tauri/src/commands/database_runtime.rs:123-139`).

### P3+ Future

Overlay and organizer work remains optional/future-mode. Normal mode configures the main app window as a normal window; overlay bootstrapping only runs when `hostMode == OverlayV2` (`apps/desktop/src-tauri/src/lib.rs:186-210`, `apps/desktop/src-tauri/src/lib.rs:232-234`). Overlay lifecycle commands fail closed outside `overlay_v2` (`apps/desktop/src-tauri/src/commands/window.rs:101-120`, `apps/desktop/src-tauri/src/commands/window.rs:221-231`).

## 4. Critical Findings

### P0 - Public release still blocked by signing/notarization/updater credentials

The updater config still carries placeholder pubkey and endpoint values (`apps/desktop/src-tauri/tauri.conf.json:51-55`). The roadmap explicitly calls out signing/notarization as release gates (`docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:120-122`). Command evidence from this pass: `codesign -dv` reported the DMG is not signed, and `spctl -a -vv -t open` rejected it.

Impact: prepare an internal/repo-side RC, but do not publish as a public notarized macOS release.

### P1 - Real macOS release-smoke workflow row remains BLOCKED

The manifest and dev_log still mark `desktop-real-macos-release-smoke` blocked for network-disabled launch, Finder drag-install from `/Applications`, native menu clicks, and monitor topology relaunch (`docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:23`, `packages/desktop-real-macos-release-smoke/docs/dev_log.md:28-66`). This repair pass proved DMG launch, Foreground LS app registration, config creation, and encrypted DB creation, but did not edit the manifest or complete every manual row.

Impact: run `feature-verify` for that smoke row before any external release claim.

### P1 - Keychain signed ACL is deferred, not failed-open silently

The previous `SecAccessControl` path failed unsigned dev/debug smoke with OSStatus -34018, so runtime now uses non-synchronizable generic-password items and documents signed Data Protection ACL verification as a production signing gate (`apps/desktop/src-tauri/src/platform/macos/keychain.rs:6-12`, `apps/desktop/src-tauri/src/platform/macos/keychain.rs:86-94`, `packages/keychain-bridge-macos/docs/dev_log.md:130-137`).

Impact: local-first DB startup is fixed for RC builds; production signing must still re-test the stronger ACL behavior.

### P2 - Capability/CSP surface remains a hardening follow-up

The active default capability is main-window only, which is good, but it still grants opener, notification, updater, and core event permissions (`apps/desktop/src-tauri/capabilities/default.json:1-13`). Tauri also has `withGlobalTauri: true` and `csp: null` (`apps/desktop/src-tauri/tauri.conf.json:12-37`). The capability audit records opener minimization as deferred (`apps/desktop/src-tauri/capabilities/AUDIT.md:37-49`).

Impact: acceptable for internal RC after current tests, but should be tightened before hardened public distribution.

### P2 - Build warnings remain non-blocking but visible

Rust builds pass with existing dead-code warnings around future command surfaces, and web builds pass with bundle-size warnings. The release-site build passes but still emits the Next middleware-to-proxy deprecation warning. These are not release blockers for repo-side RC, but they should not be mistaken for a clean warning-free release.

## 5. Release Gate Checklist

| Gate | Status | Evidence |
| --- | --- | --- |
| Packaging | PASS for debug RC artifact | `pnpm --filter desktop build` and `build:dmg` passed; package scripts enable crypto (`apps/desktop/package.json:6-10`, `packages/desktop-local-first-sqlite-foundation/docs/dev_log.md:122`). |
| Offline launch | CONDITIONAL | Bundled app launched from DMG and wrote local state, but true network-disabled human smoke row remains blocked (`packages/desktop-real-macos-release-smoke/docs/dev_log.md:28-36`). |
| Real macOS hardware | PARTIAL PASS | DMG app registered as `Foreground` LS app and wrote app data; AppleScript window probe was blocked by assistive-access permission, so direct window/menu checks remain manual (`packages/desktop-real-macos-release-smoke/docs/dev_log.md:48-66`). |
| Permissions/capabilities | CONDITIONAL | Main-only default and DB capability are constrained, overlay is opt-in; opener/updater/notification/CSP hardening remains (`apps/desktop/src-tauri/capabilities/default.json:1-13`, `apps/desktop/src-tauri/capabilities/plugin-data-database.json:1-9`, `apps/desktop/src-tauri/capabilities/overlay-v2.json:1-10`). |
| Local-first data | PASS repo-side | SQLCipher keying before bootstrap; DMG-created DB rejects plain sqlite3 reads (`apps/desktop/src-tauri/src/commands/database_runtime.rs:123-139`, `packages/desktop-local-first-sqlite-foundation/docs/dev_log.md:122`). |
| Online degraded modes | CONDITIONAL | Accepted as shipped only if release messaging preserves online-only/degraded behavior (`docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:37-38`). |
| Auto-update/signing/notarization | BLOCKED for public release | Placeholder updater config and unsigned DMG remain (`apps/desktop/src-tauri/tauri.conf.json:51-55`). |

## 6. Test Evidence

Commands run in this repair/re-review pass:

- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto database::tests::keychain_database_kek_roundtrip_uses_32_byte_secret -- --ignored --nocapture`: PASS (`packages/keychain-bridge-macos/docs/dev_log.md:134-137`).
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto --lib -- --nocapture`: PASS, 157 passed / 1 ignored (`packages/desktop-local-first-sqlite-foundation/docs/dev_log.md:122`).
- `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto --locked`: PASS (`packages/desktop-local-first-sqlite-foundation/docs/dev_log.md:122`).
- `pnpm --filter @repo/core-data test`: PASS, 141 tests (`packages/desktop-local-first-sqlite-foundation/docs/dev_log.md:122`).
- `pnpm --filter @repo/core-data check-types`: PASS (`packages/desktop-local-first-sqlite-foundation/docs/dev_log.md:122`).
- `pnpm audit --prod --audit-level moderate`: PASS after Next/PostCSS remediation (`apps/docs/package.json:13-18`, `apps/release-site/package.json:26-32`, `package.json:21-25`).
- `pnpm --filter docs build`: PASS on Next 16.2.6 (`apps/docs/package.json:13-18`).
- `pnpm --filter @repo/release-site-archive archive:build`: PASS with middleware deprecation warning (`apps/release-site/package.json:6-9`).
- `pnpm --filter desktop build`: PASS (`apps/desktop/package.json:6-10`).
- `pnpm --filter desktop build:dmg`: PASS (`apps/desktop/package.json:6-10`).
- DMG smoke: mounted DMG, launched `X Desktop.app`, verified LS foreground app registration, verified app data files, and plain `sqlite3` rejected `xai-repo-v0.db` as not a database (`packages/desktop-local-first-sqlite-foundation/docs/dev_log.md:122`).

Manual-only gates still open:

- Finder drag-install launch from `/Applications`, native menu clicks, monitor-topology relaunch, direct window assertion when assistive access is unavailable, real notification/statusbar/hotkey interactions, real updater endpoint/signing, and notarized first launch (`packages/desktop-real-macos-release-smoke/docs/dev_log.md:28-66`, `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:120-122`).

## 7. Required Fix Roadmap

| Blocker slug | Scope | Effort | Dependency | Target phase/branch |
| --- | --- | --- | --- | --- |
| production-signing-updater | Replace updater placeholder endpoint/pubkey, codesign, notarize, and smoke update checks on real macOS. | M | Apple Developer account, update host, signing secrets | Release gate on `dev` |
| close-real-macos-release-smoke | Run/record row #1 manual gates: network-disabled app launch, Finder drag-install, menu clicks, monitor topology relaunch. | M | Human macOS GUI access | Phase 2 release gate on `dev` |
| capability-csp-hardening | Minimize opener/updater/notification grants where possible and set explicit Tauri CSP if compatible. | S/M | Tauri smoke tests | Release hardening on `dev` |
| signed-keychain-acl-verification | Re-test Data Protection ACL / bundle identity behavior on signed build; keep current generic-password runtime if unsigned dev path remains needed. | M | Signed/notarized build | Security hardening on `dev` |
| warning-cleanup | Address Rust dead-code warnings and Next middleware/proxy deprecation. | S | None | Polish on `dev` or web-owned branch |

## 8. Final Recommendation

**Exact next action: prepare a repo-side release candidate and run the release-smoke verifier, not ship.**

Exact recommended next Workflow V2 command:

```text
Start the feature-verify agent for desktop-real-macos-release-smoke, with docs/audit/2026-05-29-desktop-roadmap-release-readiness-repair-review.md as required context.
```

After that verifier records the remaining human macOS gates, the next human-triggered action can be `ship`. Public release still requires the signing/notarization/updater gate.
