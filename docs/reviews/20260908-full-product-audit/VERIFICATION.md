# 本轮执行与证据清单

审查日期：2026-09-08。产品代码基线：`9257be40c03216b1006691bfa289bd29d6dfe839`。本文件记录本次运行，不将历史 dev_log 的 PASS 计入本轮数量。

| 检查 | 本次结果 | 范围 / 证据 |
|---|---|---|
| `pnpm --filter @repo/web build` | PASS，968 modules，29.07s | 普通 Vite build，不是安全发布/部署成功证明 |
| `pnpm --filter @repo/web check-types` | PASS | Web TypeScript 检查 |
| `pnpm web:check-colors` | PASS；0 新违规，808 历史项 | 不等于视觉/对比度验收 |
| `pnpm dashboard:verify-static` | PASS | 初始 web/9257be4/dirty0；6 modules、17 records、66 entries |
| `pnpm dashboard:verify-modules` | PASS | 六模块路由与导航合同 |
| `node --check scripts/dashboard/generate-state.mjs` | PASS | 语法，不证明解析语义正确 |
| `python3 scripts/lint/check_portable_sync.py` | PASS | portable agent/skill 同步 |
| Tasks/时间/Board 12 包 | 215 files / 1862 tests PASS | [完整日志](timer-test-existing.log)，具体包表见02 |
| AI/记账/指标/Auth 4 包 | 48 files / 315 tests PASS | 完整命令、套件名、数量见03 §8 |
| Supabase相关 smoke 4 文件 | 20 PASS / 4 SKIP | 命令与输出见04附录；真实RLS integration跳过 |
| 时间/任务10条审查测试 | 10 PASS | [脚本](timer-test-audit.test.ts)、[首次输出](timer-test-audit.log)、[UTC可移植性重跑](timer-test-portability.log)；PASS表示当前行为复现 |
| Auth IDB两种初始化顺序 | 两种 NotFoundError 均复现 | [脚本](auth-idb-audit.mjs)、[输出](auth-idb-audit.log)；全在 fake IDB 内存 |
| 本次产物检查 | JSON语法/计数、Markdown表列数、相对链接、脚本语法 | 129 packages、167 roadmap entries、46 dashboard features、14 project skills、66 registry entries |

时间测试重跑：

```sh
packages/plugin-web-time-tracker/node_modules/.bin/vitest run --config docs/reviews/20260908-full-product-audit/timer-test-audit.config.mjs
TZ=UTC packages/plugin-web-time-tracker/node_modules/.bin/vitest run --config docs/reviews/20260908-full-product-audit/timer-test-audit.config.mjs
node docs/reviews/20260908-full-product-audit/auth-idb-audit.mjs
```

这些是审查用的当前行为断言，修复产品后应转换为期望正确行为的回归测试，不能用它们要求产品保持缺陷。脚本依赖当前 lockfile 安装的依赖。

浏览器通过 Codex in-app Browser 与本地 `127.0.0.1:3108` 的独立 origin、mock-authenticated 模式操作，避免使用真实线上个人数据。覆盖所有主要页面、设置/通知、CmdK、Pet、开发看板三页；验证 Pomodoro Start→刷新、Time Tracker Start→关标签→重开→End、浅深色切换与390 CSS像素部分布局。生产站点仅只读打开，Linear官方文档只作参考。34张截图及前后DOM在screenshots目录；具体步骤、缺陷和采集限制见05。

`pnpm dashboard:serve` 为查看界面自动重建了 gitignored `state.generated.js`，启动后快照转为本次审查短分支/基线HEAD/含审查资料的dirty状态。初始fresh核对与这个后续快照是不同观察时点；没有修改跟踪的 dashboard 状态或把发现写成“已修复”。

部署HTTP/GitHub日志、SW离线缓存模拟、Sync请求context探针见04附录。没有生产写入、实际通知投递、付费AI、付款、账户删除或当前Mac图形界面全量验证。
