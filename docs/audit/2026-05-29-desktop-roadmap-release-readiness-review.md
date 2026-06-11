# Desktop Roadmap Release Readiness Review - 2026-05-29

## 1. Executive Verdict

**Verdict: NO_GO for external release readiness.**

Repo-side implementation for the desktop roadmap is substantially complete: the roadmap manifest marks Phase 1 baseline as shipped, rows #2-#21 as `SHIPPED`, and the old overlay/control/grid path is no longer the normal default (`docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:16`, `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:24-43`, `packages/desktop-overlay-host-v2/docs/dev_log.md:100-108`).

The app should not be treated as release-ready yet because the release smoke row is still explicitly `BLOCKED`, multiple shipped rows retain manual real-macOS gates, several referenced evidence artifacts are untracked, and release security assumptions remain unresolved (`docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:23`, `packages/desktop-real-macos-release-smoke/docs/dev_log.md:10-17`, `packages/desktop-phase2-integrated-rc-gate/docs/dev_log.md:17-20`, `docs/workflow/project/usage-guide.md:599-610`).

## 2. Status Matrix

| Feature slug | dev_log status | Evidence path:line | Review verdict |
| --- | --- | --- | --- |
| desktop-tauri-web-dist-normal-window | SHIPPED | `packages/desktop-tauri-web-dist-normal-window/docs/dev_log.md:10-17` | Accepted as Phase 1 baseline; legacy overlay code is quarantined, not default. |
| desktop-web-auth-offline-mode | SHIPPED | `packages/desktop-web-auth-offline-mode/docs/dev_log.md:10-17` | Repo-side accepted; network-disabled real macOS behavior remains manual-risk. |
| desktop-phase1-build-packaging-pipeline | SHIPPED | `packages/desktop-phase1-build-packaging-pipeline/docs/dev_log.md:10-17` | Repo-side accepted; later RC gate improved DMG evidence, but clean-machine install remains manual. |
| web-external-runtime-offline-gates | SHIPPED | `packages/web-external-runtime-offline-gates/docs/dev_log.md:10-17` | Accepted for external-runtime kill switch; unrelated test failure noted in feature evidence. |
| desktop-basic-macos-menu-config-store | SHIPPED | `packages/desktop-basic-macos-menu-config-store/docs/dev_log.md:10-17` | Accepted repo-side; native menu/relaunch checks still need real macOS confirmation. |
| desktop-phase1-rc-release-gate | SHIPPED | `packages/desktop-phase1-rc-release-gate/docs/dev_log.md:10-15` | Phase 1 repo-side RC passed; residual manual GUI checks remain. |
| desktop-real-macos-release-smoke | BLOCKED | `packages/desktop-real-macos-release-smoke/docs/dev_log.md:10-17` | Release blocker; must not be counted as complete for external release. |
| desktop-native-notifications-reminders | SHIPPED | `packages/desktop-native-notifications-reminders/docs/dev_log.md:10-17` | Repo-side accepted; Notification Center behavior remains manual. |
| desktop-statusbar-quick-actions | SHIPPED | `packages/desktop-statusbar-quick-actions/docs/dev_log.md:10-21` | Repo-side accepted; tray click/focus behavior remains manual. |
| desktop-global-hotkey-quick-open | SHIPPED | `packages/desktop-global-hotkey-quick-open/docs/dev_log.md:10-21` | Repo-side accepted; shortcut conflict and focus behavior remain manual. |
| desktop-full-macos-menu-polish | SHIPPED | `packages/desktop-full-macos-menu-polish/docs/dev_log.md:10-17` | Repo-side accepted; hardware menu ergonomics remain manual. |
| desktop-auto-update-release-channel | SHIPPED | `packages/desktop-auto-update-release-channel/docs/dev_log.md:10-17` | Not release-ready until real endpoint, pubkey, signing, notarization, and updater smoke are proven. |
| desktop-last-data-cache-polish | SHIPPED | `packages/desktop-last-data-cache-polish/docs/dev_log.md:10-20` | Correct unreadable-cache contract exists; offline relaunch UI still needs real macOS smoke. |
| desktop-phase2-integrated-rc-gate | SHIPPED | `packages/desktop-phase2-integrated-rc-gate/docs/dev_log.md:10-20` | Repo-side Phase 2 gate accepted; row #1 remains an external release prerequisite. |
| desktop-local-first-storage-adr | SHIPPED | `packages/desktop-local-first-storage-adr/docs/dev_log.md:10-19` | ADR accepted; implementation conformance must be judged against ADR-0012. |
| desktop-local-first-sqlite-foundation | SHIPPED | `packages/desktop-local-first-sqlite-foundation/docs/dev_log.md:10-22` | Foundation exists, but live DB encryption is explicitly not wired. |
| desktop-local-first-repository-bridge | SHIPPED | `packages/desktop-local-first-repository-bridge/docs/dev_log.md:10-21` | Repo-side accepted, but referenced docs artifacts are untracked. |
| desktop-local-first-web-data-migration | SHIPPED | `packages/desktop-local-first-web-data-migration/docs/dev_log.md:10-21` | Repo-side accepted, but referenced docs artifacts are untracked. |
| desktop-local-first-offline-edit-queue | SHIPPED | `packages/desktop-local-first-offline-edit-queue/docs/dev_log.md:10-21` | Repo-side accepted; offline queue/relaunch UX still needs real macOS smoke. |
| desktop-local-first-sync-reconnect | SHIPPED | `packages/desktop-local-first-sync-reconnect/docs/dev_log.md:10-21` | Repo-side accepted; hosted Supabase and two-device reconnect are still manual. |
| desktop-ai-offline-provider-policy | SHIPPED | `packages/desktop-ai-offline-provider-policy/docs/dev_log.md:10-21` | Accepted if cloud AI is explicitly online-only and fail-closed. |
| desktop-calendar-sync-degraded-mode | SHIPPED | `packages/desktop-calendar-sync-degraded-mode/docs/dev_log.md:10-21` | Accepted if provider state remains online-only/device-local and no fake outbox is claimed. |
| desktop-local-first-backup-export-import | SHIPPED | `packages/desktop-local-first-backup-export-import/docs/dev_log.md:10-21` | Accepted as partial restore/export; not full raw DB restore or cloud backup. |
| desktop-phase3-integrated-rc-gate | SHIPPED | `packages/desktop-phase3-integrated-rc-gate/docs/dev_log.md:10-21` | Repo-side Phase 3 accepted; notes unsupported and external UX checks remain. |
| desktop-overlay-host-v2 | SHIPPED | `packages/desktop-overlay-host-v2/docs/dev_log.md:10-20` | Optional/future-mode only; normal app path remains default. |
| desktop-smart-container-file-organizer | SHIPPED | `packages/desktop-smart-container-file-organizer/docs/dev_log.md:10-21` | Optional organizer work is isolated from overlay default; bookmark/session limits remain. |
| desktop-organizer-plugin-restoration | SHIPPED | `packages/desktop-organizer-plugin-restoration/docs/dev_log.md:10-21` | Organizer plugin restoration accepted; PLUGIN_MAP now distinguishes restored/deferred/retired rows. |

