# Roadmap Seed — web-security-csp-sentry

> web-ticktick-parity roadmap · feature #20 · wave W11 · security/observability
> Source PRD: docs/planning/sub-prds/web/PRD.md §5.9, §5.12, §5.13, §9.5 · dev-plan Week 6/7
> Status hint: PENDING

## Requirement

Implement Web security and observability hardening: CSP Report-Only then enforce, nonce style handling, security headers, SRI/supply-chain checks, Sentry init/opt-in, source map upload flow, Web Vitals/RUM, and privacy redaction tests.

## Hard constraints

- CSP reports go to the self-owned scrub endpoint before any optional Sentry forwarding.
- Sentry payloads must not contain full entity ids, query strings with secrets, request bodies, encrypted blobs, tokens, or user content.
- Production source maps are uploaded and then removed from served artifacts.

## Acceptance signal

Local/staging checks show security headers, CSP report plumbing, Sentry release/redaction tests, and Web Vitals instrumentation are in place.

## Dependencies (advisory — manifest is authoritative)

Depends On: web-release-site-archive-vite-shell, web-auth-device-session, web-browser-e2e-crypto-runtime, web-console-host-router.
