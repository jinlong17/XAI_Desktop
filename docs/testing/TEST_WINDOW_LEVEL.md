# 🧪 窗口层级测试指南

## 当前配置

### Rust 代码 (`lib.rs`):
```rust
// 窗口层级设置
const DESKTOP_WIDGET_LEVEL: i64 = -2147483638;
ns_window.setLevel_(DESKTOP_WIDGET_LEVEL);

// 窗口行为
NSWindowCollectionBehavior::NSWindowCollectionBehaviorCanJoinAllSpaces
// ↑ 只保留此选项，移除 Stationary 和 IgnoresCycle
```

### 配置文件 (`tauri.conf.json`):
```json
{
  "alwaysOnTop": false,  // ← 必须为 false
  "transparent": true,    // ← 必须为 true
  "macOSPrivateApi": true // ← 必须为 true
}
```

---

## 🚀 测试步骤

### 步骤 1: 重新编译
```bash
cd /Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/apps/desktop/src-tauri
cargo clean
cd ..
pnpm tauri dev
```

### 步骤 2: 检查终端日志

启动后，终端应该输出：
```
✅ macOS window configured:
   - Window level: -2147483638
   - Transparent: true
   - All windows should be able to cover this window
```

如果看不到这个输出 → Rust 代码可能没有执行。

---

### 步骤 3: 测试窗口遮挡

#### 测试 1: Chrome 普通窗口
1. 打开 Chrome（**不要全屏**）
2. 移动到 Box 上方
3. **预期**: ✅ Chrome 窗口遮挡 Box

#### 测试 2: Chrome 全屏
1. Chrome 按 `Cmd+Ctrl+F` 进入全屏
2. **预期**: ✅ Chrome 完全遮挡 Box（看不到 Box）

#### 测试 3: VS Code / Cursor
1. 打开 Cursor
2. 移动到 Box 上方
3. **预期**: ✅ Cursor 遮挡 Box

#### 测试 4: Finder
1. 打开 Finder
2. 移动到 Box 上方
3. **预期**: ✅ Finder 遮挡 Box

#### 测试 5: Mission Control
1. 按 `F3` 或三指上滑打开 Mission Control
2. **预期**: ✅ 应该看到所有窗口，Box 在最底层

---

## 🔍 调试方法

### 如果仍然无法遮挡

#### 方法 1: 检查窗口属性（macOS Terminal）
```bash
# 查看当前窗口层级
osascript -e 'tell application "System Events" to get properties of windows'
```

#### 方法 2: 尝试不同的层级值

编辑 `lib.rs`，测试不同的层级：

```rust
// 方案 A: 更低的层级
const DESKTOP_WIDGET_LEVEL: i64 = i32::MIN as i64 + 100;

// 方案 B: 固定层级
const DESKTOP_WIDGET_LEVEL: i64 = -2147483647 + 20;

// 方案 C: 使用 0 以下的层级
const DESKTOP_WIDGET_LEVEL: i64 = -100;
```

#### 方法 3: 检查 NSWindowCollectionBehavior

如果上述都不行，可能需要移除 `CanJoinAllSpaces`：

```rust
// 尝试空行为
let behavior = 0;
ns_window.setCollectionBehavior_(behavior);
```

**注意**: 移除此行为可能导致窗口在切换桌面时消失。

---

## 📊 macOS 窗口层级参考

| 层级常量 | 值 | 说明 |
|---------|-----|------|
| kCGDesktopWindowLevel | -2147483647 | 桌面壁纸层 |
| kCGBackstopMenuLevel | -20 | 菜单背景层 |
| kCGNormalWindowLevel | 0 | 普通应用窗口 |
| kCGFloatingWindowLevel | 3 | 浮动窗口（如 Spotlight） |
| kCGModalPanelWindowLevel | 8 | 模态对话框 |
| kCGStatusBarWindowLevel | 25 | 状态栏 |
| kCGScreenSaverWindowLevel | 1000 | 屏保 |

**我们的窗口**: `-2147483638`（比桌面壁纸高一点点）

---

## ❓ 常见问题

### Q1: 为什么移除了 Stationary 和 IgnoresCycle？
**A**: 这些行为可能导致窗口"固定"在顶层，阻止其他窗口遮挡。

### Q2: 为什么不用 kCGDesktopWindowLevel 直接？
**A**: 那个层级太低，可能导致窗口不可交互。我们需要比它稍高一点。

### Q3: 全屏应用为什么特殊？
**A**: 全屏应用在独立的 Space 中运行，层级是 kCGFullScreenWindowLevel（很高）。即使我们的窗口在所有 Space 中可见，也应该被全屏应用遮挡。

---

**现在重新编译并测试！** 🎯

