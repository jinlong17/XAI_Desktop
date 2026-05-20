# Track C Cross-Review (Claude)

| 字段 | 值 |
|---|---|
| Reviewer | Claude Opus 4.7 (cross-vendor) |
| Branch | `codex/track-c-widgets-web-ai` |
| Base | `744d578 feat(repository-v0-contract): freeze Repository v0 entity surface` |
| Range | 7 commits, ~3,493 insertions / 128 deletions / 102 files |
| Date | 2026-05-20 |

## Scope Reconciliation (read first)

The original review prompt contains two claims that **do not match the actual branch contents** — they appear to be carry-over from a stale draft. Correcting them up front so downstream summary tables are accurate:

| Prompt claim | Actual state on `codex/track-c-widgets-web-ai` |
|---|---|
| "Track C 修改了 packages/core-data/ 下约 12 个文件" | 2 source files (`index.ts`, `tauri-sqlite.ts`) + 1 test (`tests/tauri-sqlite.test.ts`) only. `entities.ts`, `repo-utils.ts`, `local-storage.ts`, etc. came from base 744d578, not from Track C. |
| "packages/plugin-labels/ 被三个 Track 都创建了" | Track C did **not** modify `plugin-labels` at all. The package was added in `a6bd997` before the divergence and is byte-identical across A/B/C. |
| "Track C 额外做了大量 G9 (Sync) 相关工作 — supabase-schema-migrations / nonce-lease-server / push-edge-function / rls-policies / rekey-two-phase / onboarding-backfill-ui / audit-log / commit-seq" | **None of these commits exist on Track C.** They live on other branches (sync-v1 anchors, likely merged elsewhere). `git log 744d578..codex/track-c-widgets-web-ai` returns only the 7 commits enumerated below. There is therefore no "G9 bonus work" to review on this branch. |

Track C's actual scope as observed:

| Commit | Sub-area | Lines |
|---|---|---|
| `5e96b72` feat(widgets) | G6 widget host + frame + store + 3 built-ins + personalization | ~700 |
| `a75bf33` feat(calendar) | G6 mini month / day timeline / widget registration | ~200 |
| `954409f` feat(pet) | G6 pet avatar / bubble / panel / persona / state machine scaffold | ~270 |
| `15a4c0a` feat(ai-cube) | G7 AI panel + privacy gate + cost guard + redaction + offline | ~370 |
| `7a6c8f1` feat(web) | G8 Next shell + IndexedDB + offline-first + CSP + rate-limit | ~600 |
| `9ae1b58` docs(track-c) | Track C log + 8 feature-brief drafts | ~470 |
| `92e2ba6` feat(core-data-sqlite-driver) | **Duplicate of Track A's `f3dd30b` (see §Isolation)** | ~700 |

## Quick verdict

- 5 plugin/app scaffolds (widgets / calendar / pet / ai-cube / apps-web) are coherent **scaffold-level** scope, well-named, with documented mock boundaries. They are **not** production-ready but were never claimed to be.
- The privacy-gate redaction in `plugin-ai-cube` is unsafe enough that the name is misleading.
- The IndexedDB adapter in `apps/web` is incompatible with Repository v0; **Web data layer migration debt** is the single largest follow-up.
- One commit (`92e2ba6 core-data-sqlite-driver`) is **out of Track C scope** and duplicates work Track A already shipped on `codex/track-a-desktop-foundation` (and progressed further with security hardening in `ad5f1d3`). It must be dropped on merge.
- Several roadmap files were edited on Track C with "Track A" attribution — content is mostly accurate but they conflict with the canonical Track A versions; Track C should not be writing these.

---

## Plugin: plugin-widgets

**Commit**: `5e96b72`
**Verdict**: **APPROVED** (scaffold)

### Strengths

- Clean package structure: `index.ts` as single public surface; `components/ hooks/ types.ts registry.ts` separation.
- `WidgetRegistry` + `WidgetManifestRegistration` provide an **extension contract** that other plugins (calendar, etc.) can register through without importing internals — this is the right shape for third-party widget registration.
- `WidgetEntity` correctly extends `RepoRecord` with `entityType: "widgets.widget"` and `syncScope: "device-local"`, matching the Repository v0 entity table.
- Personalization layer reduces to CSS custom properties (`--xai-widget-*`) so themes are tokenised, not hard-coded.

### Issues

