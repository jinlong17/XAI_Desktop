# 子 PRD 审查 Prompt 集(交给 GPT 用)

> 创建日期:2026-05-14
> 用法:把对应 PRD.md + dev-plan.md(可选)作为附件,把下方 prompt 粘到 GPT 输入框。
> 推荐模型:GPT-5 / Claude Opus / 同等深度模型。审查类工作不要用快模型(Haiku/4o-mini)。

---

## Prompt 1 — Console 子 PRD 审查

**附件**:`docs/planning/sub-prds/console/PRD.md`(必须)+ `docs/planning/sub-prds/console/dev-plan.md`(可选)

```text
你是一名资深的桌面产品设计师 + macOS 应用工程师,有 10+ 年构建效率工具桌面端的经验(参考过 Notion / Linear / Things 3 / Bear / TickTick 等)。

## 背景

我在做一个 macOS 产品 "XAI_Desktop",定位是桌面增强 overlay + 整体控制台 + 网页版三个面共享数据。我让一个 AI 起草了"整体控制台(Console)"子 PRD(三栏 sidebar+list+detail 独立 macOS 窗口)。

附件就是这份 Console 子 PRD。它是主 PRD §5.13 的展开,聚焦控制台特有的 UX / 集成。控制台本身不带新功能,它聚合已有业务 plugin(Todo / 番茄 / 习惯 / 项目管理 / 桌面日历 / 全局 Label / 全局搜索 / 设置)。

技术栈:Tauri 2 + React 19 + TypeScript;微内核 plugin 架构;`packages/plugin-console/` 提供三栏外壳,各业务 plugin 通过 `ConsoleView` slot 注入。

## 你的任务

请以**严苛**的标准审查这份 PRD,**找出真实的问题**(不要客套话,不要泛泛"建议")。重点看下面 10 个维度,逐条给出具体发现:

1. **信息架构合理性** — sidebar 模块划分是否清晰、深度是否合理、有没有歧义入口?
2. **FR 原子性与可测性** — 每条 FR 是否单一职责?是否带验收标准?有没有空话型 FR("支持 X")?
3. **键盘模型完整性** — 所有交互是否真的全键盘可达?有没有遗漏的导航路径?
4. **与 overlay 模式的边界** — Console 和桌面 overlay 模式的职责分界清楚吗?有没有重复定义或漏洞?
5. **各业务模块在 Console 中的承载** — Todo / 番茄 / 习惯 / 项目 / 日历 / Label / 搜索 / 设置每一个在 Console 内的视图、交互、数据流是否都覆盖到位?
6. **macOS HIG 符合度** — 标题栏 / 菜单栏 / 上下文菜单 / 触控板手势 / Touch Bar / VoiceOver / 暗色模式 等是否符合 macOS 原生约定?
7. **性能预算的可达性** — 列出的性能指标(冷启动 / 模块切换 / list 滚动)在 Tauri WebView 上的可行性,有没有暗坑?
8. **Empty states / Error states 覆盖度** — 每个模块的"无数据 / 加载中 / 网络断 / 同步失败 / 数据冲突"状态是否覆盖?
9. **多窗口 + 多显示器场景** — Console 与 overlay 同开、跨显示器拖动、外接屏断开等场景是否考虑?
10. **优先级标注合理性** — P0/P1/P2 分级是否合理?有没有把"锦上添花"标为 P0、或"刚需"标为 P1 的?

## 输出格式

```
## Console 子 PRD 审查报告

### 总评
一段话:整体质量、最大亮点、最严重的 N 个问题。

### 问题清单(按严重度排序)

#### 🔴 Critical(必须修,否则进开发会出大坑)
- [位置:§X.Y / FR-CON-N / 第 NNN 行] 问题描述 + 影响 + 修正建议

#### 🟡 Major(强烈建议修)
...

#### 🟢 Minor(可考虑)
...

#### 💡 增补建议(原文档没写但应该有的)
...

