# Settings Smart Lists — next D2 caller contract

Astra, Web, 2026-09-09. **Ready for Terra implementation as one bounded caller batch:** all twelve visibility controls in Settings → Smart Lists, backed by the existing account-owned `xai_pref_smart_lists` JSON map. This is a plan and acceptance contract, not a completed migration. It follows [the D2 entry contract](../web-board-workspace-astra-review/20260909-d2-implementation-entry-contract.md) and [a82 async-pref contract](../web-d2-async-pref-contract/contract.md); accepted engine650/hooks20a and caller slices remain accepted.

Source reference: **40079c7**; relevant Smart Lists/storage source is identical to the fixed **ce38758** inventory. See [source classification](inventory-review.md). Parent **b3ecc69** independently executes the unchanged source at **3b02e2a**: [four actual-pane baseline assertions](../web-d2-smart-lists-independent/review.md), **3 correct FAIL / 1 control PASS**. Those assertions and before log must remain intact. Parent **d633e22** adds the separate [actual Chrome baseline](../web-d2-smart-lists-native/review.md) on the same source: **3 correct FAIL / 1 control PASS**. Its after-only whole-process reopen checks have not run/passed on the failing before version; CSS was intentionally omitted, so that probe is functional evidence only.

## Product boundary and current behavior

`packages/plugin-web-settings-rest/src/panes/smartListsPane.tsx` is the sole key-specific ordinary UI writer found for this setting. One `usePref` setter is invoked by twelve rendered select handlers; this is one complete settings map with twelve edit producers, not twelve keys. Existing sections and EN/ZH names/options stay intact:

| Group | Row IDs |
| --- | --- |
| Default lists | `all`, `today`, `tomorrow`, `next7`, `assigned`, `inbox`, `summary` |
| Organize | `tags`, `filters` |
| Others | `completed`, `wont_do`, `trash` |

Each selectable value is exactly `show`, `if-not-empty`, or `hide`. There is no Save footer, pane Reset, export/download, beforeunload handler or durable draft store today. Do not add those unrelated workflows. Keep changes live in the current pane and show truthful pending/error/recovery alongside it. This slice changes preference persistence, **not Tasks filtering or which list data exists**: the Tasks package does not currently consume this setting to implement its own filters. Do not wire in a new Tasks feature as part of D2.

Registry `registry.ts:575–582` defines JSON, schemaVersion1, default `{}`; `accountOwnership.ts:98` explicitly declares account. Preserve the same logical/physical key, scoped owner and JSON representation. In actual current rendering, `{}` and sparse objects are truthy maps: missing rows resolve with `?? "show"`. Thus **all twelve absent rows show `show`, including assigned/wont_do**. The file's `DEFAULT_MAP` with two `if-not-empty` values is only its non-object fallback; it must not become a new mount seed or migration default. Parent's absent-control PASS locks this behavior.

Other ways the key can change remain separate: the generic pref APIs, lifecycle migration/import/deletion, and `plugin-web-settings-shell/src/internal/resetAllPrefs.ts` registry-wide synchronous removal. This batch coordinates the pane and observes external changes; it does not convert the global reset writer, all account writers or open coordinated admission.

## Schema and compatibility decision

Implement a stable **caller-owned validator**, colocated or in a narrow Smart Lists helper. A shared registry/engine/migration schema extension is unnecessary for this slice and is not part of its ownership.

- Accept a non-null, non-array JSON object whose own enumerable values are strings. Empty `{}` and sparse maps are valid. For each of the twelve known row IDs that is present, require one of the three supported values; reject invalid known modes, null fields and non-string values.
- Preserve unknown string-valued extension keys exactly when editing a known row. Do not demand all twelve keys, fill missing rows, strip unknown fields or normalize stored order/format merely on read. Prototype-named own keys are data: inspect own properties, never inherit a row value or use assignment that changes a prototype.
- Physical absence allows the registered empty map as the first edit base. JSON `null`, arrays, scalars, malformed JSON, invalid known modes and read exceptions are invalid/unavailable, **not absence**. Preserve exact physical bytes, show source recovery, and refuse edits that would overwrite that source. The fallback view may show the safe empty-map display with a visible error; it must not claim the bad value was saved or silently repair it.
- DOM input must also pass the known-row/value allowlist; a forged option/string is not write authority. Verify intended output with the same validator before persistence.
- Legacy string extension values remain compatible with the current generic migration string-map validator. Do not tighten migration semantics in this caller task. A valid empty object remains empty until an explicit edit; normal full/sparse legacy maps are read as-is.

