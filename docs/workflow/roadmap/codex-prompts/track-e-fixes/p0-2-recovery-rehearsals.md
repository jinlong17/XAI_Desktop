Goal:
Track E P0-2 修复 — packages/recovery-rehearsal-3-rekey-kill9/ 里 4 个恢复演练有 3 个是 toy stub。

Branch (你必须在此分支): codex/track-e-sync-hardening

问题（来自 Claude Code 跨厂商 review）:
packages/recovery-rehearsal-3-rekey-kill9/src/index.ts 中：
1. rehearseServerWipeClientResync — 只是 Map.set('todo-1','encrypted-local') 再断言读回来
2. rehearseLocalWipeMnemonicRestore — 把 mnemonicValid=true 硬编码，没有真实 mnemonic 派生
3. rehearseDeviceRevokeWriteRejection — 只是测 JS Set.has 行为
（只有 rehearseRekeyKill9Resume 真正调用了 resumeTwoPhaseRekey）

修复要求（每个场景必须实际执行产品代码路径）:

1. rehearseServerWipeClientResync:
   - 用 plugin-account 的 createSyncOutbox + pushBatch（@repo/plugin-account 已导出）
   - 创建一个 in-memory SyncPushTransport mock，初始为"server wiped"状态
   - 让客户端从本地 outbox flush，再用 pullBatch 读回服务器
   - 断言：服务器接受了客户端的 envelope，pullBatch 返回的 currentAccountCommitSeq > 0
   - setup（建 outbox + mock server）→ action（push）→ assert（mock server 状态正确）→ cleanup

2. rehearseLocalWipeMnemonicRestore:
   - 用 packages/ed25519-recovery-signing 的 generateRecoverySigningKeypair + signRecoveryTranscript + verifyRecoveryTranscript
   - 模拟：原账户有一个 recoverySigningKeypair；本地擦除后，用同样的 mnemonic 重新派生（这里可以直接复用同一 keypair，但必须真正调用 sign + verify 校验 transcript）
   - 断言：verifyRecoveryTranscript 对正确的签名返回 true，对错误的 transcript 返回 false
   - setup → action → assert → cleanup

3. rehearseDeviceRevokeWriteRejection:
   - 用 InMemoryDevicePairingRegistry（packages/x25519-device-keypair）或者直接构造一个 RegisteredDevice 列表
   - 创建一个 push 路径 mock：当 device.status === 'revoked' 时拒绝写入
   - 实际调用：先 push（active device 成功）→ 把 device 改成 revoked → 再 push 应该被拒绝并抛 E3030/E3036 等错误码
   - 断言：第一次 push 成功，第二次 push 抛错
   - setup → action → assert → cleanup

4. rehearseRekeyKill9Resume:
   - 保持现有实现（已合格），但补充 cleanup 阶段（调用 store.clear(sessionId)）

实现要求:
- 每个函数返回 RecoveryScenarioResult，passed 字段由真实断言决定，不能硬编码 true
- 如有需要可以把同步函数改成 async
- runAllRecoveryRehearsals 也相应调整

测试更新:
- tests/recovery-rehearsal.test.ts：保留"4 个 result 名字匹配"的 sanity check
- 新增至少 4 个独立的 it() 测试，每个 scenario 一个 it，分别断言 result.passed === true 且 details 非空
- 新增 1 个负面测试：手动构造一个"server wipe 但 client 也丢失了本地 outbox"的场景，断言 passed === false

验证命令（必须全部通过）:
- pnpm --filter @repo/recovery-rehearsal-3-rekey-kill9 test
- pnpm --filter @repo/recovery-rehearsal-3-rekey-kill9 check-types

完成后:
- git add 仅 packages/recovery-rehearsal-3-rekey-kill9/ 下的改动
- commit message: "fix(recovery-rehearsal): replace toy stubs with real product-code scenarios"
  body 包含 Why / What / Risk / Tests
- 不 push

禁止修改:
- packages/recovery-rehearsal-3-rekey-kill9/ 之外的源代码
- 如果发现 plugin-account 或别处需要导出新的 helper，写一个 TODO 注释在本包里，不要改其他包