### 跨章节一致性检查
- 矛盾点 / 重复定义 / 命名不统一

### 与父 PRD (主 PRD §5.13) 的对齐检查
- 漏继承的 FR?新增 FR 是否与主 PRD 冲突?

### 验收清单评估
- §9 验收清单是否真的能验?有没有不可测的项?
```

**硬性要求**:
- 引用具体行号或 FR-CON-N 编号,不要泛泛而谈
- 至少找出 15 个有意义的问题(找不到说明你没认真看)
- 不要说"整体很好"这种客套话,直接进入问题
- 中文输出
```

---

## Prompt 2 — Web 子 PRD 审查

**附件**:`docs/planning/sub-prds/web/PRD.md`(必须)+ `docs/planning/sub-prds/web/dev-plan.md`(可选)

```text
你是一名资深的 Web 应用架构师 + SRE,有 10+ 年构建 SaaS Web 端 + 浏览器扩展 + PWA 的经验(参考过 Notion Web / Linear Web / Figma / Cal.com 等)。

## 背景

我在做一个 macOS 产品 "XAI_Desktop" 的网页版。网页版本质是把桌面"整体控制台"(三栏 sidebar+list+detail)搬到浏览器,**React 组件树高度复用**桌面控制台,但替换以下东西:

- 数据层:本地 SQLite → REST API(连 Supabase 后端)
- 认证:macOS Keychain → 浏览器端 cookie + session
- 加上浏览器特有:响应式 / 离线 / Service Worker / PWA / Web Vitals / CSP / 跨域 / 部署

附件就是这份 Web 子 PRD。它假设读者已经读过 Console 子 PRD(那份覆盖 UI 层),Web 子 PRD **只写浏览器特有的部分**。

技术栈:Vite SPA + React 19 + Supabase(Auth + Postgres + Realtime + Storage)+ Vercel/Cloudflare Pages 部署。

## 你的任务

请以**严苛**的标准审查这份 PRD,找出真实问题。重点看下面 10 个维度:

1. **认证流程的安全性与完整性** — 注册 / 邮箱密码 / OAuth(Apple/Google)/ refresh token / 多设备登录 / 登出 / 密码重置 / 跨标签 session 同步 全套是否扎实?有没有常见的 OAuth pitfall(回调 URL、state、PKCE、token storage)?
2. **离线策略的可行性** — Service Worker + IndexedDB + 离线编辑队列 + 冲突批处理 是否完整?有没有暗坑(SW 更新策略 / SW 与同步层的交互 / 浏览器存储被清的兜底)?
3. **数据访问层(REST driver)设计** — 端点设计 / 缓存 / 重试 / 错误展示 是否充分?Realtime WebSocket 断线重连策略是否健壮?
4. **浏览器兼容性矩阵** — Chrome / Safari / Firefox / Edge 各自的 quirk 是否考虑?Safari 的 IndexedDB / SW 历史 bug 是否提及?移动浏览器降级合理吗?
5. **性能(Web Vitals)目标值与实现路径** — LCP / FID / CLS / FCP 目标值是否合理?Vite 的 chunk 策略、code splitting、字体加载、图片懒加载等是否提及?
6. **安全实现** — CSP 策略具体内容、HSTS、SameSite cookie、XSS 防御、点击劫持、E2E 加密在浏览器端的主密码 challenge 处理(主密码不能落地、KEK 仅驻内存)是否扎实?
7. **路由与深链接** — URL 结构 / 浏览器前进后退 / 锚点 / sharable links / 404 fallback / SEO friendly path 是否合理?
8. **部署管线 + 回滚** — Vercel/Cloudflare 配置、staging vs prod、监控、回滚机制、域名 / DNS / CDN / 缓存失效 / Service Worker 版本号管理 是否充分?
9. **与桌面 App 的双向状态同步** — 同账号在 Web 改 → 桌面 5 秒内可见;反之亦然。Realtime 订阅范围 / channel 设计 / 冲突边界 是否有详细说明?
10. **GDPR / 隐私合规** — 数据导出、账号删除、Cookie banner、隐私协议链接、儿童数据 等合规项是否覆盖?

## 输出格式

```
## Web 子 PRD 审查报告

