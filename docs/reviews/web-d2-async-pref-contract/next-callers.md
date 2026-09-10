# 下一批真实 autosave 调用方

父任务于 2026-09-09 只读核对 `packages/**/*.tsx`（排除 `__tests__`）中的直接 `usePrefAutosave(...)` 调用；这是后续排程输入，不是当前异步合同已完成的证据。

| 产品能力 | 现有调用 | 已登记归属 | 后续处理 |
| --- | --- | --- | --- |
| Dashboard 顶部便签 | `packages/xai-web-dashboard-grid/src/DashHeader.tsx`：`dashboard_header_note` | account | 当前引擎/hooks 合同通过后，优先接入动态 autosave 账号写入。保留已有草稿、外部冲突、重试与物理基线检查。 |
| Dashboard 便签位置 | 同文件：`dashboard_header_note_x` | device | 与内容区分；不能为迁移账号内容而引入账号依赖。 |
| Pomodoro 外观/预设偏好 | `packages/plugin-web-pomodoro/src/PomodoroModule.tsx`：preset/custom_minutes/display_style/theme/sound/muted 六项 | device | 保留与真正 account-owned active/session 计时记录的边界，不把这些 UI 偏好当作后台计时持久链。 |

本次直接 autosave 搜索共八处：一处账号内容、七处设备设置。归属来自 `accountOwnership.ts` 的逐键声明，并非从前缀推断。另有31个非测试 TSX 文件直接使用旧 `usePref(...)`，数量不是完整调用方覆盖率；普通 set/remove、scoped raw、其他扩展名/包装函数及业务直写仍须按 D2 清单逐项迁移。

当前只做排程核对，无产品修改，未解冻任何发布/跨模块门禁。下一批迁移仍需 Astra 针对真实消费链制定边界并独立验收；当前尚未完成的会话、重置、不确定提交与动态绑定合同优先完成。
