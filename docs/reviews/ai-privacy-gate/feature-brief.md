# G7-E2 AI Privacy Gate Feature Brief

## Scope

Design and scaffold:
- Send-time privacy dialog with data types and scope.
- Redaction engine stub for passwords, API keys, tokens, and secrets.
- Mock approval flow before conversation sends.

## Non-goals

- No real model provider.
- No persistent audit log.
- No Track A EventMap edits.

## Proposed Events

Record future alignment in `proposed-contract-changes.md` if Track A opens contract changes.

## Cross-review fixes 2026-05-20

Expanded redaction coverage for:
- JWT
- GitHub PAT
- AWS access key
- Stripe secret/publishable key
- Slack token
- OpenAI key
- SSH private key block
- Bearer token
- Email address
- macOS home path
- Credit card with Luhn validation
- Existing password, API key, token, and secret assignment patterns

## Cross-review followups 2026-05-20

- Wired `packages/plugin-ai-cube` for Vitest and converted `redaction.test.ts` from inert `if (false)` assertions into executable Vitest cases.
- Reordered bearer token redaction before JWT redaction so `Bearer eyJ...` reports `bearer`, while bare JWTs still report `jwt`.
- Tightened the credit-card candidate regex so matches end on a digit and preserve surrounding text, including the space before following words.
