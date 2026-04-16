# DEV_PLAN_V2.md (Closed-Loop Edition)

> Document Role: Historical planning and solution exploration.
> Canonical current status: `docs/development/PROGRESS_SNAPSHOT.md`.

> **版本目标**: v0.7 - Desktop Widget Experience
> **核心任务**: 解决窗口层级问题，实现真正的桌面挂件体验
> **开发模式**: Strict TDD (Implement -> Test -> Verify -> Fix)
> **最后更新**: 2025-12-19

---

## 📊 当前状态总结

### ✅ 已完成功能

| 功能 | 状态 | 实现方式 |
|------|------|----------|
| 透明全屏窗口 | ✅ 完成 | `transparent: true`, `macOSPrivateApi: true` |
| Grid/Box 组件 | ✅ 完成 | SmartContainer + useGridSystem |
| **文件拖放到 Grid** | ✅ 完成 | HTML5 Drag & Drop API (`dragDropEnabled: false`) |
| 拖放视觉反馈 | ✅ 完成 | 蓝色虚线边框 |
| AI Cube 组件 | ✅ 完成 | 可交互的 AI 入口 |
| 设置面板 | ✅ 完成 | 透明度/模糊度调节 |

### ⚠️ 核心待解决问题

| 问题 | 严重程度 | 描述 |
|------|----------|------|
| **窗口层级问题** | 🔴 Critical | 应用窗口阻挡桌面文件和 Finder 窗口的点击 |
| **桌面图标点击穿透** | 🔴 Critical | 无法点击桌面上的文件图标 |

---

## 🔧 技术栈

### 前端
- **React 19.x** - UI 框架
- **TypeScript 5.x** - 类型安全
- **Vite 7.x** - 构建工具
- **pnpm + Turborepo** - Monorepo 管理

### 桌面框架
- **Tauri 2.9.x** - 桌面应用框架
- **Rust** - 原生功能实现
- **cocoa / objc2** - macOS 原生 API

### 关键配置文件

```
apps/desktop/
├── src-tauri/
│   ├── tauri.conf.json      # Tauri 配置
│   ├── capabilities/default.json  # 权限配置
│   └── src/lib.rs           # Rust 窗口配置
├── src/
│   ├── hooks/useGlobalMouse.ts  # 全局鼠标追踪
│   └── plugins/OrganizerLayer.tsx
packages/plugin-organizer/
└── src/hooks/useFileDrop.ts  # 文件拖放处理
```

---

## 🎯 Phase 1: 基础设施 (已完成)

### Task 1.1: 激活 macOS 私有 API ✅

**Status**: ✅ Done

**已完成配置**:
- ✅ `Cargo.toml`: 启用 `features = ["macos-private-api"]`
- ✅ `tauri.conf.json`: `"macOSPrivateApi": true`
- ✅ `lib.rs`: NSWindow 透明背景设置

---

## 🎯 Phase 2: 文件拖放 (已完成)

### Task 2.1: 实现文件拖放功能 ✅

**Status**: ✅ Done
**解决方案**: HTML5 Drag & Drop API

**问题发现**:
Tauri v2 的 `onDragDropEvent` 原生 API 在 macOS 透明窗口上不工作。

**解决方案**:
```json
// tauri.conf.json
{
  "windows": [{
    "dragDropEnabled": false  // 禁用 Tauri 原生拖放
  }]
}
```

```typescript
// useFileDrop.ts - 使用 HTML5 API
document.addEventListener('dragenter', handleDragEnter, true);
document.addEventListener('dragover', handleDragOver, true);
document.addEventListener('drop', handleDrop, true);
```

**关键文件**:
- [useFileDrop.ts](packages/plugin-organizer/src/hooks/useFileDrop.ts)
- [OrganizerLayer.tsx](apps/desktop/src/plugins/OrganizerLayer.tsx)

---

## 🚨 Phase 3: 窗口层级问题 (核心待解决)

### Task 3.1: 窗口层级与点击穿透

**Status**: 🔴 Blocked - 需要架构决策
**Priority**: Critical (Blocker)

#### 问题分析

```
macOS 窗口层级结构:
┌─────────────────────────────────────┐
│  应用窗口层 (Normal Level = 0)       │  ← 当前应用位置 (阻挡下面所有层)
├─────────────────────────────────────┤
│  桌面图标层 (Desktop Level)          │  ← 无法点击
├─────────────────────────────────────┤
│  桌面壁纸层                          │
└─────────────────────────────────────┘
```

**矛盾点**:
1. 窗口在 Normal Level (0) → 可以接收拖放事件，但阻挡桌面点击
2. 窗口在最底层 (`i32::MIN`) → 不阻挡，但完全不可见也无法接收事件
3. macOS 不允许普通应用设置为 Desktop Level

#### 已尝试方案

