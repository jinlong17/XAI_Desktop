# REL-02 独立验证记录

修复提交：0141ecb；实现状态记录：f578ae8。父会话在实现 Agent 之外复核和执行下列检查。

- `pnpm --filter @repo/web-auth-device-session test`：12 文件、52 测试通过，含10项新增 IndexedDB 回归。使用 fake-indexeddb；不当作真实浏览器证明。
- `node docs/reviews/web-auth-device-session/verify-browser-idb.mjs`：真实 Chrome 原生 IndexedDB，隔离临时 profile、本地临时 HTTP 服务，无用户账号或生产数据。5场景通过：session先、device先、并发、v1 session-only迁移、v1 device-only迁移。校验两表共存、schema v2、旧值保留及连接清理。
- 首次 dump-dom/virtual-time 浏览器探针未等待 IDB 完成，超时且 DOM 仍为 RUNNING；不计通过。改为真实 HTTP 回执等待后，上述5场景通过。
- 代码复核：默认两表在统一 schema 初始化，versionchange关闭旧连接；blocked拒绝后迟到upgrade abort或success close；失败opening清理允许重试。
- Claude 独立只读审查进程已实际启动，随后以401退出：OAuth access token has been revoked。未运行审查，不能计作跨厂商PASS。

结论：功能回归和本地真实浏览器验证通过；跨厂商验证未完成，工作流仍为 FIX_READY_FOR_VERIFY，REL-02 不关闭。真实登录服务 E2E 不属于上述测试证据。

## Follow-up: independently reproduced warm-connection race

The original 52 tests missed an interleaving: after alpha is open, run alpha.setItem and the first beta.setItem concurrently in the same custom database. The beta schema upgrade closed alpha's connection before alpha resumed its awaited transaction creation. Added regression failed with InvalidStateError at storage.ts transaction creation.

Fix: queue complete store operations per database, including the callback promise; rejected operations release the queue. After the fix, 53/53 package tests and six real-Chromium scenarios passed, including the newly reproduced interleaving. This supersedes the earlier five-scenario coverage count, not the outstanding cross-vendor gate. The follow-up code change still requires independent review.

## Independent follow-up checks

A separate Agent reviewed the parent-authored queue change in f15aceb and added three independent tests: synchronous callback failure followed by a queued schema extension, transaction abort followed by another write, and a warm read concurrent with schema extension. Parent reran all three successfully using:

`node packages/core/node_modules/vitest/vitest.mjs run --config docs/reviews/web-auth-device-session/rel02-queue-review.config.mjs`

These tests are separate from the 53 package tests. Follow-up review found no remaining blocker in the queue logic. Cross-vendor gate is still pending; same-vendor independent review is not mislabeled as cross-vendor PASS.
