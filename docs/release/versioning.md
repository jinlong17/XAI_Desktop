# XAI Versioning and Update Strategy

> 核验：2026-09-08。完整发布闭环见 [Production Launch & Operations](../DEPLOYMENT.md)。
> 以下是版本与更新合同；不表示自动更新服务已经上线。

## 版本清单

每次 release 绑定 source SHA、构建配置、制品 SHA256、API/schema 兼容范围与发布回执。
Web deployment ID、Mac SemVer、移动端商店 build number 分别记录；
它们共享账号/API 契约，不要求同一时刻发布或使用同一个版本号。

Mac dev 343cc5f 的 tauri.conf.json 当前为 1.0.0-rc.1。
正式发布同时检查 Cargo/package/bundle 中实际使用的版本字段，不能只修改 release notes。

| 渠道 | 版本示例 | 分发 |
|---|---|---|
| RC | 1.0.0-rc.N | 内部签名候选；明确测试范围 |
| GA | 1.0.0 | 公证 DMG 或独立审核的商店版本 |
| Patch | 1.0.X | 经过兼容和更新验收后的修复 |
| Web | source SHA + deployment ID | Pages Preview / Production 分开 |

## Mac updater 当前边界

dev 配置的 updater endpoint 是 example.invalid 占位，pubkey 为 DEFERRED_TAURI_UPDATER_PUBLIC_KEY。
commands/updater.rs 有真实 check 适配，但发现更新时仍标记 InstallUnavailable；
有检查入口不等于下载、安装、重启和回退已经完成。

正式更新需要受信签名密钥、客户端公钥、可访问制品与 manifest、渠道策略，
以及 N-1 → N 的实际升级验收。上传顺序为不可变制品 → 校验 → manifest；
不能让用户先拿到指向未上传文件的 manifest。签名密钥须有安全恢复副本。
[Tauri updater 官方说明](https://v2.tauri.app/plugin/updater/)。

## 多端与数据兼容

- Web 缓存/SW 可能继续运行旧代码；原生用户也可能长期不升级。服务端兼容窗口必须覆盖两者。
- 先扩展 schema/API，再发布新客户端，观察后才清理旧协议；破坏性迁移独立 gate。
- 正式云端最低支持版本和强制升级策略需明确、可恢复，不能用更新失败锁死本地数据。
- Mac 更新事故先停止新 manifest/分批投放，再发布修复；降级前验证本地数据兼容。
- iOS/Android 商店发布可暂停新投放，但已经安装的版本不能即时远程回退；准备向前修复。
- Mac App Store、App Store、Google Play 使用各自的商店更新流程。

## 错误与发布关联

当前 Mac crashReporting DSN 仍是占位；生产事件送达、符号上传和脱敏需要真实验证。
Web 的 build:secure 与 sourcemaps:deploy:mark 已有脚本，但现有 deploy workflow 未接入完整链。
每个渠道独立设置 environment/release，记录 deployed 与 verified，不把上传 sourcemap 当成部署。
