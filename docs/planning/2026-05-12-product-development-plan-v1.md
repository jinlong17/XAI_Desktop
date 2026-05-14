# XAI_Desktop · 产品功能开发方案 v1

> 创建时间：2026-05-12
> 文档性质：**开发方案 (Development Plan)** — 用于和产品 Owner 对齐范围、优先级、技术路线；通过后再产出正式 PRD。
> 项目代号：XAI_Desktop / AI Smart Desktop
> 平台优先级：macOS (v1) → Windows → Linux → 移动端

---

## 0. 文档目的

把以下三件事拼成一张图：

1. **代码现状** — 你去年已经搭好的骨架到了什么程度；
2. **产品对标** — 腾讯桌面整理（Win）、滴答清单、Deck 类剪贴板，三类参照系到底要抄什么、不抄什么；
3. **下一步要做什么、按什么顺序做** — Phase 0 ~ Phase 4 路线图，每个阶段交付物、风险点、依赖。

最后给出几个**必须先和你确认的决策点**（账号系统、AI 边界、Win/移动端时机），这些会直接影响 PRD 的细节。

---

## 1. 代码现状盘点

### 1.1 已经在仓库里跑得起来的东西

| 模块 | 状态 | 关键文件 |
|---|---|---|
| 透明全屏 overlay 主窗口 | ✅ 可用 | `apps/desktop/src/App.tsx`、`src-tauri/src/lib.rs` |
| Smart Container（格子）创建/拖动/Resize/文件拖入 | ✅ 可用 | `packages/plugin-organizer/src/SmartContainer.tsx`（477 行） |
| 多窗口架构：主窗口 + Control 窗口（AI Cube）+ 每个 Grid 一个原生窗口 | ✅ 已搭起来 | `useMultiWindowGrids.ts`、`useGridWindow.ts`、`GridWindowApp.tsx` |
| 跨窗口事件通信 | ✅ 已搭起来 | Tauri `emit/listen` |
| 布局持久化 | ✅ 可用 | `useGridSystem.tsx` + localStorage，1 秒 debounce |
| AI Cube（拖动 + Mock 菜单） | ✅ UI 完成 | `AiCube.tsx` |
| 8 方向自定义 Resize | ✅ 可用 | `useCustomResize.tsx` |
| Subagent Workflow V2（plan/review/build/verify/ship） | ✅ 可用 | `.agents/templates/`、`scripts/setup_subagents_v2.sh` |

### 1.2 已有但还不真用的东西

- **文件元数据** — 拖入的文件目前只解析了 `name / type / extension`，没有走 Tauri `fs` 真实读盘（缩略图、修改时间、大小、图标都还没读）。
- **AI Cube 菜单项**（Quick Capture / Deep Focus / Edge Dock / Plugin Hub）都是占位。
- **Plugin 注册**目前是硬编码 import，还不是动态发现机制。

### 1.3 已识别的技术阻塞

`docs/development/TECHNICAL_STATUS.md` 记得清楚：**透明 overlay 想同时"接收拖放"又"点击穿透到桌面图标"是矛盾的**。当前选择的方向是 **多窗口架构**——主窗口几乎纯展示，每个 Grid 都是一个独立的原生 Tauri 窗口，空白区域天然让出给桌面。这条路要在真机上验过 macOS Spaces / Mission Control / 全屏切换的行为才能算稳。

### 1.4 完全没动的模块

时钟、天气、待办、番茄钟、习惯打卡、冥想模式、剪贴板、账号系统、云同步、AI 实质能力——**全部未开始**。

---

## 2. 对标产品功能拆解

### 2.1 腾讯桌面整理（Win）→ 桌面整理模块

我们抄它的"功能模型"，不抄它的具体形态（它的 UI 太 Windows 化、不符合你想要的苹果风）。

| 它的功能 | 我们怎么做 | v1 是否做 |
|---|---|---|
| 新建格子（自定义分区） | ✅ 已有 SmartContainer，强化即可 | P0 |
| 一键智能分类（按文件类型自动归类到格子） | 新增"自动分类规则" + 一键整理动作 | P0 |
| 一键桌面整理 / 退出桌面整理 | 全局快捷键 + 菜单栏切换 | P0 |
| 文件夹映射（格子内显示某个真实目录） | 用 Tauri fs 监听目录变化 | P0 |
| 一键上云 | 推迟到 Phase 3（先把本地体验做扎实） | P2 |
| 云文件 AI 解析 / AI 问答 | 推迟到 Phase 4 | P3 |
| 桌面壁纸/主题 | macOS 自有壁纸，不抄 | — |

