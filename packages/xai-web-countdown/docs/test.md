# Test Strategy — xai-web-countdown

> Acceptance criteria grid + concrete test mapping. Each AC row maps to one
> or more test cases under `packages/plugin-web-countdown/src/__tests__/`
> (created during P3). The Manual Verify section (§5) is the cross-vendor
> gate that READY_TO_SHIP depends on (per row #17 manifest entry
> `Verify Cross-vendor: yes`).

## §1 Toolchain

- Unit / component tests: Vitest + `@testing-library/react@^16` (same
  versions as sibling rows shipped from W1).
- Test environment: `jsdom@^26`.
- React 19 + StrictMode in every test root.
- Mock strategy:
  - `@repo/plugin-web-storage`'s `usePref` is consumed for **real**
    (real localStorage-backed). Tests use
    `beforeEach(() => localStorage.clear())`.
  - `@repo/plugin-web-tokens`'s `useI18n` is consumed for **real**.
  - `@repo/xai-web-shell` — only types are imported. The
    `WebModuleSlotRegistration` shape is asserted via a barrel test
    (B-type-check).
  - `setTimeout` / `Date.now()` mocked via `vi.useFakeTimers()` +
    `vi.setSystemTime()` for the live-days hook.
  - `HTMLDialogElement.prototype.showModal` / `close` polyfilled in
    `vitest.config.ts` `setupFiles` for jsdom — jsdom doesn't implement
    `<dialog>` natively; we attach minimal shims.
  - `crypto.randomUUID` NOT used — id generation uses `Math.random` and is
    deterministic-overridable in tests via `vi.spyOn(Math, "random")`.
- Lint: 0 warnings (`pnpm --filter @repo/plugin-web-countdown lint`).
- Coverage target: ≥ 90% statements and branches inside
  `packages/plugin-web-countdown/src/` (excluding `__fixtures__/` and
  `__tests__/`).

## §2 Test File Inventory (planned)

| File | Tests | Purpose |
|---|---|---|
| `src/__tests__/index-barrel.test.ts` | B1..B5 | Public surface is exactly what api.md §0 lists; no deep imports succeed; type-shape asserts via `expectTypeOf` |
| `src/__tests__/computeDaysUntil.test.ts` | C1..C12 | Pure function: today=0, future=+N, past=-N, DST forward/backward, leap day, year boundary, invalid date → NaN |
| `src/__tests__/useDaysUntil.test.tsx` | H1..H6 | Hook: initial value, midnight rollover via fake timers, visibilitychange recompute, StrictMode double-mount cleanup, unmount clears timer |
| `src/__tests__/validate.test.ts` | V1..V8 | `isCountdownCard` accepts valid; rejects missing id, missing title.en, missing title.zh, missing target_date, wrong variant, image with null cover, light with non-null cover, extra fields tolerated |
| `src/__tests__/cardsReducer.test.ts` | R1..R8 | Pure mutations: addCard appends with new id, addCard generates unique ids on collision, updateCard patches one card, updateCard no-op on missing id, deleteCard removes target, deleteCard no-op on missing id, immutability check (input unchanged), order preserved |
| `src/__tests__/presets.test.ts` | P1..P3 | IMAGE_PRESETS frozen, all ids unique, gradient strings parse as CSS (smoke regex) |
| `src/__tests__/formatTargetLabel.test.ts` | F1..F5 | Current-year `2026-10-01` → `10/1`; cross-year `2027-01-15` → `1/15/27`; both langs handled |
| `src/__tests__/CountdownCardView.test.tsx` | CV1..CV6 | Renders title (lang-correct), renders days number, applies `cd-card light` class when variant=light, applies inline gradient when variant=image preset, "days since" label when target is past, click handler fires |
| `src/__tests__/AddCountdownCard.test.tsx` | A1..A3 | Renders "Add Countdown" (en) / "新建倒计时" (zh); click fires onClick; receives focus on Tab |
| `src/__tests__/CountdownEditDialog.test.tsx` | E1..E12 | Create mode: opens via showModal, EN+ZH inputs, date input, variant radios, preset picker (hidden when variant=light, visible when image), Save calls onSave with form data, Cancel calls onCancel, Escape closes, validation empty-title disables Save, invalid date disables Save, Delete only shown in edit mode, Delete fires onDelete |
| `src/__tests__/CountdownModule.test.tsx` | M1..M10 | Empty state (no cards) shows only AddCountdownCard; adds card → persists to xai_countdowns; edit existing → persists patch; delete → persists removal; midnight tick recomputes all days; lang switch re-renders labels; corrupted localStorage entry is filtered & DEV warn; StrictMode no double-persist; cards survive remount; header `+` opens create modal |
| `src/__tests__/registration.test.tsx` | RG1..RG3 | `countdownWebModuleRegistration` satisfies `WebModuleSlotRegistration`; moduleId/icon/railOrder/i18nKey match design.md §3.1; defaultChildPath empty + 2 children entries |

