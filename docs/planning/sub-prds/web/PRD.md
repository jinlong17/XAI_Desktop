# Web 子 PRD — XAI_Desktop 网页版

> **SUPERSEDED-IN-PART (2026-05-24).** UI module specs are SUPERSEDED by `docs/workflow/roadmap/xai-web-console.md` (24/24 SHIPPED) + ADR-0007 build-form decision + `web design/DESIGN.md` as authoritative UI source. This PRD remains authoritative for **browser-only platform concerns**: Auth/Device/Session, Sync push/pull encrypted blob driver, IndexedDB cache, Realtime, Offline outbox, CSP/Sentry, Cloudflare deploy. Do not consume §FR-* UI specs without cross-checking the xai-web-console manifest. Full rationale: `docs/reviews/web-priority-pivot-and-repo-cleanup/20260524-brief.md`.

| 字段 | 值 |
|---|---|
| 父 PRD | `docs/planning/2026-05-12-PRD-v1.md`(主 PRD §5.15) |
| 范围 | 网页版的浏览器特有规格(控制台 UI 复用 `sub-prds/console/PRD.md`) |
| 归属 Phase | Phase 4.5(4-6 周) |
| 文档作者 | Claude(subagent) |
| 创建日期 | 2026-05-14 |
| 状态 | DRAFT v0.3(2026-05-16 按第二轮 codex 复审再修 7 处 Critical + 11 处 Major) |

---

## 0. 文档定位

本文档 **只覆盖浏览器特有的内容**。控制台 UI(三栏布局 / 各模块视图 / 键盘流 / 主题 / 设置 / 全局搜索 / sidebar 导航)全部继承自 `sub-prds/console/PRD.md`,本档不重复。

> 2026-05-21 更新: `docs/adr/0006-web-face-hybrid-reuse-boundary.md` 已对 `ADR-0003` 做 Web 面收窄。Web 继续共享数据契约、Sync/Repository 语义与 Console PRD 的共享 UI truth，但不再把“直接复用现有 plugin 源码”作为硬前提。

**心智模型一句话(v0.2 修正)**:网页版 = 控制台子 PRD 的 React 组件树 + 浏览器壳 + **Sync push/pull encrypted blob driver**(不是直连业务表的 PostgREST CRUD)+ 浏览器特有的运行约束(认证 / 缓存 / 实时同步 / 离线 / 部署)。

### 0.1 基础契约(v0.3 拍板,后续 FR 全部据此展开)

| 契约 | 决策 | 来源 |
|---|---|---|
| **Auth token 存储模型** | **A — 纯 SPA + Supabase 自定义 storage**(token + token-wrap key 都落 IndexedDB);AES-GCM 包装**只防磁盘取证 / 跨用户登入,不防同源 XSS**;关浏览器再开通过 IndexedDB 自包含 unwrap 恢复;若要防 XSS 必须切 BFF/HttpOnly cookie 或 WebAuthn user-presence 解锁,v1 不做 | 用户 2026-05-16 拍板 + v0.3 codex C1 |
| **真实 session revoke 边界** | 自建 `devices` / `app_sessions` **不撤销 Supabase Auth refresh token**(浏览器端不可达);改为业务 API 层强制校验:所有 `/sync/*`、RPC 必须带 `X-Device-Id` header,服务端中间件校验 `devices.revoked_at IS NULL`;远程撤销后被撤销设备拿 Supabase token 仍能换 access token,但所有业务调用全 403 | v0.3 codex C2/C3 |
| **数据访问协议** | Web 端的 `core-data/driver-sync-blob` **不直连 PostgREST 业务表**;实现 `Repository<T>` 接口但底层网络协议是 Sync 子 PRD 定义的 `/sync/pull`、`/sync/push`、RPC,仅传 `{entity_type, entity_id, version, encrypted_blob, nonce, aad}` | v0.2 review Critical #2 |
| **Sync cursor 数据模型** | Sync 子 PRD 必须建 `sync_events(account_id, seq BIGINT, entity_type, entity_id, server_updated_at)` per-account WAL 序列;Realtime payload 带 `seq`(取代 v0.2 写的"cursor 单调"模糊表述);`/sync/pull` 用 `since_seq`;gap 检测靠 `prev_seq + 1 !== this_seq` | v0.3 codex C7 |
| **Realtime 合约** | 订阅 `sync:<account_id>` channel,**payload 只含 metadata**(`{entity_type, entity_id, seq, server_updated_at, originator_device_id}`),收到后触发增量 pull,不直接合并 record | v0.2 review + v0.3 C7 |
| **离线 E2E 队列** | DEK 在内存 → mutation 入队前必须先加密;DEK 不在内存 → 禁止加密字段离线写入,只允许未保存草稿留在 React 内存,不落 IndexedDB | v0.2 review Critical #3 |
| **本地 at-rest 加密** | IndexedDB 中所有"由用户内容派生的物件"(blob 原件 / 索引 / FTS / sort key)必须加密或锁定时 wipe;新增 `entity_blobs` 存 encrypted_blob 原件,所有明文视图从它派生;`entity_index` 持久部分仅存非敏感 metadata(entity_id / type / version / server_updated_at),敏感 sort key(due_at / completed_at / parent_id)走 DEK 派生索引 key 加密;**FTS 明文索引仅在 DEK 解锁期间内存/Worker 中存在,5min idle 或主密码 lock 时立即 wipe** | v0.3 codex C4/C5 |
| **服务端明文边界(零知识硬规则)** | 业务实体**全字段进 encrypted_blob**,服务端不看 todo.title / due_at / completed_at / label;只保留账号元数据(email、plan)、自有 devices/app_sessions/audit_logs 明文;`account_settings` 也走 encrypted_blob(快捷键、Pomodoro 配置、默认 list 都是行为画像)。若 Phase 5+ 需推送提醒等场景,另开"明文 metadata 字段白名单"章节由 Sync PRD 评审 | v0.3 codex C7 + M-B |
| **GDPR 导出方案** | 浏览器端持 DEK 拉全量 encrypted blobs → 本地解密 → 本地生成 zip → 浏览器直接下载;服务端永不接触明文,最多发短期 job token | v0.2 review Critical #4 |
| **多设备登出** | 不撤销 Supabase Auth;自建 `devices` + `app_sessions` 表 + RPC(`device_register` / `device_heartbeat` / `device_revoke` / `revoke_others`);登出走 Realtime 广播 + 业务 API X-Device-Id 校验 | v0.2 review + v0.3 C2/C3 |
| **公开分享链接** | **v1 不实现**;P1 等 Sync 子 PRD 先出 share envelope 协议(per-entity share key + URL fragment 携带解密材料 + server 存 encrypted share blob),再回到本档展开 UI | 用户 2026-05-16 拍板 + v0.2 review Critical #7 |

本档与其他子 PRD 的边界:

| 内容 | 谁负责 |
|---|---|
| 三栏布局 / sidebar 导航 / 模块视图 / 键盘流 / 主题 | `sub-prds/console/PRD.md` |
| 端到端加密协议本身 / DEK 派生 / 服务端零知识保证 / share envelope 协议 | 主 PRD §5.9 + `TECHNICAL_REQUIREMENTS.md §2` + `sub-prds/sync/PRD.md` |
| Sync push/pull 端点契约 / Realtime metadata 事件流 / 冲突解决 / mutation 幂等性 | `sub-prds/sync/PRD.md`(本档为 Web 端消费视图) |
| 浏览器端的认证 UI / 数据 driver / 离线 / 部署 / 响应式 / 兼容性 / Console host 注入桩 | 本档 |

> 控制台子 PRD 尚未提交时,本档对其行为的引用以主 PRD §5.13 + ADR-0003 为准,后续以控制台子 PRD 为最终源。Sync 子 PRD 尚未提交时,本档 §5.2/§5.3/§5.4 的端点契约和 payload 形状以本档 §0.1 + 与同步层 agent 的口头对齐为准。

---

## 1. 产品定位

### 1.1 角色

网页版是 XAI_Desktop 的"第三个面"(见 ADR-0003,并受 ADR-0006 收窄):桌面 overlay + 整体控制台 + 网页版三者共享同一套后端数据、数据契约与交互真理源;**Web 的宿主壳与浏览器视图层可独立实现**,而源码级 plugin 复用不再是硬前提。

### 1.2 为什么进 v1

1. **多端生态**:对标滴答清单的全平台覆盖,降低用户"换设备就丢功能"的焦虑;在工作机、客户机、临时设备(不便装 macOS 原生 App)时仍能用核心数据。
2. **营销主入口**:landing page (`xai-desktop.app`) 是首次接触 → 注册 → 试用 → 下载桌面 App 的主路径,Web 控制台让"未下载 App 也能体验核心功能"成为可能。
3. **用户信任**:浏览器端可见的数据 = 心智上"我的数据不在某个本地黑盒里",对独立开发者品牌建立加分。
4. **架构副产物**:ADR-0003 已要求 Plugin 平台无关 + `core-data` 双 driver,Phase 4.5 启用 Web 的边际成本相对低(4-6 周)。

### 1.3 不在 v1 范围

- 桌面 overlay 模式(透明窗 / 浮动 Grid / 桌宠 / 全屏点击穿透)— 依赖原生
- 剪贴板监听 / 屏幕共享检测 — 依赖原生
- 桌面 Widgets 浮窗 — 依赖原生(Widget **内容**会在 Web 上以"模块视图"出现,但不浮在浏览器之上)
- 冥想全屏模式 — 依赖原生快捷键 + 全屏锁
- 移动端原生 App — Phase 5+ 的伴侣 App(本期只做移动浏览器只读 + 最小编辑)

---

## 2. 目标用户与场景

| 用户群 | 使用 Web 的核心场景 |
|---|---|
| **已订阅的桌面 App 用户(主)** | 出差/通勤/客户机/借用同事电脑时,临时打开浏览器查 Todo、看习惯打卡进度、改两条任务 |
| **新用户(转化漏斗)** | landing page → 邮箱注册 → 直接在浏览器试用 → 满意后下载桌面 App |
| **不便装原生 App 的人(企业受限设备)** | 公司机器锁了非 MAS 安装权限,但允许浏览器 → 网页版承接核心任务/项目场景 |
| **多平台用户(macOS + Windows 双机)** | v1 仅 macOS,Windows 上以网页版兜底,等 Phase 5+ Win 原生 |

### 2.1 用户旅程(典型)

1. 新用户访问 `xai-desktop.app` → 看 landing page(产品介绍 + "立即试用" + "下载 macOS App")
2. 点 "立即试用" → 跳 `/auth/signup` → 邮箱/Apple/Google 三选一注册
3. 注册完成自动进入 `/app/todos`(默认模块,与主 PRD §5.13 控制台默认视图一致)
4. 试用 5 分钟,顶部 banner 持续提示"下载桌面版解锁桌面 overlay/剪贴板/Widgets"
5. 下载并装好桌面 App → 用同一账号登录 → Web 端数据立刻在桌面同步可见

---

## 3. 信息架构

### 3.1 URL 结构

> **2026-06-03 Project route clarification:** 当前 Web Console 运行时代码把项目/看板模块注册为
> `moduleId = "board"`，实际入口是 `/app/board`。下表保留 `/app/projects*`
> 作为正式 Project 命名和深链接目标，但在实现完成前不得把它当成当前可用路由。
> 详见 `docs/reviews/xai-web-project-module/20260603-audit-and-prd.md` 和
> `docs/workflow/roadmap/xai-web-project-module.md`。

| 路径 | 用途 | 鉴权 |
|---|---|---|
| `/` | 营销 landing page(可选 SSR/SSG,Phase 5 评估) | 公开 |
| `/auth/login` | 登录页 | 公开 |
| `/auth/signup` | 注册页 | 公开 |
| `/auth/forgot` | 找回密码 | 公开 |
| `/auth/callback` | OAuth 回调 | 公开 |
| `/auth/verify` | 邮箱验证落地页 | 公开 |
| `/app` | SPA 入口(重定向到默认模块) | 必须登录 |
| `/app/todos` | Todo 模块 | 必须登录 |
| `/app/todos/:listId` | 指定 list | 必须登录 |
| `/app/todos/:listId/:todoId` | 选中具体 Todo(detail 面板) | 必须登录 |
| `/app/board` | 项目/看板模块当前实际入口 | 必须登录 |
| `/app/board/*` | 当前 catch-all 模块内路径;尚未提供 boardId/cardId 语义化深链接 | 必须登录 |
| `/app/projects` | 计划中的正式 Project alias/redirect;当前未实现 | 必须登录 |
| `/app/projects/:boardId` | 计划中的看板深链接;当前未实现 | 必须登录 |
| `/app/projects/:boardId/cards/:cardId` | 计划中的卡片 detail 深链接;当前未实现 | 必须登录 |
| `/app/calendar` | 桌面日历(网页版) | 必须登录 |
| `/app/habits` | 习惯模块 | 必须登录 |
| `/app/habits/:habitId` | 习惯详情 | 必须登录 |
| `/app/pomodoro` | 番茄统计 | 必须登录 |
| `/app/labels` | Label 管理 | 必须登录 |
| `/app/search?q=...` | 全局搜索结果 | 必须登录 |
| `/app/settings/*` | 设置(账号 / 外观 / 隐私 / 同步 / 已连接设备) | 必须登录 |
| `/share/:token` | 共享链接(**v1 不实现**,P1,等 Sync 子 PRD 出 share envelope;见 §5.18.2) | — |
| `/404` / `/500` | 错误页 | 公开 |

### 3.2 域名规划

| 域名 | 用途 | TLS | 备注 |
|---|---|---|---|
| `xai-desktop.app` | 营销主站 + 文档 | Let's Encrypt(Vercel/CF 自动) | 主品牌 |
| `app.xai-desktop.app` | Web 控制台 SPA | 同上 | 与主站分子域,便于 CSP 收紧 |
| `api.xai-desktop.app` | Supabase 自定义域名(可选,Phase 5) | 同上 | v1 可直用 Supabase 默认域 |
| `status.xai-desktop.app` | 状态页(P1) | — | Phase 5+ |

> 选 `.app` TLD 的代价:`.app` 强制 HSTS preload,所有子域必须 HTTPS,无 fallback。这是优点(安全),也是约束。

---

## 4. 与控制台(Console)的复用与差异

> 本节是 Web 与 Console 子 PRD 之间的"接口表"。控制台子 PRD 是 UI/交互真理之源,本档只列差异。

| 维度 | 控制台(桌面) | 网页版(本档) |
|---|---|---|
| **三栏布局 / sidebar / 模块视图** | 控制台子 PRD 定义 | 100% 复用 |
| **键盘流(Cmd+K 搜索 / J/K 上下 / Cmd+1..9 切模块)** | 控制台子 PRD 定义 | 复用,但 `Cmd+W` / `Cmd+Q` 走浏览器原生 |
| **主题(深色/浅色/跟随系统)** | 控制台子 PRD 定义(v0.3 待协同改 device-local) | 复用 + **device-local 持久化走 IndexedDB `user_prefs`**(承接 §5.6.1,不走 localStorage)|
| **数据访问** | `core-data` SQLite driver | `core-data` **Sync blob driver**(实现 Repository 接口,底层走 Sync push/pull encrypted blob,**非** PostgREST 业务表 CRUD)(本档 §5.2) |
| **跨窗口事件总线** | Tauri event | `BroadcastChannel`(同源跨标签)+ Supabase Realtime(`sync:<account_id>` metadata-only)(本档 §5.3) |
| **认证持久化** | macOS Keychain | Supabase JS SDK **自定义 storage**(IndexedDB 加密分区 + 短 TTL access token),纯 SPA 不依赖 HttpOnly cookie(本档 §0.1 + §5.1) |
| **离线** | 永远本地优先 | IndexedDB 缓存 + Service Worker(本档 §5.4) |
| **响应式** | 仅桌面分辨率 | 桌面/平板/手机三档(本档 §5.5) |
| **路由** | 模块内路由 + 窗口生命周期 | 浏览器 History API + 深链接(本档 §5.8) |
| **快捷键冲突** | Tauri 注册 | 区分浏览器保留键(本档 §5.5.3 / 控制台子 PRD §键盘流 web 兼容列) |
| **菜单栏图标 / Dock 图标** | 有 | 无(关闭页 = 注销视为登出对话) |
| **窗口 chrome** | 标准 macOS titlebar | 浏览器 chrome,自绘 sidebar 折叠按钮(无 traffic lights) |
| **窗口拖动 / resize** | 系统提供 | 浏览器提供 |
| **错误上报** | Sentry(原生 SDK) | Sentry(`@sentry/browser`,同 DSN 区分 env)(本档 §5.13) |
| **i18n** | 系统 locale | `Accept-Language` + URL prefix(本档 §5.14) |

