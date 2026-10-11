# Remaining direct device autosave callers — implementation and acceptance contract

Astra, Web, 2026-09-09. Read-only source baseline **4a66e8696bdd1c350972bd03a1df43879a3cfcf7**. Inputs: [a82 shared contract](../web-d2-async-pref-contract/contract.md), [accepted shared slice](../web-d2-async-pref-astra-hooks/review-20a4591.md), [next-callers inventory](../web-d2-async-pref-contract/next-callers.md), [9aac note contract](../web-d2-dashboard-note-contract/contract.md), and [accepted d129950 note caller](../web-d2-dashboard-note-astra/review-d129950.md). This document authorizes the bounded caller implementation handoff; it is not test execution or acceptance.

**Use two consecutive fixed product batches: Dv1 Dashboard position first; Dv2 Pomodoro's six preferences second.** They share an accepted API but have different gesture/recovery/timer contracts. Independently accept each with its own before/after evidence. Do not hold Dv1 acceptance hostage to Pomodoro, or declare all seven complete after just Dv1. No shared-engine redesign is expected.

## Verified inventory and ownership

A production `*.tsx` search for direct `usePrefAutosave(` (excluding tests) now finds exactly these seven calls. This is a search boundary, not an inventory of all writers. Ownership is explicit in `plugin-web-storage/src/internal/accountOwnership.ts:47,90–95`. The keys are not registry entries; preserve their legacy **JSON codec** even for enum strings. Do not convert JSON `"blue"` into raw `blue`, or make device data account-scoped.

| Caller / logical suffix | Default shown on physical absence | Read domain and user mutation policy |
| --- | --- | --- |
| Dashboard `dashboard_header_note_x` | `0` | Finite JSON number; presentation uses existing round/clamp behavior. Explicit drag writes rounded position inside current lane bounds. Existing numeric bytes are not normalized on mount. |
| Pomo `pomodoro_preset` | `focus-25` | Existing six preset IDs (`focus-25`, `focus-30`, `focus-15`, `break-5`, `break-10`, `break-15`) or `custom`. |
| Pomo `pomodoro_custom_minutes` | `45` | Finite JSON number as the existing numeric preference; presentation/user submission applies existing integer clamp 1–180. Existing finite fractional/out-of-range numeric bytes may be displayed clamped but are not rewritten just by reading. |
| Pomo `pomodoro_display_style` | `apple` | `digital`, `ring`, `clockwise`, `apple`, `minimal`, `focus`. |
| Pomo `pomodoro_theme` | `coral` | `coral`, `amber`, `sage`, `teal`, `blue`, `violet`, `rose`. |
| Pomo `pomodoro_sound` | `soft-chime` | `soft-chime`, `bell`, `digital`, `none`. |
| Pomo `pomodoro_muted` | `false` | Boolean only. |

Use stable dynamic bindings `usePrefAutosaveAsync(suffix, {codec:"json", defaultValue, validate})`. For numbers reject strings, booleans, null, nonfinite values and structured JSON; do not coerce them into a default. Separate compatibility projection from user normalization, so a finite old value can be displayed/clamped without a mount write. Enums reject unknown values. Invalid encoding/domain and read failure retain their raw bytes, show unsaved/source recovery, and cannot become absent initialization permission. Explicit reload can reread a repaired source; it does not itself authorize overwriting a still-invalid source. No new destructive repair/default-reset feature is requested.

`xai_pomodoro_active` and `xai_pomodoro_sessions` remain **account** data (`accountOwnership.ts:41–42`). Their controller, admission, session history, completion event and recovery exports are separate accepted or outstanding work; none is converted to device scope here.

## Shared caller rules for all seven

