# Web 子 PRD — XAI_Desktop 网页版

| 字段 | 值 |
|---|---|
| 父 PRD | `docs/planning/2026-05-12-PRD-v1.md`(主 PRD §5.15) |
| 范围 | 网页版的浏览器特有规格(控制台 UI 复用 `sub-prds/console/PRD.md`) |
| 归属 Phase | Phase 4.5(4-6 周) |
| 文档作者 | Claude(subagent) |
| 创建日期 | 2026-05-14 |
| 状态 | DRAFT |

---

## 0. 文档定位

本文档 **只覆盖浏览器特有的内容**。控制台 UI(三栏布局 / 各模块视图 / 键盘流 / 主题 / 设置 / 全局搜索 / sidebar 导航)全部继承自 `sub-prds/console/PRD.md`,本档不重复。

**心智模型一句话**:网页版 = 控制台子 PRD 的 React 组件树 + 浏览器壳 + REST data driver + 浏览器特有的运行约束(认证 / 缓存 / 实时同步 / 离线 / 部署)。

本档与其他子 PRD 的边界:

| 内容 | 谁负责 |
|---|---|
| 三栏布局 / sidebar 导航 / 模块视图 / 键盘流 / 主题 | `sub-prds/console/PRD.md` |
| 端到端加密协议本身 / DEK 派生 / 服务端零知识保证 | 主 PRD §5.9 + `TECHNICAL_REQUIREMENTS.md §2` |
| REST 端点契约 / 同步语义 / 冲突解决 | `sub-prds/sync/PRD.md`(并行起草中) |
| 浏览器端的认证 UI / 数据 driver / 离线 / 部署 / 响应式 / 兼容性 | 本档 |

> 控制台子 PRD 尚未提交时,本档对其行为的引用以主 PRD §5.13 + ADR-0003 为准,后续以控制台子 PRD 为最终源。

---

## 1. 产品定位

### 1.1 角色

网页版是 XAI_Desktop 的"第三个面"(见 ADR-0003):桌面 overlay + 整体控制台 + 网页版三者**共享同一套 plugin 业务层与同一套后端数据**,差异只在宿主壳与数据 driver。

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
| `/app/projects` | 项目管理(看板列表) | 必须登录 |
| `/app/projects/:boardId` | 看板视图 | 必须登录 |
| `/app/projects/:boardId/cards/:cardId` | 卡片 detail | 必须登录 |
| `/app/calendar` | 桌面日历(网页版) | 必须登录 |
| `/app/habits` | 习惯模块 | 必须登录 |
| `/app/habits/:habitId` | 习惯详情 | 必须登录 |
| `/app/pomodoro` | 番茄统计 | 必须登录 |
| `/app/labels` | Label 管理 | 必须登录 |
| `/app/search?q=...` | 全局搜索结果 | 必须登录 |
| `/app/settings/*` | 设置(账号 / 外观 / 隐私 / 同步 / 已连接设备) | 必须登录 |
| `/share/:token` | 共享链接(P1,见 §5.18) | 公开(token 鉴权) |
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
| **主题(深色/浅色/跟随系统)** | 控制台子 PRD 定义 | 复用 + 持久化走 localStorage(非 SQLite) |
| **数据访问** | `core-data` SQLite driver | `core-data` REST driver(本档 §5.2) |
| **跨窗口事件总线** | Tauri event | `BroadcastChannel`(同源跨标签)+ Supabase Realtime(跨设备)(本档 §5.3) |
| **认证持久化** | macOS Keychain | `httpOnly` Secure SameSite=Lax cookie + Supabase SDK 内置(本档 §5.1) |
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

- 浏览器端账号 + OAuth 回调路由
- REST data driver + 缓存层
- 实时同步(Supabase Realtime)
- 离线模式 + 编辑队列
- 响应式断点 + 移动端只读
- PWA(P1)
- SEO + landing page
- 域名 / CDN / 部署管线
- 跨标签会话同步 / 多设备登出
- GDPR 数据导出 / 账号删除的浏览器端 UI

---

## 5. 功能需求

> FR-WEB-01 ~ 07 已在主 PRD §5.15 定义,本档承接 FR-WEB-08 起。每个 FR 标注优先级(P0 = v1 GA 必须;P1 = v1 GA 后第一个迭代;P2 = 评估,可推迟到 v1.1+)。

