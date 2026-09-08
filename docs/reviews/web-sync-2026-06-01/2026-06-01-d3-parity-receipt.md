# D3 Parity Receipt — Web→Desktop sync gate (2026-06-01)

- **Skill:** `xai-web-to-desktop-sync` (ADR-0013 §D3)
- **Repo:** XAI_Desktop · **Branch:** `web` · **HEAD:** `3a6307a docs(web): 执行 doc-split 归并 — 看板/设置/番茄钟文档归位到 plugin-web`
- **Delta scope:** UNCOMMITTED working tree vs HEAD (43 changed files; ≈37 source/config)
- **Tier:** **W0 — web-only (record-only)**

```text
Parity Receipt
  Verdict:          NO_APP_CHANGE
  Web delta:        37-file uncommitted web batch on `web` @ HEAD 3a6307a — appearance fontScale persistence + PWA offline cache SW + CSP/provider allowlist (OpenAI/Groq/Gemini/Sentry) + OAuth/checkout route auth-gating + dashboard/board/matrix/calendar web-module fixes + web deploy live-auth wiring; no @repo/core, no native, no desktop importer.
  Desktop impact:   auth: no / offline: no / storage: no / native: no / window: no / release: no
  Required desktop work:  none
  Verification gates:     none (web build + web vitest are the Web-lane gates; no tauri build, no macOS smoke required)
  Next workflow:          record-only
  Parity status:          not-applicable
```

## Why W0 (highest-risk tier still web-only)

Highest-risk-wins evaluation of every shared-seam / desktop-runtime candidate:

- **No `@repo/core` change.** `git diff` contains zero `@repo/core/src` source edits. `rg` "matched" `packages/core/src/types/events.ts` only inside ownership *comments* that name web modules (e.g. `owner: plugin-web-ai-chat`); the file is **not** in `git diff --name-only` and is unmodified.
- **No desktop consumer of any changed package.** `apps/desktop` and every desktop plugin (`plugin-account|console|productivity|ai-cube|calendar|labels|project`) import **none** of the changed packages. `@repo/web-auth-device-session` and `@repo/plugin-web-storage` are consumed only by `apps/web/*` and sibling `plugin-web-*` / `xai-web-*` packages.
- **No native surface.** Zero Tauri / Rust / `src-tauri` files in the delta (W3 not applicable).
- **Offline = browser PWA, not desktop runtime.** `apps/web/public/sw.js` becomes a real cache-first service worker, but a service worker is a browser/Cloudflare-Pages primitive; the Tauri desktop shell does not load `apps/web/public/sw.js`. Offline behavior change is Web-surface-scoped → desktop offline axis = no.
- **Auth/storage edits are web-only-scoped.** `session.tsx` (auth storage-key clear) and `_headers`/`llmProvider`/`secretStore` (CSP host allowlist + provider abstraction) live in packages consumed only by the Web app; no desktop runtime path reaches them.
- **Release axis = no.** `deploy-web.yml` flips production `main` to `live` auth + adds `VITE_SUPABASE_*` secrets — this is **Web** release infra (Cloudflare Pages). It touches no desktop signing / updater / versioned desktop distribution, so W4 does not apply.

Per ADR-0013 §D3, W0 changes are recorded only; no flow to `desktop-next`, no `dev` touch, no branch creation.

## Evidence

| Changed path | Category | Desktop-consumed? | Tier signal |
|---|---|---|---|
| `apps/web/public/sw.js` | PWA service worker (offline cache-first) | No (browser/Pages primitive; Tauri does not load it) | W0 — web offline only |
| `apps/web/public/_headers` | Cloudflare Pages CSP (`connect-src` += openai/groq/sentry) | No (web deploy header) | W0 |
| `apps/web/src/__tests__/csp.test.ts` | CSP source-text guard (CSP6) | No (web test) | W0 |
| `apps/web/src/App.tsx` | Appearance `fontScale` localStorage persist + write-back | No (web shell) | W0 — web local-pref only |
| `apps/web/src/routes/router.tsx`, `RouteGateElements.tsx` | Auth-gate OAuth callback + Stripe checkout routes via `ProtectedAppRouteElement` | No (apps/web SPA routes) | W0 — web routing |
| `apps/web/src/dev/seedAiConfigFromEnv.ts` | Dev-only AI seed | No | W0 |
| `packages/web-auth-device-session/src/session.tsx` | `clearSessionStorage` removes storage-key + code-verifier; resolves default storage | Web-only consumers (`apps/web/*`, `plugin-web-ai-chat`, `plugin-web-settings-rest`) | W0 — no desktop importer |
| `packages/plugin-web-storage/src/internal/registry.ts` | Drop `"settings"` from default rail order | No desktop/desktop-plugin importer | W0 — web storage registry |
| `packages/plugin-web-ai-chat/src/internal/{secretStore,llmProvider,claudeStreamAdapter}.ts` (+ tests) | Provider abstraction; OpenAI-compatible origin allowlist matching CSP | Web-only (`plugin-web-*`) | W0 |
| `packages/plugin-web-board-views/*`, `plugin-web-countdown/*`, `plugin-web-settings-rest/*` | Web view/module fixes | No | W0 |
| `packages/xai-web-{calendar,cmdk,dashboard-grid,dashboard-widgets,matrix,meditation,tasks}/*` (+ tests) | Web module logic/persistence/UI fixes | No | W0 |
| `.github/workflows/deploy-web.yml` | Web prod deploy: `live` auth on `main` + `VITE_SUPABASE_*` secrets | No (Cloudflare Pages / web release infra) | W0 — not desktop W4 |
| `packages/core/src/types/events.ts` | **NOT modified** — only appeared via comment text match (`owner: …-web-…`) | n/a | excluded from delta |
| `CLAUDE.md`, `docs/PRODUCT_MODULE_MAP.md`, `docs/adr/0013-*.md`, `docs/workflow/project/branch-policy.json`, `.githooks/README.md` | Docs / governance / hooks | No | W0 — docs |

### Commands run (read-only)

- `git diff --stat` · `git diff --name-status` — 43 files, no `apps/desktop` / `src-tauri` paths.
- `git diff | grep -nE "@repo/core"` — empty (no core source change).
- `rg "@repo/web-auth-device-session" --type ts -l` and `rg "@repo/plugin-web-storage" … | grep -E "apps/desktop|plugin-{account,console,…}"` — no desktop-side importer.
- Inspected full diffs of `sw.js`, `_headers`, `csp.test.ts`, `App.tsx`, `router.tsx`, `RouteGateElements.tsx`, `session.tsx`, `registry.ts`, `secretStore.ts`, `llmProvider.ts`, `deploy-web.yml`.

**Receipt artifact:** `docs/reviews/web-sync-2026-06-01/2026-06-01-d3-parity-receipt.md`
