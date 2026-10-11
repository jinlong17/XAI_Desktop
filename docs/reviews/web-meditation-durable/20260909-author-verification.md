# MED-01 / MED-02 author implementation and verification

Scope: Web Meditation; not cloud service/desktop promotion. This is author verification; an independent verifier must review before closing the release items. Prior REL05 preferences/custom-scene draft recovery is preserved.

## Changes

- Added account/generation-scoped durable execution with absolute elapsed/deadline, paused/running/ended states, frozen start preferences, revision conflicts and native Web Locks serialization.
- Scope/operation tokens let B start even while an A lock remains held and keep A's late completion/finalizer out of B.
- Reopen shows an explicit recovery card. Running absence is included; paused absence is excluded. Ended rows are durable, idempotent terminal evidence until dismissed, not a new history feature.
- Save/read failures expose retry and raw export while preserving original bytes. Unknown schema is not silently normalized and overwritten.
- Playback errors, including indefinitely pending autoplay resume, become visible. Pause/unmount/account switch cancels pending playback and stops sources. Fixed-session silence is also scheduled against Web Audio time; terminal persistence reconciles when JavaScript next runs.
- Registered the new key in registry, account ownership and derived export/delete lifecycle; unscoped legacy active timers cannot be adopted. Updated explicit registry/export inventory expectations by one key, preserving the frozen design baseline.
- Error/completion notices sit above scene layers, use token colors and 44px touch targets. Applied the repository Frontend Responsive Design Standards skill.

## Evidence

`20260909-tests.log`: full Meditation package, 16 files / 134 tests passing. Includes original preference/save-recovery tests and new absolute-time, quota, malformed-byte, idempotence, infinite, stale-revision, A/B held-lock, clock-rollback, audio failure/cancellation/deadline tests. Meditation check-types and lint pass.

`20260909-storage-tests.log`: full Storage package, 16 files / 126 tests passing, including lifecycle/export/registry parity.

`20260909-native.log`: actual module controls, native Storage/Web Locks/AudioContext in temporary Chrome profile. Verifies paused full-page reload, whole Chrome process close/reopen with distinct PIDs, running deadline preservation without autoplay, expiry once, native quota retry preserving bytes, native source stopping on expiry, and B starting before A lock is released. Audio source counts before unmount are 2 starts / 2 stops. Actual token/layout/module CSS is loaded at a narrow viewport; `elementFromPoint` confirms audio and save retry buttons are not obscured and notice bounds remain within viewport.

Reproduce:

```sh
node docs/reviews/web-meditation-durable/verify-native-meditation.mjs
pnpm --filter @repo/plugin-web-meditation test
pnpm --filter @repo/plugin-web-storage test
```

## Fixture limits

Native time advancement injects an offset into Date.now; it does not wait real minutes. Web Locks and browser persistence are native. Audio permission rejection is deliberately injected; successful native playback uses the test-only Chrome autoplay-permitted flag because scripted button clicks are not trusted user gestures. The product contains no autoplay-policy bypass. An initial probe run without this flag stalled at native audio retry because the browser required a trusted gesture; that was a fixture limitation, not reported as product acceptance. The full-page recovery still proves the product does not auto-play even under permitted fixture policy.

This is a module fixture, not complete host/PWA/service-worker/production acceptance. No production network/account/profile is used. Audio cutoff scheduling is unit-asserted on the audio timeline; audible output on hardware and suspended operating systems is not measured. User-visible elapsed uses wall time and clamps negative differences; arbitrary device clock changes cannot establish trustworthy real elapsed time.
