# Plugin Project Dev Log

## Status Panel

- Workflow: FEATURE_DEV
- Target: plugin-project
- Title: project:card-* typed events emit (W0.B — D-3 closer, final of three)
- Current Phase: FEATURE_VERIFY
- Status: READY_TO_SHIP
- Executor: feature-verify (Claude)
- Updated: 2026-05-23
- Suggested Next: ship
- Automation Mode: A-Claude
- Verify Cross-vendor: no
- ADR-lite: not required

## Review Notes (2026-05-23 — feature-review, Claude)

Verdict: **APPROVED**. Plan is executable as written; no blocking ambiguity.

Validation against the six review gates the brief / discovery / docs claim:

1. **Action surface match (Q1)** — `useProjectStore.tsx:157–237` confirms `createCard`, `moveCard`, `updateCard`, plus `updateChecklist` thin wrapper over `updateCard`. The "emit at the inner `updateCard` only" decision is correct: routing through `updateCard` guarantees a single emit (AC-P-U4). `deleteCard` exists but is correctly excluded (brief §1.4 and discovery §2 Q1).
2. **`moveCard` no-op guard (Q2)** — Traced the in-memory math: when called with `(fromListId, fromOrder) == (toListId, toOrder)` on a normalized list, `normalizedTargetList` re-indexes to the identical pre-state orders, so `dirty` is empty and the guard correctly suppresses the emit. When called with an out-of-range `order` (e.g. clamp-to-end on the same list), at least one neighboring card is re-numbered, so `dirty.length > 0` and the emit correctly fires. The guard is semantically equivalent to "card actually moved" and is preferable to a literal `(fromListId == toListId && fromOrder == toOrder)` check because it also catches the case where the caller passes an out-of-clamp-range no-op.
3. **`updateCard` coalesced emit + `patchKeys` allow-list (Q3)** — `updateCard` signature `Partial<Omit<Card, "id">>` (line 187) matches a single coalesced emit perfectly. Allow-list `["title", "description", "labels", "dueDate", "checklist", "listId", "order"]` correctly covers all caller-mutable fields per `types.ts:35–50` and excludes system-managed fields. `Object.keys(patch).sort()` semantics are deterministic for cross-window consumers.
4. **`projectId` omission (Q4)** — Confirmed `Card` has no `projectId` field; the store has no card→project lookup; brief §1.5 forbids `types.ts` edits. Omitting `projectId` from all three payloads is correct and consistent across discovery review §2 Q4, design.md "Payload Design Rationale", and api.md (all three event tables). Brief §1.9 / §1.12 pre-discovery mention of `projectId` is formally superseded by discovery review §2 Q4 — design.md and api.md correctly reflect the final shape. Future row coupling (entity + payload) is documented as a deferred follow-up.
5. **Scope boundary** — Plan touches exactly `packages/core/src/types/events.ts` (additive 3 entries after `labels:deleted` line 143) + `packages/plugin-project/src/hooks/useProjectStore.tsx` + new co-located `useProjectStore.test.tsx`. No Rust, no `apps/desktop/**`, no other plugins, no `packages/core/src/events/{emitter,listener,index}.ts`. Sibling labels confirmed no Rust-side or `packages/core/src/events/` registration is required for typed events.
6. **Test coverage (16 AC across C/M/U/G)** — Bucket distribution (4 C + 4 M + 5 U + 3 G) is well-balanced; ≥ 10 required by brief §1.12, comfortably exceeded. Mock factory `vi.mock("@repo/core/events", ...)` matches the labels sibling exactly. React 19 `act` + `createRoot` + jsdom directive is the established sibling pattern.

Non-blocking notes for the builder (do not require revision):

- **N1 (test typing)** — AC-P-U3 ("caller passes `{ title: "X", id: "ignored", createdAt: "ignored", schemaVersion: 1 }`") and AC-P-C3 / AC-P-C4 may need `// @ts-expect-error` annotations or an `as never` cast because the `updateCard` signature `Partial<Omit<Card, "id">>` forbids `id` and `createdAt` literally. The labels sibling has equivalent patterns — reuse whichever escape hatch it uses.
- **N2 (jsdom resolution)** — Discovery §5 already flags this. If `pnpm --filter @repo/plugin-project test` fails on `jsdom` resolution during B2, the builder should add `jsdom` as a devDep of `plugin-project` (smallest possible scope expansion) and note it in the work log; this does not require a re-review.
- **N3 (emit form)** — Use the exact sibling form `void emitEvent("project:card-*", payload).catch(() => undefined);` so static analyzers and the existing pattern register the swallow. The plan already specifies `.catch(() => undefined)` but does not show the `void` prefix — labels does, and it is the cleanest form.
- **N4 (in-memory `cards` staleness)** — `moveCard` reads `target = cards.find(...)`; if the caller queued two moves in the same event loop tick before React re-renders, the second `moveCard`'s `fromOrder` could reflect stale state. This is pre-existing store behaviour, out of scope for this row, and the AC scenarios all use a single move per `act` block, so this is not a blocker.

