# Discovery Review - desktop-ai-offline-provider-policy

## Reviewed Inputs

- `docs/reviews/desktop-ai-offline-provider-policy/20260528-roadmap-seed.md`
- `docs/adr/0011-p1-react-tauri-local-first-hybrid.md`
- `docs/adr/0012-phase3-local-first-storage.md`
- `docs/TECHNICAL_REQUIREMENTS.md`
- `docs/PLUGIN_MAP.md`
- `apps/desktop/src-tauri/tauri.conf.json`
- `apps/web/src/providers/AppProviders.tsx`
- `packages/plugin-web-ai-chat/src/AiChatModule.tsx`
- `packages/plugin-web-ai-chat/src/internal/claudeAdapter.ts`
- `packages/plugin-web-ai-chat/src/internal/claudeStreamAdapter.ts`
- `packages/plugin-web-ai-chat/src/internal/secretStore.ts`
- `packages/plugin-web-ai-chat/src/internal/llmProvider.ts`
- `packages/plugin-web-settings-rest/src/panes/aiPane.tsx`
- `packages/plugin-web-storage/src/internal/registry.ts`
- `packages/xai-web-ai-chat/docs/{design,api,test,dev_log}.md`
- `packages/plugin-ai-cube/docs/dev_log.md`

## No External Research

No external research required. This row is an internal policy and contract decision over already-shipped repo surfaces, not a new library or vendor selection exercise.

## Current State

The active desktop product surface is the `apps/web` module graph running inside Tauri. `apps/desktop/src-tauri/tauri.conf.json` builds that surface with `VITE_WEB_AUTH_MODE=mock-authenticated` and `VITE_WEB_RUNTIME_PROFILE=desktop-phase1-offline`, while Tauri itself keeps `app.security.csp = null`. That means desktop AI behavior is ultimately controlled by app code, not by the deployed web `_headers` CSP file.

`@repo/plugin-web-ai-chat` is the current runtime owner for desktop AI chat. It already ships:

- provider prefs for `anthropic` and `openai-compatible`
- encrypted API-key storage via `aiKeyStorage`
- a streaming adapter and typed AI error events
- Settings → AI controls in `@repo/plugin-web-settings-rest`

But its offline behavior is still Phase-1 flavored:

- `streamCompleteChat(...)` returns a demo reply immediately in `desktop-phase1-offline`
- `completeChat(...)` also returns a demo line when no key exists
- `aiPane` disables Test Connection offline, but the chat/send path and provider configuration state are not expressed through one shared policy surface

`plugin-ai-cube` is not the correct owner for this row. ADR-0011 explicitly says the current desktop line reuses the web AI chat surface and only revisits native AI surfaces later if needed.

## Problem Framing

Phase 3 needs a predictable answer to three questions:

1. What does "AI available" mean when the desktop runtime is offline?
2. How should the app treat the existing `openai-compatible` setting when the URL looks like a local provider such as Ollama?
3. Which layer owns those rules so chat send, test connection, and settings copy do not drift apart?

The current demo fallback answers none of those cleanly. It preserves UI continuity, but it also makes offline and unconfigured states look like successful provider completions.

## Options

### Option A - Add a typed provider-policy seam and treat current providers as online-required

Create a shared policy resolver in `@repo/plugin-web-ai-chat`, consume it from both `AiChatModule` and Settings → AI, and block real provider operations whenever the policy is not `ready`. Keep `anthropic` and existing `openai-compatible` behavior as online-required. If the configured base URL looks loopback/local, classify it as explicit deferred/local-not-enabled state rather than silently attempting it.

Pros:

- fixes the current demo-success ambiguity
- keeps desktop and web AI state consistent through one resolver
- avoids relying on CSP as the safety boundary for desktop, which is important because Tauri `csp` is null
- preserves current storage and settings seams
- keeps local-provider support explicit and opt-in for a later row

Cons:

- introduces new policy types and UI states without adding new provider capability
- users who hoped the existing `openai-compatible` field already implied Ollama support will now get an explicit "not enabled" message

### Option B - Patch copy only and keep the existing demo/offline adapter behavior

Keep the current `streamCompleteChat(...)` and `completeChat(...)` shortcuts, update some banner text, and maybe disable a few buttons.

Pros:

- smallest code delta
- minimal API surface change

Cons:

- preserves the core ambiguity: offline can still look like successful AI output
- send/test/config logic remains split across separate code paths
- does not address the desktop-specific risk that loopback/local endpoints may still be reachable outside web CSP assumptions

### Option C - Approve Ollama/local-provider execution now

Use the existing `openai-compatible` shape or a new provider id to allow local endpoints such as `http://127.0.0.1:11434/v1` in this row.

Pros:

- would satisfy the most ambitious reading of "optional local provider"
- could reuse some existing base-URL plumbing

Cons:

- too much hidden scope for this row: endpoint allowlist, timeout behavior, daemon-not-running UX, privacy disclosure, and desktop/browser transport differences all need freezing first
- easy to turn into an accidental hidden dependency because settings already contain a generic base-URL field
- encourages users to infer support before verifyable semantics exist

## Recommendation

Choose Option A.

This row should make current provider behavior explicit and fail closed. It should not approve executable local-provider support yet. Instead:

- `anthropic` stays online-required
- `openai-compatible` stays online-required unless and until a later row explicitly approves a local-provider path
- loopback/local-looking base URLs are detected and surfaced as deferred/not-enabled rather than silently treated as ready

That satisfies the roadmap requirement without widening the runtime unexpectedly.

## Recommended Build Shape

1. Add a public policy helper to `@repo/plugin-web-ai-chat` that derives provider state from:
   - runtime profile
   - browser online/offline signal
   - selected provider
   - configured base URL
   - presence of saved key
2. Update `AiChatModule` and `aiPane` to consume that helper for consistent state/copy.
3. Make `streamCompleteChat(...)` and `aiKeyStorage.testConnection(...)` fail closed on non-ready policy instead of returning demo-success behavior.
4. Detect loopback/local base URLs and classify them as "local provider not enabled" in this row.
5. Keep all local-provider execution details deferred to a later approved row.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Desktop still reaches local endpoints through generic fetch behavior | enforce policy in app code before fetch; do not rely on web CSP for desktop because Tauri `csp` is null |
| Policy drift between chat UI and settings UI | expose one shared helper from `@repo/plugin-web-ai-chat` public surface |
| Existing tests only cover transport/network errors | add policy-state tests for offline, no-key, no-base-url, and loopback/local candidate config |
| Scope drifts into native bridge or bundled local runtime | keep local-provider support documentation-only and explicitly out of scope |
| Users interpret existing `openai-compatible` as officially supported Ollama | add explicit copy that local-provider execution is not enabled in this row |

## Review Focus

- Is Option A conservative enough while still meeting the acceptance signal?
- Should loopback/local URL detection be part of this row's contract?
- Is `@repo/plugin-web-ai-chat` the correct owner for the shared policy helper, with `@repo/plugin-web-settings-rest` as a consumer only?
- Should the row remove demo replies entirely for offline/unconfigured states, or keep them only behind a clearly labeled non-provider preview mode?
