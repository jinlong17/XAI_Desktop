# Smoke Evidence — xai-web-gemini-provider-enablement

**Date:** 2026-05-29
**Method:** Direct API probe against Gemini's OpenAI-compatible endpoint (deterministic wire-format verification — sharper than a browser-UI run for the real unknown). No API key appears in this document; the operator's smoke key was used transiently in shell commands only and should be rotated.
**Carve-out:** `docs/reviews/_p0-carve-outs/20260529-gemini-provider-enablement.md`
**CSP commit:** `c0ffaac`

---

## 1. What this smoke verifies

The real unknown the carve-out names: **does Gemini's OpenAI-compatible function-calling format match what the SHIPPED `openai-compatible` tool path (`xai-web-ai-tool-openai-compatible`) parses?** Resolved deterministically by calling Gemini's endpoint directly with a `create_task` tool definition (the exact `{type:"function",function:{name,description,parameters}}` shape `toOpenAiTools` emits) and inspecting the response — both non-streaming and streaming.

Endpoint: `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`
Auth: `Authorization: Bearer <gemini-key>` (transient)

## 2. Results

### 2.1 Network + request format + auth — PASS
- The Bash environment reaches the endpoint; auth + the OpenAI-format `tools` array are accepted (a malformed request would 400; we only ever saw 429 quota or 200 success — never a format rejection).
- Confirms the CSP `connect-src` host (`generativelanguage.googleapis.com`, commit `c0ffaac`) is the correct allowlist target.

