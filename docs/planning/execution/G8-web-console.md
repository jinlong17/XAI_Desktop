# G8 执行包:Phase 4.5 Web Console

| 字段 | 值 |
|---|---|
| Gate | G8 |
| 周期 | 8-10 周 |
| 前置 | G5 Console contract 稳定,G9 Sync hardening 至少完成接口冻结 |
| 输出 | Web Console 作为多端临时入口 |

## 1. 目标

把 Console 复用到 Web,成为用户离开 Mac 时的临时管理入口。Web 不复制桌面 overlay,只承载 Console、任务、项目、剪贴板可选视图、账号和设备管理。

## 2. 非目标

- 不做 Web 桌面 overlay。
- 不做未加密的云端明文数据。
- 不做团队协作。
- 不在 Sync 未稳定前开放正式 GA。

## 3. Epic / Story / Task

| ID | 类型 | 内容 | 验收 |
|---|---|---|---|
| G8-E1 | Epic | Web host shell | 复用 plugin-console,替换 host capabilities |
| G8-S1 | Story | Browser-safe capability stubs | window/fs/clipboard 降级清楚 |
| G8-E2 | Epic | Web data driver | IndexedDB local cache + remote encrypted blob |
| G8-S2 | Story | Account login | OAuth/passkey baseline 跟随 plugin-account |
| G8-S3 | Story | Device management | 查看设备、撤销设备入口 |
| G8-E3 | Epic | Web security baseline | CSP、Sentry、rate limit、RLS |
| G8-S4 | Story | Export/import | 用户可导出加密数据 |
| G8-E4 | Epic | Responsive Console | desktop/tablet/mobile 基础可用 |

## 4. 文件范围

- `apps/web/*`
- `packages/plugin-console`
- `packages/plugin-productivity`
- `packages/plugin-project`
- `packages/plugin-account`
- `packages/core-data`
- `apps/web/supabase/*`

## 5. 验收标准

- Web 可登录并打开 Console。
- Web 不调用 Tauri-only API。
- 用户能查看/撤销设备。
- CSP 不允许任意 inline/script 扩散。
- 核心数据不以明文落远端。
- 移动端至少可完成查看/勾选 Todo 和查看 Project。

## 6. 测试

```bash
pnpm --filter web test
pnpm --filter web build
pnpm --filter @repo/plugin-console test
pnpm --filter @repo/plugin-account test
pnpm check
```

## 7. 手工验证

- Chrome/Safari 登录。
- 弱网下刷新 Console。
- 撤销当前外的另一台设备。
- 移动 viewport 查看任务和项目。
