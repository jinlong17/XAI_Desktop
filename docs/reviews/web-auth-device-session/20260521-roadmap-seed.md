# Roadmap Seed — web-auth-device-session

> web-ticktick-parity roadmap · feature #6 · wave W3 · auth/session
> Source PRD: docs/planning/sub-prds/web/PRD.md §5.1 · dev-plan Week 1
> Status hint: PENDING

## Requirement

Implement browser auth and app-device session foundations: email signup/login/verify/reset, Apple/Google OAuth PKCE, same-origin `next` allowlist, Supabase custom IndexedDB token storage, route guards, `device_register`, heartbeat, and local device id persistence.

## Hard constraints

- Token storage follows the PRD threat model: IndexedDB + WebCrypto wrapping protects disk/cross-user access but does not claim XSS resistance.
- Every business RPC and `/sync/*` call after registration must carry `X-Device-Id`; revoked/unknown devices must be treated as auth failures.
- OAuth `state` and `code_verifier` stay in `sessionStorage`; open redirects are rejected.

## Acceptance signal

Local Web can sign up/log in, survive browser restart through custom storage, register/heartbeat a device, and enforce `/app/*` auth routing with tests for PKCE and redirect safety.

## Dependencies (advisory — manifest is authoritative)

Depends On: web-sync-crypto-contract-preflight, web-release-site-archive-vite-shell.
