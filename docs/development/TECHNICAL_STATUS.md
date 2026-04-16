# AI Smart Desktop - 技术状态文档

> 最后更新: 2025-12-19

## 目录

1. [项目概述](#项目概述)
2. [技术栈](#技术栈)
3. [当前实现状态](#当前实现状态)
4. [核心问题分析](#核心问题分析)
5. [已尝试的解决方案](#已尝试的解决方案)
6. [可能的解决方向](#可能的解决方向)

---

## 项目概述

AI Smart Desktop 是一个 macOS 桌面增强应用，目标是在用户桌面上叠加一个透明的交互层，提供：
- 智能文件整理（Grid/Box 组件）
- AI 助手入口（AiCube）
- 桌面小组件功能

**核心需求**：
- 窗口覆盖整个桌面
- 透明背景，用户可以看到桌面壁纸和图标
- 点击空白区域时，事件穿透到桌面（可以点击桌面图标）
- 点击 Grid/Box 组件时，事件被应用捕获
- 支持从 Finder 拖放文件到 Grid 中

---

## 技术栈

### 前端
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.x | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 7.x | 构建工具 |
| pnpm | - | 包管理器 |
| Turborepo | - | Monorepo 管理 |

### 桌面框架
| 技术 | 版本 | 用途 |
|------|------|------|
| Tauri | 2.9.x | 桌面应用框架 |
| Rust | - | 原生功能实现 |
| WKWebView | - | macOS WebView 渲染 |

### macOS 原生 API（通过 Rust）
| API | 用途 |
|-----|------|
| `cocoa` crate | NSWindow 操作 |
| `objc2` crate | Objective-C 桥接 |
| `core-graphics` | 全局鼠标位置监控 |
| `NSWindowLevel` | 窗口层级控制 |
| `setIgnoreCursorEvents` | 点击穿透控制 |

### 项目结构
```
XAI_Desktop/
├── apps/
│   └── desktop/              # Tauri 桌面应用
│       ├── src/              # React 前端代码
│       │   ├── App.tsx
│       │   ├── hooks/
│       │   │   └── useGlobalMouse.ts  # 全局鼠标追踪
│       │   └── plugins/
│       │       └── OrganizerLayer.tsx # Grid 容器层
│       └── src-tauri/        # Rust 后端代码
│           ├── src/lib.rs    # 主要逻辑
│           └── tauri.conf.json
├── packages/
│   └── plugin-organizer/     # Grid 组件库
│       └── src/
│           ├── SmartContainer.tsx
│           └── hooks/
│               └── useFileDrop.ts  # 文件拖放处理
└── TECHNICAL_STATUS.md       # 本文档
```

---

## 当前实现状态

### ✅ 已实现功能

| 功能 | 状态 | 说明 |
|------|------|------|
| 透明全屏窗口 | ✅ 完成 | `transparent: true`, `decorations: false` |
| Grid/Box 组件 | ✅ 完成 | 可创建、拖动、调整大小 |
| 文件拖放到 Grid | ✅ 完成 | 使用 HTML5 Drag & Drop API |
| 拖放视觉反馈 | ✅ 完成 | 蓝色虚线边框 |
| AI Cube 组件 | ✅ 完成 | 可交互的 AI 入口 |

### ⚠️ 部分实现

| 功能 | 状态 | 说明 |
|------|------|------|
| 动态点击穿透 | ⚠️ 部分 | 逻辑已写，但窗口层级问题导致无法正常工作 |
| 全局鼠标追踪 | ⚠️ 部分 | Rust 端实现完成，但效果受限于窗口层级 |

### ❌ 未解决问题

| 问题 | 严重程度 | 影响 |
|------|----------|------|
| 窗口层级问题 | 🔴 严重 | 应用阻挡桌面文件和 Finder 窗口的点击 |
| 桌面图标点击穿透 | 🔴 严重 | 无法点击桌面上的文件图标 |

---

## 核心问题分析

### 问题 1: 窗口层级与点击穿透的矛盾

#### 问题描述
当前应用需要同时满足两个相互矛盾的需求：

1. **需要接收拖放事件** → 窗口必须在可见层级，且 `setIgnoreCursorEvents(false)`
2. **需要点击穿透到桌面** → 窗口必须设置 `setIgnoreCursorEvents(true)` 或在最底层

#### 技术分析

```
macOS 窗口层级结构:
┌─────────────────────────────────────┐
│  应用窗口层 (Normal Level = 0)       │  ← 当前应用位置
├─────────────────────────────────────┤
│  桌面图标层 (Desktop Level)          │
├─────────────────────────────────────┤
│  桌面壁纸层                          │
└─────────────────────────────────────┘
```

**问题**: 我们的应用窗口在 Normal Level (0)，高于桌面图标层，因此：
- 鼠标事件会先到达我们的应用
- 即使设置 `setIgnoreCursorEvents(true)`，也会影响事件传递

#### 已尝试的窗口层级

| 层级设置 | 结果 |
|----------|------|
| `i32::MIN` (最低层) | 窗口在桌面下面，完全不可见，无法接收任何事件 |
| `0` (Normal Level) | 窗口在桌面图标上方，阻挡桌面点击 |
| `kCGDesktopWindowLevel` | macOS 不允许普通应用使用此层级 |

### 问题 2: 透明窗口 + Tauri 原生拖放的兼容性

#### 问题描述
Tauri v2 的 `onDragDropEvent` API 在 macOS 透明窗口上不工作。

#### 解决方案
已通过以下方式解决：

```json
// tauri.conf.json
{
  "windows": [{
    "dragDropEnabled": false  // 禁用 Tauri 原生拖放
  }]
}
```

```typescript
// useFileDrop.ts - 使用 HTML5 Drag & Drop API
document.addEventListener('dragenter', handleDragEnter, true);
document.addEventListener('dragover', handleDragOver, true);
document.addEventListener('drop', handleDrop, true);
```

---

## 已尝试的解决方案

### 方案 A: 动态 Tauri 点击穿透（当前实现）

**思路**: 根据鼠标位置动态切换 `setIgnoreCursorEvents`

```
鼠标在交互元素上 → setIgnoreCursorEvents(false) → 捕获事件
鼠标在空白区域 → setIgnoreCursorEvents(true) → 穿透到桌面
```

**实现**:
- [lib.rs](apps/desktop/src-tauri/src/lib.rs): Rust 端全局鼠标位置监控
- [useGlobalMouse.ts](apps/desktop/src/hooks/useGlobalMouse.ts): 前端动态切换

**结果**: ❌ 不完全工作
- 原因: 窗口在 Normal Level，高于桌面图标层
- 即使穿透，事件也到不了桌面图标

### 方案 B: 纯 CSS pointer-events

**思路**: 使用 CSS `pointer-events: none` 让空白区域不响应事件

```css
.app-shell { pointer-events: none; }
.interactive-element { pointer-events: auto; }
```

**结果**: ❌ 不工作
- 原因: CSS `pointer-events` 只影响 DOM 事件，不影响 OS 级别事件
- Tauri 窗口仍然捕获所有 OS 事件

### 方案 C: 窗口设置为最底层

**思路**: 将窗口设置为 `i32::MIN` 层级

**结果**: ❌ 不工作
- 原因: 窗口在桌面壁纸下面，完全不可见
- 无法接收任何鼠标/拖放事件

---

## 可能的解决方向

### 方向 1: 使用 macOS 桌面扩展 API

**思路**: 使用 `NSWidgetExtension` 或类似 API，将组件真正嵌入桌面层

**优点**:
- 真正的桌面级集成
- 不会阻挡桌面图标

**缺点**:
- 需要大量原生开发
- 可能需要 App Store 分发
- Tauri 不直接支持

### 方向 2: 多窗口架构

**思路**: 为每个 Grid 创建独立的小窗口，而不是一个全屏窗口

```
┌──────┐  ┌──────┐  ← 多个小窗口
│ Grid │  │ Grid │
└──────┘  └──────┘
     桌面图标可以点击
```

**优点**:
- 每个窗口独立管理
- 空白区域完全不被阻挡

**缺点**:
- 窗口管理复杂度增加
- 跨窗口拖放需要额外处理

### 方向 3: Accessibility API + 事件转发

**思路**:
1. 捕获点击事件
2. 检测点击位置是否有桌面图标
3. 使用 Accessibility API 模拟点击

**优点**:
- 可以精确控制哪些点击穿透

**缺点**:
- 需要 Accessibility 权限
- 实现复杂度高
- 可能有性能问题

### 方向 4: 混合方案 - Dock 图标触发模式切换

**思路**:
- 默认窗口在最底层（完全穿透）
- 点击 Dock 图标或快捷键激活应用
- 激活后窗口提升到 Normal Level
- 完成操作后返回最底层

**优点**:
- 简单可靠
- 用户体验清晰

**缺点**:
- 需要手动切换模式
- 非实时响应

---

## 当前配置参考

### tauri.conf.json 关键配置
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
// 当前设置: Normal Level (测试模式)
const K_CG_NORMAL_WINDOW_LEVEL: i64 = 0;
ns_window.setLevel_(K_CG_NORMAL_WINDOW_LEVEL);

// 窗口行为
ns_window.setCollectionBehavior_(
    NSWindowCollectionBehavior::CanJoinAllSpaces
);
```

### 文件拖放实现
```typescript
// useFileDrop.ts - HTML5 API
document.addEventListener('drop', (e) => {
  const files = e.dataTransfer?.files;
  // 处理文件...
});
```

---

## 下一步计划

1. **评估多窗口架构方案** - 技术可行性最高
2. **研究 macOS Widget Extension** - 最佳用户体验
3. **实现混合模式切换** - 快速可用的折中方案

---

## 相关资源

- [Tauri v2 文档](https://v2.tauri.app/)
- [macOS Window Levels](https://developer.apple.com/documentation/appkit/nswindow/level)
- [Tauri GitHub Issues - Transparent Window](https://github.com/tauri-apps/tauri/issues?q=transparent+macos)
