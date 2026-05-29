# Discovery Review - desktop-calendar-sync-degraded-mode

> Feature: `desktop-calendar-sync-degraded-mode`
> Date: 2026-05-29
> Executor: feature-plan (Codex, gpt-5.3-codex inline)
> Research mode: internal repo evidence only
> External research: No external research required

## 1. Problem Framing

ADR-0011 freezes the product rule: third-party calendar sync is degradable, not local-first. The active repo surface already reflects that split, but only partially:

- `@repo/plugin-web-calendar` is the active calendar surface and today is still a local/sample-data-backed module
- `@repo/plugin-web-settings-rest` owns the only wired provider control (`gcal`) plus offline-disabled OAuth callback flow
- `@repo/plugin-web-storage` already bridges durable desktop state into the local-first repo
- row `#14` already exposes reconnect preflight and replay runtime helpers from `AppProviders`

The missing piece is a calendar-specific degraded-mode contract that answers:

1. what local calendar state remains usable offline
2. what counts as provider sync state and must remain explicitly online-only
3. how reconnect should reconcile provider-sync state without claiming offline provider success

## 2. Repo Evidence

### 2.1 Governing ADR and roadmap authority

- `docs/adr/0011-p1-react-tauri-local-first-hybrid.md`
  - classifies third-party calendar sync as a degradable Phase 3 surface
  - keeps `plugin-web-calendar` as the Phase 1/active calendar owner
- `docs/adr/0012-phase3-local-first-storage.md`
  - desktop live durability belongs to SQLite via the shared repo seam
  - browser storage is not the desktop live store
  - reconnect/sync rows must preserve explicit conflict/failure semantics
- roadmap seed for row `#16`
  - requires online-only provider sync
  - requires local state preservation
  - requires reconnect reconciliation evidence

### 2.2 Active calendar and provider surfaces

- `packages/xai-web-calendar/src/CalendarModule.tsx`
  - active local calendar UI
  - persists only local view state (`xai_calendar_view`, `xai_pref_week_start`)
  - does not own provider sync transport today
- `packages/plugin-web-settings-rest/src/panes/integrationsPane.tsx`
  - only wired calendar provider is `gcal`
  - connect buttons are already disabled in `desktop-phase1-offline`
  - current connected state is a local boolean pref, not a sync-health model
- `packages/plugin-web-settings-rest/src/CallbackPage.tsx`
  - desktop offline runtime already fail-closes the callback route
- `packages/desktop-native-notifications-reminders/`
  - proves the desktop product can project calendar reminders from local calendar-visible state without introducing provider sync semantics

### 2.3 Existing local-first and reconnect seams

- `packages/plugin-web-storage/src/internal/desktopRepoBridge.ts`
  - shipped bridge for tasks/habits/pomodoro/board/pet/settings
  - no calendar-specific durable provider-state contract yet
- `packages/core-data/src/entities.ts`
  - has no canonical `calendar.*` record family yet
  - that is consistent with the fact that active calendar sync is not yet a durable provider-backed entity surface
- `packages/core-data/src/reconnect-sync.ts`
  - shipped reconnect replay preflight/outcome model
- `apps/web/src/providers/AppProviders.tsx`
  - already exposes desktop reconnect runtime helpers through a thin mount

### 2.4 Non-primary evidence that should not become the implementation target

- `packages/plugin-calendar/`
  - contains `RepoAdapter`, `LocalStorageAdapter`, and `CalendarRepoProvider`
  - remains `In-Dev` and is not the active desktop product surface
  - useful only as design evidence for adapter layering, not as the owning runtime path

## 3. Candidate Structures

### Option A - Package-owned degraded mode with explicit provider-state records and reconnect follow-up

Use the active calendar/settings/storage packages directly:

- `@repo/plugin-web-calendar`
  - owns local calendar UX and degraded-mode banners/badges for provider-backed areas
- `@repo/plugin-web-settings-rest`
  - owns provider connect/refresh/status controls
- `@repo/plugin-web-storage`
  - owns durable desktop bridge and reconnect-triggered state reconciliation glue
- `@repo/core-data`
  - adds the smallest typed `calendar.provider_state` contract needed for durable desktop truth
- `apps/web/src/providers/AppProviders.tsx`
  - mounts runtime only; no business logic

Offline rule:

- local calendar state remains usable
- provider sync actions do not claim success offline
- optional reconnect follow-up is stored only as device-local provider-state metadata, not as fake provider writes

Pros:

- matches the active product surface
- keeps local state and provider state visibly separate
- reuses the shipped repository bridge and reconnect seam instead of inventing another one
- avoids claiming that remote provider data is locally authoritative

Cons:

- requires a new typed calendar provider-state contract
- touches several active packages
- must be careful not to over-scope into full provider transport or event-store work

### Option B - Keep everything as settings prefs and local UI flags only

Keep using `xai_pref_integrations_connected_gcal` plus local/offline UI copy without a durable calendar-specific contract.

Pros:

- smallest diff
- no new repo entity type

Cons:

