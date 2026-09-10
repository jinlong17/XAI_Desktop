# 真实 autosave 调用方接续

当前增量：Dashboard账号便签d129950已获Astra4a66e86接受。父再次搜索当前非测试TSX，直接legacy usePrefAutosave剩7处，均为device；下表保留此前8处的归属与接续。

父任务于 2026-09-09 只读核对 `packages/**/*.tsx`（排除 `__tests__`）中的直接 `usePrefAutosave(...)` 调用；这是后续排程输入，不是当前异步合同已完成的证据。

| 产品能力 | 现有调用 | 已登记归属 | 后续处理 |
| --- | --- | --- | --- |
| Dashboard 顶部便签 | `packages/xai-web-dashboard-grid/src/DashHeader.tsx`：`dashboard_header_note` | account | 已接入并接受：d129950 / Astra4a66e86。原草稿、外部冲突、重试、导出与物理基线检查保留。 |
| Dashboard 便签位置 | 同文件：`dashboard_header_note_x` | device | 与内容区分；不能为迁移账号内容而引入账号依赖。 |
| Pomodoro 外观/预设偏好 | `packages/plugin-web-pomodoro/src/PomodoroModule.tsx`：preset/custom_minutes/display_style/theme/sound/muted 六项 | device | 保留与真正 account-owned active/session 计时记录的边界，不把这些 UI 偏好当作后台计时持久链。 |

原始搜索共八处（历史基线；当前剩七处）：一处账号内容、七处设备设置。归属来自 `accountOwnership.ts` 的逐键声明，并非从前缀推断。另有31个非测试 TSX 文件直接使用旧 `usePref(...)`，数量不是完整调用方覆盖率；普通 set/remove、scoped raw、其他扩展名/包装函数及业务直写仍须按 D2 清单逐项迁移。

共享hooks会话、重置、不确定提交、动态绑定与实际Collaborate已由a25423c接受，Dashboard账号内容已由4a66e86接受。下一批七个device直接调用由Astra另定合同；尚未宣称这些device位置/偏好或其他普通writer全部转换，也未解冻发布/跨模块门禁。

设备接续合同已固定于9f1b20a：[Dv1位置→Dv2六项偏好](../web-d2-device-autosave-contract/contract.md)。修复前独立证据：Dv1父9693b3e三失败，Dv2父47e625b两失败（其中mount逐键覆盖六项）。Terra先实施Dv1，接受后再接Dv2；这些基线不是整个D2覆盖率。
