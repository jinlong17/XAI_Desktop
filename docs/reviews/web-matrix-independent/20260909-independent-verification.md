# REL05 Matrix 保存恢复独立验收

产品固定 `9ebc48c`，缺陷基线 `9ebc48c^`。独立验收者没有参与这次 Matrix 产品实现。结论：本次 Matrix 创建/移动保存恢复子项 PASS；整体 REL05 保持进行中。

## 独立证据

全部产品及 `@repo/*` 导入从对应 Git archive 快照解析，第三方依赖复用本机安装。Chrome 使用临时 profile / 下载目录及合成账户。没有真实后端或用户数据。

- `node docs/reviews/web-matrix-independent/verify-native.mjs --before`：正确旧版失败，exit 1。原生 Storage quota 下 dialogRetained=false、draftRetained=false、errorVisible=false、falseEvents=1；原始字节没有改变。保留 before.log 和失败断言堆栈。
- `node docs/reviews/web-matrix-independent/verify-native.mjs`：固定修复版 6 组严格断言 PASS。
- `node docs/reviews/web-matrix-independent/verify-tests.mjs`：固定同一快照，原包 17 文件 / 86 测试 PASS，未修改产品测试断言。

| 场景 | 实际检查与结果 |
| --- | --- |
| 原始保存失败 | 对实际 MatrixModule 编辑器输入、保存，原生 Storage 注入 quota；dialog 和草稿保留、错误可见，存储原字节保持；失败移动事件为 0 |
| 真实 JSON 下载 | 修改失败后的最新标题、study 标签、目标 q4，点击 Export draft；未覆写 Anchor.click 或截获 Blob 代替下载，读取 Chrome 实际下载文件 matrix-unsaved-change.json，断言 latestDraft / target 和 recovery.stored 原字节 |
| 最新草稿 retry | Retry 后关闭 dialog；q4 恰好新增一条最新标题和标签，原 q1 卡仍然存在，不以最初失败 proposal 覆盖最新编辑 |
| 移动事件真实性 | 原生键盘事件触发实际卡片移动；写失败原 q1 保持、事件 0；恢复 Storage 后 Retry，卡片落 q2 且事件恰好 1 |
| baseline 冲突 | 移动写失败后注入包含 external 卡的新持久状态；Retry 保留新状态完整字节，不发旧移动成功事件，显示 Newer stored data |
| A → B 隔离 | A 保留失败编辑器后切换 B，调用实际 Retry / Export；A 原字节和 B 数据均不变，下载目录没有新文件，Export failed 可见 |

## 源码复核

`usePersistedMatrix.ts` 将 shared setter 的 boolean 传播给 caller，先保存成功才触发移动事件；pending proposal 保存原 baseline，拒绝与外部新字节冲突的重试。`MatrixModule.tsx` 仅成功时关闭 composer；`MatrixComposer.tsx` 将编辑中的标题、标签和目标送入重新保存及导出，因此失败后继续编辑能恢复最新稿。捕获的 accountScope 阻止旧编辑器借当前账户提交或导出。

## 验收边界

- 功能探针直接调用实际 DOM button click、input 与 KeyboardEvent，使用原生 dialog/Storage/Chrome 下载；不是人工鼠标、完整 Shell 或正式部署 E2E。
- baseline 是同步比较，并非跨标签事务。最终检查与写入之间的另一标签竞态未由该修复消除，作者没有声明 Web Locks。该边界没有被本次 baseline PASS 隐藏。
- 未增加跨刷新草稿持久化、导入、坏数据恢复或修改 seed-on-empty；本次只验收分派的 Matrix 创建/移动恢复子项。
- 初次独立构建未配置第三方 React 解析路径，构建失败；补上已安装依赖 nodePaths 后重跑。所有产品源码仍固定到 Git 快照，没有更改业务断言。
