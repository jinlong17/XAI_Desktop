# 🐛 窗口层级调试记录

## 问题描述
- ✅ Resize 功能已修复
- ❌ 窗口层级问题：某些窗口无法遮挡 Box
- ✅ 终端显示配置生效（Window level: -2147483638）
- ❌ 实际行为不符合预期

---

## 已尝试的方案

### 方案 1: 极低层级 + CanJoinAllSpaces
```rust
const DESKTOP_WIDGET_LEVEL: i64 = -2147483638;
let behavior = NSWindowCollectionBehaviorCanJoinAllSpaces;
```
**结果**: ❌ 配置生效但窗口仍无法被遮挡

### 方案 2: 移除 CanJoinAllSpaces + 使用默认行为
```rust
const DESKTOP_WIDGET_LEVEL: i64 = -1;
let behavior = DEFAULT (transmute(0u64));
```
**当前正在测试...**

---

## 理论分析

### 为什么 CanJoinAllSpaces 可能有问题？

`NSWindowCollectionBehaviorCanJoinAllSpaces` 的行为：
- ✅ 窗口在所有 Space 中可见
- ❌ 但在全屏 Space 中，窗口层级可能被"提升"
- ❌ 导致即使 `setLevel_(-很低的值)` 也无效

### 解决思路：
1. **移除 CanJoinAllSpaces**
   - 窗口只在当前 Space 可见
   - 但层级设置能正确工作
   
2. **使用默认行为 (0)**
   - 让窗口像普通窗口一样参与层级管理
   - 通过 `setLevel_(-1)` 确保在普通窗口下方

---

## macOS 窗口层级系统

### 窗口层级常量（从低到高）:
```
kCGDesktopWindowLevel          = -2147483647 + 20  (桌面壁纸)
我们的窗口 (方案2)              = -1               (测试中)
kCGNormalWindowLevel           = 0                 (普通应用)
kCGFloatingWindowLevel         = 3                 (浮动窗口)
kCGModalPanelWindowLevel       = 8                 (对话框)
kCGStatusBarWindowLevel        = 25                (状态栏)
kCGFullScreenWindowLevel       = 很高              (全屏应用)
```

### NSWindowCollectionBehavior 选项:
```
Default (0)                     = 标准窗口行为
CanJoinAllSpaces                = 在所有 Space 中可见
Stationary                      = 固定位置（不参与 Exposé）
IgnoresCycle                    = 不参与窗口切换循环
```

---

## 测试方案 2（当前）

### 配置:
```rust
// lib.rs
const DESKTOP_WIDGET_LEVEL: i64 = -1;
let empty_behavior: NSWindowCollectionBehavior = unsafe { mem::transmute(0u64) };
ns_window.setCollectionBehavior_(empty_behavior);
ns_window.setLevel_(DESKTOP_WIDGET_LEVEL);
```

### 预期行为:
- ✅ 在当前 Space 中，所有普通窗口都能遮挡 Box
- ✅ Chrome 全屏时，Box 被遮挡（因为不在全屏 Space 中）
- ⚠️ 切换 Space 时，Box 不会跟随（可能是合理的权衡）

### 测试步骤:
1. 编译并启动应用
2. 检查终端输出是否显示 "Aggressive Method"
3. 测试：
   - [ ] Chrome 普通窗口遮挡 Box
   - [ ] Chrome 全屏遮挡 Box
   - [ ] VS Code 遮挡 Box
   - [ ] Finder 遮挡 Box

---

## 备用方案 3（如果方案2失败）

### 使用 Tauri 的窗口管理 API:
```rust
// 在 setup 中动态调整层级
window.set_always_on_bottom(true);  // Tauri v2 可能支持
```

### 或者尝试更激进的层级:
```rust
// 直接使用 CGWindow API
use core_graphics::window::CGWindowID;
// ... 手动调用 CGWindowLevel
```

---

## 下一步行动

### 如果方案 2 成功 ✅
- 更新文档说明：Box 只在当前 Space 可见
- 继续 Task 4.2 和 Task 5.1

### 如果方案 2 失败 ❌
- 尝试方案 3（使用 Core Graphics API）
- 或考虑接受现状，文档中说明限制

---

**当前状态**: 等待方案 2 编译测试结果

