# G8-S3 Device Management Brief

## Goal

Expose paired devices and a remote revoke entry point for the web console and plugin-account package.

## Scope

- Device list page.
- Device card with device name, platform, app version, last seen, and revoke action.
- Mock transport matching the G9 device revoke contract.
- Reusable plugin-account device management helpers/components.

## Deferred Gates

- Hosted Supabase `device_revoke` RPC.
- Blocking re-key execution after revocation.
- Real multi-device runtime rehearsal.