## 3. Phase Boundary Review

### Phase 1

Phase 1 was correctly redefined around a normal, dock-visible, local-first React/Tauri app, not a transparent overlay product (`docs/adr/0011-p1-react-tauri-local-first-hybrid.md:22-31`, `docs/adr/0011-p1-react-tauri-local-first-hybrid.md:86-94`). The current Tauri config matches that direction: the main window is decorated, non-transparent, resizable, and not skipped from the taskbar (`apps/desktop/src-tauri/tauri.conf.json:12-31`).

The Phase 1 RC gate is shipped repo-side, and the DMG startup probe was reproduced in that gate (`packages/desktop-phase1-rc-release-gate/docs/dev_log.md:37-58`). It is still not a substitute for the later real macOS smoke checklist required by the workflow (`docs/workflow/project/usage-guide.md:599-610`).

### Phase 2

Phase 2 native slices were implemented after the normal app baseline, which respects ADR-0011's order (`docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:101-103`). Notifications, status bar, global hotkey, menu polish, updater channel, and cache polish are all marked shipped, but Phase 2's integrated gate explicitly keeps the real-macOS release smoke row separate and not closed (`packages/desktop-phase2-integrated-rc-gate/docs/dev_log.md:17-20`, `packages/desktop-phase2-integrated-rc-gate/docs/dev_log.md:27-29`).

