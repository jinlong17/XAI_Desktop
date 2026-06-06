# Roadmap Seed Brief - account-device-identity-contract

## Requirement

Define the shared account, device, session, role, and lifecycle contract used by Web, Mac Desktop, Desktop Plugin, Site, Admin Dashboard, and Workflow systems. This contract must align browser auth, desktop account orchestration, device registration, device revocation, recovery, and admin claims.

## Hard Constraints

- Preserve the existing device model: client device id, server `encryption_device_id`, per-device keypair, device wraps, active/revoked status, and device-bound API headers.
- Do not put service-role credentials, provider secrets, DEK/KEK material, master password, secret key, or device private key in browser-visible state.
- Admin Dashboard uses admin claims and server/admin APIs; ordinary Web Console sessions must not gain admin power.
- Site can offer account entry/status pages but cannot bypass the auth/device contract.

## Acceptance Signal

- A contract table defines identity fields, lifecycle transitions, product-surface access, revocation behavior, and admin role boundaries.
- The plan identifies gaps between `@repo/web-auth-device-session`, `packages/plugin-account`, sync-v1 device rows, and future admin APIs.