### 5.1 浏览器端 Auth

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-08 | 邮箱+密码注册 | P0 | 表单含 email、password(≥8 位,含字母+数字)、二次确认;提交走 `supabase.auth.signUp`;失败显示后端 `error.code` 的人类可读文案(已 i18n) |
| FR-WEB-09 | 邮箱验证 | P0 | 注册后弹"已发送验证邮件"卡;`/auth/verify` 落地页解析 token、调 `supabase.auth.verifyOtp`,成功后跳 `/app/todos` |
| FR-WEB-10 | 邮箱+密码登录 | P0 | 失败计数 ≥ 5 次/15 分钟触发 Supabase 默认风控(无需自实现);成功后写会话 cookie 并跳目标页 |
| FR-WEB-11 | Sign in with Apple | P0 | 走 Supabase OAuth provider;回调走 `/auth/callback?provider=apple`;首次登录需补邮箱 |
| FR-WEB-12 | Google OAuth | P0 | 同上,provider=google |
| FR-WEB-13 | 找回密码 | P0 | `/auth/forgot` 发重置邮件;邮件 link 落 `/auth/reset?token=...`;新密码强度同 FR-WEB-08 |
| FR-WEB-14 | 会话持久化 | P0 | Supabase JS SDK 默认 `persistSession: true`,access token + refresh token 走 Secure SameSite=Lax cookie;关浏览器再开仍登录 |
| FR-WEB-15 | 跨标签会话同步 | P0 | 标签 A 登出 → 标签 B 10s 内自动跳 `/auth/login`;实现走 `BroadcastChannel('auth')` + Supabase SDK 的 `onAuthStateChange` |
| FR-WEB-16 | 注销 | P0 | 设置 → 注销 / sidebar 头像菜单 → 注销;同时清 cookie + IndexedDB 用户数据 + 通过 BroadcastChannel 通知其他标签 |
| FR-WEB-17 | 多设备登出 | P0 | 设置 → "已登录设备"列表(从 `auth.sessions` 拉),可单独撤销或"撤销除当前外全部" |
| FR-WEB-18 | 双因素认证(TOTP) | P1 | 与主 PRD FR-AC-05 一致,Web 端提供启用流程 + QR 展示 + 登录时第二步输入 |
| FR-WEB-19 | 桌面 App 用户首访 Web 引导 | P0 | 检测 `localStorage['xai:already-has-desktop']` 或登录后服务端字段;若桌面已激活,首次访问 Web 弹一次性引导卡:"你已在 macOS 上使用 XAI;Web 端是只读+轻量编辑场景" |
| FR-WEB-20 | 主密码 challenge(E2E) | P0 | 登录后**单独**询问主密码用以解出 DEK(主密码 ≠ 账号密码;见 §5.12);若拒输 → 受 E2E 保护的字段显示为"已加密,输入主密码可查看";KEK 仅驻内存 |

### 5.2 数据访问层(REST driver)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-21 | `core-data` REST driver | P0 | 与 SQLite driver 实现同一 `Repository<T>` 接口;Web build 启用 REST,桌面 build 启用 SQLite;切换零业务代码改动 |
| FR-WEB-22 | 端点映射 | P0 | 每个表对应一组 REST 端点(详见 `sub-prds/sync/PRD.md`);默认 `GET/POST/PATCH/DELETE /rest/v1/<table>`(Supabase PostgREST 风格);自定义业务调用走 RPC `/rest/v1/rpc/<fn>` |
| FR-WEB-23 | 请求缓存(stale-while-revalidate) | P0 | 用 TanStack Query(React Query)v5;list 端点默认 staleTime 30s、cacheTime 5min;mutation 后自动失效相关 query |
| FR-WEB-24 | 失败重试 | P0 | 网络错误(`fetch` reject 或 5xx)指数退避 3 次(0.5s/1.5s/4.5s);4xx 不重试直接显错 |
| FR-WEB-25 | 错误展示 | P0 | 4xx → toast + 具体表单字段红色;5xx → 顶部全局 banner "服务暂不可用,稍后重试";401 → 跳登录;403 → "权限不足";429 → toast 提示限频 |
| FR-WEB-26 | 乐观更新 | P1 | Todo 完成 / 卡片拖拽 等高频写,在 mutation 中先更新本地缓存,服务端确认后回滚或保留;失败时回滚 + toast |
| FR-WEB-27 | 批量写合并 | P1 | 同一 tick 内多次 mutation 同一 entity 合并为一次 PATCH(去抖 100ms) |
| FR-WEB-28 | 大列表分页 | P0 | Todo / clipboard(若开启) / card 等列表 default 50 条/页,滚动到底自动拉下一页;尾部加载状态行 |
| FR-WEB-29 | 请求取消 | P0 | 切换路由或 query key 变化时 abort 上一次请求(`AbortController`) |
| FR-WEB-30 | API 版本协商 | P0 | 每个请求带 `Accept-Version: 2026-05` header;服务端若返回 `Sunset` header 显示升级提示 |