### Phase 3

Phase 3 follows ADR-0012's local-first storage plan: live DB in app data, repository bridge, migration/import, offline queue, sync reconnect, degraded cloud AI/calendar, backup/export/import, and integrated gate (`docs/adr/0012-phase3-local-first-storage.md:74-142`, `packages/desktop-phase3-integrated-rc-gate/docs/dev_log.md:10-21`). The main release concern is not phase order; it is that shipped local-first behavior still includes explicit security and manual UX residuals such as plaintext SQLite foundation, hosted-provider reconnect smoke, and partial backup semantics (`apps/desktop/src-tauri/src/commands/database.rs:8-12`, `packages/desktop-local-first-sync-reconnect/docs/dev_log.md:10-21`, `packages/desktop-local-first-backup-export-import/docs/dev_log.md:97-101`).

### P3+ Future

P3+ overlay and organizer work stayed behind optional/future boundaries. The roadmap explicitly made P3+ dependent on the Phase 3 RC and kept overlay work optional (`docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:88`, `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:104-106`). Runtime code also boots the overlay only in `overlay_v2`; normal mode applies the normal main window state (`apps/desktop/src-tauri/src/lib.rs:186-209`, `apps/desktop/src-tauri/src/lib.rs:232-234`, `apps/desktop/src-tauri/src/app_config.rs:115-128`).

## 4. Critical Findings

### P0 - Real macOS release smoke is still blocked

The roadmap still lists `desktop-real-macos-release-smoke` as `BLOCKED`, and its dev_log marks the whole feature `BLOCKED_ENVIRONMENT` (`docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:23`, `packages/desktop-real-macos-release-smoke/docs/dev_log.md:10-17`). The blocked checks are exactly release-gate checks: network-disabled launch, drag-install launch from `/Applications`, native menu clicks, and monitor topology relaunch (`packages/desktop-real-macos-release-smoke/docs/dev_log.md:28-66`). The project workflow says these are real macOS verification requirements, including macOS 13+, multi-display/Spaces/focus, Tauri command behavior, and notarized first launch when release packaging is involved (`docs/workflow/project/usage-guide.md:599-610`).

Impact: the app can be called repo-side ready for many rows, but it is not externally release-ready.

### P0 - Shipped/blocked workflow evidence is not fully tracked

Workflow rules require the review docs and docs quartet to exist as durable project artifacts (`docs/workflow/project/usage-guide.md:109-123`). Several shipped or blocked rows reference review/docs artifacts that are present in the working tree but untracked, including Phase 2 integrated RC, real macOS smoke, repository bridge, and web data migration artifacts (`packages/desktop-phase2-integrated-rc-gate/docs/dev_log.md:17-26`, `packages/desktop-real-macos-release-smoke/docs/dev_log.md:23`, `packages/desktop-local-first-repository-bridge/docs/dev_log.md:17-27`, `packages/desktop-local-first-web-data-migration/docs/dev_log.md:17-28`). Example artifacts include `docs/reviews/desktop-phase2-integrated-rc-gate/20260528-feature-brief.md:1`, `docs/reviews/desktop-real-macos-release-smoke/20260528-feature-brief.md:1`, `packages/desktop-local-first-repository-bridge/docs/design.md:1`, and `packages/desktop-local-first-web-data-migration/docs/design.md:1`.

