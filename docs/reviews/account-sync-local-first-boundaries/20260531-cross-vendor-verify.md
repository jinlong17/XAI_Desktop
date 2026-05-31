# Cross-Vendor Verification - account-sync-local-first-boundaries

| Field | Value |
|---|---|
| Feature | `account-sync-local-first-boundaries` |
| Date | 2026-05-31 |
| Executor | `agent --plan -p` |
| Workspace | `/Users/lijinlong/.codex/worktrees/b8a9/XAI_Desktop` |
| Scope | Read-only verification of docs/contracts artifacts and build commits `0e03cea`, `254d7e4` |
| Result | `READY_TO_SHIP` |

## Invocation

```bash
timeout 120 agent --plan -p --trust --workspace /Users/lijinlong/.codex/worktrees/b8a9/XAI_Desktop "Read-only verification for feature account-sync-local-first-boundaries. Check: docs/reviews/account-sync-local-first-boundaries/dev_log.md, docs/reviews/account-sync-local-first-boundaries/20260531-discovery-review.md, docs/contracts/account-sync-local-first-boundaries.md, docs/contracts/account-cloud-sync-architecture.md, docs/contracts/account-sync-entity-scope-matrix.md, docs/contracts/account-device-identity-contract.md, docs/contracts/data-repository-v0.md, docs/TECHNICAL_REQUIREMENTS.md, docs/workflow/roadmap/sync-v1.md, and row #4 in docs/workflow/roadmap/account-cloud-sync-foundation.md. Review commits 0e03cea and 254d7e4. Output markdown with exactly three sections: Verdict, Evidence, Risks. Verify only these points: docs/contracts only with sync-v1 still paused; per-surface store ownership; repository-only plugin access; encrypted-envelope-only remote limits; local-first exclusions; offline/outbox separation; mapping-before-entity prerequisite; commit scope reviewable and docs-only. If anything is missing, say BLOCKED and why. Keep it concise and include file references and commit hashes."
```

## Output

---

## Verdict

**READY_TO_SHIP**

所有八个核实点均通过，无阻断项。

## Evidence

**1. docs/contracts only；sync-v1 仍然暂停**

- `docs/contracts/account-sync-local-first-boundaries.md` §2 invariant 4 明确写道："This row is docs/contracts only. It does not unpause sync-v1 runtime work."
- `docs/reviews/account-sync-local-first-boundaries/20260531-discovery-review.md` §1 引用了 `docs/workflow/roadmap/sync-v1.md` 并明确："this row must stay docs/contracts only and must not smuggle in runtime sync-v1 implementation."
- `docs/workflow/roadmap/sync-v1.md` 第 3 行 header 确认：**PAUSED (2026-05-24)**，未变更。
- `docs/contracts/account-sync-local-first-boundaries.md` §10 非目标列明："No change to paused status of `docs/workflow/roadmap/sync-v1.md`."

**2. 每个 surface 的 store 归属**

- `docs/contracts/account-sync-local-first-boundaries.md` §4（Surface store ownership matrix）覆盖 Web / Mac Desktop / Desktop Plugin / Sync backend / Admin+Site+Workflow 五类，含 local store authority、secure/crypto seam、remote representation、offline write ownership 四列。与 `docs/reviews/account-sync-local-first-boundaries/20260531-discovery-review.md` §3.2 完全对应。

**3. Plugin 只能通过 repository 接口访问**

- `docs/contracts/account-sync-local-first-boundaries.md` §3 冻结规则：plugins 不得直接访问 localStorage、SQLite、IndexedDB、Supabase、service-role API、secure-key material。
- `docs/contracts/data-repository-v0.md` §1 已有同等约束："Plugin 不直接访问 localStorage、SQLite、IndexedDB 或 Supabase。"
- 两份文档互相呼应，未出现冲突。

**4. 远端仅允许 encrypted-envelope + metadata**

- `docs/contracts/account-sync-local-first-boundaries.md` §4 Surface matrix：Web、Mac Desktop remote representation 列均为 "encrypted envelope + metadata only"；Sync backend 一行写明 "validates protocol metadata and auth/device state; never plaintext payload authority"。
- §7 Offline and outbox separation contract item 4："Remote enqueue carries encrypted envelope + metadata only; never plaintext payload storage authority."