## Actual implementation API and operation contract

Use the accepted registered overload, conceptually:

`usePrefAutosaveAsync("xai_pref_smart_lists", { validate: isSmartListsMap })`

It exposes `value`, Promise-returning `edit`, `retry`, `reset`, and `meta` (`status`, `source`, `raw`, `pending`, `error`, `reload`). Use this existing path; do not create an unused API, cast a Promise into the old void/boolean setter, call raw setItem for a user action, or modify shared engine behavior to pass a caller test.

1. A row action proposes an absolute map copied from the **latest local desired map**, changing only that row's own value. Preserve other known/unknown fields. Two different row changes made while a lock is held, or after a first write failure, must produce the combined latest desired map; a stale closure must not erase the earlier choice. Use a session-bound latest-value ref if needed, scoped to the same hook binding/owner epoch. It must be reinitialized on owner changes, never carry A's map into B.
2. The map is one storage/conflict unit. The hook's captured **physical raw baseline for the whole map** is authoritative; sibling changes from a different document may therefore cause a conservative whole-map conflict. This is intentional. Do not add field-level merge/revision metadata or silently switch to a functional updater that rebases the user's failed draft over an external map. The engine's functional API remains available for separately specified operations, but these selectors are absolute draft edits.
3. Preserve the accepted account-shared → physical-key-exclusive ordering, captured owner/full marker/tombstone checks, and no fallback when locks are unavailable/rejected. A held account-exclusive lock or the same physical key lock must prevent writes. No local equality check may bypass those checks and report Saved. Default mount, StrictMode replay, language switch and hydration never write.
4. Keep the newest selected values visible while pending, failed or conflicted. The existing hook sequences/coalesces pending operations; caller feedback may say Saved only when that **current combined map** is verified. Earlier completion must not replace newer selections or clear their failure. Allow collecting newer edits during pending. Duplicate Retry during the same attempt must not issue duplicate physical commits or change operation attribution.
5. A quota/lock failure keeps the latest map and visible localized Not saved feedback. Actual Retry uses the hook's original operation/baseline and token; an unchanged readback-uncertain retry verifies its own committed bytes without a second write. A newer user edit after uncertain completion must remain an explicit newer intent, not reuse the old token for a changed map. Do not rebuild an old proposal as an unconditional `edit` merely to make Retry green.
6. A normal dirty external conflict exposes an explicit **Discard local changes / Reload saved choices** action. It adopts the external map by `meta.reload` only after that user action. Invalid/unavailable source similarly offers explicit read-only Reload after external repair. The whole map is affected, so wording must convey discarding all local Smart Lists choices, not one row. Retry must not silently overwrite/rebase external data. Reload must clear stale pending settlement effects through the accepted hook session contract and issue zero application writes.
7. Clean same-tab and other-document changes project through the existing bus/storage re-read. Dirty controls retain their local map until explicit recovery. A storage event's value is not trusted as a source snapshot; read the actual binding. A foreign account event must not alter the visible owner's pane.
8. On A→B or A→locked, A's queued callbacks must refuse or detach and cannot mutate B, recreate tombstoned A data, leak A's map, or mark B Saved. Returning to A is a fresh session. Unmount/remount invalidates old pending callbacks; a previously verified commit is not undone. A switched/locked pane must use B's own snapshot or safe disabled/unavailable account state, not a retained caller ref.
9. Catch/consume async failures through the accepted typed result/meta contract. If an additional caller Promise chain is introduced, handle its rejection; no unhandled Promise, false success or close/navigation side effect is allowed. There is no new Reset affordance: external confirmed removal is observed as absence when clean, and as conflict when dirty.

The UI should retain twelve accessible select labels and three sections. Add a scoped localized status/alert with Saving, Saved, Not saved, Retry, and applicable explicit reload/discard. No unrelated settings' recovery state may be cleared. Narrow styles must keep explanation readable, actions distinct and keyboard/touch accessible at 375/768/1440; render the package stylesheet when testing. Do not infer a mobile layout PASS from a stylesheet-free component harness.

## Files and implementation ownership

