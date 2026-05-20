# G8-E1 Web Host Shell Feature Brief

## Scope

Build a browser-safe web host:
- `WebLayout` with side navigation and mobile bottom navigation.
- Routes for Home, Login, Console, and Settings.
- Capability stubs for Tauri-only APIs.
- Responsive console pages for todo list, project board, and settings.

## Runtime Strategy

The existing `apps/web` is a Next app, so this scaffold keeps Next instead of replacing it with Vite. Tauri commands are represented by `createTauriCapabilityStub`.

## Note on inherited test scripts (2026-05-20): the `test:rls`, `test:nonce`, `test:push`, `test:recovery`, `test:audit`, `test:protocol`, `test:rls-fuzz`, `test:rekey`, `test:onboarding-backfill` scripts and `apps/web/supabase/` directory predate Track C and were added by Track A's sync work. Track C does not maintain them.

## Cross-review fixes 2026-05-20

- Login mock button now displays an explicit browser-only auth scaffold alert.
- Clipboard capability stubs now use `navigator.clipboard` when available and report degraded status on permission/runtime failures.
