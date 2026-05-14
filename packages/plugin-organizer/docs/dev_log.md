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
- isTauri 硬编码 `= true`，破坏浏览器测试能力

## 踩坑记录
### 2026-05-13
- 初始化四件套文档，基于 REFACTORING_PLAN v1.0