### 5.3 实时同步(Supabase Realtime)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-31 | WebSocket 订阅 | P0 | 用 `supabase.channel()` 订阅当前模块涉及表的 `postgres_changes`;事件流转成本地缓存失效 + 选择性合并 |
| FR-WEB-32 | 订阅范围按模块 | P0 | 进入 `/app/todos` 订阅 `todos`/`lists`/`label_assignments`;离开取消订阅;避免全表广播 |
| FR-WEB-33 | 断线重连 | P0 | Supabase 客户端内置;断线时全局 banner 显示"已离线,本地编辑会在恢复时同步";恢复后做一次差量拉(`updated_at > last_synced_at`) |
| FR-WEB-34 | 心跳检测 | P0 | 默认 30s 心跳;30s 内 3 次失败标记断线 |
| FR-WEB-35 | Realtime 事件 → core-events | P0 | Supabase 变更事件转 `web:realtime-*` 内部事件(见 `SYSTEM_ARCHITECTURE.md §6.1`),UI 通过 `useEventListener` 反应 |
| FR-WEB-36 | 桌面 ↔ Web 双向 5s 内可见 | P0 | Web 改 → 桌面 5s 内见;桌面改 → Web 5s 内见。验收:两侧并排打开同一 Todo,改一侧另一侧实时变更 |
| FR-WEB-37 | 同一账号多 Web 标签共享 Realtime 通道 | P1 | 用 `BroadcastChannel` 让多个标签共享一个 WS 连接(节省 quota);主标签关时自动 promote |

### 5.4 离线模式

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-38 | IndexedDB 缓存 | P0 | TanStack Query persistor 用 IndexedDB(`idb-keyval`);Object Store 设计见 §8 |
| FR-WEB-39 | 离线检测 | P0 | `navigator.onLine` + 主动 ping `/healthz`;状态走全局 store,sidebar 底部显示离线标 |
| FR-WEB-40 | 只读离线浏览 | P0 | 离线时上次访问过的模块/数据可正常浏览;未缓存的端点显示"离线无法加载" |
| FR-WEB-41 | 离线编辑队列 | P0 | 离线时 mutation 入 IndexedDB 队列(`pending_mutations` Object Store);恢复连接后按时间顺序回放;每条 mutation 带 client-generated UUID + base version |
| FR-WEB-42 | 离线编辑队列限额 | P0 | 队列最大 500 条;超过时不再接受新写并提示"离线编辑过多,请上线" |
| FR-WEB-43 | 冲突展示 | P0 | 同步层走 last-write-wins(主 PRD FR-SY-03),Web 端在 mutation 被服务端覆盖时弹一次性 toast "你离线时的修改已被服务端版本覆盖" + "查看冲突" 链到 detail diff |
| FR-WEB-44 | Service Worker | P0 | 注册 `/sw.js` 缓存 app shell(HTML/CSS/JS/字体);策略:HTML 走 network-first(确保更新),静态资源走 cache-first;更新时弹"新版本可用,刷新生效" |
| FR-WEB-45 | Service Worker 注销路径 | P0 | 设置 → 隐私 → "清除浏览器缓存" 调 `caches.delete()` + `indexedDB.deleteDatabase()` + 注销 SW;用于排障 |
| FR-WEB-46 | 离线时 E2E 加密字段 | P0 | KEK 仅驻内存,刷新页面后丢失;离线时若需加密字段写入,提示"请先在线输入主密码"或写入 pending 队列时只存 plaintext + flag,联网后由前端用 KEK 加密上传 |

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
| FR-WEB-49 | 安全区 | P0 | iOS Safari 底部 home indicator 走 `env(safe-area-inset-*)`;sidebar 占满高度时避让 |
| FR-WEB-50 | 浏览器保留快捷键不抢 | P0 | Cmd+W / Cmd+T / Cmd+R / Cmd+L 等让给浏览器;Cmd+K 全局搜索改为 `Mod+K`(浏览器 Cmd+K 多数为地址栏聚焦,但 SPA 习惯 OK,在文档中说明可冲突) |

### 5.6 浏览器存储边界

每种存储**只能用于**下表用途,避免混乱:

| 存储 | 用途 | 加密 | 大小预算 | 清理时机 |
|---|---|---|---|---|
| `localStorage` | UI 偏好(主题、sidebar 折叠态、最后访问模块、i18n locale 选择) | 无 | ≤ 50KB | 注销不清 |
| `sessionStorage` | 单标签临时态(未保存表单草稿) | 无 | ≤ 100KB | 关标签自动清 |
| Cookie | Supabase 会话 token(SDK 自动管理) | httpOnly + Secure + SameSite=Lax | ≤ 4KB | 注销清 |
| **IndexedDB**(库:`xai-cache`) | TanStack Query 缓存、离线编辑队列、KEK-加密的 DEK 副本 | DEK 加密(对内容)+ 浏览器同源隔离 | ≤ 50MB(预算)/ 250MB(硬上限) | 注销清 / 设置可手动清 |
| Cache Storage | Service Worker 缓存的 app shell + 静态资源 | 无 | ≤ 30MB | SW 更新替换 / 注销不清 |

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-51 | 存储用途隔离 | P0 | 代码 review 红线:任何 plugin 写入 localStorage/IndexedDB 必须走 `core-data` 封装(`@repo/core-data/web`) |
| FR-WEB-52 | 配额监控 | P0 | 启动时 `navigator.storage.estimate()`,使用率 > 80% 触发清理(LRU 删 7 天未访问的 query 缓存) |
| FR-WEB-53 | 存储被清恢复 | P0 | 用户在浏览器设置清了站点数据 → 下次访问检测到无 IndexedDB → 走"如同新登录"流程 + 拉全量;不应崩溃 |
| FR-WEB-54 | KEK 不落盘 | P0 | KEK 只存在内存 `useState`(或 React Context);不进 localStorage / IndexedDB / cookie |

