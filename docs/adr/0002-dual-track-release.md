# ADR-0002: 双轨发布 — 官网 DMG(完整版)+ Mac App Store(沙箱版)

| 字段 | 值 |
|------|---|
| 状态 | Accepted |
| 日期 | 2026-05-12 |
| 决策者 | InnoPeak(产品 Owner)+ Claude(架构协作) |

## 背景

v1 发布渠道初版决策为"官网 DMG only,放弃 Mac App Store",理由是判断"Apple 审核会拒绝桌面 overlay 类应用 + 剪贴板监听 + 屏幕共享检测"。

经核查事实上,Mac App Store 上已有大量同类直接竞品在售:
- **Maccy**(剪贴板管理器,开源,MAS 在售)
- **Desktop Organizer - File Zones**(桌面格子整理,直接竞品)
- **iBar**(菜单栏图标管理,中国开发者)
- **Yoink、Paste、Bartender 早期版本**等

我们用到的核心 macOS API(`NSWindow.setLevel`、`setCollectionBehavior`、`setIgnoresMouseEvents`、`NSPasteboard`、`CGDisplayIsCaptured`)**全部是公开 AppKit API**,在沙箱里可用(部分配 entitlement),不是 MAS 拒绝理由。

真正会被 MAS 拒的只有一个东西:**Tauri 配置 `macOSPrivateApi: true` 启用的私有 NSWindow 透明路径**。改为 `false` 后用基础透明(`setBackgroundColor: clearColor + opaque: false`)即可,视觉效果可接受。

## 方案

### 方案 A: 官网 DMG only,放弃 MAS

**优点**:工程量最小,功能不受任何沙箱约束,DMG 完整版功能全集。
**缺点**:失去 MAS 的流量、用户信任度、订阅管理基础设施;失去 Apple 推荐位机会。

### 方案 B: 只上 Mac App Store 沙箱版

**优点**:覆盖最广,统一渠道。
**缺点**:核心差异化卖点(桌面 overlay、完整剪贴板监听、屏幕共享自动隐藏、全盘自动扫描)受沙箱严重限制,产品独特性丧失。

### 方案 C: 双轨并发(DMG 完整版 + MAS 沙箱版)

**优点**:
- DMG 完整版保留所有产品差异化功能
- MAS 沙箱版作为引流 / 高信任度渠道,功能子集可接受
- 共享同一套代码,Cargo features 切换 target,代码维护成本可控
- 同时获得两个渠道的用户

**缺点**:
- Phase 0 增加 1~1.5 周工作量(文件访问 abstraction、entitlements、双 target 打包脚本)
- 维护两份 entitlements 配置
- 每次发版多一道 MAS 提交流程

### 方案 D: DMG 先发,MAS 后跟

**优点**:渐进、风险低。
**缺点**:错过同时上线两个渠道的协同效应;后期补做 MAS 兼容反而成本更高(代码已写死非沙箱假设)。

## 决策

**选择方案 C(双轨并发)**,从 Phase 0 就做沙箱兼容架构。

理由:
1. 双轨能同时获得 DMG 的完整功能 + MAS 的流量
2. 工程增量(+1~1.5 周)在可接受范围
3. Phase 0 一次做对架构(平台抽象 + Cargo features 分离)比后期补做便宜得多
4. 修正了初版决策中对 Apple 审核严格度的误判

## 后果

**正面**:
- v1 同时上线两个渠道,用户覆盖最广
- 代码强制走"原生能力抽象"(`core-fs` 等),为未来跨平台 Win/Linux 打基础
- 强制 `macOSPrivateApi: false`,避免依赖 Tauri 私有路径(更可持续)

**负面**:
- Phase 0 工作量增加约 1~1.5 周
- 每次发版多一道 MAS 流程(2~3 天审核等待)
- 部分高级功能在 MAS 版需要降级路径(详见下表)

**功能差异表(MAS 沙箱版相对 DMG 完整版的降级)**:

| 功能 | DMG 完整版 | MAS 沙箱版 |
|---|---|---|
| 智能桌面整理 | ✅ 完整 | ✅ 完整 |
| 剪贴板监听 + 历史 | ✅ 完整 | ✅ 完整(NSPasteboard 沙箱兼容) |
| 剪贴板 source app bundle 元数据 | ✅ | ⚠️ 部分场景受限 |
| 屏幕共享自动隐藏 | ✅ `CGDisplayIsCaptured` | ⚠️ 弱化(走 `NSWindow.sharingType`) |
| 文件夹映射(任意目录) | ✅ 全盘 | ⚠️ 需首次通过 NSOpenPanel + security-scoped bookmark |
| 桌面文件自动扫描 | ✅ 全自动 | ⚠️ 仅 ~/Desktop 白名单 + 用户授权目录 |
| 透明 overlay 视觉效果 | ✅ 完美 | ✅ 基本(macOSPrivateApi=false) |
| 其他模块(Todo / 番茄 / 习惯 / Widgets / AI / 控制台 / 项目管理 / 网页版) | ✅ 完整 | ✅ 完整 |

**架构衍生约束**(已写入 SYSTEM_ARCHITECTURE.md):
- 禁止 `macOSPrivateApi: true`(红线 14)
- 禁止 Plugin 直接调用原生 API,必须走 core abstraction(红线 13)
- Cargo features 分 `full` / `sandbox` 两个 target

## 相关

- PRD §9 发布策略与版本节奏
- TECHNICAL_REQUIREMENTS.md §3.1 构建发布管线 + §2.2 沙箱 entitlements 清单
- SYSTEM_ARCHITECTURE.md §2(版本锁定)+ §4(红线 13/14)