**Mac 特化要做的事**（腾讯没考虑的，Mac 必须考虑）：
- 走 macOS Spaces / 多桌面 — 每个 Space 是否各自持久化布局？（建议 v1 共享一份布局，v2 再做 per-Space）
- Stage Manager 兼容（Sonoma+）
- 与 Finder Tags / Smart Folders 协作
- 暗色模式 / Accent Color 跟随系统

### 2.2 滴答清单 → 效率工具模块

不要复刻整个滴答清单——它已经做得很好，我们没必要再造一个清单 App。我们抄的是**"桌面级随手可达"** 这件事。

| 它的功能 | 我们怎么做 | v1 是否做 |
|---|---|---|
| 待办清单（列表 / 看板 / 时间线） | 桌面"便签格子"风格的轻量 Todo | P0（轻量）|
| 番茄钟（绑任务 + 笔记） | 浮动番茄钟胶囊，可吸附到 AI Cube | P0 |
| 习惯打卡 | 桌面打卡格子（每日 / 每周） | P1 |
| 日历（年/月/周/日视图） | v1 只做"今日 Agenda"小组件 | P1 |
| 共享协作 | 不做（账号系统决策定了再说） | — |
| 多平台同步 | 看账号系统决策 | — |

**核心差异**：滴答的载体是"清单 App 里的卡片"，我们的载体是"桌面上的格子"。任务、番茄、打卡——都是**格子里的一种内容类型**，复用 SmartContainer 框架。

### 2.3 剪贴板模块（参考 Deck / Maccy / Paste）

你截图里 Deck 的卖点很清晰，我把它拆成"必须做 / 锦上添花 / 暂不做"三档：

**必须做（P0）：**
- 历史记录：文本 / 图片 / 文件 / 链接全类型
- 按关键词 / 类型 / 时间筛选
- 全局快捷键唤起面板（默认 `Cmd+Shift+V`）
- 数据**只在本地**（SQLite + 加密敏感字段）
- 敏感信息过滤（密码管理器场景、银行卡、token 模式匹配后默认不入库）
- "屏幕共享时自动隐藏面板" — 检测 `CGDisplayIsCaptured` 或屏幕录制 API
- 暂停录制开关

**锦上添花（P1）：**
- 图片 OCR（macOS `Vision.framework` 直接调，免费）
- 常用模板（"我的邮箱"、"我的电话"等可置顶项）
- 粘贴队列（多条排队、逐条粘贴）
- JSON 格式化 / Base64 / URL 编解码 / 时间戳转换

**暂不做（P2+）：**
- 跨设备同步（iCloud 还是自建？等账号决策）
- 团队共享片段
- 富文本格式保留（粘贴时按需切换"保留格式 / 纯文本"）

---

## 3. 产品总功能矩阵（v1 目标）

按 **载体（Carrier）→ 内容类型（Content Type）→ 能力（Capability）** 分层。

### 3.1 载体（Host Shell — 几乎不变）

主窗口（透明 overlay）、Control 窗口（AI Cube）、Grid 窗口（每个格子独立）、菜单栏图标（Tray）、全局快捷键（v1 必备）。

### 3.2 内容类型（统一抽象 — 这是关键）

整个 App 的 P0 设计目标就是：**所有功能都可以塞进 Grid 这个统一容器**。具体内容类型：

| 类型 | 来源 | 是否 v1 | 备注 |
|---|---|---|---|
| 文件 / 文件夹 | 桌面拖入、文件夹映射 | ✅ | 已有基础，需补真实 fs 读取 |
| 应用程序 | 拖入 .app、从 /Applications 选 | ✅ | 需补 Launch Services |
| 网页链接 | 拖入 URL、手动添加 | ✅ | 显示 favicon + OG 预览 |
| 待办（Todo） | 在格子内新建 | ✅ | 单选/多选/日期 |
| 番茄钟 | 浮动 + 可绑定任意 Todo | ✅ | 全局唯一一个实例 |
| 剪贴板项 | 系统监听 | ✅ | 独立面板而非格子内嵌 |
| 时钟 / 多时区 | 内置 Widget 类型 | ✅ | 单格子可承载多个时区 |
| 天气 | 内置 Widget 类型 | ✅ | 多城市切换 |
| 习惯打卡 | 在格子内新建 | P1 | 日历热力图 |
| 便签 / Note | 在格子内新建 | P1 | 富文本 |
| 冥想 / 专注模式 | 全屏覆盖层 | P1 | 音频 + 风景 |
| AI 助手对话 | AI Cube 展开面板 | P1 | 走 Anthropic / 本地 LLM |

