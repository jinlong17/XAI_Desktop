# plugin-labels — Discovery Review: labels:* typed events emit

| Field | Value |
|---|---|
| Status | DRAFT (awaiting feature-review) |
| Author | feature-plan (Claude) |
| Date | 2026-05-23 |
| Brief | `docs/reviews/plugin-labels/20260523-feature-brief.md` |
| Sibling reference | `docs/reviews/plugin-productivity/20260523-discovery-review.md` (shipped 2026-05-23) |
| Feature slug | `plugin-labels` |
| Risk Level | low (single hook + additive contract) |
| ADR-lite needed | No (additive to typed-event contract governed by `docs/adr/0003-three-faces-architecture.md`) |

---

## 1. Problem framing

`plugin-labels` is the global label authority. It owns one store
(`useLabelStore` at `packages/plugin-labels/src/hooks/useLabelStore.tsx`)
with three mutation outlets: `createLabel`, `updateLabel`, `deleteLabel`.
None of them currently signal the rest of the desktop when a label
changes. Downstream surfaces (Console label admin, Project card chips,
Productivity Todo label badges) therefore cannot reconcile cross-window
without a manual refresh or polling.

The "Known gaps" line in `packages/plugin-labels/docs/dev_log.md`
(2026-05-20 Track B Codex) explicitly defers emit wiring until
`@repo/core/events` is Stable. That precondition is now satisfied —
`plugin-productivity` (W0.B, shipped 2026-05-23) ships the same emit
pattern through `EventMap` keys at `packages/core/src/types/events.ts`
lines 67/79/91 and uses `.catch(() => undefined)` to honour non-Tauri
runtimes. This row converts the deferred gap into active scope.

### Step 0 brief acceptance

The 2026-05-23 brief is treated as canonical. The plan does not relax
any of its locked-out files (§1.5 "Out of scope"), nor its acceptance
criteria (§1.12). The brief's open question on soft-delete vs
hard-delete is resolved in §3.3 of this review.

---

## 2. Code map (read-only inspection)

Files inspected:

| File | Why |
|---|---|
| `packages/plugin-labels/src/hooks/useLabelStore.tsx` | Mutation outlets (create/update/delete) — emit wiring sites. |
| `packages/plugin-labels/src/types.ts` | `Label` shape; confirms `deletedAt?: string` is present. |
| `packages/plugin-labels/src/data/LocalStorageAdapter.ts` | Adapter — **hard delete** (filters out by id). |
| `packages/plugin-labels/src/data/RepoAdapter.ts` | Adapter — **soft delete** (sets `deletedAt`, bumps `version`, `updatedAt`). |
| `packages/plugin-labels/vitest.config.ts` | Confirms `@repo/core/events` alias resolves into core (so `vi.mock("@repo/core/events")` works). |
| `packages/plugin-labels/package.json` | Confirms `vitest` is available (`pnpm --filter @repo/plugin-labels test`). |
| `packages/core/src/types/events.ts` | Append point for the three new `EventMap` keys, after `productivity:habit-reminder` (current line 91). |
| `packages/core/src/events/index.ts` | Out of scope; locked by brief. |
| `packages/plugin-productivity/src/hooks/{useTodoStore,useHabitStore,usePomodoroStore}.tsx` | Sibling-emit pattern reference; `.catch(() => undefined)` swallow style. |
| `packages/plugin-productivity/src/hooks/useTodoStore.test.tsx` | Test scaffold reference (`vi.mock("@repo/core/events")` + `jsdom`). |

### Current `useLabelStore` shape (relevant excerpts)

`createLabel(input: LabelDraft) → Promise<Label>`
- Generates `id`, sets `entityType: "labels.label"`, `schemaVersion: 1`,
  `syncScope: "account-sync"`, fills name/color/icon, sets `createdAt`,
  `updatedAt`, `version: 1`.
