Goal:
Track E P1-4 修复 — packages/plugin-account/src/beta-ops.ts 的 planAccountDeletion 只返回 plan，没有执行器，也没有测试验证 7 张表全部清空。

Branch (你必须在此分支): codex/track-e-sync-hardening

问题（来自 Claude Code 跨厂商 review）:
planAccountDeletion 返回:
  { accountId, revokeDeviceIds, deleteTables: ['encrypted_blobs', 'staging_blobs', ...], serverCleanupRequired: true }
但没有任何函数真正执行删除，也没有测试断言所有表都被清空。

修复要求:

1. 新增类型（在 beta-ops.ts）:
   interface AccountDeletionStore {
     deleteRows(table: string, filter: { accountId: string }): Promise<number>;
     revokeDevice(deviceId: string): Promise<void>;
   }

   interface AccountDeletionResult {
     accountId: string;
     deletedRowsByTable: Record<string, number>;
     revokedDeviceIds: string[];
     completed: boolean;
   }

2. 新增 executor 函数:
   export async function executeAccountDeletion(
     store: AccountDeletionStore,
     plan: AccountDeletionPlan,
   ): Promise<AccountDeletionResult>
   - 顺序遍历 plan.deleteTables（不可少任何表）
   - 对每个 table 调 store.deleteRows(table, { accountId: plan.accountId })，记录返回行数
   - 然后遍历 plan.revokeDeviceIds 调 store.revokeDevice
   - 任一步骤抛错：catch 后继续完成其它表，但最终 completed=false（best-effort cleanup）
   - 成功完成所有步骤：completed=true

3. 新增 in-memory store 帮助测试:
   export class InMemoryAccountDeletionStore implements AccountDeletionStore {
     readonly tables = new Map<string, { accountId: string; ...rest }[]>()
     readonly revokedDeviceIds = new Set<string>()
     // 可由测试预填行
     seed(table: string, rows: { accountId: string }[]): void
     // 实现 deleteRows / revokeDevice
   }

4. 新增测试（packages/plugin-account/tests/beta-ops.test.ts，加在现有 3 个之后）:
   - "executeAccountDeletion clears all 7 planned tables and revokes all devices"
     - seed 每张表 2 行（一行 accountId='target'，一行 accountId='other'）
     - 跑 executeAccountDeletion
     - 断言：每张表 deletedRows[table] === 1，且 store.tables.get(table) 里 'target' 行没了 'other' 行还在
     - 断言：revokedDeviceIds 都被加进 store
     - 断言：completed === true
   - "executeAccountDeletion best-effort completes other tables when one throws"
     - 构造一个 store，第 3 张表 deleteRows 抛错
     - 跑后断言：completed === false，但其他 6 张表仍被处理
   - "executeAccountDeletion does not touch rows of other accounts"

类型导出（packages/plugin-account/src/index.ts）:
- 导出 executeAccountDeletion, InMemoryAccountDeletionStore, AccountDeletionStore, AccountDeletionResult

验证命令（必须全部通过）:
- pnpm --filter @repo/plugin-account test
- pnpm --filter @repo/plugin-account check-types

完成后:
- git add packages/plugin-account/src/beta-ops.ts packages/plugin-account/src/index.ts packages/plugin-account/tests/beta-ops.test.ts
- commit message: "fix(beta-ops): add account deletion executor with 7-table coverage tests"
  body 包含 Why / What / Risk / Tests
- 不 push

禁止修改:
- 其他包
- packages/plugin-account/src/ 下与 beta-ops 无关的文件
- 与 P1-1 (encrypted export) 重叠时：你只修改 planAccountDeletion / executeAccountDeletion 相关部分，
  不要碰 exportEncryptedAccountData。若另一 agent 先完成 P1-1，rebase 时保留对方的改动。
