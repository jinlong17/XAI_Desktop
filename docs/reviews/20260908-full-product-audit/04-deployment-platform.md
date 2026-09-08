# 部署、关闭页面后的运行边界与非 Web 平台逐项审查

审查时间：2026-09-08；性质：只读审查，未发布、未修改产品配置、未操作真实用户数据。主模块归属 `web`（部署与浏览器运行）；`app/plugin/sync/admin/site` 是本次跨模块审查范围。

## 1. 版本与证据范围

| 代号 | 当前核实的 ref / SHA | 使用方式 |
|---|---|---|
| W | `web` / `9257be40c03216b1006691bfa289bd29d6dfe839` | 当前工作区与 origin/web；Web 部署配置、Supabase 存档实现 |
| M | `origin/main` / `9a61669b1f67197f6f75f341c79ef35be8a6d0e4` | CI 生产分支；不等同于生产已部署 SHA |
| D | `origin/dev` / `343cc5f1002559291b3f8fd1511b93c6e1196082` | Mac 最新分支，包含比 plugin 集成线更新的 Phase 2 common capabilities |
| P | `origin/desktop-plugin-next` / `ae72888f4c50d8d678eef670c9bff4c27b3e373d` | 插件 Phase 1 集成线 |
| A | `origin/claude/frosty-nash-c4bf16` / `72902b7d176385f77e48276b0047a2796f25b738` | 独立 Admin 分支；已推送但尚未合入 Web/dev 的 6 个切片 |

文内 `D:path:line`、`P:path:line`、`A:path:line` 指对应冻结 SHA 的仓库文件，不能直接用当前 Web 工作区同名文件替代。隔离只读快照位于 `/tmp/xai-audit-20260908/{dev,plugin,admin}`；没有切换共享工作区分支。可用 `git show <SHA>:<path>` 重现证据。

加载并使用 `cloudflare:cloudflare` 与 `supabase:supabase` skill；本报告侧重生命周期、部署、原生持久化与后端边界，视觉实测由并行 UI 审查覆盖。沿用项目六模块划分，区分代码交付、测试通过、产品部署。

## 2. 目前生产实际是什么

**当前公开站点是 Cloudflare Pages 静态 SPA，不能据此认为存在常驻后端任务服务。** `W:apps/web/wrangler.toml:1` 仅配置 `pages_build_output_dir`；`W:.github/workflows/deploy-web.yml:54` 在 GitHub runner 执行 Vite build，随后 direct upload。仓库没有该 Pages 应用的 Functions/Worker 入口、Cron/Queues/Durable Objects/Workflows binding。`W:apps/web/deploy/README.md:10` 明确 `deploy/security` 只是未来 Worker 的库，不是当前线上运行层。

2026-09-08 23:15–23:22 UTC 的只读外部核查结果：

| 检查 | 结果 | 意义 |
|---|---|---|
| `https://xai-web-console.pages.dev/` | HTTP 200；`cache-control: public,max-age=0,must-revalidate` | 公网站点可达，不代表功能后台可达 |
| 生产 HTML | 主资源 `/assets/index-BLMlO8WD.js`；仍有 `feature-planning` 与 `feature-board` chunk | 与 W 的 `feature-board-planning` 构建配置不同 |
| 生产 CSP | 不含 `https://api.deepseek.com`，W `_headers` 含该域名 | 直接证明当前公开响应与 W HEAD 配置不同；不能用线上页面验证全部最新代码 |
| `/assets/index-BLMlO8WD.js.map` | HTTP 200，`content-type: application/json` | hidden sourcemap 公开可取；不是仅理论暴露 |
| `/sw.js` | 与 W 当前简化 SW 一致 | 只有两个 HTML 预缓存，无资源清单 |
| 最新 PR deploy run | `34214653502`，W SHA，2026-09-08 10:17:27Z，failure | build 成功；Cloudflare credentials verification 失败 |
| 最新 main deploy run | `27061053762`，M SHA，2026-06-06 11:28:32Z，failure | main HEAD 也没有成功部署证明 |
| GitHub retained success / deployments 查询 | success runs `[]`；deployments `[]` | 不能从 GitHub 元数据还原站点部署来源 |
| 本机 Wrangler 生产 deployment list | 缺少 `CLOUDFLARE_API_TOKEN`，非交互查询失败 | **生产精确 SHA、发布时间、部署 ID 未知**，不推断为 main 或 Web |

父代理另做了真实生产UI对比：`screenshots/34-production-ai.png` 中生产 `/app/ai` 可直接进入、rail没有Metrics、composer保留Haiku4.5下拉；本地W有Metrics且AI首屏不同。此证据进一步支持版本差异，仍不足以定位精确生产SHA。

