# plugin-labels — Feature Brief: labels:* typed events emit

| Field | Value |
|---|---|
| Status | READY_FOR_FEATURE_PLAN |
| Author | Claude (W0.B for plugin-labels, sibling of W0.B productivity SHIPPED 2026-05-23) |
| Date | 2026-05-23 |
| Feature slug | `plugin-labels` (next phase on existing dev_log) |
| Source seed | `docs/planning/3-sub-prd-pre-analysis-20260522.md` §2.4 D-3 |
| Predecessor work | 2026-05-20 Track B Codex (`Status: READY_FOR_VERIFY`) — superseded by this phase |
| Sibling row | W0.B `plugin-productivity` shipped 2026-05-23 (commits `7ee5d6f`..`99b3de9`) — established the typed-events emit pattern this row reuses |

---

## 1. Structured Brief

### 1.1 Problem

`plugin-labels` owns label CRUD via a single store hook (`useLabelStore`) but
never emits any `labels:*` typed events. Downstream consumers (Console
cross-window shell that shows label changes, Project / Productivity that
reference labels by id, future statistics surfaces) cannot observe label
mutations even though the cross-window typed-event infrastructure is Stable
(`@repo/core/events`, `packages/core/src/types/events.ts`).

The plugin's `docs/dev_log.md` "Known gaps" section (2026-05-20):

> Pending: emit labels:created|updated|deleted once @repo/core/events stabilizes.

`@repo/core/events` is now Stable (`plugin-console` + `plugin-productivity`
both ship with it). This row converts the deferred gap into the active scope.

### 1.2 User / Actor

- **Direct**: developers building Console / Project / Productivity / Web rows
  that subscribe to label state.
- **Indirect (end-user)**: users who expect cross-window UI to reflect label
  edits made in any window (Console label edit ↔ Project card chip refresh ↔
  Productivity Todo label re-render).

### 1.3 Goal

1. Declare three additive `EventMap` entries (`labels:created`,
   `labels:updated`, `labels:deleted`).
2. Wire `emitEvent(...)` at the create / update / delete mutation outlets in
   `useLabelStore`.
3. Cover each emit with vitest unit tests (per-mutation; payload schema).
4. Close drift D-3 for the labels portion (project remains a separate row).

### 1.4 Non-goals

- No UI changes (Console / overlay / Web).
- No edits to `plugin-console`, `plugin-account`, `plugin-productivity`,
  `plugin-project`, `plugin-calendar`, or `apps/desktop/**`.
- No Tauri command / Rust / native macOS changes.
- No persistence schema; no new permission prompts.
- No PLUGIN_MAP Stable promotion (that is W0.C; do not touch row 75).

### 1.5 Scope (file boundary)

- `packages/core/src/types/events.ts` — append three EventMap entries
  (declaration only).
- `packages/plugin-labels/src/hooks/useLabelStore.tsx` — emit at three
  mutation outlets (createLabel / updateLabel / deleteLabel).
- Co-located vitest test next to the store (`useLabelStore.test.tsx`)
  mocking `@repo/core/events`.

Out of scope:

- `packages/core/src/events/{emitter,listener,index}.ts` — Stable
  infrastructure, no edits.
- `plugin-labels/src/{components,console-view.tsx,data,register-plugin}`.

### 1.6 Classifications

| Dimension | Value |
|---|---|
| Architecture Kind | plugin slice |
| User Surface | API only (cross-window contract) |
| Change Type | extension |
| Impacted Layers | `packages/plugin-labels/src/hooks/`, `packages/core/src/types/events.ts` |
| Target Plugin State | In-Dev (row 75) |
| Risk Level | low (single hook + additive contract; simpler than productivity which had 3 hooks) |

### 1.7 Dependencies

| Dependency | State | Direct use? |
|---|---|---|
| `@repo/core` typed events | Stable | Yes |
| `@repo/core-data` (RepoRecord) | In-Dev | Only via existing `Label` entity shape; this row does not extend it |
| `plugin-productivity` (sibling) | In-Dev | Not depended on; W0.B productivity established the emit pattern but no runtime coupling |

### 1.8 Mock strategy

`No Mock` for runtime. Unit tests mock `emitEvent` to assert call shape.

