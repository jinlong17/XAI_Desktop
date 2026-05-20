# G2 执行包:Phase 0.3 数据与安全底座

| 字段 | 值 |
|---|---|
| Gate | G2 |
| 周期 | 4-5 周 |
| 前置 | G1 通过,或 G1 的数据接口已冻结 |
| 状态 | Draft ready |
| 输出 | Repository v0 + SQLite/SQLCipher PoC + Keychain opaque handle + MAS/Sandbox dry run |

## 1. 目标

G2 把后续所有模块依赖的数据、安全、账号、同步最小底座建立起来。通过后,Todo/Clipboard/Console/Web/Sync 才允许进入深度开发。

核心目标:

- `@repo/core-data` Repository contract 冻结到 v0。
- Desktop 本地存储从 localStorage 迁移到 SQLite/SQLCipher 路线。
- Keychain 只暴露 opaque handle,raw DEK 不跨 JS boundary。
- Tauri command capability allowlist 最小化。
- Sync 单表骨架和账号插件可以支撑后续 Phase 5。
- DMG/MAS 双轨的安全能力差异有 dry run 证据。

## 2. 非目标

- 不做完整云同步。
- 不做所有 entity type 的最终 schema。
- 不做 Web 正式上线。
- 不做协作功能。
- 不做第三方 OAuth 全量 provider,只保留账号底座。

## 3. 文件级范围

| 范围 | 目标 |
|---|---|
| `packages/core-data/src/types.ts` | Repository v0 contract |
| `packages/core-data/src/sqlite.ts` | SQLite driver PoC |
| `packages/core-data/src/keychain.ts` | key handle abstraction |
| `packages/core-data/tests/*` | contract tests |
| `apps/desktop/src-tauri/src/commands/crypto.rs` | opaque crypto command |
| `apps/desktop/src-tauri/src/commands/keychain.rs` | Keychain bridge |
| `apps/desktop/src-tauri/capabilities/*.json` | allowlist |
| `apps/desktop/src-tauri/tauri.conf.json` | MAS/DMG target config |
| `packages/plugin-account/src/*` | account/sync baseline |
| `apps/web/supabase/migrations/*` | single-table sync baseline only |

## 4. 任务拆解

### G2.1 Repository v0 contract

Task:
- 把 `Repo<T>` 从简单 CRUD 升级为可审计 contract:transaction、listByIndex、metadata、migration version。
- 定义 entity 命名规范:`plugin.entity`.
- 写 in-memory contract tests,所有 driver 必须复用。

Acceptance:
- `core-data` 不 import 任何 plugin。
- 任意 plugin 只能通过 Repository interface 读写。
- Contract tests 可对 in-memory 和 sqlite driver 重复运行。

### G2.2 SQLite/SQLCipher PoC

Task:
- 验证 SQLite driver 在 desktop dev 环境可运行。
- 验证 SQLCipher 或等价加密方案可打开、写入、关闭、重开。
- 明确数据库路径、备份策略、损坏恢复策略。

Acceptance:
- 创建 encrypted local DB。
- 重启后可读。
- 错 key 无法读。
- 损坏 DB 有明确 recovery UX:备份、重建或导出错误。

### G2.3 localStorage migration

Task:
- 列出现有 localStorage keys。
- 写 migration adapter:read old -> write repo -> mark migrated。
- migration 可重复执行且幂等。

Acceptance:
- 老数据迁移后 UI 可读。
- 迁移中断后再次启动不会重复生成数据。
- migration failure 不删除原始 localStorage。

### G2.4 Keychain opaque handle

Task:
- Rust 侧生成/读取/包裹密钥。
- JS 侧只拿 `KeyHandle`,不能拿 raw DEK。
- Crypto command 输入输出只允许 ciphertext、aad、handle、metadata。

Acceptance:
- `rg "raw.*key|dek|secret" packages apps/desktop/src` 无明显 JS raw key 泄漏。
- 单测或集成测试覆盖 encrypt/decrypt roundtrip。
- Keychain item 命名包含 app/account/device scope。

### G2.5 Tauri capability allowlist

Task:
- 拆分 default、window、crypto、keychain、account 能力。
- 每个 command 写 owner plugin 和调用理由。
- 删除未使用 command 权限。

Acceptance:
- `capabilities/*.json` 最小化。
- 新增 command 必须先更新契约文档。
- MAS dry run 不因 capability 配置缺失而启动失败。

### G2.6 Single-table sync baseline

Task:
- 基于现有 `packages/plugin-account` 和 Supabase migrations,定义最小 sync record。
- 只验证单表 Todo 或 test entity 的 push/pull/integrity。
- Sync v0.6 的 nonce lease / audit / rekey 不在 G2 完成,但接口预留。

Acceptance:
- 本地写入 test entity -> outbox -> remote -> pull 回本地。
- 冲突策略有 deterministic placeholder。
- 不承诺生产同步,只作为 Phase 5 前置骨架。

### G2.7 DMG/MAS security dry run

Task:
- 运行 Developer ID notarization dry run 能力检查。
- 运行 MAS sandbox build dry run 或最小配置检查。
- 整理 entitlements 草案。

Acceptance:
- 输出 `docs/reviews/release-sandbox-dry-run/README.md`。
- 明确 DMG-only 能力、MAS-safe 能力、未知能力。

## 5. 验收标准

| 类别 | 标准 |
|---|---|
| Repository | contract tests green |
| Encryption | encrypted DB roundtrip,错 key 不可读 |
| Keychain | JS 不接触 raw DEK |
| Migration | localStorage -> repo 幂等 |
| Capability | command allowlist 可解释 |
| Sync | single-table push/pull baseline green |
| Release | DMG/MAS dry run 有证据 |

## 6. 测试

```bash
pnpm --filter @repo/core-data test
pnpm --filter @repo/plugin-account test
pnpm --filter web test
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
pnpm check
```

## 7. 出口标准

G2 通过后,后续模块可以默认使用 Repository、Keychain、Tauri command allowlist 和 account/sync baseline,不再各自发明数据和安全方案。
