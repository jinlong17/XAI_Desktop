# 🎯 关键修复：窗口层级 + Resize 冲突

## 🔧 核心修复

### 修复 1: 窗口层级 - 使用桌面挂件层级

**问题**: Box 不在最底层，不像 macOS 自带挂件（Calendar, Weather 等）

**根本原因**:
- 之前使用 `Transient + IgnoresCycle` 导致层级行为异常
- 层级值不够低

**修复方案**:
```rust
// lib.rs
// 使用 macOS 桌面挂件的配置
let behavior = NSWindowCollectionBehaviorCanJoinAllSpaces
    | NSWindowCollectionBehaviorStationary;  // ← 关键：Stationary

const K_CG_DESKTOP_WINDOW_LEVEL: i64 = -2147483643;  // ← kCGDesktopWindowLevel
ns_window.setLevel_(K_CG_DESKTOP_WINDOW_LEVEL);
```

**为什么这样配置？**
- `CanJoinAllSpaces`: 在所有 Space 中可见 ✅
- `Stationary`: 固定在桌面层，不参与窗口管理 ✅
- `-2147483643`: 这是 macOS 桌面挂件使用的实际层级 ✅

---

### 修复 2: Resize 冲突 - 彻底隔离事件

**问题**: Resize 拖拽不工作，Draggable 拦截了事件

**根本原因**:
- `cancel` 选择器不够
- Draggable 的事件在 Resize 之前触发

**修复方案**:
```typescript
// SmartContainer.tsx
handle={(axis) => (
  <span
    className="resize-handle"
    onMouseDown={(e) => {
      e.stopPropagation();  // ← 关键：阻止事件冒泡到 Draggable
    }}
    // ...
  />
)}

// Resizable 配置
<Resizable
  draggableOpts={{ 
    disabled: data.isLocked,
    enableUserSelectHack: false  // ← 防止拖拽干扰
  }}
/>
```

**为什么这样配置？**
- `stopPropagation()`: 阻止事件向上冒泡，Draggable 收不到事件 ✅
- `enableUserSelectHack: false`: 禁用 react-draggable 的文本选择 hack ✅

---

## 🧪 测试步骤

### 步骤 1: 重新编译（必须）

```bash
cd /Users/jinlong/Desktop/jinlong_project/XAI_Desktop/apps/desktop/src-tauri
cargo clean
cd ../..
cd apps/desktop
pnpm tauri dev
```

**编译时间**: 约 1-2 分钟（Rust 重新编译）

---

### 步骤 2: 检查终端输出

应该看到：
```
✅ macOS Desktop Widget configured:
   - Window level: -2147483643 (kCGDesktopWindowLevel)
   - Behaviors: CanJoinAllSpaces + Stationary
   - Like macOS Calendar/Weather widgets
   - ALL windows should cover this
```

**关键信息**:
- Level: `-2147483643` ← 这是正确的桌面挂件层级
- Behaviors: 只有 `CanJoinAllSpaces + Stationary`

---

### 步骤 3: 测试窗口层级（关键！）

#### 快速测试：

```
1. Chrome 普通窗口:
   [ ] 打开 Chrome（不全屏）
   [ ] 移动到 Box 上方
   [ ] ✅ Chrome 必须遮挡 Box

2. Chrome 全屏:
   [ ] 按 Cmd+Ctrl+F
   [ ] ✅ Chrome 必须完全遮挡 Box

3. Finder:
   [ ] 打开 Finder
   [ ] 移动到 Box 上方
   [ ] ✅ Finder 必须遮挡 Box

4. VS Code / Cursor:
   [ ] 打开 Cursor
   [ ] 移动到 Box 上方
   [ ] ✅ Cursor 必须遮挡 Box

5. 系统偏好设置:
   [ ] 打开系统偏好设置
   [ ] 移动到 Box 上方
   [ ] ✅ 系统偏好设置必须遮挡 Box

6. 所有应用:
   [ ] 打开任意应用
   [ ] ✅ 所有应用都必须遮挡 Box
```

**如果任何一个测试失败** → 说明窗口层级仍有问题

---

### 步骤 4: 测试 Resize（关键！）

#### 详细测试：

1. **创建 Box**:
   - 双击桌面空白处
   - 或点击 Settings 的 "+ New Grid"

2. **确保未锁定**:
   - 查看标题栏：🔓 = 未锁定 ✅
   - 如果是 🔒，点击解锁

3. **观察 Resize 句柄**:
   - [ ] Box 的 8 个方向都有白色圆点
   - [ ] 圆点大小 20x20px
   - [ ] 圆点有深色边框和阴影

4. **测试悬停**:
   - [ ] 鼠标悬停任意句柄
   - [ ] 句柄变绿色
   - [ ] 句柄放大 1.3 倍
   - [ ] 光标变为 Resize 图标

5. **测试拖拽（关键步骤）**:
   ```
   步骤：
   a. 鼠标移到右下角白色圆点上
   b. 按住鼠标左键（不要松开）
   c. 慢慢向右下方拖动
   d. 观察 Box 是否变大
   e. 松开鼠标
   
   预期结果：
   ✅ Box 应该实时变大（不是移动！）
   ✅ 松开后保持新尺寸
   
   失败现象：
   ❌ Box 移动了位置（说明 Draggable 还在拦截）
   ❌ Box 没有任何反应（说明事件被阻止）
   ```

