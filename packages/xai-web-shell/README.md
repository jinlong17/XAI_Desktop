# @repo/xai-web-shell

Web Console host shell for the XAI SPA. Provides:

- `<Shell>` — composition of AppRail + Topbar + main slot
- `<AppRail>` — 4 rail positions, drag-reorder, bottom buttons
- `<Topbar>` — EN/ZH, Light/Dark/System, Comfortable/Compact, Settings icon
- `<AvatarMenu>` — direction-aware popover per rail position
- `<WebShellProvider>` + `useWebShell()` + `useWebModuleRegistry()` — slot/registry pattern

## Usage

```tsx
import {
  Shell,
  WebShellProvider,
  type WebModuleSlotRegistration,
} from "@repo/xai-web-shell";
```

## Documentation

- `docs/design.md` — Decision snapshot
- `docs/api.md` — Interface contracts
- `docs/test.md` — Test strategy
- `docs/dev_log.md` — Workflow state

## Constraints

- Public surface: `index.ts` only. Never import from `src/internal/`.
- Zero W2 plugin dependencies — all module slots registered at the host level.
- ADR anchor: `docs/adr/0007-xai-web-console-build-form.md §S4/§S6/§S7`