- **[P1]** `WidgetHost` re-creates a new registry on every render (`createWidgetRegistry([builtInWidgetManifest, ...registrations])` outside `useMemo` at `WidgetHost.tsx:24`). On state updates this rebuilds every definition closure.
- **[P1]** `useWidgetStore` keeps **three** copies of widget state (localStorage, in-memory `Repo`, React `useState`) and the `hydrateRepo` call in the `useEffect` is fire-and-forget — `repo` may be stale when `addWidget`/`updateWidget` are first called, and `refreshFromRepo` overwrites `widgets` from `repo.list()` which has nothing if hydrate hasn't completed. Race condition by construction.
- **[P1]** `WidgetFrame.startMove` attaches `pointermove`/`pointerup` to `window` but **never removes the listeners** if the frame unmounts mid-drag (`end()` only runs if a `pointerup` actually fires on the captured target). Use `AbortController` or cleanup in `useEffect`.
- **[P1]** `createWidget` mixes `crypto.randomUUID?.()` with `Math.random().toString(36).slice(2)` fallback. In SSR / non-secure contexts the fallback is non-unique; collisions would corrupt the IndexedDB index.
- **[P2]** `position` not bounds-clamped against host size; once a widget is dragged off-screen the `+/-` resize buttons can't recover it.
- **[P2]** `WidgetHost` is rendered as inline overlay; the architecture (`docs/SYSTEM_ARCHITECTURE.md` §5.1) implies a future `widget_<id>` native window. No comment or design note explains where this surface is supposed to live in the multi-window topology.
- **[P2]** `manifest.json` has `"author": "Jinlong"` — recommend a generic team identifier for consistency with other plugin manifests.
- **[P2]** No vitest cases. `check-types` is blocked by missing `node_modules` workspace links (Track C log records this incident); not a code defect, but unverified.

### DataAdapter 兼容性

- Uses `createInMemoryRepo<WidgetEntity>` from `@repo/core-data` — **fully compatible** with Repository v0.
- Migration difficulty: **Low**. Swapping the in-memory repo for `createTauriRepo` (desktop) or an IndexedDB-backed Repo (web) is a single-line change.

### 文件隔离违规

- None. Self-contained under `packages/plugin-widgets/`.

### 建议的 next-step

- Add `useMemo` around the registry, hoist drag listeners to an effect with cleanup, and define the canonical state source (recommend: only the `Repo`; treat localStorage as a hydration source and React state as a render projection).

---

## Plugin: plugin-calendar

**Commit**: `a75bf33`
**Verdict**: **APPROVED** (scaffold)

### Strengths

- Three components (`CalendarMini`, `CalendarDay`, `CalendarWidget`) cleanly separated; mini is reusable and the widget composes mini + day.
- Event source taxonomy (`todo | pomodoro | habit | project | manual`) is a sensible aggregation contract for the future cross-plugin calendar view.
- `widgetRegistration.tsx` consumes `@repo/plugin-widgets`'s **public** `WidgetManifestRegistration` type — this is the documented extension path, not a back-door internal import.
- `createMockEvents` factory keeps the demo data inside the package; `useCalendarStore` does not silently leak it to a global.

### Issues

- **[P0]** `entityType: "calendar.event"` is **not in** `docs/contracts/data-repository-v0.md` §3.1 entity table. Adding a new entity type without updating the canonical table violates the contract's rule #1 ("entity 必须使用下表中固定的 dotted slug … 修改任何 entity 字段必须同步 schemaVersion 提升 + migration plan").
- **[P1]** Cross-plugin dependency: `package.json` lists `@repo/plugin-widgets` as a runtime dependency, not just a type peer. If `plugin-calendar` is enabled but `plugin-widgets` is not registered, `calendarWidgetManifest` becomes dead code at best, and bundle bloat at worst. Better long-term: move `WidgetManifestRegistration` to `@repo/core` so both plugins depend on the common surface, not on each other.
- **[P1]** `CalendarMini` weekday labels `["M","T","W","T","F","S","S"]` — both `T`s and both `S`s are ambiguous; failing accessibility (`aria-label`s missing) and minor i18n hostility.
- **[P2]** `CalendarMini.getMonthGrid` uses `date.toISOString().slice(0,10)` to derive ISO day. This is UTC-anchored; in negative-offset timezones (anywhere west of UTC) the leftmost day will be displayed as the **prior** local day. Use a local-timezone formatter.
- **[P2]** No tests; no `check-types` due to missing workspace links.

