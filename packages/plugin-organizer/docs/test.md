# Organizer — Test Plan

## Unit Tests (Vitest)

- [ ] useGridSystem: create/update/delete grid
- [ ] useGridSystem: fold/unfold preserves height cache
- [ ] useGridSystem: lock/unlock prevents drag
- [ ] useGridSystem: moveItem between grids
- [ ] useGridSystem: localStorage serialization roundtrip
- [ ] useContainerManager: container lifecycle (create/destroy)
- [ ] useFileDrop: file path extraction
- [ ] useCustomResize: resize calculation for 8 directions

## Component Tests

- [ ] SmartContainer: renders with grid data
- [ ] SmartContainer: title bar hover reveals actions
- [ ] GridItem: renders file/folder/app variants
- [ ] GridItem: drag handle interaction

## Integration Tests

- [ ] 跨窗口 Grid 状态同步 (grid-update event)
- [ ] Tauri invoke: create_grid_window round-trip
- [ ] File drop → grid item creation
- [ ] Grid window close → main window cleanup

## Manual Tests (macOS hardware)

- [ ] Grid 拖拽流畅，无卡顿
- [ ] 8 方向调整大小正确
- [ ] 折叠/展开动画
- [ ] 锁定后禁止拖拽和调整
- [ ] 文件从 Finder 拖入 Grid
- [ ] Grid 弹出为独立窗口
- [ ] 多显示器场景
- [ ] 重启后布局恢复
