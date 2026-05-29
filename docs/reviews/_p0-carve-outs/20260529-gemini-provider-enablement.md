# P0 Carve-Out — xai-web-gemini-provider-enablement

**Date:** 2026-05-29
**Authority:** ADR-0010 §D4 — new feature plans require an explicit P0 carve-out commit; ADR-0008 §S3 D3 — `connect-src` allowlist amendments follow a binding-precedent pattern.
**Triggering evidence:** Operator provided a Gemini API key (2026-05-29) to exercise the SHIPPED AI tool layer end-to-end. Gemini is reachable via its OpenAI-compatible endpoint (the SHIPPED `openai-compatible` provider path), but its host is not in the CSP `connect-src` allowlist.
**Operator decision:** session directive 2026-05-29 — full Gemini enablement: CSP amendment + local smoke verification.

---

## 1. Background

The SHIPPED AI tool layer supports `anthropic` + `openai-compatible` providers. Gemini works through the openai-compatible path:
- provider = `openai-compatible`
- base URL = `https://generativelanguage.googleapis.com/v1beta/openai/`
- model = a Gemini id (e.g. `gemini-2.0-flash` / `gemini-2.5-flash`), passed through as-is by `llmProvider` (openai-compatible model is user-string pass-through)
- API key = operator's Gemini key, stored in the existing `secretStore`

The blocker: `apps/web/public/_headers` `connect-src` allowlists Anthropic/OSM/Notion/Google-OAuth/Linear but **not** `https://generativelanguage.googleapis.com`. In production (Cloudflare Pages enforces `_headers`), the browser blocks the Gemini fetch. (Local Vite dev does not enforce `_headers`, so a local smoke can validate compatibility without the CSP change — but production requires it.)

**Security note:** the operator's Gemini key was pasted in plaintext in the session transcript. It is treated as exposed → operator should rotate it after the smoke. This carve-out NEVER commits the key to any tracked file; the key is entered transiently into the running app's secretStore for the smoke only.

## 2. Scope

**`xai-web-gemini-provider-enablement`** — Realistic v1

### In scope
- **CSP amendment**: add `https://generativelanguage.googleapis.com` to `connect-src` in `apps/web/public/_headers` (Gemini's canonical OpenAI-compatible API host).
- **ADR-0008 §S3 amendment record**: append the connect-src extension per the binding-precedent pattern (same as the Anthropic/OSM/Notion/Linear/Stripe amendments).
- **Local smoke verification** (Preview MCP, transient key): configure provider=openai-compatible + Gemini base URL + a Gemini model + the key in Settings → AI; send a chat that triggers a tool (`create_task`); confirm the confirmation card → event → owning-reducer round-trip works AND Gemini's OpenAI-compatible function-calling format is correctly parsed by the SHIPPED openai tool path. This is the real unknown the smoke resolves.
- **Adapter fix IF the smoke reveals incompatibility**: if Gemini's openai-compatible function-calling diverges from the implemented format (e.g. streaming `tool_calls` delta shape, `finish_reason` value, argument encoding), apply a minimal adapter fix within `plugin-web-ai-chat/src/internal/`.

### Out of scope
- Gemini as a first-class provider (stays under the generic `openai-compatible` umbrella — no new `AiProviderKind`).
- Native Gemini API (non-OpenAI-compat) support.
- New model-picker UI for Gemini (user types the model string in the existing openai-compatible config).
- Committing the key / any secret. Cross-device sync.

### NOT triggered
- ADR-0011 / P1 reprioritization. New npm dep. New event channel / cross-plugin (the AI tool path is provider-agnostic + SHIPPED). `plugin-web-tokens`. `dev` branch.

## 3. Impact

### Modified
- `apps/web/public/_headers` — +`https://generativelanguage.googleapis.com` in `connect-src`.
- `docs/adr/0008-cloudflare-deploy-target-and-csp.md` — amendment record.
- (only if smoke reveals incompatibility) `packages/plugin-web-ai-chat/src/internal/` adapter — minimal Gemini-compat fix + test.

### Created
- This carve-out doc.
- Smoke evidence under `docs/reviews/xai-web-gemini-provider-enablement/` (verdict + console/network observations; NO key).

### NOT modified
- Other plugins, registry keys, events.ts, SHIPPED archives, ADR-0010, `dev`. The Anthropic path stays byte-stable.

## 4. Workflow path

carve-out commit → CSP amendment + ADR record (small, follows ADR-0008 §S3 binding-precedent — applied directly, not a full feature pipeline) → local smoke (Preview MCP, transient key) → if compat issue, minimal adapter fix + test → record evidence → ship (push CSP + any fix). Real production Gemini smoke after deploy = operator.

## 5. Acceptance anchor

Satisfied when: (1) `connect-src` includes `https://generativelanguage.googleapis.com` + ADR-0008 records the amendment; (2) a local smoke with the operator's Gemini key (via openai-compatible + Gemini base URL + model) successfully runs an AI chat that proposes a `create_task`, the user-confirms it, and a real task is created via the owning reducer — proving Gemini's OpenAI-compatible function-calling is correctly handled by the SHIPPED openai tool path (or, if not, a minimal adapter fix makes it so) — with no key committed and the Anthropic path unaffected.
