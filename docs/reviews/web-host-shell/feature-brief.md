# G8-E1 Web Host Shell Feature Brief

## Scope

Build a browser-safe web host:
- `WebLayout` with side navigation and mobile bottom navigation.
- Routes for Home, Login, Console, and Settings.
- Capability stubs for Tauri-only APIs.
- Responsive console pages for todo list, project board, and settings.

## Runtime Strategy

The existing `apps/web` is a Next app, so this scaffold keeps Next instead of replacing it with Vite. Tauri commands are represented by `createTauriCapabilityStub`.
