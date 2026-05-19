# G0.4 Finder DnD Path-First Evidence

## Status

BLOCKED in unattended Codex run. This matrix requires real Finder drag/drop evidence.

## Manual Setup

```bash
pnpm --filter desktop tauri dev
```

Create or open a Grid window and drop Finder items onto it.

## Matrix

| Item kind | Source example | Expected payload | Observed payload | gridId present | Evidence path | Result |
|---|---|---|---|---|---|---|
| File | pending | absolute file path | pending | pending | pending screenshot/log | BLOCKED |
| Folder | pending | absolute folder path | pending | pending | pending screenshot/log | BLOCKED |
| App bundle | pending `.app` | `.app` path or documented fallback | pending | pending | pending screenshot/log | BLOCKED |
| Alias | pending | resolved target path or alias path, explicitly recorded | pending | pending | pending screenshot/log | BLOCKED |

## Decision Fields

- Webview drop real path works: pending
- Native drop receiver needed: pending
- Security-scoped bookmark needed for MAS: pending
- Alias policy: pending

