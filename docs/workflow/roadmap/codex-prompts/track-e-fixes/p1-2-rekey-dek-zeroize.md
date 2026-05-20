Goal:
Track E P1-2 修复 — packages/plugin-account/src/rekey.ts 的 completeRekeySwap 只把 keyring 标 retired，没有 zeroize 旧 DEK material，也没清理 device_dek_wraps。

Branch (你必须在此分支): codex/track-e-sync-hardening

问题（来自 Claude Code 跨厂商 review）:
完整代码搜索 zeroize|secureWipe|fill(0) → 全代码库 0 hit。
- 旧 keyring entry 仅 status='retired'，未清除任何字节
- 没有 hook 给调用方传"请把这些 device_dek_wraps 行删掉"的信号

修复要求:

1. 新增类型（在 rekey.ts）:
   interface RetiredKeyCleanupPlan {
     oldKeyId: number;
     deviceDekWrapsToDelete: { accountId: string; keyId: number }[];
     keyMaterialZeroized: boolean;
   }

2. 修改 completeRekeySwap 返回类型为:
   { account: RekeyAccountState; session: RekeySession; cleanup: RetiredKeyCleanupPlan }

3. 在 completeRekeySwap 内：
   - 在 assertRekeyProofGate 通过、staged 校验通过、构造新 account 状态之后：
     a) 调用一个新内部 helper zeroizeKeyMaterial(account, oldKeyId)：
        - 这个 helper 接受 account.keyring 中 oldKeyId 对应 entry 的可能 Uint8Array 字段（当前模型可能没有，先在 RekeyKeyringEntry 加一个可选的 materialBuffer?: Uint8Array）
        - 如果有 materialBuffer：用 entry.materialBuffer.fill(0)
        - 返回 keyMaterialZeroized: boolean（有 buffer 就 true，否则 false 但仍然安全因为本来就没有）
     b) 构造 cleanup plan：
        deviceDekWrapsToDelete = session.activeDeviceIds.map(deviceId => ({
          accountId: <来自 account/session>, keyId: oldKeyId
        }))
        （注意：本包没有 accountId 字段，需要从 session 或 account 推出。如果都没有，加一个 input.accountId 到 BeginRekeyInput 并 propagate 到 session）

4. 同步更新 packages/rekey-two-phase/src/index.ts:
   - RekeyCheckpoint 新增 cleanup?: RetiredKeyCleanupPlan 字段
   - completeTwoPhaseRekey 把 cleanup 也写入 checkpoint
   - resumeTwoPhaseRekey after_swap 分支返回的 checkpoint 也带 cleanup

5. 新增测试 packages/plugin-account/tests/rekey.test.ts:
   - 已有 9 个测试保持通过
   - 新增"completeRekeySwap returns cleanup plan with old DEK wraps for all active devices"
   - 新增"completeRekeySwap zeroizes materialBuffer when present" — 构造一个带 materialBuffer 的 keyring entry，断言 buffer 被 fill(0)

6. 在 packages/rekey-two-phase/tests/rekey-two-phase.test.ts 新增：
   - "checkpoint carries cleanup plan after_swap"

类型导出更新（packages/plugin-account/src/index.ts）:
- 同步导出 RetiredKeyCleanupPlan 类型

验证命令（必须全部通过）:
- pnpm --filter @repo/plugin-account test
- pnpm --filter @repo/plugin-account check-types
- pnpm --filter @repo/rekey-two-phase test
- pnpm --filter @repo/rekey-two-phase check-types

完成后:
- git add packages/plugin-account/src/rekey.ts packages/plugin-account/src/index.ts packages/plugin-account/tests/rekey.test.ts packages/rekey-two-phase/src/index.ts packages/rekey-two-phase/tests/rekey-two-phase.test.ts
- commit message: "fix(rekey): emit cleanup plan and zeroize old DEK material on swap"
  body 包含 Why / What / Risk / Tests
- 不 push

禁止修改:
- packages/plugin-account/src/ 下与 rekey 无关的文件（不要碰 beta-ops.ts / sync-engine.ts）
- 其他 14 个 scaffold package
- 任何 SQL