Predecessor state preservation: Work Log lines 90–101 (including the 2026-05-20 Track D entry that was superseded by this W0.B phase) are preserved unchanged.

Ready for `feature-build` (orchestrator will dispatch `feature-auto-build` next; expect 2 phases — B1 EventMap declaration, B2 store emits + 16-scenario vitest).

## Brief / Review Docs

- Brief: `docs/reviews/plugin-project/20260523-feature-brief.md`
- Discovery Review: `docs/reviews/plugin-project/20260523-discovery-review.md`
- Sibling pattern source: `plugin-productivity` (`7ee5d6f`..`99b3de9`) · `plugin-labels` (`c0a9cf8`..`3e27206`) — both shipped 2026-05-23

## Phase Plan

### B1 — EventMap declaration

- Append three additive entries to `packages/core/src/types/events.ts` after the `labels:deleted` block (after line 143):
  - `project:card-created` (id, listId, title, order, entityType, version, createdAt)
  - `project:card-moved` (id, fromListId, toListId, fromOrder, toOrder, version, updatedAt)
  - `project:card-updated` (id, listId, patchKeys, version, updatedAt)
- Include JSDoc per-field comments mirroring the `labels:*` block style.
- Gate: `pnpm --filter @repo/core check-types` passes; types.ts diff strictly additive.

### B2 — `useProjectStore` emits + vitest

- Import `emitEvent` from `@repo/core/events` in `useProjectStore.tsx`.
- Add three emit call sites:
  - `createCard` (post-`save`, before `setCards`) → `project:card-created` with full identity + position; `.catch(() => undefined)`.
  - `moveCard` (after `dirty` computation) → capture `fromListId = target.listId`, `fromOrder = target.order` before re-normalization; emit `project:card-moved` only when `dirty.length > 0`; carries source + target + bumped version + `movedAt`; `.catch(() => undefined)`.
  - `updateCard` (post-`save`, before `setCards`) → compute `patchKeys` from `Object.keys(patch)` filtered to allow-list (`title`, `description`, `labels`, `dueDate`, `checklist`, `listId`, `order`), sorted; emit `project:card-updated`; `.catch(() => undefined)`.
- Add co-located `useProjectStore.test.tsx` with `// @vitest-environment jsdom` directive.
  - Mock factory: `vi.mock("@repo/core/events", () => ({ emitEvent: vi.fn(() => Promise.resolve()), useEventListener: vi.fn() }))`.
  - React 19 `act` + `createRoot` harness, in-memory `DataAdapter` for Project + Card.
  - 16 binary AC scenarios across C / M / U / G buckets (see `docs/test.md`).
- Gates:
  - `pnpm --filter @repo/core check-types` passes.
  - `pnpm --filter @repo/plugin-project check-types` passes.
  - `pnpm --filter @repo/plugin-project test` passes.

### Phase split rationale

Two BUILD phases is sufficient: the `moveCard` payload is the richest (5 positional fields) but its tests are 4 of 16 — well within a single phase's review budget. Mirrors sibling rows (productivity + labels both shipped in 2 BUILD phases).

## Risks

