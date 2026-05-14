# ADR-0001: 插件注册使用静态 import 而非运行时动态加载

| 字段 | 值 |
|------|---|
| 状态 | Accepted |
| 日期 | 2026-05-13 |
| 决策者 | Jinlong |

## 背景

XAI_Desktop 需要一个插件注册机制，让 Host 壳能够加载和渲染各个 Plugin 的 UI 组件。
有两种主流方案：运行时动态发现/加载 (如 Electron plugin systems) 和编译时静态 import。

## 方案

### 方案 A: 运行时动态加载

- 优点: 支持热插拔，用户可自行安装/卸载插件
- 缺点: 需要 dynamic import + module federation 或自定义 loader；增加首屏延迟和构建复杂度；
  Tauri 2 CSP 对 eval 限制严格；桌面应用不需要运行时插件发现

### 方案 B: 编译时静态 import

- 优点: 零额外运行时开销；TypeScript 类型检查完整覆盖；Vite tree-shaking 有效；
  简单可靠，与 Tauri CSP 兼容
- 缺点: 新增插件需重新编译；无法实现热插拔

## 决策

选择方案 B (静态 import)。

理由：XAI_Desktop 是个人桌面工具，插件集在编译时确定。运行时动态加载带来的复杂度和安全风险
不值得承担。PluginRegistry 在 import-time 同步注册，Host 启动时已有完整的插件列表。

## 后果

- 正面: 简单可靠，TypeScript 完整类型覆盖，零运行时开销
- 负面: 新增插件需要在 main.tsx 中添加 import 语句并重新编译