Impact: a fresh checkout would not contain all evidence needed to substantiate some `SHIPPED` or `BLOCKED` statuses.

### P1 - Auto-update release channel is implemented but not production-ready

The feature is marked shipped but carries residual risk for real endpoint/pubkey, private signing, real macOS updater smoke, Apple signing, and notarization (`packages/desktop-auto-update-release-channel/docs/dev_log.md:10-17`). The Tauri config still uses placeholder updater material (`apps/desktop/src-tauri/tauri.conf.json:51-55`), and the updater command code explicitly treats placeholders as a disabled/misconfigured state (`apps/desktop/src-tauri/src/commands/updater.rs:185-197`). The roadmap also identifies signing/notarization as an explicit release gate (`docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:120-122`).

Impact: do not advertise auto-update as production-ready or run external release until the release channel is configured and smoke-tested on real macOS.

### P1 - Local-first SQLite foundation is plaintext unless accepted as an RC risk

ADR-0012 establishes the live local database under app data as the Phase 3 source of truth (`docs/adr/0012-phase3-local-first-storage.md:74-79`). The implemented database command module states that SQLCipher/encryption is intentionally not wired in the PoC and that a future `kek_handle` path is planned (`apps/desktop/src-tauri/src/commands/database.rs:8-12`). The feature is nevertheless marked shipped as the SQLite foundation (`packages/desktop-local-first-sqlite-foundation/docs/dev_log.md:10-22`).

Impact: release notes, threat model, and product claims must not imply encrypted local-at-rest data unless this is fixed or explicitly accepted as a release candidate limitation.

### P1 - Dependency audit currently fails for repo release surfaces

`pnpm audit --prod --audit-level moderate` exited non-zero during this review with 26 vulnerabilities, including critical and high Next.js advisories. The affected repo surfaces include `apps/docs` and `apps/release-site`, both of which declare `next` dependencies (`apps/docs/package.json:15`, `apps/release-site/package.json:29`). The lockfile resolves `next@16.0.1` in these surfaces (`pnpm-lock.yaml:4509`, `pnpm-lock.yaml:7377`).

Impact: this may not block a desktop-only `.app` bundle, but it blocks a clean repository release if docs/release-site are deployed or shipped as part of release operations.

### P2 - Tauri permission surface is constrained but still broad in release posture

The default capability is main-window only, which is good, but it still grants `opener:default`, notifications, and updater permissions to the main window (`apps/desktop/src-tauri/capabilities/default.json:1-12`). The capability audit explicitly says opener minimization is deferred (`apps/desktop/src-tauri/capabilities/AUDIT.md:41-49`). The Tauri config also enables `withGlobalTauri` and has `csp` set to null (`apps/desktop/src-tauri/tauri.conf.json:14`, `apps/desktop/src-tauri/tauri.conf.json:36`).

Impact: not an immediate correctness blocker because source-level command allowlists exist, but this should be tightened before a hardened public release.

### P2 - Overlay/future-mode runtime boundary is correct, but architecture docs are stale

ADR-0011 demotes the overlay to legacy/future work and says older system architecture sections were left unchanged as historical references (`docs/adr/0011-p1-react-tauri-local-first-hybrid.md:115-130`, `docs/adr/0011-p1-react-tauri-local-first-hybrid.md:203-207`). Runtime behavior now gates overlay commands behind `overlay_v2` and returns fail-closed errors outside that mode (`apps/desktop/src-tauri/src/commands/window.rs:98-125`, `apps/desktop/src-tauri/src/commands/window.rs:231-240`). However, `SYSTEM_ARCHITECTURE.md` still presents transparent overlay/grid-window behavior as core architecture (`docs/SYSTEM_ARCHITECTURE.md:59-85`), and the capability audit has stale wording that says lifecycle window commands remain unregistered while `lib.rs` now registers them with fail-closed behavior (`apps/desktop/src-tauri/capabilities/AUDIT.md:40`, `apps/desktop/src-tauri/src/lib.rs:139-148`).

