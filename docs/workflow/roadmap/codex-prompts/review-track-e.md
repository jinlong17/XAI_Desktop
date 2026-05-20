# Claude Code Review — Track E

直接复制下面的 `Goal:` 块到 Claude Code CLI 执行。

---

```text
全面审查 codex/track-e-sync-hardening 分支的改动（82 files, +3035 -1210）。
这个分支实现了 G9 Sync Hardening 全部 7 Epics + TLA+ 模型，填充了 14 个空 scaffold package。

审查范围：
git diff main...codex/track-e-sync-hardening

审查维度（逐条检查并给出 PASS / ISSUE 结论）：

1. 加密协议正确性（最高优先级）
   - G9-E1 Protocol integrity:
     - CBOR 序列化是否 deterministic（排序 key、canonical encoding）
     - AAD 构造是否包含 sender/recipient/nonce/version
     - test vectors 是否覆盖边界情况（空 payload、max size、特殊字符）
   - G9-E3 Device pairing:
     - X25519 DH 密钥交换流程是否正确
     - Ed25519 签名/验签是否正确
     - HPKE per-device wrap 是否正确封装 DEK
     - anti-abuse 限制（频率、最大设备数）是否合理
   - G9-E4 Rekey two-phase:
     - Phase 1 → Phase 2 的原子性保证
     - kill-9 后的恢复是否从 checkpoint 正确 resume
     - old key 清除是否在 new key 确认后才执行

2. Nonce 安全性
   - G9-E2:
     - nonce 是否唯一（lease 机制）
     - 重复 nonce 是否被拒绝
     - lease 过期后的行为
     - 并发 lease 请求的处理

3. Recovery 完整性
   - G9-E5 四个场景是否全面：
     a) Server wipe → 本地数据能重建 server
     b) Local wipe → mnemonic + server 能恢复本地
     c) Rekey kill-9 → 从 checkpoint 恢复
     d) Device revoke → 旧设备写入被拒绝
   - 每个场景是否有 setup → action → assert → cleanup

4. TLA+ / 模型检查
   - G9-S1:
     - 状态机是否覆盖所有 nonce/rekey 状态
     - 是否检查了死锁和活锁
     - 是否与 docs/spec/sync.tla 一致

5. Audit & 可观测性
   - G9-E6:
     - hash chain 是否正确（每条 log 包含前一条 hash）
     - tamper detection 是否能检测插入/删除/修改
     - telemetry 是否 privacy-safe（不含内容）

6. Beta 运维
   - G9-E7:
     - quota 限制是否可配置
     - delete account 是否清理了所有相关数据（devices, blobs, audit logs）
     - export 格式是否加密且自包含

7. 架构红线
   - packages/core-data/src/types.ts 是否未被修改（Repository 接口冻结）
   - docs/contracts/ 是否未被修改
   - plugin-account 是否是唯一涉及 sync 业务逻辑的 plugin
   - Track D 的 plugin 文件是否未被修改

8. 测试覆盖
   - 14 个 scaffold package 是否都有测试
   - apps/web/supabase/tests/ 的 9 个测试是否更新并通过
   - plugin-account 的测试数是否增加（之前 38，现在应该更多）
   - Supabase mock 是否合理（不依赖真实远程服务）

9. 安全审计
   - 密钥材料是否在使用后清零（zeroize）
   - 是否有硬编码的密钥/secret
   - 错误信息是否不泄露密钥内容
   - RLS policy 是否正确（user_id 过滤）

验证命令（请运行）：
- git diff --stat main...codex/track-e-sync-hardening
- git diff main...codex/track-e-sync-hardening -- '*.ts' '*.tsx' | head -800
- pnpm --filter @repo/plugin-account test
- pnpm --filter @repo/plugin-account check-types
- pnpm --filter web check-types
- pnpm --filter web test:nonce
- pnpm --filter web test:rekey
- pnpm --filter web test:audit
- pnpm --filter web test:rls
- pnpm --filter web test:protocol
- pnpm --filter web test:push
- pnpm --filter web test:recovery

对 14 个 scaffold package，每个运行：
- pnpm --filter @repo/<package-name> test（如果有 test script）
- pnpm --filter @repo/<package-name> check-types（如果有）

输出格式（严格遵守）：

## Track E Review — Claude Code

**Reviewer**: Claude Code cross-vendor review
**Branch**: codex/track-e-sync-hardening
**Commit**: a5af340
**Verdict**: APPROVED / REVISE / BLOCKED

### 1. 加密协议正确性 — PASS/ISSUE
（每个子项一行）

### 2. Nonce 安全性 — PASS/ISSUE

### 3. Recovery 完整性 — PASS/ISSUE

### 4. TLA+ 模型检查 — PASS/ISSUE

### 5. Audit 可观测性 — PASS/ISSUE

### 6. Beta 运维 — PASS/ISSUE

### 7. 架构红线 — PASS/ISSUE

### 8. 测试覆盖 — PASS/ISSUE

### 9. 安全审计 — PASS/ISSUE

### Issues（如有）
- [P0/P1/P2] 具体问题描述 + 修复建议

### Verdict 理由
（1-2 句话）

如果 Verdict 是 REVISE 或 BLOCKED，在 Issues 部分列出具体需要 Codex 修复的项目清单，每项包含：
- 文件路径
- 问题描述
- 修复方向

这个清单将直接传递给 Codex 做修复。
```