- Remove the seven legacy write effects only after real handlers use the accepted async path. Retain synchronous APIs for unrelated consumers. No raw set/remove, extra save effect, or success fallback setter in converted paths.
- **No automatic default write on ordinary mount, StrictMode remount, idle render, language change, account change, hydration or source normalization.** Defaults can render while the physical key stays null. A genuine explicit action may persist the same displayed default after obtaining locks and validating the source. Device drag resize policy is specified below.
- Device writes use only `prefMutationLockName(fullPhysicalKey)` exclusive (`prefMutation.ts:33–35,166,223`), never account locks, account marker or tombstone as device admission. Use the public hook; do not duplicate its lock algorithm in the caller. A→B, locked/no-current-account, account migration/deletion must not cancel a valid device operation or change its physical key. Hook unmount/disposal still invalidates that instance's queued work.
- One hook/controller value or an explicitly justified gesture-local draft owns each current selection. Avoid reintroducing a stale second local state that reappears after external events/reset/retry. Keep immediate UI feedback and allow newer edits during an outstanding write. Saved applies only to the latest verified choice; a previous success cannot clear a later pending/error/conflict.
- Same-key source/base checks and uncertainty stay in the engine. Unchanged failed intent invokes hook retry, preserving its opaque token; a new normalized intent invokes edit and gets no old-token authority. Duplicate Retry shares the attempt, does not issue another write. Pending failures do not loop automatically.
- Same-tab and cross-document clean changes project through the hook. Dirty gesture/selection keeps its local intent and refuses unexpected external raw. Offer a narrow explicit reload/discard for a conflicted device preference/gesture if needed; Retry cannot silently rebase. No new revision key/journal or multi-key transaction.
- Await/handle actual Promise results, including rejection. Async recovery controls must not use `.saved` or boolean truthiness from the removed legacy hook. Aggregate pending/error truthfully without treating one key's success as all Saved. A settings choice remains effective on this page while its persistence fails, with existing recovery text/export preserved.
- **Reset distinction:** neither product currently has a preference-key reset action. Do not add one merely to exercise the shared hook. Pomodoro's timer Reset must not call preference reset or remove any of the six keys. Dashboard note Clear still writes account string `""`, and does not reset position. Existing shared reset/remove contracts stay accepted; a future preference-reset UI is separate scope.
- New keys, account ownership changes, shared activation, all-client fencing, providers, global Reset Settings and account lifecycle implementation are excluded. Current participating device writers coordinate; unconverted/old code does not become fenced by this migration.

## Dv1 — Dashboard device position

### Current issues and chosen gesture semantics

`DashHeader.tsx:187,193–201,209,216–227,265–270,378–410` currently maintains a separate offset value and legacy mount effect. Its `readRaw` first calls `accountScope.assertCurrent` on the component's original account even for `dashboard_header_note_x`: after an account switch, device drag/retry/resize can be rejected by the stale account. Initial raw exceptions are folded into null in the shared legacy baseline initializer. These are source findings; the parent subsequently independently reproduced all three caller gaps at fixed 52a9207 (commit 9693b3e), as described below. I did not execute those probes in this architecture task. The prior content-only acceptance intentionally allowed device mount `0`; **Dv1 changes that requirement** to no automatic device default persistence.

Use an explicit drag session capturing device physical key, strict raw baseline and gesture ID before the first local movement. Pointer movement updates the visible clamped offset immediately. **Persist the final moved offset on pointer-up (and the existing pointer-cancel termination path)** through the async hook; a click/no movement must not save. This coalesces a drag into a clear explicit operation without changing final drag position. Preserve pointer capture/release, >3px movement threshold, suppression of the subsequent edit click and current integer/lane clamp. Do not issue one raw write per pointer movement.

The caller-local gesture is analogous to the accepted note editor: while it is gathering movement the hook can still be clean. Compare the captured raw against strict current bytes and the hook raw immediately before enqueueing; then the engine repeats its own baseline check under the device key lock. Do not treat a read exception as absence. A storage event during the drag cannot rebase it implicitly. Only verified predecessor success may advance the baseline for a newer local gesture/operation.

A second drag can be collected while the earlier final position is pending. Track submitted position/operation and newer gesture separately so the old completion never snaps the visual position back or marks the newer position Saved. Unchanged Retry after readback uncertainty must reconcile with one physical write; changed latest position remains a new normal-baseline edit.

Resize is a **presentation clamp**, not user authorization to seed/rewrite storage. Recompute the visible lane-safe position without a persistence effect. Preserve the desired stored coordinate so a later larger lane may display it again; a subsequent explicit drag starts from the actual displayed position and persists its final clamped value. No mount/resize callback may write `0` or a normalized old value. Keep the export's `noteOffset` equal to the latest visible/recoverable position, not a discarded old promise result.

### Account note and recovery boundary

Remove original-account authorization only from device position reads/writes. Keep the accepted account note's session/owner/raw checks, mask on A→B, string Clear, unchanged-token Retry, editor close conditions and new normalized Retry intact. Device success cannot clear a frozen/failed account note. A pending device drag/retry survives A→B even while the old account note is frozen; its physical key remains the unscoped device key.

The aggregate recovery section and beforeunload protection cover a dirty drag, pending final position, failed/conflicted position and unsaved note independently. Clear the warning only when all relevant current intents are verified or deliberately discarded. A no-session position-only export continues to produce `dashboard-note-draft.json` with `{version:1,kind:"dashboard-note-draft",note:<safe current note>,noteOffset:<latest position>}`. Frozen old-account note exports still refuse under B; do not enable them just because a device preference is account-independent. Preserve URL/download failure feedback and draft retention. This does not make note/position persistence atomic.

