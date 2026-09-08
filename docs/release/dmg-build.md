# DMG Release Candidate Build

> 核验日期：2026-09-08。当前 dev 343cc5f 已有构建入口；签名、公证与更新安装闭环没有本次生产验收证据。
> 先看 [主文档](../DEPLOYMENT.md)、[版本策略](versioning.md)与[GA 验收](ga-acceptance.md)。

## 分支与产物

正式构建在批准的 App 候选 / release 分支独立 worktree 执行，遵守 D3/W4。
不要直接从 Web 分支复制旧桌面配置，也不要把 web 合到 dev 来准备安装包。

当前 dev 的主窗口是非透明的单一 Web SPA 容器，frontendDist 指向 apps/web/dist。
多窗口/overlay 等插件平台能力须按 G1/插件范围另外验收。

dev 的 desktop build 和 build:dmg 脚本包含 --debug，适合开发自测。
正式 RC 示例入口如下，执行前核对候选分支 package.json、Tauri 配置与安全环境：

~~~bash
pnpm --filter desktop tauri build --features crypto --bundles dmg
~~~

当前 beforeBuildCommand 仍固定 mock-authenticated。发布真实账号产品前先完成配置与功能变更；
在外部 shell 设置 live 变量不能覆盖脚本内部再次设置的 mock 值。

## 签名与分发步骤

1. 固定源码、锁文件、工具链和 Web 配置；检查原生 CSP、capabilities、entitlements 与日志。
2. CI 临时 Keychain 导入 Apple Developer ID 签名身份；凭据来自 secret store。
3. 生成并校验签名 .app / .dmg，提交公证、等待通过并 staple。
4. 归档安装包、SHA256、符号文件、公证回执、构建日志和对应 release notes。
5. 在干净 macOS 上下载安装、启动、离线、升级和卸载重装。
6. 符合更新门后发布 updater manifest，最后开放下载入口。

Apple 签名/公证与 Tauri updater 签名是两类独立凭据。
TAURI_SIGNING_PRIVATE_KEY 及可选密码只注入受信构建进程；公钥进入客户端配置。
启用 createUpdaterArtifacts、签名和验签后才会得到适用的更新制品。
依据：[Apple 公证](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution)、
[Tauri updater](https://v2.tauri.app/plugin/updater/)。

默认 release 输出在 apps/desktop/src-tauri/target/release/bundle/ 下；
如候选分支指定 Cargo target/target-dir，以实际构建日志为准。
Debug 产物不应登记成正式 release。

## 人工 smoke 与回退

- 主窗口 Web 内容、native chrome、桥接、Keychain 和系统权限正常。
- 真实账号、删除及本次开放的同步功能通过；mock 结果单独标记。
- 上一正式版本升级后数据可读，断网与磁盘不足不会破坏数据。
- 更新签名错误被拒绝，下载/安装失败有可理解反馈。
- 记录旧包、数据兼容和停止更新的操作；不假定客户端允许任意降级。
- Mac App Store 使用独立商店分发/审核门，不能把 DMG updater 路径套用到商店渠道。
