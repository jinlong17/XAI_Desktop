# SOP_BUGFIX.md
# Bug 修复标准流程 (XAI_Desktop)

## 1. 目标

规范 Bug 从发现、复现、定位、修复到回归验证的全过程。
原则：**可复现、可定位、可回归**。

本 SOP 与 `docs/workflow/SUBAGENT_WORKFLOW_V2.md` 互补：V2 描述 `bug-diagnose → bug-fix →
bug-verify → ship` 的 subagent pipeline，本 SOP 描述每阶段的项目侧约束。

---

## 2. 适用范围

适用于：

- Plugin 内功能性缺陷
- `@repo/core/events` typed event 契约偏差
- Tauri command 跨进程契约错误
- 跨窗口状态同步问题（main / control / grid）
- React 前端交互异常 / Rust 后端逻辑错误
- macOS 平台行为差异（window level、focus、screen capture 权限）
- 持久化 / localStorage 边界条件失效
- 回归缺陷

说明：

- 默认修复落到 owning plugin (`packages/plugin-<name>/`)
- Host 层 (`apps/desktop/src/`) 仅修壳级问题（routing、Provider、window 注册）
- Core 层 (`packages/core/`) 修复优先评估能否在 plugin 内局部隔离
- Rust 后端落 `apps/desktop/src-tauri/`，修 macOS 行为前必须在真机复现

---

## 3. 流程总览

### Phase 0：问题登记

由 `bug-diagnose` agent 启动，输入 bug 报告（现象 + 预期 + 实际 + 线索）。

记录：

- Bug 标题
- 影响 plugin / host 区域
- 出现场景（哪个窗口、哪些用户操作）
- 影响范围（单窗口 / 跨窗口 / 数据持久化）
- 严重程度
- 当前状态

记录位置：

- 主 plugin 的 `packages/plugin-<name>/docs/dev_log.md` Status Panel + Work Log
- 若跨 plugin，所有相关 plugin 的 `dev_log.md` 均登记

---

### Phase 1：最小复现

修复前必须能稳定复现。

明确：

- 触发步骤（具体到点击哪个 grid / 拖到哪 / 多少秒后）
- 输入条件（文件类型、数量、桌面项数量）
- 环境条件（macOS 版本、单 / 多显示器、暗黑模式、Mission Control 状态）
- 实际结果
- 预期结果

若无法稳定复现：

- 先补 telemetry / 日志
- 收集用户复现录屏 / system.log
- **不得直接提交"最终修复"** —— 只能补 instrumentation

---

### Phase 2：影响范围分析

判断：

- 哪一面（host / core / plugin / Rust 后端）
- 是否跨 plugin（典型：`plugin-organizer` ↔ grid window 同步）
- 是否影响其他 plugin（共用 typed event 漂移）
- 是否回归（grep `git log -- <path>` 看最近改动）
- 是否涉及 PLUGIN_MAP 中处于 `Stable` / `Production` 状态的依赖

跨 plugin / Core 涉及时，优先评估是否能在 owning plugin 内局部隔离。

---

### Phase 3：根因分析

修复前必须给出根因分类（写入 `dev_log.md`）：

- 输入校验缺失
- 状态流转错误（React state / Context / localStorage debounce 时序）
- typed event 契约不一致（payload schema 漂移）
- Tauri command 入参出参不一致
- 多窗口并发 / 时序问题（emit 早于 listen）
- 错误处理缺失（Tauri `Result<T,String>` 没处理 Err 分支）
- macOS API 边界（私有 API 弃用、权限弹窗未授予）
- Mock 与真实环境偏差
- 回归引入（git blame）

`bug-diagnose` 输出 `FIX_READY` Status 时，根因 + 修复策略必须已沉淀。

---

### Phase 4：修复策略

修复策略必须说明：

- 修哪里（具体到文件 + 行号）
- 为什么修这里（根因 → 修复点的因果链）
- 是否优先 plugin 内修复，避免污染 core / host
- 是否触发 `manifest.json` 更新（改了 `entry` / `dependencies` / `enabled` 时必须）
- 是否影响现有设计（若是，同步 `design.md`）
- 是否需要同步 `api.md`（typed event / Tauri command 签名变更）
- 是否需要补回归测试（必须）
- 是否要在真机 macOS 上手工验证（多窗口 / native API 改动必须）