| 方案 | 结果 | 原因 |
|------|------|------|
| 动态 `setIgnoreCursorEvents` | ❌ 失败 | 窗口层级高于桌面，穿透后事件仍到不了桌面 |
| CSS `pointer-events: none` | ❌ 失败 | 只影响 DOM 事件，不影响 OS 级别事件 |
| 窗口设为 `i32::MIN` | ❌ 失败 | 窗口在桌面下面，完全不可见 |

#### 可选解决方向

##### 方向 A: 多窗口架构 (推荐)

**思路**: 为每个 Grid 创建独立的小窗口，而不是一个全屏窗口

```
┌──────┐  ┌──────┐  ← 多个独立小窗口
│ Grid │  │ Grid │
└──────┘  └──────┘
     空白区域完全穿透
```

**优点**:
- 每个窗口独立管理
- 空白区域完全不被阻挡
- 技术可行性高

**缺点**:
- 窗口管理复杂度增加
- 跨窗口拖放需要额外处理

**实现步骤**:
```markdown
1. 修改 GridSystemProvider，每个 Grid 对应一个 Tauri 窗口
2. 使用 Tauri WebviewWindow API 动态创建/销毁窗口
3. 实现跨窗口状态同步（通过 Tauri events）
4. 处理窗口位置/大小与 Grid 数据的同步
```

##### 方向 B: 模式切换 (快速可用)

**思路**: 默认窗口在最底层，点击 Dock 图标或快捷键激活

```
默认模式: 窗口不可见，完全穿透
激活模式: 窗口可见，可以交互
```

**优点**:
- 实现简单
- 用户体验清晰

**缺点**:
- 需要手动切换
- 非实时响应

##### 方向 C: macOS Widget Extension

**思路**: 使用 `NSWidgetExtension` 将组件嵌入桌面层

**优点**:
- 真正的桌面级集成
- 最佳用户体验

**缺点**:
- 需要大量原生开发
- Tauri 不直接支持
- 可能需要 App Store 分发

---

## 📋 下一步行动计划

### 短期 (立即)

1. **选择解决方向** - 评估多窗口架构 vs 模式切换
2. **原型验证** - 实现最小可行方案验证技术可行性

### 中期

3. **完善交互** - 实现完整的拖放、调整大小功能
4. **持久化** - Grid 数据本地存储

### 长期

5. **效率助手套件** - 便利贴、四象限任务盘、番茄钟
6. **真实文件系统集成** - 读取桌面文件

---

## 📁 关键文件清单

### Tauri 配置
- `apps/desktop/src-tauri/tauri.conf.json` - 窗口配置
- `apps/desktop/src-tauri/capabilities/default.json` - 权限配置
- `apps/desktop/src-tauri/src/lib.rs` - Rust 窗口设置

### 前端核心
- `apps/desktop/src/App.tsx` - 应用入口
- `apps/desktop/src/hooks/useGlobalMouse.ts` - 全局鼠标追踪
- `apps/desktop/src/plugins/OrganizerLayer.tsx` - Grid 容器层

### 组件库
- `packages/plugin-organizer/src/SmartContainer.tsx` - Grid 组件
- `packages/plugin-organizer/src/useGridSystem.tsx` - Grid 状态管理
- `packages/plugin-organizer/src/hooks/useFileDrop.ts` - 文件拖放

---

## 📊 当前配置参考

### tauri.conf.json
```json
{
  "app": {
    "macOSPrivateApi": true,
    "windows": [{
      "transparent": true,
      "decorations": false,
      "shadow": false,
      "skipTaskbar": true,
      "dragDropEnabled": false
    }]
  }
}
```

### lib.rs 窗口设置
```rust
// 当前: Normal Level (测试模式)
const K_CG_NORMAL_WINDOW_LEVEL: i64 = 0;
ns_window.setLevel_(K_CG_NORMAL_WINDOW_LEVEL);

ns_window.setCollectionBehavior_(
    NSWindowCollectionBehavior::CanJoinAllSpaces
);
```

### useFileDrop.ts
```typescript
// HTML5 Drag & Drop API (因为 dragDropEnabled: false)
document.addEventListener('drop', (e) => {
  const files = e.dataTransfer?.files;
  // 处理文件...
});
```

---

## 📚 相关文档

- [TECHNICAL_STATUS.md](TECHNICAL_STATUS.md) - 详细技术状态文档
- [Tauri v2 文档](https://v2.tauri.app/)
- [macOS Window Levels](https://developer.apple.com/documentation/appkit/nswindow/level)

---

## 🏷️ 版本历史

| 版本 | 日期 | 主要变更 |
|------|------|----------|
| v0.7-dev | 2025-12-19 | 文件拖放完成，窗口层级问题待解决 |
| v0.6 | 2024-12-10 | 透明度修复，基础架构搭建 |