### 4.1 Web 端新增(控制台没有的)

- 浏览器端账号 + OAuth(PKCE flow)回调路由
- Sync blob driver(实现 Repository,封装 Sync push/pull + 本地索引/搜索)
- 实时同步(Supabase Realtime metadata-only → pull trigger)
- 离线模式 + 加密 mutation 队列(DEK-encrypted at-rest)
- 响应式断点 + 移动端只读
- PWA(P1)+ 安装提示策略(见 §5.7)
- SEO + landing page
- 域名 / CDN / 部署管线 + SW 版本契约(见 §9.4)
- 跨标签会话同步 / 多设备登出(自建 devices 表 + RPC)
- GDPR 数据导出(浏览器端打包,零知识)/ 账号删除的浏览器端 UI

### 4.2 Console Host 注入桩契约(Web 实现)

> Console 子 PRD 用 `<ConsoleHost />` 抽象桌面/Web 差异。本表是 Web 端必须实现的注入桩接口;桌面端有对应 Tauri 实现。任何 plugin 通过 `useHost()` 访问下列能力,**严禁直接 import 平台 API**。

| Host 能力 | Web 实现 | 桌面实现(参考) |
|---|---|---|
| 文件下载 | Blob URL + `<a download>` 触发;大文件用 `showSaveFilePicker`(Chromium) 或 fallback | `tauri-plugin-dialog` save + write |
| 通知 | 内嵌 toast(P0)+ Web Notification API(P1,需 permission)| macOS UserNotifications |
| 全局快捷键 | `KeyboardEvent` + 避让浏览器保留键(见 §5.5.3) | tauri-plugin-global-shortcut |
| 拖入(DnD) | HTML5 DnD,**仅文本/URL**(不读真实路径) | Tauri onDragDropEvent(有路径) |
| 窗口能力 | 浏览器原生(history、tab close、visibilitychange) | core-window(`open`/`close`/`focus`/`level`) |
| 全局搜索 adapter | 本地索引(IndexedDB FTS)+ Sync metadata 触发刷新 | SQLite FTS5 |
| 设置读写 | `useAccountSettings()` → `account-global`(同步)走 Sync blob;`device-local`(不同步)走 IndexedDB(§5.6.1 映射表) | 同上,本地走 SQLite |
| 错误边界 | React `<ErrorBoundary>` + Sentry web | React `<ErrorBoundary>` + Sentry native |
| 文件系统 | `core-fs` web stub:无真实路径,只支持 Blob 输入/输出 | core-fs(NSWorkspace、security-scoped bookmarks)|
| 剪贴板写出 | `navigator.clipboard.writeText`(需 user gesture)| NSPasteboard |
| 剪贴板监听 | **不支持**(浏览器无被动监听 API);plugin manifest 标记 `requires.clipboard-monitor = true` 在 Web build 被静态剔除 | NSPasteboard polling / NSEvent |

> Web Host 注入桩接口位 `packages/core/src/host/web/`,Console 子 PRD `host.ts` 定义 trait;本档约束 Web 实现。任何 plugin 在 Web build 中调用 host 不支持的能力(剪贴板监听、Tauri 私有 API),manifest 静态剔除应在 build 阶段失败(承接 §7.3)。

---

## 5. 功能需求

> FR-WEB-01 ~ 07 已在主 PRD §5.15 定义,本档承接 FR-WEB-08 起。每个 FR 标注优先级(P0 = v1 GA 必须;P1 = v1 GA 后第一个迭代;P2 = 评估,可推迟到 v1.1+)。

### 5.1 浏览器端 Auth

> v0.2 重写:删除"HttpOnly cookie"误导(纯 SPA 无法由 JS 设置);改为 Supabase JS SDK 自定义 storage adapter + CSP/XSS 强化的纯 SPA 模型(本档 §0.1 拍板)。OAuth 走 PKCE flow。多设备登出不依赖 `auth.sessions`,改自建 devices 表 + RPC。

#### 5.1.1 Token 存储模型(纯 SPA)

> v0.3 codex C1 修正:上一版"内存派生密钥加密 token"在语义上不自洽(关浏览器后 key 丢失 = token 不可解;若 key 也持久则与同源 XSS 无差异)。本节明确威胁模型 + 实现方案。

##### 5.1.1.a 威胁模型(显式声明)

| 威胁 | 防御? | 解释 |
|---|---|---|
| 同源 XSS 读取 token | ❌ 不防 | 任何 SPA 自管 token 方案都顶不住同源 XSS;依赖 §5.12 CSP + SRI + sanitize + supply chain 兜底;**这是承担风险,不是消除风险** |
| 跨标签 / 跨用户 OS 账号窃取 IndexedDB 文件 | ✅ 防 | OS 文件系统取证、Chrome profile 拷贝、备份还原到他人设备;token blob 加密落盘,wrap key 也在 IndexedDB 但**用 Web Crypto 非 extractable CryptoKey 包装**,JS 无法导出明文 key |
| 浏览器 dev tools / 扩展 inspector 读 IndexedDB | ⚠️ 部分防 | 看到 ciphertext 但 wrap key 是 non-extractable,直接读 IndexedDB 得不到明文 token;但 JS 可调 `crypto.subtle.unwrapKey + decrypt`,所以 dev tools 控制台执行 JS 仍可解(等价于 XSS) |
| 物理设备被盗(无 OS 密码)| ✅ 防 | Chrome / Safari 持久 IndexedDB 在用户 OS 账号下,他人拿设备打不开;若 OS 账号无密码,与 cookie / localStorage 同样裸 |

**结论**:本方案是"磁盘取证 / 跨用户隔离防护",**明确不防同源 XSS**。若需防 XSS,只能切 BFF/HttpOnly cookie 或加 WebAuthn user-presence unlock(v1 不做,Phase 5+ 评估)。

##### 5.1.1.b 实现方案

| 项 | 决策 |
|---|---|
| Access token | Supabase JS SDK 自定义 storage adapter → IndexedDB `auth_tokens` Object Store;**短 TTL 1h**;过期前 5min 静默 refresh |
| Refresh token | 同 store;refresh 失败 → 强制清并跳登录;**滚动刷新**(每次成功换新 refresh token,旧的失效)|
| Token wrap key | Web Crypto `crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['wrapKey','unwrapKey'])`,`extractable: false`;**首次注册时生成 + 直接 `IDBObjectStore.put()`** 到 `auth_keys.wrap_key`(CryptoKey 对象可直接序列化进 IndexedDB,浏览器底层管理,JS 取出仍是 non-extractable handle);loginA → loginB 切账号场景同 store 不同 record |
| Token at-rest 包装 | 每次写 token:`subtle.wrapKey(format='raw', key=tokenAsKey, wrapper=wrap_key, alg=AES-GCM, iv=randomNonce)` → 存 `{ciphertext, nonce}`;读出时反向 `unwrapKey + decrypt`,token 直接进 SDK,不经 string |
| 关浏览器再开 | wrap_key 持久在 IndexedDB,unwrap 重建恢复 session;符合 FR-WEB-14 |
| 切账号清 | 用户主动注销/账号切换 → 删 `auth_tokens` 全表 + 重新 `generateKey` 替换 wrap_key |
| XSS 防御红线 | CSP `script-src 'self'` + 无 `'unsafe-inline'` + 无 CDN(SRI 兜底)+ `dangerouslySetInnerHTML` 禁用 + react-markdown + rehype-sanitize 白名单(见 §5.12) |
| 承担代价声明(写入隐私页) | "Web 端 token 存储于本地 IndexedDB 加密分区,采取磁盘取证防护,但不能阻止运行在同源页面内的恶意脚本读取 token;请用最新浏览器,不要安装来源不明的扩展" |

#### 5.1.2 FR 表

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-08 | 邮箱+密码注册 | P0 | 表单含 email、password(≥12 位,含大小写+数字+符号,zxcvbn ≥ 3)、二次确认;提交走 `supabase.auth.signUp`;失败显示后端 `error.code` 的人类可读文案(已 i18n) |
| FR-WEB-09 | 邮箱验证 | P0 | 注册后弹"已发送验证邮件"卡;`/auth/verify?token_hash=...&type=email` 落地页调 `supabase.auth.verifyOtp({ token_hash, type: 'email' })`,成功后跳 `next` 参数(白名单)或 `/app/todos` |
| FR-WEB-10 | 邮箱+密码登录 | P0 | 失败计数 ≥ 5 次/15 分钟触发 Supabase 默认风控;成功后**调 `device_register` RPC** 注册当前 device fingerprint → 写入自定义 storage → 跳 `next`(白名单) |
| FR-WEB-11 | Sign in with Apple(PKCE) | P0 | (1) 生成 `code_verifier`(`crypto.getRandomValues` 43-128 chars)+ `state`(64 chars 随机),`sessionStorage` 暂存;(2) 调 `supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo, queryParams: { prompt: 'login' } } })` 触发跳转;(3) `/auth/callback?provider=apple&code=...&state=...` 校验 `state` 一致 → 调 `supabase.auth.exchangeCodeForSession(code)`;(4) Apple **private relay** 邮箱兜底:`@privaterelay.appleid.com` 直接接受,不强制补真实邮箱;(5) 缺邮箱(Apple 隐藏)→ 跳"请补邮箱"页可选填,跳过则用 relay 邮 |
| FR-WEB-12 | Google OAuth(PKCE) | P0 | 同 FR-WEB-11 流程,provider=google;`scope=openid email profile`;**禁用 Google One Tap**(避免 third-party cookie 依赖) |
| FR-WEB-13 | 找回密码 | P0 | `/auth/forgot` 调 `supabase.auth.resetPasswordForEmail(email, { redirectTo: '<absolute>/auth/reset' })`;邮件 link 落 `/auth/reset?token_hash=...&type=recovery`;调 `verifyOtp` → 强制设新密码(同 FR-WEB-08 强度) |
| FR-WEB-14 | 会话持久化(自定义 storage) | P0 | Supabase JS SDK 构造时传 `auth.storage` adapter(`getItem`/`setItem`/`removeItem` over IndexedDB);access token TTL 1h,refresh 滚动;关浏览器再开,SDK init 时从 storage 拉 session → 后台 refresh → 成功则保持登录;refresh 失败 → 清 storage + 跳 `/auth/login` |
| FR-WEB-15 | 跨标签会话同步 | P0 | 标签 A 登出 → `BroadcastChannel('auth')` 广播 `LOGOUT` → 其他标签 10s 内清 IndexedDB + 跳 `/auth/login`;Supabase SDK `onAuthStateChange` 监听本地变化作为兜底 |
| FR-WEB-16 | 注销(本设备) | P0 | 设置 → 注销:(a) 调 `supabase.auth.signOut({ scope: 'local' })`;(b) 调自建 `device_revoke({ device_id })` RPC;(c) 清 IndexedDB `auth_tokens` + `auth_keys.wrap_key` + `query_cache` + `entity_blobs` + `entity_index` + `pending_mutations` + `encrypted_dek`;(d) BroadcastChannel 通知其他标签;(e) 跳 `/auth/login` |
| FR-WEB-17 | 多设备列表 + 单设备撤销(业务层 revoke,**非** Supabase Auth revoke) | P0 | 设置 → "已登录设备"读取自建 `devices` 视图(`device_id`、`device_name`、`platform`、`last_seen_at`、`created_at`、`revoked_at`)。撤销走 `device_revoke({device_id})` RPC:服务端置 `devices.revoked_at = now()` + 通过 Realtime `sync:<account_id>` 广播 `device_revoked`;被撤销设备**在线时**收到事件立即 signOut + 清 IndexedDB;被撤销设备**离线时**:Supabase Auth refresh token 浏览器不可远程撤销,但下次该设备调任何 `/sync/*` 或 RPC,服务端 middleware 校验 `X-Device-Id` 对应 `devices.revoked_at IS NOT NULL` → 403 + 错误码 `device_revoked` → 客户端拦截即时登出 |
| FR-WEB-17b | 撤销除当前外全部 | P0 | 设置 → "撤销其他设备" 调 `revoke_others_rpc()`;实现同 FR-WEB-17 批量化 |
| FR-WEB-17c | 设备 heartbeat | P0 | Web 端登录后每 5min 调 `device_heartbeat({device_id})` 更新 `last_seen_at`(节流;`visibilitychange=visible` 时立即触发一次);非活跃 30 天的设备自动标记为 `stale`,但**不自动撤销**(由用户手动) |
| FR-WEB-17d | Device fingerprint | P0 | `device_id` = `crypto.randomUUID()` v7(首次注册生成),持久化到 IndexedDB `device.id`(注销不清,登出再登保持同 device_id);`device_name` = 解析 UA(`Chrome 124 on macOS`)用户可改 |
| FR-WEB-17e | **X-Device-Id 强制校验** | P0 | 所有 `/sync/*`、`/rest/v1/rpc/*`(除 `device_register`)、`/sync/pull`、`/sync/push`、客户端导出、账号删除 RPC 都必须带 `X-Device-Id` header;服务端 middleware/RLS:`device_id` 不在 `devices` 表 → 401;`devices.revoked_at IS NOT NULL` → 403 `device_revoked`;客户端收到 `device_revoked` → 立即清 IndexedDB + 强制重登 |
| FR-WEB-18 | 双因素认证(TOTP) | P1 | 与主 PRD FR-AC-05 一致;Web 端提供启用流程 + QR 展示 + 登录时第二步输入;走 Supabase `auth.mfa.enroll` / `verify` API |
| FR-WEB-19 | 桌面 App 用户首访 Web 引导 | P0 | **不依赖 localStorage hint**(可被清);判定改为登录后调 `device_list_rpc()` 看是否有 `platform: 'macos'` 的活跃设备;有 → 首次访问 Web 弹一次性引导卡(用 IndexedDB `user_prefs.web_intro_seen` 记录);卡片文案 "你已在 macOS 上使用 XAI;Web 端是只读+轻量编辑场景" |
| FR-WEB-20 | 主密码 challenge(E2E) | P0 | 登录后**单独**询问主密码用以解出 DEK(主密码 ≠ 账号密码;见 §5.12);若拒输 → 受 E2E 保护的字段显示为"已加密,输入主密码可查看";KEK 仅驻内存(`useRef` 持有非 extractable CryptoKey,组件卸载即释放) |
| FR-WEB-20b | OAuth `next` 参数白名单 | P0 | 任何 `next` / `redirectTo` 参数必须是**同源相对路径**(v1 正则 `/^\/(app|legal)\//`,**v1 不允许 `/share/`**——v1 直接 404;P1 share envelope 上线时再加回);命中 open-redirect 检测的丢弃用默认 `/app/todos`;`redirectTo` 在 Supabase Dashboard 配 allowlist(`https://app.xai-desktop.app/auth/callback`、`http://localhost:5173/auth/callback`) |
| FR-WEB-20c | OAuth state/nonce 校验 | P0 | `state` 存 sessionStorage(关标签清);callback 拿不到 state 或对不上 → 显错并不交换 code;PKCE 的 `code_verifier` 同样存 sessionStorage |

#### 5.1.3 自建 devices / app_sessions 表(后端 schema 增量)

> 主 PRD §8 未含本表,需 Sync 子 PRD 同步增加(本档 §8.1 改写"继承主 schema + Sync 增量")。Web 端只是消费方。
>
> v0.3 codex C3 修正:删除原 `sessions.refresh_token_hash`(浏览器端 refresh token 不应也无法被 RPC hash,Supabase GoTrue 也不会用本表验证撤销);改为 `app_sessions` 仅记录 **app-level lease**(app 自有的设备会话租约,与 Supabase Auth session 完全分离)。