## §3 Acceptance Criteria Grid

### AC-SCHEMA (Storage shape)

| AC | Statement | Test |
|---|---|---|
| AC-SCHEMA-1 | `xai_countdowns` value is `CountdownCard[]` (array; never object) | M1, V1 |
| AC-SCHEMA-2 | New card persists immediately to localStorage | M2 |
| AC-SCHEMA-3 | Updates patch only the addressed card; siblings unchanged | M3, R3 |
| AC-SCHEMA-4 | Delete removes the addressed card; siblings preserved | M4, R5 |
| AC-SCHEMA-5 | Corrupted localStorage entry (missing field) filtered out | M7, V2..V8 |
| AC-SCHEMA-6 | `variant="light"` with non-null cover_url rejected | V7 |
| AC-SCHEMA-7 | `variant="image"` with null cover_url rejected | V6 |
| AC-SCHEMA-8 | Cards round-trip across mount/unmount | M9 |

### AC-DAYS (Live remaining-days)

| AC | Statement | Test |
|---|---|---|
| AC-DAYS-1 | Future target shows positive integer | C1, CV2 |
| AC-DAYS-2 | Past target shows positive integer with "since" label | C2, CV5 |
| AC-DAYS-3 | Today's date shows `0` | C3 |
| AC-DAYS-4 | At local midnight rollover, days decrement | H2, M5 |
| AC-DAYS-5 | DST forward (US 2026-03-08) — boundary day is exactly 1 day | C5 |
| AC-DAYS-6 | DST backward (US 2026-11-01) — boundary day is exactly 1 day | C6 |
| AC-DAYS-7 | Leap day 2024-02-29 → 2024-03-01 = +1 day | C7 |
| AC-DAYS-8 | Year boundary 2026-12-31 → 2027-01-01 = +1 day | C8 |
| AC-DAYS-9 | Invalid `target_date` → display `—` (NaN handled) | C12, CV-extras |
| AC-DAYS-10 | `visibilitychange` event recomputes days | H3 |
| AC-DAYS-11 | One timer per module (NOT per card) — measured via spy count | H1 |
| AC-DAYS-12 | StrictMode double-mount cleans up without double-timer leak | H4 |

### AC-VARIANT (Visual rendering)

| AC | Statement | Test |
|---|---|---|
| AC-VARIANT-1 | `variant="light"` adds `.light` class to `.cd-card` | CV3 |
| AC-VARIANT-2 | `variant="image"` applies `background-image: <gradient>` via preset lookup | CV4 |
| AC-VARIANT-3 | `cover_url="preset:dusk"` resolves to IMAGE_PRESETS[0].gradient | CV4 |
| AC-VARIANT-4 | `cover_url="preset:unknown"` falls back to first preset + DEV warn | CV-fallback |
| AC-VARIANT-5 | `.cd-overlay` rendered only when variant="image" (per prototype) | CV3, CV4 |
| AC-VARIANT-6 | Both variants render the same numeric font + size (token-consistent) | CV1 visual snapshot |

### AC-CRUD (Add / Edit / Delete)

