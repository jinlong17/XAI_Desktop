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

---

## 6. Scope extension (2026-05-29) — DEV-only env→secretStore seed bridge

Operator directive: manage the Gemini key in a single project file (`.env.local`) so "everything uses this one". Implemented as a DEV-only bridge — `.env.local` is the single local source of truth; the app auto-seeds it into the runtime stores on load.

### What
- `apps/web/src/dev/seedAiConfigFromEnv.ts` — `useDevAiConfigSeed()` hook. On app load (DEV only), reads `VITE_GEMINI_API_KEY` + `VITE_AI_PROVIDER` + `VITE_AI_BASE_URL` + `VITE_AI_MODEL` from `.env.local` and seeds `xai_ai_provider` / `xai_ai_base_url` / `xai_ai_model_default` prefs + `aiKeyStorage.saveKey("openai-compatible", key)` (encrypted secretStore). env is authoritative in DEV.
- `apps/web/src/App.tsx` — calls `useDevAiConfigSeed()` as a Shell-sibling in `AppInner` (alongside the AI subscribers).
- `apps/web/.env.local` (GITIGNORED — NOT committed) — AI config block added with a BLANK `VITE_GEMINI_API_KEY` (operator pastes their ROTATED key). Defaults: provider=openai-compatible, base_url=Gemini endpoint, model=`gemini-3.1-flash-lite`.

### Security — production-safety VERIFIED (2026-05-29)
The entire seed body is gated behind `import.meta.env.DEV`. A worst-case production build (`VITE_GEMINI_API_KEY=SENTINEL... pnpm --filter @repo/web build`) + grep of `dist/` confirmed:
- ✅ executing `.js` bundle contains NEITHER the key value (sentinel), the `VITE_GEMINI_API_KEY` reference, NOR the seed code — all tree-shaken out by the DEV gate.
- ✅ the key VALUE (sentinel) is absent from ALL artifacts including `.map` files.
- `vite.config.ts` uses `sourcemap: "hidden"` — maps are not referenced from the bundle / not served to end users (Sentry upload only); they carry source text (var names/comments) but NO key value.
- `.env.local` is gitignored (root `.gitignore` + `apps/web/.gitignore` `.env*`); the key is NEVER committed or pushed.

### Out of scope / NOT changed
- NO key value committed anywhere (operator pastes the ROTATED key into the gitignored `.env.local`).
- NO production env reads the key (the prod bundle has no seed code at all).
- NO new provider kind; NO Settings UI change (Settings → AI still works manually; env is just the DEV single-source convenience).

### Acceptance (§6)
Met when: with a key in `.env.local`, a DEV app load auto-configures the AI to Gemini (provider/base_url/model) + seeds the key into secretStore, so the user never re-enters it; AND a production build provably contains zero seed code / zero key reference / zero key value. Both verified 2026-05-29.