```sql
-- devices:每个安装实例
CREATE TABLE devices (
  id UUID PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('macos','web','windows','ios','android')),
  device_name TEXT NOT NULL,           -- 用户可编辑显示名
  user_agent TEXT,                     -- Web only
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ                -- 非 null 即已撤销(业务层撤销,非 Supabase Auth 撤销)
);

-- app_sessions:每次登录在 app 自有维度的 session lease;不存 Supabase refresh token
CREATE TABLE app_sessions (
  id UUID PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  account_id UUID NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  user_agent TEXT,
  ip_first_seen INET,                  -- 仅审计;privacy 页声明保留 90 天
  ip_last_seen INET
);

CREATE INDEX ON devices (account_id, revoked_at);
CREATE INDEX ON app_sessions (device_id, revoked_at);

-- 中间件:所有 /sync/*、RPC 强制校验(伪代码)
-- IF X-Device-Id NOT IN devices.id WHERE devices.account_id = auth.uid()
--   THEN 401 'unknown_device'
-- IF devices.revoked_at IS NOT NULL
--   THEN 403 'device_revoked' + payload { revoked_at }
```

RPC 接口:`device_register({ device_id, platform, device_name, user_agent })`、`device_heartbeat({ device_id })`、`device_revoke({ device_id })`、`revoke_others_rpc()`、`device_list_rpc()`。
所有 RPC 走 Supabase RLS(`account_id = auth.uid()`)+ 上述 middleware。

> **声明边界**:`device_revoke` 不撤销 Supabase Auth refresh token(浏览器端不可达,Supabase GoTrue admin API 才有 `auth.admin.signOut(user_id, scope='others')` 能力,但那是按 user 撤销全部 session,无法只撤销一个设备);本档采用"业务层 X-Device-Id 校验"实现真正的"按设备撤销"语义。若 Phase 5+ 需要彻底撤销 Supabase token,只有切 BFF 一条路。

### 5.2 数据访问层(Sync blob driver)

