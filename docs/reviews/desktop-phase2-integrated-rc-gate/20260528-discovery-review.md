# Discovery Review — desktop-phase2-integrated-rc-gate

## Problem Framing

The roadmap has already split Phase 2 into focused implementation rows. Those rows are now `READY_TO_SHIP`, but the release story is still incomplete in two different ways:

1. there is no single integrated Phase 2 evidence path that shows the six slices behaving coherently on the real desktop app
2. the repo must not blur that integrated RC gate with row `#1` `desktop-real-macos-release-smoke`, which remains a separate external-release prerequisite

So the planning problem is not "how do we build notifications/statusbar/hotkey/menu/updater/cache?" The problem is:

- how to aggregate their existing repo-side verification into one RC baseline
- how to define one honest real-macOS smoke matrix across the slices
- how to classify cross-slice blockers without silently widening scope
- how to keep external-release readiness separate from repo-side readiness

## Naming Rationale

Keep the roadmap slug `desktop-phase2-integrated-rc-gate`.

Why it fits:

- `desktop` keeps the boundary on the Tauri/macOS host on `dev`
- `phase2` keeps this row downstream of rows `#2`-`#7` and upstream of Phase 3
- `integrated-rc-gate` accurately describes a composed verification row rather than a product surface

## External Research

No external research required. This is an internal workflow/evidence aggregation decision over already-selected project surfaces.

## Current Evidence Inventory

### Upstream repo-side baseline

- `packages/desktop-phase1-rc-release-gate/docs/dev_log.md`
  - shipped integrated repo-side RC baseline for packaging, startup shape, menu/config contract, and offline degradation
- `packages/desktop-real-macos-release-smoke/docs/dev_log.md`
  - row `#1` is currently `BLOCKED` by real-macOS GUI environment limits and must remain a separate external-release condition

### Phase 2 dependency rows ready for composition

- `packages/desktop-native-notifications-reminders/docs/dev_log.md`
  - automated gates passed; real notification delivery and permission UX remain manual residuals
- `packages/desktop-statusbar-quick-actions/docs/dev_log.md`
  - repo-side bridge/menu/build gates passed; tray click/focus behavior remains hardware residual
- `packages/desktop-global-hotkey-quick-open/docs/dev_log.md`
  - repo-side contract passed; real shortcut conflict/focus/persistence remains hardware residual
- `packages/desktop-full-macos-menu-polish/docs/dev_log.md`
  - repo-side menu contract passed; native ergonomics and action behavior remain hardware residual
- `packages/desktop-auto-update-release-channel/docs/dev_log.md`
  - guarded `check/status-only` updater contract passed; real signed internal endpoint/key smoke remains downstream/manual
- `packages/desktop-last-data-cache-polish/docs/dev_log.md`
  - cache truthfulness contract passed; real offline relaunch with readable/absent/malformed cache remains hardware residual

## Candidate Options

### Option A — dedicated integrated Phase 2 RC gate with split verdict planes

Create one row-local integrated RC report that:

- reuses rows `#2`-`#7` as the implementation baseline
- reruns a narrow integrated repo-side baseline where needed
- runs one real-macOS manual matrix across the six slices
- reports row `#1` separately as an external-release prerequisite, not as a hidden sub-row

Pros:

- matches the roadmap seed exactly
- gives one artifact humans can inspect before ship
- keeps repo-side readiness and external-release readiness honest
- lets build/verify classify blockers without reopening the whole roadmap wave

Cons:

- requires careful evidence structure to avoid duplicating all dependency-row docs
- still depends on real interactive macOS conditions that cannot be fabricated in a shell-only run

### Option B — rely on rows `#2`-`#7` individually and skip a new integrated gate

Pros:

- least additional documentation work
- no new aggregation logic

Cons:

- violates the manifest row and seed requirement
- leaves cross-slice interactions unowned
- makes release review harder because humans must manually reconcile six rows plus row `#1`

### Option C — fold this work into `desktop-real-macos-release-smoke`

Pros:

- fewer manual-smoke rows overall

Cons:

- conflates Phase 1 residual release smoke with Phase 2 integrated readiness
- hides the distinction between repo-side Phase 2 composition and the already-blocked external-release condition
- makes row `#1` scope sprawl beyond its current charter

## Recommendation

Choose Option A.

The correct move is:

