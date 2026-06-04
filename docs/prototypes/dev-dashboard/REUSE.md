# Reuse this dashboard in another project

How to take this personal dev-dashboard's structure, visual system, boundaries,
and management logic to a **different** project — either build a new one, or bring
an existing one up to this standard.

## What to hand the AI

| File | Give it? | Why |
|---|---|---|
| **`TEMPLATE.md`** | ✅ **Always** | The authoritative reusable template (25 sections, parameterized — module names/paths/ports are placeholders). The AI regenerates from it; it does not copy this project's code. |
| **`BOUNDARIES.md`** | ✅ Strongly recommended | A *worked example* of the template applied to one project — shows how the Owner/Mirror/Shared-Widget model lands per-card. Tell the AI not to copy this project's module keys/paths. |
| `README.md` | Optional | Example run/entry doc to model the new one on. |
| `styles.css` | Optional (visual head-start) | The token core / dark theme / accent system is genuinely portable; but re-check the project-specific literal hex flagged in `BOUNDARIES.md §7`. |
| `DESIGN.md`, `index.html`, `js/*`, `state.generated.js` | ❌ Don't | DESIGN is this project's build journal; the code carries this project's module names + absolute paths. Let the AI **regenerate** from `TEMPLATE.md` instead. |

> TL;DR: hand over **`TEMPLATE.md` (required) + `BOUNDARIES.md` (as the example)**; let the AI generate the rest.

---

## Prompt A — build a NEW dashboard from scratch

```text
你要在 <项目X> 里搭一个「个人开发看板」——本地、单人开发者的项目驾驶舱（不是团队 BI，也不是 slide）。
我附了两份参考：TEMPLATE.md（权威模板，必须遵循其结构/视觉/布局/色彩/管理逻辑）、
BOUNDARIES.md（另一项目把模板落地后的范例，参考其 Owner/Mirror 写法，但别照搬它的模块/路径）。
先读这两份，再按 TEMPLATE.md §25「适配清单」为本项目落地。

## 本项目档案（按实际填；空缺先问我，不要编）
- 产品模块（N 个 key + 一句话定位 + 配色）：<…>
- 长期分支拓扑 + 每条分支策略（目标/允许/禁止/上下游）：<…>
- 数据来源：git；roadmap manifest 格式=<…>；release-log 格式=<…>；skill/agent 根目录=<…>；文档白名单=<…>
- 哪些状态自动生成、哪些手填：<…>
- 技术约束：纯静态、无 bundler、file:// 可直接打开；生成器用 Node stdlib 零依赖；serve 绑 127.0.0.1:<port>

## 不可违反的规则（来自 TEMPLATE，违反就退回重做）
1. Owner/Mirror/Shared-Widget：一个数据域只有一个 Owner 页渲染完整明细；别页只能放 Mirror
   （复用 Owner 的渲染器/数据，富/薄皆可）或 Shared-Widget（单函数状态徽标）。
   ——展示层多次出现 ≠ 重复；实现层 fork（两套代码/词汇）才是要消灭的。
2. 一页一文件；导航单源（JS registry，HTML 不留死锚）+ 逻辑分组。
3. 状态词汇单源：一套 7 色状态板 + 一份 FEATURE_STATUS，禁止每文件各定义。
4. 一个注册表治一域（产品模块注册表 / 测试注册表）；新页面读注册表，禁止第二张硬编码模块表。
5. 颜色语义不串：模块色只表模块、状态色只表状态、导航不用模块色；用 CSS token（含 --radius）+
   system/light/dark + accent + 防 FOUC 的 bootstrap。
6. 生成的 state 文件 git-ignore、本地 regenerate；配机器契约文档 + sync skill；
   绝不把机器绝对路径写进 tracked 文件。

## 落地顺序 + 验收
- 先写 generate-state（先有数据再做 UI）→ 壳（导航+hash 路由+主题）→ 各页（按 §7 逐页卡片结构，
  六字段：职责/展示/不展示/数据源/色彩/交互）。
- 附一个静态验证脚本（校验脚本加载顺序 / 必需 mount id / schema / git 新鲜度）；
  UI 用本地 serve + 浏览器核对：每页渲染、0 console 错误、移动端(390px)无横向溢出、暗色正确。
- 同时产出 BOUNDARIES.md（本项目实例）+ README.md（运行入口）。
- 每阶段一个 commit、跑完验证再下一步、先别 push。
```