- Validates name (throws on empty after trim).
- Calls `stableAdapter.save(label)` then commits to React state.
- Returns the saved `label`.

`updateLabel(id, patch) → Promise<void>`
- Loads `current = adapter.getById(id)`; early-returns if missing
  (silent no-op — see §3.4).
- Computes `next` = merge of `current + patch`, trims name, bumps
  `version: current.version + 1`, refreshes `updatedAt`.
- Calls `stableAdapter.save(next)` then commits to React state.

`deleteLabel(id) → Promise<void>`
- Calls `stableAdapter.delete(id)` (semantic differs by adapter — §3.3).
- Filters local `labels` state and the `recentLabelIds` list, persists
  recent.

Action-coupled emit is appropriate: each outlet is reachable only from a
single deliberate caller, so observer-style dedup (productivity's
`emitted` Set, `setTimeout` boundaries) is **not** required.

---

## 3. Candidate options & decisions

This row has minimal candidate breadth — the pattern is fixed by
W0.B productivity. Decisions below are about the few real choices.

### 3.1 Emit placement inside each action

**Chosen**: emit *after* `adapter.save(...)` / `adapter.delete(...)`
resolves successfully and *before* the function returns. Same shape as
productivity's emit in `useTodoStore.updateTodo` (around line 209/225 of
`useTodoStore.tsx`).

Rationale:
- Honours brief §1.12 "exactly once per successful create/update/delete".
- If adapter rejects, the emit must not fire — guarantees the
  cross-window signal matches the persisted state.
- Brief acceptance criteria pin "successful" semantics; failure paths do
  not emit.

Rejected: emit before `adapter.save(...)`. Risk of phantom events when
the adapter rejects (no retry, but consumers would purge caches that
still hold the truth).

### 3.2 Non-Tauri runtime guard

**Chosen**: `.catch(() => undefined)` at every emit site, identical to
`useTodoStore.tsx:215`/`231`. Wrap the emit in `void emitEvent(...).catch(() => undefined)`
or `emitEvent(...).catch(() => undefined)` (statement form). Either is
fine; pick statement form to match productivity exactly.

Rationale:
- Brief §1.11 + §2.4 explicitly mandate this pattern.
- Verified by feature-review of productivity (Review Notes line 38–40 of
  productivity dev_log): `packages/core/src/events/emitter.ts` rejects on
  non-Tauri runtimes; swallowing at the call site keeps "advisory emit
  must not break store mutation" local. Same constraint applies here.

### 3.3 `deleteLabel` semantic — soft delete vs hard delete

**Open question (brief §2.3): RESOLVED — defer to adapter.**

Findings:
- `Label.deletedAt` is declared optional in `src/types.ts` line 13.
- `LocalStorageAdapter.delete()` does a **hard delete** (filters out).
- `RepoAdapter.delete()` does a **soft delete** (sets `deletedAt`,
  bumps `version`).
- `useLabelStore.deleteLabel(id)` delegates to `adapter.delete(id)` and
  always removes the entry from local React state (no `deletedAt`
  hydration in `getAll()` for the LocalStorage path).

**Decision**:

- The brief's preferred semantic is "soft delete with `deletedAt`
  payload" (brief §2.3). However, the store currently has **no view of
  the tombstone** under `LocalStorageAdapter` — the entity is gone after
  `adapter.delete`. Re-reading the entry from the adapter after delete
  would be racy and adapter-specific.
- Reaching into `RepoAdapter` to read `deletedAt` would require either
  (a) a `getById` after delete (which is what `RepoAdapter` itself does
  internally, but returns `null` because the repo filters on
  `!deletedAt`) or (b) splitting `delete()` into a returning method
  (out-of-scope change to `DataAdapter` and both adapters).
