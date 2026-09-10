# 异步偏好保存：逐条验收状态

父任务检查点：产品 `2820917`；引擎独立审查固定 `5ed9329`，实际页面修复固定 `04d036b`。本表追踪 [实施合同](contract.md) 的全部验收范围，不将局部通过合并为整批通过。后续固定提交的证据应逐行更新。

| 合同范围 | 已有证据 | 当前结论 / 剩余工作 |
| --- | --- | --- |
| 注册键绑定、codec 一致与运行时 schema | Astra `20da766` engine 21 例中的 5 条失败 | 未通过；Terra 修注册绑定及公开四接口一致校验。 |
| source/default/未知键的类型化失败 | 同一审查 3 条失败；invalid source、throwing updater/read 等控制通过 | 未通过；不能以默认值或 Promise rejection 冒充合法结果。 |
| 不确定 set/remove 的重试与一次通知 | 同一审查 2 条失败，物理写入已发生但重试无通知 | 未通过；Terra 修窄范围归属与 reconciliation。 |
| 四公开接口同物理键锁、functional 最新值、owner/marker/tombstone、device 锁与迁移 | 同一审查的 11 条通过控制覆盖这些明确边界；完整原始断言见其报告 | 保留有界通过，修引擎后需固定回归；不证明未转换的同步调用方。 |
| 两个 hook 的 functional 更新、等待中的后续编辑 | 父 `1becb16` 固定 5ed 两条通过，`082ba01` 固定 282 再通过 | 有界通过；不代替 reset/disposal/singleflight 的验收。 |
| 实际 Collaborate 选择、Saving、quota、Not saved/Retry、正确 string 落盘 | 原 a82 两条失败，5ed 实际页面仍丢选择；修复 04 后父 `838396c` 两条通过 | 该真实流程通过；已保留修复前证据与仅 hook 通过的范围区别。 |
| 两个真实 document 同键 native lock、各一次 functional 增量 | 父 `825a926` 固定 04：iframe 与主页面排队后持久值为 2 | 有界通过；不是所有浏览器/旧客户端的协调证明。 |
| A 保存等待时切换 B，B 的值与 device 开关、旧完成隔离 | 父 `2673d56` 固定 282：该具体 native control 通过 | 保留通过；同 key 卸载重挂、新 generation 与复杂会话队列仍须独立测试。 |
| 整个 Chrome 退出后重开 | 父 `2673d56` 四种场景的物理值重新读取通过 | 覆盖已保存值与账号分离；不承诺未保存草稿或中途崩溃任务的持久执行。 |
| ordered reset、reset→new edit、duplicate retry、失效队列 | Sol 负责实现与聚焦业务测试 | 尚未验收；不得因旧包全绿关闭。 |
| 同 tab / storage event 投影，clean 更新、dirty 保留冲突、explicit reload | Sol 负责 hook 会话/投影范围 | 尚未验收；事件处理须重新读物理数据。 |
| readback uncertainty 与 hook 的原基线重试衔接 | Terra engine 与 Sol hooks 分工，需要整合结果/token 合同 | 尚未验收；不能将普通 conflict 当 overwrite 许可。 |
| open-ended autosave hook 绑定（suffix/codec/default/validator） | 282 的 hook 仍以注册 WebPrefKey 为签名；引擎支持动态键不等于 hook 绑定完成 | 尚未完成；需实际支持合同声明的动态绑定并独立验收。 |
| 完整包与回归 | 作者 `ac9845a` 固定 04：storage 174、Settings 282、类型/lint 通过 | 作者证据；修改引擎/hook 后需匹配固定版本的回归与 Astra 完整复核。 |
| 其他 writer / scoped raw / global reset / provider / timer / export-import / 旧客户端 | 不属于本切片可关闭范围，仍在 D2 调用方清单 | 保持开放；production admission 不改变。 |

最终关闭本切片须证明上述合同范围全部满足，并接入真实 Collaborate 控件；不能只关闭当前已通过的测试集合。接受本切片也不自动关闭 REL-05、AI-02 或 D2 全范围。