### 总评
一段话。

### 问题清单(按严重度排序)

#### 🔴 Critical
- [位置] 问题 + 影响 + 修正建议

#### 🟡 Major
...

#### 🟢 Minor
...

#### 💡 增补建议
特别看:浏览器扩展 Quick Capture(PRD 说 P1)是否真的留好了接口位?PWA 安装提示策略?

### 浏览器矩阵兼容性深度检查
逐浏览器列出 PRD 里可能踩雷的点。

### 与 Console 子 PRD 的复用契约
PRD 是否清楚标了"复用 / 替换 / 新增"?有没有 Console 改了 Web 就坏的耦合?

### 与 Sync 子 PRD 的依赖契约
Web 用到的所有同步事件 / API endpoint 是否与 Sync 子 PRD 对齐?

### 与父 PRD §5.15 对齐检查
```

**硬性要求**:
- 至少 15 个有意义的问题
- 引用具体 FR-WEB-N 编号或行号
- 不要泛泛"建议加监控",要说"加 Sentry web SDK 的 sourcemap 上传具体步骤"这种程度
- 中文输出
```

---

## Prompt 3 — Sync 子 PRD 审查(技术深度最高,最重要)

**附件**:`docs/planning/sub-prds/sync/PRD.md`(必须)+ `docs/planning/sub-prds/sync/dev-plan.md`(必须;sync 是 R-10 高风险项,dev-plan 也要审)

```text
你是一名资深的密码工程师 + 分布式系统架构师,有 10+ 年实现端到端加密产品的经验(参考过 Signal / 1Password / Bitwarden / Standard Notes / Cryptee 的加密设计与 conflict-free replicated data type 实践)。

## 背景

我在做一个 macOS 产品 "XAI_Desktop",决策是 **v1 就上完整账号 + E2E 加密云同步**(用户数据上服务端必须是加密 blob,服务端零知识)。

同步层是整个产品的最高技术风险项(R-10:加密同步实现错误导致数据丢失,与窗口层悖论 R-00 并列)。一旦上线后协议改不动,所以审查必须严苛。

技术栈:
- 后端:Supabase(Postgres + Auth + Realtime + Storage)
- 加密:Argon2id 派生 KEK,AES-256-GCM 加密 DEK 与所有数据 blob
- 同步:基于 updated_at 增量 + tombstone;Realtime 推送变更;离线队列
- 三个客户端共享同一份后端:macOS 桌面 App(SQLite local cache)+ macOS sandbox 版(同上)+ 浏览器 Web(IndexedDB local cache)

附件就是这份 Sync 子 PRD + dev-plan。

## 你的任务

以**最严苛**的标准审查。这是一份会被实施的协议,任何不严谨的地方都可能让用户数据丢失或被攻破。请按下面 12 个维度逐条审,重点看密码学正确性。

1. **威胁模型完整性** — §2 列了 9 个攻击者,有没有漏的常见威胁(supply chain attack / 旁路 / replay attack / downgrade attack / 物理访问已解锁设备)?给出的"不防护"是否合理标注?
2. **密钥层级与派生** — Argon2id 参数(t=3, m=64MB, p=4)是否符合 OWASP 当前推荐?KEK / DEK 分离设计是否正确?DEK rotation 策略缺不缺?多设备共享 DEK 的协议是否安全?
3. **加密原语正确使用** — AES-256-GCM 的 nonce 管理(必须不重用)、auth tag 验证、associated data 使用、IV/nonce 生成熵源 是否都正确?有没有 padding oracle 等已知漏洞的代码 pattern?
4. **首次注册 / 新设备登录 / 主密码重置 / 助记词恢复 — 四套流程** — 每套是否完整?助记词强度(BIP39?多少 word?)?助记词何时生成、如何提示用户存放、何时校验?
5. **零知识承诺是否真的成立** — 服务端确实读不到任何用户内容吗?有没有"为了开发方便"把某字段留明文的设计?搜索 / 全文索引在服务端如何处理(应该客户端做)?
6. **冲突解决算法** — Last-Write-Wins + tombstone 的边界 case:server clock vs client clock skew、tombstone vs update 的优先级、两端同时编辑同一字段、级联删除(label_assignments 跟随 entity 删除)的一致性、撤销操作的可达性?
7. **Realtime 订阅安全性** — Supabase Realtime channel 的订阅范围、RLS 配置是否真的能挡住跨用户数据泄漏?有没有 channel hijack 风险?
8. **离线模式 + 重连** — 离线队列回放顺序、长时间离线后的全量同步降级、网络抖动下的指数退避、本地状态与服务端 diverge 后的 reconciliation 算法 是否健壮?
9. **多设备协调** — 同账号 3 台设备同时编辑同一条 todo,最终状态收敛吗?有没有死锁 / 活锁可能?
10. **服务端 Schema + RLS** — §6 Postgres schema(encrypted_blobs / accounts / sync_devices / sync_audit_log)+ RLS policy 是否够严?RLS 一旦配错就是漏洞,有没有 fuzz 测试 RLS 的计划?
11. **凭据治理 + 轮换** — Supabase service role key / JWT secret / OAuth secret 的存储 / 轮换 / 撤销 流程是否清楚?有没有"开发期硬编码 key"的风险?
12. **dev-plan 的验收 + 恢复演练** — fuzz 24h、3 次恢复演练、RLS audit、凭据轮换 SOP 是否真的能在 Phase 5 完成?恢复演练的剧本(rehearsal script)够具体吗?

## 输出格式

```
## Sync 子 PRD 审查报告

