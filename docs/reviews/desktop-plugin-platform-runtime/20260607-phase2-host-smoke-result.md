# Desktop Plugin Platform Runtime — Phase 2 Host Smoke Result

> Date: 2026-06-07
> Module: `plugin`
> Branch: `codex/plugin/common-capabilities-phase2`
> Commit: local working tree
> Verdict: PARTIAL

## Environment

- App bundle:
  `apps/desktop/src-tauri/target/debug/bundle/macos/X Desktop.app`
- macOS version: `26.5` (`25F71`)
- Machine: `arm64`
- App config:
  `$HOME/Library/Application Support/com.jinlong.desktop/app-config.json`
- WebKit localStorage database:
  `$HOME/Library/WebKit/com.jinlong.desktop/WebsiteData/Default/zY1rgVf3wyCnzerURLjlq_IcUyMRgHSr95snUz38siE/zY1rgVf3wyCnzerURLjlq_IcUyMRgHSr95snUz38siE/LocalStorage/localstorage.sqlite3`
- Temporary evidence directory:
  `/tmp/xai-plugin-phase2-smoke`

Local state cleanup after the smoke:

- `hostMode` was restored to `normal`.
- `xai_plugin_instances_v1` was restored to an empty snapshot:
  `{"schemaVersion":1,"instances":[],"updatedAt":"2026-06-07T09:00:08.753Z"}`.

## Automated Gate

Passed:

- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml window::tests::plugin --features crypto`
  - Result: 7 passed.
- `pnpm --filter desktop exec tsc --noEmit`
  - Result: passed after adding Plugin Center host-window diagnostics.
- `PATH="/opt/homebrew/bin:$PATH" cargo tauri build --debug --features crypto --bundles app`
  - Result: passed after aligning `@tauri-apps/api` to `2.11.0`.
- `pnpm --filter @repo/core test -- plugin-window-adapter plugin-instance-runtime plugin-center-runtime plugin-center`
  - Result: 4 files / 28 tests passed.
- `pnpm install --frozen-lockfile`
  - Result: passed after the Tauri API lockfile alignment.
- `node -e "JSON.parse(...)"` for `docs/workflow/project/dashboard-state.json`
  and `docs/workflow/project/module-classification.json`
  - Result: passed.
- `git diff --check`
  - Result: passed.

Preflight fix required:

- Fresh `cargo tauri build` initially failed because Rust `tauri` was locked at
  `2.11.2` while installed `@tauri-apps/api` was `2.9.0`.
- `pnpm view @tauri-apps/api version` reported `2.11.0`; `2.11.2` did not exist
  in the NPM registry.
- Updating workspace `@tauri-apps/api` importers to `^2.11.0` removed the
  mismatch and allowed the fresh debug bundle to build.
- `pnpm dashboard` was attempted, but this worktree's root `package.json` has no
  `dashboard` script. Dashboard sync is therefore limited to the tracked
  `dashboard-state.json` update and JSON validation in this run.

Existing warnings:

- Rust dead-code warnings in unrelated desktop modules remain present.
- Vite large chunk warnings remain present for the main Web and desktop-host
  bundles.

## Manual Matrix Evidence

| ID | Result | Evidence |
|---|---|---|
| P2-HS-1 | PASS | `Desktop Plugins > Open Plugin Center` opened `XAI Plugin Center` from the fresh debug bundle. CoreGraphics showed a Plugin Center window at `X=0`, `Y=34`, `Width=1728`, `Height=1020`. |
| P2-HS-1A | PASS | Native menu changed `hostMode` to `overlay_v2`, restart restored plugin windows, and the menu was used again to restore `hostMode` to `normal` after cleanup. |
| P2-HS-1B | PASS | AX tree exposed the packaged Plugin Center content: `DESKTOP PLUGIN PLATFORM`, `Plugin Center`, `Catalog`, built-in table rows, and Desktop Instances controls. The route was not the main Web NotFound page. |
| P2-HS-2 | PASS | Operator screenshot is recorded as PASS per instruction. AX cross-check showed `organizer` and `sample-widget` rows with `Add`; `widgets`, `clipboard`, `calendar`, and `pet` rows with `Locked`. |
| P2-HS-3 | PASS | AXPress on the second addable row (`Sample Widget`) changed the device store from 2 instances to 3 and created `plugin-instance-mq3jb6ol` with `pluginName=sample-widget`. |
| P2-HS-4 | PASS | With `overlay_v2` enabled, restored grid windows rendered sample content. AX hit-test inside the grid returned `SAMPLE` and `Desktop Widget`, proving sample content routing rather than organizer fallback. |
| P2-HS-5 | PASS | `xai_plugin_instances_v1` contained `plugin-instance-mq3jb6ol` with `pluginName=sample-widget`, `contentType=sample-clock-widget`, `syncScope=device-local`, placement / size / behavior / style config, and ISO timestamps. |
| P2-HS-6 | PASS | Plugin Center now exposes a per-instance `Focus` action. AXPress on `Focus` returned `press-error=0`; CoreGraphics still showed one sample grid window, so focus did not create a duplicate. |
| P2-HS-7 | PASS | Reset action invoked `update_grid_window`: stdout logged `Updated grid window: grid_plugin-instance-mq3jb6ol to (120, 120) size 240x180`; store placement and CoreGraphics bounds moved to `X=120`, `Y=120`. |
| P2-HS-8 | PASS | Native restore scenario created the sample window at `360,240` with `420x320`; later small-size restore created it at `240x180`. CoreGraphics bounds matched the persisted config. |
| P2-HS-9 | PASS | Opacity applied in real host: CoreGraphics alpha was `0.6000000238418579`, `0.8199999928474426`, and `0.7400000095367432` for opacity configs `0.6`, `0.82`, and `0.74`. |
| P2-HS-10 | PASS | A `clickThrough=true` sample window covered Plugin Center Add coordinates; AX hit-test at the covered point returned the underlying `Add` button. Plugin Center Host Windows list showed `Click-through: Applied` from the real `list_grid_windows` snapshot. |
| P2-HS-11 | PASS | `pinned=true` restore produced a grid window with CoreGraphics `layer=5`, while Plugin Center and main windows stayed at `layer=0`. |
| P2-HS-12 | PASS | `allSpaces=true` restore created the window without host error. Plugin Center Host Windows list showed `All Spaces: Applied` from the real `list_grid_windows` snapshot. |
| P2-HS-13 | BLOCKED_ENVIRONMENT | Current machine exposes only one built-in display (`Color LCD`, 3456x2234 Retina). No secondary display was available for real display placement smoke. |
| P2-HS-14 | BLOCKED_ENVIRONMENT | Space switching still lacks a repeatable all-spaces sample-window observation. Follow-up automation proved Mission Control exposes a named Spaces Bar, but `Ctrl` arrow shortcuts and app activation did not provide a reliable current-Space transition; AX click / press against Space buttons was not repeatable enough to use as PASS evidence. |
| P2-HS-15 | PASS | Restart restore with `overlay_v2` reopened enabled sample windows from store. Disabled and hidden restore runs produced no `Creating grid window` stdout and no sample grid window in CoreGraphics. |
| P2-HS-16 | PASS | Disable action changed lifecycle to `disabled`, preserved config, logged `Closed grid window`, and a relaunch did not auto-mount the instance. |
| P2-HS-17 | PASS | Hide action changed lifecycle to `hidden`, preserved config, logged `Closed grid window`, and a relaunch did not auto-mount the instance. |
| P2-HS-18 | PASS | Delete action removed all instances from `xai_plugin_instances_v1`; CoreGraphics showed no sample grid after cleanup. |
| P2-HS-19 | PASS | Reset action returned placement to `120,120`; store and CoreGraphics bounds matched the default placement. |
| P2-HS-20 | PASS | Disable / Hide invoked close and logged `Closed grid window: grid_plugin-instance-mq3jb6ol`; core tests also cover close command mapping. |
| P2-HS-21 | PASS | Plugin Center `Refresh Host Windows` AXPress returned `press-error=0`; Host Windows table displayed `plugin-instance-focuslist`, `grid`, `Visible`, rect `520,260 · 240x180`, and native state chips from real `list_grid_windows` output. |
| P2-HS-22 | PASS | Rust `window::tests::plugin` includes allowlist rejection for `grid_*` labels; core adapter tests reject disallowed source labels with `WINDOW_CAPABILITY_DENIED`. |
| P2-HS-23 | PASS | Core adapter test rejects invalid instance ids before host invoke with `INVALID_PLUGIN_INSTANCE_ID`. |

## Evidence Highlights

Fresh build evidence:

```text
Finished 1 bundle at:
  /Users/jinlong/.codex/worktrees/xai-plugin-platform-runtime/apps/desktop/src-tauri/target/debug/bundle/macos/X Desktop.app