## Dv2 — Pomodoro six device preferences

### Exact action mapping

`PomodoroModule.tsx:205–250` currently initializes six local states, sanitizes them, then mounts six JSON write effects. Replace those bindings and wire every existing producer, not just JSX controls:

| Producer | Async device action, with existing local/timer behavior |
| --- | --- |
| `handlePresetClick`, custom input focus | Edit only preset to the selected allowed ID. Keep idle timer preview/reset logic and disabled-while-active controls. |
| `handleCustomMinutesChange` | Normalize finite input to integer 1–180; edit minutes and preset=`custom` as two tracked writes. Keep immediate current-page timer preview. |
| Style/theme buttons, sound select | Validate selected domain, edit that key. Keep actual style/hue, sound preview and fullscreen behavior. |
| Mute toggle | Toggle from the latest visible pending draft, with a current-value ref/controller to avoid rapid clicks reading stale render state; edit boolean. No stale closure or serialized string boolean. |
| `onTickToZeroRef.current` lines 284–309 | Its actual committed timer-completion callback already advances the preset to the next mode. Route this authorized completion consequence through one explicit preset edit; retain immediate next-mode timer reset/notice. Do not move this to a hydration/effect that writes on every mount. |

The last row is an important non-click producer: a timer previously started by the user may finish after restoration. Its **actual account-controller committed completion callback** can produce the normal device preset transition; merely mounting with historical sessions or projecting an idle timer cannot. Do not relax the timer's ownership/completion dedup checks or invoke fake completion just to save a preset. A failed device preference write must not roll back an already committed account session, block notification/next-mode UI, reappend history, or trigger another timer completion. Conversely a successful preference write is not proof that timer state/history saved.

Custom minutes+custom preset are deliberately two physical keys. Do not claim atomicity or silently roll back one successful key after the other fails. The current UI may continue using its chosen pair; group recovery remains visible until all currently intended keys are verified. Retry only unresolved keys using their own original operation/token; it must not overwrite an externally changed successful sibling. Export the entire latest six-choice snapshot so a partial save is recoverable.

### Recovery and timer separation

Preserve the current `preferenceRecovery.test.tsx` contract: quota on theme leaves old physical bytes, later violet remains selected, export reports violet, Retry writes JSON `"violet"` and removes only the preference error. Retain `pomodoro-preferences.json`, `{version:1,kind:"pomodoro-preference-draft",values:{preset,customMinutes,displayStyle,theme,sound,muted}}`, export setup failure text and latest choices. Device preference export requires no account recovery permission. Timer `pomodoro-recovery.json`, error/status and Retry save remain distinct and retain their owner restrictions.

Add accessible EN/ZH pending/failure/retry feedback for preference writes and explicit conflict reload/discard as appropriate. No new Save footer, durable draft store or timer behavior is requested. Pomodoro currently has no preference beforeunload guard; this migration does not require adding one. Do not present a pending/failed preference as saved before navigation. Preserve active/running/paused state while changing appearance, and keep preset/minutes disabled while non-idle. Timer Reset/Start/Pause/Resume/Stop and keyboard/fullscreen/audio semantics remain unchanged.

## File ownership and test-fixture changes

| Batch | Caller ownership | Existing tests requiring review/async adaptation |
| --- | --- | --- |
| Dv1 | `packages/xai-web-dashboard-grid/src/DashHeader.tsx`; optional one small package-local gesture helper; minimal existing recovery labels/styles only when necessary | `DashHeader.test.tsx`, `DashHeader.recovery.test.tsx`, `DashHeader.async.test.tsx`, optional new device-position test/helper. Package `src/__tests__/setup.ts` only if needed for native-signature named locks/pointer fidelity. |
| Dv2 | `packages/plugin-web-pomodoro/src/PomodoroModule.tsx`; optional small local preference hook/helper; minimal EN/ZH feedback styles | `src/__tests__/preferenceRecovery.test.tsx`, preference cases in `PomodoroModule.test.tsx`, focused new six-preference tests; `vitest.setup.ts` native-signature named-lock adapter. |

Pomo's current setup exposes two-argument `locks.request(name, run)` with a per-name queue. The accepted async device path calls the native three-argument signature; update the fixture to `(name, options, callback)` with proper name/mode queues, not product arity fallback. Its fake timers must await real save microtasks separately from timer advancement. Do not use a global promise tail that deadlocks nested locks, or change business assertions merely to avoid a timeout. Add complete account markers only where actual account timer APIs need them; prove the seven device writes also work with no account marker. Preserve timer assertion coverage (`useTimerTick`, durableSession, eventEmit and Module timer cases); do not alter timer product code in Dv2.

