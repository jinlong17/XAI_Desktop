# G8-S2 Account Login Brief

## Goal

Provide an RC-ready account login surface for the web console and plugin-account package.

## Scope

- Mock OAuth provider baseline.
- Passkey entry stub using WebAuthn API availability detection.
- Login page component in `apps/web/app/login`.
- Reusable `LoginPage` component export from `packages/plugin-account`.

## Deferred Gates

- Supabase Auth provider wiring.
- Real passkey challenge and assertion endpoints.
- Production session persistence.