### 1.9 Data / permission / security

Cross-window typed events are local Tauri IPC. Payloads carry domain
identifiers (`id`, `name`, `color`, `entityType`, `version`, `updatedAt`)
only — no PII, no token, no encrypted blob.

For `labels:deleted`, payload should include the `id` and final `version`
at delete time so consumers can purge their caches without a re-fetch.

### 1.10 Release strategy

Standard V2 path (`feature-plan → feature-review → feature-build →
feature-verify → ship`).

### 1.11 Rollback / degrade

- Rollback: revert emit call sites + EventMap entries.
- Degrade: `emitEvent` already handles non-Tauri runtimes; emit code paths
  use the same `.catch(() => undefined)` pattern established by productivity.

### 1.12 Acceptance criteria (binary)

- [ ] `packages/core/src/types/events.ts` adds three additive entries:
      `labels:created`, `labels:updated`, `labels:deleted`. Existing entries
      (including `productivity:*` shipped by sibling row) unchanged.
- [ ] `useLabelStore.createLabel` emits `labels:created` exactly once per
      successful create, with `{id, name, color, icon?, entityType, version,
      createdAt}`.
- [ ] `useLabelStore.updateLabel` emits `labels:updated` exactly once per
      successful update, with `{id, name, color, icon?, version, updatedAt}`.
- [ ] `useLabelStore.deleteLabel` emits `labels:deleted` exactly once per
      successful delete, with `{id, version, deletedAt}`.
- [ ] Each emit uses `.catch(() => undefined)` to honour non-Tauri runtimes.
- [ ] `useLabelStore.test.tsx` covers all three triggers + payload schema
      with mocked `emitEvent`. No re-emit on re-render / stale state.
- [ ] `pnpm --filter @repo/core check-types` passes.
- [ ] `pnpm --filter @repo/plugin-labels check-types` passes.
- [ ] `pnpm --filter @repo/plugin-labels test` passes.
- [ ] dev_log reaches `READY_TO_SHIP`.

---

## 2. Open Questions / Unknowns (to be resolved during feature-plan discovery)

1. **Dedup**: labels emit on action (`createLabel` / `updateLabel` /
   `deleteLabel`), not on observation. Action-coupled emits should not need
   re-render dedup, but feature-plan should confirm by reading the store's
   action implementation.
2. **Payload field list**: confirmed in §1.12 acceptance criteria; planner
   may refine if `useLabelStore` stores additional fields (e.g.
   `schemaVersion`).
3. **`labels:deleted` semantic**: hard delete vs soft delete (`deletedAt`
   present in `Label` type). Recommend soft-delete semantic — `deleteLabel`
   sets `deletedAt` and emits `labels:deleted`; payload carries the
   `deletedAt` timestamp.
4. **Non-Tauri runtime guard**: reuse productivity's `.catch(() =>
   undefined)` pattern.

---

## 3. ADR-lite Trigger

| Field | Value |
|---|---|
| Needed | No |
| Rationale | Additive entries to an existing typed-event contract governed by ADR-0003. Sibling row (W0.B productivity) already established the pattern. No new architectural decision required. |

---

## 4. Planner Handoff

| Field | Value |
|---|---|
| Feature slug | `plugin-labels` |
| Three-faces decision | plugin slice owns the change; core change is declaration only. |
| Target plugin slice | `plugin-labels` (In-Dev per `docs/PLUGIN_MAP.md:75`; this row does not promote it). |
| Mock strategy | No Mock runtime; unit tests mock `emitEvent`. |
| Cross-window contract impact | Yes — additive only. Three new EventMap entries; no existing entries modified. |
| Automation Mode | `A-Claude` |
| Verify Cross-vendor | `no` |
| Roadmap Manifest | none (standalone D-3 drift fix row) |
| Real-hardware verification | Not required for this row (no multi-window navigation, no native API, no Tauri command signature change). |
| Pattern reuse | Sibling row `plugin-productivity` (shipped 2026-05-23) used the same emit + dedup + non-Tauri swallow pattern; expect <= 2 BUILD phases (EventMap declaration + store emit + tests). |

---

## 5. Saved brief path

`docs/reviews/plugin-labels/20260523-feature-brief.md`
