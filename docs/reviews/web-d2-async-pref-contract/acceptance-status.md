# 异步偏好保存：逐条验收状态

**限定 a82 切片已接受：固定产品 `20a4591`，Astra 独立结论 `a25423c`。** 完整逐项证据见[最终报告](../web-d2-async-pref-astra-hooks/review-20a4591.md)。原始拒绝报告及 FAIL 日志保留；本结论不关闭全部 D2、REL-05、AI-02 或尚未转换的调用方。

| 合同范围 | 结论与证据 |
| --- | --- |
| 注册键、codec、运行时schema、source/default拒绝 | 接受。engine650原21/repair7；当前hooks domain与异常原断言通过。 |
| 四个公开async接口共用锁、functional、noop/reset、owner/marker/tombstone、迁移 | engine e75d5b3接受；关键source blob在20a相同，保留有界控制，不声称全writer已转换。 |
| 两个hook functional、pending后续编辑、active retry | 接受。独立原9、原作者17重跑及父原2；物理167/UI滞后原失败已修复。 |
| reset失败、reset后pending、reset→new edit、disposal/session/key改变 | 接受。原9/17与dynamic5；不再从旧wrapper草稿恢复过时值。 |
| same-tab/storage事件、clean投影、dirty冲突、explicit reload | 接受。原functional诊断与dirty/reload不变断言通过。 |
| 不确定写入/删除、原基线token重试、一次通知 | 接受。engine token13、当前reset/duplicate Retry与原17；父实际pane一次写入重试Saved。 |
| dynamic suffix/codec/default/validator | 接受。Astra dynamic5、父dynamic3及原17；配置拒绝、账号字符串/JSON、key变更与device跨账号控制通过。 |
| 真实Collaborate选择、Saving/Not saved/Retry、EN/ZH与device开关 | 接受当前consumer。固定Settings282与父native5；没有扩大到所有设置。 |
| 两个真实document native锁与functional增量 | 父固定20a native5中的独立页面增量通过。 |
| 整Chrome退出重开 | 父固定20a五组已保存物理状态通过，PID52702→52777；不证明未保存草稿持久化或后台任务持续运行。 |
| 包、类型、旧sync签名与canonical/admission边界 | 固定Storage193/Settings282及types独立通过；engine source identity保留已有边界，无生产激活。 |
| Dashboard便签、其他writer/scoped raw/global reset/provider/timer/旧客户端 | 不属于本次关闭范围。Dashboard按9aac合同独立实施验收；其余继续留在D2清单。 |

Dashboard account note后续切片已于d129950获Astra4a66e86完整有界接受。设备位置仍保留legacy协议，与POMO六个device直接autosave列为下一批。
