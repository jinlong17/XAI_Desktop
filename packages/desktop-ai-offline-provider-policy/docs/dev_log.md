# desktop-ai-offline-provider-policy - Dev Log

## Status Panel

| Field | Value |
|---|---|
| Workflow | FEATURE_DEV |
| Target | desktop-ai-offline-provider-policy |
| Title | Desktop AI Offline Provider Policy |
| Current Phase | FEATURE_VERIFY |
| Status | READY_FOR_VERIFY |
| Suggested Next | feature-verify |
| Automation Mode | B-Codex |
| Verify Cross-vendor | yes |
| Executor | feature-auto-build (Codex, gpt-5.3-codex inline fallback) |
| Updated | 2026-05-29 04:16 PDT |
| Brief | `docs/reviews/desktop-ai-offline-provider-policy/20260529-feature-brief.md` |
| Discovery Review | `docs/reviews/desktop-ai-offline-provider-policy/20260529-discovery-review.md` |
| Risks | Repo-side gates pass and the remaining blocker contract drift in `claudeAdapter` is repaired. Manual real-macOS offline/online toggle smoke remains an external release follow-up at verify/ship time. |
| Blockers | — |
| Review Notes | Repair scope only: removed `completeChat(...)` demo-success fallback for missing key and empty accumulation, aligned tests/metadata with fail-closed policy semantics, and kept local-LLM/Tauri-native bridge/bundled-model scope unchanged. |

## Naming Rationale

- Feature title: `Desktop AI Offline Provider Policy`
- Canonical feature name: `desktop-ai-offline-provider-policy`
- Why this name fits: the row is about policy, gating, and provider semantics for the shipped desktop AI stack, not a new chat module or a bundled local model runtime.

## Roadmap Context

- Manifest: `docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md`
- Row: `#15`
- Seed: `docs/reviews/desktop-ai-offline-provider-policy/20260528-roadmap-seed.md`
- Dependency baseline:
  - row `#9` `desktop-local-first-storage-adr` is `SHIPPED`
  - current desktop runtime wraps `apps/web` with `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`
  - `@repo/plugin-web-ai-chat` and `@repo/plugin-web-settings-rest` are already `Stable`

## Phase Plan

### Phase 1 - Policy contract and shared resolver

Status: DONE

- add a typed provider-policy resolver to `@repo/plugin-web-ai-chat`
- freeze current providers as online-required
- classify loopback/local-looking base URLs as explicit deferred/not-enabled state in this row

Exit gates:

- `pnpm --filter @repo/plugin-web-ai-chat test`
- `pnpm --filter @repo/plugin-web-ai-chat typecheck`

### Phase 2 - Chat/settings gating and explicit copy

Status: DONE

- update `AiChatModule` to fail closed instead of returning offline/demo-success output
- update Settings → AI to consume the same policy and disable test/send affordances consistently
- keep encrypted key storage unchanged

Exit gates:

- `pnpm --filter @repo/plugin-web-ai-chat test`
- `pnpm --filter @repo/plugin-web-settings-rest test`
- `pnpm --filter @repo/web test`

### Phase 3 - Integration audit and verification prep

Status: DONE

- rerun web/desktop build gates
- confirm no hidden Ollama/local dependency, no native AI bridge, and no unrelated Phase 3 scope leak
- record any manual real-macOS follow-up needed for verify

Exit gates:

- `pnpm --filter @repo/web build`
- `pnpm --filter desktop tauri build --debug --bundles app`

## Explicit Deferrals

- Actual Ollama/local-provider execution
- Local provider privacy dialog or daemon lifecycle UX
- New Tauri AI command surface
- AI Cube/native control-window redesign
- Calendar degraded mode, reconnect sync, backup/export/import, or repository work

## Review Focus

- Confirm the row should remove demo-success behavior for offline/unconfigured provider states.
- Confirm loopback/local URL detection belongs in this row as an explicit deferred/not-enabled state.
- Confirm `@repo/plugin-web-ai-chat` is the correct policy owner and `@repo/plugin-web-settings-rest` is only a consumer.
- Confirm no local-provider execution path is approved yet.

## Work Log

