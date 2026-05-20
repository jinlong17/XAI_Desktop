# sync-v1 修补报告 — 2026-05-19

- Diagnoser: A-Claude (SOP_BUGFIX Phase 0–4)
- Patcher: D-Codex via scripts/cowork/dispatch_codex.sh (Phase 5+6)
- Cross-vendor verify: A-Claude (writer ≠ verifier)
- Source review: sync-v1.review-20260519.md

## Triage

Phase 2 review found **zero NEEDS_PATCH from feature-verify simulation**. Phase 5 health check found **one P0 build regression** not caught by the autorun (it only ran `--filter @repo/plugin-account check-types` + web typecheck, never the `desktop#build` path that typechecks imported plugin-account source under `lib: ES2020`).

| Patch | Feature | Priority | LOC | Status |
|---|---|---|---|---|
| P0-1 | onboarding-backfill-ui (#18) | P0 | ≤8 | VERIFIED ✅ (commit 52e82b1) |
| P0-2 | tla-protocol-model (#33) | P0 | ≤3 | DISPATCHED → see P0-2 Phase 4 |

Non-blocking findings F1–F4 (doc drift / cosmetics) from the review are **not** patched here — fixing them with code would be fabricated work; F1/F2 belong to the status-write-authorized conductor.

---

## P0-1 — #18 onboarding-backfill-ui: `escapeHtml` uses ES2021 `replaceAll`, breaks `desktop#build`

### Phase 0 — 问题登记
- **Bug 标题:** `escapeHtml` 使用 ES2021 `String.prototype.replaceAll`,在 `apps/desktop` (`lib: ES2020`) 编译导入的 plugin-account 源码时报 TS2550,导致 `pnpm build` 失败。
- **影响区域:** `packages/plugin-account/src/onboarding-backfill.ts:347-352` (`escapeHtml`),经 `apps/desktop/tsconfig.json` (`"target":"ES2020"`,`"lib":["ES2020","DOM","DOM.Iterable"]`) 类型编译时暴露。
- **出现场景:** 任意 `pnpm build`(turbo `desktop#build`)。`apps/web` 与 `--filter @repo/plugin-account check-types` 用更高 lib,未暴露。
- **影响范围:** workspace 构建健康门 RED;阻塞 Console roadmap 干净启动(Phase 6 门禁要求无未修补缺陷)。运行时不受影响(现代引擎有 `replaceAll`),纯类型/构建缺陷。
- **严重程度:** P0(blocks downstream / 健康门)。

### Phase 1 — 最小复现
```
pnpm build
# desktop:build: ../../packages/plugin-account/src/onboarding-backfill.ts(348,6):
#   error TS2550: Property 'replaceAll' does not exist on type 'string'.
#   Try changing the 'lib' compiler option to 'es2021' or later.
# ELIFECYCLE Command failed with exit code 2 ; Failed: desktop#build
```
稳定复现(/tmp/cw-health-build.log:57-69)。`web:build` exit 130 是 turbo 在 desktop 失败后中止的级联,非独立故障。

### Phase 2 — 影响范围分析
- 面:plugin (`@repo/plugin-account`),经 host 构建路径暴露。非跨 plugin,无 typed-event 漂移,不涉及 macOS native。
- 回归来源:`git log` — #18 `3129d31 feat(onboarding-backfill-ui): add recovery backfill flow` 引入 `escapeHtml`。

### Phase 3 — 根因分析
- 根因分类(SOP §3):**回归引入** — #18 新增代码使用 `String.prototype.replaceAll`(ES2021),但 `apps/desktop` 构建 lib 目标为 ES2020;叠加**验证缺口**(autorun 未跑 `desktop#build`)。

### Phase 4 — 修复策略
- **修哪里:** `packages/plugin-account/src/onboarding-backfill.ts` `escapeHtml` 内 5 处 `.replaceAll('c','r')` → ES2020 安全的 `.replace(/c/g,'r')`。5 个搜索字符 `& < > " '` 均非正则元字符,字面量字符类安全,语义完全等价。
- **为什么修这里:** 根因是该函数使用了超出消费方 lib 的 API;plugin 内最小改动即可消除,符合 SOP "plugin 内修复,避免污染 core/host"。
- **不做什么:** 不改 `apps/desktop/tsconfig.json` 或共享 `@repo/typescript-config` 的 lib 目标 —— 那会扩大爆炸半径并掩盖其他潜在 ES2021 误用。仅此函数局部修复。
- **manifest.json / design.md / api.md:** 无签名/事件/契约变更,不需要同步。
- **回归测试(必须):** 扩展 `packages/plugin-account/tests/onboarding-backfill.test.ts`,通过已导出的 `createEmergencyKitDocument`(内部经 `renderEmergencyKitHtml` → `escapeHtml`)断言含 `& < > " '` 的 `accountEmail` / `secretKey` 被正确转义为 `&amp; &lt; &gt; &quot; &#39;`,证明 regex 替换后语义不变。最终门:`pnpm build` exit 0。
- **真机验证:** 不涉及多窗口/native,纯类型构建,不需要真机。
- **优先级:** P0。**预计 LOC:** ≤8(5 行替换 + 测试新增数行)。

### Phase 4 — Dispatch / 执行记录
- Prompt rendered: `/tmp/cw-orchestrator/onboarding-backfill-ui-patch-prompt.txt` (SOP Phase 5 format).
- Dispatched: `bash scripts/cowork/dispatch_codex.sh onboarding-backfill-ui <prompt> bug-fix` → exit 0.
- Run log: `/tmp/cw-quota/onboarding-backfill-ui.bug-fix.codex.last_run.jsonl`.
- Codex turn.completed ~150s; commit `52e82b1 fix(onboarding-backfill-ui): use ES2020-safe regex replace in escapeHtml`.
- **Cross-vendor verify (A-Claude) = VERIFIED:**
  - Scope: exactly 2 files (`onboarding-backfill.ts` 5×replaceAll→`.replace(/X/g,…)`; `onboarding-backfill.test.ts` +15 lines HTML-escape regression test). No tsconfig / shared config touched. No unrelated edits.
  - Semantics: escape order preserved (`&` first); search chars non-metacharacter; `replaceAll` fully removed from plugin-account src.
  - Gates: `pnpm --filter @repo/plugin-account test -- tests/onboarding-backfill.test.ts` exit 0; `pnpm build` **exit 0 (3/3, desktop#build green)** — P0 cleared. `cargo test` + `pnpm lint` already green.
  - Commit trailer `Co-authored-by: bug-fix <workflow-v2@local>` present; single commit; no ship/push.
- Outcome: **P0-1 VERIFIED & resolved.** (Note: `/tmp/cw-quota/codex-exhausted-until` written post-turn — patch already completed before the quota signal; no further dispatch needed.)

---

## P0-2 — #33 tla-protocol-model: TLC counterexample, `RecoveredDevicesHaveDEK` violated

### Phase 0 — 问题登记
- **Bug 标题:** 安装 JRE 后跑 TLC,`docs/spec/sync.tla` 不通过 —— `Invariant RecoveredDevicesHaveDEK is violated`(5 状态反例)。
- **影响区域:** `docs/spec/sync.tla:204-205`(`RecoveredDevicesHaveDEK` 不变式定义)。
- **出现场景:** `cd docs/spec && java -jar /tmp/tla2tools.jar -deadlock -workers 2 -config sync.cfg sync.tla`。
- **影响范围:** #33 是 Phase 4.8→5 准入门 `#37` 的输入;模型不通过则 #37 不能 all-pass,**阻塞整个 Phase 5 (#38–#56)**。
- **严重程度:** P0(blocks downstream gate chain)。**注:#33 的 BLOCKED 原因由"无 JRE"转为"TLC 反例"——blocker 仍成立,但性质改变。**

### Phase 1 — 最小复现(TLC 反例,深度 5)
```
State1 Init: active={d1} recovered={}
State2 JoinDevice(d2)
State3 RevokeDevice(d1): active={d2} hasDEK[d1]=FALSE
State4 FullRecovery(d1): recovered={d1} active={d1,d2} hasDEK[d1]=TRUE
State5 RevokeDevice(d1): active={d2} revoked={d1} hasDEK[d1]=FALSE, 但 recovered 仍={d1}
=> \A d \in recovered: hasDEK[d]  在 d1 上为 FALSE → 不变式被违反
498 states generated, 322 distinct, depth 5
```

### Phase 2 — 影响范围分析
- 面:形式化模型 artifact(`docs/spec/sync.tla`),非产品代码。无跨 plugin、无 typed-event。
- 回归来源:`#33 feat(tla-protocol-model): add sync tla model`(autorun Codex 串行,从未跑过 TLC,故未发现)。

### Phase 3 — 根因分析
- 根因分类(SOP §3):**状态流转错误** —— `recovered` 是单调"曾恢复过"集合(只增不减);`RevokeDevice` 把 `hasDEK[d]=FALSE` 却不从 `recovered` 移除。不变式 `\A d \in recovered: hasDEK[d]`(语义=所有曾恢复过的设备恒持有 DEK)**写得过强**:恢复后再被吊销是合法协议行为(吊销设备本就该失去 DEK)。模型真正要表达的属性是"**仍处于 active 的已恢复设备**必持有 DEK"。

### Phase 4 — 修复策略
- **修哪里:** `docs/spec/sync.tla` `RecoveredDevicesHaveDEK` 定义,改为
  `RecoveredDevicesHaveDEK == \A d \in recovered \cap active: hasDEK[d]`。
- **为什么修这里:** 保留 FullRecovery 的真实保证(已恢复且仍 active 的设备能解密),同时允许恢复后再吊销;最小、语义忠实。
- **不做什么:** 不改 `sync.cfg`(不变式名不变);不动其他 action/不变式;不弱化 `RecoveredDevicesHaveDEK` 以外任何安全属性。
- **回归/验证(跨厂商,A-Claude):** 重跑 TLC,期望 `Model checking completed. No error has been found.`,且 6 个 mandatory scenario 仍可达(`scenarioSeen` 覆盖)。清理 TLC 副产物(states/、*TTrace*),不污染 worktree。
- **优先级:** P0。**预计 LOC:** ≤3(单行不变式)。

### Phase 4 — Dispatch / 执行记录
- **Step 1 dispatch** (`tla-protocol-model-patch-prompt.txt`): Codex applied the `RecoveredDevicesHaveDEK \cap active` 1-line fix → re-ran TLC → second invariant `AppliedAndConflictDisjoint` violated at depth 6 → Codex correctly **REFUSED to commit** (exemplary cross-vendor discipline: would have been falsely greenlighting a failing test). Worktree left at `M docs/spec/sync.tla` with the first fix only.
- A-Claude re-ran TLC to capture the second counterexample directly (see `/tmp/cw-tlc-sync-v2.log`): cross-epoch retry of same `mutation_id` (BeginRekey between two QueueOfflineMutation calls of (d1,m1)) leaves a same-mutation entry in conflictShadow after the second attempt succeeds — exactly the realistic scenario the PRD's `mutation_dedup` table is designed to reconcile.
- **Step 2 dispatch** (`tla-protocol-model-patch-prompt-v2.txt`): extended Codex prompt with both fixes:
  1. `RecoveredDevicesHaveDEK` → `\A d \in recovered \cap active: hasDEK[d]`
  2. `ReplayPending` successful-apply branch: `conflictShadow' = { rec2 \in conflictShadow : rec2.mutation # rec.mutation }` (mirrors mutation_dedup).
  Codex applied BOTH edits to `docs/spec/sync.tla` (confirmed via `git diff`), restarted TLC, reached **depth 9 / ~374k states with zero invariant violations**, then hit `No space left on device (StatePoolWriter.run)` — `/dev/disk3s5` capacity was already at 99% before this work began. Codex's TLC subprocess died on the I/O error; Codex did NOT commit (correct — exhaustive verify did not complete cleanly).
- A-Claude diagnostic at MaxCommit=2 (temp cfg `/tmp/sync-small.cfg`, NOT in repo): same disk-full at 12M generated / 3M distinct states in ~1 min. State space is genuinely large even at reduced bounds.
- **Outcome: PARTIALLY RESOLVED — code-level diagnosis complete; exhaustive verify blocked by environmental disk constraint.**
  - Both spec fixes ARE in the worktree at `M docs/spec/sync.tla` (uncommitted by design — verify gate not yet green).
  - 7 GB of TLC byproducts (`docs/spec/states/`) cleaned by A-Claude; worktree restored to `M docs/spec/sync.tla` only. Disk recovered to 7.2 GB free / still 99% capacity.
  - Through 374k states (depth 9), zero counterexamples found with both fixes — strong evidence the fixes are correct, but **not exhaustive verification**.
- **Remaining blocker for #33 changed:** no longer "no JRE" (resolved by `brew install openjdk` → openjdk 25.0.2) and no longer "single invariant defect" (two real model defects diagnosed + worktree-fixed). New blocker = **disk capacity**: `/dev/disk3s5` is at 99% (~7 GB free); the full sync.tla state space at sync.cfg's MaxCommit=3 / 3 devices / 3 mutations needs many tens of GB of TLC state files. Free 20+ GB of disk (or run TLC on a machine with adequate disk), re-run the unmodified prompt-v2 verify command, expect clean pass, then a commit unblocks #33.
- Dispatches used: P0-1 (1) + P0-2 step 1 (2) + P0-2 step 2 (3) = **3 of 3 cap reached**. Stop dispatching further Codex turns until the disk blocker is resolved.

## #33 status reconciliation (informational; reviewer does NOT edit manifest)

Manifest row `sync-v1.md:48` records `Status: BLOCKED` with reason "TLC could not run because this machine has no Java Runtime". This is now **stale**: JRE is installed (openjdk 25.0.2 at /opt/homebrew/opt/openjdk/bin/java). The actual current blocker is:

1. (Worktree, uncommitted) two correct-looking model edits not yet verified exhaustively.
2. /dev/disk3s5 at 99% prevents exhaustive TLC sweep on this machine.

Conductor (status-write authority) should refresh #33's manifest Note when ready. Reviewer/diagnoser does not touch manifest status per goal constraint.