- too weak for Phase 3 desktop local-first truth
- cannot separate `connected` from `syncable` or `needs reconnect`
- reconnect behavior becomes opaque and non-durable
- does not satisfy the storage/repository bridge requirement cleanly

### Option C - Host-owned online/offline service in `AppProviders`

Put most degraded-mode logic into `apps/web/src/providers/AppProviders.tsx` and let packages only render host-fed state.

Pros:

- one central runtime hook point

Cons:

- leaks business logic into the host
- harder to test by feature owner
- violates the repo’s package-boundary discipline
- would hide calendar/provider rules behind an opaque host service

## 4. Recommendation

Recommend Option A.

### Why Option A fits this repo

- It uses the real active owners: `@repo/plugin-web-calendar`, `@repo/plugin-web-settings-rest`, and `@repo/plugin-web-storage`.
- It keeps the host thin and uses the shipped reconnect runtime only as a mount/gating seam.
- It keeps provider sync explicitly online-only while still making reconnect state durable and reviewable.
- It does not force the repo to pretend that a provider boolean pref equals durable sync truth.

## 5. Recommended Contract Split

### 5.1 Local calendar state

Local calendar state should remain explicitly local and usable offline:

- `xai_calendar_view`
- `xai_pref_week_start`
- active date / focused date UI state as module-local state
- desktop-native reminder projection from the currently available local calendar dataset

This state is allowed to remain available offline because it does not claim remote provider success.

### 5.2 Provider sync state

Provider sync state should become a separate durable device-local contract, recommended as a new `calendar.provider_state` record family in `@repo/core-data`, one record per wired provider.

Recommended shape:

```ts
interface CalendarProviderStateEntity extends RepoRecord {
  entityType: "calendar.provider_state";
  syncScope: "device-local";
  providerId: "gcal";
  syncMode: "online-only";
  connectionState: "connected" | "disconnected";
  availability: "ready" | "offline" | "auth-required" | "transport-unavailable";
  lastAttemptAt?: string;
  lastSuccessAt?: string;
  lastFailureCode?: string;
  lastFailureMessage?: string;
  needsReconnectRefresh: boolean;
}
```

Why this is conservative:

- it stores provider health and reconnect intent only
- it does not claim local-first provider data ownership
- it gives desktop runtime something durable to read after restart/offline launch

### 5.3 Offline action rule

Recommended row-#16 rule:

- `connect` / `refresh` / provider-backed sync actions are disabled in offline mode
- if the user triggers a provider sync affordance while offline, the system may mark `needsReconnectRefresh = true`, but it must not enqueue a fake remote write
- successful reconciliation only happens once the runtime is back online and the provider transport is actually available

That keeps the UX helpful without claiming provider-local write success.

## 6. Frozen Build Direction

### Phase 1 - Shared contract and bridge extension

- add `calendar.provider_state` to `@repo/core-data`
- extend `@repo/plugin-web-storage` desktop bridge to hydrate/persist that record family
- keep existing local calendar prefs unchanged

### Phase 2 - Calendar and provider UI split

- `@repo/plugin-web-calendar`
  - render degraded-mode state from the provider-state contract
  - keep local calendar views available offline
- `@repo/plugin-web-settings-rest`
  - separate `connected` from `syncable`
  - surface offline-disabled / reconnect-needed messaging clearly

### Phase 3 - Reconnect follow-up

- use the shipped row `#14` reconnect gating/runtime from `AppProviders`
- on eligible reconnect, run calendar-provider reconciliation against provider-state records
- clear `needsReconnectRefresh` only after a real successful provider refresh path

### Phase 4 - Verification

- package-local tests for contract/state/UI behavior
- browser-safe `@repo/web` gates
- desktop app-bundle gate
- manual desktop offline/reconnect smoke if runtime behavior is touched

## 7. Risks and Open Questions

### Risks

- The active calendar module still uses sample/local dataset semantics; build must avoid implying a fully synced provider event store exists.
- The current `xai_pref_integrations_connected_gcal` boolean is too weak to represent sync health by itself; migration/compatibility handling must be explicit.
- Reconnect follow-up must not broaden row `#14` into a generic provider transport owner.
- If build uses `plugin-calendar` directly, it will drift onto a non-primary package and violate the active-surface rule.

### Open questions for review/build

1. Should row `#16` add only `gcal` provider-state support now, or also reserve typed ids for placeholder calendar providers without enabling them?
2. Should an offline sync attempt set `needsReconnectRefresh = true` automatically, or should the UI only show disabled messaging without persisting intent?
3. Should the calendar surface show last successful provider refresh time, or keep that detail inside settings/integration copy only?
4. Does row `#16` need a browser-safe read-only fallback for provider-state in pure web runtime, or is desktop-only state sufficient while leaving browser behavior unchanged?

## 8. Recommendation Summary

No external web research is required. The repo already contains the necessary authorities and shipped seams.

Recommendation:

- keep provider sync online-only
- make provider-state durable and separate from local calendar state
- keep local calendar surface usable offline
- use the shipped desktop bridge and reconnect runtime for post-reconnect reconciliation
- do not route implementation through the legacy `plugin-calendar` package