| Owned by Terra in this batch | Allowed work |
| --- | --- |
| `packages/plugin-web-settings-rest/src/panes/smartListsPane.tsx` | Replace this one old setter with the actual async map caller, preserve layout/control semantics, add localized feedback and session-safe latest-map construction. |
| Optional `src/internal/smartListsPreference.ts` (or equivalently narrow helper) | Stable domain validator/known-row constants and safe row proposal construction. No alternate storage writer/controller. |
| `src/internal/localI18n.ts`; narrowly scoped `src/styles.css` | Smart Lists recovery copy/styles only. Existing shared strings may be reused if accurate; do not change other panes' behavior. |
| `src/__tests__/smartListsPane.test.tsx` plus a dedicated recovery test | Retain SL1–SL6; add real async storage/DOM acceptance cases. All initialization raw writes must be identified as fixtures, never substituted for edits. |
| Necessary package-local test adapter | Use complete durable account markers and real name/mode lock semantics. Existing Settings setup only activates a demo scope; do not assume that alone constitutes a durable marker/lock fixture. Prefer local new-suite setup over broad fixture changes. |
| New author review evidence | Fixed hashes, commands, before/after and remaining boundaries. Do not edit parent/Astra fixtures or logs. |

No product changes to registry ownership/defaults, pref engine/hooks, account coordination, migration/deletion, global Reset, provider/integrations, other panes, Tasks, timers, Board or rollout flags. If a real shared contract failure emerges, retain its independent oracle and hand it back as a separately owned repair; do not hide it in this caller migration. The accepted shared API is sufficient for the stated absolute-map design.

## Minimum independent acceptance chain

| Scope | Required business assertions |
| --- | --- |
| Fixed retained parent before | Unchanged four in b3ecc69: account-lock wait, physical-key wait, quota latest two-row retention + actual Retry, and absent all-twelve-show/no-seed control. Preserve before **3 FAIL / 1 PASS**. |
| Complete producer/domain coverage | Each of twelve actual select handlers persists a valid chosen mode while retaining sibling fields and an unknown extension. Exercise all three modes across the cases. `{}`/sparse/full maps are valid, including assigned/wont_do absence. Invalid known value, null, array, malformed/unavailable sources refuse without writes and have recoverable UI; actual external repair + Reload succeeds with no application write. |
| Pending/latest/result | Hold locks; edit two different rows and one row again; latest combined map stays visible and becomes the verified result after release. Fault actual target setItem; multiple latest edits survive and Retry commits the combined result. Old success/failure cannot regress a newer selection. Repeated Retry while pending stays single-flight. Unavailable/rejected lock gives visible failure and no unfenced write. |
| Conflict and source | Clean sibling-instance and second-document projection; dirty map with external raw replacement remains local + conflict, Retry preserves external bytes, explicit full-map discard adopts them without writes. External removal while dirty is also conflict. Preserve unknown fields throughout successful edits. |
| Uncertain commit | Actual readback get failure after one successful set; UI remains Not saved. Unchanged actual Retry reconciles and reports Saved with physical write count still one; a changed later row is a new map and cannot consume old-token authority. |
| Account/session/lifecycle | Held queued A edit followed by B/locked/unmount-remount, persistent marker replacement and tombstone must not commit the old draft. B values/status never contain A state. Successful edit before migration is included in the published generation; separately scheduled edit while migration holds exclusive waits then refuses stale generation. Never await that competitor from inside the exclusive migration callback. |
| Existing behavior/regression | SL1–SL6 retained, EN/ZH labels/three sections/twelve options unchanged. Current Settings package and package types/lint pass at a fixed hash; test-only await/setup changes preserve original business assertions. No shared source change means no need to rerun every accepted engine/timer package. |
| Actual browser and visual | Actual pane with complete account fixture and native locks, held-lock latest map + quota Retry and two-document dirty conflict/discard. Reload verifies committed JSON; process reopen, if run, asserts only saved state, not durable unsaved drafts. Include actual module CSS and inspect recovery at 375/768/1440. Component, browser and visual evidence remain separately attributed. |

The author may implement now within this ownership. Commit fixed product before independent after execution; keep author and non-author evidence distinct. This contract does not demand unrelated provider/network/global-reset work or reopen accepted device/timer-preservation scopes. Completion accepts **Smart Lists' twelve live settings controls**, not all writers of that key or the entire Settings/D2/AI-02/REL-05 product gates, and does not authorize release activation.
