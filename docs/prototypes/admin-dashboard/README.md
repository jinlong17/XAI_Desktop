# XAI Admin Console — 管理中台原型

高保真、零依赖、**单文件**可点原型,用于在实现前验证管理中台(运营后台)的信息架构、交互与视觉。

- **文件**：[`index.html`](./index.html)(单文件:手写 CSS 设计 token + 原生 JS + 内联 SVG,无构建、无外部依赖)
- **状态**：设计原型 / pre-plan 探索,**非已发布产品代码**。
- **默认视觉**：Gemini 风蓝白浅色(light + 主色 OKLCH hue 260)。

## 如何查看

任选其一:

```bash
# 1) 直接打开(离线可用,无需服务器)
open docs/prototypes/admin-dashboard/index.html

# 2) 静态服务器
python3 -m http.server 4178 -d docs/prototypes/admin-dashboard
# 然后访问 http://localhost:4178

# 3) Claude Code 预览:.claude/launch.json 已含 "admin-prototype" 配置
```

## 已实现模块(信息架构)

导航按 **运营 / 功能与权益 / AI / 系统** 分组:

| 模块 | 要点 |
|---|---|
| **总览看板** | 多级 Tab(概览 / 增长 / 功能效率 / AI 成本 / 营收)、**运营队列优先**(异常登录·工单·催款·超额组织·高成本用户·沉睡管理员)、KPI sparkline、活跃趋势/Provider 分布图、功能使用排行 + 使用时段热力图 |
| **用户管理** | 保存视图分段控件(全部/活跃/超额/高成本/30天未登录…)、虚线筛选 chips、每用户成本/风险、详情 **抽屉 ↔ 整页 A-B**、批量操作 |
| **组织 / 空间** | 多租户:席位 used/cap(超员红条)、overage/dunning 状态、组织详情抽屉(概览/成员/用量/账单)、转移所有权(type-to-confirm) |
| **功能管理** | 全局开关(上线/灰度/下线)、Free·Pro·Team 分级配额、功能管理抽屉(灰度滑块 + 灰度人群规则 + 依赖项 + 配额步进器) |
| **AI 用量 & 配额** | 套餐默认配额策略、Top 消耗用户(接近上限/超额预警) |
| **Provider 配置** | Provider 卡(server-side secret handle 状态/用量/成本)、**模型 × 套餐 权限矩阵**、**套餐分层路由策略**(默认模型 / 兜底 / 月度成本上限 / 请求上限 / 超额行为);浏览器不展示 provider key |
| **角色与权限** | 角色卡 + RBAC 权限矩阵(不可变 permission key + 本地权限模拟 + allow/deny 审计) |
| **订阅 / 计费** | MRR/ARPPU、套餐分布、最近交易 |
| **审计日志** | 类型 + 时间范围筛选(今天/7天/30天)、only-read 不可删改 |
| **系统设置** | 组织信息、安全(强制 2FA / 会话超时 / IP 白名单 / SSO)、通知 Webhook |

## 设计系统 · Tweaks 调校面板

右下角 🎨 面板,改动实时生效并持久化(仅用户显式更改写 localStorage,代码默认值优先):

- **OKLCH 单变量换肤**：`--accent-hue` 一个变量驱动整套配色;5 个命名主色(Gemini 蓝 / 靛紫 / 祖母绿 / 玫瑰 / 琥珀)
- **三轴**:明暗(light/dark)× 密度(comfortable/compact)× 主色
- **布局 A-B**:总览首屏(队列优先 / 指标优先)、页面宽度(全宽 / 居中)、用户详情(抽屉 / 整页)

## 治理护栏

所有高危操作(封禁 / 批量封禁 / 功能下线 / Provider 停用 / 转移所有权)统一走 `ConfirmModal`,部分要求**输入指定词解锁**(type-to-confirm)。本地 mock mutation 会写回页面状态,并向审计表追加 actor/action/target/IP/result;权限不足同样追加失败审计。

Provider/AI 配置只展示 server-side encrypted secret handle 的状态与轮换信息。原型不显示、不缓存、不模拟真实 provider key;真实落地必须由服务端 API 完成加密密钥存储与权限判定。

## 借鉴来源

运营队列、确认弹窗 + type-to-confirm、OKLCH 单变量 token、模型分层路由、RBAC 矩阵等模式,借鉴自 Claude 设计的参考控制台(位于仓库外 `web design/admin/`,非本仓库内容)。本原型在其之上保留并发展了暗色体系、灰度人群规则、功能使用热力图等,并定稿为 Gemini 蓝白浅色默认。

## 治理与后续

- 这是**设计原型**,仅存放于 `docs/prototypes/`,不参与构建 / CI,不影响 Web / Desktop 产品。
- 真实落地:建议作为独立 `apps/admin/` surface(与用户端 `apps/web/` 隔离权限与部署),技术栈 shadcn/ui + TanStack Table + Tremor。
- 系统接入计划: [`INTEGRATION_PLAN.md`](./INTEGRATION_PLAN.md) 梳理页面审查、数据/功能模块矩阵、系统边界和开发阶段。
- Roadmap manifest: [`docs/workflow/roadmap/xai-admin-dashboard-system-integration.md`](../../workflow/roadmap/xai-admin-dashboard-system-integration.md) 是正式接入的 Workflow V2 入口。
- 同步 skill: `xai-admin-control-plane-sync` 用于 Admin 线被激活后,检查 AI provider、RBAC、用量、审计、用户/组织/计费控制面是否与 Web/Desktop 变化保持一致;当前只作为治理/审查入口,不授权生产开发。
- **治理**:管理中台是 ADR-0013 D1 的 Proposed Control Plane;实际实现前需先确认 admin line 的优先级、package/deploy target,再按 Workflow V2 roadmap 执行。原型阶段(本目录)无需。