| Timestamp | Executor | Action | Commits | Tests | Next |
|---|---|---|---|---|---|
| 2026-05-29 03:48 PDT | feature-plan (Codex, gpt-5.4 inline fallback) | Fresh planning pass. Reviewed the roadmap seed, ADR-0011 and ADR-0012, the current Tauri runtime profile/build config, `@repo/plugin-web-ai-chat` adapter/settings/storage seams, and the legacy `plugin-ai-cube` docs to confirm scope ownership. Wrote the feature brief, discovery review, design snapshot, API contract, test strategy, and dev log. Recommended a shared provider-policy resolver that treats current cloud providers as online-required, replaces offline/demo-success behavior with explicit gating, and defers actual Ollama/local-provider execution until a later approved row with privacy/failure semantics. | — | Not run (planning docs only) | feature-review |
| 2026-05-29 03:53 PDT | feature-review (Codex, gpt-5 inline fallback) | Review pass complete. Confirmed the plan meets the seed constraints: no hidden Ollama/local dependency, explicit online-required handling for current providers, removal of offline/demo-success behavior, deferred loopback/local execution behind a not-enabled state, correct package ownership boundaries, and valid `typecheck` test gates for both target packages. Marked the row APPROVED for auto-build dispatch. | — | Not run (review/docs only) | feature-auto-build |
| 2026-05-29 04:02 PDT | feature-auto-build (Codex, gpt-5.3-codex inline fallback) | Phase 1 complete. Added a typed provider-policy resolver in `@repo/plugin-web-ai-chat` and enforced fail-closed policy checks before send/test fetches. `anthropic` and `openai-compatible` remain online-required in this row; loopback/local base URLs classify as explicit deferred/not-enabled. | `e00c6a1b` | `pnpm --filter @repo/plugin-web-ai-chat test` PASS; `pnpm --filter @repo/plugin-web-ai-chat typecheck` PASS | Phase 2 |
| 2026-05-29 04:04 PDT | feature-auto-build (Codex, gpt-5.3-codex inline fallback) | Phase 2 complete. Unified AI policy UX across chat/settings: Settings AI pane now consumes shared policy snapshots for deterministic test/send gating and explicit state copy, while chat error surfaces map policy outcomes to actionable fail-closed messages. No key-storage contract change and no local-provider execution path was introduced. | `8b497698` | `pnpm --filter @repo/plugin-web-ai-chat test` PASS; `pnpm --filter @repo/plugin-web-ai-chat typecheck` PASS; `pnpm --filter @repo/plugin-web-settings-rest test` PASS; `pnpm --filter @repo/plugin-web-settings-rest typecheck` PASS; `pnpm --filter @repo/web test` PASS | Phase 3 |
| 2026-05-29 04:05 PDT | feature-auto-build (Codex, gpt-5.3-codex inline fallback) | Phase 3 complete. Re-ran integration gates and audited scope boundaries. Web production build and desktop debug app bundle build both pass. Confirmed no hidden Ollama/local runtime dependency, no new native/Tauri AI command bridge, and no spill into calendar/sync/backup or overlay/control/grid roadmap rows. Manual real-macOS offline/online smoke remains for feature-verify/ship. | — | `pnpm --filter @repo/web build` PASS; `pnpm --filter desktop tauri build --debug --bundles app` PASS | feature-verify |
| 2026-05-29 04:10 PDT | feature-verify (Codex, gpt-5.4 inline fallback) | Verification blocked after commit audit and gate reruns. Reviewed `e00c6a1b`, `8b497698`, and `fd267fa6` against the brief/design/api/test contracts. Confirmed the active chat send path (`streamCompleteChat`) and Settings AI test path fail closed with explicit policy states, loopback/local URLs classify as deferred/not-enabled, `@repo/plugin-web-settings-rest` consumes the shared resolver, and no local-runtime/Tauri bridge/scope-leak changes were introduced. Blocked because the retained internal `claudeAdapter.completeChat(...)` still preserves demo-success behavior for missing-key and empty-accumulation cases, while `package.json` and `claudeAdapter.test.ts` still describe and assert that legacy behavior, contradicting this row's API contract and verify claims. | `e00c6a1b`, `8b497698`, `fd267fa6` | `pnpm --filter @repo/plugin-web-ai-chat test` PASS; `pnpm --filter @repo/plugin-web-ai-chat typecheck` PASS; `pnpm --filter @repo/plugin-web-settings-rest test` PASS; `pnpm --filter @repo/plugin-web-settings-rest typecheck` PASS; `pnpm --filter @repo/web test` PASS; `pnpm --filter @repo/web build` PASS; `pnpm --filter desktop tauri build --debug --bundles app` PASS | feature-build |
| 2026-05-29 04:16 PDT | feature-auto-build (Codex, gpt-5.3-codex inline fallback) | Repair pass for verify blocker only. Removed `completeChat(...)` demo-success fallback path: missing-key and policy-not-ready now fail closed through existing policy/LlmError flow; empty accumulation now throws `Malformed` instead of returning demo text. Updated package metadata wording and rewrote `claudeAdapter` tests to assert fail-closed semantics. No local LLM/Ollama dependency, no native/Tauri AI bridge, and no bundled model/installer changes were introduced. | `fix(plugin-web-ai-chat): remove demo-success fallback from completeChat` | `pnpm --filter @repo/plugin-web-ai-chat test` PASS; `pnpm --filter @repo/plugin-web-ai-chat typecheck` PASS | feature-verify |
