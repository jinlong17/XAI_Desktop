# Proposed Contract Changes

Future EventMap candidates:
- `ai-cube:privacy-reviewed` with `{ dataTypes, scope, secretsDetected, approved }`
- `ai-cube:mock-action` with `{ kind }`

Future secure command candidate:
- `ai_submit_with_privacy_gate(payload, review)` once real model calls exist.

## Propose: register `ai-cube.message` (2026-05-20)

Add to docs/contracts/data-repository-v0.md §3.1:

| `AiMessage` | `ai-cube.message` | `device-local` | `role`, `content`, `redacted` |

schemaVersion 1. device-local (transcripts never leave the device in the mock flow).