Impact: not a runtime blocker, but it is a release communication and onboarding risk.

## 5. Release Gate Checklist

| Gate | Status | Evidence |
| --- | --- | --- |
| Packaging | Conditional | Phase 1 RC reproduced DMG mount/startup probe, but clean-machine drag-install remains blocked in the real macOS smoke row (`packages/desktop-phase1-rc-release-gate/docs/dev_log.md:47-58`, `packages/desktop-real-macos-release-smoke/docs/dev_log.md:38-46`). |
| Offline launch | Conditional | Offline/auth gates and cache polish shipped, but network-disabled bundled `.app` launch is still blocked for real macOS evidence (`packages/desktop-web-auth-offline-mode/docs/dev_log.md:10-17`, `packages/desktop-real-macos-release-smoke/docs/dev_log.md:28-36`). |
| Real macOS hardware | Blocked | The release smoke feature is `BLOCKED_ENVIRONMENT` and the workflow requires real macOS checks (`packages/desktop-real-macos-release-smoke/docs/dev_log.md:10-17`, `docs/workflow/project/usage-guide.md:599-610`). |
| Permissions/capabilities | Conditional | Main-only capability model exists, but opener/updater/notification permissions and CSP/global Tauri posture need hardening review (`apps/desktop/src-tauri/capabilities/default.json:1-12`, `apps/desktop/src-tauri/capabilities/AUDIT.md:41-49`, `apps/desktop/src-tauri/tauri.conf.json:14`, `apps/desktop/src-tauri/tauri.conf.json:36`). |
| Local-first data | Conditional | Phase 3 is shipped repo-side, but SQLite encryption is not wired and several UX paths remain manual (`apps/desktop/src-tauri/src/commands/database.rs:8-12`, `packages/desktop-phase3-integrated-rc-gate/docs/dev_log.md:10-21`). |
| Online degraded modes | Conditional | AI and calendar degraded modes are explicitly scoped as online-only/fail-closed/device-local, which is acceptable only if release messaging preserves that limitation (`packages/desktop-ai-offline-provider-policy/docs/dev_log.md:81-87`, `packages/desktop-calendar-sync-degraded-mode/docs/dev_log.md:108-115`). |
| Auto-update/signing/notarization | Blocked for public release | Placeholder updater config remains, and signing/notarization are still release gates (`apps/desktop/src-tauri/tauri.conf.json:51-55`, `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:120-122`). |

## 6. Test Evidence

### Commands found in dev_logs

- Phase 1 RC repo-side gate included build, preview, DMG mount/startup probe, offline HTTP kill checks, and targeted unit tests; it passed repo-side with manual macOS GUI residuals (`packages/desktop-phase1-rc-release-gate/docs/dev_log.md:37-58`, `packages/desktop-phase1-rc-release-gate/docs/dev_log.md:101-106`).
- Phase 2 integrated RC gate records repo-side lint/test/build/tauri checks and keeps row #1 separate from release readiness (`packages/desktop-phase2-integrated-rc-gate/docs/dev_log.md:95-105`, `packages/desktop-phase2-integrated-rc-gate/docs/dev_log.md:125-130`).
- Phase 3 integrated RC gate records plan/review/verify/ship, with repo-side checks accepted and external UX checks residual (`packages/desktop-phase3-integrated-rc-gate/docs/dev_log.md:102-111`).
- Overlay Host v2 verify commands passed and specifically audited normal default mode (`packages/desktop-overlay-host-v2/docs/dev_log.md:100-114`).

### Commands run during this audit