### 3.3 能力（横向 — 所有内容类型共享）

- **数据层**：SQLite（`tauri-plugin-sql`）— 取代当前 localStorage
- **搜索**：全局搜索（`Cmd+K`）跨所有内容类型 + 文件名 + OCR 文本
- **同步**：v1 仅本地；v2 才决定 iCloud / 自建后端 / 端到端加密
- **隐私**：敏感数据本地加密、屏幕共享隐藏、单独的"隐私模式"开关
- **快捷键**：每个内容类型可注册自己的全局快捷键
- **主题**：跟随系统（亮 / 暗 / 自动）+ 自定义强调色

---

## 4. 技术架构方案

### 4.1 整体保留你已有的设计

```
apps/desktop/                  ← Tauri 宿主，零业务逻辑
└─ src-tauri/                  ← Rust：窗口、tray、shortcut、macOS native
└─ src/                        ← React：路由、plugin 挂载

packages/
├─ plugin-organizer/           ← 已有，强化
├─ plugin-clipboard/           ← 新增（剪贴板）
├─ plugin-productivity/        ← 新增（todo + 番茄 + 习惯）
├─ plugin-widgets/             ← 新增（时钟 + 天气 + 便签 + 冥想）
├─ plugin-ai/                  ← 新增（AI Cube 真实能力）
├─ ui/                         ← 共用组件（强化：Button/Card/Input/Dialog/Toast）
├─ core-data/                  ← 新增（SQLite schema + repo 层）
├─ core-events/                ← 新增（跨窗口事件常量与类型）
└─ core-shortcuts/             ← 新增（全局快捷键注册中心）
```

**plugin-* 包的契约**（写进 `docs/conventions/PLUGIN_CONTRACT.md`）：
- 导出 `manifest.ts`：声明 id、名称、需要的权限、注册的快捷键、提供的 Grid 内容类型
- 导出 `register(host)`：挂载到宿主
- 通过 `core-events` 发送/接收事件，不直接 import 其他 plugin

这就是你原 TODO 里"傻瓜式新增 feature"的具体形式 — 新增一个目录 + 在主 App 注册一行 import，就能跑。

### 4.2 数据层升级（从 localStorage → SQLite）

**Schema 草图**（v1）：

```
grids               (id, type, position, size, settings_json, created_at, updated_at)
grid_items          (id, grid_id, type, payload_json, sort_index, created_at)
todos               (id, grid_id, title, done, due_at, pomodoro_count)
pomodoro_sessions   (id, task_id, started_at, duration, completed)
habits              (id, name, frequency, target, started_at)
habit_logs          (id, habit_id, logged_at)
clipboard_items     (id, type, content_blob, content_hash, source_app, app_bundle_id,
                     created_at, is_pinned, is_sensitive)
clipboard_ocr       (clipboard_id, text, language)
notes               (id, grid_id, content_md, created_at, updated_at)
shortcuts           (id, plugin_id, key_combo, action_payload)
settings            (key, value_json)
```

迁移策略：v1 启动时把现有 localStorage 的布局迁移进 SQLite，然后只读 SQLite。

### 4.3 多窗口策略（保留 + 微调）

- **主窗口**：当前已经偏纯展示，继续保留
- **Control 窗口**（AI Cube）：成为**所有快捷入口的总控**——新建格子 / 唤起剪贴板 / 番茄钟开关 / 全局搜索 / 设置
- **Grid 窗口**：每个独立 NSWindow，保留
- **新增 Clipboard 窗口**：默认隐藏，快捷键唤起，居中显示
- **新增 Settings 窗口**：标准 macOS 偏好设置布局

### 4.4 跨平台路线（你原 TODO 里的优先级保留）

| 平台 | 时机 | 关键变更 |
|---|---|---|
| macOS | v1（now） | 主战场 |
| Windows | v2 | Rust 端把 Cocoa 替换成 Win32/UIAutomation；剪贴板换 Windows API；窗口分层用 `SetWindowPos + HWND_BOTTOM` |
| Linux | v3 | X11 / Wayland 双适配；窗口穿透在 Wayland 还有兼容性问题 |
| iOS / Android | v4+ | 只做"剪贴板 + Todo + 天气"的伴侣 App；不可能搬整套桌面 overlay |

