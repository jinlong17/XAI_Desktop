# Desktop Plugin Platform Runtime — Phase 2 Host Smoke Result

> Date: 2026-06-06
> Module: `plugin`
> Branch: `codex/plugin/common-capabilities-phase2`
> Commit: this commit
> Verdict: PARTIAL

## Environment

- App bundle:
  `apps/desktop/src-tauri/target/debug/bundle/macos/X Desktop.app`
- Build command:
  `PATH=<Codex bundled node>:$PATH cargo tauri build --debug --features crypto --bundles app`
- Local app config:
  `$HOME/Library/Application Support/com.jinlong.desktop/app-config.json`

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
| P2-HS-1B | PARTIAL | Plugin Center window exists and is on-screen by CoreGraphics bounds. Visual content inspection was blocked because the active display capture showed the macOS lock/screen-saver surface, not the desktop UI. |

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
