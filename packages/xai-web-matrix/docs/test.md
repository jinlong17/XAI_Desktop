# Test Strategy — xai-web-matrix

> Companion to `design.md` + `api.md`. All acceptance criteria (AC-*) are bound back to the seed brief's "Acceptance signal" line and the hard constraints in the parallel-Agent worker brief.

---

## 1. Test pyramid

| Layer | Tooling | Scope |
|---|---|---|
| Unit — pure functions | Vitest | `moveCardTo`, `quadrantColorToken`, seed helpers, key-down → quadrant mapping. |
| Unit — React components | Vitest + `@testing-library/react` + jsdom | `MatrixModule`, `Quadrant`, `Group`, `Card` render + interaction (drag emulation via `fireEvent`). |
| Type tests | `tsc --noEmit` + `vitest.test-d` | `MatrixCard` / `MatrixState` shape; ensure `MATRIX_STORAGE_KEY extends WebPrefKey`; ensure `"web:matrix:priority-tagged" extends keyof EventMap`. |
| CSS lint | inline assertion in a vitest case (mirrors `plugin-web-tokens` `tokens-smoke.test.ts`) | Confirm `matrix.css` contains zero hex literals and only references `var(--…)` tokens. |
| Manual smoke | Human + 3 browsers | Cross-vendor verify gate (P3). |

Test files live at `packages/xai-web-matrix/src/__tests__/*.test.{ts,tsx}` —
same convention as `plugin-web-tokens` and `plugin-web-storage`. The vitest
config mirrors `xai-web-shell/vitest.config.ts` (jsdom environment + setup file
that clears `localStorage` before each test).

---

## 2. Acceptance criteria → test mapping

Each row below ties a seed-brief or design-doc requirement to a concrete
named test. All AC-* live in `__tests__/`.

### 2.1 Render correctness

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-RENDER-1** | Renders 4 quadrants. | `MatrixModule.render.test.tsx` | 4 `<section>` elements with `data-quadrant` ∈ {q1,q2,q3,q4}; each has a `<h2>` title. |
| **AC-RENDER-2** | Each quadrant has a colored top-bar via `var(--qc)` set inline. | same | `getComputedStyle` on the `<header class="q-head">` element (mocked via inline-style introspection — jsdom does not run `::before`); asserts that the `style` attribute contains the expected `--qc` value per quadrant. |
| **AC-RENDER-3** | Order is Q1, Q2, Q3, Q4 in DOM. | same | `document.querySelectorAll("[data-quadrant]")` returns the four ids in order. |
| **AC-RENDER-4** | Each quadrant header carries the `<span class="q-number">` 1..4. | same | text content matches `"1"|"2"|"3"|"4"`. |

### 2.2 Internationalization

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-I18N-1** | All quadrant titles render bilingually (EN + ZH) using existing `t.matrix.*` keys. | `MatrixModule.i18n.test.tsx` | Mount with `lang="en"` → headings = `["Urgent & Important","Not Urgent & Important","Urgent & Unimportant","Not Urgent & Unimportant"]`. Re-mount with `lang="zh"` → `["紧急 · 重要","不紧急 · 重要","紧急 · 不重要","不紧急 · 不重要"]`. |
| **AC-I18N-2** | Empty-quadrant hint uses `s("common.no_tasks")`. | same | When `state.q1 === []`, the `[data-quadrant="q1"] .q-empty` text equals `"No tasks"` (en) and `"暂无任务"` (zh). |
| **AC-I18N-3** | Title bar (`Matrix` / `四象限`) renders from `t.matrix.title`. | same | `<h1 class="module-title">` text matches `"Eisenhower Matrix"` (en) / `"四象限"` (zh — falls back to `nav.matrix` if `matrix.title` zh missing; current bundle confirms both keys exist). |

### 2.3 Drag-and-drop

