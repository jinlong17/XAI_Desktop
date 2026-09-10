# 真实 autosave 调用方接续

当前增量：Smart Lists a2c0fe0恢复逻辑已获Astra75aa0e8有界接受，375 Stay触控缺口已修。Collaborate产品2a536c1经Terra逐批修复纯pending导出反馈、真实host渲染循环、旧scope回调、375恢复区超首屏及同值后继草稿误清。父固定独立contracts31/host8、原生七模式、完整CSS五宽度及375弹窗通过；Smart host10/entry3/wrapper5/export8/App5和Settings292通过，两项types通过。Settings lint仍因未变化的Smart Lists scope依赖警告失败，不宣称全部门禁通过。完整feature最终复核及合同剩余边界仍待完成，父作为非作者执行独立验证，Terra实现，Luna只读核对；运行时新Astra Agent初始化仍受thread limit限制。强制失效/崩溃未提交恢复、SET-06及其他REL-05/09/D2范围开放。正式完成13/312，未关闭299项。

父任务于 2026-09-09 只读核对 `packages/**/*.tsx`（排除 `__tests__`）中的直接 `usePrefAutosave(...)` 调用；这是后续排程输入，不是当前异步合同已完成的证据。

| 产品能力 | 现有调用 | 已登记归属 | 后续处理 |
| --- | --- | --- | --- |
| Dashboard 顶部便签 | `packages/xai-web-dashboard-grid/src/DashHeader.tsx`：`dashboard_header_note` | account | 已接入并接受：d129950 / Astra4a66e86。原草稿、外部冲突、重试、导出与物理基线检查保留。 |
| Dashboard 便签位置 | 同文件：`dashboard_header_note_x` | device | 已接入并接受：830dd2b / Astra a6b50c3。设备位置与账号内容仍独立。 |
| Pomodoro 外观/预设偏好 | `packages/plugin-web-pomodoro/src/PomodoroModule.tsx`：preset/custom_minutes/display_style/theme/sound/muted 六项 | device | 保留与真正 account-owned active/session 计时记录的边界，不把这些 UI 偏好当作后台计时持久链。 |

原始搜索共八处（历史基线；当前剩七处）：一处账号内容、七处设备设置。归属来自 `accountOwnership.ts` 的逐键声明，并非从前缀推断。另有31个非测试 TSX 文件直接使用旧 `usePref(...)`，数量不是完整调用方覆盖率；普通 set/remove、scoped raw、其他扩展名/包装函数及业务直写仍须按 D2 清单逐项迁移。

共享hooks会话、重置、不确定提交、动态绑定与实际Collaborate已由a25423c接受，Dashboard账号内容已由4a66e86接受。下一批七个device直接调用由Astra另定合同；尚未宣称这些device位置/偏好或其他普通writer全部转换，也未解冻发布/跨模块门禁。

设备接续合同已固定于9f1b20a：[Dv1位置→Dv2六项偏好](../web-d2-device-autosave-contract/contract.md)。修复前独立证据：Dv1父9693b3e三失败，Dv2父47e625b两失败（其中mount逐键覆盖六项）。Terra先实施Dv1，接受后再接Dv2；这些基线不是整个D2覆盖率。

下一批由Astra结合[直接绑定库存](../web-d2-pref-binding-inventory/review.md)与既有D2全writer合同确定；不自动关闭typed setter、scoped/raw、timers、secrets或旧客户端激活门禁。
