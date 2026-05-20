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
