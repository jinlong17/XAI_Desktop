# GA Acceptance Checklist

> 2026-09-08：这是待执行的验收清单，不是 GA 通过回执。
> 总入口：[Production Launch & Operations](../DEPLOYMENT.md)。
> Mac 当前代码以 dev 343cc5f 为核验基线，Web 与 dev 不应为执行本页而直接合并。

## 1. 固定发布范围

先登记版本、source SHA、环境、分发渠道和本次承诺的能力：
Demo、真实账号、收费、云同步、Mac 原生功能分别验收。
mock 登录、生成 deletion plan 或本地 premium_stub 只能证明演示路径，不能替代真实账号/删除/支付验收。

从独立候选 worktree 运行检查，并按所处产品分支读取实际 scripts。
Web 的构建与测试入口是 @repo/web；仓库没有通用 pnpm check 命令。

~~~bash
pnpm check-types
pnpm --filter @repo/web build
pnpm --filter @repo/web test
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features crypto
pnpm --filter @repo/core-data test
pnpm --filter @repo/plugin-account test
~~~

以上是入口清单，须补受影响包测试、供应链、E2E、真实后端与签名产物验收。
在当前 dev 分支，desktop 的 build/build:dmg 是 debug 构建；正式候选按
[DMG runbook](dmg-build.md)构建，不能把 Web 分支的同名 script 行为当成 dev 行为。

## 2. 用户旅程

- 干净安装后主窗口承载 Web SPA；native chrome、桥接与权限符合当前 App 边界。
- 旧本地数据升级、导入/导出、失败重试与磁盘不足行为有实际数据验证。
- 真实邮箱注册/登录/重置、OAuth 回调、session 刷新、跨账号本地隔离与设备吊销通过。
- 账号删除有服务端完成回执；业务行/对象/设备/订阅按策略清理，残余 token 不再获得权限。
- 若发布云同步：至少两台设备验证 push/pull、冲突、离线积压、撤销重密钥与恢复。
- 若发布收费：购买、续费失败、取消到期、退款、恢复购买、重复/乱序 webhook 与权限对账通过。
- 离线启动、Service Worker 旧缓存、在线升级和故障回退均可恢复到可用状态。

## 3. Mac 升级与持续运行

1. 安装上一已验收构建，创建代表性本地数据并导出恢复副本。
2. 安装当前 RC，记录 schema 迁移结果、数据数量和功能完整性。
3. 测试 updater 检查、下载、验签、安装、重启与断网重试；只完成 check 不算自动更新。
4. 在复制的数据目录上验证旧版兼容或明确阻止不安全降级。
5. 执行 8 小时空闲、1 小时关键交互测试；检查崩溃和持续内存增长。
6. 干净 macOS 上验证签名、公证、Gatekeeper、Keychain 及系统权限。

## 4. 必须附带的发布证据

- Web 部署 ID/URL、制品摘要、真实 smoke；Mac 公证安装包与签名验证；移动端真机/商店渠道回执。
- Sentry 符号化事件、隐私脱敏与告警实际送达。
- 数据和对象备份成功，以及恢复演练的实测 RPO/RTO。
- 回滚目标、兼容窗口、支持入口与具体维护人。
- 隐私、条款、账号删除、价格和退款说明与实际能力一致。

D3/W4、签名、公证、真实账号/支付/同步和恢复证据未完成时，
保留相应 Beta/Demo 标签；不能把这些生产必需项列为“GA 后再做”。
