# 异步偏好保存：逐条验收状态

父任务检查点：engine `6504589` 经 Astra `e75d5b3` 有界接受；hooks `d6184ee` 作者证据 `8c49657`，父独立原 hook 2 条、真实 Chrome 5 场景及整进程重开 5 组全部通过。完整 hooks 独立复核与 open-ended binding 仍在进行。原失败日志保留，不将局部通过合并为整批通过。

| 合同范围 | 已有证据 | 当前结论 / 剩余工作 |
| --- | --- | --- |
| 注册键绑定、codec 一致与运行时 schema | Astra e75d5b3 固定650原21、repair7、token13通过 | 引擎有界接受；动态hook绑定单列。 |
| source/default/未知键的类型化失败 | 同一固定独立审查，原始失败及残余修复断言通过 | 引擎有界接受。 |
| 不确定 set/remove 的重试与一次通知 | Astra token13及原21；父固定d618实际pane不确定写入重试通过 | 引擎有界接受；实际重试Saved且只写一次。 |
| 四公开接口同物理键锁、functional 最新值、owner/marker/tombstone、device 锁与迁移 | 同一审查的 11 条通过控制覆盖这些明确边界；完整原始断言见其报告 | 保留有界通过，修引擎后需固定回归；不证明未转换的同步调用方。 |
| 两个 hook 的 functional 更新、等待中的后续编辑 | 父 `1becb16` 固定 5ed 两条通过，`082ba01` 固定 282 再通过 | 有界通过；不代替 reset/disposal/singleflight 的验收。 |
| 实际 Collaborate 选择、Saving、quota、Not saved/Retry、正确 string 落盘 | 原 a82 两条失败，5ed 实际页面仍丢选择；修复 04 后父 `838396c` 两条通过 | 该真实流程通过；已保留修复前证据与仅 hook 通过的范围区别。 |
| 两个真实 document 同键 native lock、各一次 functional 增量 | 父 `825a926` 固定 04：iframe 与主页面排队后持久值为 2 | 有界通过；不是所有浏览器/旧客户端的协调证明。 |
| A 保存等待时切换 B，B 的值与 device 开关、旧完成隔离 | 父 `2673d56` 固定 282：该具体 native control 通过 | 保留通过；同 key 卸载重挂、新 generation 与复杂会话队列仍须独立测试。 |
| 整个 Chrome 退出后重开 | 父固定d618，进程45710退出后45819重开，五组已保存状态通过 | 覆盖已保存值与账号分离；不证明未保存草稿或后台任务持续执行。 |
| ordered reset、reset→new edit、duplicate retry、失效队列 | Sol d618作者9条聚焦合同；Astra固定hooks复核中 | 待独立完整hooks验收。 |
| 同 tab / storage event 投影，clean 更新、dirty 保留冲突、explicit reload | Sol d618作者合同已覆盖，Astra复核中 | 待独立完整hooks验收。 |
| readback uncertainty 与 hook 的原基线重试衔接 | 父固定d618 native readback-uncertain通过，原2c失败保留 | 该真实流程有界通过；不能将普通冲突当覆盖许可。 |
| open-ended autosave hook 绑定（suffix/codec/default/validator） | 282 的 hook 仍以注册 WebPrefKey 为签名；引擎支持动态键不等于 hook 绑定完成 | 尚未完成；需实际支持合同声明的动态绑定并独立验收。 |
| 完整包与回归 | Astra固定650 storage176、C37/shared8/foundation14/admission2/types通过；Sol固定d618作者storage185/Settings282/types通过 | 分层记录；完整hooks独立复核仍待。 |
| 其他 writer / scoped raw / global reset / provider / timer / export-import / 旧客户端 | 不属于本切片可关闭范围，仍在 D2 调用方清单 | 保持开放；production admission 不改变。 |

最终关闭本切片须证明上述合同范围全部满足，并接入真实 Collaborate 控件；不能只关闭当前已通过的测试集合。接受本切片也不自动关闭 REL-05、AI-02 或 D2 全范围。
