# Clock F1-shape BEFORE receipt — f9eb4b1

**Scope:** CP-CLOCK-01 batch 70, contract r2 E5. Independent Sol executor (`gpt-6-sol`) in detached checkout `/Users/lijinlong/.codex/worktrees/audit-clock-b70-20261009/XAI_Desktop`, parent `b5688d8c952dbbb150bf69235493052ad776b832`. This is a frozen BEFORE oracle only. It does not establish fixed-product behavior, controller acceptance, or closure of any inventory item.

## Immutable inputs and provenance

- Requested revision `f9eb4b1`; resolved commit `f9eb4b1f207bc4b46f547b90afc250424b3c8695`. Each log records both, the tree, source hashes, measured streamed archive byte count and SHA-256, bundle inputs, archive `@repo` pin and checkout guard, browser version, pipe transport and K-1 key trace.
- The immutable archive measured 148,408,320 bytes, SHA-256 `bb468cede8a9659d9798bdb4c7f0a528faedf3ddfb344fb946f159ce6305a097`, tree `05887cf113639116b228a25041a37b3d5c69a322`; the browser was Chrome 155.0.8059.39. Of 1,022 bundle inputs, 630 were loaded from that archive, 390 from third-party dependencies, and zero from a foreign checkout.
- Contract r2 SHA-256 `214dc7582ff866cf76482b8883cc284edba8fa180f88bbf940fcaa7ab32cf0ae`; dependency, extracted and archived lockfile SHA-256 `df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9`.
- The F1 prelude is the accepted read-only `docs/reviews/web-sticky-recovery-f1/f1-prelude.js` (`67bbfaa7f554939f40a9ce53e570091f324bbee4b4e91adc7175b001fce87670`). The runner verifies both working and committed hashes. Production `App` composition is bundled from the immutable archive; the only synthetic product input is authentication.
- Runner and fixture infrastructure was adapted from the tracked, accepted AppRail F1-shape runner and fixture; Clock c1–c5 assertions were authored from contract r2. An early developmental copy of uncommitted stopped half-work was removed before any mode run and is not frozen or committed evidence. The stopped files were then consulted read-only for selector/scenario orientation only; no stopped log, screenshot or verdict was reused.

The stopped checkout was `/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop/.claude/worktrees/agent-a5f481d9b8ded5030`. The six source files involved in that discarded developmental copy/read-only orientation were `web-dashboard-clock-recovery-f1/{verify-f1-clock.mjs,f1-clock-host.tsx}` and `web-dashboard-clock-recovery-native/{verify-native-before.mjs,native-before-app.tsx,native-before-prelude.js,native-clock-probes.js}` under its `docs/reviews/` tree. Its logs, screenshots and verdicts were never used as evidence.

## Commands and outcomes

From the detached checkout, with `XAI_DEPS_ROOT=/Users/lijinlong/Desktop/Jinlong_Project/Coding_project/AI_Desktop/XAI_Desktop` as read-only third-party dependencies:

| Command suffix | Log | Exit | Checks | Outcome |
| --- | --- | ---: | ---: | --- |
| `node docs/reviews/web-dashboard-clock-recovery-f1/verify-f1-clock.mjs f9eb4b1 selfcheck before1` | `f1-f9eb4b1-selfcheck-before1.log` | 0 | 30 | Harness-valid; nested-storage spy self-check and positive controls PASS |
| `node docs/reviews/web-dashboard-clock-recovery-f1/verify-f1-clock.mjs f9eb4b1 clock before1` | `f1-f9eb4b1-clock-before1.log` | 2 | 150 | Harness-valid, five expected BEFORE business failures; no precondition failure |

The runner deliberately returns exit 2 when the correctly failing BEFORE business oracle is observed. It refuses to overwrite a log and preserves the nonzero process exit.

| Case | Correct BEFORE result | Required positive part |
| --- | --- | --- |
| c1, Clock draft + live POP | `before-not-held` | Clean coordinator/F1 signature gate PASS |
| c2, Clock draft + accessible-name AppRail click | `before-not-held` | Single trusted click, zero F1 signature/runtime errors PASS |
| c3, Header + Clock drafts | `before-header-only` | Header Retry auto-release once PASS |
| c4, Clock draft + sign-out | `before-not-held` | Rail and Appearance zero-confirm recorder PASS |
| c5, rail draft + Clock draft + sign-out | `before-rail-only` | Trusted intercepted rail drag; Cancel touches neither Clock nor coordinator; rail-first confirm PASS |

The five business failures are the contract's proposed Clock-only differences at `f9eb4b1`. Every case's preconditions passed. The frozen runner also contains the fixed-product c1–c5 branch and exact §11 changed-file gate for a later unchanged E16 rerun; **only BEFORE was executed here**.

## Frozen SHA-256 table

| File | SHA-256 |
| --- | --- |
| `verify-f1-clock.mjs` | `2645d99ea39afa7ab79f235a25ca0e5c7db38be6fc25cae3ef9abbe5c9df938e` |
| `f1-clock-host.tsx` | `f5fa29ac494e2f4da30b064aab802ca84c4df8cd943efc064af8aac8d1ff6e0c` |
| `f1-f9eb4b1-selfcheck-before1.log` | `6a227ced58c5c2b4121f3d45829b754086253517f06d4e7a18c3440e37a8e74b` |
| `f1-f9eb4b1-clock-before1.log` | `2f39b77a2fc456bc0491d06f8fde83d42cd808988ffea8d00a59f759887c4c1b` |

Development probes were external to Git under `/tmp/xai-clock-b70-probes` and were not used as final evidence:

| Probe log | Exit | Checks | Outcome |
| --- | ---: | ---: | --- |
| `f1-f9eb4b1-selfcheck-probe1.log` | 0 | 30 | Harness-valid |
| `f1-f9eb4b1-clock-probe1.log` | 1 | 122 | Harness-invalid selector correction, retained externally |
| `f1-f9eb4b1-clock-probe2.log` | 2 | 150 | Harness-valid, expected BEFORE business failures |

These are distinct from the two official `before1` invocations (180 checks total). No F1 `before2` or `before3` iteration was needed.