### 5.7 PWA(P1)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-55 | Web App Manifest | P1 | `/manifest.webmanifest` 含 name / short_name / icons (192/512) / start_url=/app / display=standalone / theme_color / background_color |
| FR-WEB-56 | Service Worker 离线 | P0(承接 FR-WEB-44) | 已在 §5.4 |
| FR-WEB-57 | 桌面安装 | P1 | Chrome / Edge 弹"安装"按钮;安装后桌面图标点开走 standalone 模式;sidebar 与浏览器版一致 |
| FR-WEB-58 | iOS Add to Home Screen | P1 | iOS Safari 的 "添加到主屏幕" 后启动无浏览器 chrome;设置 `apple-touch-icon` + `apple-mobile-web-app-capable` |
| FR-WEB-59 | Web Push 通知 | P2 | Phase 5+ 评估;v1 不做(VAPID + 服务端推送基础设施量大) |
| FR-WEB-60 | PWA 更新提示 | P1 | SW `waiting` 状态时弹 banner "新版本可用 / 刷新" |

### 5.8 路由 + 深链接

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-61 | 路由库 | P0 | React Router v6+(`createBrowserRouter`);所有路由懒加载(`React.lazy` + `Suspense`) |
| FR-WEB-62 | 深链接 | P0 | `/app/todos/work/abc123` 直接打开 Todo 详情,刷新不丢状态;detail 面板可从 URL 还原 |
| FR-WEB-63 | 浏览器前进/后退 | P0 | 切换 list / detail 进 history;按浏览器后退按预期返回上一态(不是退出 SPA) |
| FR-WEB-64 | 锚点 | P0 | `/app/settings#privacy` 滚动到隐私区块 |
| FR-WEB-65 | 共享链接(P1) | P1 | `/share/<token>` 公开访问只读视图(单个 Todo / 看板);后端发 token 时记录 `creator_id / entity_type / entity_id / expires_at`;读取走匿名 RPC,无需登录 |
| FR-WEB-66 | 未匹配路由 | P0 | 任何不存在路径 → `/404`;`/app/*` 下未匹配 → "模块不存在" + 跳默认模块 |
| FR-WEB-67 | 路由级权限 | P0 | `/app/*` 未登录跳 `/auth/login?next=<原路径>`;登录后回跳 |

### 5.9 性能(Web Vitals 目标值)

> 主 PRD §6.1 是 macOS App 的性能预算,本节是 Web 端的对应预算。

| 指标 | 目标(75th percentile) | 监测 | 越线动作 |
|---|---|---|---|
| LCP(Largest Contentful Paint) | < 2.5s | Web Vitals → Sentry transaction | 阻塞合并 |
| FID(First Input Delay) | < 100ms | 同上 | 检查主线程阻塞 / 拆 chunk |
| CLS(Cumulative Layout Shift) | < 0.1 | 同上 | 修固定尺寸占位 |
| FCP(First Contentful Paint) | < 1.5s | 同上 | 减初始 JS 体积 |
| TTI(Time To Interactive) | < 3.0s | Lighthouse CI | 同上 |
| 初始 JS bundle | < 250KB gzip | Vite build report + CI assert | 拆 lazy / 移除依赖 |
| 路由切换响应 | < 200ms(P95) | Performance API | 优化懒加载边界 |
| API 请求(GET list) | < 500ms(P95) | TanStack Query → Sentry | 检后端 / 加缓存 |

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-68 | Lighthouse CI 门 | P0 | CI 跑 Lighthouse,Performance ≥ 80、Accessibility ≥ 90、Best Practices ≥ 90、SEO ≥ 90 阻塞合并 |
| FR-WEB-69 | bundle 体积监控 | P0 | `vite build --report` 输出 + CI 对比基线,主路径 chunk 大小退化 ≥ 20% 阻塞 |
| FR-WEB-70 | Web Vitals 采集 | P0 | `web-vitals` 包 + Sentry transaction;采样 10% |