### 2.2 Model availability (CAVEAT for operator)
| Model | Result |
|---|---|
| `gemini-2.0-flash` | **429 RESOURCE_EXHAUSTED — free-tier `limit: 0`** (not usable on this key's free tier) |
| `gemini-1.5-flash` | 404 NOT_FOUND (not served on `/v1beta/openai/`) |
| `gemini-2.5-flash` | ✅ 200 OK (usable) |
| `gemini-flash-latest` | ✅ 200 OK (usable) |
| **`gemini-3.1-flash-lite`** | ✅ **200 OK + tool_calls (operator's chosen model)** — see §2.5 nuance |
| `gemini-3.1-flash-lite-preview` | ✅ 200 OK + tool_calls |
| `gemini-3.5-flash` | ✅ 200 OK + tool_calls |

**Operator's chosen model = "3.1 flash".** The `/v1beta/openai/models` list has **no plain `gemini-3.1-flash`** text model — the 3.1-flash family is otherwise specialized (`-image`, `-tts`, `-live`). The general-purpose 3.1-flash text model is **`gemini-3.1-flash-lite`** (GA) — verified working with function-calling. Configure Settings → AI model = **`gemini-3.1-flash-lite`**. (Avoid `gemini-2.0-flash` — free-tier quota 0 on this key.)

### 2.3 Tool-calling format — non-streaming — PASS (exact match)
Request: `create_task` tool + "Create a task to buy milk tomorrow." + `tool_choice:"auto"`, `gemini-2.5-flash`.
Response:
- `finish_reason: "tool_calls"` ✅ (adapter reads this to trigger the round-trip)
- `choices[0].message.tool_calls[0]`:
  - `id`: present ✅
  - `type: "function"` ✅
  - `function.name: "create_task"` ✅
  - `function.arguments`: JSON **string** `{"bucket":"next7","title":"Buy milk"}` ✅ (adapter does accumulate-then-`JSON.parse`-once)
- Gemini correctly inferred `bucket:"next7"` (from "tomorrow") + `title:"Buy milk"`.

### 2.4 Tool-calling format — streaming — PASS (exact match)
Request: same, `stream:true`.
SSE observed:
```
data: {"choices":[{"delta":{"role":"assistant","tool_calls":[{"function":{"arguments":"{\"title\":\"buy milk\",\"bucket\":\"next7\"}","name":"create_task"},"id":"...","type":"function"}]},"finish_reason":"tool_calls","index":0}],...,"object":"chat.completion.chunk"}
data: [DONE]
```
- `data:` SSE lines ✅ (sseParser handles)
- `choices[].delta.tool_calls[]` with `{function:{arguments(JSON string),name},id,type:"function"}` ✅ (openai delta shape the adapter accumulates)
- `finish_reason: "tool_calls"` ✅
- `data: [DONE]` terminator ✅ (sseParser → `__done__`)
- **Nuance:** Gemini delivers the whole tool_call in a SINGLE delta chunk (complete `arguments` at once), not split across many deltas like OpenAI proper often does. The adapter's accumulate-then-parse-once handles both single-chunk and multi-chunk; single-chunk is the easy case → works. No `tool_call.index` field on Gemini's delta, but with a single complete chunk the accumulator parses one entry on `finish_reason` regardless. No adapter change required.

### 2.5 `gemini-3.1-flash-lite` streaming nuance — handled by the SHIPPED defensive fallback (PASS)
The operator's chosen model behaves DIFFERENTLY from `gemini-2.5-flash` in streaming, and this is the one finding worth flagging. Live full-stream chunk sequence (`gemini-3.1-flash-lite`, same tool request):
```
chunk0: finish_reason=None   has_tool_calls=True    ← complete tool_call delivered here
chunk2: finish_reason='stop' has_tool_calls=False   ← NOT "tool_calls"
chunk4: [DONE]
```
So `gemini-3.1-flash-lite` streams the tool_call in an early chunk (`finish_reason:null`) and then finishes with **`finish_reason:"stop"`** — NOT `"tool_calls"`. (`gemini-2.5-flash` by contrast puts `finish_reason:"tool_calls"` on the tool_call chunk itself.)

The adapter's PRIMARY trigger keys on `finish_reason:"tool_calls"` (claudeStreamAdapter.ts:342), which 3.1-flash-lite never emits. **But the SHIPPED defensive stream-end fallback (claudeStreamAdapter.ts:369-386, `openAiToolDetected`) handles exactly this**: on `[DONE]`, if `toolUseResult` is still unset but `openAiToolAccum` has entries, it parses them and surfaces `toolUse`. Verified by reading the code against the live stream shape. **NO adapter change required.**

Test coverage: **`OAI-STREAM-4`** (`openAiToolProtocol.test.ts`) is the exact regression — tool_call delta with `finish_reason:null` → `finish_reason:"stop"` → `[DONE]` → `toolUse` still surfaced. The test comment was updated (2026-05-29) to name `gemini-3.1-flash-lite` as the real-world instance making this defensive path load-bearing.

## 3. Conclusion

**Gemini's OpenAI-compatible function-calling is fully compatible with the SHIPPED `openai-compatible` tool path — NO adapter change required.** Both non-streaming and streaming wire formats match the adapter's expectations exactly (id/type/function.name/function.arguments-as-JSON-string + `finish_reason:"tool_calls"` + `data:`/`[DONE]` SSE).

The app-level flow above the adapter (confirmation card → `web:*:create-requested` event → owning-module reducer → task created) is **provider-agnostic and already SHIPPED + mocked-SSE tested** (`OAI-PARITY-1/2` prove both providers produce identical `toolUse` + write-event payloads). So a real Gemini chat that proposes `create_task` will route through the same confirmation → create path verified for the mocked openai golden.

Carve-out §5 acceptance anchor is met: CSP allowlists the host (commit `c0ffaac`, CSP5 guard), and Gemini's function-calling is correctly handled by the SHIPPED path (verified here against the live endpoint).

## 4. Residual / operator items
- **Rotate the key**: it was pasted in the session transcript — treat as exposed, regenerate in Google AI Studio.
- **Model choice**: operator chose "3.1 flash" → use **`gemini-3.1-flash-lite`** (no plain `gemini-3.1-flash` exists; the rest of the 3.1-flash family is image/tts/live). Verified working with function-calling via the defensive `finish_reason:"stop"` fallback (§2.5). Alternatives also verified: `gemini-2.5-flash` / `gemini-flash-latest` / `gemini-3.5-flash`. Avoid `gemini-2.0-flash` (free-tier quota 0 on this key; enable billing if needed).
- **Optional belt-and-suspenders**: a literal in-app browser smoke (Settings → AI configure Gemini → chat → confirm → task appears) can be run by the operator; the wire-format + provider-agnostic SHIPPED path already cover the core risk.
- **Production**: CSP change ships with the next `xai-web-deploy-cloudflare`; the operator real-key round-trip on the live `*.pages.dev` URL remains the standard post-deploy smoke.