- **Plan**: emit `labels:deleted` with payload `{ id, version,
  deletedAt }` where:
  - `id` = the caller-supplied id.
  - `version` = `current.version` (read via `adapter.getById(id)` at the
    *top* of `deleteLabel`, before delegating to the adapter). If the
    pre-read returns `null` (label already gone), skip both the delete
    call's side-effects on emit and the emit — silent no-op, matches
    `updateLabel`'s early-return semantic (§3.4).
  - `deletedAt` = ISO string sampled by the store itself with
    `new Date().toISOString()` at emit time. This is the
    cross-window-observed "deletion happened at" timestamp regardless of
    adapter's internal tombstone behaviour.

Consequences:
- Adds one `adapter.getById(id)` call to `deleteLabel`. This is a
  read-then-write the store already does in `updateLabel`, so it is not
  a new pattern. Cost is one extra storage read per delete — negligible.
- The store-sampled `deletedAt` is **not guaranteed** to equal
  `RepoAdapter`'s persisted `deletedAt` (RepoAdapter stamps its own
  `now`). Two timestamps captured ~µs apart. This is acceptable: the
  emit's `deletedAt` is an event timestamp, not a query into the
  tombstone record.
- Hard-delete adapter (`LocalStorageAdapter`) still works: the
  pre-read fetches the version, the delete removes the row, and the
  emit carries the version that *was* live just before deletion.

Alternatives considered:
1. Extend `DataAdapter.delete` to return the deleted record. **Rejected
   — out of scope** (touches both adapters + the `DataAdapter` contract).
2. Emit `{ id }` only, drop `version`/`deletedAt`. **Rejected** —
   brief §1.9 explicitly asks for `id` + `version` so consumers can
   purge caches without a re-fetch; brief §1.12 acceptance criteria pin
   the payload shape `{ id, version, deletedAt }`.
3. Use the soft-delete tombstone exclusively (i.e. ban
   `LocalStorageAdapter` from delete). **Rejected** — out of scope and
   would regress the mock-first storage path.

### 3.4 Silent no-op on stale `updateLabel` / `deleteLabel`

Both `updateLabel` and (under this plan) `deleteLabel` early-return if
`adapter.getById(id)` returns `null`. In that case **no emit fires**.
Documented in `api.md` and asserted by test.

Rationale:
- Brief §1.12 says "exactly once per successful update/delete". A
  silent no-op is not a successful mutation.
- Matches sibling `useTodoStore.updateTodo` style.

### 3.5 Test environment

**Chosen**: jsdom via `// @vitest-environment jsdom` header at the top
of `useLabelStore.test.tsx`, same as `useTodoStore.test.tsx`. The store
mounts `LabelStoreProvider` under React 19 `createRoot`, so a DOM is
required. `vitest.config.ts` already aliases `@repo/core/events` into
core, so `vi.mock("@repo/core/events")` resolves correctly.

No fake timers needed (labels emit on action, not on time boundaries).

### 3.6 Web research

**Not performed.** This row touches no external dependency, no library
choice, no new API surface — it reuses an in-house pattern (`emitEvent`
+ `EventMap`) that is already Stable in `@repo/core/events`. Per
`feature-plan` protocol step 4, web research is skipped and noted: **No
external research required.**

---

## 4. Payload schema (final)

```ts
// packages/core/src/types/events.ts — append after line 91
'labels:created': {
  /** Newly created label id. */
  id: string;
  /** Display name at create time (trimmed). */
  name: string;
  /** Hex color string assigned (caller-provided or fallback). */
  color: string;
  /** Optional icon glyph identifier if provided by caller. */
  icon?: string;
  /** Owning entity type — always 'labels.label' (constant). */
  entityType: 'labels.label';
  /** Version at create — always 1. */
  version: number;
  /** ISO timestamp the store stamped at creation. */
  createdAt: string;
};
'labels:updated': {
  /** Updated label id. */
  id: string;
  /** Post-update display name (trimmed). */
  name: string;
  /** Post-update hex color. */
  color: string;
  /** Post-update optional icon glyph identifier. */
  icon?: string;
  /** Bumped version (current.version + 1). */
  version: number;
  /** ISO timestamp the store stamped at update. */
  updatedAt: string;
};
'labels:deleted': {
  /** Deleted label id. */
  id: string;
  /** Version at delete time — the live version just before deletion. */
  version: number;
  /** ISO timestamp the store sampled at delete time. */
  deletedAt: string;
};
```