| AC | Statement | Test |
|---|---|---|
| AC-CRUD-1 | AddCountdownCard click opens modal in create mode | M10, E1 |
| AC-CRUD-2 | Header `+` button opens modal in create mode | M10 |
| AC-CRUD-3 | Existing card click opens modal in edit mode (Delete button visible) | E11 |
| AC-CRUD-4 | Save with valid form persists & closes modal | E6, M2 |
| AC-CRUD-5 | Cancel closes modal without persisting | E7 |
| AC-CRUD-6 | Escape key closes modal | E8 |
| AC-CRUD-7 | Backdrop click closes modal | E-backdrop |
| AC-CRUD-8 | Empty title (both langs blank) disables Save | E9, M-validation |
| AC-CRUD-9 | Invalid date disables Save | E10 |
| AC-CRUD-10 | Delete button removes card & closes modal | E12, M4 |
| AC-CRUD-11 | Variant radio change toggles cover preset picker visibility | E5 |
| AC-CRUD-12 | Switching variant=image→light clears cover_url in submission payload | E-clear-cover |

### AC-I18N (Bilingual)

| AC | Statement | Test |
|---|---|---|
| AC-I18N-1 | `lang="en"` renders "Countdown" title | CV1-en |
| AC-I18N-2 | `lang="zh"` renders "倒计时" title | CV1-zh |
| AC-I18N-3 | `lang="en"` shows "Days until" / "Days since" labels | CV2-en, CV5-en |
| AC-I18N-4 | `lang="zh"` shows "距离" / "已过" labels | CV2-zh, CV5-zh |
| AC-I18N-5 | Lang switch at runtime re-renders all labels without remount | M6 |
| AC-I18N-6 | AddCountdownCard shows "Add Countdown" / "新建倒计时" per §4.2 | A1 |
| AC-I18N-7 | Modal form labels switch language per §4.2 table | E-i18n |

### AC-REGISTRATION (Shell slot)

| AC | Statement | Test |
|---|---|---|
| AC-REG-1 | `countdownWebModuleRegistration` satisfies `WebModuleSlotRegistration` type | RG1 |
| AC-REG-2 | `moduleId="countdown"`, `icon="countdown"`, `railOrder=10`, `i18nKey="nav.countdown"` | RG2 |
| AC-REG-3 | `defaultChildPath=""`, `children` has `""` + `"*"` entries | RG3 |

### AC-BARREL (Public surface)

| AC | Statement | Test |
|---|---|---|
| AC-BARREL-1 | `index.ts` exports `CountdownModule`, `countdownWebModuleRegistration`, `IMAGE_PRESETS` | B1 |
| AC-BARREL-2 | `index.ts` exports types `CountdownCard`, `CountdownVariant`, `ImagePresetId`, `ImagePreset` | B2 |
| AC-BARREL-3 | No other exports leak | B3 |
| AC-BARREL-4 | Deep import from `src/internal/*` is forbidden by `package.json` exports | B4 (typecheck) |
| AC-BARREL-5 | Type shape of `CountdownCard` matches api.md §1.2 byte-for-byte | B5 (`expectTypeOf`) |

## §4 Test mock fixtures

### `src/__fixtures__/cards.ts`

```ts
export const FIXTURE_FUTURE: CountdownCard = {
  id: "cd_test01",
  title: { en: "Weekend", zh: "周末" },
  target_date: "2026-05-30",
  variant: "image",
  cover_url: "preset:dusk",
};

export const FIXTURE_PAST: CountdownCard = {
  id: "cd_test02",
  title: { en: "Using XAI", zh: "使用 XAI" },
  target_date: "2020-02-20",
  variant: "image",
  cover_url: "preset:sand",
};

export const FIXTURE_LIGHT: CountdownCard = {
  id: "cd_test03",
  title: { en: "Spring Festival", zh: "春节" },
  target_date: "2027-02-06",
  variant: "light",
  cover_url: null,
};

export const FIXTURE_INVALID: unknown = {
  id: "cd_bad",
  title: { en: "Missing ZH" },  // missing title.zh — should fail predicate
  target_date: "2026-12-31",
  variant: "light",
  cover_url: null,
};
```

### `vitest.setup.ts` (root jsdom shim)

```ts
// jsdom doesn't implement HTMLDialogElement methods — shim:
if (typeof HTMLDialogElement !== "undefined") {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function() {
      this.setAttribute("open", "");
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function() {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  }
}

// Set a stable test "now" for date math
const TEST_NOW = new Date(2026, 4, 23, 14, 30, 0); // 2026-05-23 14:30 local
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(TEST_NOW);
});
afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});
```

