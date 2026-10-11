# REL05 Calendar composer CRUD 独立验收

独立固定产品 `a452d40`，基线 `a452d40^`。验收者未参与 Calendar 本轮实现；所有产品及 @repo 导入来自 Git archive，不使用作者工作区 WIP。

结论：本次 Calendar 创建、编辑、删除保存恢复子项 PASS。整体 REL05 保持 OPEN。

## 复现与验证

```sh
node docs/reviews/web-calendar-independent/verify-native.mjs
CALENDAR_VERIFY_COMMIT=a452d40 node docs/reviews/web-calendar-independent/verify-native.mjs
node docs/reviews/web-calendar-independent/verify-tests.mjs
```

第一条故意固定 before，以正确业务断言退出 1：quota 后创建与删除都关闭 dialog、没有可见错误，原存储字节未改。创建的隐藏表单仍有文本（draftRetained=true），不能把这个细节误报为所有内部表单状态都已清空；实际失败是编辑器关闭并伪装完成。

修复版真实 Chromium 8 组 PASS（after.log），同一固定版本原测试 **46 文件 / 343 tests PASS**（tests.log）。没有修改原测试或叠加数量冒充覆盖率。

| 场景 | 独立业务断言 |
| --- | --- |
| 创建 quota | 实际 CalendarModule / EventComposer 保存失败，dialog、输入稿与错误保留，原存储字节不变 |
| 删除 quota | 实际已存在事件的 Delete 失败后 dialog 保留，错误可见，原事件字节不变 |
| 删除 retry | 移除 Storage 故障后 Retry delete 成功，事件删除并关闭 dialog |
| 最新编辑导出 | 失败后改标题和标签；实际 Chrome 下载 calendar-unsaved-draft.json，读取下载文件验证 kind 与当前 form.title / form.tag；没有截获 Blob 或替换 anchor.click 代替下载 |
| 创建 retry | 提交最新标题/标签，只新增一条事件，原事件保留 |
| 编辑 retry | 旧事件修改保存失败仍保留编辑器；Retry 正确更新原 id |
| 新数据冲突 | 外部 raw 更新后旧编辑器不能覆盖；随后派发真实 StorageEvent 使 hook 接收更新，再 Retry 仍拒绝旧 editing entity，最新完整字节不变 |
| A → B | A 失败表单保留时切 B，旧 Retry / Export 拒绝，A/B 字节都不变，下载目录无新文件，导出失败消息可见 |

## 实现核对与边界

`useUserCalEvents.ts` 在捕获 owner 与当前 raw 检查通过后才写；失败抛出而不返回成功。`CalendarModule.tsx` 对旧 editing entity 加比较；`EventComposer.tsx` 捕获保存/删除错误，不关闭失败表单，并导出当前 form。

- 临时 Chrome profile 和下载目录，合成账户，无生产网络凭证。使用实际 DOM input/button/键盘事件与原生 dialog、Storage、下载，不声称人工鼠标或完整生产 Shell E2E。
- 这是同步冲突检测，不是跨标签事务；没有测试或承诺检查与写之间完全消除竞态。
- 明确 Cancel / Escape / backdrop 仍可丢弃稿；无跨刷新草稿持久化、自动导入、坏 schema 恢复或云同步。
- view / week-start 偏好及 AI subscriber 调用合同在本轮修复边界外，未因 composer PASS 一并关闭。
- 初次 before 已在更早且不含 Calendar WIP 的 8e50d8f 复现；最终保留日志重跑在 a452d40^，与 after 配对。所有 after 只在作者固定 hash 后运行。
