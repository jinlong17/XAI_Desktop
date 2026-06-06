# Desktop Plugin Platform Runtime — Native Window Smoke Checklist

> Date: 2026-06-06
> Module: `plugin`
> Phase: Phase 2 host smoke gate
> Status: checklist refreshed for Phase 2; native Plugin Center menu entry added; native smoke not executed in this slice

## Purpose

This checklist is the manual macOS gate for claiming that the Desktop Plugin
runtime is ready for concrete plugin package unfreeze. Automated core tests prove
the TypeScript contract, storage and adapter behavior, but they do not prove
NSWindow / Tauri runtime behavior, real Plugin Center interaction, or restart
restore behavior.

Do not mark Phase 2 host smoke complete, and do not start concrete clipboard /
widgets / pet / meditation feature-build, until every required smoke row below
has dated evidence.

## Scope

In scope:

- open / focus Plugin Center
- open / focus Plugin Center from `Desktop Plugins > Open Plugin Center`
- enable / disable desktop plugin runtime host mode from the native menu
- list built-in plugin entries
- add host-local `sample-widget` from Plugin Center
- persist a device-local `PluginInstance`
- create / focus / move / resize / close plugin grid windows
- restore enabled instances after app restart
- disable / hide / delete / reset / style updates from Plugin Center
- render sample widget content through `GridWindow` instance routing
- list known plugin windows
- opacity / click-through / pinned / all-spaces native application state
- display / Space fallback behavior
- capability denial from disallowed source windows

Out of scope:

- Plugin Center visual redesign
- third-party plugin install or marketplace
- concrete clipboard / widgets / pet / meditation business behavior
- account-sync of plugin instances
- release signing / notarization / DMG checks

## Preconditions

Run from the plugin platform worktree:

```bash
cd /Users/lijinlong/.codex/worktrees/xai-plugin-platform-runtime
git status --short --branch
```

Expected branch:

```text
codex/plugin/common-capabilities-phase2
```

Required commits on the branch:

```text
ed9c10e typed contract
78d7b86 manifest-to-center adapter
64c6434 device-local instance store
8958966 generic plugin window adapter
ec4f2d3 placement / behavior model
d185463 native smoke checklist baseline
201e8cf Plugin Center shell window
68957f9 built-in plugin list
bf7ab16 add-to-desktop flow
5a410de instance management
1263097 restart restore for enabled instances
893cd2f native fallback state display
83ec1c3 capability denial state display
aba6415 native behavior application
65d1778 sample widget host flow
current native menu entry for Plugin Center and host-mode toggles
```

Current preflight status before a clean desktop build/dev gate:

- `apps/desktop` typecheck preflight is unblocked after declaring the existing
  `@repo/plugin-labels` / `@repo/plugin-productivity` imports in the desktop
  manifest and removing stale unused locals in
  `packages/core-data/src/indexeddb-sync-blob.ts`.
- In the current Codex shell, global `pnpm` is not installed. The equivalent
  debug bundle build can be verified by prebuilding `apps/web/dist` with the
  local Vite binary and running `cargo tauri build --debug --features crypto
  --bundles app --config '{"build":{"beforeBuildCommand":""}}'`; foreground
  App launch and click-through manual smoke still require dated operator
  evidence.
- In this branch, the macOS menu now exposes `Desktop Plugins > Open Plugin
  Center` plus restart-required enable / disable actions for the desktop plugin
  runtime. Use this native entry for P2-HS-1 instead of relying on DevTools or
  hidden Webview IPC calls.
- If any App-lane issue reappears, record the fixing commit before claiming this
  plugin smoke gate.

## Automated Gate Before Manual Smoke

Run:

```bash
pnpm --filter @repo/core check-types
pnpm --filter @repo/core test
pnpm --filter desktop build
```

If global `pnpm` or the default Node runtime cannot run Vitest because of a
local Rollup optional-native package issue, use the Codex bundled Node runtime
or the operator machine runtime and record the exact command.

Expected:

- `@repo/core` typecheck passes.
- `@repo/core` tests pass.
- Desktop app build passes, or the result is explicitly recorded as
  `BLOCKED_ENVIRONMENT` / `BLOCKED_EXISTING_APP_ISSUE`.
- No unrelated dirty files are staged.

## Launch Gate

Run:

```bash
pnpm --filter desktop dev
```

Record:

- macOS version
- machine architecture
- Tauri app launch result
- active host mode
- whether `overlay_v2` is enabled
- screenshot or screen recording path, if available

## Manual Smoke Matrix

