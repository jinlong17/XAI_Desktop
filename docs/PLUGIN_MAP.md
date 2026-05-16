# PLUGIN_MAP.md — 全局状态机

> AI 开发 / 调用任何 Plugin 前,必须先查阅此表。
> 只有状态为 **Stable** 或 **Production** 的 Plugin 才能被作为稳定依赖。
> 状态为 In-Dev / Testing 的 Plugin 必须使用 Mock 数据解耦。
>
> 最后更新: 2026-05-14 · 对齐 PRD v1.6-draft

---

## Core Packages

| Package | 目录 | 状态 | 说明 | 归属 Phase |
|---------|------|------|------|---------|
| @repo/core | packages/core/ | In-Dev | 现有基础包,Phase 0 起拆分为下方 4 个核心包 | 0 |
| @repo/core-data | packages/core-data/ | Planned | SQLite repo + REST driver(Web 用)+ migration | 0 |
| @repo/core-events | packages/core-events/ | Planned | 类型安全跨窗口事件总线 + 命名约定 | 0 |
| @repo/core-shortcuts | packages/core-shortcuts/ | Planned | 全局快捷键注册中心 | 0 |
| @repo/core-fs | packages/core-fs/ | Planned | 文件访问 abstraction(full / sandbox 双 driver) | 0 |
| @repo/ui | packages/ui/ | In-Dev | 共享 UI 组件库(3 stub 组件) | 全程 |

## Plugins(对齐 PRD v1.6 — 16 模块)

| Plugin | 目录 | 状态 | PRD 章节 | 归属 Phase | 对外依赖 | 备注 |
|--------|------|------|---------|---------|---------|---------|
| organizer | packages/plugin-organizer/ | **In-Dev**(渲染层 OK,原生交互层待 Phase 0 重建) | §5.1 | 0+1 | core-* | 渲染层 OK,但点击穿透/文件拖入/多窗口干扰全坏 |
| productivity | packages/plugin-productivity/ | Planned | §5.2 + §5.3 + §5.4 | 2 + 3 | core-* | todo + 番茄 + 习惯打卡(三合一包) |
| clipboard | packages/plugin-clipboard/ | Planned | §5.5 | 2 | core-* | 全套 P0:历史/搜索/OCR/隐私 |
| widgets | packages/plugin-widgets/ | Planned | §5.6 + §5.7 + §5.16 | 3 + 4 | core-* | 时钟/天气/便签/时间进度条/冥想/桌宠(基础 P3,AI 能力 P4) |
| labels | packages/plugin-labels/ | Planned | §5.11 | 2(先于 productivity) | core-* | 全局多态 Label,Todo/习惯/便签/剪贴板/Grid/看板共用 |
| calendar | packages/plugin-calendar/ | Planned | §5.12 | 3 | core-* + productivity + widgets | 聚合 Todo+习惯+番茄 的纯视图(无独立数据表) |
| console | packages/plugin-console/ | Planned | §5.13 | 2.5 | core-* + 所有业务 plugin | TickTick 式三栏外壳(sidebar+list+detail) |
| project | packages/plugin-project/ | Planned | §5.14 | 2.5 | core-* + labels | Trello 式看板(board/list/card/checklist) |
| account | packages/plugin-account/ | Planned | §5.9 | 0(骨架) + 5(完善) | core-* | Supabase Auth + E2E 同步 |
| ai | packages/plugin-ai/ | Planned | §5.8 + §5.16(AI 能力) | 4 | core-* + widgets(桌宠) | AI Cube 对话 + 自然语言建任务 + 剪贴板智能分类 + 桌宠 AI 能力 |

## Apps / Targets

| Target | 目录 | 状态 | PRD 章节 | 归属 Phase | 说明 |
|---|---|---|---|---|---|
| desktop | apps/desktop/ | In-Dev | 全部 | 全程 | Tauri 宿主,双 target(DMG full + MAS sandbox) |
| web | apps/web/ | Planned | §5.15 | 4.5 | 浏览器版控制台,复用 plugin-console + plugin-* + core-data(REST driver) |
| docs | apps/docs/ | Scaffold | — | — | 保留,不动 |

---

## 真实代码状态(2026-05-12 实测确认)

> 初版曾把多个模块标为"✅ 可用",混淆了"代码结构存在"和"功能真的跑通"。实测后修正如下。

**organizer 现状:**
- ✅ 渲染层 OK:Grid 窗口能出现且显示 SmartContainer 内容
- ⚠️ 残留:`SmartContainer.tsx:313` 还挂着 `border-red-500` 调试样式
- 🔴 点击穿透:**完全失效**(`useGlobalMouse.ts:101-105` 有 `// TEMPORARY` 硬编码关闭)
- 🔴 文件拖入:**完全没反应**(HTML5 拖放在透明窗口不可靠 + 拿不到真实路径)
- 🔴 多 Grid 窗口:互相干扰(跨窗口事件未按 gridId scope)
- 🔴 多 Space / 全屏:行为异常
- ⚠️ Grid 窗口位置 / 大小:不持久化
- ⚠️ Control 窗 / AI Cube:不稳定

→ 这就是为什么 organizer 状态从原"Stable"修正为 **In-Dev**,且 Phase 0 定为"地基重建"。详见 PRD §10.4。

---

## 已知阻塞项

- 🔴 **R-00(最高级)**:macOS 透明 overlay 可能没有干净解 —— 点击穿透/文件拖入/多 Space/多窗口全部实测失败。Phase 0 子阶段 0.1 的技术 spike 为 **go/no-go gate**;不通过则产品形态必须降级(纯多窗口 / Widget Extension / 模式切换折中)。
- ⚠️ Tauri 2.9 + transparent + macOSPrivateApi 的兼容性需在 spike 中确认改 `false` 后基础透明是否够用。
- ⚠️ MAS 沙箱版的剪贴板 source app bundle id 元数据受限,需 fallback 路径。

---

## 状态定义

| 状态 | 含义 | 外部可调用? |
|------|------|-----------|
| **Planned** | 已规划,尚未动工 | 禁止 |
| **Migrating** | 从旧结构迁移中 | 仅兼容层 |
| **In-Dev** | 开发中,接口可能变动 | 用 Mock |
| **Testing** | 功能完成,正在测试 | 用 Mock |
| **Stable** | 已验证,接口稳定(以"真机实测通过"为准,不以"代码写完"为准) | 可依赖 |
| **Production** | 生产环境运行中 | 可依赖 |
| **Deprecated** | 已废弃 | 绝对禁止 |
| **Scaffold** | 仅占位,无内容 | 不依赖 |
