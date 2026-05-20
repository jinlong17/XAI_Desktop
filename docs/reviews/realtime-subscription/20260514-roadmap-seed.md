# Roadmap Seed — realtime-subscription

> sync-v1 roadmap · feature #38 · wave W5 · Phase 5
> Source PRD: docs/planning/sub-prds/sync/PRD.md v0.6-DRAFT · dev-plan task(s): T-21, T-22, T-25
> Status hint: PENDING

## Requirement
Subscribe each account to its own Supabase Realtime channel `sync:<account_id>` and wire a client `RealtimeReceiver` that triggers `engine.pullSince()` on incoming messages. Ignore messages whose `originator_device_id == self`; on WebSocket disconnect, reconnect with exponential backoff and catch-up pull.

## Hard constraints
- Channel MUST use `supabase.channel(name, { config: { private: true } })` — Private Channels + Authorization is not optional (FR-SY-27 / H-I).
- Realtime payload is metadata-only `{ entity_type, entity_id, commit_seq, originator_device_id }` — never the encrypted blob; blob still travels via REST pull (FR-SY-28).
- Reconnect backoff: 1s, 2s, 4s, … capped at 60s; JWT-expiry forces proactive disconnect+reconnect (FR-SY-31 / L-04). Pull uses single global `account_commit_seq_cursor`, no entity_type param (FR-SY-29).
- Code boundary: business logic in `packages/plugin-account/` (RealtimeReceiver in `src/`); no Realtime logic in `apps/desktop/src/` (CLAUDE.md §Code Boundaries; codebase-orientation §6).

## Threat model binding
- PRD §2 T7 (Realtime channel snooping) — Private Channels + RLS on `realtime.messages` so user_B subscribing `sync:<user_A_id>` sees 0 messages.
- STRIDE Information Disclosure across the Realtime trust boundary.

## Acceptance signal
Integration test: user_B subscribing `sync:<user_A_id>` channel receives 0 messages; a write on one device surfaces on another device's UI within the FR-SY-30 latency budget (P95 < 5s); WebSocket drop triggers backoff + catch-up pull with no data loss.

## Dependencies (advisory — manifest is authoritative)
Depends On: hardening-admission-gate, realtime-private-channel-config. Blocked by #37 Phase 4.8 → Phase 5 gate.
