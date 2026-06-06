# Desktop Plugin Platform Runtime — Native Window Smoke Checklist

> Date: 2026-06-06
> Module: `plugin`
> Phase: P1B-3
> Status: checklist ready; native smoke not executed in this docs-only slice

## Purpose

This checklist is the manual macOS gate for claiming that the Desktop Plugin
window runtime is complete enough for Plugin Center wiring. Automated core tests
prove the TypeScript contract and adapter behavior, but they do not prove
NSWindow / Tauri runtime behavior.

Do not mark P1B complete until every required smoke row below has dated evidence.

## Scope

In scope:

- create plugin window
- focus plugin window
- move plugin window
- resize plugin window
- close plugin window
- list known plugin windows
- restore window rect from persisted `PluginInstance`
- display / Space fallback behavior
- opacity / click-through / pinned / all-spaces fallback behavior
- capability denial from disallowed source windows

Out of scope:

- Plugin Center visual design
- third-party plugin install
- concrete clipboard / widgets / pet feature behavior
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
codex/plugin/platform-runtime-phase1
```

Required commits on the branch:

```text
ed9c10e typed contract
78d7b86 manifest-to-center adapter
64c6434 device-local instance store
8958966 generic plugin window adapter
ec4f2d3 placement / behavior model
```

## Automated Gate Before Manual Smoke

Run:

```bash
pnpm --filter @repo/core check-types
pnpm --filter @repo/core test
pnpm --filter desktop build
```

If global `pnpm` is not available in the Codex shell, use the local package
manager/runtime available on the operator machine and record the exact command.

Expected:

- `@repo/core` typecheck passes.
- `@repo/core` tests pass.
- Desktop app build passes.
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
| P1B3-1 | Create plugin window | Create a `PluginInstance`; call adapter `create()` with placement x/y and size width/height. | A `grid_<instanceId>` window appears at the requested position and size. | Pending |
| P1B3-2 | Focus plugin window | Call adapter `focus(instanceId)` from an allowed source window. | Existing plugin window becomes focused; no duplicate window appears. | Pending |
| P1B3-3 | Move plugin window | Update config placement x/y; call adapter `update()`. | Window moves to the new coordinates. | Pending |
| P1B3-4 | Resize plugin window | Update config size width/height; call adapter `update()`. | Window resizes to the new dimensions. | Pending |
| P1B3-5 | Close plugin window | Call adapter `close(instanceId)`. | Window closes; repeated close remains non-fatal. | Pending |
| P1B3-6 | List windows | Create two plugin windows; call adapter `list()`. | List returns both instance ids with `visible=true` and latest rects. | Pending |
| P1B3-7 | Restart restore | Create window, persist `PluginInstance`, quit app, relaunch, restore via store + adapter. | Window reappears using persisted placement and size. | Pending |
| P1B3-8 | Disabled preserves config | Disable instance, relaunch Plugin Center/runtime, inspect store. | Config remains stored; no plugin window auto-mounts while disabled. | Pending |
| P1B3-9 | Delete clears config | Delete instance, relaunch app, inspect store/list. | Instance and window are absent; config is removed. | Pending |
| P1B3-10 | Disallowed source denial | Invoke create/focus/close from a disallowed source label such as `grid_*`. | Runtime returns `WINDOW_CAPABILITY_DENIED`; no window mutation occurs. | Pending |
| P1B3-11 | Invalid instance id denial | Try id with spaces or non-ASCII chars. | Adapter rejects with `INVALID_PLUGIN_INSTANCE_ID` before host invoke. | Pending |
| P1B3-12 | Opacity fallback | Set opacity below 1 and call adapter create/update. | Contract snapshot carries opacity; native-applied flag remains `false` until native bridge support lands. | Pending |
| P1B3-13 | Click-through fallback | Set clickThrough true and call adapter create/update. | Contract snapshot carries clickThrough; native-applied flag remains `false` until native bridge support lands. | Pending |
| P1B3-14 | Pinned fallback | Set pinned true and call adapter create/update. | Contract snapshot carries pinned; native-applied flag remains `false` until native bridge support lands. | Pending |
| P1B3-15 | All-spaces fallback | Set allSpaces true and call adapter create/update. | Contract snapshot carries allSpaces; native-applied flag remains `false` until native bridge support lands. | Pending |
| P1B3-16 | Multi-display placement | On a machine with two displays, set `displayId` and x/y for the secondary display. | Window lands on the expected display or records a documented fallback. | Pending |
| P1B3-17 | Space behavior | Move between macOS Spaces while plugin window is open. | Window behavior is recorded; all-spaces remains fallback unless native bridge support lands. | Pending |

## Evidence Format

Append a smoke result note in this same folder using:

```text
docs/reviews/desktop-plugin-platform-runtime/<YYYYMMDD>-native-window-smoke-result.md
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
Verdict: PASS | PARTIAL | FAIL
```

## Claim Rules

- `PASS` requires all required P1B3 rows to be verified.
- `PARTIAL` is allowed for known no-op fallback rows only when the contract
  carries the field and `nativeApplied.<field>` is explicitly `false`.
- A green TypeScript/Vitest result alone is not enough to claim native runtime
  completion.
- Do not start concrete plugin feature work from this checklist; it only gates
  the platform runtime.