---

## Prompt B — audit & REFACTOR an existing dashboard to this standard

Use this when a project already has a dashboard (e.g. built from an older template)
and you want a thorough review + optimization to bring it up to the current
`TEMPLATE.md` + `BOUNDARIES.md` standard.

```text
你要对 <项目Y> 里已存在的「个人开发看板」做一次彻底审查 + 优化重构。它是早期基于旧模板搭的，
现在要对齐新的权威标准。我附了新标准两份：TEMPLATE.md（25 节权威模板）、BOUNDARIES.md（边界范例）。
先读这两份当标准，再审查并改造现有看板。

## 阶段 0 — 只读摸底（先别改任何文件）
派并行 read-only 扫描，产出现状：
- 所有 Tab/页面（id、渲染模块、定位）+ 导航规则（布局/颜色/排序/拖拽/分组）
- 每页每张卡片：职责 / 展示什么 / 数据来源（哪个 state key 或硬编码）/ 交互
- 数据层：state 怎么生成、真实 vs 硬编码兜底、孤儿 key、机器绝对路径、注册表
- 视觉系统：CSS token、主题模式、模块色、状态色、断点、硬编码 hex / 重复 CSS 块
- 对照新 TEMPLATE.md 的 20/25 点，逐项标 COVERED / PARTIAL / MISSING
输出：①一份审查报告 ②该项目的 BOUNDARIES.md（逐页逐卡边界 + 数据域→Owner 映射 + 已知违规清单）。

## 审查重点（照这些找问题）
1. 重复/边界模糊：同一数据域被两个页面各自重新实现（forked renderer / 重复状态词汇 / 重复 summary）——要修。
   ⚠️ 但「总览富展示」不是重复：总览本就该多展示，只要它复用 Owner 的渲染器/数据（Mirror），别 fork。
2. 测试/部署/发布的状态是否被某页扩成了第二张明细卡（应只嵌单函数共享徽标）。
3. 导航是否双源（HTML 死锚 + JS registry）；是一页一文件还是杂物箱文件。
4. 数据层：硬编码兜底掩盖缺数据、机器绝对路径入库、孤儿 state key/渲染器、白名单硬编码漏算。
5. 视觉债：字面 hex 绕过 token、阴影/radius 不用 token、缺暗色变体、重复 CSS 块。
6. 模板缺口：新 TEMPLATE 有但该看板缺的章节（产品流程图/部署/测试/发布/操作手册/Skill 管理分组/README…）。

## 阶段 1-4 — 分阶段重构（确认报告后；开隔离分支；一阶段一/几个 scoped commit；跑完验证再下一阶段）
- P1 去重（实现层）：落 Owner/Mirror/Shared-Widget；状态词汇收敛到单一共享模块；复用渲染器而非 fork。
  **保留所有展示，只去重复实现**（尤其别精简总览的富展示）。
- P2 结构：导航单源+分组；杂物箱拆成一页一文件；Skill 管理分组（常用/系统/同步/开发）且与总览常用条同源。
- P3 可复制性：去机器绝对路径；token 收敛（radius/surface/阴影——只做可证等价或纯加暗色变体的安全改动）；
  删孤儿渲染器/key；硬编码兜底改数据驱动；白名单改 glob。
- P4 验证：静态闸门（脚本顺序/必需 mount id/schema/git 新鲜）+ 本地 serve 真机核对
  （每页渲染、0 console 错误、390px 无横向溢出、暗色正确）；把闸门同步成新结构。

## 纪律（重要）
- 不可破的约束：无 bundler globals、file:// 可开、脚本加载顺序、生成 state git-ignore。
- 视觉改动看不到浏览器就别瞎改：只做可证等价的（值 byte-equal）或纯加暗色变体；拿不准的 defer，
  并在报告里标「需 eyes-on」。宁可留债，也别引入看不见的视觉回归。
- 每个改动 scoped commit、先别 push。最后交付：现状审查报告 + 该项目 BOUNDARIES.md +
  逐阶段改了什么 + 验证结果 + 仍 defer 的清单（含各项 unblock 路径）。
```

---

_本文件随 `TEMPLATE.md` / `BOUNDARIES.md` 演进更新；由 `xai-dev-dashboard-sync` 一并核对。_
