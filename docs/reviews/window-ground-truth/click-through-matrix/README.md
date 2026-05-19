# G0.3 Click-Through Matrix

## Status

BLOCKED in unattended Codex run. This matrix requires real macOS hit-test evidence.

## Manual Setup

```bash
pnpm --filter desktop tauri dev
```

Use the G0.2 prototype windows (`alpha`, `beta`) or equivalent Grid windows.

## Matrix

| macOS | Display setup | macOSPrivateApi | Region | Expected | Observed | Evidence path | Result |
|---|---|---|---|---|---|---|---|
| 26.4 | built-in + DELL P2720DC | true | transparent blank area | Click reaches Finder/Desktop | pending | pending screenshot/log | BLOCKED |
| 26.4 | built-in + DELL P2720DC | true | Grid item area | React pointer event fires | pending | pending screenshot/log | BLOCKED |
| 26.4 | built-in + DELL P2720DC | true | resize handle | Resize handle receives pointer event | pending | pending screenshot/log | BLOCKED |
| 26.4 | built-in + DELL P2720DC | false | transparent blank area | Click reaches Finder/Desktop or fallback recorded | pending | pending screenshot/log | BLOCKED |
| 26.4 | built-in + DELL P2720DC | false | Grid item area | React pointer event fires | pending | pending screenshot/log | BLOCKED |
| 26.4 | built-in + DELL P2720DC | false | resize handle | Resize handle receives pointer event | pending | pending screenshot/log | BLOCKED |

## Decision Fields

- Native hit-test forwarding needed: pending
- DMG-only private API path needed: pending
- MAS fallback needed: pending
- Product fallback if unstable: pending

