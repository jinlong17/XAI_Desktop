# Codex Window 5 — Track E: G9 Sync Hardening

直接复制下面的 `Goal:` 块到 Codex 窗口即可。

---

```text
Goal:
Track E worker。8h 连续推进 G9 Sync Hardening 全部 7 个 Epic。Supabase 无远程环境，所有 edge function 和 RLS 用本地 mock/vitest 验证。不要 ship，不要 push。

Branch: codex/track-e-sync-hardening（从 main HEAD 创建）

前置：
- G2 数据层已完成（Repository v0, SQLite driver, Keychain bridge, sync baseline）
- plugin-account 已有 12 个源文件（account, sync-engine, rekey, mnemonic, audit-log 等）
- apps/web/supabase/ 已有 10 个 migration SQL + 3 个 edge function + 9 个 test 文件
- 14 个 G9 相关 scaffold package 存在但源码为空（0 TS files）
- plugin-account 有 38 个测试已通过

两个并行窗口：
- Track D (另一窗口): G3 收尾 + 9 个 plugin 接入 Repository
- Track E (你): G9 Sync hardening

文件所有权（你只能修改这些）:
- packages/plugin-account/
- apps/web/supabase/ (migrations, functions, tests)
- apps/web/app/ (仅 sync/account 相关页面)
- packages/core-data/src/ (仅 sync-related 扩展，不改已冻结 Repository 接口)
- docs/reviews/g9-*/ 和 docs/reviews/<feature>/
- docs/workflow/roadmap/ (你的 manifest 和 log)
- 以下 scaffold package（填充真实实现）:
  - packages/protocol-integrity-integration-tests/
  - packages/nonce-lease-server/
  - packages/x25519-device-keypair/
  - packages/rekey-two-phase/
  - packages/recovery-rehearsal-3-rekey-kill9/
  - packages/audit-log-integrity/
  - packages/rls-fuzz-property/
  - packages/tla-protocol-model/
  - packages/ed25519-recovery-signing/
  - packages/hpke-per-device-wrap/
  - packages/push-edge-function/
  - packages/recovery-proof-edge-function/
  - packages/realtime-private-channel-config/
  - packages/rls-policies-and-tests/

禁止修改:
- packages/plugin-labels/ (Track D)
- packages/plugin-productivity/ (Track D)
- packages/plugin-clipboard/ (Track D)
- packages/plugin-console/ (Track D)
- packages/plugin-project/ (Track D)
- packages/plugin-widgets/ (Track D)
- packages/plugin-calendar/ (Track D)
- packages/plugin-pet/ (Track D)
- packages/plugin-ai-cube/ (Track D)
- packages/plugin-organizer/ (Track D)
- packages/core-data/src/types.ts (Repository 接口已冻结)
- docs/contracts/ (提 change 写 proposed-contract-changes.md)

Feature 序列（按 G9 execution pack 顺序）:

1. G9-E1 Protocol integrity
   - 在 packages/protocol-integrity-integration-tests/ 填充实现
   - deterministic CBOR 序列化（可用 @repo/core-data 已有的 cipher-envelope-codec 参考）
   - AAD (Additional Authenticated Data) 构造和验证
   - test vectors: 固定输入 → 固定输出的确定性测试
   - property tests: 任意 payload → serialize → deserialize → 等于原始
   - 参考已有 packages/deterministic-cbor-aad/ 和 packages/cipher-envelope-codec/
   - 测试: pnpm --filter @repo/protocol-integrity-integration-tests test

2. G9-S1 TLA+ / model checking
   - 在 packages/tla-protocol-model/ 填充
   - nonce/rekey 状态机的 TLA+ 模型或等价 TypeScript 状态机模拟
   - 如果 TLA+ 工具链不可用，用 TypeScript exhaustive state exploration 代替
   - 输出: 状态覆盖报告，死锁/活锁检查
   - 参考已有 docs/spec/sync.tla

3. G9-E2 Nonce lease defense
   - 在 packages/nonce-lease-server/ 填充
   - server-side nonce lease RPC (参考已有 apps/web/supabase/migrations/20260519000008_nonce_lease_rpc.sql)
   - 客户端: plugin-account/src/sync-engine.ts 的 nonce 请求/释放/续租
   - dedup: 重复 nonce 拒绝
   - progress tracking: sync 进度持久化
   - 测试: pnpm --filter web test:nonce (已有 nonce-lease.test.ts)

4. G9-E3 Device pairing
   - 在 packages/x25519-device-keypair/ 填充 X25519 DH
   - 在 packages/ed25519-recovery-signing/ 填充 Ed25519 签名
   - 在 packages/hpke-per-device-wrap/ 填充 HPKE per-device 密钥封装
   - device registration → server 存储 public key
   - device pairing flow: 新设备 → 生成密钥对 → 请求配对 → 已有设备批准
   - anti-abuse: 配对频率限制，最大设备数限制
   - 参考已有 packages/x25519-device-keypair/ 和 packages/ed25519-recovery-signing/ 的 docs/

5. G9-E4 Rekey two-phase
   - 在 packages/rekey-two-phase/ 填充
   - 参考已有 plugin-account/src/rekey.ts
   - Phase 1: 撤销设备 → 标记 old key 过期 → 生成 new key
   - Phase 2: 用 new key 重新加密所有 blob → 确认 → 删除 old key
   - 中断恢复: kill -9 后可从任意 phase 恢复
   - 测试: pnpm --filter web test:rekey (已有 rekey.test.ts)

6. G9-E5 Recovery rehearsals
   - 在 packages/recovery-rehearsal-3-rekey-kill9/ 填充
   - 4 个场景的 mock 测试:
     a) Server wipe → client re-sync from local
     b) Local wipe → recover from server + mnemonic
     c) Rekey kill-9 → resume rekey from checkpoint
     d) Device revoke → old device write rejection
   - 每个场景: setup → action → verify → cleanup
   - 不需要真实服务器，mock Supabase responses

7. G9-E6 Audit and observability
   - 在 packages/audit-log-integrity/ 填充
   - audit log: hash chain（每条 log 包含前一条的 hash）
   - tamper detection: 验证 chain 完整性
   - Sentry placeholder: error boundary + breadcrumb
   - privacy-safe telemetry: 只记录 event type + timestamp，不记录内容
   - 测试: pnpm --filter web test:audit (已有 audit-log.test.ts)

8. G9-E7 Beta operations
   - 在 plugin-account 内扩展
   - quota: 每用户存储上限 (configurable)
   - rate limit: API 调用频率限制 (mock middleware)
   - support: 用户反馈入口 (UI component)
   - export: 导出用户全部加密数据 (与 Track D 的 G8-S4 对齐)
   - delete account: 删除用户数据 + 撤销所有设备 + 清理 server
   - 测试: pnpm --filter @repo/plugin-account test

Supabase mock 策略:
- 没有远程 Supabase project，不要尝试连接
- 所有 edge function 用 vitest mock:
  - mock supabase client (createClient → in-memory store)
  - mock RLS (verify query 带正确的 user_id filter)
  - mock realtime (event emitter)
- migration SQL 文件已存在，只验证 SQL 语法正确性
- RLS policy 测试用 packages/rls-policies-and-tests/ 和 packages/rls-fuzz-property/

每个 feature 工作流:
1. 读已有 scaffold package 的 docs/
2. 填充 src/ 实现
3. 写或运行测试
4. 更新 dev_log

每 2h checkpoint 写入 docs/workflow/roadmap/xai-v1.track-e-log.md（新建）。

遇到 blocker:
- 加密库缺失: 用 mock/stub，记录 deferred gate
- Supabase 不可用: 全部 mock（已预期）
- TLA+ 工具不可用: 用 TypeScript state exploration
- 测试失败: 修复或 incident 后继续

不要 revert 其他人改动。不要 install 新依赖。不要修改 Track D 的文件。
```
