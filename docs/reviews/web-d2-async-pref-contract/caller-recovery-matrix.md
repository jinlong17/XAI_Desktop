# 调用方恢复能力与剩余验收

检查点：Header固定73b4eb9 / Astra106f1d8完整当前会话恢复接受；Pomodoro051212a、Collaborate6254cb4接受保持有效。其余writer继续单独完整合同；此矩阵不关闭编号。

| 调用方 | 真实保存与最新草稿重试 | 实际草稿导出 | 浏览器卸载 | 普通路由及自愿退出账号 | 强制失效/崩溃的未提交恢复 |
| --- | --- | --- | --- | --- | --- |
| Smart Lists完整map | Astra a663891原39接受；a2c0fe0回归通过 | Astra75aa0e8完整export接受，父实际disk/full-denial通过 | 当前未保存/Retry/Discard等合同通过；非崩溃保证 | Astra75aa0e8当前用户恢复有界接受，same-turn/POP/owner/cleanup通过；Stay移动44px缺口已修并实测通过 | 开放；不是beforeunload可保证的能力 |
| Dashboard账号便签 | 既有d129950/Astra4a66e86保留；完整Header73b4eb9/Astra106f1d8接受，正常保存/失焦/最新重试通过 | 当前memory/disk精确导出、全拒绝和live epoch拒绝通过 | 当前真实草稿及旧frozen A兼容警告通过，source-only不误报 | 实际注册Host12、native导航/slow pointer/first-intent/owner/unmount通过 | 开放；本接受不保证强制失效或崩溃后未提交恢复 |
| Dashboard设备位置 | 既有830dd2b/Astra a6b50c3保留；完整Header73b4eb9/Astra106f1d8接受，preflight最新意图及单写uncertainty Retry通过 | 当前/owner/locked/device-only及混合导出通过；不借旧账号备注 | 实际移动/最新失败保护，source-only/no-move不误报 | 实际host/两方向partial成功/targeted discard与epoch设备恢复通过 | 开放；已保存位置重开不等于未提交拖动崩溃恢复 |
| Pomodoro六项设备偏好 | 既有Dv2保留，2962b49 / Astra051212a完整当前用户合同接受 | 完整六值memory/disk导出；全拒绝、epoch、pending和mixed conflict通过 | 当前实际草稿guard生命周期通过 | 实际注册9/完整Shell8、native route/rail/signout、first-intent与权限清理通过；中英五宽度/hit通过 | 开放；非强制退出/崩溃保证，与active timer/session持久链分开 |
| Collaborate完整三控件 | Astra6254cb4在ad689dd完整接受：原37+新增5通过 | 精确当前实际草稿，native全拒绝/partial/epoch/pending通过 | 当前实际草稿生命周期通过，非崩溃保证 | 实际host8/最终native departure、scope权限/focus/英中44px通过 | 开放 |
| 其余直接typed、scoped/raw、业务writer与secrets | 03b0363库存与D2全writer合同逐项处理，不把只读投影计入writer | 每个实际编辑入口分别核对 | 分入口核对 | 分入口核对 | REL-09明确包含日记、AI输入、便签、账单等，不能只检查设置页 |

执行顺序：先让Astra完成Smart Lists的8565ca6整合同验收并处理其所有正确FAIL；再为Collaborate现有已转换设置补齐上述缺失列，同时按库存明确邻近两个仍旧writer的完整范围；之后按D2台账推进其他调用方。这个次序不授权改写storage/auth架构、恢复密钥、启用跨模块同步或部署。SET-06的Smart Lists任务selector/计数接线仍是独立待办。

原证据入口：[Smart Lists合同](../web-smart-lists-recovery-contract/contract.md)、[存储接受](../web-d2-smart-lists-astra/review-40ffbe1.md)、[导出/卸载](../web-d2-smart-lists-draft-native/review.md)、[实际host](../web-d2-smart-lists-host-native/review.md)、[原生保存恢复](../web-d2-smart-lists-native/review.md)、[直接绑定库存](../web-d2-pref-binding-inventory/review.md)。其余调用方既有合同与报告索引保留于[当前台账](acceptance-status.md)及[接续](next-callers.md)。

下一参与者的实际控件证据已补：[3667985 Collaborate原生基线](../web-collaborate-recovery-native/review.md)。两个device布尔控件在quota下均丢失用户false选择而回true，账号default_share不在此断言范围。需按Astra115efb2报告的mixed-scope建议制定完整三控件合同，再实现；Smart同turn entry仲裁优先修复。

最新增量75aa0e8：Smart当前用户恢复逻辑已按8565有界接受，原entry/host/export/App/39/286/types及新增wrapper5通过；其原各FAIL历史保留。父5f4c4ff另有mobile Stay宽29.61px小于44px的UI缺口，下一Styles批次修复。Collaborate三控件完整实现合同已固定[75aa0e8](../web-collaborate-recovery-contract/contract.md)，Terra正在实施；上述其他调用方缺口不因此变绿。

最新接续c604951：上述Collaborate行已完整更新；历史段落保留。Pomodoro下一合同与实际注册路由8FAIL/1cleanPASS见../web-pomodoro-departure-contract/contract.md，六项Dv2基础24/完成2的既有接受保持有效。

最新接续051212a：Pomodoro完整合同已接受，详见[独立接受](../web-pomodoro-departure-astra/acceptance-2962b49.md)与[同版本原生十模式](../web-pomodoro-departure-native/review.md)。上方历史执行段落保留，不代表尚未完成这些已接受批次。下一Dashboard Header合同由Astra拟定，尚不把其普通离开列标绿。

最新接续106f1d8：完整Header合同已接受，见[独立接受](../web-dashboard-header-departure-astra/acceptance-73b4eb9.md)。上述历史排程段落保持当时语义；Header普通离开列现已按完整证据更新。下一批依据全writer合同及更新库存排程，65个setter绑定不是65个已确认缺陷，也不覆盖所有raw/indirect/secrets入口。
