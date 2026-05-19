# G9 执行包:Phase 4.8/5 Sync Hardening + Beta

| 字段 | 值 |
|---|---|
| Gate | G9 |
| 周期 | 6-7 周,另有 2-3 周可前置协议硬化 |
| 前置 | G2 baseline,G8 Web 入口可用 |
| 输出 | Sync v1 安全门控通过 + 公测 |

## 1. 目标

把账号和同步从可跑 baseline 升级为可以承受真实用户数据的安全系统。以 Sync v0.6 子 PRD 为准,协议硬化是发布阻塞项,不是 polish。

## 2. 非目标

- 不做团队共享。
- 不做跨账号合并。
- 不做所有未来 entity 的复杂冲突 UI。
- 不绕过安全门控追求 beta 速度。

## 3. Epic / Story / Task

| ID | 类型 | 内容 | 验收 |
|---|---|---|---|
| G9-E1 | Epic | Protocol integrity | deterministic CBOR/AAD,test vectors,property tests |
| G9-S1 | Story | TLA+ / model checking | 核心 nonce/rekey 状态机有模型或等价证明文档 |
| G9-E2 | Epic | Nonce lease defense | server lease,dedup,progress tracking |
| G9-E3 | Epic | Device pairing | X25519/Ed25519,anti-abuse,recovery proof |
| G9-E4 | Epic | Rekey two-phase | device revoke 后 rekey 可恢复 |
| G9-E5 | Epic | Recovery rehearsals | server wipe/local wipe/rekey kill-9/device revoke |
| G9-E6 | Epic | Audit and observability | audit log integrity,Sentry/privacy-safe telemetry |
| G9-E7 | Epic | Beta operations | quota/rate limit/support/export/delete account |

## 4. 文件范围

- `packages/plugin-account/src/*`
- `packages/plugin-account/tests/*`
- `apps/web/supabase/migrations/*`
- `apps/web/supabase/functions/*`
- `apps/web/supabase/tests/*`
- `packages/core-data/src/*`
- security review docs under `docs/reviews/*`

## 5. 验收标准

- Sync PRD §10/§11 全部通过或明确 signed-off exception。
- Recovery rehearsals 4 个场景都有证据。
- Device revoke 后旧设备不能继续写入有效数据。
- RLS fuzz/property tests 通过。
- 用户可导出数据、删除账号、撤销设备。
- Beta 用户数据有回滚和支持 SOP。

## 6. 测试

```bash
pnpm --filter @repo/plugin-account test
pnpm --filter web test
pnpm --filter @repo/core-data test
pnpm check
```

根据 Supabase 本地环境补跑:

```bash
supabase test db
supabase functions serve
```

## 7. Beta 准入

- 至少 20 个内部测试账户。
- 7 天同步长跑无数据丢失。
- 所有 destructive operation 有确认和审计。
- 隐私协议和数据删除路径可用。