| ID | Scenario | Steps | Expected | Evidence |
|---|---|---|---|---|
| P2-HS-1 | Open Plugin Center | Use `Desktop Plugins > Open Plugin Center` from the macOS menu, then use it again while the window is open. | Plugin Center window opens; repeated open/focus does not create duplicates. | Pending |
| P2-HS-1A | Host mode native toggle | Use `Desktop Plugins > Enable Desktop Plugin Runtime (Restart Required)`, quit/relaunch, then use `Desktop Plugins > Disable Desktop Plugin Runtime (Restart Required)` and relaunch again. | Persisted `hostMode` changes between `overlay_v2` and `normal`; menu enable state flips; restart requirement is explicit. | Pending |
| P2-HS-2 | Built-in list status | Inspect built-in entries. | `organizer` and `sample-widget` are addable; `widgets` / `clipboard` / `calendar` / `pet` are planned or disabled and cannot be added. | Pending |
| P2-HS-3 | Add sample widget | Click add for `sample-widget`. | A device-local `PluginInstance` is created and a `grid_<instanceId>` window appears. | Pending |
| P2-HS-4 | Sample content routing | Inspect the created grid window. | Window renders Sample Widget content, not organizer fallback; title-bar drag area still works. | Pending |
| P2-HS-5 | Instance store persistence | Inspect `xai_plugin_instances_v1` after adding sample widget. | Stored instance has `pluginName=sample-widget`, `contentType=sample-clock-widget`, `syncScope=device-local`, and expected config. | Pending |
| P2-HS-6 | Focus plugin window | Focus sample widget from Plugin Center / adapter. | Existing plugin window becomes focused; no duplicate window appears. | Pending |
| P2-HS-7 | Move plugin window | Drag title bar or update config placement x/y and call adapter `update()`. | Window moves to the new coordinates and snapshot records the latest rect. | Pending |
| P2-HS-8 | Resize plugin window | Update size width/height from Plugin Center / adapter. | Window resizes to the new dimensions and snapshot records the latest size. | Pending |
| P2-HS-9 | Opacity native application | Set opacity below 1 and call create/update. | Window opacity changes; `nativeApplied.opacity=true` in the snapshot. | Pending |
| P2-HS-10 | Click-through native application | Set `clickThrough=true` and call create/update. | Click behavior is observed and recorded; `nativeApplied.clickThrough=true` if host applies it, otherwise a denied/error state is shown. | Pending |
| P2-HS-11 | Pinned native application | Set `pinned=true` and call create/update. | Window becomes always-on-top as Tauri mapping permits; `nativeApplied.pinned=true` if host applies it, otherwise a denied/error state is shown. | Pending |
| P2-HS-12 | All-spaces native application | Set `allSpaces=true` and call create/update. | Window visibility across Spaces is observed; `nativeApplied.allSpaces=true` if host applies it, otherwise a denied/error state is shown. | Pending |
| P2-HS-13 | Display placement fallback | On a two-display machine, set `displayId` and x/y for the secondary display. | Window lands on the expected display or records a documented fallback; no silent success claim for unsupported `displayId`. | Pending |
| P2-HS-14 | Space behavior | Move between macOS Spaces while sample widget is open. | Space behavior is recorded; all-spaces result matches `nativeApplied.allSpaces`. | Pending |
| P2-HS-15 | Restart restore | Add sample widget, quit app, relaunch, let restore run. | Enabled sample widget reappears using persisted placement, size, style and behavior. | Pending |
| P2-HS-16 | Disable preserves config | Disable sample widget, relaunch Plugin Center/runtime, inspect store. | Config remains stored; no plugin window auto-mounts while disabled. | Pending |
| P2-HS-17 | Hide preserves config | Hide sample widget, relaunch Plugin Center/runtime, inspect store. | Config remains stored; hidden instance does not auto-mount. | Pending |
| P2-HS-18 | Delete clears config | Delete sample widget, relaunch app, inspect store/list. | Instance and window are absent; config is removed. | Pending |
| P2-HS-19 | Reset position | Move sample widget, then reset position from Plugin Center. | Window returns to the default placement and store reflects the reset config. | Pending |
| P2-HS-20 | Close plugin window | Close the sample widget window. | Window closes; repeated close remains non-fatal. | Pending |
| P2-HS-21 | List windows | Create organizer and sample widget windows; call adapter `list()`. | List returns both instance ids with visible state and latest rects. | Pending |
| P2-HS-22 | Disallowed source denial | Invoke create/focus/close from a disallowed source label such as `grid_*`. | Runtime returns `WINDOW_CAPABILITY_DENIED`; no window mutation occurs; Plugin Center shows structured capability denial state. | Pending |
| P2-HS-23 | Invalid instance id denial | Try id with spaces or non-ASCII chars. | Adapter rejects with `INVALID_PLUGIN_INSTANCE_ID` before host invoke. | Pending |

## Evidence Format

Append a smoke result note in this same folder using:

```text
docs/reviews/desktop-plugin-platform-runtime/<YYYYMMDD>-phase2-host-smoke-result.md
```

Each result note must include:

```text
Branch:
Commit:
macOS version:
Machine:
Commands:
Automated gate:
Manual matrix:
Screenshots / recordings:
Failures:
Follow-ups:
Verdict: PASS | PARTIAL | FAIL | BLOCKED_ENVIRONMENT | BLOCKED_EXISTING_APP_ISSUE
```

## Claim Rules

- `PASS` requires all required P2-HS rows to be verified.
- `PARTIAL` is allowed only when the unverified rows are explicitly classified
  as environment-dependent fallback checks and each fallback is visible in the
  UI or snapshot.
- `BLOCKED_EXISTING_APP_ISSUE` is required when desktop build/typecheck cannot
  run because of unrelated App-lane dependency or type errors.
- A green TypeScript/Vitest result alone is not enough to claim native runtime
  completion.
- Do not start concrete plugin feature work from this checklist; it only gates
  the platform runtime.