### 5.10 SEO + landing page

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-71 | landing page 独立路由 | P0 | `/` 是真正的 landing(非 app shell);Phase 4.5 用 SPA 渲染,Phase 5+ 评估迁 SSG |
| FR-WEB-72 | 基本 meta | P0 | 每路由有 `<title>` + `<meta description>` + Open Graph + Twitter card |
| FR-WEB-73 | sitemap + robots | P0 | `/sitemap.xml` 列公开页;`/robots.txt` 允许 `/`、`/auth/*`,禁止 `/app/*`、`/share/*` |
| FR-WEB-74 | 结构化数据 | P1 | landing page 加 `Application` schema.org JSON-LD |
| FR-WEB-75 | favicon + icons | P0 | 完整 favicon 套(16/32/48 ICO + 192/512 PNG + apple-touch-icon 180) |

### 5.11 兼容性

| 浏览器 | 最低版本 | 验收 |
|---|---|---|
| Chrome | 最新两个 stable | Playwright CI 必跑 |
| Edge | 最新两个 stable | Playwright CI 必跑 |
| Safari | macOS 17+(Sequoia)/ iOS 17+ | Playwright CI 必跑(WebKit) |
| Firefox | 最新两个 stable | Playwright CI 必跑 |
| 不支持 | IE / Opera Mini / UC | 进入时显示"浏览器不受支持"提示页 |

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-76 | 浏览器探测 | P0 | 入口 JS 早期探测 UA,不支持的浏览器渲染静态降级页 |
| FR-WEB-77 | polyfill 策略 | P0 | Vite `target: 'es2020'`,不引 IE 相关 polyfill;BroadcastChannel / IndexedDB / fetch / Web Crypto 不做 polyfill(直接要求最低版本) |
| FR-WEB-78 | Safari 特有验证 | P0 | iOS Safari 100vh 抖动问题用 `dvh`;`@supports` 兜底 |
| FR-WEB-79 | Firefox 容器标签 | P1 | 容器标签下 cookie 隔离正常工作(预期 Supabase SDK 自处理) |

### 5.12 安全

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-80 | HTTPS only | P0 | 所有响应 + 资源 https;HTTP 永久 301 → HTTPS |
| FR-WEB-81 | HSTS + preload | P0 | `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`;`.app` TLD 已强制,本档明确 |
| FR-WEB-82 | CSP | P0 | `default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openmeteo.com https://*.sentry.io; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`;Vite 构建产物不引外链 CDN |
| FR-WEB-83 | Cookie 属性 | P0 | 所有 cookie 设 `Secure; HttpOnly; SameSite=Lax`(Supabase SDK 配置确认) |
| FR-WEB-84 | XSS 防御 | P0 | React JSX 默认 escape;严禁 `dangerouslySetInnerHTML`(除受信 Markdown 渲染走 `react-markdown` + `rehype-sanitize` 白名单);用户内容渲染前 sanitize |
| FR-WEB-85 | CSRF | P0 | API 走 Authorization header(Bearer token),非 cookie 鉴权 → 天然免 CSRF;若走 cookie 必须加 `SameSite=Lax` + same-origin 检查 |
| FR-WEB-86 | clickjacking | P0 | `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'` |
| FR-WEB-87 | Referrer policy | P0 | `Referrer-Policy: strict-origin-when-cross-origin` |
| FR-WEB-88 | E2E 主密码处理 | P0 | 主密码输入仅在前端内存中存在 → Argon2id(WebAssembly 实现,`hash-wasm` 或 `argon2-browser`)派生 KEK → 解密 IndexedDB 中的 `encrypted_dek` → DEK 驻内存;主密码字符串解 DEK 后立即从内存清零(`fill('')`);页面 unload / 5 分钟不活跃 → 清 KEK + DEK,加密字段重新变"已加密" |
| FR-WEB-89 | 内存敏感数据生命周期 | P0 | KEK/DEK 仅在 React Context 中,组件卸载即释放;严禁 `JSON.stringify` 到 localStorage / 错误日志 |
| FR-WEB-90 | Subresource Integrity | P1 | 任何 CDN 引入(若引)必须带 `integrity=sha384-...` |
| FR-WEB-91 | npm 供应链 | P0 | CI `pnpm audit --prod` + Dependabot;关键依赖锁版本 |

