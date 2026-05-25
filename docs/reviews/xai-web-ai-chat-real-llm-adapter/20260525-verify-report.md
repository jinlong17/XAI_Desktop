# Verify Report — xai-web-ai-chat-real-llm-adapter (gap-closure row #2)

| Field | Value |
|---|---|
| Date | 2026-05-25 |
| Executor | claude-sonnet-4-6 (feature-auto-build P5) |
| Status | READY_FOR_VERIFY (automated gates PASS; manual smoke gates PENDING human operator) |
| Feature | xai-web-ai-chat-real-llm-adapter |
| Commits | 86403e8 (P1), 6b910eb (P2), 9209aa4 (P3), d26b63e (P4) |
| Phase | P5 (end-to-end verify + cross-vendor checklist) |

---

## Automated Gate Results

| Gate | Command | Result | Evidence |
|---|---|---|---|
| G1 — plugin-web-ai-chat lint | `pnpm --filter @repo/plugin-web-ai-chat lint` (`--max-warnings 0`) | PASS | exit 0, 0 problems |
| G2 — plugin-web-ai-chat typecheck | `pnpm --filter @repo/plugin-web-ai-chat typecheck` | PASS | `tsc --noEmit` exit 0 |
| G3 — plugin-web-ai-chat test | `pnpm --filter @repo/plugin-web-ai-chat test` | PASS | 19 files, 146/146 cases pass |
| G4 — plugin-web-settings-rest lint | `pnpm --filter @repo/plugin-web-settings-rest lint` (`--max-warnings 0`) | PASS | exit 0, 0 problems |
| G5 — plugin-web-settings-rest test | `pnpm --filter @repo/plugin-web-settings-rest test` | PASS | 16 files, 93/93 cases pass (including AP1..AP12) |
| G6 — apps/web test | `pnpm --filter @repo/web test` | PASS | 20 files, 101/101 cases pass (including CSP1 guard) |
| G7 — apps/web build | `pnpm --filter @repo/web build` | PASS | vite v7.2.4, 788 modules, 0 errors |
| G8 — dist/_headers CSP entry | `grep "Content-Security-Policy" apps/web/dist/_headers` | PASS | `connect-src 'self' https://api.anthropic.com` present in emitted `dist/_headers` |

### G3 Detail (146/146 tests across 19 files)

| File | Tests | Cases |
|---|---|---|
| secretStore.test.ts | 8 | SC1..SC8 (IDB+WebCrypto round-trip, corruption, clear, version) |
| llmErrors.test.ts | 12 | LE1..LE12 (full classify matrix) |
| no-plaintext-key.test.ts | 1 | NP1 (AS3 invariant — no plaintext key in source) |
| llmProvider.test.ts | 6 | LP1..LP6 (provider resolution, model id map) |
| sseParser.test.ts | 8 | SP1..SP8 (buffer accumulation, DONE sentinel, comment skip) |
| claudeStreamAdapter.test.ts | 10 | CS1..CS10 (happy path, abort, 401, 429, null body) |
| claudeAdapter.test.ts | 8 | A1..A6 (no-key demo path) + A7 (with key → accumulate) + A8 (401 re-throw) |
| ErrorBanner.test.tsx | 5 | EB1..EB5 (per-kind banner copy + dismiss + countdown) |
| AiChatModule.test.tsx | 22 | I1..I23 (FIFO queue, streaming placeholder, FIFO ordering, settings nav, error banner events) |
| AiSidebar.test.tsx | 7 | SB1..SB7 |
| AiComposer.test.tsx | 9 | CO1..CO9 |
| AiThread.test.tsx | 8 | TH1..TH8 |
| AiAurora.test.tsx | 6 | AA1..AA6 |
| BreathingOrb.test.tsx | 3 | BO1..BO3 |
| starInstances.test.ts | 7 | S1..S7 |
| isAiConvoRecord.test.ts | 7 | V1..V7 |
| makeConvoFromUserText.test.ts | 7 | M1..M7 |
| registration.test.tsx | 5 | R1..R5 |
| index-barrel.test.ts | 7 | B1..B7 |

### G5 Detail (93/93 tests across 16 files in plugin-web-settings-rest)