### DataAdapter 兼容性

- `CalendarEvent extends RepoRecord` correctly. But "calendar.event" is undeclared in the canonical entity registry — fix before adding a Repo binding.
- Migration difficulty: **Low** once the entity registration is added.

### 文件隔离违规

- None directly. But declaring `@repo/plugin-widgets` as a runtime dep means **the calendar package can't ship independently**. Recommend re-architecting via core.

### 建议的 next-step

- Add `calendar.event` row to `data-repository-v0.md` §3.1 (default `account-sync`, key fields `title/startsAt/endsAt/source/color`), then drop the runtime dependency on `plugin-widgets` by moving the registration type to `@repo/core` or `@repo/core-data`.

---

## Plugin: plugin-pet

**Commit**: `954409f`
**Verdict**: **APPROVED** (scaffold)

### Strengths

- `PetState = "idle" | "remind" | "interact" | "rest"` and `PetMood = "calm" | "focused" | "happy" | "sleepy"` cleanly split state-machine state from emotional skin.
- `PetEntity extends RepoRecord` with `syncScope: "device-local"` — a desktop pet is local-only by design.
- Non-intrusive UX: `hidden` flag with a re-show button; bubble is dismissible; persona overrides reminder copy.
- `PetPanel` is the only mounted root; everything else is leaf — easy to gate behind a future `pet_*` window label.

### Issues

- **[P0]** `entityType: "pet.pet"` is **not in** `data-repository-v0.md` §3.1. Same canonical-source violation as calendar.
- **[P1]** No state-machine **enforcement**. `setState(state)` accepts any value; nothing prevents `interact → rest → remind` cycles that the design doc implies should be guarded. A real FSM would table the allowed transitions.
- **[P1]** Cross-plugin communication uses `window.dispatchEvent(new CustomEvent("ai-cube:mock-action", …))` (in `plugin-ai-cube`, consumed implicitly here) — this **violates Red Line #3** ("Plugin 间通信必须通过 `@repo/core/events` 的类型安全事件"). Should use `@repo/core/events`'s typed bus.
- **[P1]** `usePetStore` hydrates from `localStorage` inside `useEffect`. If a parent passes a `seed` that is then overwritten by stored value, the seed contract is misleading. Documentation should clarify "seed wins on first run; storage wins thereafter".
- **[P2]** `PetAvatar` is ASCII (`o_o`) — placeholder, fine for scaffold; remove the "non-intrusive" claim until a real SVG/sprite lands.
- **[P2]** No tests; no `check-types`.

### DataAdapter 兼容性

- Correct `RepoRecord` extension; needs registration in the canonical entity table.
- Migration difficulty: **Low**.

### 文件隔离违规

- None. Plugin keeps to its own package.

### 建议的 next-step

- Promote the "states" to a proper transition table; switch the AI-cube ↔ pet channel to `@repo/core/events`; add `pet.pet` to the entity registry.

---

## Plugin: plugin-ai-cube

**Commit**: `15a4c0a`
**Verdict**: **REVISE** (scaffold-level naming is misleading; redaction must be hardened before any user trust is implied)

### Strengths

- Privacy gate is **mandatory**: `requestSend()` always sets `pendingReview`, so the dialog is the only path to `approveAndSend`.
- `CostGuard` exposes a real toggle for offline + a per-day call counter + a daily-limit knob (good UX guardrails).
- Mock conversation is **pure local** — no network call escapes the package even if the user clicks "Send mock request".
- Components are small, focused, and easy to swap.

### Issues

- **[P0]** **Redaction is dangerously thin.** The patterns in `redaction.ts` catch only:
  - `password|passwd|pwd: ...`
  - `sk-...` or `api[_-]?key: ...`
  - `token|secret: ...`

  They **miss** every realistic shape of secret I would expect a "privacy gate" to defend against — bare JWTs (`eyJ...`), bearer tokens, OAuth refresh tokens, GitHub PAT (`ghp_/ghs_/gho_`), AWS access keys (`AKIA[0-9A-Z]{16}`), Stripe (`sk_live_/pk_live_`), Slack (`xox[bpars]-`), SSH private key blocks (`-----BEGIN`), Base64 blobs > N bytes, credit cards, SSNs, email addresses, IP addresses, and macOS file paths leaking the home directory.

  Because the dialog is named "Review before sending" and `PrivacyReview.secretsDetected` is presented as authoritative, a user with "No mock secrets detected" can reasonably believe the gate works. Either rename to "Mock review (no real redaction)" or upgrade the patterns. This is the single most important issue in Track C.
