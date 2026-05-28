# Discovery Review — desktop-phase1-rc-release-gate

## Problem Framing

The Phase 1 implementation slices are individually SHIPPED, but the repo does not yet have one integrated release-candidate gate that proves the current Mac app is ready to be treated as an installable, offline-launchable Phase 1 product.

Current repo evidence is good but still fragmented:

- `desktop-tauri-web-dist-normal-window` already proved the active host is a single normal window loading bundled `apps/web`
- `desktop-web-auth-offline-mode` already proved desktop launch can enter `/app` through the mock-auth desktop path
- `desktop-phase1-build-packaging-pipeline` already proved `.app` generation and recorded a reproducible local DMG stall after `Running bundle_dmg.sh`
- `desktop-basic-macos-menu-config-store` already added native menu/config behavior, but its remaining real-macOS interaction checks are still documented as residual risk
- `web-external-runtime-offline-gates` already implemented offline degradation, but its most important checks are still integrated manual desktop checks

What is missing is not another isolated feature slice. What is missing is the gate that re-runs the integrated product checks in release-candidate order, hardens any repo-side regressions that show up, and leaves a single verdict plus explicit blocker classification.

The first unresolved question is the installer path:

- `pnpm --filter desktop build` already emits `apps/desktop/src-tauri/target/debug/bundle/macos/X Desktop.app`
- `pnpm --filter desktop build:dmg` previously reached:
  - `Bundling X Desktop_1.0.0-rc.1_aarch64.dmg`
  - `Running bundle_dmg.sh`
- the final `.dmg` did not appear under `apps/desktop/src-tauri/target/debug/bundle/dmg/`

Because the user explicitly wants installable/offline-launchable validation, the RC gate has to treat DMG reproduction/classification as the first blocker item, then close the rest of the integrated product checks in a single pass.

## External Research

No external research required. This is an internal integration, packaging, and release-risk-classification decision based on current repo behavior and same-day shipped evidence.

## Candidate Options

### Option A — Dedicated integrated RC gate with blocker-first packaging triage

Create one feature whose build/verify flow:

1. re-runs the current packaging commands in RC order
2. treats DMG reproduction/classification as the first blocker/fix item
3. verifies `.app` offline launch, normal-window startup, native menu/config persistence, and online-only surface degradation
4. ends with one feature-local verification matrix and explicit RC verdict

Pros:

- Matches the current need precisely: integrated release confidence, not another implementation slice
- Uses the already-shipped Phase 1 features as dependencies instead of duplicating their design decisions
- Forces the most critical unresolved risk, DMG packaging, to be triaged first
- Leaves one tracked place to distinguish:
  - repo-fixable blockers
  - environment/tooling blockers
  - residual manual-only risk
- Preserves Phase 1 discipline while still allowing targeted hardening where an RC blocker is found

Cons:

- Can uncover issues across several surfaces in one feature, so phase boundaries must stay disciplined
- Real macOS manual checks are unavoidable for the final RC confidence path
- DMG may still end as a classified blocker if the stall remains outside repo control

### Option B — Treat the shipped slice docs as sufficient and only add a release checklist

Avoid an integrated rerun and write a lightweight release checklist based on the existing shipped feature evidence.

Pros:

- Lowest immediate effort
- No chance of surfacing fresh integration regressions during planning

Cons:

- Does not actually prove the combined product works in RC conditions
- Leaves the DMG stall as an untriaged packaging risk instead of a first-class blocker
- Leaves menu/config and online-only degradation checks fragmented across earlier features
- Conflicts with the user’s requirement to verify installable/offline-launchable product behavior

### Option C — Accept `.app` as the only Phase 1 RC artifact and defer DMG to later work

Define the RC gate around the app bundle only, with DMG left for Phase 2 or later release engineering.

Pros:

- Simplifies local verification
- Reuses the current deterministic `.app` success path

Cons:

- Conflicts with ADR-0011 Phase 1 wording around a shippable Mac app and the user’s explicit `.app`/`.dmg` packaging goal
- Turns the already-known DMG risk into a silent defer instead of a blocker or classification
- Weakens the "installable product" claim substantially

## Recommendation

Choose Option A.

The repo is past "can we build the slices?" and at "can we defend the integrated product as a release candidate?" Option A is the only option that answers that question directly while staying inside Phase 1 scope.

The most important planning consequence is ordering:

- **Phase 1 must start with DMG reproduction/classification.**
- If the DMG issue is repo-side, fix it before spending time on downstream RC confidence.
- If the DMG issue still reproduces only after Tauri hands off to `bundle_dmg.sh` / `osascript`, record that exact evidence as the first blocker item and continue the rest of the RC gate with the blocker explicitly open.

After that, the RC gate should close the remaining Phase 1 release questions in product order:

- can the built app launch offline into `/app`?
- does it stay one normal main window with no overlay/control/grid startup?
- do native menu/config persistence actions work through relaunch?
- do online-only surfaces degrade clearly and non-mutatingly offline?

## Selected Execution Notes

- Keep upstream ownership unchanged:
  - packaging contract in `apps/desktop/package.json` and `tauri.conf.json`
  - menu/config contract in `apps/desktop/src-tauri/src/app_menu.rs` and `app_config.rs`
  - offline surface gating in the owning web packages
- Allow web/business-source edits only if an integrated RC blocker proves the shipped offline degradation is incomplete
- Prefer feature-local evidence outputs under `docs/reviews/desktop-phase1-rc-release-gate/`, for example:
  - RC verification matrix
  - DMG reproduction note
  - offline launch note
  - RC risk register / verdict note
- Keep the final outcome explicit:
  - PASS if all required Phase 1 RC gates are proven
  - BLOCKED with exact blocker classification if packaging or offline behavior still fails

## Risks

- DMG creation may still stall in the same local macOS image-tooling stage, leaving the installer path blocked pending either a repo fix or an environment classification
- Real macOS offline launch, menu interaction, and relaunch persistence cannot be trusted without a manual hardware pass
- Integrated offline degradation can still reveal route-level or state-mutation bugs that the isolated shipped features did not surface together
- Scope creep is easy here; the RC gate must not drift into Phase 2 native polish or Phase 3 local-first work

## Open Questions

- If DMG still stalls after `bundle_dmg.sh`, can the evidence confidently distinguish repo misconfiguration from local macOS tooling behavior? Recommendation: make that the first build-phase classification job.
- Should the RC gate stop immediately on a DMG blocker, or continue to gather the remaining offline/menu/degradation evidence in the same run? Recommendation: continue, but keep the DMG blocker explicitly open as item R1.
- Should the RC gate create one consolidated verdict doc even if some items remain blocked? Recommendation: yes, because the classification artifact is part of the deliverable.

## Phased Build Outline

1. **DMG Reproduction and Blocker Classification**
   - Re-run `pnpm --filter desktop build:dmg`
   - Classify the outcome as repo-fixable, environment/tooling-blocked, or passed
   - Keep this as blocker item R1 if unresolved
2. **Integrated App/Installer Offline Launch Gate**
   - Verify `.app` output and offline `/app` launch
   - Verify `.dmg` mount/drag-install/launch if a DMG is produced
   - Verify single normal-window startup with no overlay/control/grid activation
3. **Native Menu and Config Persistence Gate**
   - Exercise menu actions and host config persistence across relaunch
   - Verify `Reveal Config Folder` and `Reset Main Window State`
4. **Online-only Surface Degradation and Final RC Verdict**
   - Verify AI, map, integrations, premium, and account-delete offline behavior
   - Record one release-candidate matrix and exact blocker/risk classification