## §5 Manual Verify (Cross-vendor — required for READY_TO_SHIP)

Per row #17 `Verify Cross-vendor: yes`. The following checklist MUST be
walked in all three target browsers before `feature-verify` flips to
READY_TO_SHIP.

### Browsers in scope

- Chrome latest (Chromium 120+)
- Safari 17+ on macOS
- Firefox latest (122+)

### Manual checklist

| # | Step | Expected | Browsers |
|---|---|---|---|
| MV-1 | Navigate to `/app/countdown` from rail click | Module mounts; URL becomes `/app/countdown`; AppRail Countdown button highlighted | All 3 |
| MV-2 | Empty state (clear localStorage first, reload) | Only "Add Countdown" card visible | All 3 |
| MV-3 | Click "Add Countdown" | Modal opens, focus moves into Title (EN) input | All 3 |
| MV-4 | Fill Title EN="Test", Title ZH="测试", date=tomorrow, variant=light, click Save | Card appears in grid showing `1` and "Days until 5/24" (or current "tomorrow"); modal closes | All 3 |
| MV-5 | Click the new card | Modal reopens in edit mode with fields pre-filled; Delete button visible | All 3 |
| MV-6 | Change variant to Image, pick "dusk" preset, Save | Card re-renders with dark gradient + white numerals + overlay | All 3 |
| MV-7 | Click card → Delete | Card disappears; only AddCountdownCard remains | All 3 |
| MV-8 | Reload page | Created cards persist (test with 2 cards, both variants) | All 3 |
| MV-9 | Switch lang en↔zh via Topbar | Header title flips "Countdown" ↔ "倒计时"; "Days until" ↔ "距离"; "Add Countdown" ↔ "新建倒计时"; preserved card titles use the correct lang key | All 3 |
| MV-10 | Set system clock 23:59:50 with a card target=tomorrow open, wait 10s past midnight | Days number decrements from `1` to `0` (or "today" rendering) without reload | All 3 (manually) |
| MV-11 | Hide tab + advance system clock by 1 day + restore tab | `visibilitychange` triggers recompute; all cards' days correct | All 3 |
| MV-12 | Press Escape inside open modal | Modal closes; no save | All 3 |
| MV-13 | Click backdrop outside modal | Modal closes; no save | All 3 |
| MV-14 | Tab through modal form | Focus cycle stays inside dialog (focus trap) | Safari + Firefox especially (Safari's `<dialog>` focus-trap regressed in some versions) |
| MV-15 | Lighthouse a11y check on /app/countdown | Score ≥ 95 | Chrome |
| MV-16 | View card with light variant in dark theme | Card still uses `--bg-panel` token; numerals still legible | All 3 |
| MV-17 | View card with image variant in dark theme | Card still has high-contrast white text on gradient (overlay applied) | All 3 |

### Cross-vendor concerns (smoke-test priority)

- **Safari**: `<dialog>` focus trap, `setHours()` DST behavior on macOS, gradient rendering parity.
- **Firefox**: `<dialog>` backdrop click handling, `Intl.DateTimeFormat` for compact M/D label.
- **Chrome**: baseline (used during dev).

If MV-10 cannot be performed reliably (most test machines auto-sync time),
substitute with a Vitest fake-timer test that asserts the timer fires + recomputes —
covered by H2.

## §6 Coverage gates

- Statements: ≥ 90% inside `packages/plugin-web-countdown/src/`
- Branches: ≥ 85% (the modal form has many validation branches; 90% is
  reachable but 85% is the gate)
- Functions: 100% (small surface)
- Excluded from coverage: `__tests__/`, `__fixtures__/`, `styles.css`,
  type-only files.

## §7 Lint + Type-check gates

- `pnpm --filter @repo/plugin-web-countdown lint` — 0 warnings, 0 errors
- `pnpm --filter @repo/plugin-web-countdown typecheck` — 0 errors
- `pnpm --filter apps/web typecheck` — 0 errors (catches host-side
  registration import after P3)
- `pnpm --filter apps/web build` — Vite build green (catches CSS / module
  resolution issues)

## §8 Sibling-row interference matrix

Concurrent W2 siblings (#13 matrix, #19 pet) may also be editing
`apps/web/src/routes/modules/shellRegistrations.tsx` in their own P3.
Possible interactions:

| Sibling change | Our change | Interaction |
|---|---|---|
| `placeholder("matrix", ...)` → matrixWebModuleRegistration | `placeholder("countdown", ...)` → countdownWebModuleRegistration | Different lines; no logical conflict; git merge clean |
| `placeholder("pet", ...)` — note: pet has `showInRail: false` in some plans | `placeholder("countdown", ...)` | Different lines; clean |

**Test gate:** after our P3 lands, sibling rebases land cleanly on the
single-line edit. The test suite asserts `webShellModuleRegistrations.length`
unchanged (12 entries) — regression test if a sibling accidentally drops
our entry.

## §9 Test execution order

1. `pnpm --filter @repo/plugin-web-countdown lint`
2. `pnpm --filter @repo/plugin-web-countdown typecheck`
3. `pnpm --filter @repo/plugin-web-countdown test -- --coverage`
4. `pnpm --filter apps/web typecheck` (only after P3 wires registration)
5. `pnpm --filter apps/web build`
6. Manual cross-vendor walkthrough §5

All gates green ⇒ READY_FOR_VERIFY.

---

## §10 V2 Verification Addendum — 2026-06-04

Additional automated coverage added for the formal countdown-system upgrade:

- `presetCards.test.ts`: nine default presets, Spring Festival target date, and
  deleted preset non-reinjection.
- `cardsReducer.test.ts`: soft delete, hide, pin, duplicate, restore.
- `CountdownModule.test.tsx`: default presets on empty storage, soft-delete
  history state, persistence after create/edit, remount round trip.
- Existing card/dialog tests updated for V2 fields while preserving legacy v1
  storage fixtures.

Current package verification:

```bash
pnpm --filter @repo/plugin-web-countdown typecheck
pnpm --filter @repo/plugin-web-countdown test
pnpm --filter @repo/plugin-web-countdown lint
```

Expected result after this addendum: 13 test files, 118 tests, 0 lint warnings,
and clean TypeScript.

Host/browser verification performed in the V2 session:

```bash
pnpm --filter @repo/web check-types
pnpm --filter @repo/web test
pnpm --filter @repo/web build
pnpm --filter @repo/web dev:mock-auth
```

Chrome CDP smoke on `http://localhost:3002/app/countdown` covered:

- Empty storage injects 9 dynamic presets.
- Cards, compact list, timeline, calendar, and history views render.
- Create, edit, copy, delete, hide, history restore, and reload persistence work.
- Edited custom card persists `display_style="ring"` and `layout="split"` with
  both countdown and progress enabled.
- Deleted copies remain in history; deleted presets are not re-injected by the
  preset merger.
- Desktop card overflow guard: first 10 cards report
  `scrollHeight <= clientHeight`; screenshots saved at
  `/tmp/xai-countdown-desktop-fixed.png` and `/tmp/xai-countdown-mobile.png`.
- Dark-theme guard: `xai_pref_theme="dark"` reload sets
  `<html data-theme="dark">`, renders visible card titles, and reports 0 card
  overflows.

## §11 V2.1 Interaction Polish Addendum — 2026-06-04

Additional coverage:

- `cardsReducer.test.ts`: `reorderCards()` persists manual drag order by
  updating `sort_order` without reordering the storage array.
- `CountdownModule.test.tsx`: compact-list subview keeps overview/tabs visible,
  exposes Back to board, and returns to the card board.
- `CountdownModule.test.tsx`: drag/drop between active cards persists an order
  where the dropped card's `sort_order` precedes the target card.
- `CountdownEditDialog.test.tsx`: invalid saves use `aria-disabled` plus inline
  guidance and do not call `onSave`; valid saves include required target time.

Manual/browser gates for this polish:

- Hover on a desktop card hides low-frequency actions at rest and fades them in
  on hover/focus.
- Switching to list/timeline/calendar/history keeps the sticky control strip and
  Back to board entry visible.
- Dragging a card shows a drop target placeholder and persists order after
  reload.
- Product UI labels use neutral progress naming; no third-party product names
  are visible in card style chips or edit options.
