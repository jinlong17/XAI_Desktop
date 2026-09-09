# MED-01 / MED-02 独立验收

- 产品固定：`6887879`；所有产品源码及 `@repo/*` 导入来自 `git archive` 快照。独立验收者未编写本轮 Meditation 实现。
- 合同：`docs/reviews/20260908-full-product-audit/TODO.md:111-112`。
- 结论：MED-01、MED-02 在当前 Web 产品合同内均建议关闭；未发现新的阻断问题。不是部署或操作系统后台音频认证。

## 证据与业务判断

`node docs/reviews/web-meditation-independent/verify-native.mjs`：8 组严格断言 PASS，真实 Chromium 临时 profile、原生 localStorage / Web Locks / AudioContext。任一断言失败会导致非零退出。

1. 实际 Start / Pause 持久化同一 sessionId；Date.now 偏移后使用绝对经过时间；暂停期间的 1,000 秒缺席不计入 elapsed。
2. 刷新后出现显式恢复入口，暂停记录保持累计时间；打开暂停会话不播放声音。注入 AudioContext.resume 拒绝后显示错误；**没有 autoplay-policy 放行参数**，CDP Input 鼠标点击实际 Retry audio，页面断言事件 `isTrusted`，真实 AudioContext 恢复并启动声音源。
3. 实际 React 模块卸载（路由卸载的组件生命周期）后所有启动的环境声音源停止。原生计数为 starts=2 / stops=2。
4. 完整终止并重新启动 Chrome（native.log 中两个不同 PID），同一 profile 的 running sessionId/deadline 保留；没有自动打开播放器或播放。实际点击恢复入口后才开始音频。
5. 超过 deadline 后 durable phase=ended、reason=elapsed、endedAt 精确等于原 deadline；声音源停止。重复 reconcile 不改变持久字节或增加 revision。
6. 真实 Storage.prototype 对活动 key 注入 quota：Pause 不改变原持久字节，错误及 Retry 按钮可见且没有被覆盖；恢复写入后真实点击 Retry，最终 paused。
7. A 的原生 Web Lock 保持不释放，切换 B 后可以立即 start；释放 A 后旧命令返回 false，A 原始字节与 B 数据均不被旧操作修改。
8. 两个真实页面共享原生存储与锁：A pause 后 B 陈旧 pause 被拒并提示 conflict，B 新 resume 成功；重复 start 被拒后新 pause 成功；两页并发 end 只增加一次 terminal revision。另验证坏 JSON 原字节可导出且 start 不覆盖；移除 Web Locks 时拒绝 start、没有假保存。

`node docs/reviews/web-meditation-independent/verify-tests.mjs`：固定同一快照复跑原包全量测试，**16 文件 / 134 测试 PASS**，结果见 tests.log。此层保留作者原业务断言，不能与 native 的 8 组相加当作产品覆盖率。覆盖 completion quota、timer 清理、无限会话、时钟回拨、延迟 resume / 卸载取消、偏好保存等邻近分支。

## 审查结果

- `internal/sessionController.ts`：elapsed 根据累计时长和 runStartedAt 推导，固定会话只在 start/resume 建立 deadline；paused 不累加缺席时间。所有活动写入在 account/generation/feature 锁内权威重读，revision/sessionId 冲突不被保存为永远重试的旧意图。
- `MeditationModule.tsx`：retain 绑定观察生命周期；重新进入必须显式打开保存会话，账户变化关闭播放器。
- `MeditationPlayer.tsx` 与 `internal/useAmbientAudio.ts`：ended/paused/保存错误停止播放；卸载及账户变化取消等待中的 resume。deadline 同时安排 Web Audio gain 归零，最终 ended 后 controller 停止其计时间隔。
- 活动数据按已解锁业务账户 generation 隔离；该 generation 与登录 IndexedDB 会话代次没有混用。

## 边界与复跑说明

- native.tsx 的首七组流程以作者探针为起点，但独立固定源码，并把所有 DOM `.click()` 改为真实 CDP Input 点击，去掉 autoplay 绕过，补入可信点击断言；双页面命令及坏数据/无锁断言是本次新增。没有把作者 PASS 当作独立证据。
- 时间边界通过 Date.now 偏移测试，未实际等待 15 分钟或对用户机器执行锁屏。证明绝对时间恢复算法及真实进程重开；不声称完成了硬件扬声器、macOS 锁屏、所有浏览器权限配置或生产 PWA 验证。
- 完整关闭浏览器后没有 JavaScript 或音频继续运行；再次打开时根据 durable deadline 恢复/结算。当前 Meditation 保存活动及 ended 证据，不承诺新增历史列表。
- 双页面部分直接调用产品 controller，真实 UI 恢复/暂停/错误/重试部分通过实际按钮验证；没有把 controller 双页面称为完整 Shell E2E。
- 首次独立测试配置误把 setup.ts 当作测试套件，导致无套件错误；移除额外 include 并恢复 Vitest 默认收集后重跑，未删改或弱化任何产品测试。