- **[P0]** `entityType: "ai-cube.message"` not in `data-repository-v0.md`.
- **[P1]** `runSuggestion` dispatches `new CustomEvent("ai-cube:mock-action", {detail: {kind}})` directly on `window` — **violates Red Line #3** (use `@repo/core/events` typed bus).
- **[P1]** `useAiConversation.requestSend()` doesn't validate that `input` is non-empty. Empty input opens an empty review dialog.
- **[P1]** `mockResponse` and `useCostGuard` call `window.setTimeout` / `window.localStorage` at module load (via inline closures inside hooks called on first render). `useAiConversation` is **not marked `"use client"`** at the package boundary; consumers must remember to do so, or SSR crashes.
- **[P1]** `PrivacyGateDialog` is `position: fixed; inset: 0; z-index: 20` — in the desktop multi-window context this would overlay the wrong window if rendered in the main click-through overlay.
- **[P2]** `CostGuardState` has no day-rollover: once `usedToday >= dailyLimit`, `canSend` stays `false` forever unless the user manually flips the limit. Reset at local midnight on render.
- **[P2]** Zero tests for redaction patterns — silent regressions can ship.

### DataAdapter 兼容性

- Same pattern as the other plugins (`AiMessage extends RepoRecord`); needs entity-table registration.
- Migration difficulty: **Low** for messages; the **Privacy gate** itself doesn't persist anything yet.

### 文件隔离违规

- None.

### 建议的 next-step

- Either expand the redaction pattern set and add a vitest suite, or rename the gate to make its scaffold status explicit before any UI copy says "Privacy gate".
- Switch the cross-plugin signal to `@repo/core/events`.
- Add `"use client"` directive on the entry components and confirm SSR safety.

---

## App: apps/web

**Commit**: `7a6c8f1` (+ docs `9ae1b58`)
**Verdict**: **REVISE**

### Strengths