Notes:
- `entityType` is included in `labels:created` so cross-window
  consumers can disambiguate from future label-family entities without
  hard-coding the literal. `labels:updated` and `labels:deleted` omit
  it — by the time those fire, consumers must already have the
  `created` event indexed (or have fetched via the adapter).
- `version` is mandatory on all three payloads. `createdAt` /
  `updatedAt` / `deletedAt` are mutually exclusive (one per event).
- All values are JSON-clonable scalars (no PII, no token, no encrypted
  blob) — matches brief §1.9.

---

## 5. Phase plan (proposed, two BUILD slices)

The sibling row used 4 BUILD phases (one per store + the EventMap
declaration). Labels has 1 store, so collapsing to 2 BUILD phases is
appropriate (a 1-phase plan would conflate the additive type-level
change with the runtime emit wiring — splitting keeps each commit
narrowly scoped):

| Phase | Goal | Files | Gate |
|---|---|---|---|
| BUILD-1 | Declare three additive `EventMap` keys. | `packages/core/src/types/events.ts` only. | `pnpm --filter @repo/core check-types`. No behaviour change. |
| BUILD-2 | Wire `emitEvent` at three outlets + add `useLabelStore.test.tsx`. | `packages/plugin-labels/src/hooks/useLabelStore.tsx`, `packages/plugin-labels/src/hooks/useLabelStore.test.tsx`. | `pnpm --filter @repo/plugin-labels check-types` + `pnpm --filter @repo/plugin-labels test`. |
| VERIFY | Run gates + cross-read brief AC table. | (read-only) | dev_log → `READY_TO_SHIP`. |
| SHIP | Commit + push (after human confirm). | (no new code) | trailer present. |

This satisfies Workflow V2's "one phase per feature-build run" rule.

---

## 6. Risks & open questions

| Risk | Mitigation |
|---|---|
| `LocalStorageAdapter` hard-deletes, `RepoAdapter` soft-deletes, but emit carries store-sampled `deletedAt`. Consumers may observe two slightly different `deletedAt` values if they also re-read from the repo. | Document in `api.md`: emit `deletedAt` is an event timestamp, not a tombstone query. Brief acceptance criteria are satisfied (carries `id`, `version`, `deletedAt`). |
| React 19 Strict-Mode double-invoke of effects could double-emit on remount. | Emit sites are inside `useCallback` actions, not `useEffect` — actions only fire on caller invocation. Verified by inspection. |
| Test using `react-dom/client` + jsdom may be flaky (sibling Review Notes N2). | Test design intentionally avoids fake timers; pure action-driven flow. |
| `adapter.getById` pre-read in `deleteLabel` adds a storage hit. | Negligible (LocalStorageAdapter pages all rows in memory anyway; RepoAdapter already does an internal get). |
| Future row may need `entityType` on `updated`/`deleted` too. | Additive expansion (new optional field) is allowed without breaking change; document the convention in `api.md`. Not in scope here. |

Open questions: **none remain**. The brief's three open questions are
resolved:

1. Dedup → not needed (action-coupled).
2. Payload field list → finalized in §4.
3. Soft-delete semantic → resolved in §3.3 (store-sampled `deletedAt`,
   pre-read `version`).
4. Non-Tauri guard → `.catch(() => undefined)` at every emit site.

---

## 7. Recommendation

Approve the plan with the two-phase build slice. Move dev_log Status
Panel to `NEEDS_REVIEW` with `Suggested Next: feature-review`.