### 5.13 错误边界 + Sentry web

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-92 | React Error Boundary | P0 | App 顶层 + 每个 lazy route 边界;捕获 → 显示 fallback UI + 上报 Sentry + "重新加载"按钮 |
| FR-WEB-93 | Sentry web SDK | P0 | `@sentry/browser` + `@sentry/react`;DSN 与桌面同,通过 `environment: 'web-prod'`/`'web-staging'`/`'web-dev'` 区分 |
| FR-WEB-94 | Sentry 隐私过滤 | P0 | `beforeSend` 钩子去除 query / mutation 中的 entity body(只留 entity type + id);永不上报 Todo 标题 / 卡片内容 / 用户消息;`sendDefaultPii: false` |
| FR-WEB-95 | Source map 上传 | P0 | CI build 时 `sentry-cli releases files upload-sourcemaps`;生产 bundle 不带 sourcemap |
| FR-WEB-96 | Sentry opt-in | P0 | 与桌面一致(主 PRD §6.2 / TR §1.3.2);首启弹 "是否启用匿名错误上报",拒绝则 SDK 不 init |
| FR-WEB-97 | 网络错误聚合 | P0 | 5xx / 超时通过 Sentry breadcrumb 聚合,避免单错误上报洪泛 |

### 5.14 i18n

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-98 | 语言识别 | P0 | 优先级:用户设置 > URL prefix(`/zh-CN/...` P1)> `Accept-Language` > 默认 zh-CN |
| FR-WEB-99 | 语言资源 | P0 | 复用 `packages/ui/i18n/<lang>.json`(zh-CN / zh-TW / en);按 chunk 懒加载 |
| FR-WEB-100 | 切换语言 | P0 | 设置 → 语言 即时切换,持久化到 localStorage;`<html lang>` 同步更新 |
| FR-WEB-101 | URL 语言 prefix | P1 | `/zh-CN/app/todos` 模式(SEO 友好),v1 P0 不强制 |
| FR-WEB-102 | 日期 / 数字 | P0 | 走 `Intl.DateTimeFormat` / `Intl.NumberFormat`,locale 来自当前语言 |

### 5.15 浏览器扩展接口预留(P2)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-103 | 扩展通信端点 | P2 | 后端预留 RPC `quick_capture_create_todo({ title, source_url, source_title })`,认证走 OAuth token(扩展走 `chrome.identity.launchWebAuthFlow`)|
| FR-WEB-104 | 扩展接收 CORS | P2 | `app.xai-desktop.app` API 接收来自 `chrome-extension://*` / `moz-extension://*` 的 origin |
| FR-WEB-105 | 扩展本体 | P2 | 单独仓库 `xai-desktop-extension`,本档不涵盖实现,只确保后端端点稳定;v1.5 评估 |

### 5.16 移动端浏览器(只读 + 最小编辑)

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-106 | 移动端识别 | P0 | UA + 宽度 < 768px,标记 mobile 模式 |
| FR-WEB-107 | 移动可用模块 | P0 | Todo(读+完成+加 Todo+改标题)/ Habits(读+打卡)/ Calendar(读)/ Search(读)/ Settings(基础) |
| FR-WEB-108 | 移动屏蔽模块 | P0 | 项目管理 / Pomodoro / Labels 管理 / 复杂详情面板:显示"此模块建议在桌面或平板打开" |
| FR-WEB-109 | 移动手势 | P1 | Todo 左滑标完成、右滑删除 |
| FR-WEB-110 | 移动 PWA | P1 | iOS Safari "添加到主屏幕" 后启动 standalone(承接 §5.7) |
| FR-WEB-111 | 移动键盘适配 | P0 | 输入框聚焦时 viewport 不缩放(`viewport meta`:`width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover`,接受不支持双指缩放的代价) |

### 5.17 与桌面 App 的双向状态同步

> 同步层细节在 `sub-prds/sync/PRD.md`;此处定义 Web 端的可观察行为。

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-112 | 同账号端点一致 | P0 | Web ↔ 桌面 App 走同一 Supabase project;数据库 schema 一致(主 PRD §8) |
| FR-WEB-113 | 5s 内可见(联机态) | P0 | Web 改 → 桌面 5s 内见;桌面改 → Web 5s 内见。Realtime + 增量拉双保险 |
| FR-WEB-114 | 离线变在线后追平 | P0 | 关网 5 分钟内本地改 10 条 → 联网后 30s 内全部 push 完成,顺序符合 last-write-wins |
| FR-WEB-115 | 同账号多端登录可见 | P0 | 设置 → 同步状态显示"已登录设备" + 最近活跃时间 + Web 标签数;与 FR-WEB-17 一致 |
| FR-WEB-116 | 同步状态指示 | P0 | sidebar 底部小灯:绿(已同步)/ 黄(同步中)/ 红(失败 + tooltip 显错误码)/ 灰(离线) |
| FR-WEB-117 | 主密码不一致拒绝同步 E2E 字段 | P0 | 若 Web 端主密码与桌面端不同(理论上不应发生)→ DEK 解密失败 → 提示"主密码错误" + 不写入 |

### 5.18 数据导出 / 账号删除 / GDPR

