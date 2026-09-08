# G8-E3 Web Security Baseline Feature Brief

## Scope

Add baseline security controls:
- CSP and security headers through Next config.
- Local mock rate limiter.
- Error boundary with Sentry placeholder.
- Documentation for web security posture.

## Cross-review fixes 2026-05-20

- Moved CSP from static Next headers to middleware with a per-request nonce and removed `'unsafe-inline'`.
- Kept `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` in Next headers.
- Restricted error boundary console logging to non-production builds.