最新失败日志的明确错误为 `Cloudflare API (/accounts/***/pages/projects) Authentication error [code: 10000]`；随后检查脚本提示 Pages 权限/目标账号不正确。最近 8 个 PR 部署查询结果均失败，最近 4 个 main 部署查询结果均失败。这是当前发布通路故障，不是“等下一次提交自然恢复”。[最新 Web run](https://github.com/jinlong17/XAI_Desktop/actions/runs/34214653502)，[最新 main run](https://github.com/jinlong17/XAI_Desktop/actions/runs/27061053762)。

### 部署逐 feature 结论

| Feature | 现状 | 问题与优先级 | 修改和优化建议 |
|---|---|---|---|
| `xai-web-deploy-cloudflare` | 静态 Pages 站点在线；CI 基础设施存在 | **P1** 当前凭据检查失败；W 最新功能没有生产发布证据 | 修复部署 token/账号范围；补充成功 deployment receipt（source SHA、build SHA、artifact hash、部署 ID、URL、时间）；失败时保留上一版与明确显示待发布差异 |
| Production / Preview 分支流 | push main → production；PR → preview，W push 本身不发生产（workflow:22-25） | **P1** “Web 已 SHIPPED”与“生产版本”容易混淆；当前 preview 也失败 | 看板并列显示实现 SHA、已验证 SHA、生产 SHA；preview 冒烟合格后再按既有治理晋级，不能直接合 Web 到 dev |
| Build 环境变量 | CI build 仅明确注入 `VITE_WEB_AUTH_MODE=mock-authenticated`（workflow:56-58） | **P1** `apps/web/deploy/README.md:35-42` 让人在 Pages 后台设置 VITE 值，但当前为 GitHub 本地构建后 direct upload；后台变量不会重写已构建 JS | 确定唯一 build-env 来源，显式映射允许公开的 VITE 配置；生成 names-only 配置摘要；缺必需配置时 build fail closed |
| Public Demo auth | CI 生产/预览均强制 mock auth | 这属于明确的 Demo 交付，不可当真实账号系统 | 用户入口持续显示本地 Demo 数据边界；真实登录开放前执行 auth、删除账号、RLS、迁移、CSP 专项门槛 |
| PWA / 离线壳 | SW 预缓存 `/`、`/index.html`（sw.js:1-8） | **P1** JS/CSS/font 未 precache，网络 fetch 后也不 `cache.put`；离线新进程无法保证启动 | 使用带 content hash 的资源清单；确保离线启动全部入口依赖已缓存；用缓存版本与受控更新，保留可恢复旧壳；验证旧版升级后离线启动 |
| PWA 版本更新 | `CACHE_NAME` 固定，HTML仅 install 缓存，navigate 网络响应不更新缓存（sw.js:1,28-30） | **P1** SW 字节不变时旧 HTML 缓存可长期指向旧 chunk；新部署后离线壳版本错配 | 构建版本化 SW+manifest，部署 receipt 关联 cache version；页面提示更新后安全重载并保留草稿 |
| Source maps | `sourcemap:"hidden"` + vanilla build；地图文件确实公开 | **P2** 公开源码/内部注释；这是 ADR 接受的已知边界，不能称为新发现密钥泄漏 | 私有上传至 Sentry 后排除 `.map`；若继续公开需明确产品决策与 secret scan。`W:apps/web/vite.config.ts:38`、workflow:55 |
| CSP / Headers | HSTS、nosniff、frame denial 已在公网响应生效 | **P1** 线上/HEAD 允许域不同；当前 connect-src 不允许 Supabase；真实认证开关单独切换不能成功 | build 部署时校验目标域；用生产响应与预期 manifest 逐项对比；为地图、字体、AI、auth写正负场景，不仅测试字符串 |
| CI release gates | Deploy workflow 只 install/build/credential/deploy，未串联功能测试、类型检查或 UI smoke | **P1** Vite 能编译并不代表运行正确；当前浏览器生命周期问题不会阻止部署 | 将关键恢复测试、类型检查、至少 1 个真实 build 浏览器 smoke 加入 release gate；设置 deployment concurrency 与明确 rollback receipt |
| RUM / Sentry `web-security-csp-sentry` | 浏览器采集与隐私清洗代码存在 | **P1** `rum.ts:221` 只排队，生产代码未调用 `flushRum`；缺 VITE_SENTRY_DSN 时不初始化；`/__rum` 对应 Worker未接入 | 接入实际 ingest；批量 flush 有上限、定时器与 pagehide；确保HTTP失败可计数；生产版本 `VITE_RELEASE` 绑定 SHA。`W:observability/runtime.ts:34,63`、`transport.ts:60,108`、`rum.ts:176,203`（均在 `apps/web/src/`） |
| Supabase 发布 runbook | 存在迁移与 functions deploy 命令 | **P1 / 上线前** runbook 与可发布入口不一致：recovery entry返回501；backfill无index；`test db` 与现有Vitest测试并非同一测试运行器 | 改为实际能从空项目执行的部署流水线；版本化CLI；演练 staging schema/function/auth/RLS/deletion/restore完整链。`W:docs/runbooks/supabase.md:48-68` |

## 3. 关闭网页以后，哪些会继续

| 场景 | 可作出的结论 | 当前限制与推荐 |
|---|---|---|
| 用户关闭某个浏览器页 | Cloudflare Pages 站点继续服务其他请求；该页 JavaScript、React effect、页内 interval 不再执行 | 要“继续计时”应持久化 start/end/deadline 并重开重算，不能依赖后台每秒tick；各计时模块细节见并行 Web feature 报告 |
| 页面放后台 / 锁屏 / 浏览器挂起 | 不能按每秒 interval 推断经过时间 | 浏览器会节流后台计时；恢复必须按绝对时间 reconcile。参考 [MDN Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) |
| 页面仍开着但断网 | 纯本地状态在浏览器执行；依赖第三方 API 的请求会失败或挂起 | “数据已保存”与“已发送/已同步”必须分开；网络错误保留可重试队列、指数退避、幂等ID |
| 关页后已发送中的请求 | 当前没有 durable job id、队列或恢复查询保证 | 不能保证AI回答/外部集成请求完成并被保存；若需持续任务先在服务器持久化 `jobId/status/result`，再异步执行 |
| 关页后定时提醒 | 当前 SW 没有 push/background sync/timer scheduler | 不会凭 Pages 托管自然出现；浏览器提醒需服务端调度 + Web Push，并展示浏览器支持和权限状态；不把 SW 当永不退出进程 |
| 重新在线打开 | 静态壳可以重新下载；已成功写入当前 origin 本地存储的数据原则上可读 | 运行中内存、未提交编辑与未保存异步结果不保证恢复；隐私窗口、清缓存、跨浏览器/设备也不等价于相同存储 |
| 离线重新打开 | **当前实现不能保证完整打开** | 本次SW模拟证实HTML能返回而JS失败；没有真实浏览器网络模拟，不能称已做浏览器端 offline E2E |
| Web 退出登录后 | 页面内 auth 状态与本地数据边界由具体实现控制 | 登录状态恢复不能证明云同步；当前生产明确Demo，账号端到端行为由auth专项报告判断 |
| Mac 隐藏窗口 / 最小化 | App进程可能仍在，但通知逻辑仍依赖 Webview 活性 | 不应承诺App Nap/睡眠期间按时触发；明确“关闭窗口”与“退出应用”行为 |
| Mac 关闭主窗口 | 原生处理器仅保存window state，没有看到 `prevent_close`/转隐藏，也没有后台业务调度服务 | 主Webview关闭即失去其通知poll与event订阅；即便托盘进程仍活，不能证明任务执行仍活。`D:apps/desktop/src-tauri/src/app_config.rs:323-345` |
| Mac Cmd+Q / 崩溃 / 重启 | App内逻辑全部停止，已提交 SQLite/配置仍可恢复 | 需退出前提交确认、恢复日志；真正退出后提醒必须由系统通知调度或外部服务承担 |
| Mac重启后插件 | 有 enabled instance restore函数，但调用绑定 PluginCenterWindow mount | **P1** 无法证明普通App启动即恢复全部插件；建议由host启动协调器统一恢复并逐实例容错，而非依赖打开插件中心。`D:apps/desktop/src/windows/PluginCenterWindow.tsx:218` |

Cloudflare `waitUntil` 是延长特定事件寿命的工具，不能替代持久后台队列；本项目没有配置它来处理产品任务。若产品目标包含离开后的可靠任务执行，需要 jobs/outbox、调度器、重试幂等、结果恢复四者成套实现。[Cloudflare Context](https://developers.cloudflare.com/workers/runtime-apis/context/)，[Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)，[Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)。

## 4. Mac App：逐 feature 审查

这些条目按 D 分支审查。21行剩余路线图已标 SHIPPED，但交付边界很多是“契约/本地实现/状态展示”；不是21个生产能力均已完整上线。尤其不得照抄旧 Work Log 的 BLOCKED：`desktop-real-macos-release-smoke` 的最新面板已在2026-05-29记录人工通过。

| Feature | 当前实现 / 验证现状 | 问题与优化建议 |
|---|---|---|
| `desktop-tauri-web-dist-normal-window` | Tauri打包Web SPA，`frontendDist=../../web/dist`，默认普通主窗口 | **P2** 补当前SHA的离线冷启动、老数据升级记录；路由404/损坏包提供恢复入口。证据 `D:apps/desktop/src-tauri/tauri.conf.json:6-35` |
| `desktop-host-capability-profile-split` | normal/overlay_v2显式分流；native命令按窗口检查 | **P2** 将功能可用性、权限失败与宿主模式统一显示；维护浏览器与Tauri负向契约。`D:apps/desktop/src-tauri/src/lib.rs:298-319` |
| `desktop-phase1-build-packaging-pipeline` | .app/DMG构建资料与脚本存在，旧日志有DMG stall | **P1 / 公发前** 重新用当前HEAD生成签名artifact与可复现manifest；不能用早期构建记录证明现在可发布。`D:packages/desktop-phase1-build-packaging-pipeline/docs/dev_log.md:11-17` |
| `desktop-basic-macos-menu-config-store` | 原生菜单、配置、窗口位置；写tmp后rename | **P2** Move/Resize每事件持久化会增加磁盘与主线程负担，合并/debounce并在安全边界flush；保留旧配置恢复。`D:app_config.rs:202-208,323-343`（位于 `apps/desktop/src-tauri/src/`） |
| `desktop-web-auth-offline-mode` | 打包命令注入 mock-authenticated，提供离线 `/app` 入口 | **P1 / 真实账号前** Demo bypass与真实离线凭据缓存明确分层，不能拿离线成功当真实会话验证。`D:tauri.conf.json:7-10`、feature dev_log:17 |
| `desktop-real-macos-release-smoke`（#1） | 最新面板 SHIPPED，人工报告离线、/Applications启动、菜单/重启正常 | **P2** 该证据是5月旧版本，新增plugin/存储变更后应定向再跑；签名、notarization、updater仍未关闭。`D:packages/desktop-real-macos-release-smoke/docs/dev_log.md:10-17` |
| `desktop-native-notifications-reminders`（#2） | Webview effect轮询任务和日历，原生插件即时notify；Pomodoro靠前端事件 | **P1** 无OS持久调度；`deliveredKeys`内存且发送前写入，失败后不重试、重启又重复；calendar用SAMPLE_EVENTS。改为持久 occurrence ledger，发送成功后ack，OS计划通知，真实事件源、过期策略、睡眠恢复测试。`D:packages/desktop-native-notifications-reminders/src/bridge.tsx:135-157,181-198,281-288` |
| `desktop-statusbar-quick-actions`（#3） | 原生托盘可focus主窗、发送StartPomodoro/TodayTasks | **P1** 主窗口被销毁与数据pump停止时动作/状态可能失效；状态不是后台计时器。提供create-or-focus与last-updated展示。`D:apps/desktop/src-tauri/src/commands/statusbar.rs:176-210` |
| `desktop-global-hotkey-quick-open`（#4） | 原生global shortcut注册与配置存续 | **P2** 硬件冲突/多App抢占、键盘布局与窗口已销毁状态需专项验证；设置可见冲突提示及重绑。`D:apps/desktop/src-tauri/src/lib.rs:326-330`、路线图:26 |
| `desktop-full-macos-menu-polish`（#5） | 原生菜单与窗口重置已交付；基础人工smoke已闭合 | **P2** 对齐中文/英文命令、disabled原因、快捷键冲突与多窗口target；新插件菜单仍需当前版本实测。`D:docs/workflow/roadmap/xai-desktop-remaining-p2-p3-future.md:27` |
| `desktop-auto-update-release-channel`（#6） | 实现check/status；Rust主动拒绝placeholder endpoint/pubkey | **P1 / 公发前** config仍是 `updates.example.invalid` + deferred pubkey，没有完成下载/安装/回滚用户闭环。界面必须显式未配置，接入签名feed、真实双版本升级与失败回退。`D:tauri.conf.json:60-65`、`commands/updater.rs:185-195,374,451` |
| `desktop-last-data-cache-polish`（#7） | 检查tasks/boards/habits/pomo/countdown/AI已缓存状态 | **P2** pomo/countdown/AI只要key存在就记readable，没有同等结构校验；将缓存时间、损坏原因与修复/导出并列。`D:packages/desktop-last-data-cache-polish/src/web.tsx:30-36,74-79` |
| `desktop-phase2-integrated-rc-gate`（#8） | repo侧验证SHIPPED；其余native交互残留明确记载 | **P1 / 公发前** 不将组合测试green当真实通知/更新链green；release看板显示每项硬件证据时间与SHA。feature dev_log:99,126-130 |
| `desktop-local-first-storage-adr`（#9） | ADR-0012明确SQLite与bridge边界 | **P2** 补data-owner映射，区分localStorage兼容层/SQLite事实源/同步scope；不把规范落盘算运行时已切换 |
| `desktop-local-first-sqlite-foundation`（#10） | SQLCipher、Keychain、本地app data DB与db_*命令 | **P2** 检查Keychain拒绝/锁定、迁移中断、磁盘满；db_list整namespace加载应有分页/容量边界。`D:apps/desktop/src-tauri/src/commands/database.rs:340-359` |
| `desktop-local-first-repository-bridge`（#11） | 多模块pref映射至typed records | **P1** `setPref` localStorage成功即返回true，SQLite `void writeDesktopRepoValue`未等待；退出/重开可能hydrate旧SQLite覆盖新local值；并发整family替换也可能乱序。加入串行提交队列与pending/committed UI，关窗flush，错误持久化。`D:packages/plugin-web-storage/src/internal/storage.ts:218-241`、`desktopRepoBridge.ts:307-383,561-596` |
| `desktop-local-first-web-data-migration`（#12） | 有fingerprint/ledger与导入恢复模型 | **P2** 逐实体导入预览、重复导入幂等、失败续跑、源数据保留；用真实老版本数据验证，而非只mock；Notes是明确unsupported，不应悄悄跳过。`D:packages/core-data/src/desktop-bridge.ts:37-41` |
| `desktop-local-first-offline-edit-queue`（#13） | entity与outbox同事务；queued/conflict/failed状态 | **P1** bridge整family rewrite会把未变记录也入队，放大存储；无上界时长期离线堆积。加入diff写、同实体可合并操作、队列容量、坏记录隔离。`D:core-data/src/sync-outbox.ts:236-243`、`plugin-web-storage/src/internal/desktopRepoBridge.ts:561-593`（位于packages） |
| `desktop-local-first-sync-reconnect`（#14） | replay contract、preflight、状态处理都有 | **P1 / 云同步前** transport只从 `__XAI_DESKTOP_RECONNECT_SYNC_TRANSPORT__` 读取，全仓生产路径无设置实现；`runReconnectSyncReplay` await transport无try/catch、无超时/lease，异常中断全批。接真实adapter后才可宣称重连同步，补inflight锁与重试。`D:packages/plugin-web-storage/src/internal/desktopReconnectSync.ts:96-120`、`core-data/src/reconnect-sync.ts:105-108` |
| `desktop-ai-offline-provider-policy`（#15） | 规则/降级门槛SHIPPED，受外部模型能力限制 | **P2** 显示离线不可用与草稿保留，不自动重放可能重复收费的请求；恢复后用户可显式继续。路线图:37 |
| `desktop-calendar-sync-degraded-mode`（#16） | provider state、lastSuccess/needsReconnectRefresh与transport seam | **P1 / 真日历前** 连接状态不等于calendar数据来自服务端；notify仍SAMPLE_EVENTS。展示上次同步、离线缓存与失败重试，真实OAuth过期/限流/删除事件测试。`D:packages/plugin-web-storage/src/internal/storage.ts:732-794` |
| `desktop-local-first-backup-export-import`（#17） | 允许9类record恢复，明确排除outbox/import ledger | **P1 / 迁移前** 不包含所有Web工具数据；待同步操作不在备份内，不能称整应用备份。导出前给覆盖清单、排除数、pending数量与可恢复证明。`D:packages/core-data/src/desktop-backup.ts:14-29` |
| `desktop-phase3-integrated-rc-gate`（#18） | local-first组合契约已SHIPPED | **P1** 真实sync transport不存在时不能推导“离线编辑→真实云→另一设备恢复”通过；分开local durability与cloud E2E门槛。路线图:40 |
| `desktop-overlay-host-v2`（#19） | 显式opt-in overlay，不是默认壳 | **P2** 多屏/Spaces/全屏/点击穿透恢复是独立hard gate；退出主窗不应误伤挂件或让用户失去控制。`D:apps/desktop/src-tauri/src/lib.rs:309-319` |
| `desktop-smart-container-file-organizer`（#20） | organizer能力在dev/plugin路径有实现 | **P2** 需对真实文件权限、断链、目录变更和撤销做验收；保留引用/移动文件含义要清楚；旧 `useFolderMapping`仍mock读取，不能与真实Finder流混算。`P:packages/plugin-organizer/src/hooks/useFolderMapping.ts:12-53` |
| `desktop-organizer-plugin-restoration`（#21） | organizer-family恢复矩阵已交付 | **P1** 不能推广为所有plugin的自动恢复；新sample-widget的host smoke仍PARTIAL。逐插件记录restore成功/失败，单个失败不中断其余。路线图:43；下节Phase2证据 |
| 开机启动 / 系统Deep Link | 产品目标提及，现有Cargo插件与host源码未找到对应实现 | **P2 / 新切片** 不计作已交付；先写实际需求、权限与失败语义，再做launch-at-login/custom protocol专项。`D:apps/desktop/src-tauri/Cargo.toml:24-27` |

## 5. Desktop Plugin：逐 feature 审查

P只到Phase1，D已多了sample-widget与Phase2恢复等代码。D最新host smoke `docs/reviews/desktop-plugin-platform-runtime/20260606-phase2-host-smoke-result.md:7,35-39,79-83` 明确 **PARTIAL**：能建Plugin Center窗、切host mode，屏幕锁定导致visual未验，sample-widget实例尚未建。不能用系统窗口存在代替交互内容通过。

| Feature | 现状 | 问题 / 优化建议 |
|---|---|---|
| typed PluginInstance / manifest → center | registry合同、默认placement/behavior/style已有 | **P2** 验证manifest升级与旧实例迁移；中心显示可用/计划/权限缺失的真实理由。`D:packages/core/src/registry/plugin-center.ts:19-40` |
| instance persistence/lifecycle | device-local store，启禁/删除语义分离 | **P1** 内存snapshot先改再await adapter.write，写失败留下“内存成功、磁盘失败”；加copy-on-commit、失败rollback、跨窗口版本戳。`P:packages/core/src/registry/plugin-instance-store.ts:156-162` |
| add-to-desktop | 先store.create再window.create | **P1** window创建失败留下已启用实例，UI可能只有错误而无可恢复状态；persist pending→created/failed，提供重试与补偿。`D:packages/core/src/registry/plugin-center-runtime.ts:33-37` |
| enabled instance restore | 有restore函数，跳过disabled | **P1** 单个window.create失败会终止for循环；主调用在Plugin Center挂载；普通启动自动恢复证据不足。逐实例try/catch，host bootstrap负责恢复，给恢复结果摘要。`D:packages/core/src/registry/plugin-instance-runtime.ts:26-45`；`PluginCenterWindow.tsx:218-238` |
| placement / resize / opacity / pin / click-through | typed model、native command与fallback已存在 | **P1 / 完成宣称前** 当前Phase2 host smoke缺真实拖拽/resize/Spaces/穿透验收；逐配置展示requested/applied/unsupported，避免用户被无法点击的窗口困住 |
| Plugin Center frame | 物理→逻辑坐标修复已记录，2.5秒poll+beforeunload异步save | **P2** beforeunload不能保证最后一次async落盘；改native window event持久化、debounce与last-saved时间；多屏再测。`D:PluginCenterWindow.tsx:436-451`、host-smoke:85-105 |
| sample-widget | D catalog available，P无该条目 | **P1 / Phase2验收** 必须完成创建/重启/禁用/删除/尺寸/权限拒绝全矩阵后再解冻业务插件。`D:apps/desktop/src/plugin-center/catalog.ts:22-28` |
| organizer | available，是已交付参考插件，非全部P2冻住 | **P2** 真实文件夹映射与老mock流区分；首屏空态解释添加引用 vs 移动实体文件，批量动作给可撤销结果 |
| widgets | catalog planned；已有旧业务骨架与mock habit history | **P2 / 规划** 在恢复和provider合同闭合后再接；每widget显示数据来源/更新频率，限制每实例独立timer。`P:packages/plugin-widgets/src/components/builtInWidgets.tsx:57,183` |
| clipboard / OCR | planned；mock剪贴板与mock OCR按钮存在 | **P1 / 启用前** 不能宣称系统剪贴板监听/OCR已生效；privacy allow/deny、敏感应用排除、TTL/容量、原生授权与真实OCR需新切片。`P:packages/plugin-clipboard/src/components/OcrPreview.tsx:9-18,52` |
| calendar glance | planned，manifest明确mock aggregated events | **P2 / 规划** 先provider contract和离线缓存一致性，再做glance UI；不要展示样例事件为用户日程。`P:apps/desktop/src/plugin-center/catalog.ts:80-96` |
| pet | planned，AI订阅为TODO/no-op，UI占位 | **P2 / 规划** 先轻量状态、低打扰、动画节能、click-through逃生；AI事件真实接入后再宣传智能响应。`P:packages/plugin-pet/src/index.ts:1`、`components/PetAvatar.tsx:5` |
| meditation native plugin | 仅planned产品条目，无plugin-meditation package | **P2 / 规划** Web冥想与native挂件作为不同交付面；不要因Web已完成把native标成完成 |

## 6. Sync / 后端：逐 feature 审查

整体仍处于paused/分层实现阶段。`apps/release-site` Web UI被标 archive-only，但其 `supabase/` 仍保存后端实现，容易造成“存档UI”与“服务端实现”混淆；应拆成独立server工作区后才能有清晰部署所有权。没有读到在线Supabase部署、项目迁移版本或真实RLS状态。

**必须先解决的上线门槛：** `resolveSyncRequestContext`仅base64解JWT，不验signature/issuer/audience/expiry，且无Bearer时接受`x-account-id`；device只读自报header。push/pull通过DB URL连Postgres，不能假设SELECT RLS会自动保护privileged连接。虽然托管Supabase gateway可能验证JWT，当前repo未提供可审计的verify_jwt/JWKS配置，也缺active/revoked设备校验。必须把服务端已验证身份作为唯一context，拒绝body/header覆盖并校验设备状态。[Supabase Edge Auth](https://supabase.com/docs/guides/functions/auth)，[RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)。这是**未上线代码的P1发布阻断**，不是声称线上发生越权。

| Feature | 已有实现 / 当前边界 | 单独问题与建议 |
|---|---|---|
| `account-signup-login` | docs标 locally shipped / deferred runtime | 与live session、设备注册、恢复链一起验收；UI给pending/失败/可恢复引导，不凭mock通过判定真登录完成 |
| `supabase-schema-migrations` | 11 SQL migration文件；accounts/device/blob/nonce/commit/rekey等 | **P1** 缺线上migration receipt与空库演练；将schema fingerprint、RLS enabled与role grants随发布归档。`W:apps/release-site/supabase/migrations/` |
| `rls-policies-and-tests` | 12个列出的业务表RLS与owner/active-device SELECT策略，client write关闭 | **P1** 只保障正确JWT context下的普通DB角色；privileged函数必须自己授权；补真实数据库双账号/撤销设备负例。`.../20260519000006_rls_policies.sql:14-16,54-66,103-109` |
| `rls-fuzz-property` | property测试存在；integration需显式flag/Docker | **P1** 默认smoke并不执行真实SQL；测试README称G9 nightly，但当前两份GitHub workflow未见G9。将真实integration变成CI可见gate，不是跳过算pass |
| `push-edge-function` | Deno入口+SQLadapter，mutation dedup、revision、per-record事务 | **P1** 认证context薄弱；批次大小未限制；revision先读后取得commit锁，再无条件upsert，两个并发同base请求可能都过比较。把锁/原子CAS放比较之前，记录conflict与幂等结果。`functions/_shared/request-context.ts:6-39`；`sync-push/handler.ts:163-211`；`postgres-sync-db.ts:146-160` |
| `sync-engine-push` | transport、crypto、revision、批处理合同和测试 | **P1** 当前Web App没有串接完整引擎，默认outbox不等于durable backend job；真实transport/retry/401/429/kill9必须集成验证。`W:packages/plugin-account/src/sync-engine.ts` |
| `sync-engine-pull` / sync-pull function | sinceCommitSeq/limit/分页/记录投影 | **P1** 函数依赖同一薄弱context；缺active-device检查；cursor与account head并发读取不是一致快照。用受验证session、稳定分页界限与重放不丢失测试。`sync-pull/handler.ts:57-85,93-103` |
| `commit-seq-authority` | monotonic sequence +双advisory lock；public execute已revoke | **P2** 文档写REPEATABLE READ，SQLadapter `begin`没有显式指定隔离级别；并发语义需要真实DB证明。`20260519000005_commit_seq_rpc.sql:17-59`；`postgres-sync-db.ts:40-51` |
| `nonce-lease-server` | nonce ledger、lease RPC和防重用约束 | **P1 / 恢复同步前** 验证租约过期、重启、时钟变化、设备撤销与冲突shadow路径全部消费nonce；全SQL事务而非JS mock证明。`20260519000003_blob_tables_and_nonce_defense.sql:37-54` |
| nonce ledger访问边界 | `public.used_nonces`有append-only trigger，但迁移中未见RLS或客户端role revoke | **P1 / 上线前** 不能因“其余表RLS全开”漏掉nonce表；真实Data API grants未查，不能声称已暴露。显式移到private schema或revoke/enable RLS，验证anon/authenticated不能读写/插入占用nonce。`20260519000003_blob_tables_and_nonce_defense.sql:43-54`；`20260519000008_nonce_lease_rpc.sql:188-204` |
| `recovery-proof-edge-function` | handler合同、签名/挑战测试存在 | **P1** 真实Deno入口固定501 `recovery_proof_database_adapter_not_bound`，runbook却给deploy命令；接DB/签名adapter并做真实过期/重放/账号绑定验证。`functions/recovery-proof/index.ts:41-49` |
| `onboarding-backfill-ui` / backfill handler | acknowledgement签名合同存在 | **P1** backfill目录只有handler无index/serve可发布入口；runbook deploy该function不能产生完成服务。补入口、DB adapter、nonce挑战消费及失败续进度 |
| `rekey-two-phase` | staging/commit/rollback协议与SQL迁移/测试 | **P1 / 上线前** 强杀重启、部分batch上传、老设备撤销、backup兼容必须真实DB演练；UI展示阶段与安全恢复动作，不称普通保存 |
| `audit-log-integrity` | server hash链与SQL审计触发/合同 | **P2** 测试与真正ingest/告警/保留/访问控制分开；没有持久sink不能称生产审计。恢复后核验链与运营可检索性 |
| `web-sync-blob-driver` | Web端encrypted blob storage driver/契约 | **P1** 本地写成功不等云ack；UI展示device-local/account-sync/sync pending三态；只允许D4 account-sync实体进入transport |
| `web-encrypted-indexeddb-cache` | 加密IDB与适配代码 | **P2** IDB清理/配额/版本升级/密钥不可用下可恢复性；加密不等于防本机活跃XSS，需CSP和数据边界配合 |
| crypto foundations（AES-GCM / HPKE / Ed25519 / Argon2 / key vault） | 已有Rust/TS协议与向量测试，属于sync基础 | **P1 / 生产前** RFC向量green只证明算法块；不能代替provider接线、key rotation、备份恢复、浏览器/原生一致性。每种密钥失败应有可理解恢复路径；新平台原生验证仍不可省 |
| 账号删除 / 延期清理 | runbook明确account-delete function未交付；schema仅有scheduled字段 | **P1 / 真实账号前** 没有后台job/cron实现就不能承诺关页后删除/清理自动继续；增加持久删除任务、进度receipt、重试与最终确认。`W:docs/runbooks/supabase.md:78-84` |

本次已运行 `pnpm --filter @repo/release-site-archive exec vitest run` 的 sync-push、sync-pull、protocol-integrity、rls-policies 四套：**20 passed、4 skipped**；跳过的是真实RLS integration，不报告为通过。

### 协议、安全与恢复基础 feature 逐项补充

以下行逐一读取了当前W的feature状态面板/Deferred Gates，并定位相应Rust或TS实现归属。它们很多是文档anchor，产品源码物理位于 `apps/desktop/src-tauri/src/crypto/`，不能用“anchor目录没有src”认定未实现。表中历史测试通过只表示仓库已记录，本次未重跑这些密码学/硬件测试。

| Feature | 当前现状 / 限制 | 对应优化建议与证据 |
|---|---|---|
| `aes-gcm-aead-core` | SHIPPED；release性能与独立review deferred | **P1 / 解冻前** 补目标硬件release benchmark、nonce失败与corrupt tag用例，保持算法与包装协议分开。`packages/aes-gcm-aead-core/docs/dev_log.md:33-35` |
| `bip39-mnemonic-24w` | SHIPPED；正式独立admission gate deferred | **P1 / 恢复前** 助记词生成/输入校验/退出后恢复全过程验证；UI避免剪贴板意外暴露并提供离线备份确认。该feature dev_log:39-41 |
| `cipher-envelope-codec` | SHIPPED；24小时fuzz仍deferred | **P1 / 上线前** 覆盖截断/过大/版本/字节序恶意envelope；长度上限与稳定错误码。该feature dev_log:33-35 |
| `crypto-deps-lockdown` | SHIPPED；依赖锁与供给链gate存在 | **P2** 对长期暂停的crypto栈做受控依赖刷新；保持锁文件、Rust feature组合与安全CI一致。该feature dev_log:6-14 |
| `crypto-tauri-commands` | Shipped locally with deferred runtime gates | **P1** 真window身份、keyvault state注入和命令capability负例完成后再宣传native crypto闭环。该feature dev_log:9,17 |
| `deterministic-cbor-aad` | SHIPPED；原anchor记跨语言/交换blob验证deferred，后续Web runtime有向量 | **P1** 把后续向量证据回填原gate，做Rust↔真实浏览器双向字节级比较；防看板一处完成另一处deferred。该feature dev_log:33-35；web-browser-e2e-crypto-runtime dev_log:24-27 |
| `ed25519-recovery-signing` | TS/Rust签名模块与tests；独立review deferred | **P1** 恢复挑战的过期、一次性消费、错误account、replay与设备撤销需要server端验证。该feature dev_log:43-45 |
| `hpke-per-device-wrap` | SHIPPED；官方vector gate指向后续#35 | **P1** 将RFC gate实际结果、浏览器/原生interop与新设备上传链关联，不允许仅本地wrap成功算跨设备成功。该feature dev_log:42-45 |
| `kdf-primitives` | SHIPPED；autorun跳过cross-vendor review | **P1 / 公发前** 参数迁移、低内存设备、取消/失败不半写密钥；记录release耗时分布。该feature dev_log:34-36 |
| `keychain-bridge-macos` | secret_set/get/del命令SHIPPED | **P2** 真签名安装、Keychain锁定/拒绝/重装/签名身份变更测试；UI错误区分无密钥与无权限。该feature dev_log:10-21 |
| `keychain-opaque-handle` | SHIPPED，sandbox runtime证据deferred | **P1 / MAS前** 对目标签名entitlement做真实ACL/跨window禁止取值验证；handle失效可恢复。该feature dev_log:18 |
| `rust-keyvault-opaque-handle` | SHIPPED；capability gate交给后续 | **P1** 清晰handle生命周期与重启rehydrate；拒绝无权限window、过期handle、卸载后引用。该feature dev_log:37-40 |
| `x25519-device-keypair` | 有keypair/Keychain/zeroize；签名ACL与Supabase upload deferred | **P1** 两设备真正注册/撤销/轮换测试；设备页展示上传是否ack。该feature dev_log:35-47 |
| `sqlcipher-local-db` | SHIPPED；早期dump/CLI compatibility deferred；后续D有nativeDB基础 | **P1 / 迁移前** D真实数据库导出/恢复/密钥损坏/系统重启验证，统一关闭重复旧gate。该feature dev_log:37-40 |
| `realtime-private-channel-config` | locally shipped，部署与跨账号订阅deferred | **P1** 当前迁移7第9行ALTER受新平台约束影响，需适配；断开后必须cursor补拉，不能依赖Realtime当持久队列。该feature dev_log:14,22；migration7:9-26 |
| `rfc-test-vectors-gate` | SHIPPED，向量验证是协议块证据 | **P2** 把实际向量版本和Rust/Web执行结果固定到CI；不要把向量通过替代密钥生命周期安全验收。该feature dev_log:3-8 |
| `tla-protocol-model` | 最新记录真实TLC bounded run通过，不再是早期无Java状态 | **P2** bounded model不是所有生产网络并发的形式化证明；协议修改后重跑，保存状态上限/配置。该feature dev_log:37-45 |
| `protocol-integrity-integration-tests` | 本地协议regression有；Supabase仍mock/local | **P1** 同账户多设备、恶意客户端、真实DB隔离/事务/失败重试补齐。该feature dev_log:16-17 |
| `single-table-todos-e2e` | SHIPPED但live Supabase + 2-Mac smoke明确deferred | **P1** 不应对用户承诺跨设备todo可靠同步；完成关页/两Mac/离线冲突/删除/重启闭环。该feature dev_log:13-18 |
| `recovery-rehearsal-3-rekey-kill9` | **BLOCKED**；只有四类mock恢复scenarios | **P1 / 上线前** 真打包App在四个rekey点kill/restart并核验无数据/密钥丢失；这是暂停栈未完成硬gate。该feature dev_log:5-6,13,21 |
| `web-browser-e2e-crypto-runtime` | SHIPPED，有AES/Argon2/buffer/policy/vector tests | **P1 / 真实同步前** Safari/WebCrypto/跨Rust互操作、refresh/reopen key rehydrate、IDB quota与老envelope升级验证。该feature dev_log:7-18 |
| `web-sync-crypto-contract-preflight` | SHIPPED；明确mock-only与live gates deferred | **P2** 同步合同版本/浏览器类型/二进制序列化schema集中维护，后续运行时实现证据回填。该feature dev_log:24-38 |

**当前平台变化需要回归：** 已查Supabase官方2026-07-14变更，Realtime schema禁止直接CREATE/ALTER/DROP，仅`realtime.messages`的RLS policy修改保留；当前 `20260519000007_realtime_private_channels.sql:9` 仍执行 `ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY`。从该公告推断，这条迁移存在当前托管版本兼容风险；未对真实项目执行，不能称已复现生产失败。应在staging验证并移除不属于应用的schema改动，保留授权policy。[Supabase官方变更](https://supabase.com/changelog/realtime-schema-locked-down-against-modification)。

## 7. Admin：6切片与10页面逐项

W/dev只见原型/PENDING；独立A分支已有Vite Admin与6/6 SHIPPED，且runbook明确**mock-authenticated、无真实backend、promotion/deploy deferred**。下面按A真实实现评判，不漏掉未合并工作，也不把它称线上运营系统。

| Roadmap feature | 当前实现 | 问题 / 优化建议 |
|---|---|---|
| `xai-admin-dashboard-shell` | 独立app/route guard/布局/10页面；`app_metadata.xai_admin`或构建mock flag | **P1 / promotion前** 真admin权限必须服务端验证；production build拒绝mock claim；界面持久Demo标识。`A:apps/admin/src/auth/adminClaim.ts:45-61,71-105` |
| `xai-admin-data-contracts-rbac` | typed read models、permission keys、guarded commands与负例测试 | **P1** 浏览器RBAC只是交互保护，后端授权尚无实现；每API校验role/scope/租户并返回稳定error code |
| `xai-admin-users-orgs-billing` | fixture read adapters、detail/query seam；billing mutation gate | **P1** 禁用/转移/套餐并未真实落库；不要用成功toast冒充业务成功，呈现simulated。`A:apps/admin/src/adapters/index.ts:1-11`、`commands.ts:1-10` |
| `xai-admin-feature-ai-provider-control` | feature/quota/provider handle/model routing合同 | **P1** 无实际server路由或secret store，用户端未受其控制；接版本化配置API、dry-run、回滚、发布审计，UI清楚区分草稿与已发布 |
| `xai-admin-audit-ops-queue` | fixture-seeded内存append chain、纯函数ops read model | **P1** 刷新/关页丢新增审计，默认digest是非密码学FNV mock；不能叫不可篡改生产审计。服务端事务outbox+append sink+retention；说明来源/更新时间。`audit/auditStore.ts:2-10,36`、`audit/hashChain.ts:93-114,126` |
| `xai-admin-deploy-observability` | 独立wrangler project配置、CSP/env guards、文档smoke与telemetry seam | **P1 / promotion前** 没有已部署证明、真实auth/telemetry仍deferred、manual checklist不等实测。产物/域名隔离、真实浏览器全部页面验收、release SHA和告警证据。`docs/deploy-observability/release-operator-runbook.md:79-92,162-206` |

| 页面 feature | 现状与针对性体验建议 | 后端/稳定性建议 |
|---|---|---|
| 总览 / 运营队列 | fixture KPI与运营队列布局；加采样时间、分母/口径、趋势可解释性，队列优先避免十几个等权KPI | 聚合服务返回source freshness；空/错误/部分失败分开，不能把mock heatmap作实际用量 |
| 用户管理 | typed users query、详情与confirm；保留筛选、分页位置和选中状态，批量动作显示数量/范围 | 服务端分页、租户scope、批量逐项结果、幂等command ID；避免前端全量筛选 |
| 组织 / 空间 | mock org detail/transfer；转移所有权显示新旧owner与影响 | 乐观锁/最后owner不变量、事务转移、审计、失败回退；不能只type-to-confirm |
| 功能管理 | rollout/quota合同；灰度编辑提供预览受影响人群、冲突提示与撤销 | 配置revision、服务端validation、safe rollout/fallback、发布receipt |
| AI用量 / 配额 | mock消费者和策略；明确周期/时区/币种/估算vs结算 | authoritative usage ledger、限额并发扣减、请求幂等、延迟费用校正 |
| Provider / 模型路由 | secret handle显示，不暴露key是正确方向；加入健康/降级/最近错误 | encrypted secret store、rotation、allowlisted egress、真实provider probe与熔断；不能浏览器持密钥 |
| 角色权限 | 浏览器权限矩阵；dangerous权限解释、变化差异、最小权限preset | 服务端permission key authority、token刷新、self-lockout防护、撤销即时生效 |
| 订阅计费 | mock MRR/ARPPU；注明计算口径与账期，避免假金额视觉承诺 | Stripe webhook真相源、签名验真/重放幂等、账单补偿与对账 |
| 审计日志 | 本地链fixture；显示actor/target/result，并支持事件详情和关联任务 | 持久append store、真实IP来源、不可删角色限制、导出可验证digest |
| 系统设置 | 组织安全与Webhook原型；显示已应用/待发布，敏感变更重新认证 | 2FA/SSO/IP policy必须后端强制，Webhook只允许后端发送并防SSRF，secret不回显 |

Admin关闭页后没有常驻管理进程或真实数据写入需要延续，fixture会重新构造；未来真实操作应返回持久operation ID，关页再开可查结果。

## 8. Site：逐 feature

| Feature | 当前现状 | 优化建议 |
|---|---|---|
| 官方营销 / 下载入口 | site仍PROPOSED；旧 `apps/release-site` 是archive-only，不是新的生产站点 | 明确产品版本/平台、下载前提与Demo入口；复用正式brand tokens；不要对外链接到历史console mock。`W:apps/release-site/README.md:1-12` |
| DMG / MAS下载 | 旧页只有RC门槛文案，没有真实下载闭环 | 签名/notarization完成后统一release manifest、架构/版本/校验和、安装说明与回退包。`W:apps/release-site/app/page.tsx:59-63` |
| 更新feed / release notes | desktop updater配置仍placeholder，site无独立feed实现 | 同一release源生成更新feed/下载页/changelog；校验timestamp/channel/signature，避免官网与updater不同版本 |
| 账号/隐私/导入导出历史页 | archive包含历史mock，当前不得当用户中心 | 真账号功能落正式Web/Auth surface；旧站保持reference-only，避免重复入口和假删除/假导出误导 |

## 9. 本次验证与可执行修复顺序

已验证：GitHub部署状态/失败日志；公开首页、CSP、SW、map HTTP；W/D/P/A冻结源码；backend 4套smoke；本地无真实网络/数据的两项探针。

本地探针输出：

```text
SW offline simulation:
  /app/tasks status=200 body=html app shell
  /assets/index-audit.js FAILED offline
  Precached paths: ['/', '/index.html']

Sync request context probe:
  No Authorization header: {accountId:'audit-account',deviceId:'audit-device'}
  Invalid signature: {accountId:'audit-forged-sub'}

Vitest:
  Test Files 4 passed
  Tests 20 passed | 4 skipped
```

这些探针证明代码级行为，不是线上越权测试或真实浏览器离线E2E。没有执行Mac App GUI、当前SHA签名打包、真实Supabase query/migration、账号数据变更、邮件/通知发送、deploy或token修改。精确生产SHA与部署时间仍未知。

建议依次落地：

1. **P1先恢复版本可观测性与部署链**：正确credential、预览成功、build-env校验、artifact/production receipt、关键生命周期CI。
2. **P1保障用户状态**：时间状态统一绝对时间与恢复规则；离线壳真正缓存资源；native bridge提交确认、通知持久ledger和系统调度。
3. **P1在真实账号开放前完成后端**：验签/设备授权、原子CAS与真实RLS integration、recovery/backfill/删除可运行入口、durable jobs与重放。
4. **P1明确未上线合同**：Admin6/6只代表mock切片交付；sync transport缺失、site未启动、plugin Phase2 PARTIAL在看板持续可见。
5. **P2再优化日常体验与效率**：少轮询/少整表写、批量错误结果、恢复/备份覆盖清单、配置应用状态、数据来源与更新时间；所有“保存/同步/完成”文字绑定真实ack。

记忆仅用于独立web/dev治理与审查顺序，所有版本/实现结论均由本次工具核实；对应记忆 `MEMORY.md:42-44`，rollout `01a08006-1af2-7ff3-bedb-96da7b3406b2`。

## 附录：可复查命令与脱敏证据

### A. GitHub部署状态（只读）

```sh
gh run list --workflow deploy-web.yml --limit 8 --json databaseId,headBranch,headSha,status,conclusion,createdAt,updatedAt,url,event
gh run list --workflow deploy-web.yml --branch main --limit 4 --json databaseId,headSha,status,conclusion,createdAt,updatedAt,url
gh run list --workflow deploy-web.yml --status success --limit 5 --json databaseId,headSha,headBranch,conclusion,createdAt,url
gh api 'repos/jinlong17/XAI_Desktop/deployments?per_page=5' --jq '.[] | {id,sha,ref,environment,created_at,statuses_url}'
gh run view 34214653502 --log-failed | rg 'built in|Authentication error|Wrangler could not list'
```

本次选取的脱敏记录：

```json
{
  "webRun": {
    "databaseId": 34214653502,
    "headBranch": "web",
    "headSha": "9257be40c03216b1006691bfa289bd29d6dfe839",
    "event": "pull_request",
    "status": "completed",
    "conclusion": "failure",
    "createdAt": "2026-09-08T10:17:27Z",
    "updatedAt": "2026-09-08T10:18:14Z",
    "build": "built in 10.11s",
    "failure": "Authentication error [code: 10000]",
    "stage": "Verify Cloudflare credentials"
  },
  "mainRun": {
    "databaseId": 27061053762,
    "headSha": "9a61669b1f67197f6f75f341c79ef35be8a6d0e4",
    "status": "completed",
    "conclusion": "failure",
    "createdAt": "2026-06-06T11:28:32Z",
    "updatedAt": "2026-06-06T11:29:16Z"
  },
  "retainedSuccessRuns": [],
  "githubDeployments": [],
  "cloudflareProductionSha": null,
  "cloudflareProductionShaUnavailableReason": "No local API token; deployment metadata unavailable"
}
```

### B. 公开HTTP核查

```sh
curl -fsSI https://xai-web-console.pages.dev/
curl -fsSL https://xai-web-console.pages.dev/
curl -fsSI https://xai-web-console.pages.dev/assets/index-BLMlO8WD.js.map
curl -fsSL https://xai-web-console.pages.dev/sw.js
```

观测摘要（未保留包含网络报告地址的完整response headers）：

```text
2026-09-08T23:15:53Z GET/HEAD /
  status: 200
  content-type: text/html; charset=utf-8
  etag: 4eea9ff5b35abf52b5e0b1cc3353df05
  cache-control: public, max-age=0, must-revalidate
  main JS: /assets/index-BLMlO8WD.js
  connect-src contains: api.anthropic.com, api.openai.com, api.groq.com
  connect-src does not contain: api.deepseek.com

2026-09-08T23:16:57Z HEAD /assets/index-BLMlO8WD.js.map
  status: 200
  content-type: application/json

GET /sw.js
  CACHE_NAME: xai-web-shell-v1
  APP_SHELL_URLS: /, /index.html
  fetch fallback: caches.match(request) ?? fetch(request)
```

本机额外尝试 `CI=true pnpm exec wrangler pages deployment list --project-name xai-web-console --environment production --json`，只得到“non-interactive environment需要CLOUDFLARE_API_TOKEN”，未启动登录、未改credential。没有把该失败解释为Cloudflare服务不可用。

### C. 本地JWT context探针（不访问网络）

在仓库根执行；仅使用审查虚构账号，不涉及用户真实数据：

```sh
node --experimental-strip-types --input-type=module <<'JS'
import { resolveSyncRequestContext } from './apps/release-site/supabase/functions/_shared/request-context.ts';
const request1 = new Request('https://local.invalid/sync/pull', {
  headers: { 'x-account-id': 'audit-account', 'x-device-id': 'audit-device' },
});
const payload = Buffer.from(JSON.stringify({ sub: 'audit-forged-sub' })).toString('base64url');
const request2 = new Request('https://local.invalid/sync/pull', {
  headers: { authorization: `Bearer x.${payload}.not-a-valid-signature` },
});
console.log('No Authorization header:', resolveSyncRequestContext(request1));
console.log('Invalid signature:', resolveSyncRequestContext(request2));
JS
```

实际输出见§9。本探针不评价托管gateway现有配置，也没有请求任何真实账户接口。

### D. 后端smoke与离线SW探针

```sh
pnpm --filter @repo/release-site-archive exec vitest run supabase/tests/sync-push.test.ts supabase/tests/sync-pull.test.ts supabase/tests/protocol-integrity.test.ts supabase/tests/rls-policies.test.ts
```

本次Node `v24.16.0`、Vitest `3.2.7`；2026-09-08 16:18:58 PDT启动，2.78s；4套通过，20测试通过，4真实integration跳过。未启动Docker或真实Supabase。

SW探针用 `node:vm` 执行**当前仓库实际** `apps/web/public/sw.js`，mock install/cache与始终抛offline的fetch；可重现代码如下：

```sh
node --input-type=module <<'JS'
import fs from 'node:fs';
import vm from 'node:vm';
const events = {};
const cached = new Map();
const writes = [];
const cache = { addAll: async paths => {
  for (const path of paths) {
    cached.set(path, new Response('html app shell'));
    writes.push(path);
  }
}};
vm.runInNewContext(fs.readFileSync('apps/web/public/sw.js', 'utf8'), {
  self: { addEventListener: (name, fn) => events[name] = fn,
    skipWaiting: () => {}, clients: { claim: () => {} },
    location: { origin: 'https://audit.invalid' } },
  caches: { open: async () => cache,
    match: async request => cached.get(typeof request === 'string' ? request : new URL(request.url).pathname),
    keys: async () => [], delete: async () => true },
  fetch: async () => { throw Error('offline'); }, URL, Response, Promise,
});
await new Promise((resolve, reject) => events.install({ waitUntil: p => p.then(resolve, reject) }));
for (const [path, mode] of [['/app/tasks', 'navigate'], ['/assets/index-audit.js', 'cors']]) {
  try {
    const response = await new Promise((resolve, reject) => events.fetch({
      request: { method: 'GET', url: 'https://audit.invalid' + path, mode },
      respondWith: p => p.then(resolve, reject),
    }));
    console.log(path, response.status, await response.text());
  } catch (error) { console.log(path, 'FAILED', error.message); }
}
console.log('Precached paths:', writes);
JS
```
