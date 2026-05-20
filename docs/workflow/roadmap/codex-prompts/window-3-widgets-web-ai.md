# Codex Window 3 — Track C: 桌面挂件 + Web + AI

直接复制下面的 `Goal:` 块到 Codex 窗口即可。

---

```text
Goal:
你是 Track C worker，负责桌面挂件、Web 控制台和 AI 体验。8-10 小时连续推进以下 feature，构建完整 UI scaffold 和交互原型。不要 ship，不要 push。

你是三个并行 Codex 窗口之一：
- Track A (另一个窗口): 桌面地基 + 数据层 — G1 ship → G2 全量 → G3 闭环
- Track B (另一个窗口): 效率工具 + 控制台 — G4 全量 + G5 全量 mock 先行
- Track C (你): 桌面挂件 + Web + AI — G6 全量 + G7 全量 + G8 全量 scaffold

Branch: codex/track-c-widgets-web-ai
从当前 HEAD 创建此 branch 后开始工作。

文件所有权（你只能修改这些）:
- packages/plugin-widgets/  (新建或已有)
- packages/plugin-calendar/  (新建或已有)
- packages/plugin-pet/  (新建或已有)
- packages/plugin-ai-cube/  (新建或已有)
- apps/web/  (新建或已有)
- docs/reviews/<你负责的 feature>/

禁止修改:
- packages/plugin-organizer/  (Track A)
- packages/core-data/  (Track A)
- packages/core/src/types/  (Track A, 你只读)
- apps/desktop/src-tauri/  (Track A)
- apps/desktop/src/windows/  (Track A)
- packages/plugin-productivity/  (Track B)
- packages/plugin-clipboard/  (Track B)
- packages/plugin-labels/  (Track B)
- packages/plugin-console/  (Track B, 你只读参考其 public API 设计)
- packages/plugin-project/  (Track B)
- docs/contracts/  (Track A 独占, 你提新 contract 写到 docs/reviews/<feature>/proposed-contract-changes.md)

数据层策略:
和 Track B 一样用 MockDataAdapter。此外：
- Widget 状态用 localStorage mock
- Web app 用 IndexedDB mock (browser-safe)
- AI 接口用 mock response (不调用真实 API)

Feature 序列（按优先级顺序执行）:

1. G6-E1 Widget host — plugin-widgets
   - 新建 packages/plugin-widgets/
   - Widget entity: { id, type, position, size, config, visible }
   - WidgetHost component (管理所有 widget 的容器)
   - WidgetFrame component (单个 widget 的可拖拽/可调整大小框架)
   - useWidgetStore hook (MockDataAdapter)
   - Widget 注册机制: 其他 plugin 通过 manifest 注册 widget type
   - 两种密度: compact / comfortable
   - 主题: 跟随系统 light/dark
   - Feature brief: docs/reviews/widget-host/feature-brief.md

2. G6-E4 Time progress widget
   - 在 plugin-widgets 内添加内置 widget
   - TimeProgressWidget: 日/周/月/年进度环
   - CountdownWidget: 倒计时到指定日期
   - 纯计算 + 纯 UI，无外部依赖

3. G6-E2 Calendar mini view — plugin-calendar
   - 新建 packages/plugin-calendar/
   - CalendarMini component (月视图, 标记有事件的日期)
   - CalendarDay component (日视图, 时间轴)
   - 数据来源: mock 事件列表 (将来从 Todo/Pomodoro/Habit/Project 聚合)
   - useCalendarStore hook
   - 可作为 Widget 注册到 WidgetHost

4. G6-E5 Pet basics — plugin-pet
   - 新建 packages/plugin-pet/
   - Pet entity: { id, name, mood, energy, lastFed, personality }
   - PetAvatar component (CSS animation 或 Lottie placeholder)
   - PetBubble component (提醒气泡, 可隐藏)
   - PetPanel component (状态/互动面板)
   - usePetStore hook
   - 状态机: idle → remind → interact → rest
   - 非侵入模式: 用户可一键隐藏
   - Feature brief: docs/reviews/pet-basics/feature-brief.md

5. G6-E6 Personalization
   - 在 plugin-widgets 内
   - ThemeTokens: 颜色/字体/圆角的 CSS custom properties
   - WallpaperAwareContrast: 读取系统壁纸色调调整 widget 对比度 (mock, 实际需要 Tauri command)
   - 用户偏好持久化 (MockDataAdapter)

6. G8-E1 Web host shell — apps/web
   - 新建 apps/web/ (如果不存在, Vite + React)
   - WebLayout component (复用 plugin-console 的导航结构设计, 但独立实现)
   - 浏览器环境适配:
     - window.* 的 Tauri API 不可用 → capability stubs
     - fs/clipboard/window commands → 降级提示或 web-safe 替代
   - WebRouter: 首页/登录/Console/Settings
   - Feature brief: docs/reviews/web-host-shell/feature-brief.md

7. G8-S1 Browser-safe capability stubs
   - 在 apps/web/ 内
   - TauriCapabilityStub: 模拟 Tauri invoke 接口, 返回降级响应
   - 让共享 plugin 代码可以在 web 和 desktop 两种环境运行
   - 文档: 哪些 capability 在 web 可用/降级/不可用

8. G7-E1 AI Cube conversation scaffold — plugin-ai-cube
   - 新建 packages/plugin-ai-cube/ (如果不存在)
   - AiCubePanel component (对话界面)
   - MessageBubble, InputBar, ActionSuggestion components
   - useAiConversation hook (mock responses, 不调用真实 API)
   - 操作菜单: "创建 Todo" / "整理桌面" / "总结剪贴板" (mock actions)

9. G7-E2 AI privacy gate design
   - 在 plugin-ai-cube 内
   - PrivacyGateDialog component (发送前展示数据类型/范围)
   - RedactionEngine stub (检测 secrets/passwords 的 mock)
   - 设计文档: docs/reviews/ai-privacy-gate/feature-brief.md

10. G7-E3 Pet AI persona
    - 在 plugin-pet 内扩展
    - PetPersonality config: { name, voiceTone, reminderStyle }
    - Pet 根据 AI 建议生成提醒气泡 (mock AI response)
    - PetAiReaction component: 对用户操作给出反馈动画
    - 与 plugin-ai-cube 的 mock event 联动

11. G7-E4 Cost & latency guard
    - 在 plugin-ai-cube 内
    - CostGuard component: 每日 API 调用上限配置
    - LatencyTimeout: 请求超时自动降级到本地 fallback
    - OfflineFallback: 无网络时的离线提示和缓存回复
    - useCostGuard hook (本地计数器, MockDataAdapter)

12. G6-E3 Habit enhanced stats
    - 在 plugin-widgets 或 plugin-calendar 内 (看哪个更合适)
    - HabitStreakChart: 连续打卡天数可视化
    - HabitWeeklySummary: 本周完成率 + 对比上周
    - HabitCalendarHeatmap: 年度热力图 (类似 GitHub contribution)
    - 数据来源: mock habit history (将来从 Track B 的 plugin-productivity 聚合)

13. G8-E2 Web data driver
    - 在 apps/web/ 内
    - IndexedDBAdapter: 实现 DataAdapter<T> 的 IndexedDB 版本 (browser-safe)
    - RemoteEncryptedBlobAdapter: mock remote API (将来接 Supabase)
    - OfflineFirstStrategy: 先写 IndexedDB, 在线时 sync 到 remote
    - 这是 Web 版的数据层基础

14. G8-E3 Web security baseline
    - 在 apps/web/ 内
    - CSP (Content Security Policy) 配置
    - 基础 rate limiting 中间件 (mock)
    - Error boundary + Sentry placeholder
    - 安全 headers 配置文档

15. G8-E4 Responsive Console
    - 在 apps/web/ 内
    - ResponsiveLayout: desktop (>1024px) / tablet (768-1024) / mobile (<768)
    - 侧边栏在 mobile 折叠为 bottom nav 或 hamburger
    - 关键页面 (Todo list, Project board, Settings) 的响应式适配
    - 用 CSS container queries 或 media queries

每个新 plugin 的初始化步骤:
1. packages/plugin-xxx/package.json (name: @repo/plugin-xxx)
2. packages/plugin-xxx/tsconfig.json
3. packages/plugin-xxx/manifest.json
4. packages/plugin-xxx/src/index.ts (唯一 public surface)
5. packages/plugin-xxx/src/types.ts
6. packages/plugin-xxx/src/hooks/
7. packages/plugin-xxx/src/components/
8. packages/plugin-xxx/docs/ (dev_log.md, design.md, api.md, test.md)
9. docs/reviews/<slug>/feature-brief.md

每个 feature 的工作流 (简化版):
1. Feature brief
2. 简短 plan (记录在 dev_log)
3. 实现 + 小 commit
4. check-types
5. 更新 dev_log

每 2 小时 checkpoint:
- 写入 docs/workflow/roadmap/xai-v1.track-c-log.md (新建)

如果需要新的 EventMap event 或 Tauri command:
- 不要修改 docs/contracts/ 或 packages/core/src/types/
- 写入 docs/reviews/<feature>/proposed-contract-changes.md
- 用 mock/stub 代替

如果需要复用 plugin-console 的设计:
- 只读参考其 public API 设计 (如果存在)
- 独立实现 web 版本，不要 import 它的源码
- 两者将来通过 shared interface 对齐

测试命令:
- pnpm --filter @repo/plugin-widgets check-types (如果存在)
- pnpm --filter @repo/plugin-calendar check-types
- pnpm --filter @repo/plugin-pet check-types
- pnpm --filter @repo/plugin-ai-cube check-types

遇到 blocker 不要停止:
- 需要 Tauri command: 用 mock stub，记录 proposed contract change
- 需要 Repository: 用 MockDataAdapter
- 需要真实 AI API: 用 mock response
- 需要 plugin-console 接口: 独立实现，记录 proposed alignment
- 测试失败: 尝试修复，修不了写 incident，继续

不要清理/revert/删除其他人或其他窗口的改动。
不要修改 Track A/B 的文件。
不要 install 新依赖（如果需要新 npm 包，写入 incident 并 mock）。
```