```

Sample add evidence:

```json
{
  "id": "plugin-instance-mq3jb6ol",
  "pluginName": "sample-widget",
  "contentType": "sample-clock-widget",
  "lifecycleState": "enabled",
  "syncScope": "device-local"
}
```

Native restore evidence:

```text
🪟 Creating grid window: plugin-instance-mq3jb6ol at (360, 240) size 420x320
✅ Grid window created successfully: grid_plugin-instance-mq3jb6ol at (360, 240) size 420x320
id=7567 layer=5 alpha=0.6000000238418579 onscreen=1 bounds={Height=320; Width=420; X=360; Y=240}
```

Reset / close evidence:

```text
📐 Updated grid window: grid_plugin-instance-mq3jb6ol to (120, 120) size 240x180
🗑️ Closed grid window: grid_plugin-instance-mq3jb6ol
```

Hidden restore evidence:

```text
🎯 Legacy main overlay configured: level=-2147483602, click-through=YES
🎛️ Legacy control window configured: level=-2147483599, click-through=NO
```

No `Creating grid window` line appeared during disabled / hidden restore runs.

Focus / list diagnostics evidence:

```text
press at 1180,810 role=AXButton title=Focus value= err=0
press-error=0
press at 280,180 role=AXButton title=Refresh Host Windows value= err=0
press-error=0
y=1000 ... plugin-instance-focuslist ... Visible ... 260 ... 180 ...
         Placement Applied ... Click-through Applied ... All Spaces Applied
```

Space automation attempt evidence:

```text
current Space probe: ManagedSpaceID=3
System Events Ctrl+Right / Ctrl+Left probe: before=3, after_right=3, after_left=3
Mission Control AX tree exposed Spaces Bar buttons:
  Desktop
  Codex
  Terminal
  Cursor
  ...
AX click / AXPress against named Space buttons did not produce a repeatable
sample-window-across-Spaces observation.
```

## Failures / Gaps

- P2-HS-13 is blocked by current hardware: only one display is attached.
- P2-HS-14 is blocked by the current interactive environment: all-spaces native
  application is visible in the host snapshot, Mission Control exposes named
  Spaces, but this session could not produce a repeatable operator-grade Space
  switch / return sequence while observing the sample window.

## Follow-ups

1. Re-run P2-HS-14 with an operator-controlled Space switch and record
   whether the all-spaces grid remains visible after leaving and returning to
   the Desktop Space.
2. Re-run P2-HS-13 on a two-display machine.

## Operator Completion Checklist

Use the same debug bundle and keep `hostMode=overlay_v2`.

For P2-HS-14:

1. Seed or add an enabled `sample-widget` instance with
   `behavior.allSpaces=true`.
2. Open Plugin Center, restore the sample grid window, and confirm Host Windows
   shows `All Spaces Applied`.
3. Leave the Desktop Space using a real operator gesture, such as Mission
   Control or the trackpad Space swipe.
4. Record whether the sample grid remains visible in the destination Space.
5. Return to the Desktop Space and record whether the same grid instance is
   still visible and not duplicated.
6. Mark PASS only if the sample grid is visible across the Space transition and
   Host Windows still lists the same instance.

For P2-HS-13:

1. Attach a second display and confirm macOS reports more than one online
   display.
2. Move or seed the sample grid placement onto the secondary display.
3. Confirm CoreGraphics bounds and on-screen observation place the grid on the
   secondary display.
4. Mark PASS only if the grid appears on the target display and restart restore
   preserves that display placement.

## Verdict

`PARTIAL`: the real macOS host now proves Plugin Center content, Sample Widget
add-to-desktop persistence, grid sample rendering, restart restore, opacity,
pinned layer behavior, click-through native application, all-spaces native
application, real-host focus/list IPC output, reset / disable / hide / delete,
and denial contracts. It does not prove actual Space switching behavior or
secondary display placement in this environment.

Do not commit a `record phase2 host smoke pass` receipt, do not merge to
`desktop-plugin-next`, and do not unfreeze concrete plugin packages from this
result alone.