跨平台层抽象建议：把"窗口能力、剪贴板能力、文件系统能力、通知能力"抽象成 Rust trait，按平台实现。

---

## 5. 路线图

### Phase 0 · 启动期收尾（建议 1~2 周）

**目标**：把现有代码从"骨架可跑"打磨到"日常能用"。

- 真机验证多窗口架构（Spaces / Mission Control / 全屏切换）
- 补齐文件真实元数据读取（图标、缩略图、修改时间、大小）
- localStorage → SQLite 迁移
- 菜单栏图标 + 基础全局快捷键（`Cmd+Shift+D` 切换 overlay 显隐）
- 自启动 + 自动更新（`tauri-plugin-updater`）
- 抽出 `packages/core-data` / `core-events` / `core-shortcuts` 三个核心包

**交付**：能装到 Mac 上每天用的 v0.1。

### Phase 1 · 桌面整理强化（2~3 周）

- 自动分类规则（按扩展名/类型/正则）
- 一键整理 / 退出桌面整理
- 文件夹映射格子（实时同步真实目录）
- 应用程序格子（拖入 .app 或从 Launchpad 选）
- 网页链接格子（OG 预览 + favicon）

**交付**：v0.2，"桌面整理"功能闭环。

### Phase 2 · 效率工具 + 剪贴板（3~4 周）

- 剪贴板插件全套 P0（监听 + 历史 + 搜索 + 隐私 + 快捷键面板）
- Todo / 番茄钟 / 简易习惯打卡
- 全局搜索（`Cmd+K`）

**交付**：v0.3，"日常生产力工具"齐活。

### Phase 3 · Widgets + 个性化（2~3 周）

- 时钟 / 多时区
- 天气（多城市，用 OpenWeatherMap 或 Open-Meteo 免费 API）
- 便签 / Note
- 冥想模式（音频 + 风景，预留可下载音频包）
- 主题系统（Accent Color + 透明度调节）

**交付**：v0.4，"日常陪伴感"完整。

### Phase 4 · AI 注入（2~3 周）

- AI Cube 真实对话面板
- 自然语言新建格子 / 任务（"明天 10 点提醒我和小王开会" → 自动建 Todo）
- 剪贴板智能分类（自动识别代码 / 链接 / 邮箱 / 文件路径）
- 文件智能归类建议

**API 选择**：默认走 Anthropic（claude-haiku-4-5 兼顾速度成本），保留接口给 OpenAI / 本地 Ollama。

**交付**：v0.5，"AI 加持"显式落地。

### Phase 5+ · 账号 / 同步 / 跨平台

到这一步再决策账号体系、同步方式、Win 适配、移动端伴侣 App。

---

## 6. 风险与未知

| 风险 | 等级 | 缓解 |
|---|---|---|
| macOS 窗口分层在多 Space / 全屏下行为异常 | 🔴 高 | Phase 0 真机验证为前置条件 |
| Tauri 2 macOS 沙箱权限模型对 fs / 剪贴板 / 屏幕录制限制 | 🟡 中 | 早期就把 entitlements 申请清单列出来 |
| 剪贴板敏感信息识别误报 | 🟡 中 | 走"白名单 App 不监听 + 模式匹配 + 用户可手动剔除" |
| AI 调用成本 | 🟡 中 | Phase 4 才上，先用 Haiku；高频功能本地化（OCR 用 Vision） |
| Win 跨平台时窗口分层完全重写 | 🟡 中 | Phase 0 就把 Rust 侧的窗口抽象成 trait，不直接堆 Cocoa |

---

## 7. 在写 PRD 之前，需要你拍板的决策点

> 这几个问题不定，PRD 里很多章节没法写细。每个我都给了**推荐选择**，你确认 / 修改 / 提新方案都行。

### 决策 A · v1 是否做账号系统？

- **推荐：v1 不做**。先把本地体验做扎实，到 Phase 5 再上账号。原因：账号一上来就要面对注册流、隐私协议、后端、同步冲突，这些会把进度拖垮。
- 替代方案：v1 内置"本地账户"概念（只是个名字 + 偏好集合），未来可平滑迁移到云账号。

### 决策 B · AI 边界

- **推荐：Phase 4 才接入**。Phase 0~3 不依赖任何 LLM，确保 App 离线可用、性能可控。
- AI Cube 在 Phase 0~3 期间承担"快捷入口"角色，不假装能聊天。