- **`pnpm --filter web check-types` PASS, `pnpm --filter web build` PASS** with 5 static pages (`/`, `/_not-found`, `/console`, `/login`, `/settings`) verified locally. This is the only Track C surface I could actually build.
- Real `Content-Security-Policy` + `X-Content-Type-Options: nosniff` + `Referrer-Policy: strict-origin-when-cross-origin` + `Permissions-Policy: camera=(), microphone=(), geolocation=()` wired in `next.config.js` (verified by `curl -I` in Track C's own log).
- `TauriCapabilityStub` returns a typed `CapabilityResponse` with `status: "available" | "degraded" | "unavailable"` — the right shape for a renderer-agnostic capability surface.
- `OfflineFirstStrategy` correctly writes local first, queues pending IDs, and only drains to remote when `navigator.onLine`.
- Responsive grid collapses at `1024px` (sidebar narrows) and `767px` (sidebar → bottom nav). Uses CSS container queries (`container-type: inline-size`).
- `ErrorBoundary` is wired around `main`.

### Issues

- **[P0]** CSP allows `'unsafe-inline'` for both `script-src` AND `style-src`. This effectively **disables CSP's XSS protection** — any reflected/stored XSS becomes exploitable again. Next.js can emit nonces; use `script-src 'self' 'nonce-{nonce}'` (or `'strict-dynamic'`) and either inline-style hashes or move inline styles out.
- **[P0]** `IndexedDBAdapter<T>` does **not** implement `Repo<T>` from `@repo/core-data`. It's a custom `DataAdapter<T>` with **only** `get/put/delete/list` — missing:
  - `listByIndex` (required by Repository v0 §3 testing contract)
  - `metadata` (required for migrations)
  - `transaction` (required)
  - `migrate` (required)
  - `entityType` filtering on `list`
  - Stable ordering query

  This is the **single largest piece of follow-up debt** in Track C. When Repository-v0-bound plugins (organizer, todo, etc.) want to run in the web shell, the adapter has to be rewritten or wrapped. Recommend: write a `createIndexedDbRepo` factory that satisfies `Repo<T>` and delete the custom interface.
- **[P1]** `OfflineFirstStrategy.delete` only goes to remote when online and **does not queue offline deletes**. If you delete a record offline, then reconnect, the record remains on the remote until something else triggers a write. Add deletes to `pending`.
- **[P1]** `OfflineFirstStrategy.get` falls back to remote on local miss but **does not hydrate local from remote**. A second offline session would still miss the record.
- **[P1]** `rateLimit.ts` uses a module-level `Map`. On Vercel Edge / serverless / Next dev hot-reload this resets per-instance — won't survive a fan-out. Worth a comment saying "best-effort dev only".
- **[P1]** `ErrorBoundary.componentDidCatch` calls `console.error` unconditionally — **violates Red Line #7** ("禁止使用 console.log 做生产日志"). Either guard with `process.env.NODE_ENV !== "production"` or wire it through the actual logging seam when one lands.
- **[P1]** `tauriCapabilityStub.invoke("clipboard_read_text"/"clipboard_write_text", payload)` reports `available: true` but does no real clipboard work — it just echoes `payload as T`. UI components calling this may believe the clipboard succeeded. Either downgrade `available` to `false` or actually invoke `navigator.clipboard.*`.
- **[P1]** `package.json` includes `test:rls / test:nonce / test:push / test:recovery / test:audit / test:protocol / test:rls-fuzz / test:rekey / test:onboarding-backfill` scripts pointing to `supabase/tests/*` — but `apps/web/supabase/` was **not added by Track C** (it predates the branch). These scripts shouldn't be presented as Track C deliverables in the dev log.
- **[P2]** `LoginPage` form is decorative — `<button type="button">` with no handler. Either mark "// scaffold only" inline or wire a `useFormStatus`.
- **[P2]** `globals.css` defines a media-query-based dark mode but also uses `var(--font-geist-mono)` that is loaded but never referenced; remove the import or use it.

### DataAdapter 兼容性

- `DataAdapter<T>` is **incompatible** with `Repo<T>`. See [P0] above.
- Migration difficulty: **Medium** — needs a real adapter that respects `RepoListQuery`, `transaction`, `listByIndex`, and the migration plan.

### 文件隔离违规

- None — `apps/web` is its own app.

### 建议的 next-step

- Replace `'unsafe-inline'` with nonces; reimplement `IndexedDBAdapter` as `createIndexedDbRepo<T>(): Repo<T>` against `@repo/core-data`'s contract; queue offline deletes and hydrate remote→local on get.

---

## Out-of-scope commit: `core-data-sqlite-driver` (`92e2ba6`)

**Verdict**: **MUST DROP ON MERGE**

This commit reproduces Track A's `f3dd30b feat(core-data-sqlite-driver)` byte-for-byte. Same author, same timestamp (`Wed May 20 00:32:29 2026 -0700`), same commit message, same diff. Track A then **progressed further** on `codex/track-a-desktop-foundation` with `ad5f1d3 feat(tauri-capability-allowlist)` which Track C's version lacks.

### Files touched (all owned by Track A's data/security thread)

| File | Track C version | Track A version | Severity |
|---|---|---|---|
| `apps/desktop/src-tauri/src/commands/database.rs` | 448 lines, no `DATABASE_ALLOWED_WINDOWS` enforcement | 480 lines, runtime allow-list `["main","control","account","console"]` + `grid_*` prefix + denial tests | **HIGH** — Track C is a security regression vs. Track A |
| `apps/desktop/src-tauri/src/commands/mod.rs` | Adds `database` module (feature-gated) | Identical | LOW |
| `apps/desktop/src-tauri/src/error.rs` | Adds `E1300/E1301/E1302` family | Identical | LOW |
| `apps/desktop/src-tauri/src/lib.rs` | Registers `db_*` commands + `DatabaseState` | Identical | LOW |
| `packages/core-data/src/index.ts` | `+2` exports (`createTauriRepo`, `dbInit`) | Identical | LOW |
| `packages/core-data/src/tauri-sqlite.ts` | 167 lines | Identical | LOW |
| `packages/core-data/tests/tauri-sqlite.test.ts` | Identical | Identical | LOW |
| `docs/contracts/tauri-commands-v0.md` | Adds `§6.1 Database Commands` | Track A version is **more advanced** — also expands `§4 File / Open Commands` with `reveal_in_finder` / `open_path` runtime allow-list | MEDIUM — drop Track C's §6.1, keep Track A's |
| `packages/core-data-sqlite-driver/docs/dev_log.md` | Sets status `READY_TO_SHIP` (Track A executor attribution) | Same status, same content | MEDIUM — merge conflict guaranteed |
| `docs/workflow/roadmap/xai-g1-native-foundation.md` | Promotes G1.2 / G1.4 / G1.5 rows | Track A has its own canonical edits | MEDIUM — keep Track A's |
| `docs/workflow/roadmap/xai-g2-data-security-foundation.md` | Promotes G2.2-G2.6 rows | Track A has its own canonical edits | MEDIUM — keep Track A's |
| `packages/multi-grid-event-scope/docs/dev_log.md`, `packages/grid-shell-organizer-content/docs/dev_log.md` | Sets status `SHIPPED` with Track A attribution | Track A has its own canonical edits | LOW — keep Track A's |

### Why this matters

Track C's own `xai-v1.track-c-log.md` ends with the claim:

> **"No Track A owned contract or core type files were modified."**

The 92e2ba6 commit makes that claim false: `apps/desktop/src-tauri/*`, `packages/core-data/*`, `docs/contracts/tauri-commands-v0.md`, and the entire roadmap manifest are Track A's owned surface. Either (a) the commit was added after the log was written, or (b) the log is wrong on purpose. Either way, the human merger needs to know.

### Recommended merge action

1. Drop `92e2ba6` from Track C entirely (e.g. cherry-pick the other 6 commits to a new branch, or `git rebase -i` and skip it).
2. Merge Track A's `codex/track-a-desktop-foundation` first; it already contains everything `92e2ba6` introduces and adds the window-allowlist guard.
3. Then merge the remaining 6 Track C commits — they touch only `packages/plugin-{widgets,calendar,pet,ai-cube}/` and `apps/web/`, which Track A does not modify.

---

## G9 Bonus Work Review

**Verdict**: **NOT APPLICABLE — does not exist on this branch**

The prompt asks me to evaluate G9 (Sync) work — `supabase-schema-migrations`, `nonce-lease-server`, `push-edge-function`, `recovery-proof-edge-function`, `rls-policies-and-tests`, `rls-fuzz-property`, `protocol-integrity-integration-tests`, `audit-log-integrity`, `commit-seq-authority`, `rekey-two-phase`, `onboarding-backfill-ui`.

Running `git log 744d578..codex/track-c-widgets-web-ai --oneline` returns **7 commits**, none of which match these names. The commits exist on other branches and are already present in the `PLUGIN_MAP.md` "Shipped" supply-chain anchors (`commit-seq-authority`, `nonce-lease-server`, etc. all marked Shipped at 2026-05-19, pre-dating the Track C branch point). They are out-of-scope for this review.

If the prompt was intending to ask about another branch (perhaps `codex/track-c-old` or a sibling), please re-issue with that branch.

---

## Track C 总结

| Package | Verdict | P0 | P1 | P2 | DataAdapter 迁移 | 隔离违规 |
|---|---|---:|---:|---:|---|---|
| plugin-widgets | APPROVED | 0 | 4 | 4 | Low | None |
| plugin-calendar | APPROVED | 1 | 2 | 2 | Low (after entity reg) | None (peer dep on plugin-widgets is borderline) |
| plugin-pet | APPROVED | 1 | 3 | 2 | Low (after entity reg) | None |
| plugin-ai-cube | **REVISE** | 2 | 4 | 2 | Low (after entity reg) | None |
| apps/web | **REVISE** | 2 | 6 | 2 | **Medium — must replace IndexedDBAdapter** | None |
| 92e2ba6 (sqlite-driver dup) | **DROP** | n/a | n/a | n/a | — | **HIGH — overlaps Track A** |
| G9 bonus | N/A | — | — | — | — | — |

### 文件隔离冲突清单

| 文件 | Track A 版本 | Track C 版本 | 合并建议 |
|---|---|---|---|
| `apps/desktop/src-tauri/src/commands/database.rs` | f3dd30b + ad5f1d3 (with `DATABASE_ALLOWED_WINDOWS` guard, 480 lines) | 92e2ba6 (no guard, 448 lines) | **keep A** — Track C is a security regression |
| `apps/desktop/src-tauri/capabilities/plugin-data-database.json` | Present (added in ad5f1d3) | Missing | **keep A** |
| `apps/desktop/src-tauri/capabilities/AUDIT.md` | Present | Missing | **keep A** |
| `apps/desktop/src-tauri/src/commands/mod.rs` | adds `database` + `finder` modules | adds `database` only | **manual merge** — take Track A's superset |
| `apps/desktop/src-tauri/src/lib.rs` | registers `db_*` + finder commands | registers `db_*` only | **manual merge** — take Track A's superset |
| `apps/desktop/src-tauri/src/error.rs` | `E13xx` family | `E13xx` family (identical) | either; identical |
| `packages/core-data/src/index.ts`, `src/tauri-sqlite.ts`, `tests/tauri-sqlite.test.ts` | f3dd30b version | 92e2ba6 version (byte-identical) | either; identical |
| `docs/contracts/tauri-commands-v0.md` | A: §6.1 + §4 finder section | C: §6.1 only | **keep A** |
| `packages/core-data-sqlite-driver/docs/dev_log.md` | A's executor attribution | C's executor attribution | **keep A** |
| `docs/workflow/roadmap/xai-g1-native-foundation.md` | A's manifest updates | C's near-identical updates | **keep A** |
| `docs/workflow/roadmap/xai-g2-data-security-foundation.md` | A's manifest updates | C's near-identical updates | **keep A** |
| `packages/grid-shell-organizer-content/docs/dev_log.md` | A's ship promotion | C's ship promotion | **keep A** |
| `packages/multi-grid-event-scope/docs/dev_log.md` | A's ship promotion | C's ship promotion | **keep A** |

All other 80+ files are in `packages/plugin-{widgets,calendar,pet,ai-cube}/` or `apps/web/` and have no Track A counterpart — **no conflicts** for the actual G6/G7/G8 deliverables.

### 合并建议

#### Merge order

1. Land Track A (`codex/track-a-desktop-foundation`) first. It includes everything Track C's `92e2ba6` introduces plus security hardening Track C lacks.
2. Take the **6 Track C commits without `92e2ba6`** (`5e96b72`, `a75bf33`, `954409f`, `15a4c0a`, `7a6c8f1`, `9ae1b58`) — these only touch `packages/plugin-{widgets,calendar,pet,ai-cube}/`, `apps/web/`, `docs/reviews/*/feature-brief.md`, and `docs/workflow/roadmap/xai-v1.track-c-log.md`. No overlap with Track A. Clean cherry-pick.
3. After landing, run `pnpm install` to wire the new workspace packages, then re-run `check-types` on each plugin to confirm.

#### Must drop on merge

- `92e2ba6 feat(core-data-sqlite-driver)` entirely.
- The doc-only deltas Track C wrote into Track A-owned roadmap files (`xai-g1-native-foundation.md`, `xai-g2-data-security-foundation.md`, `packages/grid-shell-organizer-content/docs/dev_log.md`, `packages/multi-grid-event-scope/docs/dev_log.md`, `packages/core-data-sqlite-driver/docs/dev_log.md`) — keep Track A's canonical versions.
- The `9ae1b58` doc commit currently includes deltas to `docs/contracts/tauri-commands-v0.md`; this part must be dropped (kept in Track A). The Track C log itself (`xai-v1.track-c-log.md`) and the `docs/reviews/*/feature-brief.md` files are unique to Track C and should be kept.

#### Merge-blocking P0s to fix before any production exposure

The 5 scaffold packages are mergeable as **scaffold** but the following must be fixed before any of them is enabled for end users:

1. **`plugin-ai-cube` redaction** — either expand pattern coverage (JWT, PAT, AWS, Stripe, SSH, etc.) **with vitest cases**, or rename "Privacy gate" → "Mock review (scaffold)" so users don't trust it.
2. **`apps/web` CSP** — replace `'unsafe-inline'` with Next.js nonces (`script-src 'self' 'nonce-...'`).
3. **`apps/web` IndexedDBAdapter** — re-implement as `Repo<T>` from `@repo/core-data` (`listByIndex`, `transaction`, `metadata`, `migrate`).
4. **Entity registration** — add `calendar.event`, `pet.pet`, `ai-cube.message` to `docs/contracts/data-repository-v0.md` §3.1; otherwise the canonical entity table drifts on first Repo binding.

#### Optional / strongly recommended

- Switch all three cross-plugin signals (`pet ↔ ai-cube`, `widgets ↔ calendar/pet`) from raw `window.dispatchEvent(new CustomEvent(...))` to `@repo/core/events` — Red Line #3.
- Either move `WidgetManifestRegistration` into `@repo/core` so `plugin-calendar` no longer needs a runtime dep on `plugin-widgets`, or document the intentional plugin-graph dep.
- Add at least smoke vitest tests for `redactSecrets`, the cost-guard daily-rollover, and the widget store reducer before the next phase.