All DnD tests use `fireEvent.dragStart/dragOver/drop` from `@testing-library/react`.
The Card's `data-card-id` + the Quadrant's `data-quadrant` attributes provide
the test-selector handles. The custom MIME `application/x-xai-matrix-card` is
passed via `dataTransfer`.

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-DND-1** | Dragging a card from Q1 to Q2 moves it. | `MatrixModule.dnd.test.tsx` | Initial: 1 card in Q1, 0 in Q2. After dragstart on card + dragover on q2 body + drop on q2 body → 0 in Q1, 1 in Q2. |
| **AC-DND-2** | Dragging within the same quadrant is a no-op. | same | Initial state unchanged after drag from Q3 onto Q3 body. No `setState` call (verified via `usePref` mock). |
| **AC-DND-3** | Dropping with an empty `dataTransfer` is a no-op. | same | Trigger `drop` without prior `dragStart` (so `getData("application/x-xai-matrix-card") === ""`); state unchanged; no console error. |
| **AC-DND-4** | `onDragOver` calls `preventDefault()` (required for `drop` to fire). | same | Spy on the `preventDefault` of the dragover event; ensure called once when the dataTransfer includes the matrix MIME, not called when it doesn't. |
| **AC-DND-5** | Drop target shows visual highlight via `[data-dragover="true"]`. | same | Before dragover: attr is absent. During dragover: attr equals `"true"`. After dragLeave / drop: attr is removed. |