New cases added this row: AP1..AP12 in `aiPane.test.tsx` (via vi.hoisted mock for aiKeyStorage):
- AP1: pane metadata (id="ai", icon="sparkle", i18nKey="settings.ai")
- AP2: renders without error
- AP3/AP4: EN/ZH bilingual labels
- AP5: provider picker has anthropic + openai-compatible options
- AP6: base URL field hidden for anthropic, shown for openai-compatible
- AP7: Save button disabled when key input empty
- AP8: typing key enables Save; clicking calls aiKeyStorage.saveKey
- AP9: Test Connection disabled when no saved key
- AP10: successful test shows "Connection OK"
- AP11: model picker has haiku/sonnet/opus options
- AP12 (HC1 guard): key input has type=password (never plaintext)

### G6 Detail (101/101 tests across 20 files in apps/web)

New cases added this row:
- CSP1 (csp.test.ts): connect-src includes https://api.anthropic.com
- CP1 updated: chassis length 13→14
- CP2 updated: aiPane added to CP2 assertion set
- CP3 updated: "ai" added to SUBSTITUTED_IDS in 3 test files
- AC-COMP-1 updated: 13→14

---

## CSP Amendment Evidence (HC9)

### Before (SHIPPED 2026-05-24):
```
connect-src 'self'
```

### After (2026-05-25):
```
connect-src 'self' https://api.anthropic.com
```

### ADR-0008 Amendment:
- Frontmatter: `Amendments | 2026-05-25 §S3 D3 + §S6 ...` row added
- §S3 D3: "Amendment 2026-05-25" subsection added with decision pattern table + binding extension rule for wave 2+3 CSP rows
- §S6: `_headers` content snippet updated to reflect new `connect-src`
- Source-text guard: `apps/web/src/__tests__/csp.test.ts` (CSP1) committed in same P4 commit

---

## HC1 Compliance Evidence (API Key Storage)

- `packages/plugin-web-ai-chat/src/internal/secretStore.ts` implements IndexedDB + WebCrypto AES-GCM-256 with PBKDF2-HMAC-SHA256 (600k iterations) KDF
- `aiPane.tsx` API key input has `type="password"` (AP12 guard)
- Test NP1 (`no-plaintext-key.test.ts`) asserts no plaintext API key string appears in any source file under `src/`
- No `localStorage.setItem` call for any key-like value in the new code
- `aiKeyStorage.saveKey` (mocked in tests) is the only persistence path for key data

---

## HC7 Compliance Evidence (Existing `completeChat` Signature)

- `packages/plugin-web-ai-chat/src/internal/claudeAdapter.ts` `completeChat(text: string, lang: Lang): Promise<string>` signature unchanged
- `streamCompleteChat` is a NEW export added alongside `completeChat`
- A1..A6 tests (no-key path) all pass unchanged — backward compat confirmed

---

## Manual Smoke Gates (PENDING — human operator required)

These gates require a real browser + an actual Anthropic API key. The automated
gates above confirm the code paths are correct; the manual smoke confirms end-to-end
real-LLM behavior. Operator MUST NOT commit the test API key; rotate/revoke after smoke.

| Gate | Description | Status |
|---|---|---|
| AS1 | Paste real Anthropic key in Settings → AI; send "hello" in /app/ai; observe SSE tokens incrementally in UI + DevTools Network (EventStream) | PENDING |
| AS2a | Delete key; send message; ErrorBanner "Please configure your API key" appears with working Settings link | PENDING |
| AS2b | Paste known-bad key; send; "Your API key was rejected" banner | PENDING |
| AS2c | Simulate 429 (rate-limit); observe countdown timer in ErrorBanner | PENDING |
| AS3 | DevTools Application → Local Storage: grep for `sk-ant` → zero matches; IndexedDB → `xai-web-ai-secrets` → binary ciphertext only | PENDING |
| AS5 | DevTools Console: happy-path message send produces zero `Refused to connect` CSP errors | PENDING |

---

## Cross-Vendor Checklist (PENDING — Codex gpt-5.5-thinking medium primary)

| Item | Description | Status |
|---|---|---|
| CV1 | Cold-read `secretStore.ts`: PBKDF2 KDF parameters correct? AES-GCM IV unique per save? | PENDING |
| CV2 | Cold-read `_headers` diff + ADR-0008 amendment: does CSP widen beyond LLM endpoint? Does ADR amendment record strictness delta + extension rule? | PENDING |
| CV3 | Cold-read `streamCompleteChat`: AbortSignal wired correctly? Error categorization covers all 5 LlmError kinds? | PENDING |

