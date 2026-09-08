# plugin-productivity — Feature Brief: productivity:* typed events emit

| Field | Value |
|---|---|
| Status | READY_FOR_FEATURE_PLAN |
| Author | Claude (xai-feature-brief, W0.B for plugin-productivity) |
| Date | 2026-05-23 |
| Feature slug | `plugin-productivity` (next phase on existing dev_log) |
| Source seed | `docs/planning/3-sub-prd-pre-analysis-20260522.md` §2.4 D-3 + §6.4 |
| Predecessor work | 2026-05-20 Track B Codex (`Status: READY_FOR_VERIFY`) — superseded by this phase |
| Discovery review (downstream) | `docs/reviews/plugin-productivity/20260523-discovery-review.md` |
| Plan docs (downstream) | `packages/plugin-productivity/docs/{design,api,test}.md` Phase-scoped sections |

---

## 1. Structured Brief

### 1.1 Problem

`plugin-productivity` owns Todo / Pomodoro / Habit stores but never emits any
`productivity:*` typed events. Downstream consumers (Console cross-window
shell, Web cross-tab, statistics surfaces, future automation plugins) cannot
observe productivity state transitions even though the cross-window typed-event
infrastructure is already Stable (`@repo/core/events`,
`packages/core/src/types/events.ts`).

The plugin's `docs/dev_log.md` "Known Gaps" section (2026-05-20):

> Pending: emit productivity:pomodoro-completed / productivity:todo-due /
> productivity:habit-reminder once @repo/core/events stabilizes.

`@repo/core/events` is now stable (`plugin-console` ships with it). This row
converts the deferred gap into the active scope.

### 1.2 User / Actor

- **Direct**: developers building Console / Web cross-window features that
  subscribe to productivity state signals.
- **Indirect (end-user)**: users who expect cross-window UI to react to
  productivity events (Console list refresh after Pomodoro completes;
  menu-bar reminders for due Todos and Habit windows).

### 1.3 Goal

1. Declare three additive `EventMap` entries.
2. Wire `emitEvent(...)` at the correct mutation outlets in the three stores.
3. Cover each emit with vitest unit tests.
4. Close drift D-3 (productivity portion only).

### 1.4 Non-goals

- No UI changes (Console / overlay / Web).
- No edits to `plugin-console`, `plugin-account`, `plugin-labels`,
  `plugin-project`, `plugin-calendar`, or `apps/desktop/**`.
- No Tauri command / Rust / native macOS changes.
- No persistence schema; no new permission prompts.
- No PLUGIN_MAP Stable promotion (that is W0.C).

### 1.5 Scope (file boundary)

- `packages/core/src/types/events.ts` — append three EventMap entries
  (declaration only).
- `packages/plugin-productivity/src/hooks/{usePomodoroStore,useTodoStore,useHabitStore}.tsx`
  — emit at mutation outlets.
- Co-located vitest tests (`*.test.tsx` next to each store) mocking
  `@repo/core/events`.

Out of scope:

- `packages/core/src/events/{emitter,listener,index}.ts` — Stable
  infrastructure, no edits.
- `plugin-productivity/src/{components,web,console-views.tsx}` — UI.

### 1.6 Classifications

| Dimension | Value |
|---|---|
| Architecture Kind | plugin slice |
| User Surface | API only (cross-window contract) |
| Change Type | extension |
| Impacted Layers | `packages/plugin-productivity/src/hooks/`, `packages/core/src/types/events.ts` |
| Target Plugin State | In-Dev |
| Risk Level | low–medium (additive cross-window contract) |

### 1.7 Dependencies

| Dependency | State | Direct use? |
|---|---|---|
| `@repo/core` typed events | Stable | Yes |
| `@repo/core-data` | In-Dev | Only via existing store surface; this row does not extend it |
| Downstream `plugin-console` / `plugin-account` | In-Dev | Not depended on |

### 1.8 Mock strategy

`No Mock` for runtime. Unit tests mock `emitEvent` to assert call shape.

### 1.9 Data / permission / security

Cross-window typed events are local Tauri IPC. No secrets, no permission
prompts. Payloads carry productivity-domain identifiers, mode tags, timestamps
only (no PII).

### 1.10 Release strategy

Standard V2 path (`feature-plan → feature-review → feature-build →
feature-verify → ship`). No dual-track impact.

### 1.11 Rollback / degrade

- Rollback: revert emit call sites + EventMap entries.
- Degrade: `emitEvent` already handles non-Tauri runtimes; emit code paths
  must not throw.

### 1.12 Acceptance criteria (binary)

- [ ] `packages/core/src/types/events.ts` has three additive EventMap entries.
- [ ] `usePomodoroStore` emits exactly once per completed session per mode.
- [ ] `useTodoStore` emits on dueAt crossing, deduped per (todoId, dueDate).
- [ ] `useHabitStore` emits on successful `checkIn`, deduped per habit per day.
- [ ] Three vitest test files cover trigger + payload per store.
- [ ] `pnpm --filter @repo/core check-types` passes.
- [ ] `pnpm --filter @repo/plugin-productivity check-types` passes.
- [ ] `pnpm --filter @repo/plugin-productivity test` passes.
- [ ] dev_log reaches `READY_TO_SHIP`.

---

## 2. Open Questions / Unknowns (resolved during feature-plan discovery)

All five open questions were resolved by feature-plan discovery (see
`docs/reviews/plugin-productivity/20260523-discovery-review.md`):

1. `productivity:todo-due` — state-transition semantic with boundary
   `setTimeout`.
2. `productivity:habit-reminder` — fires on `checkIn` success (Habit entity
   has no `reminderAt` field; scheduler deferred to a future row).
3. Dedup — per-store `useRef<Set<string>>` per emit key.
4. Payload shapes — fixed in discovery review §4 and `api.md`.
5. Non-Tauri runtime — emit-site `.catch(() => undefined)` swallow.

---

## 3. ADR-lite Trigger

| Field | Value |
|---|---|
| Needed | No |
| Rationale | Additive entries to an existing typed-event contract governed by ADR-0003. No new architectural decision required. |

---

## 4. Planner Handoff

| Field | Value |
|---|---|
| Feature slug | `plugin-productivity` |
| Three-faces decision | plugin slice owns the change; core change is declaration only. |
| Target plugin slice | `plugin-productivity` (In-Dev per `docs/PLUGIN_MAP.md:74`; this row does not promote it). |
| Mock strategy | No Mock runtime; unit tests mock `emitEvent`. |
| Cross-window contract impact | Yes — additive only. Three new EventMap entries; no existing entries modified. |
| Automation Mode | `A-Claude` |
| Verify Cross-vendor | `no` |
| Roadmap Manifest | none |
| Real-hardware verification | Not required for this row (no multi-window navigation, no native API, no Tauri command signature change). Downstream consumers handle their own real-hardware gates. |

---

## 5. Saved brief path

`docs/reviews/plugin-productivity/20260523-feature-brief.md`