| ID | 需求 | 优先级 | 验收标准 |
|---|---|---|---|
| FR-WEB-118 | 数据导出 | P0 | 设置 → 隐私 → "导出我的数据";后端打包用户全部数据为 JSON zip(E2E 字段走客户端解密后导出明文)+ 邮件发下载链接(链接 24 小时过期);与主 PRD §6.2 一致 |
| FR-WEB-119 | 导出格式 | P0 | 包含 `todos.json` / `labels.json` / `boards.json` / `habits.json` / `settings.json` / `README.md`(字段说明);时间为 ISO 8601 |
| FR-WEB-120 | 账号删除 | P0 | 设置 → 账号 → "删除账号" → 二次确认输入密码 + 输入 "DELETE"  → 后端置 `deleted_at` + 30 天后硬删(主 PRD FR-AC-04);Web 端立刻登出 |
| FR-WEB-121 | 撤销删除 | P0 | 30 天内重新登录可看到"账号待删除,点击恢复"卡 |
| FR-WEB-122 | Cookie 横幅 | P0 | 仅当 IP 推断为 EU/UK 时显示;选项"必要 cookie 始终允许 / 错误上报 cookie 可选";默认拒绝可选项 |
| FR-WEB-123 | 隐私政策 + 服务条款 | P0 | `/legal/privacy`、`/legal/terms`;footer + 注册页 link;支持 zh-CN / zh-TW / en 三语 |

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
              │  core-data (REST drv)│
              │  core-events (BC+RT) │
              │  core-i18n / ui      │
              └────┬──────────┬──────┘
        HTTPS REST│          │WSS Realtime
                  ▼          ▼
         ┌──────────────────────────────┐
         │   Supabase 项目(单一后端)    │
         │  - Auth(邮箱/Apple/Google)  │
         │  - PostgREST API             │
         │  - Realtime(postgres_changes)│
         │  - Storage(头像/导出 zip)   │
         │  - Postgres(主 PRD §8 schema)│
         └──────────────────────────────┘
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
    ├── driver-rest/          ★ 新增(REST + Realtime)
    └── driver-testing/

packages/core-events/
└── src/
    ├── tauri-bus.ts          # 桌面
    ├── web-bus.ts            ★ 新增(BroadcastChannel + Realtime 桥)
    └── testing.ts
