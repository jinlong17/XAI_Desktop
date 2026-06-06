# Desktop Plugin Platform Runtime — Phase 2 Host Smoke Result

> Date: 2026-06-06
> Module: `plugin`
> Branch: `codex/plugin/common-capabilities-phase2`
> Commit: this commit
> Verdict: PARTIAL

## Environment

- App bundle:
  `apps/desktop/src-tauri/target/debug/bundle/macos/X Desktop.app`
- macOS version: `26.5.1` (`25F80`)
- Machine: `arm64`
- Build command:
  `PATH=<Codex bundled node>:$PATH cargo tauri build --debug --features crypto --bundles app`
- Local app config:
  `$HOME/Library/Application Support/com.jinlong.desktop/app-config.json`
- WebKit localStorage database:
  `$HOME/Library/WebKit/com.jinlong.desktop/WebsiteData/Default/fDxt0E4maT9hR3ez8lVozIzhnn1wE5O-Q7Nr5o5EeLA/fDxt0E4maT9hR3ez8lVozIzhnn1wE5O-Q7Nr5o5EeLA/LocalStorage/localstorage.sqlite3`

## Automated Gate

Passed:

- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml window::tests::plugin --features crypto`
- `PATH=<Codex bundled node>:$PATH cargo tauri build --debug --features crypto --bundles app`

Existing warnings:

- Rust dead-code warnings in unrelated desktop modules remain present.

## Manual Matrix Evidence

| ID | Result | Evidence |
|---|---|---|
| P2-HS-1 | PASS | `Desktop Plugins > Open Plugin Center` created an `XAI Plugin Center` window. CoreGraphics bounds after frame normalization: `X=0`, `Y=33`, `Width=1512`, `Height=888`. |
| P2-HS-1A | PASS | Native host-mode toggle changed `hostMode` to `overlay_v2`; disabling changed it back to `normal`. Menu enabled states flipped accordingly. |
| P2-HS-1B | PARTIAL | Plugin Center window exists and is on-screen by CoreGraphics bounds. A follow-up locked-screen recheck on 2026-06-06 06:07 PDT confirmed the packaged Plugin Center route initialized `xai_plugin_instances_v1` in WebKit localStorage as `{\"schemaVersion\":1,\"instances\":[],\"updatedAt\":\"2026-06-06T12:41:37.738Z\"}`. Visual content inspection was still blocked because the active display capture showed the macOS lock/screen-saver surface, not the desktop UI. |

## Locked-Screen Recheck

Attempt timestamp:

```text
2026-06-06 06:07:11 PDT
2026-06-06T13:07:11Z
```

Commands:

```bash
osascript -e 'tell application "X Desktop" to quit'
open -n "apps/desktop/src-tauri/target/debug/bundle/macos/X Desktop.app"
osascript ... click "Desktop Plugins > Open Plugin Center"
screencapture -x /tmp/xai-plugin-smoke/plugin-center-screen.png
swift -e 'CGWindowListCopyWindowInfo(...)'
sqlite3 "$HOME/Library/WebKit/com.jinlong.desktop/.../LocalStorage/localstorage.sqlite3" ...
```

CoreGraphics window evidence:

```text
owner=X Desktop name=XAI Plugin Center layer=0 alpha=1 bounds={Height=888; Width=1512; X=0; Y=33}
owner=X Desktop name=AI Smart Desktop layer=0 alpha=1 bounds={Height=720; Width=1280; X=116; Y=75}
```

LocalStorage evidence:

```json
{"schemaVersion":1,"instances":[],"updatedAt":"2026-06-06T12:41:37.738Z"}
```

Interpretation:

- Plugin Center native window creation remains reproducible from the macOS menu.
- The Plugin Center desktop-host route executed enough JavaScript to initialize
  the device-local plugin instance store.
- No `sample-widget` instance exists yet, so P2-HS-3 and later rows remain
  unverified.
- The screenshot still shows the macOS lock/screen-saver surface. This prevents
  honest visual claims for Plugin Center content, table controls, grid window
  content, dragging, resizing, Space movement, or click-through behavior.

## Failure Fixed In This Slice

Before the frame normalization fix, the Plugin Center window was created but not
visible on the captured display:

```text
owner=X Desktop name=XAI Plugin Center bounds={X=1760, Y=-1410, Width=6880, Height=1410}
```

Root cause:

- Plugin Center frame capture used physical `outer_position` / `outer_size`
  values as logical coordinates.
- Re-focusing an existing Plugin Center window reused the contaminated frame.

Fix:

- Convert captured Plugin Center position and size to logical coordinates using
  the window scale factor.
- Normalize Plugin Center frame size and position against the main window's
  current monitor before create / focus / get / set operations.

Post-fix evidence:

```text
owner=X Desktop name=XAI Plugin Center bounds={X=0, Y=33, Width=1512, Height=888}
```

## Remaining Smoke Work

Still pending:

- visual Plugin Center content check while the desktop is unlocked
- add `sample-widget` from Plugin Center
- verify persisted `PluginInstance`
- verify grid window content routing
- verify focus / move / resize / close
- verify restart restore
- verify opacity / click-through / pinned / all-spaces behavior
- verify multi-display / Space fallback behavior
- verify capability-denial UI state from disallowed source labels

## Verdict

`PARTIAL`: native menu entry, host-mode toggle and Plugin Center visible-window
placement now have real macOS evidence. Full host smoke remains open until the
foreground desktop UI can be visually inspected and the sample widget flow is run
end to end.