- **`Card` lacks `projectId`** — payloads omit `projectId` (entity-shape change forbidden by brief). Documented in design.md as a known limit; future row may add the field across entity + payloads in one coupled change.
- **`moveCard` no-op guard** depends on `dirty.length > 0`. Future diff-strategy refactor could silently break the guard. Mitigated by AC-P-M3 test pinning the no-op suppression behaviour.
- **`patchKeys` allow-list** is part of the cross-window contract. Adding a new mutable `Card` field requires mirroring it in the allow-list (additive, non-breaking).
- **vitest jsdom resolution** — `plugin-project` uses `vitest` directly (unlike labels' `node ../core/node_modules/vitest/vitest.mjs` shim). Build phase confirms `pnpm --filter @repo/plugin-project test` resolves jsdom; if hoist-only resolution fails, the build phase may need to add an explicit `jsdom` devDep (defer the decision to build).

## Acceptance Criteria (binary)

- [x] `packages/core/src/types/events.ts` adds three additive entries after the `labels:*` block. Existing entries unchanged.
- [x] `createCard` emits `project:card-created` exactly once with `{id, listId, title, order, entityType, version: 1, createdAt}`.
- [x] `moveCard` emits `project:card-moved` exactly once with `{id, fromListId, toListId, fromOrder, toOrder, version, updatedAt}` when `dirty.length > 0`.
- [x] `moveCard` no-op (same list, same order) does not emit.
- [x] `updateCard` emits `project:card-updated` exactly once with `{id, listId, patchKeys, version, updatedAt}`; `patchKeys` is sorted and filtered to allow-list.
- [x] `updateChecklist` wrapper produces a single `project:card-updated` emit at the inner `updateCard` outlet (no double-emit).
- [x] Each emit uses `.catch(() => undefined)`.
- [x] Provider re-render without action call does not emit.
- [x] `pnpm --filter @repo/core check-types` passes.
- [x] `pnpm --filter @repo/plugin-project check-types` passes.
- [x] `pnpm --filter @repo/plugin-project test` passes.
- [x] No edits outside declared scope (events.ts + useProjectStore.tsx + useProjectStore.test.tsx + vitest.config.ts).
- [x] dev_log reaches `READY_TO_SHIP` (feature-verify PASS, 2026-05-23).

## Out of scope (must not change)

- `packages/core/src/events/{emitter,listener,index}.ts`
- `plugin-project/src/{components,data,utils,register-plugin}.*`
- `plugin-project/src/types.ts` (entity shape unchanged)
- `plugin-console`, `plugin-account`, `plugin-productivity`, `plugin-labels`, `plugin-calendar`, `plugin-organizer`, `apps/desktop/**`
- Tauri command / Rust / native macOS files
- `docs/PLUGIN_MAP.md` row 76 (W0.C scope)

## Verify Report (2026-05-23 — feature-verify, Claude)

**Verdict: PASS → `READY_TO_SHIP`.**

### Commits reviewed

| Commit | Type | Scope |
|---|---|---|
| `f18bdd4` | `feat(core)` | `packages/core/src/types/events.ts` — three additive EventMap entries (+51 LOC), strictly additive, JSDoc per-field mirrors `labels:*` style |
| `dcd7d52` | `feat(plugin-project)` | `useProjectStore.tsx` (+35 LOC, 3 emit sites), `useProjectStore.test.tsx` (new, 468 LOC, 16 AC scenarios), `vitest.config.ts` (new, 18 LOC, mirrors labels sibling), `dev_log.md` |
| `a78d37e` | `docs(plugin-project)` | feature-plan artifact alignment: brief, discovery review, design.md / api.md / test.md §W0.B sections |

Each commit single-intent and within phase boundary. Commit messages follow project Why/What/Scope/Risk/Docs/Tests convention.

### Gates (re-run from clean `dev` HEAD = `a78d37e`)

| Gate | Result |
|---|---|
| `pnpm --filter @repo/core check-types` | PASS (tsc --noEmit, no output) |
| `pnpm --filter @repo/plugin-project check-types` | PASS (tsc --noEmit, no output) |
| `pnpm --filter @repo/plugin-project test` | **21/21 PASS** (16 new W0.B + 5 pre-existing; 2.56s) |

### Code-vs-contract checks

1. **EventMap ↔ api.md alignment** — Verified the three new entries' field lists / types / docstrings against `api.md` §W0.B tables. Match byte-for-byte. No `projectId` in any payload (confirmed against `types.ts` — `Card` has no such field).
2. **`createCard` emit site (`useProjectStore.tsx` L183-191)** — Fires post-`stableCardAdapter.save` (L182), before `setCards` (L192). Payload: `{ id, listId, title, order, entityType, version, createdAt }`. Uses `void emitEvent(...).catch(() => undefined)`. ✓
3. **`moveCard` emit site (L253-263)** — Guarded by `if (dirty.length > 0)` so no-op moves (same list + same order on a normalized list) correctly suppress. `fromListId`/`fromOrder` captured at L231-232 before re-normalization. Payload: `{ id, fromListId, toListId, fromOrder, toOrder, version: target.version + 1, updatedAt: movedAt }`. ✓
4. **`updateCard` emit site (L207-213)** — Fires post-`stableCardAdapter.save` (L203). `patchKeys` computed via `Object.keys(patch).filter(allow-list).sort()` (L204-206). Allow-list constant at L79 matches api.md exactly. Payload: `{ id, listId, patchKeys, version, updatedAt }`. ✓
5. **`updateChecklist` wrapper (L269-272)** — Thin re-export of `updateCard(cardId, { checklist })`; emit produced at the inner outlet only. AC-P-U4 pins single-emit behaviour. ✓

### Scope boundary audit

```
docs/reviews/plugin-project/20260523-discovery-review.md
docs/reviews/plugin-project/20260523-feature-brief.md
packages/core/src/types/events.ts                              [additive only]
packages/plugin-project/docs/api.md
packages/plugin-project/docs/design.md
packages/plugin-project/docs/dev_log.md
packages/plugin-project/docs/test.md
packages/plugin-project/src/hooks/useProjectStore.test.tsx     [new]
packages/plugin-project/src/hooks/useProjectStore.tsx
packages/plugin-project/vitest.config.ts                       [new]
```

No edits to `apps/desktop/**`, Tauri/Rust/native, other plugins, `packages/core/src/events/{emitter,listener,index}.ts`, `plugin-project/src/types.ts`, or `docs/PLUGIN_MAP.md` (W0.C scope). ✓

### dev_log integrity

Status Panel · Phase Plan · Acceptance Criteria · Work Log internally consistent. Predecessor Track D entry (line 124) preserved verbatim. All 12 acceptance criteria now ticked (`dev_log reaches READY_TO_SHIP` flipped to checked).

### Residual risks (non-blocking)

- **R1 (stderr cosmetic)**: vitest emits `The current testing environment is not configured to support act(...)` warnings to stderr because the `vitest-environment jsdom` runner does not set the React 19 act-environment flag. All 16 AC assertions still pass and the behaviour matches sibling `plugin-labels`. Out of scope for this row; would be addressed by a global test-setup file (future hygiene row).
- **R2 (entity coupling)**: `Card` has no `projectId` field, so payloads omit it. Documented in design.md as a known limit; a future row may add `projectId` across entity + all three payloads in one coupled change (additive on payload side).
- **R3 (allow-list drift)**: `PATCH_KEYS_ALLOW_LIST` is duplicated between code (L79) and api.md table. Adding a new mutable `Card` field requires mirroring both. Mitigated by AC-P-U3 test which catches stale filtering.

### Sibling-parity confirmation

`plugin-productivity` W0.B (`7ee5d6f`..`99b3de9`) and `plugin-labels` W0.B (`c0a9cf8`..`3e27206`) both shipped 2026-05-23 with the same `.catch(() => undefined)` swallow + `vi.mock("@repo/core/events")` strategy. `plugin-project` is the third D-3 closer and matches the established pattern.

---

## Work Log

- Created project package scaffold.
- Added Project/Card entities and mock adapters.
- Added `useProjectStore` with project/card CRUD and card movement.
- Added `BoardView` with pure React drag/drop and `CardDetail` with description, checklist, labels, and due date.
- `fix(plugin-project): stop ProjectStoreProvider adapter default-arg loop (both adapters)`
- `perf(plugin-project): only persist moved cards in moveCard`
- `perf(plugin-project): commit CardDetail edits on blur instead of every keystroke`
- `feat(plugin-project): drop card above another to insert at position`
- `feat(plugin-project): add createdAt/updatedAt to Project and Card`
- `chore(plugin-project): memoize BoardView list sort, share createId helper, document event-emit gap`
- 2026-05-20 Track D: migrated Project/Card to Repository v0, added `RepoAdapter`/`ProjectRepoProvider`, preserved card order updates, and passed `pnpm --filter @repo/plugin-project check-types`. (Status was `READY_FOR_VERIFY` for Track D; superseded by this W0.B phase.)
- 2026-05-23 feature-plan (Claude): reset Status to `NEEDS_REVIEW` for W0.B card typed events emit. Resolved open questions (no `projectId` on `Card` → omit from payloads; coalesced `updateCard` → emit with `patchKeys`; no-op `moveCard` → guard on `dirty.length > 0`; emits are action-coupled in `useCallback`, no re-render dedup needed). Wrote `docs/reviews/plugin-project/20260523-discovery-review.md` + appended W0.B sections to design.md / api.md / test.md. Two BUILD phases planned (B1 EventMap declaration, B2 store emits + vitest with 16 AC scenarios). Commits: — . Next: feature-review.
- 2026-05-23 feature-review (Claude): **APPROVED**. Verified action surface against `useProjectStore.tsx:157–237` (createCard / moveCard / updateCard / updateChecklist wrapper — match). Traced `moveCard` no-op guard math: `dirty.length > 0` is semantically equivalent to "card actually moved" and also correctly suppresses out-of-clamp-range same-list calls. Confirmed `projectId` omission is consistent across discovery / design / api docs (brief §1.9 / §1.12 pre-discovery mention is formally superseded). Confirmed no Rust-side or `packages/core/src/events/` registration is required (sibling labels emit has neither). 16 AC scenarios (4 C + 4 M + 5 U + 3 G) comfortably exceed brief §1.12 ≥ 10 minimum. Non-blocking notes N1–N4 captured in Review Notes for the builder. Set Status → APPROVED, Suggested Next → feature-build. Commits: — . Next: feature-build (orchestrator will dispatch feature-auto-build for 2-phase build).
- 2026-05-23 03:40 feature-auto-build (claude-sonnet-4-6) — **B1 EventMap declaration**: Appended three additive `EventMap` entries (`project:card-created`, `project:card-moved`, `project:card-updated`) to `packages/core/src/types/events.ts` after the `labels:deleted` block. JSDoc per-field comments mirror the `labels:*` sibling style. No existing entries modified. Gate: `pnpm --filter @repo/core check-types` passed. Commits: f18bdd4 (`feat(core): add project:card-* EventMap entries (W0.B B1)`). Next: B2.
- 2026-05-23 03:45 feature-auto-build (claude-sonnet-4-6) — **B2 useProjectStore emits + vitest**: Added `emitEvent` import from `@repo/core/events` to `useProjectStore.tsx`. Added `PATCH_KEYS_ALLOW_LIST` module-level constant. Wired `void emitEvent(...).catch(() => undefined)` at three call sites: `createCard` (post-save, before setCards), `updateCard` (post-save with `patchKeys` allow-list filter + sort), `moveCard` (after `dirty` computation, guarded by `dirty.length > 0`, captures `fromListId`/`fromOrder` before re-normalization). Created `vitest.config.ts` (mirrors plugin-labels sibling, adds `@repo/core/events` alias). Created co-located `useProjectStore.test.tsx` with `// @vitest-environment jsdom` directive, `vi.mock("@repo/core/events")` factory, React 19 `act` + `createRoot` harness, in-memory adapters, 16 binary AC scenarios (4 C + 4 M + 5 U + 3 G). Gates: `pnpm --filter @repo/core check-types` passed, `pnpm --filter @repo/plugin-project check-types` passed, `pnpm --filter @repo/plugin-project test` 16/16 passed (21 total including 5 pre-existing). N1 escape hatch: `as unknown as Partial<Omit<Card, "id">>` cast in AC-P-U3 (mirroring labels sibling pattern). N2 jsdom: resolved via vitest's bundled jsdom (no explicit devDep addition needed). Next: feature-verify.
- 2026-05-23 feature-verify (Claude): **PASS → READY_TO_SHIP**. Reviewed commits `f18bdd4` (EventMap +51 LOC, additive only) + `dcd7d52` (useProjectStore + vitest + dev_log) + `a78d37e` (docs alignment); each commit single-intent and within phase boundary; commit messages follow Why/What/Scope/Risk/Docs/Tests convention. Gates re-run from clean dev: `pnpm --filter @repo/core check-types` PASS, `pnpm --filter @repo/plugin-project check-types` PASS, `pnpm --filter @repo/plugin-project test` 21/21 PASS (16 new W0.B + 5 pre-existing, 2.56s). Code-vs-contract: confirmed three new EventMap entries match api.md payload shapes verbatim (no `projectId` field on any). Emit-site spot-check on `useProjectStore.tsx`: `createCard` L183-191 emits post-save with full identity+position payload; `moveCard` L253-263 guarded by `if (dirty.length > 0)` with pre-mutation `fromListId`/`fromOrder` capture at L231-232; `updateCard` L207-213 emits post-save with `patchKeys` allow-list filter + sort; `updateChecklist` L269-272 routes through `updateCard` (no double-emit). All three emit sites use `void emitEvent(...).catch(() => undefined)` per sibling form. File-boundary respect verified: only `events.ts` (additive), `useProjectStore.{tsx,test.tsx}`, `vitest.config.ts` (new), and docs touched — no Tauri/Rust/native/other plugins/`apps/desktop/**`/`core/src/events/` edits. dev_log Status Panel, Phase Plan, Work Log internally consistent; predecessor state (Track D entry on line 124) preserved unchanged. Residual risks: vitest `act(...)` env warnings on stderr (cosmetic, non-fatal, matches sibling labels behavior). Commits: — . Next: ship.