```

### 7.3 平台无关性约束(继承 ADR-0003)

- Plugin 业务代码 0 import `@tauri-apps/api`;所有跨平台能力通过 `@repo/core-*` 注入
- Plugin 在 Web build 中失活的部分(剪贴板监听 / 桌宠浮窗)通过 manifest `windows.web = false` 静态剔除,不进 bundle
- 测试:`apps/web` 构建本身做 plugin 体检 — 若 plugin 误引 tauri 包,Vite build fail

---

## 8. 数据模型

### 8.1 后端 schema

继承主 PRD §8;Web 直连同一 Postgres,**不增表**。

### 8.2 IndexedDB Object Store 设计(`xai-cache` 数据库)

| Object Store | key | value | 备注 |
|---|---|---|---|
| `query_cache` | `[entity, hash(params)]` | `{ data, queryHash, dataUpdatedAt }` | TanStack Query persistor |
| `pending_mutations` | autoIncrement id | `{ id: uuid, op: 'create'/'update'/'delete', table, payload, baseVersion, createdAt }` | 离线编辑队列 |
| `encrypted_dek` | userId | `{ encryptedDek, salt, kdfParams, createdAt }` | 与服务端镜像,加速登录后解密 |
| `user_prefs` | userId | `{ lastModule, sidebarCollapsed, theme, locale }` | 加速首屏 |
| `meta` | string key | any | schema version 等 |

每条记录加 `version` 字段;`xai-cache` 数据库本身有 `version` 升级时迁移;不兼容时丢弃并重新拉。

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

### 9.4 回滚

| 情况 | 操作 | 耗时 |
|---|---|---|
| 前端 bug | Vercel/CF dashboard 一键 rollback 到上一 deployment | < 5min |
| 数据库 schema 不兼容 | Supabase migration rollback(需提前演练) | < 30min |
| 双向不兼容(API breaking) | Web 端用 `Accept-Version` 协商,后端保留上一版 endpoint 至少 90 天 | — |

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

- [ ] 注册 + 三种登录方式全部跑通(邮箱、Apple、Google)
- [ ] 桌面 ↔ Web 双向同步 5s 内可见(真机 + 浏览器并排)
- [ ] 离线编辑队列 20 条以内恢复连接 30s 内全部 push
- [ ] Lighthouse 主路径 Performance ≥ 80、A11y ≥ 90
- [ ] Chrome / Safari / Firefox 三浏览器 Playwright 全 green
- [ ] Sentry 配好 + source map 可解栈
- [ ] CSP / HSTS / cookie 属性扫描通过(securityheaders.com A+)
- [ ] 主密码 challenge → KEK 派生 → E2E 字段读写正常
- [ ] 移动浏览器(iPhone Safari + Chrome Android)只读 + Todo 完成 可用
- [ ] 数据导出 + 账号删除流程可走通

### 10.2 M6 GA(2026-12-22 对齐主 PRD)

- [ ] PWA 可安装(Chrome / Edge 弹安装按钮)
- [ ] 找回密码邮件 deliverability 验证(SPF/DKIM)
- [ ] 隐私政策 + 服务条款 zh-CN/zh-TW/en 三语完
- [ ] 真实负载测试:同一账号 5 个 Web 标签 + 1 桌面 不互相干扰
- [ ] 30 分钟挂线后重连无数据丢失
- [ ] staging → prod 演练回滚至少一次

---

## 11. 风险与缓解(Web 特有)

| ID | 风险 | 等级 | 缓解 | 监控 |
|---|---|---|---|---|
| RW-01 | **浏览器存储被用户/浏览器清** → IndexedDB 丢失导致 KEK/缓存全无 | 🟡 中 | KEK 本来就只驻内存;`encrypted_dek` 服务端有镜像;首次加载检测并按需重拉 | FR-WEB-53 |
| RW-02 | **Service Worker bug 导致 stale 资源** → 用户卡老版本 | 🟡 中 | HTML 走 network-first;`waiting` SW 弹刷新提示;紧急 escape hatch:URL 加 `?bust=...` 或注销 SW(FR-WEB-45) | FR-WEB-44/60 |
| RW-03 | **Safari 第三方 cookie ITP 限制** → OAuth 回调失败 | 🟡 中 | 同源(app + auth 同域)+ SameSite=Lax;Supabase SDK 已处理 | Playwright WebKit job |
| RW-04 | **跨域 / Mixed Content** → CSP 误配置全站坏 | 🟡 中 | CSP report-only 模式跑一周 → enforce;有 violation 报 Sentry | FR-WEB-82 |
| RW-05 | **Supabase Realtime 配额超限** → 大量用户 WS 连接挤崩 | 🟡 中 | 多标签共享 channel(FR-WEB-37);后期可加 connection pooling 或自建 Realtime | FR-WEB-37 / Supabase 监控 |
| RW-06 | **主密码忘 → 数据不可恢复** | 🔴 高 | 注册时强制助记词导出(主 PRD §2.1.1);UI 多处提示"主密码 ≠ 账号密码"|首次启用 E2E 时强制走助记词向导 | 用户支持 inbox |
| RW-07 | **`.app` HSTS preload 后无法降级 HTTP** → 证书故障即全站 down | 🟡 中 | 多家 CA 备份 + Vercel/CF 自动续;域名证书监控告警 | Uptime + 证书过期告警 |
| RW-08 | **国内访问慢/被墙** | 🟡 中 | v1 GA 先用 Vercel,监测中国大陆 P95;若 > 5s 启动 Plan B 切 CF Pages 或加镜像 | RUM 数据 |
| RW-09 | **离线编辑顺序与服务端冲突** → 用户改动丢失感 | 🟡 中 | last-write-wins(主 PRD FR-SY-03)+ 显式 toast 通知(FR-WEB-43);v1 不做 CRDT | 用户反馈 |
| RW-10 | **Sentry 误上报用户内容** | 🔴 高 | `beforeSend` 钩子强 redact + 写测试断言 + code review checklist | FR-WEB-94 |
| RW-11 | **PWA 安装后用户与 Web 版分歧体验** | 🟢 低 | standalone 与浏览器 chrome 模式行为一致,不做独立功能 | 仅做手动验证 |
| RW-12 | **浏览器扩展(P2)未来加入时 CSP/auth 模型变更** | 🟢 低 | v1 P0 不开口子,P2 评估时再扩 connect-src + 引入 origin 白名单 | FR-WEB-103~105 |

---

## 12. 待办

- [ ] Console 子 PRD 提交后,本档 §4 复用表二次对齐
- [ ] Sync 子 PRD 提交后,本档 §5.2 / §5.3 / §5.4 的端点 / 冲突描述对齐
- [ ] 主密码 challenge 的具体 UX 文案与控制台一致(等 plugin-account 设计稿)
- [ ] Sentry DSN 与桌面共用 vs 拆 — Phase 4.5 启动时与运维一起决策
- [ ] 中国大陆访问性 PoC(Vercel / CF Pages 两家各跑 1 周拿数据)— Phase 4.5 第 1 周

---

## 13. 文档变更记录

| 日期 | 版本 | 变更 |
|---|---|---|
| 2026-05-14 | v0.1 (DRAFT) | 首版,主 PRD §5.15 的 FR-WEB-01~07 扩到 FR-WEB-08~126(共 119 条新增),按 §5.1~5.18 18 节组织 |

— END —