- `git branch --show-current`: confirmed `dev`.
- `git status --short --untracked-files=all`: found untracked review/docs artifacts for several roadmap rows.
- `git diff --check`: passed with no whitespace errors.
- `git log --oneline --decorate -n 12 --first-parent`: current `dev` head includes recent row #20/#21 ship writebacks.
- `pnpm audit --prod --audit-level moderate`: failed with 26 vulnerabilities, including critical/high Next.js advisories affecting docs/release-site dependency surfaces.
- `cargo audit --version`: cargo-audit subcommand is not installed; no Rust vulnerability audit was completed in this pass.

### Manual-only gates

- Real macOS network-disabled bundled `.app` launch, Finder drag-install launch from `/Applications`, native menu click behavior, and monitor topology relaunch remain blocked (`packages/desktop-real-macos-release-smoke/docs/dev_log.md:28-66`).
- Notification Center delivery, status bar click/focus behavior, global hotkey focus/registration conflicts, offline edit/relaunch, reconnect sync, and backup/import UX still need human hardware confirmation (`packages/desktop-native-notifications-reminders/docs/dev_log.md:58-61`, `packages/desktop-statusbar-quick-actions/docs/dev_log.md:10-21`, `packages/desktop-global-hotkey-quick-open/docs/dev_log.md:10-21`, `packages/desktop-local-first-offline-edit-queue/docs/dev_log.md:10-21`, `packages/desktop-local-first-sync-reconnect/docs/dev_log.md:10-21`, `packages/desktop-local-first-backup-export-import/docs/dev_log.md:10-21`).

## 7. Required Fix Roadmap

| Blocker slug | Scope | Effort | Dependency | Target phase/branch |
| --- | --- | --- | --- | --- |
| close-real-macos-release-smoke | Run and record human evidence for network-disabled bundled launch, Finder drag-install, native menus, monitor topology relaunch, and notarized first launch if releasing. | M | Physical macOS machine and release candidate bundle | Phase 2 release gate on `dev` |
| track-missing-workflow-artifacts | Add the untracked docs/reviews and package docs that substantiate shipped/blocked rows, or explicitly remove stale references after review. | S | Audit each untracked artifact against current dev_log references | Cross-phase workflow hygiene on `dev` |
| production-updater-signing | Replace placeholder updater endpoint/pubkey, verify signed update metadata, confirm Apple signing/notarization, and smoke-test update checks on real macOS. | M | Release signing keys, update host, notarization credentials | Phase 2 release gate on `dev` |
| local-db-at-rest-decision | Either implement the ADR-0012 encryption/key-handle follow-up or formally accept plaintext local DB as an RC limitation in release docs/threat model. | M | Security/product decision | Phase 3 hardening on `dev` |
| dependency-audit-remediation | Upgrade or scope out vulnerable Next.js surfaces before repo release/deployment. | M | Web/docs/release-site owner decision | Release hygiene on `dev` or relevant web branch |
| capability-hardening | Minimize opener/updater/notification permissions, set an explicit Tauri CSP if feasible, and reconcile capability audit docs with current runtime gating. | S/M | Tauri smoke tests | Release hardening on `dev` |
| architecture-doc-sync | Update SYSTEM_ARCHITECTURE/capability audit language so overlay is clearly historical/future-mode and not the normal product path. | S | No code dependency | Documentation hardening on `dev` |

## 8. Final Recommendation

Do **not** run ship and do **not** prepare an external release candidate yet. The correct next action is to fix the P0 release blockers first, beginning with real macOS release smoke evidence and missing tracked workflow artifacts.

Exact recommended next Workflow V2 command:

```text
Start the feature-auto-build agent for desktop-real-macos-release-smoke.
```

When that row has real hardware evidence and the traceability artifacts are tracked, run a fresh `feature-verify` for `desktop-real-macos-release-smoke`, then rerun the integrated RC gate review before considering `ship` or release-candidate preparation.