---

## Commit Attribution Review

| Commit | Scope | Convention |
|---|---|---|
| 86403e8 (P1) | `packages/plugin-web-ai-chat/` — secretStore + llmErrors + tests | Why/What/Scope/Risk/Docs/Tests format; Co-Authored-By present |
| 6b910eb (P2) | `packages/plugin-web-ai-chat/` + storage registry + core EventMap | Why/What/Scope/Risk/Docs/Tests format; Co-Authored-By present |
| 9209aa4 (P3) | `packages/plugin-web-ai-chat/` — AiChatModule + ErrorBanner + public surface | Why/What/Scope/Risk/Docs/Tests format; Co-Authored-By present |
| d26b63e (P4) | `packages/plugin-web-settings-rest/` + `packages/plugin-web-settings-shell/` + `packages/plugin-web-tokens/` + `apps/web/` + `docs/adr/` + `docs/PLUGIN_MAP.md` | Why/What/Scope/Risk/Docs/Tests format; Co-Authored-By present |

---

## Implementation vs Design/API/Test Contract

### Frozen Assumptions (FA-1..FA-10 per design.md §2026-05-25 Extension)

- **FA-1** (Anthropic primary, OpenAI-compat secondary): aiPane.tsx provider picker + llmProvider.ts two-branch resolution — HONOURED
- **FA-2** (completeChat signature unchanged): claudeAdapter.ts accumulates streamCompleteChat output; A1..A6 still pass — HONOURED
- **FA-3** (IDB+WebCrypto AES-GCM-256): secretStore.ts + SC1..SC8 — HONOURED (HC1)
- **FA-4** (SSE non-stream fallback): claudeStreamAdapter.ts null-body path yields demo string from demoReply.ts — HONOURED
- **FA-5** (5-kind LlmError): LlmError discriminated union + ErrorBanner per-kind copy — HONOURED
- **FA-6** (four new prefs, NO secrets in localStorage): plugin-web-storage registry has xai_ai_provider/base_url/model_default/streaming; key stored in IDB only — HONOURED
- **FA-7** (CSP amend-in-place ADR-0008): d26b63e amends §S3 D3 + §S6 + frontmatter + source-text guard — HONOURED (HC9)
- **FA-8** (rate-limit countdown in ErrorBanner): EB3 test + ErrorBanner RateLimited branch — HONOURED
- **FA-9** (Settings → AI pane navigation via emitWebEvent): AiChatModule handleOpenSettings emits web:shell:module-change {moduleId:"settings",detailId:"ai"} — HONOURED
- **FA-10** (no @tauri-apps/api imports): grep confirms zero tauri imports in new code — HONOURED

### api.md §12 Contract

- §12.1 streamCompleteChat — exported from index.ts, typed AsyncGenerator<StreamChunk> — HONOURED
- §12.2 secretStore version blob shape — secretStore.ts version:1 schema — HONOURED
- §12.3 LlmError union — BadKey/RateLimited/Network/Server/Malformed per llmErrors.ts — HONOURED
- §12.4 aiPane integration points — delegate to aiKeyStorage; usePref for 4 non-secret prefs — HONOURED
- §12.5 provider shape — resolveProvider returns url+headers+bodyBuilder per llmProvider.ts — HONOURED

---

## Residual Risks

- **R1 (manual smoke PENDING):** AS1..AS6 require real API key + real browser. Deferred to feature-verify + human operator.
- **R8 (dev vs prod CSP):** `pnpm dev` serves via Vite devServer which does NOT apply `_headers`. The CSP guard (CSP1) only validates the source file; manual smoke AS5 in DevTools (using `pnpm build && wrangler pages dev`) confirms the deployed CSP. Deferred to human operator.
- **R9 (OpenAI-compatible CSP gap):** If operator uses an OpenAI-compatible provider whose base URL is NOT `https://api.anthropic.com`, the CSP `connect-src` would block it. This is a known limitation — documented in aiPane.tsx desc field ("e.g. https://api.groq.com/openai/v1"). Follow-up row if base-URL providers need live use.