### 总评
一段话:加密层是否站得住脚?最大风险是什么?如果直接上线,最可能在哪里出事?

### 安全性问题(按 CVSS 估算严重度)

#### 🔴 Critical(可能导致数据泄漏 / 数据丢失 / 账号被盗)
- [位置:§X.Y / FR-SY-N / 第 NNN 行] 问题 + CVSS 估算 + 攻击场景 + 修正建议

#### 🟠 High(降低安全性但有缓解)
...

#### 🟡 Medium(实施缺陷可能引入问题)
...

#### 🟢 Low(可优化)
...

### 协议正确性问题(分布式系统视角)
- 一致性 / 冲突 / 收敛性问题

### 实施风险 + dev-plan 评估
- fuzz / 恢复演练计划是否够?

### 与父 PRD §5.9 + TECHNICAL_REQUIREMENTS §2 对齐检查
- 哪些细节冲突 / 哪些未覆盖

### 推荐补充阅读 / 参考
- 类似产品的公开协议文档 / 论文 / 漏洞复盘
```

**硬性要求**:
- 至少 20 个有意义的问题(同步层是最复杂的,找不到 20 个说明没认真审)
- 每个 Critical 问题必须给出具体攻击场景(攻击者怎么利用)
- 引用密码学最佳实践来源(NIST / OWASP / RFC)
- 中文输出
```

---

## 使用建议

1. **审查顺序**:Sync(最高风险)→ Console(最大模块)→ Web(依赖前两者)
2. **GPT 模型**:必须用深度推理模型(GPT-5 / Claude Opus / o1-class)。审查类任务不要用快模型,会漏问题。
3. **附件大小**:每份 PRD ~40-60KB,GPT 应能直接读取。dev-plan 17-20KB,可一起附上。
4. **审查产出**:拿到 GPT 输出后,把 Critical + Major 列回来,我帮你 patch PRD。
5. **多轮审查**:第一轮拿 Critical,修完后第二轮重审(主要看修正是否引入新问题)。
