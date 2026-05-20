# Web Security Baseline

Implemented:
- Content Security Policy in `next.config.js`.
- `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` headers.
- Local in-memory rate limit helper.
- React error boundary with Sentry placeholder logging.

Not implemented:
- Production Sentry DSN.
- Server-side distributed rate limiting.
- Remote auth session hardening.
