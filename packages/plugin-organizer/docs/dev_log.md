# Organizer — Dev Log

## Current Status
Stable

## TODO
- [ ] 迁移 OrganizerLayer 从 apps/desktop/src/plugins/ 到 plugin 内部 (Wave 2)
- [ ] 迁移 useMultiWindowGrids 从 apps/desktop/src/hooks/ 到 plugin 内部 (Wave 2)
- [ ] 迁移 useGridWindow 从 apps/desktop/src/hooks/ 到 plugin 内部 (Wave 2)
- [ ] 替换 Tauri 事件调用为 @repo/core/events 类型安全版本 (Wave 2)
- [ ] 注册到 PluginRegistry (Wave 2)
- [ ] 添加 Vitest 单元测试 (Wave 3)
- [ ] Zustand store 替代 React Context + localStorage (Wave 3)

## Known Issues
- SmartContainer 477 行过于膨胀，需要拆分
- 缺少 Vitest 覆盖 Control→Main create-grid 事件路由

## 踩坑记录
### 2026-05-13
- 初始化四件套文档，基于 REFACTORING_PLAN v1.0

### 2026-05-19
- Tauri v2 默认不暴露 `window.__TAURI__`，除非开启 `app.withGlobalTauri`。Organizer 原先用这个全局判断运行环境，会导致 `useMultiWindowGrids` 在真实 Tauri runtime 中被关闭。修复为 `isTauri()` / `__TAURI_INTERNALS__` 检测。
- ControlWindow 的 `+ New Grid` 需要向 `main` 定向发送 `organizer:create-grid-request`，由主窗口维护 grid state 后再同步原生 Grid window。