6. **测试所有 8 个方向**:
   ```
   右下 (SE): [ ] 可以拖拽 Resize
   右   (E):  [ ] 可以拖拽 Resize
   下   (S):  [ ] 可以拖拽 Resize
   左下 (SW): [ ] 可以拖拽 Resize
   左   (W):  [ ] 可以拖拽 Resize
   左上 (NW): [ ] 可以拖拽 Resize
   上   (N):  [ ] 可以拖拽 Resize
   右上 (NE): [ ] 可以拖拽 Resize
   ```

7. **测试 Draggable 不冲突**:
   ```
   步骤：
   a. 点击并拖动标题栏
   b. Box 应该移动（Draggable 工作）✅
   c. 点击并拖动 Resize 句柄
   d. Box 应该 Resize（不是移动）✅
   
   关键：两者不应该冲突
   ```

---

## 📊 技术细节

### macOS 窗口层级系统

```
kCGScreenSaverWindowLevel      = 1000        (屏保)
kCGStatusBarWindowLevel        = 25          (状态栏)
kCGFloatingWindowLevel         = 3           (浮动窗口)
kCGNormalWindowLevel           = 0           (普通应用窗口)
kCGDesktopIconWindowLevel      = 0           (桌面图标)
kCGDesktopWindowLevel          = -2147483643 (桌面挂件) ← 我们使用这个
kCGBackstopMenuLevel           = -20         (菜单背景)
壁纸                            = 更低
```

**为什么 `-2147483643` 是正确的？**
- 这是 macOS 用于桌面挂件（Calendar, Weather 等）的层级
- 比所有普通窗口低，但比壁纸高
- 确保所有应用都能遮挡

---

### NSWindowCollectionBehavior 详解

| 行为 | 作用 | 副作用 |
|------|------|--------|
| `CanJoinAllSpaces` | 在所有 Space 中可见 | ⚠️ 如果配合 Transient 可能导致层级异常 |
| `Stationary` | 固定在桌面层 | ✅ 确保不会浮动到其他窗口上方 |
| `Transient` | 临时窗口行为 | ❌ 可能导致层级不可预测（已移除）|
| `IgnoresCycle` | 不参与窗口切换 | ❌ 可能与层级冲突（已移除）|

**当前配置**: 只使用 `CanJoinAllSpaces + Stationary` ✅

---

### Resize 事件隔离原理

**问题**:
```
用户点击 Resize 句柄
  ↓
mousedown 事件
  ↓
事件冒泡 ↑
  ↓
Draggable 捕获事件 ← ❌ 导致 Resize 不工作
```

**解决**:
```
用户点击 Resize 句柄
  ↓
mousedown 事件
  ↓
e.stopPropagation() ← ✅ 阻止冒泡
  ↓
Resizable 处理 ← ✅ 正常工作
  ↓
Draggable 收不到事件 ← ✅ 不会冲突
```

---

## 🔍 调试方法

### 如果窗口层级仍然不对

#### 方法 1: 确认配置生效
```
查看终端输出:
✅ Window level: -2147483643

如果不是这个值 → 配置没有生效
```

#### 方法 2: 对比系统挂件
```
1. 打开 macOS 自带的桌面挂件（如 Calendar）
2. 打开 Chrome
3. Chrome 移到 Calendar 上方
4. Chrome 应该遮挡 Calendar ✅

5. 打开我们的应用
6. Chrome 移到 Box 上方
7. Chrome 应该遮挡 Box ✅（行为应该一致）
```

#### 方法 3: 测试极端情况
```
打开 20 个不同的应用
全部移到 Box 上方
所有应用都应该遮挡 Box ✅

如果有任何一个应用不能遮挡 Box → 层级不对
```

---

### 如果 Resize 仍然不工作

#### 方法 1: 确认事件阻止生效
```javascript
// 在浏览器控制台（如果在 mock 模式）
document.querySelectorAll('.resize-handle').forEach(handle => {
  handle.addEventListener('mousedown', (e) => {
    console.log('Resize handle mousedown', e);
    console.log('Event will propagate:', e.bubbles);
  }, true);
});
```

#### 方法 2: 测试简单场景
```
1. 创建一个新 Box
2. 不要拖动标题栏（不触发 Draggable）
3. 直接拖动 Resize 句柄
4. 如果这样能 Resize ✅ → 说明 Resize 本身正常
5. 如果这样也不能 Resize ❌ → 说明 Resizable 配置有问题
```

#### 方法 3: 检查锁定状态
```
最常见的问题：Box 被锁定了

查看标题栏:
🔓 = 未锁定 ✅ 可以 Resize
🔒 = 已锁定 ❌ 无法 Resize

如果是 🔒，点击解锁为 🔓
```

---

## ✅ 成功的标志

### 窗口层级 ✅
- ✅ 终端显示 `Window level: -2147483643`
- ✅ 所有应用窗口都能遮挡 Box
- ✅ Chrome 全屏能完全遮挡 Box
- ✅ 行为与 macOS 系统挂件一致

### Resize ✅
- ✅ 可以看到 8 个白色圆点
- ✅ 悬停时变绿色并放大
- ✅ 拖动时 Box 实时 Resize
- ✅ 拖动标题栏时 Box 移动（Draggable 正常）
- ✅ 两者不冲突

---

**现在重新编译并彻底测试这两个核心功能！** 🎯

