# ADR-0003: 三个面架构 — Overlay 模式 + 控制台模式 + 网页版

| 字段 | 值 |
|------|---|
| 状态 | Accepted |
| 日期 | 2026-05-12 |
| 决策者 | InnoPeak(产品 Owner)+ Claude(架构协作) |

## 背景

产品形态从单一"桌面 overlay"扩展为三个并存的用户面:
1. **桌面 overlay 模式**(原始形态)— Main + Control + Grid + Widget 浮窗 + 桌宠,轻量随手
2. **整体控制台**(PRD v1.3 加入,§5.13)— TickTick 式 sidebar+list+detail 独立窗口,深度管理
3. **网页版**(PRD v1.4 加入,§5.15)— 控制台的浏览器版,多端生态

三者要共享同一套数据。问题:**怎么组织代码,才能避免重复实现 + 控制好原生依赖的边界?**

## 方案

### 方案 A: 三套独立代码

每个面各写一套 UI 与数据访问。

**优点**:无耦合。
**缺点**:三倍维护成本;数据同步逻辑要写三遍;Bug 修一处忘两处。**否决。**

### 方案 B: 桌面 overlay + 控制台用同一份代码,网页版独立

桌面两个面共用 Tauri 应用代码;网页版另起一份。

**优点**:桌面两个面无重复;网页版独立部署灵活。
**缺点**:网页版要重新实现 UI;两份 UI 行为可能漂移;网页版要重写 plugin-console 的所有视图。

### 方案 C: 三个面全部基于 Plugin 复用,差异只在宿主壳

桌面 overlay 模式 / 控制台模式 / 网页版本质上是**三种"宿主壳"**(Host Shell)装载同一套 Plugin 业务模块:

```
┌────────────────────────────────────────────────────────────┐
│              业务 Plugin 层(平台无关)                       │
│  plugin-productivity / plugin-labels / plugin-calendar     │
│  plugin-project / plugin-console / plugin-widgets ...      │
└────────────────────────────────────────────────────────────┘
                            ↑
                            │ 通过 core abstraction 访问能力
                            │
       ┌────────────────────┼────────────────────┐
       │                    │                    │
┌──────▼──────┐    ┌────────▼──────┐    ┌────────▼──────┐
│ 桌面 overlay │    │  控制台窗口   │    │   网页版浏览器  │
│ Tauri Main+ │    │ Tauri standard│    │  Vite SPA +    │
│ Control+Grid│    │   window      │    │  Supabase API  │
│ Window      │    │               │    │                │
└─────────────┘    └───────────────┘    └────────────────┘
       ↓                  ↓                     ↓
   core-fs(macOS)    core-data(SQLite)    core-data(REST)
   core-window(macOS)                     (无原生能力)
```

**关键约束**:
- Plugin 代码 100% 平台无关 —— 禁止直接 import Tauri API,只能调 `core-*`
- `core-data` 提供双 driver:**SQLite driver**(桌面)+ **REST driver**(网页直连后端)
- 原生能力(窗口、剪贴板、fs、通知)只在桌面壳可用,Plugin 通过 host 注入访问;网页壳传入 stub / 降级实现
- 同一份 `plugin-console` 代码:在桌面打包进 Tauri 控制台窗口,在网页打包成 SPA

**优点**:
- 业务逻辑、UI、数据模型零重复
- 网页版获得近乎免费的复用(主要工作在数据层 driver 切换 + 宿主壳)
- Bug 修一处,三处同步获益
- 强制平台无关设计,为 Win/Linux 未来扩展也降低成本

**缺点**:
- Phase 2.5 起,plugin-console 与所有业务 plugin 必须严格遵守"零原生 API 调用"约束
- 数据层抽象成本(SQLite driver + REST driver)
- 网页版需要单独的 Vite SPA 入口 + Supabase 客户端集成

## 决策

**选择方案 C**。

理由:
1. 与微内核架构(已确立)天然契合 —— Plugin 本来就该平台无关
2. 网页版工作量从"重写一份 App"降到"换数据 driver + 宿主壳"
3. 强制纪律(零原生 API 调用)对长期维护是好事

## 后果

**正面**:
- 三个面始终行为一致
- 网页版进入 v1 范围的可行性大幅提升(估算 4-6 周而非 12-16 周)
- 为 Phase 5+ Windows / Linux 扩展奠定基础
- Plugin 自动获得"可单独 mock 测试"特性(无原生依赖)

**负面**:
- Phase 2.5 启动前必须把 `core-fs` / `core-data` 双 driver 设计做对(架构债前置)
- 任何想"为了方便"在 Plugin 内直接调 Tauri 的 PR 必须被红线挡住(已写入 SYSTEM_ARCHITECTURE §4 红线 4、13)
- Web 版需要独立部署管线(Vercel/Cloudflare Pages)+ 单独的 staging 环境

## 衍生影响 — 各 Phase 的具体动作

- **Phase 0**:`core-data` 接口设计就要支持双 driver(SQLite 先实现,REST 占位 trait);所有 Plugin 通过依赖注入访问
- **Phase 2.5**:`plugin-console` 实现严格遵守平台无关约束;桌面控制台窗口作为第一个验证
- **Phase 4.5**:启用 REST driver + Vite SPA 入口 + Supabase 客户端,网页版上线
- **测试**:Plugin 单测可以无 Tauri 依赖运行,提速 CI

## 相关

- PRD §5.13(整体控制台)+ §5.15(网页版)
- SYSTEM_ARCHITECTURE.md §1(架构流派)+ §3(三层边界)+ §4 红线 4/13
- TECHNICAL_REQUIREMENTS.md §3.1.5 Web 部署 + §4 跨平台抽象
