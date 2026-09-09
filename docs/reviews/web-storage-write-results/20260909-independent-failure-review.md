# REL-05 independent failure reproduction

Baseline checked: `d266ab8`. Status: **two confirmed unresolved correctness failures; no fix PASS**. Parent source diagnosis is independently corroborated by real component execution and native Chrome. No production source was edited in this round.

## Reproduce

From repository root:

```sh
node packages/core/node_modules/vitest/vitest.mjs run --config docs/reviews/web-storage-write-results/independent-write-failure.config.mjs
node docs/reviews/web-storage-write-results/verify-native-write-failure.mjs
```

Both commands intentionally return **exit 1 against the defective baseline**. The component suite contains two assertions for the correct business outcome, both failing. The browser returns `pass:false`; its wrapper treats that as failure. A successful defect reproduction is not acceptance of the product.

The component probe uses the real Tasks component and real Bookkeeping hook/repository. It injects `QuotaExceededError` only at `Storage.prototype.setItem` for one exact A-account physical business key. It does not stub `setPref`, `usePref`, Bookkeeping persistence, or account resolution. The Chrome probe runs the same boundary in an isolated temporary native browser profile with real native localStorage, a real dialog, real React input/click handling and the actual feature code. It restores the method and removes its temporary profile. No real account, external service or user data is involved.

## F1 — Tasks destroys the failed draft

After hydration, the probe snapshots the committed Tasks bytes, opens Add, types a synthetic title, blocks only the scoped Tasks write, and clicks Save.

Actual native and component result:

```json
{"originalPreserved":true,"composerOpen":false,"draft":"","failureVisible":false}
```

The imperative storage adapter logs the quota failure, but the composer closes and clears the only copy of the proposed title. Existing data survives; the user's new work does not. No visible failure or retry is offered. The component test compares bytes immediately before the Save fault, after ordinary seed normalization, so unrelated hydration migration is not mistaken for save corruption.

Expected: rejected persistence keeps the composer and complete draft recoverable, displays understandable failure, and enables a same-account retry or export. Only a successful commit closes/reset the editor. Account change must invalidate any old retry.

## F2 — Bookkeeping reports a state that was not persisted

The fixture starts with canonical budget 100 and device bills view `detail`. The proposed action changes budget to 200 and bills view to `overview`. Only the scoped canonical business write is denied.

Actual native and component result:

```json
{"originalPreserved":true,"persistedBudget":100,"renderedBudget":200,"deviceView":"overview"}
```

`writeString` swallows the canonical failure. Subsequent device writes and update notification still execute; the hook publishes budget 200. Reload consequently restores 100 despite the apparent successful change. Device preference writes partially committed even though the business write did not. The call exposes no typed failed outcome or recoverable draft status.

Expected: the canonical failure must not publish proposed values as committed or silently advance coupled preference writes. Preserve the old committed business bytes and the proposed draft separately, expose an explicit failed result and support account-bound retry. If preferences are deliberately independently committed, their separate outcome must be explicit rather than hiding a failed business save.

## Account/data preservation

Both probes establish a scoped A fixture and an unrelated B sentinel. A's pre-save persisted record and B's raw sentinel are unchanged in both failing cases. Injection targets the single A physical key and is restored after execution. The probes do not assert that namespacing alone supplies cross-tab merge or general durability guarantees.

Evidence: `20260909-independent-write-failure-before.log` and `20260909-native-write-failure-before.log`. The initial test-import setup issue was corrected before collecting these final logs; neither setup errors nor reproduction success are counted as product passes.