> add one dedicated integrated Phase 2 RC evidence row that composes rows `#2`-`#7`, while explicitly mirroring row `#1` as an external-release prerequisite instead of absorbing it.

## Recommended Architecture

### 1. Two verdict planes, one final report

The final integrated artifact should carry two distinct sections:

- `Repo-side readiness`
  - build/test/bundle/browser-safety/rust/package evidence for the current repo state
- `External-release prerequisites`
  - current status of `desktop-real-macos-release-smoke`
  - clear note that external release cannot be claimed while row `#1` remains blocked

This prevents the common failure mode where a strong repo-side verify pass is misread as ship-ready external release.

### 2. Slice matrix plus cross-slice checks

The final report should classify these six Phase 2 slices individually:

- `notifications`
- `statusbar`
- `hotkey`
- `menu`
- `updater`
- `cache`

It should also include cross-slice interaction checks that are easy to miss if each row is inspected alone:

- status bar quick actions focus the normal `main` window and do not create overlay/control/grid windows
- hotkey focus/recovery and full-menu recovery actions can coexist cleanly
- updater About-pane state and cache badge/offline shell state coexist without startup confusion
- notification status does not break status bar, hotkey, or menu surfaces when permission is denied/disabled/unsupported

### 3. Minimal-fix-only blocker rule

This row is a gate, not a new implementation wave.

If real-macOS smoke reproduces a repo defect:

- fix only the owning slice surface
- rerun the affected focused tests plus the integrated baseline
- update the integrated matrix explicitly

If the blocker is environmental:

- classify it as `BLOCKED_ENVIRONMENT`
- do not invent repo work to make the evidence look greener than it is

## Recommended Implementation Phases

### Phase 1 — Integrated Repo-side Baseline and Evidence Ledger

Goal:

- lock the exact repo-side commands, artifact provenance, and dependency-row baseline that the integrated gate will rely on

Deliverables:

- deterministic evidence note for repo-side baseline
- current row `#1` status snapshot recorded as external-release prerequisite input

### Phase 2 — Native Interaction Matrix

Goal:

- run and classify the real-macOS interaction slices:
  - notifications
  - status bar
  - hotkey
  - menu

Focus:

- visibility, focus, permission, enablement, recovery, and coexistence on the normal app window only

### Phase 3 — Update-disabled and Cache Offline Matrix

Goal:

- run and classify the real-macOS slices most tied to startup/offline truthfulness:
  - updater `check/status-only` plus explicit install-unavailable behavior
  - last-data cache offline relaunch readable/absent/malformed states

Focus:

- `/app` startup continuity
- honest disabled/unavailable copy
- no overlay/control/grid reactivation

### Phase 4 — Final Integrated RC Verdict

Goal:

- publish one final integrated matrix and verdict

Required shape:

- six-slice classification table
- cross-slice notes
- repo-side readiness summary
- external-release prerequisite section that names row `#1` status directly

## Risks

| Risk | Why it matters | Mitigation |
|---|---|---|
| Evidence duplication across rows | The integrated row can become noisy or contradictory if it copies every dependency row wholesale | Keep this row as an aggregator: reference upstream row docs, record only integrated reruns and integrated manual outcomes |
| Repo-ready vs release-ready confusion | Strong repo-side evidence could be misread as external release approval | Freeze the split verdict planes and carry row `#1` separately in every final report |
| Scope drift into Phase 2 reimplementation | Real-macOS failures can tempt broad rebuilds | Allow only minimal blocker fixes in the owning slice, then rerun focused checks |
| Manual smoke unavailable in unattended environments | The required GUI checks cannot be fabricated | Use `BLOCKED_ENVIRONMENT` honestly and preserve traceability for later real-hardware completion |

## Open Questions

- Should the integrated row rerun every dependency-row automated command, or accept some upstream verify evidence when no repo code changed? Recommendation: rerun the canonical integrated baseline plus the slice-owned package tests most likely to regress cross-slice seams.
- If row `#1` remains blocked but all six Phase 2 slices pass on real hardware, should this row still report a repo-side pass? Recommendation: yes, but the final report must still state external-release readiness is not complete.
- If a cross-slice issue spans two owning rows, who owns the fix? Recommendation: the first reproduced failing seam owns the minimal repair, and this integrated row records the cross-row impact rather than inventing a new product surface.