---

### Phase 5：小步修复

由 `bug-fix` agent 实现。约束：

- 一次 commit 只解决一个主要问题
- 不混入修复 + 重构 + 样式调整 + 顺手优化
- 尽量先补失败测试，再修代码
- commit 末尾必须带 `Co-authored-by: bug-fix <workflow-v2@local>` trailer

---

### Phase 5.5：`dev_log.md` 增量更新

`dev_log.md` 双层结构（同 SOP_NEW_FEATURE Phase 4.5）：

- 顶部 Status Panel 覆盖更新（`Workflow: bug-fix` / `Status: FIX_READY_FOR_VERIFY` /
  `Suggested Next: bug-verify`）
- 底部 Work Log 追加一轮，必含字段：
  - `Goal`（本轮修复目标）
  - `Done`（已完成）
  - `Commits`（hash 或 commit message）
  - `Tests`（原始复现验证 + 回归结果）
  - `Risks`（剩余风险）
  - `Handoff`（下一步入口）

粒度：以"修复轮次"记录，不强制一对一对应 commit。

---

### Phase 6：回归验证

由 `bug-verify` agent 执行（默认跨厂商 verify gate 强约束 —— 写者 ≠ 验证者）。必须完成：

- 原始复现场景验证通过
- 同 plugin 关键路径回归
- 跨窗口边界场景（若涉及多窗口）
- 真机 macOS 验证（若涉及 native API / window level / focus / DnD / file drop）
- 若改了 `manifest.json` 的行为字段：验证 PluginRegistry 可正常加载
- 若改了 typed event 签名：所有 listener 的 payload 反序列化通过
- Rust 测试 `cargo test`（如涉及 Tauri command）
- 必要时 E2E 验证

没有回归验证，不算修复完成。Status Panel 翻 `READY_TO_SHIP` 或 `BLOCKED`。

---

### Phase 7：文档与状态同步

由 `ship` agent 收尾时一并确认。若 Bug 导致以下变化，必须同步：

| 变化类型 | 同步文件 |
|---|---|
| 设计逻辑变化 | `design.md` |
| 接口契约变化（exports / events / commands） | `api.md` |
| 新增回归测试 | `test.md` |
| 修复记录、根因、风险 | `dev_log.md` Work Log |
| `manifest.json` 行为字段变化 | `manifest.json` |
| Plugin 状态翻转 | `PLUGIN_MAP.md` |
| 跨 plugin 契约变化 | 所有相关 plugin 的 `api.md` |

---

## 4. Bug Fix 核心原则

- 没复现 → 不修最终方案
- 没根因 → 不提交最终修复
- 没回归测试 → 不算完成
- 没真机验证（涉及 macOS native API 时） → 不算完成
- 没文档同步 → 不算收尾

---

## 5. 禁止事项

- 仅靠猜测提交修复
- 把多个无关问题混在一次提交
- 未分析影响范围就改 `packages/core/`
- 在 core / host 打补丁规避 plugin 层 bug
- 为临时绕过问题污染 typed events 或 Tauri command 契约
- 修完后不补回归测试
- macOS native API 改动未真机验证就提交
- commit 不带 `Co-authored-by: bug-fix <workflow-v2@local>` trailer

---

## 6. 完成定义（Definition of Done）

- [ ] 可复现路径明确（写在 `dev_log.md`）
- [ ] 根因已记录并分类
- [ ] 修复方案已落地
- [ ] 原始复现场景通过验证
- [ ] 回归测试已补充并通过
- [ ] 真机 macOS 验证通过（若涉及多窗口 / native API）
- [ ] `dev_log.md` Status Panel 为 `SHIPPED`（或 ship 前 `READY_TO_SHIP`）
- [ ] `dev_log.md` Work Log 已追加并关联本轮 commits
- [ ] 若涉及 PluginRegistry / typed events / Tauri commands：`manifest.json` 与 `api.md` 已同步
- [ ] 必要时 `design.md` / `test.md` / `PLUGIN_MAP.md` 已更新
- [ ] 所有相关 commits 带正确 `Co-authored-by: bug-fix <workflow-v2@local>` trailer
- [ ] `bug-verify` 跨厂商验证通过（写者 ≠ 验证者）