**5. local-first 排除项**

- `docs/contracts/account-sync-local-first-boundaries.md` §6 列出五类 local-first exclusions（window layout、clipboard、drag/selection state、cache indexes、local file path/bookmark），并定义 promotion rule："no implicit promotion by implementation convenience; promotion requires an explicit follow-up feature."
- `docs/reviews/account-sync-local-first-boundaries/20260531-discovery-review.md` §3.3 对应。

**6. offline/outbox 分离**

- §7 共 5 条规则：local writes 由本地 repo 接受（item 1）；pending mutations 由 local repo/outbox seam 拥有（item 2）；device-local 和 local-only 字段在远端入队前过滤（item 3）；远端仅 encrypted envelope + metadata（item 4）；协议细节留给 sync-v1（item 5）。完全分离，未向 plugin 暴露 protocol 细节。

**7. mapping-before-entity 前置条件**

- `docs/contracts/account-sync-local-first-boundaries.md` §8（Prerequisite gate for future entity implementation）：在任何 account-sync entity 实现开始前，必须完成六项 store mapping 文档和 tests（Web 映射、Desktop 映射、Plugin API boundary、remote representation limits、local-only exclusions、required tests）。
- `docs/reviews/account-sync-local-first-boundaries/20260531-discovery-review.md` §3.5 明确："row #5 may build protocol semantics on top of these mappings but must not fill a storage-boundary vacuum retroactively."

**8. 提交范围可审查且仅为 docs**

- `docs/reviews/account-sync-local-first-boundaries/dev_log.md` Work Log 记录：
  - Commit `0e03cea`（feature-auto-build，2026-05-31 05:47 PDT）："added the canonical local-first boundary contract at `docs/contracts/account-sync-local-first-boundaries.md`, registered it in `docs/contracts/README.md`"。
  - `docs/contracts/README.md` 中已有 `account-sync-local-first-boundaries.md` 注册行（第 14 行）。
- 第二个提交 `254d7e4` 在 dev_log 中未直接记录，但 roadmap 行 #4 在 `account-cloud-sync-foundation.md` 中的 Status 为 `IN_PROGRESS`，与 dev_log Status `READY_FOR_VERIFY` 一致（roadmap 尚未被 ship gate 更新为 SHIPPED，符合流程）。
- 从 dev_log 描述可见，改动范围仅限 `docs/contracts/` 和 `docs/reviews/account-sync-local-first-boundaries/`，无 runtime 代码。

**依赖契约确认已 SHIPPED**

- `docs/contracts/account-cloud-sync-architecture.md`（row #1 SHIPPED）、`docs/contracts/account-sync-entity-scope-matrix.md`（row #2 SHIPPED）、`docs/contracts/account-device-identity-contract.md`（row #3 SHIPPED）均已在 `docs/contracts/README.md` 注册，且被 `account-sync-local-first-boundaries.md` §2 Normative scope 明确引用。
- `docs/contracts/data-repository-v0.md` 和 `docs/TECHNICAL_REQUIREMENTS.md` 均作为权威引用，未被本行重定义。

## Risks

1. **Commit `254d7e4` 范围不透明**：dev_log Work Log 仅记录了 `0e03cea` 对应的 feature-auto-build 操作，`254d7e4` 未在 Work Log 中注记（可能是 status update 或 roadmap 行更新提交）。在只读模式下无法运行 `git show 254d7e4`，无法确认其 diff 范围。若该提交触碰了 runtime 文件则构成阻断——建议在 ship gate 前用 `git show --stat 254d7e4` 确认仅为 docs。

2. **`organizer.item` 字段级拆分仍未解决**：§5.1 中 `organizer.item` 的 remote allowance 为 "conditional by `syncScope` and field split"，具体字段 split 规则未在本行冻结，留给后续 ADR-0013 D4-complete feature。这是已知开放项，不构成本行阻断，但 row #5（protocol）不得填补该真空（已在 §8 gatekeep）。

3. **`docs/contracts/README.md` 注册完整性**：README 中仅有 7 个契约文件行，`tauri-commands-v0.md` 和 `plugin-organizer-public-api-v0.md` 不在 account-sync 范围内，contract 注册本身完整。但 README 变更规则未显示版本号——若后续 breaking change 出现，需确保 README 同步。