### 2.4 Persistence

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-PERSIST-1** | A drag-between writes the resulting state to `localStorage["xai_matrix_state"]`. | `MatrixModule.persist.test.tsx` | After a successful AC-DND-1, `JSON.parse(localStorage.getItem("xai_matrix_state"))` matches the post-drop state. |
| **AC-PERSIST-2** | Unmount + remount restores the persisted state (reload simulation). | same | Move card Q1→Q2, unmount, mount fresh `<MatrixModule lang="en"/>` → Q2 contains the moved card; Q1 does not. |
| **AC-PERSIST-3** | First mount with no stored value seeds from `internal/seed.ts`. | same | Clear localStorage; mount; assert `MatrixState` has > 0 total cards (the prototype's 8). |
| **AC-PERSIST-4** | A corrupted JSON in localStorage falls back to default. | same | `localStorage.setItem("xai_matrix_state", "not-json")`; mount; expect default empty matrix; no exception. |
| **AC-PERSIST-5** | `schemaVersion` mismatch falls back to default. | same | `localStorage.setItem("xai_matrix_state", JSON.stringify({ schemaVersion: 99, q1:[], q2:[], q3:[], q4:[] }))`; mount; expect default. |
| **AC-PERSIST-6** | Cross-tab `storage` event updates state. | same | Dispatch a synthetic `StorageEvent` for `xai_matrix_state` with a new value; assert UI re-renders with the new cards. |

### 2.5 Event bus

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-EVENT-1** | A drag-between emits exactly one `web:matrix:priority-tagged`. | `MatrixModule.events.test.tsx` | Subscribe via `useWebEventListener` (or a `onWebEvent` spy); perform AC-DND-1; assert the listener received one event with `{ cardId, from: "q1", to: "q2", taggedAt: <ISO> }`. |
| **AC-EVENT-2** | No event on drag-within-same-quadrant. | same | Listener count = 0 after a Q3→Q3 drag. |
| **AC-EVENT-3** | No event on cross-tab hydration (storage event). | same | Dispatch a storage event with new state; listener count = 0. |
| **AC-EVENT-4** | Keyboard-move emits the event. | same | Press `Ctrl+ArrowRight` on a focused card in Q1; listener fires once with `to: "q2"`. |
| **AC-EVENT-5** | `taggedAt` is a parseable ISO timestamp at the moment of commit. | same | `Date.parse(payload.taggedAt)` is a finite number and within 1s of `Date.now()`. |

### 2.6 Keyboard a11y fallback

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-KBD-1** | Focused card is `tabIndex={0}` and reachable via Tab. | `MatrixModule.kbd.test.tsx` | First card in Q1 receives focus after one `userEvent.tab()` past the header buttons. |
| **AC-KBD-2** | `Ctrl + ArrowRight` from Q1 moves to Q2. | same | Pre-state: card in Q1. After keydown → card in Q2. |
| **AC-KBD-3** | `Cmd + ArrowRight` on macOS userAgent path moves to Q2. | same | With `metaKey: true` on the keydown event. |
| **AC-KBD-4** | `ArrowRight` without modifier does NOT move (avoids text-input collision). | same | Pre-state: card in Q1. After plain keydown → card still in Q1; no event emitted. |
| **AC-KBD-5** | Wrap-around at boundary: `Ctrl + ArrowRight` from Q2 → Q1. | same | After kbd-move; assert Q2 lost the card, Q1 gained it. |
| **AC-KBD-6** | Vertical: `Ctrl + ArrowDown` from Q1 → Q3, from Q3 → Q1 (wrap). | same | Two-step test; both transitions verified. |

### 2.7 Shell registration

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-SHELL-1** | `matrixSlotRegistration` conforms to `WebModuleSlotRegistration` interface. | `registration.test.ts` | Compile-time: `const _check: WebModuleSlotRegistration = matrixSlotRegistration`. Runtime: assert each field equals the design-doc table values. |
| **AC-SHELL-2** | `matrixSlotRegistration.children[0].render` returns a non-empty React element. | same | Render with mocked capabilities; assert the result has children. |
| **AC-SHELL-3** | When wired into `webShellModuleRegistrations`, the rail still has exactly 12 entries with `moduleId === "matrix"` at index 5 (railOrder 6). | `shellRegistrations.integration.test.tsx` (in apps/web — see §3) | Length === 12 and `find(r => r.moduleId === "matrix")` returns the new registration (not a placeholder). |

### 2.8 Token-only styling

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-TOKENS-1** | `matrix.css` references **only** semantic tokens (`var(--red|amber|blue|accent|…)`) and contains zero `#hex` literals. | `matrix.css.tokens.test.ts` | Read the file as text; assert `/\#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})/.test(css)` is false. Assert that `var(--red)`, `var(--amber)`, `var(--blue)`, `var(--accent)` substrings each appear at least once. |

### 2.9 Type tests (`*.test-d.ts`)

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-TYPE-1** | `MATRIX_STORAGE_KEY` is assignable to `WebPrefKey`. | `types.test-d.ts` | `expectType<WebPrefKey>(MATRIX_STORAGE_KEY)`. |
| **AC-TYPE-2** | `"web:matrix:priority-tagged" extends keyof EventMap`. | same | `expectType<EventMap["web:matrix:priority-tagged"]>({…})`. |
| **AC-TYPE-3** | `MatrixState` is assignable to `WebPrefValue<"xai_matrix_state">`. | same | `expectType<WebPrefValue<"xai_matrix_state">>(state)`. |
| **AC-TYPE-4** | `matrixSlotRegistration` is `WebModuleSlotRegistration`. | same | direct type assignment. |

### 2.10 Public-surface barrel

| AC | Requirement | Test file | Asserts |
|---|---|---|---|
| **AC-BARREL-1** | All public names re-exported from `index.ts`. | `index-barrel.test.ts` | `expect(Object.keys(barrel).sort()).toEqual(["MATRIX_STORAGE_KEY","MatrixModule","default","matrixSlotRegistration"])` (plus types — types are tree-shaken at runtime). |

---

## 3. Tests outside `packages/xai-web-matrix/`

Per write scope (`packages/xai-web-matrix/` + `docs/reviews/xai-web-matrix/`),
we cannot freely write tests in `apps/web/` or `packages/plugin-web-storage/`
or `packages/core/`. The following tests are **placed inside this package**
even though they exercise behavior at the host seam:

| Test | Location | Rationale |
|---|---|---|
| `WebPrefRegistry` includes `xai_matrix_state` post-P2 write | `__tests__/registry-presence.test.ts` (this package) | Imports `PREF_REGISTRY` from `@repo/plugin-web-storage` and asserts the key exists. No edit needed in the storage row. |
| `EventMap` includes `web:matrix:priority-tagged` post-P2 write | `__tests__/eventmap-presence.test-d.ts` | Pure compile-time check via `expectType`. |
| The slot registration matches what the host wires in | `__tests__/registration.test.ts` | Same registration object referenced from both this package's tests and the host. |

`apps/web/src/routes/modules/__tests__/shellRegistrations.test.ts` (AC-SHELL-3)
lives in apps/web. Editing apps/web is in scope per the W1 precedent (shell row
#5 edited `apps/web/src/App.tsx`, `apps/web/src/routes/router.tsx`, etc.). We
extend the same write set with one targeted file.

---

## 4. Mock strategy

| External | Mock |
|---|---|
| `@repo/xai-web-event-bus` `emitWebEvent` | Spy via `vi.fn()`; restore after each test. Use a fresh `EventTarget` per test if listening cross-channel. |
| `@repo/plugin-web-storage` `usePref` | **Not mocked** — use the real implementation with cleared localStorage. This verifies the registry contract end-to-end. |
| `@repo/plugin-web-tokens` `useI18n` | **Not mocked** — real bundle; tests against the actual bilingual strings. |
| `@repo/xai-web-shell` `useWebShell` | Lightweight test wrapper: `<WebShellProvider modules={[matrixSlotRegistration]} lang={lang} railPos="left" petOn={false} setPetOn={()=>{}}><MatrixModule lang={lang}/></WebShellProvider>` — same pattern shell tests use. |
| Browser `DataTransfer` (jsdom) | jsdom's `DataTransfer` is a stub; we use `createEvent("dragstart" | "drop")` + manually attaching a `dataTransfer` object with `getData` / `setData` shims, then `fireEvent`. Same pattern shell row #5 used for `xai_rail_order` drag tests. |

### 4.1 DataTransfer shim helper

A reusable helper at `__tests__/_helpers/dataTransfer.ts`:

```ts
export function createDataTransferShim(initial: Record<string, string> = {}) {
  const store: Record<string, string> = { ...initial };
  return {
    getData: (k: string) => store[k] ?? "",
    setData: (k: string, v: string) => { store[k] = v; },
    types: Object.keys(store),
    effectAllowed: "all" as const,
    dropEffect: "move" as const,
  };
}
```

---

## 5. Coverage targets

| Metric | Target | Rationale |
|---|---|---|
| Statements | ≥ 90% | Match `plugin-web-storage` baseline. |
| Branches | ≥ 85% | Drag-related branch matrix is the long tail. |
| Functions | ≥ 95% | Small package; few private helpers. |
| Lines | ≥ 90% | — |

Uncovered lines acceptable:

- Error fallthrough branches (e.g. `storage.test.ts`-style "should not happen" defensive guards).
- Dev-only `console.warn` lines (already excluded by the existing `plugin-web-storage` istanbul config).

Coverage is reported by `vitest run --coverage` (the package script
`test:coverage` matches `xai-web-shell`'s convention).

---

## 6. Cross-vendor manual smoke (P3)

Manual smoke matrix. Each row is a `[ ]` checkbox in `dev_log.md` `Verify
Notes` block when `feature-verify` runs.

### 6.1 Browsers + OS

| # | OS | Browser | Drag | Reload | Keyboard fallback | Empty state | RTL bidi |
|---|---|---|---|---|---|---|---|
| 1 | macOS | Safari 17+ | [ ] | [ ] | [ ] | [ ] | n/a |
| 2 | macOS | Chrome (latest) | [ ] | [ ] | [ ] | [ ] | n/a |
| 3 | macOS | Firefox (latest) | [ ] | [ ] | [ ] | [ ] | n/a |

### 6.2 Specific manual checks

- **AC-XVENDOR-1** Drag a card from Q1 to Q2 — the move should be smooth (no
  ghost-card lag on Safari).
- **AC-XVENDOR-2** Reload after drag; the moved card persists in Q2 in all
  three browsers.
- **AC-XVENDOR-3** Drag from Q4 (which uses `var(--accent)`) into Q1; verify
  Q4 then shows empty-state hint, Q1 shows the card.
- **AC-XVENDOR-4** Switch language EN ↔ ZH via the existing Topbar control;
  card titles + quadrant titles update; the drag state is preserved.
- **AC-XVENDOR-5** Keyboard: tab to a card, press `Ctrl/⌘ + ArrowRight`,
  expect the card to move + the focus to follow (focus moves with the card
  to maintain operability).
- **AC-XVENDOR-6** Open the module in two tabs; drag in tab A; tab B updates
  within ~500 ms via cross-tab storage event (matches shell row #5 reference
  pattern).
- **AC-XVENDOR-7** No console errors or warnings in any vendor across all
  flows.

### 6.3 Verify gate exit criteria

For `feature-verify` to flip dev_log to `READY_TO_SHIP`:

- All 7 AC-XVENDOR-* checks pass on all 3 vendors.
- All AC-* automated tests pass via `pnpm --filter @repo/plugin-web-matrix test`.
- `pnpm --filter @repo/plugin-web-matrix check-types` exits 0.
- `pnpm --filter @repo/plugin-web-matrix lint` exits 0 (max-warnings 0).

---

## 7. Test commands

```bash
# Unit + component tests
pnpm --filter @repo/plugin-web-matrix test

# Watch mode (during P2 build)
pnpm --filter @repo/plugin-web-matrix test:watch

# With coverage
pnpm --filter @repo/plugin-web-matrix test:coverage

# Type-check
pnpm --filter @repo/plugin-web-matrix check-types

# Lint
pnpm --filter @repo/plugin-web-matrix lint

# Apps/web integration check (AC-SHELL-3 — runs in apps/web's own suite)
pnpm --filter @repo/web test
```

---

## 8. Verify Cross-vendor: yes

Carried into `dev_log.md` Status Panel. Feature-verify will not flip to
`READY_TO_SHIP` until §6.3 exit criteria are satisfied.
