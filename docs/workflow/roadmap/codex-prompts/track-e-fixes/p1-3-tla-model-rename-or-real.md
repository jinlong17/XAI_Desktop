Goal:
Track E P1-3 修复 — packages/tla-protocol-model/ 实际是手写 TS BFS，不是 TLA+，且未与 docs/spec/sync.tla 对齐。

Branch (你必须在此分支): codex/track-e-sync-hardening

问题（来自 Claude Code 跨厂商 review）:
packages/tla-protocol-model/src/index.ts 是 TypeScript BFS over 6-tuple 状态，
没有任何 TLA+ spec、没有 TLC 调用、没有引用 docs/spec/sync.tla。
取名 "TLA+" 是名实不符。

修复策略（采用方案 B：明确不是 TLA+，但增强状态模型并对齐 docs/spec/sync.tla）:

1. 在 packages/tla-protocol-model/src/index.ts 顶部加注释 block:
   /**
    * Protocol state explorer (NOT a TLA+ model).
    * This is a TypeScript exhaustive state-space exploration that mirrors
    * the high-level invariants of docs/spec/sync.tla, but does not run
    * TLC and is not a substitute for formal model checking.
    * See docs/spec/sync.tla for the authoritative specification.
    * Tracking: full TLA+ wiring (Java + tla-tools) is a follow-up in G9+1.
    */

2. 包名/导出保持向后兼容，但新增一个 main 导出 exploreProtocolStateSpace 的同时
   保留旧名 exploreProtocolStateSpace（不要 breaking）。可以加一个 alias
   export const explorerVersion = 'ts-bfs-v1';

3. 检查 docs/spec/sync.tla 是否存在；如果存在：
   - 读它的 VARIABLES 和 Init/Next 关键 action 名字
   - 在 ProtocolState 接口的 JSDoc 里写明每个字段对应的 sync.tla 变量
   - 如果发现 sync.tla 里有当前 model 没覆盖的状态（例如 conflict_shadow / device_revoke），
     在 nextStates() 增加这些 transition
   如果 docs/spec/sync.tla 不存在：
   - 在 packages/tla-protocol-model/docs/dev_log.md 写明"docs/spec/sync.tla 缺失"
   - 在 README 或 package.json description 里加 TODO 链接到 G9+1

4. 增强 checkInvariants（必须新增至少 3 条不变式）:
   - "leaseEnd >= nonce - 1 OR phase === 'staging' 时禁止 nonce 增长"
   - "phase=='swapped' 时不允许新增 stagedBlobs"
   - "oldKeyWritesAllowed=false 时不允许在 phase=='normal' 接受 commit"（如适用）
   - 现有 invariant 保留

5. 在 nextStates 增加至少 2 个新 transition:
   - 死锁恢复：phase=='staging' 且 stagedBlobs==2 时强制走 swap（已有）→ 加上"swap 失败回到 staging"
   - 并发回滚：phase=='swapped' 时允许 oldKeyWritesAllowed=true 的回退分支（仅用于探测，应被 invariant 拒绝）

6. 增强 exploreProtocolStateSpace：
   - 当 invariantFailures.length > 0 时，让 caller 能区分 BFS 完成但发现违例
   - 报告里增加 newInvariantsCovered: string[]

7. 测试增强（tests/tla-protocol-model.test.ts）:
   - 保留现有 2 个测试
   - 新增"checkInvariants flags swapped + oldKeyWritesAllowed=true"
   - 新增"explorer report references docs/spec/sync.tla in JSDoc"（用 readFileSync 读 src/index.ts 文本断言包含 'sync.tla'）

8. 如果包还叫 @repo/tla-protocol-model 不要改名（避免依赖断裂），但在 package.json description 改成 "Protocol state-space explorer mirroring docs/spec/sync.tla (NOT TLC-based)"

验证命令（必须全部通过）:
- pnpm --filter @repo/tla-protocol-model test
- pnpm --filter @repo/tla-protocol-model check-types

完成后:
- git add packages/tla-protocol-model/
- commit message: "fix(tla-protocol-model): document non-TLA+ status, align with sync.tla, add invariants"
  body 包含 Why / What / Risk / Tests
- 不 push

禁止修改:
- 任何其他包
- docs/spec/sync.tla 文件本身（read-only 参考）
