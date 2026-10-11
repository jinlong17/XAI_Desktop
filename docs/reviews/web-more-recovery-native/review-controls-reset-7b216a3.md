# More native N1 controls and reset verification

Product fixed at `7b216a3d5a4947d0f66da042fb275302737fb762`. Parent-owned real Chrome verification using the immutable archive and actual composed Settings/Shell surface.

## Verdict

**PASS for N1 `controls-reset`.** Chrome `153.0.8010.48` reported zero runtime exceptions or console errors.

Command:

```sh
node docs/reviews/web-more-recovery-native/verify-native.mjs 7b216a3 controls-reset control-plane-20260917-fixed1
```

Authoritative log: `native-7b216a3-control-plane-20260917-fixed1-controls-reset.log`

SHA-256: `a0735c68b28fc8188f05030dc6f1f7acbbb49548271ed954e9cb830595fb2862`

## Evidence

- All 15 controls changed through trusted Chrome input: native mouse clicks for four switches, Space/Enter for the two equivalent accessible pressed-state buttons, and native select typeahead for nine selects.
- Exact physical bytes matched all 15 intended values. The two private fields used `xai:account:v1:more-native-A:g1:*`; no unowned logical alias was accepted as evidence.
- A real page reload produced a new document instance, restored all 15 values, and performed zero application mount writes/removals.
- The actual Reset Default control removed exactly 15 unique physical keys: 13 device keys and two account-scoped keys.
- After reset, every physical More key was absent, the UI displayed registry defaults, the unrelated sentinel remained `preserve-me`, and the completion surface stated that More settings were restored to defaults.

## Diagnostic attribution

Two preliminary runner executions were harness diagnostics, not product failures and not retained as evidence. The first lacked per-field observations. The second proved 14/15 inputs and showed that numeric `9` typeahead did not select the All-day Reminder option in this headless Chrome build. The final runner uses trusted `d` typeahead for the equally valid `day_before` option. No product source changed.

## Limits

N1 verifies normal trusted control persistence, new-document reload, and successful full reset only. It does not cover failed set/reset recovery, pending/uncertainty/conflict, owner transitions, disk draft downloads, route/history/signout competition, visual/focus/hit targets, production authentication, deployment, or Astra acceptance.

N2 `host`, N3 `recovery-owner`, N4 bilingual visual, final regressions, and final contract reconciliation remain pending. This result closes no 312 item, D2/REL/AI obligation, deployment gate, or release gate.
