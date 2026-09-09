# AI device preference recovery — independent verification

Status: VERIFIED for insights/voice save recovery and Discard refresh only. Complete REL-05 remains open. No product files changed.

Product pinned: `24da17d786064d65794c58ef9da71418824b4539`. Before: parent `187225ef63fb9057fae32314c7cb5860c81c3a7c`. Every product and @repo import comes from an isolated git archive. Installed third-party dependencies are reused. Concurrent tool-receipt work is excluded.

## Original oracle

The original one-test Discard contract is copied unchanged into original-contract.test.tsx, then run against both snapshots. Before: 1 FAIL, missing Show insights after Discard. After: 1 PASS. Native Chrome reproduces the same defect: raw false, UI still on, zero writes; identical assertion passes after. Native before exits 1 intentionally; it stops at this first regression, so does not claim later checks passed before.

## Independent native checks

Chrome 152, isolated temporary profile and real localStorage; actual AiChatModule and UI handlers at 390px. Storage.prototype only injects targeted synthetic quota failure for the two device keys; successful operations use native Storage. No setter mocked into success. Actual downloaded files are parsed and checked, then temporary data is removed.

- Insights quota: stored true and UI on remain; alert visible. Downloaded preferences.insights exactly `{value:false,baseline:"true"}`. Retry commits false once and UI turns off.
- Voice quota: stored false and UI off remain; alert visible. Downloaded preferences.voice exactly `{value:true,baseline:"false"}`. Retry commits true once and UI turns on.
- Both keys: first external raw change without StorageEvent makes the initial action and Retry reject with zero writes. Discard displays the current raw value and clears recovery without writing.
- Both pending proposals followed by A→B: old module Retry, Export, Discard and both toggle handlers cannot write either device key; no JSON download occurs. This deliberately keeps the old component mounted to test captured-owner revocation even without a host unmount.

Device ownership remains unchanged: xai_ai_insights and xai_ai_voice are not account-prefixed. Owner capture controls old actions, not the global device value. Preference toggles represent settings only; no microphone permission or actual voice-processing capability is asserted.

## Reproduction

`node docs/reviews/web-ai-preference-independent/verify-native.mjs`

`AI_REF=24da17d^ AI_LOG=before.log node docs/reviews/web-ai-preference-independent/verify-native.mjs` (expected exit 1)

`node docs/reviews/web-ai-preference-independent/verify-original.mjs`

`AI_REF=24da17d^ AI_TEST_LOG=original-before.log node docs/reviews/web-ai-preference-independent/verify-original.mjs` (expected exit 1)

Limits: synthetic accounts and local faults, DOM clicks rather than trusted hardware input; no real two-browser concurrency, whole-app login, close/reopen durability or full AI/tool-receipt acceptance. No package-wide totals are claimed from this focused verification. No additional blocker found in the assigned preference contract.
