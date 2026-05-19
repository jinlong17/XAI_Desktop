# G0.2 Grid Window Prototype Evidence

## Automated Status

- Implementation path: `apps/desktop/src/windows/GridWindow.tsx`
- Existing command reused: `create_grid_window(gridId, rect)`
- New Tauri command: none
- EventMap change: none
- Contract doc update required: no

## Manual Verification

Run the desktop app:

```bash
pnpm --filter desktop tauri dev
```

Open DevTools on the main window and run:

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

Expected:

- `grid_alpha` and `grid_beta` both open.
- Each window displays `G0 Grid Prototype`.
- Alpha displays `gridId = alpha`; beta displays `gridId = beta`.
- Each window displays its own Tauri window label and rect/size.
- Clicking `Send Scoped Event` in alpha logs a `g0-grid-prototype:scoped-ping` payload with `gridId: "alpha"` only in alpha.
- Clicking `Send Scoped Event` in beta logs a payload with `gridId: "beta"` only in beta.
- Closing alpha does not close beta.

## Deferred Evidence

This unattended Codex run cannot open and inspect Tauri Grid windows. Manual DevTools/log proof remains deferred and must be attached here before G0.2 is treated as fully hardware-validated.

