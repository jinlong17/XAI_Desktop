# G10 执行包:Phase 6 GA 发布

| 字段 | 值 |
|---|---|
| Gate | G10 |
| 周期 | 2-3 周 |
| 前置 | G9 Beta 通过 |
| 输出 | DMG + MAS 双轨 release candidate |

## 1. 目标

把产品从 beta 推到可公开发布状态。重点是稳定性、隐私合规、上架材料、回滚策略和用户支持,不是新增功能。

## 2. 非目标

- 不新增大功能。
- 不重构架构。
- 不临时扩展商业化复杂度。

## 3. Epic / Story / Task

| ID | 类型 | 内容 | 验收 |
|---|---|---|---|
| G10-E1 | Epic | Release engineering | versioning,notarization,auto-update,crash symbols |
| G10-S1 | Story | DMG release candidate | 可下载、可安装、可启动、公证通过 |
| G10-S2 | Story | MAS candidate | sandbox entitlement 审核包准备 |
| G10-E2 | Epic | Legal/privacy | privacy policy,terms,data deletion,export |
| G10-E3 | Epic | Marketing site | landing page,feature screenshots,download/docs |
| G10-E4 | Epic | App assets | icon,App Store screenshots,copy,category |
| G10-E5 | Epic | Support ops | issue template,crash triage,SLA,known issues |
| G10-E6 | Epic | GA acceptance suite | smoke,e2e,long-run,upgrade,migration |

## 4. 文件范围

- `apps/desktop/src-tauri/tauri.conf.json`
- `apps/desktop/src-tauri/capabilities/*`
- `apps/web/*` landing/support/legal pages
- `docs/release/*` 如需新增
- `docs/planning/2026-05-12-PRD-v1.md` release status

## 5. 验收标准

- DMG install/uninstall/upgrade 通过。
- MAS build 不依赖 DMG-only private capability。
- Crash-free smoke run 达到发布门槛。
- 隐私协议、服务条款、数据删除、导出路径全部可访问。
- Landing page 不使用空泛 hero,直接展示真实产品。
- Release notes 明确已知限制。

## 6. 测试

```bash
pnpm check
pnpm --filter desktop build
pnpm --filter web build
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
```

## 7. 手工验证

- 新用户安装启动。
- 老版本升级迁移。
- 断网启动。
- 撤销设备后重启。
- 删除账号后 Web/Desktop 状态。