> v0.2 重写:**取消直连 PostgREST 业务表**(`GET /rest/v1/todos` 等),改为调用 Sync 子 PRD 定义的 `/sync/pull`、`/sync/push`、RPC,仅在线路上传 `{entity_type, entity_id, version, encrypted_blob}`。过滤/排序/搜索/聚合**全在客户端本地索引完成**,因为服务端零知识无法看明文字段(review Critical #2)。
>
> Web 端的 `core-data` driver 实现 `Repository<T>` 接口,**桌面 SQLite driver 与之共用同一 Repository 契约**(ADR-0003),业务 plugin 零感知。

#### 5.2.1 网络协议层

| 端点 | 方向 | payload | 说明 |
|---|---|---|---|
| `POST /sync/pull` | client → server | `{ since_seq, entity_types?[], limit }` | 增量拉:`sync_events.seq > since_seq` 的 metadata + encrypted_blob;按 `entity_type` 可选过滤;`limit` 默认 200,最大 500;返回 `{ items[], next_seq, has_more }`;**服务端始终分页,不允许全量** |
| `POST /sync/push` | client → server | `{ device_id, mutations[] }`,每条 `{ mutation_id, idempotency_key, entity_type, entity_id, op, base_version, encrypted_blob, blob_nonce, blob_aad }` | 批量推 mutation;返回逐条 `{ mutation_id, status, server_version?, server_seq?, remote_encrypted_blob? }` |
| `POST /rest/v1/rpc/<fn>` | client → server | 非 E2E RPC(账号管理、设备、导出 job)| 不传 encrypted blob;走 Supabase Auth + X-Device-Id 鉴权 |
| `wss .../realtime/v1/websocket` | bi | metadata-only(见 §5.3) | 不传 blob |

**鉴权头(所有上述端点)**:
```
Authorization: Bearer <supabase_access_token>
apikey:        <supabase_anon_key>
X-Device-Id:   <device_uuid>            -- 强制;见 FR-WEB-17e
X-Sync-Version: 2026-05
```

**没有** `GET /rest/v1/todos` 之类的端点;服务端 PostgREST 仅暴露:`accounts`(email/plan/age_consent_at 等明文元数据)、`devices`、`app_sessions`(自有)、`encrypted_blobs`(下文)、`sync_events`(WAL,只读)、`audit_logs`(自有);**`account_settings` 也走 encrypted_blob,无明文表暴露**。

#### 5.2.1.b 服务端 schema 增量(由 Sync 子 PRD 归口建表)

```sql
-- encrypted_blobs:所有业务实体的"行"
CREATE TABLE encrypted_blobs (
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  version BIGINT NOT NULL,                -- per-entity 单调
  encrypted_blob BYTEA NOT NULL,
  blob_nonce BYTEA NOT NULL,
  blob_aad BYTEA NOT NULL,                -- 含 entity_id + version,防 replay
  server_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  originator_device_id UUID NOT NULL,
  deleted BOOLEAN NOT NULL DEFAULT false, -- 软删,blob 为空
  PRIMARY KEY (account_id, entity_type, entity_id)
);

-- sync_events:per-account WAL,Realtime 与 pull 都基于这张表
CREATE TABLE sync_events (
  account_id UUID NOT NULL,
  seq BIGINT NOT NULL,                    -- per-account 单调,DEFAULT nextval(per_account_seq)
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  server_updated_at TIMESTAMPTZ NOT NULL,
  originator_device_id UUID NOT NULL,
  version BIGINT NOT NULL,
  PRIMARY KEY (account_id, seq)
);

CREATE INDEX ON sync_events (account_id, seq) WHERE seq IS NOT NULL;
```

> per-account `seq` 通过 PG sequence per account 或 advisory lock + max(seq)+1 实现(Sync 子 PRD 决定);**Realtime payload 必带 `seq`**,客户端用之做 cursor gap 检测。

#### 5.2.2 FR 表

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-21 | `core-data` Sync blob driver | P0 | 与 SQLite driver 实现同一 `Repository<T>` 接口;Web build 启用 Sync driver,桌面 build 启用 SQLite;切换零业务代码改动;契约测试两 driver 跑同一 spec 必须一致 |
| FR-WEB-22 | Sync 端点契约 | P0 | driver 内部只调用 §5.2.1 三类端点;`Repository.findMany(filter)` 在本地索引上 evaluate filter,**不发到服务端**;`Repository.save(entity)` 在客户端加密 → 入 push 队列 |
| FR-WEB-22b | 本地索引(at-rest 安全)| P0 | IndexedDB **三层存储**:(a) `entity_blobs` 存 encrypted_blob 原件(at-rest 加密;v0.3 新增,见 §8.2);(b) `entity_index` 持久部分**只存非敏感 metadata**(`entity_id`、`entity_type`、`version`、`server_updated_at`、`deleted`),用于离线 list 占位与 ETag;(c) 敏感 sort key(`due_at`、`completed_at`、`parent_id`、`label_ids` 等)在 IndexedDB 中**用 DEK 派生的 index key 加密**(AES-GCM,每条独立 nonce),解密后驻内存的 in-memory index 供排序/过滤;锁定/idle 时清内存 index |
| FR-WEB-22c | 本地全文搜索(内存 only) | P0 | FTS 明文文本(`text_for_fts`)**仅在 DEK 解锁期间存在于 Web Worker 内存的 flexsearch / lunr index**;主密码 lock / 5min idle / 关页 → 内存 index 立即 wipe;持久部分只存"reverse-pointer"(`entity_id → blob`),lock 后搜索结果只能返回 `entity_id` + "已加密,输入主密码可查看"占位;解锁后用 Worker 重建 index(分批解密 entity_blobs,显进度) |
| FR-WEB-22d | 服务端分页(强制) | P0 | `/sync/pull` 总是用 `since_seq + limit`(default 200);driver **不假设全量已本地**;按模块 lazy hydrate(进 `/app/todos` 才拉 todo 相关 entity_type);大账号首次登录走"渐进 hydrate"+ 顶部进度条,优先模块可立即可用 |
| FR-WEB-23 | 请求缓存 | P0 | TanStack Query v5 的 queryFn 调 driver;`staleTime` 由 Realtime metadata 事件触发失效,**不靠固定时间**;`cacheTime` 5min;**TanStack Query cache 不持久化** plaintext data → 关页/lock 失效 |
| FR-WEB-24 | mutation 幂等性 | P0 | 每条 mutation 客户端生成 `mutation_id`(uuid v7,含时间戳)+ `idempotency_key = hash(entity_id + base_version + op_payload)`;服务端在 24h 窗口内对 idempotency_key 去重(返回首次结果);离线队列回放、网络重试都不会产生重复写 |
| FR-WEB-24b | 失败重试 + 退避 | P0 | 网络错误 / 5xx / 429 指数退避 3 次(1s/4s/16s + ±25% jitter);429 严格遵守 `Retry-After` header;4xx 不重试直接抛 |
| FR-WEB-24c | Dead letter queue | P0 | 同一 mutation 重试 3 次仍 fail → 移到 `dead_letter_mutations` Object Store + 顶部 banner "X 条更改未能同步" + 链到 detail 视图;用户可手动重试或丢弃;dead-letter 队列也算入 §5.4 离线限额 |
| FR-WEB-25 | 错误展示 | P0 | 4xx → toast + 表单字段红色;5xx → 顶部全局 banner;401 → 跳登录;403 → "权限不足";409 (conflict) → 触发 §5.4 冲突 UI;429 → toast + "X 秒后自动重试" |
| FR-WEB-26 | 乐观更新 | P1 | Todo 完成 / 卡片拖拽 等高频写,driver 先更新本地 `entity_index` + UI,push 失败回滚;失败时回滚 + toast |
| FR-WEB-27 | mutation 合并(同 tick) | P1 | 同一 tick 内 100ms 去抖,对同一 entity 的多次 `update` 合并为最后一次(前提:op 都是 update,且 base_version 相同);最终 push 用最后的 mutation_id |
| FR-WEB-28 | 大列表分页(本地 + 服务端) | P0 | 服务端 `/sync/pull` 始终 `since_seq + limit ≤ 500` 分页(承接 FR-WEB-22d);本地 `entity_index` cursor 分页,default 50 条/视口,虚拟滚动(`@tanstack/react-virtual`);未 hydrate 完的模块显示骨架屏 + 进度 |
| FR-WEB-29 | 请求取消 | P0 | 切换路由或 query key 变化时 abort 上一次 fetch(`AbortController`);`/sync/pull` 进行中可被打断,push 不可打断(已发出的 mutation 等服务端响应) |
| FR-WEB-30 | API 版本协商 | P0 | 每个请求带 `X-Sync-Version: 2026-05` header;服务端 `Sunset` header → 顶部 banner "数据格式即将升级,请刷新";`X-Sync-Version` 不匹配 → 服务端返 426 Upgrade Required,前端强制刷新 |

#### 5.2.3 mutation 信封示例

```http
POST /sync/push HTTP/1.1
Authorization: Bearer <supabase_access_token>
apikey: <supabase_anon_key>
X-Device-Id: 01970b8c-...               # 强制;服务端校验 devices.revoked_at IS NULL
X-Sync-Version: 2026-05
Content-Type: application/json
```

```json
{
  "mutations": [
    {
      "mutation_id": "01970b8e-...",         // uuid v7
      "idempotency_key": "sha256:...",       // hash(entity_id + base_version + op_payload)
      "entity_type": "todo",
      "entity_id": "uuid",
      "op": "update",                         // create | update | delete
      "base_version": 42,                     // If-Match 语义,服务端判 409
      "encrypted_blob": "base64...",          // AES-GCM(DEK, plaintext_json)
      "blob_nonce": "base64",
      "blob_aad": "base64(entity_id || version)" // 防 replay,server 必须 verify
    }
  ]
}
```

```json
// 服务端响应
{
  "results": [
    {
      "mutation_id": "01970b8e-...",
      "status": "ok",                         // ok | conflict | rejected | device_revoked
      "server_version": 43,
      "server_seq": 12345                     // 写入 sync_events 的 seq;客户端记为 last_seen_seq
    },
    {
      "mutation_id": "01970b8f-...",
      "status": "conflict",                   // base_version 不匹配
      "server_version": 45,
      "remote_encrypted_blob": "base64...",   // 让客户端展示三方 diff
      "remote_blob_nonce": "base64",
      "remote_blob_aad": "base64"
    }
  ]
}
```

### 5.3 实时同步(Supabase Realtime — metadata-only)

> v0.2 重写:**不订阅 `postgres_changes` 业务表**(服务端没有明文,record 也没意义)。改为订阅每账号一个广播 channel `sync:<account_id>`,payload **只含 metadata**;Web 客户端收到 → 触发增量 pull;**不直接合并 record**(review Major)。

#### 5.3.1 Channel 与事件

> v0.3 codex C7:payload 必带 `seq`(per-account WAL 序号),`/sync/pull` 用 `since_seq` 而非时间戳 cursor;`server_updated_at` 只用于 UI 显示和审计。

| Channel | 事件 | payload |
|---|---|---|
| `sync:<account_id>` | `entity_changed` | `{ entity_type, entity_id, seq, server_updated_at, originator_device_id, version }` |
| `sync:<account_id>` | `device_revoked` | `{ device_id, revoked_at, reason }` |
| `sync:<account_id>` | `account_deleted` | `{ scheduled_at }` |
| `presence:<account_id>` | `online_devices` | `[{ device_id, platform, last_seen_at }]`(P1)|

收到 `entity_changed` → 把 `(entity_type, entity_id, seq)` 入 pull queue(去抖 300ms 合批)→ 调 `/sync/pull` body `{ since_seq: last_seen_seq, entity_types: [...], limit: 200 }` → 本地解密 + 写入 `entity_blobs` + 刷新 `entity_index` 持久 metadata + 解锁态下刷新内存 sort/FTS 索引 → 失效 TanStack Query → UI 自动刷新。

#### 5.3.2 FR 表

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-31 | Channel 订阅 | P0 | 登录后订阅 `sync:<account_id>`;无需按模块切换(metadata 体积小,全账号订阅即可);channel 状态机:`UNINITIALIZED → CONNECTING → SUBSCRIBED → DISCONNECTED → CONNECTING`,UI 反映 |
| FR-WEB-32 | Metadata → pull trigger | P0 | 收到 `entity_changed` **绝不直接 merge record**;若 `originator_device_id === own_device_id` 直接丢弃(自己的写已在本地);否则入 pull queue 去抖 300ms 合批 |
| FR-WEB-33 | 断线检测 + 重连(指数退避 + jitter) | P0 | 心跳 30s,3 次失败 → 标记 DISCONNECTED;重连退避序列 `[1s, 2s, 5s, 10s, 30s, 60s]` + ±25% jitter;reconnect 成功 → 触发一次 catch-up pull(`cursor = last_received_cursor`)|
| FR-WEB-33b | `visibilitychange` 恢复 | P0 | 标签 hidden ≥ 60s 后 visible → 主动 ping + catch-up pull(`since_seq = last_seen_seq`);DISCONNECTED 状态下 visible 立即触发重连尝试 |
| FR-WEB-33c | seq gap 检测 | P0 | `entity_changed.seq` per-account 单调;客户端记 `last_seen_seq`;新事件 `seq !== last_seen_seq + 1` → 触发 `/sync/pull?since_seq=last_seen_seq` 补齐再追上;30 分钟挂线后 reconnect 必须验证无丢事件 |
| FR-WEB-34 | 心跳 | P0 | Supabase 内置 30s 心跳;3 次失败标记断线;心跳失败原因(timeout / 4xx)上报 Sentry breadcrumb |
| FR-WEB-34b | WS 被代理禁用降级 | P0 | 检测 WS connect 连续 3 次失败(企业代理常见禁 WS)→ 降级 polling(`POST /sync/pull` 每 15s)+ banner "实时同步降级为轮询,数据可见性 ~15s";恢复 WS 后回到推送模式 |
| FR-WEB-35 | Realtime → core-events | P0 | metadata 事件转 `web:realtime-event`(payload `{ entity_type, entity_id, seq, originator_device_id }`,不含 record);UI 通过 `useEventListener` 反应,**不要依赖 record 字段** |
| FR-WEB-36 | 桌面 ↔ Web 双向可见 | P0 | 在线、低延迟网络下 P95 ≤ 5s(metadata 1s 内到达 + pull + 解密 + 渲染);WS 降级 polling 下 ≤ 20s;验收:两侧并排打开同一 Todo,改一侧 ≤ 5s 另一侧变 |
| FR-WEB-37 | 多标签共享 channel | P1 | 用 `BroadcastChannel` + `Web Lock API` 选举 leader 标签持 WS;follower 通过 BC 收 metadata;leader 关闭/失焦 → 重新选举;quota 节省 N-1 个连接 |
| FR-WEB-37b | 挂线 30 分钟恢复测试 | P0 | E2E 测试:登录 → 切到 background 30 分钟 → 期间桌面端改 10 条 → Web 标签 visible → 30s 内全部追平,无丢漏(用 cursor gap 检查) |

### 5.4 离线模式

> v0.2 重写:删除"明文落 IndexedDB 等联网再加密"(review Critical #3,IndexedDB 是持久存储,XSS、浏览器备份、设备取证都可触达明文)。改为**入队前必须加密**;DEK 不在内存则禁止加密字段离线写。

#### 5.4.1 离线写入策略

> v0.3 codex M-B:删除"非加密字段(完成状态、due_at 等元数据)写入"路径——零知识硬规则下,业务实体全字段进 blob,没有"非加密字段"。所有写都需要 DEK。

| 场景 | DEK 在内存? | 行为 |
|---|---|---|
| 任何业务实体写入(创建/更新/删除)| ✅ 在 | 整条记录序列化 + AES-GCM 加密(DEK)→ 入 `pending_mutations` 队列(只存 encrypted_blob + nonce + aad) |
| 任何业务实体写入 | ❌ 不在 | **禁止落 IndexedDB**;UI 标记"主密码已锁,本地编辑不可用";已开始的编辑保留在 React state(关页即失);若 5min idle 主密码超时清 → 编辑 buffer 清空 + 提示 |
| 完成 Todo / 切换 checkbox 等"仅改一个字段" | ✅ 在 | 仍走整条 blob 加密(零知识下服务端看不到字段差);本档不暴露"仅更新一个字段"的明文端点 |
| pending 队列回放 | ✅ 在 | 联网恢复 → 按 `created_at` 顺序 push;服务端按 `idempotency_key` 24h 去重;`base_version` 不匹配走三方 diff |
| pending 队列回放 | ❌ 不在 | **全部 mutation 阻塞**;不解锁不回放,避免错乱;顶部 banner 提示输主密码 |

> **明文 metadata 字段白名单**:v1 范围内**无白名单**(全部进 blob)。若 Phase 5+ 需要"按 due_at 推送提醒"等场景,**必须在 Sync 子 PRD 单独章节列出威胁模型 + 白名单字段 + 用户告知**;本档不预设入口。

#### 5.4.2 FR 表

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-38 | IndexedDB 持久层 | P0 | TanStack Query persistor + entity_index 都在 IndexedDB(`xai-cache` 库);Object Store 设计见 §8.2 |
| FR-WEB-39 | 离线检测 | P0 | `navigator.onLine` + 主动 ping `/healthz`(15s 间隔)+ WS DISCONNECTED 任一为 true 即 offline 模式;状态走全局 store,sidebar 底部显示离线标 |
| FR-WEB-40 | 只读离线浏览 | P0 | 离线时本地 entity_index 中已存的数据可正常浏览、过滤、搜索;DEK 在内存则解密展示,不在则显示"已加密";未缓存的实体显示"离线不可加载" |
| FR-WEB-41 | 离线编辑队列(加密前入队) | P0 | mutation 在 driver 层加密后入 `pending_mutations`(每条:`{ mutation_id, idempotency_key, entity_type, entity_id, op, base_version, encrypted_blob, base_encrypted_snapshot, created_at, retry_count }`);**永远不落明文**;DEK 不在内存时,加密字段 mutation 直接拒绝 + 提示输主密码 |
| FR-WEB-41b | 队列回放顺序 | P0 | 联网恢复 → 按 created_at 升序 push;同一 entity 的连续 update 走 §5.2.2 FR-WEB-27 合并;`base_version` 保证因果序 |
| FR-WEB-42 | 离线编辑队列限额 | P0 | 总队列(含 dead-letter)最大 500 条;超过 → 拒绝新写 + 顶部 banner "离线编辑过多(500/500),请上线同步";仅本地草稿(React state)不受限 |
| FR-WEB-43 | 冲突 UI(diff 可展示) | P0 | 服务端 409 返回 `remote_encrypted_blob` → 客户端解密 remote + 本地的 `base_encrypted_snapshot`(队列里存的原始基线)+ 本地的 `encrypted_blob`(我方修改),三方 diff 展示;用户选 (a) 保留远端覆盖本地 (b) 用本地覆盖远端(再次 push 不带 base_version,服务端记 audit log) (c) 手动合并(P1)|
| FR-WEB-43b | 冲突 toast 一次性 | P0 | 同一 entity 冲突只弹一次 toast;后续合并到顶部 banner "X 条冲突待处理"+ link 到冲突 inbox |
| FR-WEB-43c | Dead-letter 队列 | P0 | mutation 重试 3 次仍失败(非 409;5xx/网络)→ 移到 `dead_letter_mutations`;UI 有专门的"未同步更改"页可手动重试/丢弃/导出 |
| FR-WEB-44 | Service Worker | P0 | 注册 `/sw.js`(workbox 生成);HTML 走 **network-first + no-store**(避免 stale shell);静态资源 cache-first + immutable;precache revision 绑 git SHA(见 §9.4);更新时弹"新版本可用,刷新生效"**仅在空闲态**(无 in-flight mutation) |
| FR-WEB-45 | SW 紧急 escape hatch | P0 | (a) 设置 → 隐私 → "清除浏览器缓存"用户主动触发:`caches.delete()` + `indexedDB.deleteDatabase()` + `navigator.serviceWorker.getRegistrations().unregister()`;前置确认弹"会丢失未同步的本地修改"+ 列 pending 数量;(b) 紧急回滚通道:服务端可发布 `/sw-kill.js`(空实现 + `unregister()`),用户访问 `app.xai-desktop.app/?sw-kill=1` 强制注销旧 SW;(c) **`Clear-Site-Data` 谨慎使用:默认只清 `cache`(不动 IndexedDB 的 pending_mutations);仅在 P0/P1 安全事故才发 `Clear-Site-Data: cache, cookies, storage` 强清,且事故等级 + 操作流程写入 `docs/runbooks/clear-site-data.md`;UI 状态页同步公示"已强清,可能丢失本地未同步修改"** |
| FR-WEB-46 | 离线 E2E 字段策略 | P0 | (a) DEK 在内存 → 离线写正常加密入队;(b) DEK 不在内存 → 加密字段写入弹"请先输入主密码",用户输 → KEK 派生 → DEK 解密 → 继续写;(c) 拒输 → 编辑保留在 React state,关闭页面即失;(d) **任何情况下 IndexedDB 永不存明文加密字段** |
| FR-WEB-46b | DEK 内存超时 | P0 | DEK 在内存 5min idle 后自动清零(`fill(0)` + null);清零前若有 pending 加密字段 React state → 提示用户保存或丢弃;DEK 清后所有加密字段切回"已加密" |

### 5.5 响应式断点

| 断点 | 宽度阈值 | 行为 | 优先级 |
|---|---|---|---|
| Desktop(完整) | ≥ 1024px | 三栏(sidebar + list + detail),控制台子 PRD 标准 | P0 |
| Tablet(收缩) | 768 ~ 1023px | 两栏(list + detail);sidebar 默认折叠为 icon-only,点击展开 overlay 抽屉 | P0 |
| Mobile(只读+最小编辑) | < 768px | 单栏(只显示 list 或 detail);切换走顶部"返回";只读 + 完成 Todo / 加 Todo / 改文本三个最小写操作;复杂模块(项目管理看板)显示"在桌面打开" | P0 |

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-47 | 三档断点 | P0 | 真机/模拟器测 1440px/1024px/768px/375px 四档,布局符合上表 |
| FR-WEB-48 | 触摸交互 | P0 | 移动端单击 = 桌面端 hover+click 合并;长按 800ms = context menu;无 hover 状态 |
| FR-WEB-49 | 安全区 | P0 | iOS Safari 底部 home indicator 走 `env(safe-area-inset-*)`;`viewport-fit=cover`;sidebar 占满高度时避让 |
| FR-WEB-49b | 键盘挤压避免布局抖动 | P0 | 用 `visualViewport.height` 计算可见区高度,**不**用 `100vh`;表单输入框聚焦时主动 `scrollIntoView({ block: 'nearest' })`;Android Chrome 软键盘弹起期间 fixed 元素跟随 visualViewport |
| FR-WEB-50 | 浏览器保留快捷键不抢 | P0 | Cmd+W / Cmd+T / Cmd+R / Cmd+L / Cmd+K(Chrome 地址栏聚焦)等让给浏览器;全局搜索默认 `/` 键(类 GitHub/Linear),用户可在设置改;**不绑定 Cmd+K**(浏览器冲突);Arc/Firefox 已知差异写入开发者文档 |
| FR-WEB-50b | 快捷键可配置 | P1 | 设置 → 快捷键自定义;冲突检测;reset to default |

### 5.6 浏览器存储边界

> v0.2 修:删除 cookie 路径(纯 SPA 不用 cookie 装 token);加 device-local vs account-global 设置映射表(review Minor §5.6 / Console PRD 同步差异)。

#### 5.6.1 设置同步映射(device-local vs account-global)

> v0.3 codex M-B + Minor:所有 account-global 设置同走 encrypted_blob(快捷键映射、Pomodoro 配置、默认 list 等都是行为画像);不存在"明文 account_settings 表"。Console 子 PRD 必须配合调整其 `console.theme` 字段从"同步"改为"device-local",否则 source of truth 不一致。

| 设置项 | 类型 | 存储 | 跨设备同步? |
|---|---|---|---|
| 主题模式(dark/light/system) | **device-local**(v0.3 修订)| IndexedDB `user_prefs` | ❌ ;Console PRD 须同步改 |
| accent 色 | account-global | `encrypted_blobs` (entity_type='account_settings') | ✅ |
| reduce motion | device-local(尊重系统) | 无(读 `prefers-reduced-motion`)| — |
| 语言 locale | account-global(登录后) | `encrypted_blobs`;未登录 landing/auth 临时 `localStorage` 兜底 | ✅(登录后)|
| sidebar 折叠态 | device-local | IndexedDB `user_prefs` | ❌ |
| 最后访问模块 | device-local | IndexedDB `user_prefs` | ❌ |
| 快捷键映射 | account-global | `encrypted_blobs` | ✅ |
| 通知偏好 | device-local | IndexedDB(浏览器权限本就 per-device)| ❌ |
| Sentry / 分析 opt-in | device-local | IndexedDB `consent` | ❌ |
| 默认 list / 默认看板 | account-global | `encrypted_blobs` | ✅ |
| Pomodoro 时长配置 | account-global | `encrypted_blobs` | ✅ |
| 已读引导卡(web_intro_seen 等)| device-local | IndexedDB `user_prefs` | ❌ |

> Web 与桌面双向对齐:Console 子 PRD `settings` entity 走 encrypted_blob(主 PRD §5.13 隐含,Sync 子 PRD 实现);device-local 项 Web 走 IndexedDB,桌面走 SQLite 本地表。
>
> **行动项(§12 待办)**:Console 子 PRD 须把 `console.theme` 同步项改成 device-local;若 Console PRD 不改,以本档为准并在 Console PRD 标 deprecated。

#### 5.6.2 存储用途表

| 存储 | 用途 | 加密 | 大小预算 | 清理时机 |
|---|---|---|---|---|
| `localStorage` | 仅"非敏感、不需跨标签同步"的 UI hint(如 cookie banner 已关闭)|  无 | ≤ 10KB | 注销不清 |
| `sessionStorage` | OAuth `state` / `code_verifier`、未保存表单草稿、未确认的加密字段 buffer | 无 | ≤ 100KB | 关标签自动清 |
| **IndexedDB**(库:`xai-cache`) | `auth_tokens`(自定义 storage)/ `entity_index`(本地索引)/ `pending_mutations`(加密 mutation 队列)/ `dead_letter_mutations` / `encrypted_dek` / `user_prefs`(device-local 设置)/ `device`(device_id) | DEK 加密(blob 内容)+ AES-GCM(token 内容)+ 浏览器同源隔离 | ≤ 50MB(预算)/ 250MB(硬上限) | 注销清(除 `device.id`)/ 设置可手动清 |
| Cache Storage | SW 缓存的 app shell + 静态资源(precache revision 绑 git SHA) | 无 | ≤ 30MB | SW 更新替换 / 设置 → "清除浏览器缓存"清 |

> **不使用 cookie 装 token**(承接 §5.1.1);唯一会出现的 cookie 是 Supabase 内部为 OAuth 流转需要的极短期 cookie(由 SDK 管理),业务代码不读写。

#### 5.6.3 FR 表

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-51 | 存储用途隔离 | P0 | 代码 review 红线:任何 plugin 写入 localStorage/IndexedDB 必须走 `@repo/core-data/web` 或 `@repo/core/host/web` 封装;直接 import `localStorage` 在 ESLint 报错 |
| FR-WEB-52 | 配额监控 + LRU 清理 | P0 | 启动 + 每 5min `navigator.storage.estimate()`;使用率 > 80% → 触发 LRU 删 7 天未访问的 query_cache + entity_index 条目;` > 95%` → 拒绝新写并提示 |
| FR-WEB-52b | 主动 persistence | P0 | 登录后调 `navigator.storage.persisted()` 查询是否已持久(返 bool);若 false 调 `persist()` 请求(Chrome 自动允许;Firefox 用户 prompt;Safari 不支持 → 默默忽略);失败不致命。**注**:`persisted()` 仅说明"是否已持久化",不检测"7 天将被回收";另外在 IndexedDB 写一个 `sync_state.sentinel`(随机字符串),启动时校验存在,缺失即视为被浏览器回收 → 触发全量重拉(承接 §5.11.3 FR-WEB-78b) |
| FR-WEB-53 | 存储被清恢复 | P0 | 用户在浏览器设置清了站点数据 → 下次访问检测到无 IndexedDB → 走"如同新登录"流程(重新 `device_register`,新 device_id)+ 全量 `/sync/pull`;不应崩溃 |
| FR-WEB-54 | KEK / DEK 不落盘 | P0 | KEK / DEK 仅以非 extractable `CryptoKey` 形式存内存(React Context + `useRef`);不进 localStorage / IndexedDB / cookie;ESLint 规则禁止 `JSON.stringify` 含 CryptoKey 的对象 |

### 5.7 PWA(P1)+ 安装提示策略

> v0.2 新增 §5.7.1 安装提示策略(review 增补建议):不在首访就弹安装,避免骚扰新用户。

#### 5.7.1 安装提示触发策略

| 条件 | 必须 | 说明 |
|---|---|---|
| 用户完成 ≥ 3 次有效操作(创建 Todo、完成 Todo、切模块至少 2 次等) | ✅ | 计数器存 IndexedDB |
| 浏览器支持 `beforeinstallprompt` 事件(Chromium 系) | ✅ | 不支持的不弹 |
| 当前设备**没有**已注册的桌面 App(查 `device_list_rpc()` 无 `platform: 'macos'` 设备) | ✅ | 有桌面 App 不弹(走 §5.10 banner 引导下载) |
| 非 iOS(iOS 不支持 `beforeinstallprompt`)| ✅ | iOS 走另一路径 |
| 用户上次拒绝距今 > 14 天 | ✅ | 拒绝标记存 IndexedDB |

iOS 路径:**绝不弹 banner**,只在 `/app/settings/about` 页提供"安装到主屏幕"引导卡(图示 Share → A2HS)。

#### 5.7.2 FR 表

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-55 | Web App Manifest | P1 | `/manifest.webmanifest` 含 name / short_name / icons (192/512/maskable) / start_url=/app / display=standalone / theme_color / background_color / id |
| FR-WEB-56 | Service Worker 离线 | P0 | 承接 §5.4 FR-WEB-44 |
| FR-WEB-57 | 桌面安装提示 | P1 | 按 §5.7.1 策略触发;`beforeinstallprompt.prompt()` 仅在 user gesture 内调;拒绝/接受写入 IndexedDB `pwa_install` |
| FR-WEB-58 | iOS Add to Home Screen | P1 | iOS Safari A2HS 后启动 standalone(`navigator.standalone === true`);`apple-touch-icon` 180px;`apple-mobile-web-app-capable` 和 `apple-mobile-web-app-status-bar-style` |
| FR-WEB-59 | Web Push 通知 | P2 | Phase 5+ 评估;v1 不做(VAPID + 服务端推送基础设施量大,且与零知识同步需配合) |
| FR-WEB-60 | PWA 更新提示 | P1 | SW `waiting` 状态在**空闲态**(无 in-flight mutation + 无 modal 打开)弹 banner "新版本可用 / 刷新";用户点击 → `skipWaiting` + `reload` |
| FR-WEB-60b | standalone 与 tab 行为一致 | P0 | standalone 模式与 tab 模式渲染相同;唯一差异是隐藏浏览器 chrome;不做 standalone 独占功能,避免 RW-11 风险 |

### 5.8 路由 + 深链接

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-61 | 路由库 | P0 | React Router v6+(`createBrowserRouter`);所有路由懒加载(`React.lazy` + `Suspense`) |
| FR-WEB-62 | 深链接 | P0 | `/app/todos/work/abc123` 直接打开 Todo 详情,刷新不丢状态;detail 面板可从 URL 还原 |
| FR-WEB-63 | 浏览器前进/后退 | P0 | 切换 list / detail 进 history;按浏览器后退按预期返回上一态(不是退出 SPA) |
| FR-WEB-64 | 锚点 | P0 | `/app/settings#privacy` 滚动到隐私区块 |
| FR-WEB-65 | 共享链接 | P1(v1 不实现) | **v1 不开 `/share/*` 路由,直接 404**;P1 等 Sync 子 PRD 提交 share envelope 协议(per-entity share key + URL fragment 携带解密材料 + server 存 encrypted share blob + 匿名只读 RPC 仅返回 encrypted blob);本档 P1 时再展开 UI / 路由 / SEO `noindex` per-share meta |
| FR-WEB-66 | 未匹配路由 | P0 | 任何不存在路径 → `/404`;`/app/*` 下未匹配 → "模块不存在" + 跳默认模块 |
| FR-WEB-67 | 路由级权限 | P0 | `/app/*` 未登录跳 `/auth/login?next=<原路径>`;登录后回跳 |

### 5.9 性能(Web Vitals 目标值)

> v0.2 修:**FID 已被 INP 取代**(2024-03 起 Web Vitals 正式替换);TTI 是 lab 指标,不上 RUM;按 route_group 分预算(review Major)。

#### 5.9.1 RUM(线上 75th percentile)

| 指标 | landing(`/`)目标 | `/app/*` 目标 | 监测 |
|---|---|---|---|
| LCP | < 1.8s | < 2.5s | `web-vitals` → Sentry transaction;按 `route_group` tag |
| INP(Interaction to Next Paint) | < 200ms | < 200ms | 同上;**取代 FID** |
| CLS | < 0.1 | < 0.1 | 同上 |
| TTFB | < 800ms | < 1.5s | 同上 |
| FCP | < 1.5s | < 2.0s | 同上 |

#### 5.9.2 Lab(CI 预算,不上 RUM)

| 指标 | 目标 | 监测 | 越线动作 |
|---|---|---|---|
| Lighthouse Performance | ≥ 90(landing) / ≥ 80(`/app/todos` 50 条 fixture) | Lighthouse CI | 阻塞合并 |
| TTI(Lab) | < 3.5s | Lighthouse CI | 检查主线程阻塞 |
| 初始 JS bundle(landing) | < 100KB gzip | Vite build + CI assert | 拆 chunk / 移除依赖 |
| 初始 JS bundle(`/app/*` shell) | < 250KB gzip | 同上 | 同上 |
| 路由 chunk(每模块) | < 80KB gzip | 同上 | 拆 lazy 边界 |
| 路由切换响应 | < 200ms(P95) | Performance API | prefetch + 优化懒加载 |
| Sync push/pull P95 | < 800ms | driver instrumentation → Sentry | 检后端 |

#### 5.9.3 优化手段

- Vite `build.rollupOptions.output.manualChunks`:把 supabase-js / TanStack Query / lucide-react / react-router 等大依赖独立 chunk(便于长期缓存);plugin 各自一个 chunk
- 路由 `prefetch`:hover sidebar 入口时预拉对应路由 chunk(`<link rel="modulepreload">`)
- Sentry release:每次 build 生成 `release = $GIT_SHA`,Web Vitals event 带 release tag,便于回归定位
- 字体策略:`font-display: swap` + 预加载 woff2 + system font fallback
- 图标:lucide-react tree-shake;首屏 hero 图用 `<img loading="eager">` + 后续 `loading="lazy"`

#### 5.9.4 FR 表

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-68 | Lighthouse CI 门 | P0 | CI 跑 Lighthouse,landing Perf ≥ 90、`/app/todos`(50 条 fixture)Perf ≥ 80;A11y ≥ 90 / Best Practices ≥ 90 / SEO ≥ 90 阻塞合并 |
| FR-WEB-69 | bundle 体积监控 | P0 | `vite build --report` 输出 + `size-limit` CI assert;主路径 chunk 大小退化 ≥ 20% 阻塞 |
| FR-WEB-70 | Web Vitals 采集(RUM) | P0 | `web-vitals` 包采集 LCP/INP/CLS/TTFB/FCP → Sentry transaction;按 `route_group` tag(`landing` / `auth` / `app/todos` / `app/projects` 等);采样 10%(landing 100%) |
| FR-WEB-70b | 路由切换性能监控 | P0 | React Router 路由变化 Performance Mark + Sentry transaction;P95 > 200ms 触发 Sentry alert |

### 5.10 SEO + landing page

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-71 | landing page 独立路由 | P0 | `/` 是真正的 landing(非 app shell);Phase 4.5 用 SPA 渲染,Phase 5+ 评估迁 SSG |
| FR-WEB-72 | 基本 meta | P0 | 每路由有 `<title>` + `<meta description>` + Open Graph + Twitter card |
| FR-WEB-73 | sitemap + robots | P0 | `/sitemap.xml` 列公开页;`/robots.txt` 允许 `/`、`/auth/*`、`/legal/*`,禁止 `/app/*`;`/share/*` 走 share envelope 时由后端按 per-share 设 `noindex` meta(P1,见 §5.18 share 重写),v1 因不实现 share 链接,robots 也不涉及 |
| FR-WEB-74 | 结构化数据 | P1 | landing page 加 `Application` schema.org JSON-LD |
| FR-WEB-75 | favicon + icons | P0 | 完整 favicon 套(16/32/48 ICO + 192/512 PNG + apple-touch-icon 180) |

### 5.11 兼容性

> v0.2 重写:Playwright WebKit 不能替代真实 iOS Safari(IndexedDB quota/eviction、Private Browsing、PWA standalone、Storage partition 行为不同),验收矩阵分 CI 自动 + 真机手工两层(review Major)。

#### 5.11.1 验收矩阵

| 浏览器 / 设备 | 最低版本 | CI 自动(Playwright) | 真机/真浏览器手工(每周末) | 重点验收 |
|---|---|---|---|---|
| Chrome desktop(macOS/Win/Linux) | 最新两个 stable | ✅ | ✅ | PWA 安装、SW 更新、BroadcastChannel |
| Edge desktop | 最新两个 stable | ✅ | ✅(企业策略机) | 企业 group policy 禁第三方 cookie / WS |
| Firefox desktop | 最新两个 stable | ✅ | ✅ | ETP 严格模式、Container 标签 cookie 隔离、IndexedDB persistence prompt |
| macOS Safari | 17+(Sonoma+) | ✅(WebKit) | ✅(真机) | OAuth callback、ITP、IndexedDB 7-day eviction、SW 更新延迟 |
| iOS Safari | 17+(iOS 17+) | ⚠️ WebKit 不替代 | ✅(真 iPhone) | safe-area、软键盘 visualViewport、PWA standalone、A2HS、低存储 quota |
| Android Chrome | 最新两个 stable | ✅(Chromium mobile profile) | ✅(真 Android) | 安装提示、离线队列、deep link |
| 不支持 | IE / Opera Mini / UC | — | — | 显示"浏览器不受支持"降级页 |

#### 5.11.2 真机验收清单(每周末跑)

- macOS Safari 真机:OAuth callback 不被 ITP 拦;IndexedDB 7 天未访问被回收后重建无崩;SW 更新真生效(Safari SW 更新比 Chrome 慢)
- iPhone Safari 真机:PWA standalone 启动 OK;键盘弹起不挤压 toolbar;低存储下 IndexedDB 被回收的恢复流程;Private Browsing 模式 IndexedDB 禁用的兜底
- Firefox ETP "严格":第三方资源被拦的影响(预期我们没第三方);Container 标签:同账号 cookie 隔离不会让 SDK 跨容器看见 session
- Edge 企业策略:`PerProfileNetworkPrediction` / 第三方 cookie ban / WS 被代理禁(走 §5.3 polling 降级)
- 低存储 quota 测试:Chrome DevTools 设 IndexedDB quota = 50MB,验证 §5.6.2 LRU 清理触发正常

#### 5.11.3 FR 表

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-76 | 浏览器探测 | P0 | 入口 JS 早期探测 UA + feature detect(IndexedDB、Web Crypto、BroadcastChannel、CSS Grid),不支持的渲染静态降级页 |
| FR-WEB-77 | polyfill 策略 | P0 | Vite `target: 'es2020'`,不引 IE polyfill;BroadcastChannel / IndexedDB / fetch / Web Crypto 不做 polyfill;低于最低版本直接拒 |
| FR-WEB-78 | Safari 特有验证 | P0 | 100vh 抖动用 `dvh` + visualViewport;`@supports` 兜底;`-webkit-fill-available` 不再使用(已 deprecated) |
| FR-WEB-78b | Safari IndexedDB eviction | P0 | 7 天未访问被 ITP 回收 → (a) 启动时调 `persisted()` 查询 + `persist()` 请求兜底;(b) 写 `sync_state.sentinel` 随机字符串,启动校验存在;sentinel 缺失即视为被回收 → 重建 IndexedDB + 从服务端全量重拉(`since_seq=0`);(c) Safari/iOS 真机 7 天后访问的恢复链路必须在 §5.11.2 真机走查清单内验证 |
| FR-WEB-78c | Safari Private Browsing | P0 | Private 模式 IndexedDB write 抛 quota error → 检测后切到"会话模式":memory-only cache + 警告"私密模式下离线/PWA 不可用" |
| FR-WEB-79 | Firefox 容器/ETP | P0 | 容器标签下 cookie 隔离;ETP "严格"不阻塞 Supabase WS(同源,不算第三方);手工验证 |
| FR-WEB-79b | PWA Storage partition | P0(从 P1 升)| Chromium Storage Partition(企业策略可能开启)+ iOS PWA standalone 与 Safari tab 之间 BroadcastChannel / Web Lock 不通;leader 选举(FR-WEB-37)**不能假设 BroadcastChannel 可用**,先 `feature-detect` `BroadcastChannel` + `navigator.locks`,缺失时降级独立 WS 连接(每个 partition 一份)+ `localStorage` `storage` 事件做尽力跨 partition 通信;真机走查必跑 |

### 5.12 安全

> v0.2 重写:CSP 补完整(`object-src`/`worker-src`/`manifest-src`/`font-src`/`upgrade-insecure-requests`/`report-to`);上线流程"先 Report-Only 1 周 → enforce"(review Major)。Cookie 属性条目改为"无 cookie 装 token"(承接 §5.1.1)。

#### 5.12.1 完整 CSP 头

**最终 enforce 形态**(`Content-Security-Policy`):

```
default-src 'self';
script-src 'self' 'wasm-unsafe-eval';
style-src 'self' 'nonce-<RUNTIME_NONCE>';   /* 见 §5.12.3 说明 */
img-src 'self' data: blob: https:;
font-src 'self' data:;
connect-src 'self'
  https://<project>.supabase.co
  wss://<project>.supabase.co
  https://*.ingest.sentry.io        /* 仅 Sentry opt-in 用户加载;否则 connect-src 不含 */
  https://app.xai-desktop.app;       /* 自建 /__csp_report */
worker-src 'self' blob:;
manifest-src 'self';
object-src 'none';
frame-ancestors 'none';
frame-src 'none';
base-uri 'self';
form-action 'self';
upgrade-insecure-requests;
report-to csp-endpoint;
report-uri https://app.xai-desktop.app/__csp_report;   /* 自建同源端点 */
```

`Report-To` header:
```
Report-To: {"group":"csp-endpoint","max_age":10886400,"endpoints":[{"url":"https://app.xai-desktop.app/__csp_report"}]}
```

> v0.3 codex M-C 修正:CSP report **不直发 Sentry**(Sentry 是 opt-in 错误上报,EU 用户未同意前不能收;同时 CSP report 包含 URL/path/referrer 可能泄漏 path 隐私)。改为发到 `app.xai-desktop.app/__csp_report` 同源 Vercel/CF edge function:(1) 严格 scrub(去除 query string、entity_id、user agent 中除浏览器名外的指纹);(2) scrub 后转写入项目独立的 log store(本 v1 用 Supabase `csp_violations` 表);(3) Sentry opt-in 用户额外转一份到 Sentry(必要"安全遥测",privacy 页声明)。

#### 5.12.2 上线流程

1. **第 1 周(staging)**:`Content-Security-Policy-Report-Only` 头发上(同样的指令)→ Sentry 收 violation
2. **第 2 周**:零 violation → 切 `Content-Security-Policy` enforce;有 violation → 分析、修代码或允许必要的 source
3. **回滚通道**:enforce 后若爆发,Vercel/CF edge function 一键切回 Report-Only(部署不要求 rebuild)

#### 5.12.3 style-src 处理

- 移除 `'unsafe-inline'`(原版 #82 用了,review 标记需 nonce/hash)
- React inline style(组件运行时计算)通过 build 时静态提取 + 运行时 nonce 注入解决:
  - 使用 CSS-in-JS 改为 Vanilla Extract / CSS Modules(build 时编译)
  - 必须运行时计算的(如主题动态变量)走 `<style nonce="<RUNTIME_NONCE>">` 注入,nonce 由服务器/edge function 在 HTML 响应里设
- Vercel/CF edge middleware 在每次 HTML 响应注入随机 nonce

#### 5.12.4 FR 表

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-80 | HTTPS only | P0 | 所有响应 + 资源 https;HTTP 永久 301 → HTTPS |
| FR-WEB-81 | HSTS + preload | P0 | `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`;`.app` TLD 已强制;提交 hstspreload.org |
| FR-WEB-82 | CSP enforce | P0 | 按 §5.12.1 部署;§5.12.2 流程上线;Sentry 接 violation;production 部署后 7 天 zero violation 为通过 |
| FR-WEB-82b | CSP Report-Only 灰度 | P0 | staging 默认 Report-Only;prod enforce 前必须 staging Report-Only 1 周 zero violation |
| FR-WEB-83 | Cookie 属性(若有) | P0 | Web 业务代码**不主动写 cookie**;Supabase SDK 内部仅 OAuth 流转期间使用极短期 cookie,由 SDK 配置 `Secure; SameSite=Lax`(纯 SPA HttpOnly 不可由 JS 设置,见 §5.1.1) |
| FR-WEB-84 | XSS 防御 | P0 | React JSX 默认 escape;ESLint `react/no-danger` rule;唯一允许 `dangerouslySetInnerHTML` 处:`react-markdown` + `rehype-sanitize` 白名单(只含 Todo/note 描述渲染);代码 review checklist |
| FR-WEB-85 | CSRF | P0 | API 走 `Authorization: Bearer <token>`,非 cookie 鉴权 → 天然免 CSRF;Supabase OAuth 短期 cookie 已 SameSite=Lax |
| FR-WEB-86 | Clickjacking | P0 | `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'` |
| FR-WEB-87 | Referrer policy | P0 | `Referrer-Policy: strict-origin-when-cross-origin` |
| FR-WEB-87b | Permissions-Policy | P0 | `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()`(显式拒所有不用的) |
| FR-WEB-88 | E2E 主密码处理 | P0 | (v0.3 codex M-D 修正"JS string fill 不可保证 zeroize"误导):主密码输入立即从 React `<input>` 拷贝为 `Uint8Array(TextEncoder.encode(password))`,React state 字符串引用置 null + UI input 清空;`Uint8Array` 喂给 Argon2id WASM(`hash-wasm`,memoryCost 64MB / iterations 3 / parallelism 1)派生 KEK(`CryptoKey` 非 extractable)→ 解密 IndexedDB 的 `encrypted_dek` → DEK(`CryptoKey` 非 extractable)驻内存;`Uint8Array.fill(0)` zeroize 自有 buffer(best effort,JS 字符串不可强 zeroize 已知);页面 unload / 5min idle → 清 KEK + DEK + 通知 Worker `flexsearch.index.clear()` |
| FR-WEB-89 | 内存敏感数据生命周期 | P0 | KEK/DEK 仅在 React Context 中(非 extractable CryptoKey handle,本身不可读出明文),组件卸载即释放;`crypto.subtle` 操作完成立即让 buffer 被 GC;ESLint 自定义规则禁止 `JSON.stringify(secret)` 或 `console.log(crypto)`;**承认 limit**:文档明确"best-effort zeroization;JS runtime / V8 不保证字符串内容立即清除,这是 SPA E2E 的固有 limit" |
| FR-WEB-90 | Subresource Integrity | P0(升级) | 任何 CDN 引入(若引)必须带 `integrity=sha384-...`;**v0.2 强制升 P0**:既然 Auth token 落 Web Storage,任何被注入的 CDN 脚本都可读 token,SRI 是底线 |
| FR-WEB-91 | npm 供应链 | P0 | CI `pnpm audit --prod` + Dependabot + Socket.dev(可选);关键依赖(supabase-js / @sentry/browser / hash-wasm)锁版本 + 每月 review;新依赖 PR 必须人工 review;每月扫一次 `npm-audit-html` 产 report 留档 |
| FR-WEB-91b | Sandbox iframe | P0 | 任何渲染用户富文本/HTML 预览的场景(P1 之后才会出现)必须 `<iframe sandbox>`(无 `allow-scripts`);v1 暂无 |

### 5.13 错误边界 + Sentry web

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-92 | React Error Boundary | P0 | App 顶层 + 每个 lazy route 边界;捕获 → 显示 fallback UI + 上报 Sentry + "重新加载"按钮 |
| FR-WEB-93 | Sentry web SDK | P0 | `@sentry/browser` + `@sentry/react`;DSN 与桌面同,通过 `environment: 'web-prod'`/`'web-staging'`/`'web-dev'` 区分 |
| FR-WEB-94 | Sentry 隐私过滤 | P0 | `beforeSend` + `beforeBreadcrumb` 钩子:(a) 删除 query/mutation/URL 中的 `entity_id`(改为短 hash `entity_type:sha256(entity_id)[0..8]` 仅做错误关联),**完整 entity_id 不上报**(v0.3 codex M-C 与 Sync PRD 隐私段对齐);(b) 删除 query string(`?token`、`?next` 等);(c) 删除请求 body(任何 encrypted_blob / mutation payload);(d) `sendDefaultPii: false`;(e) 浏览器扩展 attributing 不上报;写测试用例断言所有这些 |
| FR-WEB-95 | Source map 上传(固定 CI 步骤序)| P0 | v0.3 codex M-C 校正 CLI 顺序:(1) GitHub Actions Secrets:`SENTRY_AUTH_TOKEN` / `SENTRY_ORG` / `SENTRY_PROJECT`;(2) `pnpm build`(Vite `build.sourcemap: 'hidden'` — 生成 .map 但 bundle 不引用 sourceMappingURL);(3) `sentry-cli releases new $GIT_SHA`;(4) `sentry-cli releases set-commits $GIT_SHA --auto`;(5) **`sentry-cli sourcemaps inject dist`**(注入 Debug ID 到 JS 与 .map,新版 CLI 推荐);(6) `sentry-cli sourcemaps upload --release=$GIT_SHA --validate dist`(`--url-prefix` 由 inject 自动处理);(7) `sentry-cli releases finalize $GIT_SHA`;(8) **删除 `dist/**/*.map`**(必须在 upload 之后);(9) deploy `dist` 到 Vercel/CF;(10) `sentry-cli releases deploys $GIT_SHA new --env $ENV`;Vite `build.sourcemap = 'hidden'`,Sentry web SDK 配 `Sentry.init({ release: import.meta.env.VITE_GIT_SHA })`;**生产服务器从不挂 .map**(浏览器永远拿不到) |
| FR-WEB-96 | Sentry opt-in | P0 | 与桌面一致(主 PRD §6.2 / TR §1.3.2);首启弹 "是否启用匿名错误上报",拒绝则 SDK 不 init |
| FR-WEB-97 | 网络错误聚合 | P0 | 5xx / 超时通过 Sentry breadcrumb 聚合,避免单错误上报洪泛 |

### 5.14 i18n

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-98 | 语言识别 | P0 | 优先级:用户设置 > URL prefix(`/zh-CN/...` P1)> `Accept-Language` > 默认 zh-CN |
| FR-WEB-99 | 语言资源 | P0 | 复用 `packages/ui/i18n/<lang>.json`(zh-CN / zh-TW / en);按 chunk 懒加载 |
| FR-WEB-100 | 切换语言 | P0 | 设置 → 语言 即时切换:**登录后**写 account-global `encrypted_blobs`(承接 §5.6.1);**未登录** landing/auth 页临时 `localStorage` 兜底,登录后首次同步从 account-global 覆盖 local;`<html lang>` 同步更新 |
| FR-WEB-101 | URL 语言 prefix | P1 | `/zh-CN/app/todos` 模式(SEO 友好),v1 P0 不强制 |
| FR-WEB-102 | 日期 / 数字 | P0 | 走 `Intl.DateTimeFormat` / `Intl.NumberFormat`,locale 来自当前语言 |

### 5.15 浏览器扩展接口预留(P2)

> v0.2 重写:CORS 不能写 `chrome-extension://*`(等于对任意扩展开 API 入口);改为固定 extension ID allowlist + 独立 OAuth client + scope 限制 + 速率限制(review Major)。

#### 5.15.1 Quick Capture RPC 契约

> v0.3 codex M-D 修正:服务端只接 encrypted payload,示例改 envelope。明文字段(`type`、`title`、`url`、`selected_text`、`target`)只在客户端 TypeScript 类型中存在,扩展先加密再 POST。

```
POST /rest/v1/rpc/capture.create
Authorization: Bearer <extension-oauth-token>
X-Device-Id:   <extension-device-uuid>
X-Sync-Version: 2026-05
Content-Type: application/json

Body(传输线上):
{
  "entity_type": "todo",                  // 仅 envelope 元数据
  "key_id": "string",                     // 标识用哪份 key 加密(见下)
  "encrypted_payload": "base64...",       // AES-GCM 加密的 {type,title,url,selected_text,target}
  "nonce": "base64",
  "aad": "base64"                          // 含 entity_type + key_id
}

Response:
{ "entity_id": "uuid", "server_seq": 123, "created_at": "ISO8601" }
```

```ts
// 扩展端 TypeScript 类型(明文,只在 client memory 中)
type QuickCaptureInput = {
  type: 'todo';                            // todo | bookmark | note(P2 第二批)
  title: string;
  url?: string;                            // 捕获页面 URL
  selected_text?: string;                  // 选中文本
  target: 'inbox';                         // 默认 inbox,扩展不接受用户自由指定 list
};
```

- **scope 限制**:扩展 OAuth token 只持有 `quick_capture:write`,不能调其他 RPC;不能读现有数据;不能调 `/sync/pull`
- **加密 payload 方案**:扩展授权时由主端在 `/sync/extension/keys` RPC 下发一份"扩展专用 key bundle"(短期临时 DEK,7 天滚动 + 用户授权刷新);扩展用此 key 加密 payload,服务端写入 `encrypted_blobs`;用户主端 pull 时正常解密(同一 DEK 体系)。**最终协议由 Sync 子 PRD 定稿**,本档列契约
- 速率限制:每用户每分钟 ≤ 30 次 capture
- 审计:每次 capture 写 `audit_logs`(`extension_id`、`device_id`、`ip 截断`、`ua hash`、`created_at`)

#### 5.15.2 FR 表

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-103 | 扩展通信端点 | P2 | 后端预留 RPC `capture.create({type,title,url,selected_text,target})`;**仅接 encrypted payload**(Sync 子 PRD 定义包装协议) |
| FR-WEB-103b | 扩展 OAuth | P2 | 扩展 OAuth 走**独立 client**(client_id ≠ Web SPA 的),走 PKCE flow(`chrome.identity.launchWebAuthFlow`)+ device fingerprint;颁发 token scope 仅 `quick_capture:write`,TTL 30 天滚动刷新 |
| FR-WEB-104 | 扩展接收 CORS | P2 | API 仅接受**固定 extension ID allowlist** 的 origin(Chrome 上架后用 `chrome-extension://<production-id>`、Firefox AMO 用 `moz-extension://<amo-uuid>`);wildcard `chrome-extension://*` 严禁;开发期 allowlist 单独 staging env |
| FR-WEB-104b | 速率限制 + 审计 | P2 | 每用户每分钟 ≤ 30 次 capture;超额 429;每次 capture 写 audit_logs(extension_id、ua、ip);超额 5 次自动暂停 token 24h |
| FR-WEB-105 | 扩展本体 | P2 | 单独仓库 `xai-desktop-extension`,本档不涵盖实现,只确保后端端点稳定;v1.5 评估 |

### 5.16 移动端浏览器(只读 + 最小编辑)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-106 | 移动端识别 | P0 | UA + 宽度 < 768px,标记 mobile 模式 |
| FR-WEB-107 | 移动可用模块 | P0 | Todo(读+完成+加 Todo+改标题)/ Habits(读+打卡)/ Calendar(读)/ Search(读)/ Settings(基础) |
| FR-WEB-108 | 移动屏蔽模块 | P0 | 项目管理 / Pomodoro / Labels 管理 / 复杂详情面板:显示"此模块建议在桌面或平板打开" |
| FR-WEB-109 | 移动手势 | P1 | Todo 左滑标完成、右滑删除 |
| FR-WEB-110 | 移动 PWA | P1 | iOS Safari "添加到主屏幕" 后启动 standalone(承接 §5.7) |
| FR-WEB-111 | 移动键盘适配 | P0 | viewport meta `width=device-width, initial-scale=1, viewport-fit=cover`(**不带 `maximum-scale=1`/`user-scalable=no`**,违反 WCAG 1.4.4);输入框字号 ≥ 16px(iOS Safari 16px 以下会强制缩放,与无障碍冲突);键盘弹起用 `visualViewport` 监听(承接 FR-WEB-49b) |

### 5.17 与桌面 App 的双向状态同步

> 同步层细节在 `sub-prds/sync/PRD.md`;此处定义 Web 端的可观察行为。v0.2 修:协议改 Sync push/pull encrypted blob(承接 §5.2)。

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-112 | 同账号端点一致 | P0 | Web ↔ 桌面 App 走同一 Supabase project;数据库 schema 一致(主 PRD §8 + 本档 §5.1.3 新增 devices/sessions);blob 加密协议一致(Sync 子 PRD 定义) |
| FR-WEB-113 | 5s 内可见(联机态) | P0 | Web 改 → 桌面 5s 内见;桌面改 → Web 5s 内见;路径:Sync push → Realtime metadata 广播 → 对端 pull → 解密 → 渲染 |
| FR-WEB-114 | 离线变在线后追平 | P0 | 关网 5 分钟内本地改 10 条 → 联网后 30s 内全部 push 完成,服务端按 mutation_id 顺序处理 + 幂等去重;冲突按 §5.4 FR-WEB-43 处理 |
| FR-WEB-115 | 同账号多端登录可见 | P0 | 设置 → 同步状态显示"已登录设备" + 最近活跃时间 + Web 标签数;与 FR-WEB-17 一致;数据来自自建 `devices` 视图 |
| FR-WEB-116 | 同步状态指示 | P0 | sidebar 底部小灯:绿(已同步,无 pending)/ 黄(同步中)/ 红(失败 + tooltip 显错误码 + 跳 dead-letter 视图)/ 灰(离线);WS 降级 polling 状态额外标蓝小点 |
| FR-WEB-117 | 主密码不一致拒绝同步 E2E 字段 | P0 | 若 Web 端主密码与桌面端不同(用户改了一端没改另一端)→ Web 端 DEK 解密 blob 失败 → 提示"主密码与其他设备不一致,请输入新主密码" + 不渲染加密字段 + 不写入 |

### 5.18 数据导出 / 账号删除 / 分享链接 / GDPR

> v0.2 重写:GDPR 导出改为**浏览器端打包**(零知识保留;review Critical #4)。Share 链接 **v1 不实现**,降到 P1(需 Sync 子 PRD 先出 share envelope 协议;review Critical #7)。补 DSR SLA、子处理者清单、年龄门槛、删除后备份保留(review Major)。

#### 5.18.1 客户端数据导出(零知识保留)

| 步骤 | 实现 |
|---|---|
| 1. 用户在 `/app/settings/privacy` 点"导出我的数据" | UI 提示需输入主密码(已有 DEK 则跳过) |
| 2. 浏览器调 `/sync/pull?full=true&cursor=0` 拉**所有** entity 的 encrypted blob | 流式 batch,显进度条 |
| 3. 浏览器本地用 DEK 逐条解密 blob | Web Worker 跑,避免阻塞 UI |
| 4. 浏览器本地装配 JSON 文件 | 用 `JSZip` 在 Worker 内拼包 |
| 5. 浏览器触发下载(Blob URL + `<a download>`)| 文件名 `xai-export-<account-id>-<YYYYMMDD>.zip` |
| 6. 服务端从头到尾**不接触明文** | 服务端 RPC 只产生**短期 job token** 用于 §4.1 rate limit;不写入 Storage,不发邮件 |

> **删除原 FR-WEB-118**:"后端打包 JSON zip + 邮件下载链接" 与 E2E 矛盾;且 zip 落 Supabase Storage 即使加密也扩大泄漏面。

#### 5.18.2 Share 链接:v1 不实现,P1 设计

> 等 Sync 子 PRD 先出 share envelope 协议(per-entity share key + URL fragment 携带解密材料 + server 存 encrypted share blob)。本档 v1 不实现 `/share/:token` 路由;§3.1 URL 表里的 `/share/:token` 行 v1 直接返回 404;§5.8 FR-WEB-65 由 P1 推进。

#### 5.18.3 FR 表

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-118 | 数据导出(客户端打包) | P0 | 设置 → 隐私 → "导出我的数据";按 §5.18.1 流程在浏览器内本地解密 + 打包 + 触发下载;**服务端不接触明文,不存导出 zip**;DEK 不在内存时引导先输入主密码;导出过程中可中断;大账号(> 100MB)分卷 zip 或提示"将下载多个文件" |
| FR-WEB-119 | 导出格式 | P0 | zip 含 `todos.json` / `labels.json` / `boards.json` / `habits.json` / `pomodoro.json` / `settings.json`(仅 device-local & account-global 的明文设置)/ `devices.json`(自有设备列表)/ `README.md`(字段说明、时间格式 ISO 8601、字段映射到主 PRD §8 schema 的版本号) |
| FR-WEB-119b | 导出审计 | P0 | 每次导出在 `audit_logs` 写一条(`account_id`、`exported_at`、`ip`、`ua`、`approximate_size`),用于异常检测;**不记录导出内容** |
| FR-WEB-120 | 账号删除 | P0 | 设置 → 账号 → "删除账号" → 二次确认输入密码 + 输入 "DELETE"  → 后端置 `accounts.deletion_requested_at = now()` + `accounts.deletion_scheduled_at = now() + interval '30 days'` + RPC 触发所有设备 Realtime `account_deleted` → Web 端立刻登出;**`deletion_scheduled_at` 到期后硬删生产数据**;主 PRD FR-AC-04 |
| FR-WEB-120b | 备份保留窗口公开 | P0 | 隐私页明确写:"账号删除请求后,生产数据保留 30 天(`deletion_scheduled_at` 到期硬删);数据库备份额外保留 90 天(2026-12 当前 Supabase backup retention,待 §12 待办 #6 核实);备份在 30 天后无法被人工取出,仅用于灾难恢复" |
| FR-WEB-121 | 撤销删除 | P0 | `deletion_scheduled_at` 到期前重新登录可看到"账号待删除(剩余 X 天),点击恢复"卡;调 `account_undelete()` RPC 清 `deletion_requested_at` + `deletion_scheduled_at` |
| FR-WEB-122 | Cookie / 同意横幅 | P0 | (a) 必要 cookie / 存储(Auth、device_id、user_prefs)**始终允许**,banner 仅声明;(b) Sentry 错误上报、PWA 安装计数 **可选**,默认 off;(c) banner 在 EU/UK/CH IP 强显,其他地区在 footer 提供 link;(d) 选择存 IndexedDB `consent`,可随时撤回 |
| FR-WEB-122b | DSR 处理 SLA | P0 | 数据导出 / 删除 / 更正请求(DSR):用户自助(导出 + 删除)立即可执行;邮件请求 `privacy@xai-desktop.app` 自动回复 + 30 天内人工答复;Web 端通用入口在 `/legal/privacy` 下方 |
| FR-WEB-122c | 营销 / 分析 consent 分离 | P0 | 当前 v1 **不接营销分析**;若 Phase 5+ 接 Plausible / GA,必须独立 consent toggle + 默认 off + 可撤回 |
| FR-WEB-123 | 隐私政策 + 服务条款 | P0 | `/legal/privacy`、`/legal/terms`;footer + 注册页 + 设置 link;zh-CN / zh-TW / en 三语;privacy 页必含:子处理者清单(§5.18.4)、DSR 联系方式、数据保留期、跨境传输(SCC)、年龄门槛 |
| FR-WEB-123b | 年龄门槛 | P0 | 注册时勾选"我已年满 13 岁(或当地法定数字同意年龄)";EU 用户 16 岁;UK 13 岁;US COPPA 13 岁;勾选写入 `accounts.age_consent_at`;false 直接拒注册 |
| FR-WEB-123c | DPA / SCC | P0 | 隐私页放下载:Anthropic GDPR DPA 模板改的"独立开发者版"DPA;跨境传输用 EU Standard Contractual Clauses(SCC)2021 版;Supabase 已签子处理者 DPA(链接) |

#### 5.18.4 子处理者清单(隐私页须列)

| 子处理者 | 数据 | 区域 | DPA |
|---|---|---|---|
| Supabase (Singapore / EU) | Auth / encrypted blobs / Realtime metadata | 用户首次注册所在区(默认 EU 或 AP) | https://supabase.com/legal/dpa |
| Vercel (Frankfurt / Hong Kong edge) | 静态资源 / edge logs(IP / UA,30 天)| 全球 | https://vercel.com/legal/dpa |
| Cloudflare(若启用 备选 / DDoS) | 静态资源 / edge logs(IP,7 天)| 全球 | https://www.cloudflare.com/cloudflare-customer-dpa/ |
| Sentry (Frankfurt / US) | 错误堆栈 / breadcrumb(已 redact 用户内容)| 默认 EU | https://sentry.io/legal/dpa/ |
| Resend / Postmark(邮件,Phase 5)| 用户邮箱、邮件 metadata | EU | 上线前签 |

> 子处理者新增/变更必须在隐私页公示 30 天后生效;原有用户邮件通知。

---

## 6. 非功能需求(Web 特化)

### 6.1 性能预算
见 §5.9。

### 6.2 兼容性矩阵
见 §5.11。

### 6.3 部署 SLA(冷启动期 v1 GA 第 1 个月内)

| 指标 | 目标 | 监测 |
|---|---|---|
| 月可用率(Web 前端) | ≥ 99.5% | Vercel/CF 自带 + 第三方 ping |
| 月可用率(Supabase) | ≥ 99.5%(依托上游) | Supabase status page + 自检 |
| TTFB(landing page,US/EU/AP P95) | < 800ms | Vercel/CF analytics |
| 部署 → 全网生效 | < 5min | CDN purge 验证 |
| 回滚耗时 | < 10min | Vercel/CF 一键回滚 |

### 6.4 可访问性

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-124 | WCAG 2.1 AA | P0 | Lighthouse Accessibility ≥ 90;关键交互 aria-label;颜色对比度 ≥ 4.5:1 |
| FR-WEB-125 | 键盘全可用 | P0 | 无鼠标可完成:登录 → 切模块 → 加 Todo → 完成 Todo;Tab 顺序合理;focus ring 显示 |
| FR-WEB-126 | reduced motion | P0 | `@media (prefers-reduced-motion: reduce)` 关动画 |

---

## 7. 技术架构

### 7.1 部署架构图

```
                  ┌────────────────────┐
                  │      用户浏览器       │
                  │  Chrome/Safari/...  │
                  └─────────┬──────────┘
                            │ HTTPS
              ┌─────────────┴────────────────┐
              │ Vercel / Cloudflare Pages CDN│
              │   (静态托管 Vite SPA build)   │
              └────┬───────────────────┬─────┘
                   │ HTML/JS/CSS       │ 缓存命中
                   ▼                   ▼
            apps/web (Vite SPA)
              ┌──────────────────────┐
              │   Host(apps/web/src) │
              │  Router + Providers  │
              ├──────────────────────┤
              │     plugin-* 复用    │
              │  (console/productivity│
              │   /project/labels/   │
              │   calendar/account)  │
              ├──────────────────────┤
              │  core-data            │
              │  (driver-sync-blob)   │
              │  core-events (BC+RT)  │
              │  core-i18n / ui       │
              └────┬──────────┬───────┘
       HTTPS /sync│          │WSS Realtime
                  ▼          ▼
         ┌──────────────────────────────────┐
         │   Supabase 项目(单一后端)        │
         │  - Auth(邮箱/Apple/Google PKCE) │
         │  - PostgREST(accounts/devices/  │
         │    app_sessions/sync_events/    │
         │    encrypted_blobs/audit_logs)  │
         │  - Realtime(sync:<acct> meta)   │
         │  - Storage(avatars only;        │
         │    exports are client-side)     │
         │  - Postgres(主 §8 + Sync 增量)  │
         └──────────────────────────────────┘
                       ▲
                       │ 同账号同后端
                       ▼
         ┌──────────────────────────────┐
         │  桌面 App(Tauri,SQLite +    │
         │  同步层走 sub-prds/sync)     │
         └──────────────────────────────┘
```

### 7.2 仓库结构新增

```
apps/web/                     ★ 新增(Phase 4.5)
├── package.json              # "name": "@repo/web"
├── vite.config.ts
├── tsconfig.json
├── public/
│   ├── manifest.webmanifest
│   ├── sw.js                 # Service Worker(workbox 生成)
│   ├── robots.txt
│   └── sitemap.xml
├── index.html
└── src/
    ├── main.tsx              # plugin register 静态 imports + Router
    ├── providers/            # AuthProvider / DataProvider(REST) / RealtimeProvider
    ├── routes/               # Router 配置
    ├── pages/                # /, /auth/*, landing
    ├── service-worker/       # SW 源(workbox-window)
    └── styles/               # 全局 CSS(走 CSS variables 同桌面)

packages/core-data/
└── src/
    ├── driver-sqlite/        # 桌面 driver(已存在)
    ├── driver-sync-blob/     ★ 新增(/sync/push + /sync/pull + Realtime metadata)
    └── driver-testing/

packages/core-events/
└── src/
    ├── tauri-bus.ts          # 桌面
    ├── web-bus.ts            ★ 新增(BroadcastChannel + Realtime 桥)
    └── testing.ts
```

### 7.3 平台无关性约束(继承 ADR-0003,并受 ADR-0006 收窄)

- Plugin 业务代码 0 import `@tauri-apps/api`;所有跨平台能力通过 `@repo/core-*` 注入
- Plugin 在 Web build 中失活的部分(剪贴板监听 / 桌宠浮窗)通过 manifest `windows.web = false` 静态剔除,不进 bundle
- 测试:`apps/web` 构建本身做 plugin 体检 — 若 plugin 误引 tauri 包,Vite build fail

---

## 8. 数据模型

### 8.1 后端 schema

> v0.3 codex C6 修正:上一版"不增表"与 §5.1.3 新建 devices/sessions、§5.2.1.b 新建 encrypted_blobs / sync_events 矛盾。改写如下。

继承主 PRD §8 的账号 / 子任务等基础表,但 Web 端依赖的同步与设备模型**需要 Sync 子 PRD 归口新增以下表**(本档列契约,实施在 Sync 子 PRD):

| 表 | 用途 | 由谁建 |
|---|---|---|
| `devices` | app 自有设备注册(§5.1.3) | Sync 子 PRD |
| `app_sessions` | app-level session lease(§5.1.3;**不含** refresh token hash) | Sync 子 PRD |
| `encrypted_blobs` | 所有业务实体(包含 account_settings 等)整 row 加密(§5.2.1.b) | Sync 子 PRD |
| `sync_events` | per-account WAL,Realtime 与 pull 都基于(§5.2.1.b) | Sync 子 PRD |
| `audit_logs` | 导出/删除/扩展 capture 等敏感操作的审计 | Sync 子 PRD |

主 PRD §8 中原有的业务表(`todos`、`lists`、`labels`、`boards` 等)**仅作为客户端的逻辑模型存在,服务端不实体化为表**;它们通过 `encrypted_blobs.entity_type` 区分,服务端零知识。`accounts` 表保留明文(email / plan / age_consent_at / deletion_scheduled_at / deletion_requested_at)。

### 8.2 IndexedDB Object Store 设计(`xai-cache` 数据库)

> v0.3 codex C4/C5 重写:删 `query_cache.data plaintext`、删 `entity_index.fts/sortKeys plaintext`;新增 `entity_blobs`(at-rest encrypted 原件)+ `entity_index` 持久部分仅非敏感 metadata + `entity_sort_keys` 加密敏感 sort key;FTS 内存 only,不持久。

| Object Store | key | value | 加密 at-rest? | 备注 |
|---|---|---|---|---|
| `auth_tokens` | `account_id` | `{ ciphertext, nonce, expiresAt }` | ✅ AES-GCM(wrap_key) | Supabase 自定义 storage;wrap_key 由 `auth_keys` 持有 |
| `auth_keys` | `'wrap_key'` | non-extractable `CryptoKey` | — | Web Crypto 非 extractable handle;直接 `put` 进 IDB 由浏览器管理;JS 不可导出明文 |
| `device` | `'self'` | `{ device_id, created_at }` | — | 注销不清,登出再登保持同 device_id |
| `entity_blobs` | `[entity_type, entity_id]` | `{ entity_type, entity_id, version, encrypted_blob, blob_nonce, blob_aad, server_updated_at, deleted }` | ✅(blob 本身已用 DEK 加密)| **v0.3 新增**;所有业务实体原件;离线浏览/冲突 diff/重建索引都靠它 |
| `entity_index` | `[entity_type, entity_id]` | `{ entity_id, entity_type, version, server_updated_at, deleted, has_decrypted }` | — | 持久仅非敏感 metadata;not encrypted 因为内容本就不敏感 |
| `entity_sort_keys` | `[entity_type, entity_id]` | `{ sort_keys_ciphertext, nonce }` | ✅ AES-GCM(派生 index key from DEK) | **v0.3 新增**;敏感 sort key(due_at / completed_at / parent_id / label_ids)用 DEK 派生 index key 加密 |
| `pending_mutations` | autoIncrement id | `{ mutation_id, idempotency_key, entity_type, entity_id, op, base_version, encrypted_blob, blob_nonce, blob_aad, base_encrypted_snapshot, created_at, retry_count }` | ✅(blob 已加密) | 离线加密 mutation 队列;**永不存明文** |
| `dead_letter_mutations` | autoIncrement id | 同上 + `{ last_error, gave_up_at }` | ✅ | 重试 3 次失败 |
| `encrypted_dek` | `account_id` | `{ encryptedDek, salt, kdfParams, createdAt }` | ✅(已被 KEK 加密) | 与服务端镜像;加速登录后解密 |
| `user_prefs` | `account_id` | `{ theme, sidebarCollapsed, lastModule, notificationPrefs, web_intro_seen }` | — | **仅 device-local 设置**(§5.6.1)|
| `consent` | `'gdpr'` | `{ sentry: bool, analytics: bool, decided_at }` | — | GDPR 同意 |
| `pwa_install` | `'state'` | `{ event_count, last_prompt_at, dismissed_at }` | — | 安装提示策略(§5.7.1) |
| `sync_state` | `'cursor'` | `{ last_seen_seq, last_pulled_at }` | — | per-account WAL cursor |
| `audit_local` | autoIncrement id | `{ event, at, meta }` | — | 本地行为日志(无 entity_id / 用户内容) |
| `meta` | string key | any | — | schema version 等 |

**FTS 明文索引(非 IndexedDB)**:Web Worker 内 `flexsearch.Index` 实例,DEK 解锁期间在内存建索引;主密码 lock / 5min idle / 关页 → Worker `index.clear() + terminate()`;**绝不持久**到 IndexedDB。

**at-rest 总原则**:任何"由用户内容派生的 IndexedDB 物件"必须加密或锁定时 wipe。每条记录加 `version` 字段;`xai-cache` 数据库本身有 `version` 升级时迁移(`onupgradeneeded` 迁移函数);不兼容时丢弃并重新拉(走 §5.6.3 FR-WEB-53)。

---

## 9. 部署管线

### 9.1 环境分层

| 环境 | URL | 部署触发 | 数据库 |
|---|---|---|---|
| `dev` | localhost:5173(Vite) | 本地 `pnpm --filter @repo/web dev` | Supabase local 或共享 dev 项目 |
| `staging` | `staging.app.xai-desktop.app` | push 到 `main` 分支自动 | 独立 Supabase staging project |
| `prod` | `app.xai-desktop.app` | 打 `web-v*` tag 后手工 promote | Supabase prod project |

### 9.2 平台选型

| 候选 | 优 | 劣 | 决策 |
|---|---|---|---|
| **Vercel** | DX 顶 / Edge fn / SPA 友好 | 中国大陆访问慢 / 流量贵 | 主选 |
| **Cloudflare Pages** | 全球 / 便宜 / DDoS 防护 | Edge fn 限制多 | 备选 + 视访问情况切 |
| Netlify | 类似 Vercel | 国内访问差 | 不选 |

> v1 GA 用 Vercel;若中国大陆访问指标差,Phase 5+ 切 Cloudflare Pages 或加镜像。

### 9.3 CI/CD

```
GitHub Actions:
  trigger: push to main / PR
  jobs:
    - lint + typecheck + vitest (apps/web + 复用 plugins)
    - playwright (chromium + webkit + firefox)
    - lighthouse-ci(performance/a11y/best-practices/seo gates)
    - vite build (assert bundle size)
    - PR 时部署 preview(Vercel 自带)
    - main merge 时部署 staging
  trigger: tag web-v*
  jobs:
    - 上面全部
    - sentry-cli releases + upload-sourcemaps
    - 人工 approve → promote staging → prod
```

### 9.4 回滚 + SW / DB 版本契约

> v0.2 重写:回滚不能被 stale SW 卡死;DB migration 必须 backward-compatible 至少一版(review Major)。

#### 9.4.1 SW 版本契约

| 项 | 约定 |
|---|---|
| precache revision | 绑 `import.meta.env.VITE_GIT_SHA`,SW 文件名 `sw-<short-sha>.js`(便于 CDN 缓存 + 强制更新) |
| HTML | `Cache-Control: no-store`(或 `max-age=0, must-revalidate`)— 永远从 CDN 拉最新 |
| 静态资源(JS/CSS/font/img) | 文件名带 hash + `Cache-Control: public, max-age=31536000, immutable` |
| 激活提示时机 | 必须在**空闲态**(无 in-flight mutation + 无打开 modal + 用户最近 30s 无输入)弹"刷新"banner;**不强制刷新** |
| 紧急 kill switch | (a) 发布 `/sw-kill.js`(空 SW + `self.registration.unregister()`);(b) Vercel/CF edge function 可临时发 `Clear-Site-Data: cache, cookies, storage` header 强清;(c) 用户可走 `/?reset=1` 触发本地清并重装 SW |
| skip-waiting 策略 | 用户点 banner → `postMessage({ type: 'SKIP_WAITING' })` → 新 SW `skipWaiting()` → 再 reload;不要自动 skip-waiting(避免 in-flight mutation 丢失) |
| update check | 每次路由切换时调一次 `registration.update()`(SW 已缓存,头开销小)|

#### 9.4.2 DB / API migration 契约

| 项 | 约定 |
|---|---|
| Backward-compatible | 任何 schema migration **必须**在 N-1 版客户端上可读可写(至少保留一版);破坏性变更走两步:N → N.5(双写双读)→ N+1 |
| `X-Sync-Version` 协商 | 服务端识别 client 版本;不兼容时 426 Upgrade Required + 客户端弹强刷 |
| 公告窗口 | breaking change 提前 7 天在 status page 公告;Sentry release tag 标 `db-migration: 2026-06-xx` |
| 回滚演练 | staging 上每月演练 schema rollback;rollback playbook 存 `docs/runbooks/migration-rollback.md` |

#### 9.4.3 FR 表

| 情况 | 操作 | 耗时 | 验证 |
|---|---|---|---|
| 前端 bug | Vercel/CF dashboard 一键 rollback 到上一 deployment | < 5min | Sentry 错误率回落 + 手工冒烟 |
| SW 缓存了坏版本 | 发 `/sw-kill.js` 或 `Clear-Site-Data` header;紧急时通知用户访问 `/?reset=1` | < 30min | uptime 检测 + 客服 ticket |
| DB schema 不兼容(回滚到 N-1)| Supabase migration rollback(月度演练过的步骤);因为有 N-1 兼容约定,**客户端不需要回滚**也可正常工作 | < 30min | 抽样 client 验证 |
| API breaking(罕见)| `X-Sync-Version` 协商 + 后端并行维护 2 版至少 90 天 | — | 监控 client version 分布 |

### 9.5 监控

| 项 | 工具 |
|---|---|
| 前端错误 | Sentry |
| Web Vitals | Sentry transactions + Vercel Analytics |
| 后端 Postgres / 函数 | Supabase Dashboard |
| 域名 / 证书 | Vercel/CF 自动 + 每月手查 |
| Uptime | UptimeRobot 或类似(免费层) |

---

## 10. 验收清单

### 10.1 M5 公测前(2026-11-24 对齐主 PRD)

- [ ] 注册 + 三种登录方式全部跑通(邮箱、Apple PKCE、Google PKCE,含 Apple private relay 兜底)
- [ ] 桌面 ↔ Web 双向同步 5s 内可见(真机 + 浏览器并排;metadata-only payload + pull trigger)
- [ ] 离线 + 加密字段写入流程:DEK 在内存 → 加密入队 ✅;DEK 不在 → 拒绝写并提示 ✅
- [ ] 离线编辑队列 20 条以内恢复连接 30s 内全部 push;dead-letter 走通(模拟 4 次失败)
- [ ] 冲突 UI:三方 diff(base / local / remote)可展示并允许选择保留方
- [ ] Lighthouse landing Perf ≥ 90;`/app/todos`(50 条 fixture)Perf ≥ 80;A11y ≥ 90
- [ ] Web Vitals(LCP/INP/CLS)RUM 上报正常,按 route_group 分桶
- [ ] Chrome / Edge / Firefox / WebKit Playwright 全 green
- [ ] 真机:iPhone Safari + macOS Safari + Android Chrome 走通核心 flow
- [ ] Sentry 配好:source map 可解 + `beforeSend` 单测断言 redact + release tag 正确
- [ ] CSP Report-Only 1 周 zero violation → enforce;securityheaders.com A+
- [ ] 主密码 challenge → Argon2id KEK → DEK → E2E 字段读写正常;5min idle 清 KEK 验证
- [ ] 多设备管理:device_register / heartbeat / revoke / revoke_others 全跑通;被撤销设备 Realtime 立即登出
- [ ] 移动浏览器(iPhone Safari + Chrome Android)只读 + 完成 Todo + 加 Todo 可用;无 maximum-scale 限制,可双指缩放
- [ ] 数据导出:浏览器端本地解密 + 打包 + 下载;服务端不接触明文(网络面板验证)
- [ ] 账号删除:30 天恢复窗口正常,Realtime `account_deleted` 触发各设备登出

### 10.2 M6 GA(2026-12-22 对齐主 PRD)

- [ ] PWA 可安装(Chrome / Edge 按 §5.7.1 策略弹安装,3 次操作 + 无桌面 App)
- [ ] iOS Safari A2HS 启动 standalone 正常
- [ ] 找回密码邮件 deliverability 验证(SPF/DKIM/DMARC)
- [ ] 隐私政策 + 服务条款 + 子处理者清单 zh-CN/zh-TW/en 三语完;DPA / SCC 模板可下载
- [ ] 真实负载测试:同一账号 5 个 Web 标签 + 1 桌面 不互相干扰(leader 选举正常)
- [ ] 30 分钟挂线后重连无数据丢失(cursor gap 检测正常)
- [ ] WS 被代理禁后降级 polling 正常工作
- [ ] staging → prod 演练 SW 紧急 kill switch + DB schema rollback 各 1 次
- [ ] CSP enforce 后 1 周 zero violation

---

## 11. 风险与缓解(Web 特有)

| ID | 风险 | 等级 | 缓解 | 监控 |
|---|---|---|---|---|
| RW-01 | **浏览器存储被用户/浏览器清** → IndexedDB 丢失导致 token/缓存全无 | 🟡 中 | token 自定义 storage 加密落 IndexedDB,被清后强制重登;`encrypted_dek` 服务端有镜像;`navigator.storage.persist()` 主动请求 | FR-WEB-53/78b |
| RW-02 | **Service Worker bug 导致 stale 资源** → 用户卡老版本 | 🟡 中 | HTML no-store + immutable assets + precache 绑 git SHA;紧急 kill switch:`/sw-kill.js` / `Clear-Site-Data` header / `/?reset=1` | §9.4.1 |
| RW-03 | **Safari ITP / 第三方 cookie 限制** → OAuth 回调失败 | 🟡 中 | PKCE flow 无第三方 cookie 依赖;`state`+`code_verifier` 同源 sessionStorage;Playwright WebKit + 真 macOS Safari 验证 | §5.11 真机矩阵 |
| RW-04 | **CSP 误配置全站坏** | 🟡 中 | Report-Only 1 周 → enforce(§5.12.2);Sentry 接 violation;edge function 可一键切回 Report-Only | FR-WEB-82/82b |
| RW-05 | **Supabase Realtime 配额超限** → 大量用户 WS 连接挤崩 | 🟡 中 | 多标签共享 channel(FR-WEB-37);WS 失败降级 polling(FR-WEB-34b);后期可加 connection pooling 或自建 Realtime | FR-WEB-37 / Supabase 监控 |
| RW-06 | **主密码忘 → 数据不可恢复** | 🔴 高 | 注册时强制助记词导出(主 PRD §2.1.1);UI 多处提示"主密码 ≠ 账号密码";首次启用 E2E 时强制走助记词向导 | 用户支持 inbox |
| RW-07 | **`.app` HSTS preload 后无法降级 HTTP** → 证书故障即全站 down | 🟡 中 | 多家 CA 备份 + Vercel/CF 自动续;域名证书监控告警 | Uptime + 证书过期告警 |
| RW-08 | **国内访问慢/被墙** | 🟡 中 | v1 GA 先用 Vercel,监测中国大陆 P95;若 > 5s 启动 Plan B 切 CF Pages 或加镜像 | RUM 数据 |
| RW-09 | **冲突 UI 没有足够材料展示 diff** | 🟡 中 | 队列存 `base_encrypted_snapshot`,服务端 409 返回 `remote_encrypted_blob` → 客户端三方 diff;dead-letter 兜底 | FR-WEB-43 |
| RW-10 | **Sentry 误上报用户内容** | 🔴 高 | `beforeSend` 强 redact + 写测试断言 + code review checklist;token 在 Web Storage 后此风险更高 | FR-WEB-94 |
| RW-11 | **PWA 安装后行为分歧** | 🟢 低 | standalone 与 tab 模式行为一致,不做独立功能 | FR-WEB-60b |
| RW-12 | **浏览器扩展未来加入时 auth 模型变更** | 🟢 低 | v1 不接 extension;P2 走独立 OAuth client + scope 限制 + 固定 ID allowlist(§5.15)|FR-WEB-103~105 |
| RW-13 | **(v0.2 新增)Web Storage token 被 XSS 直读** | 🔴 高 | 严格 CSP `script-src 'self'` 无 unsafe-inline / 无 CDN + SRI + react-markdown sanitize + ESLint no-danger + pnpm audit + Dependabot + Sentry redact + 短 TTL access token;承担代价的前提是上述全栈到位;若任一项失守需考虑切 BFF | FR-WEB-90/91 + CSP report |
| RW-14 | **(v0.2 新增)WS 被企业代理禁** → 实时同步全无 | 🟡 中 | §5.3 polling 降级 + UI 显式告知"实时降级为轮询" | FR-WEB-34b |
| RW-15 | **(v0.2 新增)mutation 重复 / 顺序错乱** | 🟡 中 | `mutation_id`(uuid v7)+ `idempotency_key`(server 24h 去重)+ `base_version`(If-Match);dead-letter 兜底 | FR-WEB-24/24c |
| RW-16 | **(v0.2 新增)Console 与 Web 设置漂移** | 🟢 低 | §5.6.1 显式 device-local vs account-global 映射;Console settings 表只装 account-global | §5.6.1 |
| RW-17 | **(v0.2 新增)Sync 子 PRD 未及时出 share envelope** → FR-WEB-65 P1 阻塞 | 🟢 低 | Share 链接降到 v1 不实现;P1 触发条件清晰(envelope 协议提交) | §12 待办 |
| RW-18 | **(v0.2 新增)devices/sessions 表迁移依赖** → Sync 子 PRD 须配合新增 | 🟡 中 | §5.1.3 给出 schema 初稿 + 4 个 RPC 名;Phase 4.5 启动前 Sync 子 PRD 必须确认这部分 | §12 待办 |

---

## 12. 待办

- [ ] Console 子 PRD 提交后,本档 §4 复用表 + §4.2 host interface 二次对齐
- [ ] **(v0.3 强升)Console 子 PRD `console.theme` 字段从同步项改为 device-local**(§5.6.1);若 Console PRD 不改,以本档为准并在 Console PRD 标 deprecated
- [ ] Sync 子 PRD 提交后,本档 §5.2 / §5.3 / §5.4 的端点 / payload / 冲突描述精确对齐(本档 v0.2 给的 envelope 是初稿)
- [ ] **(v0.3 新增)Sync 子 PRD 必须建 `sync_events(account_id, seq BIGINT)` per-account WAL 表;Realtime payload 必带 `seq`**;本档 §5.2.1.b 给的是初稿
- [ ] **(v0.3 新增)Sync 子 PRD 把 `account_settings` 改成 `encrypted_blobs` 的一种 `entity_type='account_settings'`**(零知识硬规则,不留明文 settings 表)
- [ ] Sync 子 PRD 必须包含 share envelope 协议(per-entity share key + URL fragment + encrypted share blob);Web 子 PRD P1 引用
- [ ] **(v0.3 修订)Sync 子 PRD 新增 `devices` + `app_sessions` 表(不含 refresh_token_hash)+ 5 个 RPC**(`device_register` / `device_heartbeat` / `device_revoke` / `revoke_others_rpc` / `device_list_rpc`);**所有业务 API middleware 必须强制校验 `X-Device-Id`**;本档 §5.1.3 给的 schema 是初稿
- [ ] **(v0.3 新增)Sync 子 PRD Quick Capture 协议定稿**:扩展专用临时 DEK 下发 RPC `/sync/extension/keys`(7 天滚动 + 用户授权刷新)+ envelope 写入
- [ ] **(v0.3 新增)Sync 子 PRD 与本档对齐 mutation envelope 的 `blob_aad` 字段语义**(必须含 entity_id || version 防 replay,server 必须 verify)
- [ ] **(v0.3 新增)CSP `/__csp_report` 自建端点的 Vercel/CF edge function 实现**(scrub 规则 + `csp_violations` 表)
- [ ] 主密码 challenge 的具体 UX 文案与控制台一致(等 plugin-account 设计稿)
- [ ] Sentry DSN 与桌面共用 vs 拆 — Phase 4.5 启动时与运维一起决策
- [ ] 中国大陆访问性 PoC(Vercel / CF Pages 两家各跑 1 周拿数据)— Phase 4.5 第 1 周
- [ ] 确认 Supabase backup retention 实际窗口(本档 §5.18.3 写 90 天为占位,需查 Supabase 当前条款)
- [ ] 本地 FTS 库选型(`flexsearch` vs `lunr` vs `minisearch`)— Phase 4.5 Week 2 做基准 + Worker 内 FTS index 重建 P95 基准
- [ ] Argon2id WASM 参数标定(memoryCost / iterations)真机 P95 < 1.5s(低端 iPhone SE)
- [ ] **(v0.3 新增)low-end Safari/iOS 全量 hydrate 大账号(模拟 50k entities)的可用性测**:lazy hydrate 优先模块何时可用,IndexedDB 加密 sort key 写入吞吐

---

## 13. 文档变更记录

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-05-14 | v0.1 (DRAFT) | 首版,主 PRD §5.15 的 FR-WEB-01~07 扩到 FR-WEB-08~126(共 119 条新增),按 §5.1~5.18 18 节组织 |
| 2026-05-16 | v0.2 (DRAFT) | 按外部审查意见重写 5 处 Critical + 12 处 Major(详见 §0.1 基础契约表):(1) Auth 从 HttpOnly cookie 改 SPA + 自定义 storage + PKCE flow(用户拍板);(2) REST driver 重写为 Sync push/pull encrypted blob,删除直连 PostgREST 业务表;(3) Realtime 改 metadata-only payload + pull trigger;(4) 离线 E2E 队列必须加密前入队,删除"plaintext + flag 联网再加密";(5) GDPR 导出改浏览器端打包,服务端零知识;(6) 多设备登出自建 devices/sessions 表 + 4 个 RPC;(7) Share 链接降到 P1 等 envelope 协议(用户拍板);(8) CSP 补完整 + Report-Only 灰度;(9) Sentry sourcemap CI 详细化;(10) viewport 删 maximum-scale=1 修 WCAG 冲突;(11) 浏览器矩阵分 CI + 真机两层;(12) FID 改 INP,按 route_group 分预算;(13) PWA 安装提示策略;(14) Quick Capture 改 capture.create + scope 限制 + extension ID allowlist;(15) §4.2 新增 Console host interface 注入桩契约;(16) §5.6.1 新增 device-local vs account-global 设置映射;(17) §8.2 IndexedDB Object Store 全面重设;(18) §9.4 SW + DB migration 版本契约;(19) FR 数从 126 增至约 145 |
| 2026-05-16 | v0.3 (DRAFT) | 按第二轮 codex 复审修 7 Critical + 11 Major + 5 Minor + 复查点:(C1) §5.1.1 Token at-rest 加密改自洽方案 + 显式威胁模型表("磁盘取证防护,不防同源 XSS";wrap_key non-extractable CryptoKey 持久 IndexedDB,关浏览器 unwrap 恢复);(C2) §5.1.2 / §5.1.3 新增 FR-WEB-17e:**所有业务 API 强制校验 `X-Device-Id` header**;远程撤销后离线设备拿 Supabase token 也能换 access token,但所有 `/sync/*` + RPC 服务端返 403 `device_revoked`;(C3) 删除 `sessions.refresh_token_hash`,改 `app_sessions`(app-level lease,不存 refresh token);明确边界"不撤销 Supabase Auth refresh token";(C4) IndexedDB 删 `query_cache.data plaintext` + 删 `entity_index.fts/sortKeys plaintext`;新增 `entity_sort_keys`(DEK 派生 index key 加密);FTS 改 Worker 内存 only,lock/idle wipe;(C5) 新增 `entity_blobs` Object Store(at-rest encrypted 原件);所有明文视图从它派生;(C6) §8.1 改写"继承主 schema + Sync 增量新表"(devices/app_sessions/encrypted_blobs/sync_events/audit_logs);(C7) Sync cursor 数据模型:Sync 子 PRD 必须建 `sync_events(account_id, seq BIGINT)` per-account WAL;Realtime payload 带 `seq`;`/sync/pull` 用 `since_seq`;(M-A) 服务端 `/sync/pull` 强制分页 `since_seq+limit≤500`,按模块 lazy hydrate;(M-B) `account_settings` 改 encrypted_blob;**离线非加密字段直写路径删除**(零知识硬规则);(M-C) Sentry redact 删 entity_id 改短 hash;CSP report 改自建 `/__csp_report` 同源端点;sourcemap CI 顺序:build→inject→upload→delete→deploy;(M-D) 架构图改 driver-sync-blob / Storage(avatars only) / Realtime(meta);Quick Capture 示例改 envelope;SW `Clear-Site-Data` 默认仅 cache(P0/P1 事故才清 storage);主密码 zeroize 改 `Uint8Array.fill(0)` best-effort + JS limit 声明;`accounts.deleted_at` → `deletion_scheduled_at` + `deletion_requested_at`;(Minor) §4 表主题改 IndexedDB;i18n 登录后 account-global;`next` 白名单删 `/share/`;`persisted()` 用法 + sentinel 兜底;FR-WEB-79b PWA Storage partition 升 P0 |

— END —
