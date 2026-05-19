# grid-window-prototype — Test Plan

## Automated Checks

| Command | Purpose |
|---|---|
| `pnpm --filter @repo/plugin-organizer check-types` | Ensure the plugin public types still compile with existing multi-window hooks. |
| `pnpm --filter desktop build` | Ensure `GridWindow.tsx` compiles in the desktop host. |

## Manual / Deferred Runtime Evidence

Unattended mode cannot click through real Tauri windows or inspect DevTools logs, so runtime evidence is deferred.

Manual verification command:

```bash
pnpm --filter desktop tauri dev
```

Manual DevTools invocation:

```js
await window.__TAURI__.core.invoke("create_grid_window", {
  gridId: "alpha",
  rect: { x: 80, y: 140, width: 320, height: 220 },
});
await window.__TAURI__.core.invoke("create_grid_window", {
  gridId: "beta",
  rect: { x: 440, y: 140, width: 320, height: 220 },
});
```

Expected evidence:
- `grid_alpha` and `grid_beta` are both visible.
- Each window displays its own `gridId`, label, and rect/size.
- Clicking alpha's scoped-event button logs only an alpha payload in alpha's window console.
- Clicking beta's scoped-event button logs only a beta payload in beta's window console.
- Closing alpha does not close beta.

## Deferred Gates

- Real Tauri runtime window creation evidence.
- DevTools/log proof that alpha events are not delivered to beta.
- Cross-vendor review/verify in this serial Codex run.

