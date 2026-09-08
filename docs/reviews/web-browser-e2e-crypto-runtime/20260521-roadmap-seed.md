# Roadmap Seed — web-browser-e2e-crypto-runtime

> web-ticktick-parity roadmap · feature #7 · wave W3 · browser crypto
> Source PRD: docs/planning/sub-prds/web/PRD.md §5.1.1, §5.12, §8.2 · dev-plan Week 4
> Status hint: PENDING

## Requirement

Build the browser-side E2E crypto runtime: master-password challenge, Argon2id KEK derivation, encrypted DEK unwrap, non-extractable `CryptoKey` lifecycle, AES-GCM helper APIs, best-effort sensitive buffer handling, idle lock, and RFC/vector gates agreed by the contract preflight.

## Hard constraints

- KEK/DEK never land in localStorage, IndexedDB, cookies, logs, Sentry payloads, or serialized React state.
- The implementation must document JavaScript zeroization limits and use `Uint8Array.fill(0)` only as best effort.
- Crypto vectors must be runnable locally without live Supabase.

## Acceptance signal

Master password unlock and idle lock work locally, vector tests pass, and downstream driver/cache rows can call a stable browser crypto interface.

## Dependencies (advisory — manifest is authoritative)

Depends On: web-sync-crypto-contract-preflight, web-release-site-archive-vite-shell.