### 决策 C · 剪贴板是 v1 P0 还是 P1？

- **推荐：v1 P0**。理由：你自己把它列为新增功能、Deck 类产品验证过粘性、技术上独立于桌面整理，可并行开发。
- 风险：增加 Phase 2 工作量 2~3 周。

### 决策 D · 滴答清单的复刻深度

- **推荐：只做"轻量便签级 Todo + 番茄 + 简易打卡"**，不进入复杂场景（看板、甘特、协作、附件、批量操作）。理由：用户真要复杂功能会用滴答本体，我们的价值是"桌面级随手可达"。

### 决策 E · Win/Linux 时间表

- **推荐：v1 完全聚焦 macOS**，不为跨平台做无谓抽象（除窗口能力 trait 之外）。Phase 5 再启动 Win 适配。

### 决策 F · 是否要"插件市场 / Plugin Hub"？

- **推荐：v1 只做插件机制本身，不做市场**。市场需要后端、审核、计费——属于 Phase 5+ 的事。AI Cube 上的 "Plugin Hub" 菜单先标灰。

---

## 8. 我需要你给我的输入

回答上面 6 个决策点（A~F），以及：

1. **预算**（API 调用、可选证书、Apple Developer Program $99/年——是否已有？）
2. **发布渠道**（App Store / 官网 DMG / 都做？App Store 要走沙箱，会限制部分功能）
3. **你希望 v0.1 多久能装到自己 Mac 上每天用**？（决定 Phase 0 的取舍力度）
4. **你自己每周能投入多少时间 + 是否有团队成员**？（决定我对 subagent loop / 手动 step 的推荐节奏）

---

## 9. 下一步

- **你确认本方案** → 我用 Workflow V2 的 `feature-plan` 节点起 PRD（产出 `features/<feature>/docs/design.md` 风格的正式文档）
- **要改方向** → 你在本文档上批注，我做 v2

---

## 10. 决策确认（2026-05-12 已拍板）

用户通过 AskUserQuestion 逐项确认 6 个决策点 + 2 个补充问题，最终落定：

| 决策 | 原推荐 | 最终选择 |
|---|---|---|
| A 账号系统 | 不做（本地） | **完整账号 + 云同步** |
| B AI 接入 | Phase 4 才接入 | **Phase 4 才接入**（同推荐） |
| C 剪贴板优先级 | P0 Phase 2 | **P0 Phase 2**（同推荐） |
| D Todo 复刻深度 | 轻量 | **中度复刻**（协商调整：子任务+标签+优先级+日历视图，不做看板/甘特/协作） |
| E 跨平台时间表 | macOS only v1 | **macOS only v1**（同推荐） |
| F 插件市场 | v1 仅做机制 | **v1 做机制 + GitHub 静态目录**（协商调整，免后端） |
| 发布渠道 | App Store + DMG 双轨 | **DMG + MAS 双轨并发**（2026-05-12 修正：初判 Apple 审核严格不准确，Maccy/Desktop Organizer 等同类竞品均在 MAS 上架；真正限制来自 Tauri 的 `macOSPrivateApi: true` 私有 API 路径，改为 false 即可） |
| 人力 | — | 全职独开 40+ 小时/周 |

**关键 pushback 记录**：
- 原选"v1 直接做完整市场"在独开人力下不现实（+10-14 周），协商降级为"机制+静态目录"
- 原选"深度复刻滴答"在组合后导致 v1 工期 9-12 个月，协商后落到中度复刻

**自我修正记录（2026-05-12 同日）**：
- 我最初判断"Mac App Store 与剪贴板监听/桌面 overlay 冲突太大，必须放弃 MAS"——此判断**错误**。事实上 Maccy、Desktop Organizer - File Zones、iBar、Yoink、Paste 等同类竞品均在 Mac App Store 在售。我们用到的 NSWindow API 全部是公开 AppKit API。真正会被 MAS 拒的只有 Tauri 的 `macOSPrivateApi: true` 私有路径，禁用此 flag 改用基础透明即可上架。
- 用户基于此事实重新拍板：**改为 DMG + MAS 双轨并发**，从 Phase 0 就做沙箱兼容设计。
- 双轨工期增量：约 2~2.5 周（主要在 Phase 0 文件访问 abstraction、entitlements、双 target 打包脚本）。

**v1 最终工期估算**：**5~6 个月全职独开**（详见 PRD §10）

详细 PRD 见 `docs/planning/2026-05-12-PRD-v1.md`

— END —
