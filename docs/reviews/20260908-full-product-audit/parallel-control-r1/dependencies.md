# 依赖图与锁

完整逐项节点/边在 dependencies.json（含每个未关闭项目的 prepare→review→before→implement→verify→accept→reconcile→inventory）。13个已完成项为retained terminal，不安排重跑。不同文件只是必要条件；语义读写组只是初始保守索引，具体合同必须确认消费者与影响面并增加依赖。

```mermaid
flowchart LR
 C[ C 需求/合同/影响准备 ] --> D1[ D 独立合同审查与 before ]
 D1 --> A[ A 共享基础单一写入者 ]
 D1 --> B[ B 独立实施 ]
 A --> D2[ D 固定版本完整验证与 acceptance ]
 B --> D2
 D2 --> ROOT[ 总控串行接收与证据对账 ]
 ROOT --> C2[ C 库存刷新/下一候选 ]
 R1[Clock impact] --> FIX[独立 harness 纠正]
 FIX --> Q2[独立七单元资格审查]
 Q2 --> M[采用测量方法]
 M --> Q3[完整 P0 before]
 Q3 --> G1[两 CSS 几何修复]
 G1 --> G23[独立验证与几何 acceptance]
 G23 --> B12[新基线 addendum / E1-E5]
 B12 --> T71[r2 recovery 实施]
 T71 --> D2
```

准备/审查的多项 read-read 可并行；源码作者与读同一可变工作树的验证者不可并行。固定 git archive 的历史读不被其他新提交改变。共用 renderer/profile/端口/设备须单一资源租约，独立路径不允许隐藏UI污染。module gate、owner decision和外部凭据条件列为external节点；blocked节点只阻塞后继。