Dv1 legitimately replaces the old `offset === "0"` mount assumption with physical null when no fixture value was seeded. Preserve the original quota/latest-position/external-conflict oracle using either explicit initial raw seeding or the actual null baseline. A fixture seed is not a user save. Old before logs remain unchanged. The accepted account-note eleven assertions should be retained; an explicit initial device `0` fixture remains valid for those unchanged content-scope tests.

Shared storage engine/hooks, accountOwnership/registry, account/session controllers, global reset/provider code and parent/Astra evidence are not implementation ownership. A genuine shared-interface blocker must be reported rather than bypassed. Author may maintain new author evidence and precisely mark converted keys in next-callers/checklist, without declaring the whole writer inventory complete.

## Independent before oracles and minimum acceptance chain

Parent **9693b3e** already supplies the first Dv1 baseline: fixed 52a9207, actual DashHeader with jsdom storage and named locks, **3/3 correct FAIL** for absent mount, early write under the held physical-key lock, and mounted clean A→B drag refusal. Read [parent report](../web-d2-device-offset-independent/review.md), preserve its [raw log](../web-d2-device-offset-independent/independent-before-52a9207.log), and rerun its exact assertions unchanged. This is parent component execution, not native browser evidence or an execution by Astra. It does not retract the account-content acceptance.

The rest of this matrix is planned acceptance, **not executed results in this document**. Preserve fixed before logs and run unchanged business assertions after the corresponding caller revision.

| Layer | Dv1 position | Dv2 six preferences |
| --- | --- | --- |
| Baseline/no seed | Mount absent position, rerender/resize: physical null. Existing old behavior is expected to expose mount `0`. | Mount idle with all six absent: every key remains null. Existing six write effects are expected to fail this. All valid saved JSON values round-trip without rewrite; invalid/null/unavailable source remains unchanged. |
| Actual key lock | Hold `prefMutationLockName(positionKey)` exclusive, real drag/up: latest position visible, old raw unchanged/pending, release yields final integer. | Parameterize real controls over all six keys: held corresponding key lock retains old bytes and latest selection until release. Missing/rejected locks refuse without raw fallback. |
| Device/account boundary | Start component in A, switch B/locked without remount, drag/retry still works; a held account lifecycle lock alone cannot delay device write. Keep old note Retry/Export refusal. | All six physical keys remain identical across A→B/locked; pending preference completion survives account change. Independent account-active/history sentinels remain unchanged by preference-only actions. |
| Ordering/conflict | Drag 1 pending → newer drag 2; local drag then external event; replacement during key-lock wait; duplicate Retry. Current position survives and external bytes are never implicitly overwritten. | Rapid theme/mute/custom changes; clean cross-document projection; dirty conflict; custom-pair partial failure with sibling external change. Latest selection/retry result belongs to the right key and sequence. |
| Failure/recovery | Actual set fault, readback uncertainty/one-write Retry, changed latest retry; beforeunload; actual position-only Blob/export and export fault; accepted account-note eleven controls. | Parameterized six write faults; latest choice remains usable; group Retry only unresolved keys; uncertainty on a representative key/one-write retry; actual six-value Blob and export fault. Do not fabricate UI success by raw write. |
| Existing product | Pointer/clamp/resize/click suppression, greeting/Add/language, account note Save/Clear/session/export. | Preset/custom idle duration, running-disabled inputs, styles/hues, sound/mute/preview, fullscreen and timer Reset do not remove preferences; actual committed completion advances preset once without changing session dedup. |
| Native + fixed regression | Actual Chrome drag under device lock and quota/uncertain retry; no-marker/A→B; cross-document clean projection; downloaded JSON; persisted reload. Dashboard full package/types. | Actual Chrome at least one numeric/preset and one appearance control under key lock, six-key saved reload and real export; two-document same-key conflict/projection. Pomo full package/types, timer regression preserved. |

Choose bounded representative native fault/lock cases in addition to the component matrix; do not multiply identical browser cases to manufacture coverage. If an original package test fails from the old lock signature, retain its failure log and clearly label the fixture-only repair. Shared C/D1/D2 foundations need no blanket rerun if their source remains unchanged; retain their accepted dependency evidence.

Completion means the seven enumerated direct device-autosave consumers use the supported async path, with individual Dv1/Dv2 evidence. It does **not** mean every `usePref`, scoped/direct writer, active timer/history, account lifecycle, global reset or old client has migrated, and it closes no full D2/AI-02/REL-05/Dashboard/Pomodoro product-wide gate.
