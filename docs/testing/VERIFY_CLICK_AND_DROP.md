# 验证清单：桌面文件点击和拖入修复

**修复版本**: v0.6.1
**修复日期**: 2024-12-12
**问题描述**: 桌面文件无法点击，也无法拖入到 Box 中

---

## 修复内容

### 1. 鼠标穿透机制 (Click-Through)

**修改文件**:
- `apps/desktop/src/index.css` - 添加 `pointer-events: none`
- `apps/desktop/src/App.css` - `.app-shell` 和 `.interactive-layer` 添加 `pointer-events: none`
- `apps/desktop/src/App.tsx` - 简化穿透逻辑，使用 CSS 控制

**原理**:
- 所有容器层默认 `pointer-events: none`，允许点击穿透到桌面
- 只有交互元素 (`.ai-cube`, `.settings-panel`, `.smart-container`) 设置 `pointer-events: auto`

### 2. 文件拖入功能 (File Drop)

**修改文件**:
- `apps/desktop/src-tauri/tauri.conf.json` - 添加 `"dragDropEnabled": true`
- `apps/desktop/src-tauri/capabilities/default.json` - 添加事件权限
- `packages/plugin-organizer/src/hooks/useFileDrop.ts` - 新增 hook
- `apps/desktop/src/plugins/OrganizerLayer.tsx` - 集成文件拖入

---

## 验证步骤

### 前置准备
```bash
# 1. 清理并重新编译
cd apps/desktop
pnpm tauri clean
pnpm tauri dev
```

### Test 1: 桌面文件点击穿透

**步骤**:
1. 启动应用
2. 在 Box 之间的空白区域点击
3. 尝试选中桌面上的文件/文件夹

**预期结果**:
- [ ] 点击空白区域时，应该能选中桌面上的文件
- [ ] 鼠标在空白区域显示正常的桌面光标
- [ ] macOS 的蓝色选择框应该正常出现

**实际结果**: _____________

### Test 2: Box 交互正常

**步骤**:
1. 点击 Box 的标题栏
2. 尝试拖动 Box
3. 点击 Box 内的按钮

**预期结果**:
- [ ] Box 标题栏可以拖动
- [ ] 折叠/锁定/视图切换按钮可以点击
- [ ] 在 Box 内部点击不会穿透到桌面

**实际结果**: _____________

### Test 3: 文件拖入到 Box

**步骤**:
1. 从 macOS 桌面拖拽一个文件
2. 将文件拖到一个已存在的 Box 上
3. 释放鼠标

**预期结果**:
- [ ] 拖拽文件时，窗口边缘显示虚线指示
- [ ] 文件被添加到 Box 中
- [ ] 文件显示正确的图标和名称

**实际结果**: _____________

### Test 4: 拖入文件到空白区域创建新 Grid

**步骤**:
1. 从桌面拖拽文件到空白区域（没有 Box 的地方）
2. 释放鼠标

**预期结果**:
- [ ] 在拖放位置创建新的 Grid
- [ ] 显示 "Drop files here to create a new Grid" 提示（如果没有 Grid）

**实际结果**: _____________

### Test 5: AI Cube 和 Settings Panel 交互

**步骤**:
1. 点击 AI Cube
2. 在 Settings Panel 中调整滑块

**预期结果**:
- [ ] AI Cube 可以正常点击和拖动
- [ ] Settings Panel 可以正常打开和关闭
- [ ] 滑块可以正常调整

**实际结果**: _____________

---

## 故障排除

### 问题 A: 点击仍然无法穿透
**可能原因**:
1. CSS `pointer-events` 被其他样式覆盖
2. 窗口层级不正确

**诊断**:
```javascript
// 在浏览器控制台运行
console.log(getComputedStyle(document.body).pointerEvents);
// 应该输出 "none"
```

**解决方案**:
- 检查 `index.css` 中的 `pointer-events: none` 是否有 `!important`
- 确认没有其他 CSS 覆盖了这个设置

### 问题 B: 文件拖入没有反应
**可能原因**:
1. `dragDropEnabled` 配置未生效
2. 事件监听器未正确注册

**诊断**:
- 查看控制台是否有 "✅ File drop DOM listeners registered" 日志
- 拖拽文件时查看是否有 "📂 File drag entered window" 日志

**解决方案**:
- 确认 `tauri.conf.json` 中有 `"dragDropEnabled": true`
- 重新编译应用：`pnpm tauri clean && pnpm tauri dev`

### 问题 C: 文件名显示不正确
**原因**: 浏览器安全限制，HTML5 drag API 只能获取文件名，不能获取完整路径

**说明**: 这是预期行为。如果需要完整路径，需要使用 Tauri 的原生文件系统 API。

---

## 技术说明

### 穿透机制原理

```
Window (Tauri Native)
  │
  ├── html, body, #root (pointer-events: none)
  │     │
  │     └── .app-shell (pointer-events: none)
  │           │
  │           └── .interactive-layer (pointer-events: none)
  │                 │
  │                 ├── .ai-cube (pointer-events: auto) ← 可交互
  │                 ├── .settings-panel (pointer-events: auto) ← 可交互
  │                 └── .smart-container (pointer-events: auto) ← 可交互
  │
  └── Desktop (macOS) ← 点击穿透到这里
```

### 文件拖入流程

```
1. 用户从桌面拖拽文件
   ↓
2. Tauri 窗口接收 HTML5 drag 事件 (dragDropEnabled: true)
   ↓
3. useFileDrop hook 监听 dragenter/dragover/dragleave/drop 事件
   ↓
4. 解析文件信息 (名称、类型)
   ↓
5. 调用 findGridAtPosition 找到目标 Grid
   ↓
6. 调用 addItem + addItemToGrid 添加文件到 Grid
```

---

## 相关文件

- [App.tsx](../apps/desktop/src/App.tsx) - 主应用穿透逻辑
- [index.css](../apps/desktop/src/index.css) - 全局穿透样式
- [App.css](../apps/desktop/src/App.css) - 组件穿透样式
- [useFileDrop.ts](../packages/plugin-organizer/src/hooks/useFileDrop.ts) - 文件拖入 hook
- [OrganizerLayer.tsx](../apps/desktop/src/plugins/OrganizerLayer.tsx) - 文件拖入集成
- [tauri.conf.json](../apps/desktop/src-tauri/tauri.conf.json) - Tauri 配置

---

**验证人**: _____________
**验证日期**: _____________
**验证结果**: [ ] 全部通过 / [ ] 部分通过 / [ ] 失败
