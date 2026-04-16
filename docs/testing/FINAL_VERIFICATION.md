# 🎯 最终验证清单 - v0.6 核心修复

## 📦 修复内容总结

### 1. Resize 功能 - 彻底重构
**问题根源**: `react-draggable` 和 `react-resizable` 事件冲突

**解决方案**:
- ✅ 移除 `react-resizable` 依赖
- ✅ 实现自定义 `useResize` Hook（纯原生事件）
- ✅ 8 个方向的 Resize 句柄（白色圆点，hover 变绿）
- ✅ 与 Draggable 完全隔离（通过 `onMouseDown` 阻止事件冒泡）

### 2. 窗口层级 - 最底层配置
**问题根源**: 窗口层级设置不够低

**解决方案**:
- ✅ 添加 `tauri-plugin-macos-private-api` 初始化
- ✅ 设置 `setLevel_(kCGDesktopWindowLevel + 10)`
  - `kCGDesktopWindowLevel = -2147483647` (接近 int32 最小值)
  - 我们的窗口 = `-2147483637`
  - **结果**: 比桌面图标还低，所有应用都会遮挡

---

## 🚀 验证步骤

### 步骤 0: 清理并重新编译

```bash
cd /Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/apps/desktop/src-tauri
cargo clean
cd ../..
cd apps/desktop
pnpm tauri dev
```

**预计编译时间**: 1-2 分钟（Rust 重新编译）

---

### 步骤 1: 验证 Resize 功能 ✅

#### 测试清单：

1. **创建 Box**:
   - [ ] 双击桌面空白处
   - [ ] "New Box" 出现

2. **确保未锁定**:
   - [ ] 标题栏右侧显示 🔓
   - [ ] 如果是 🔒，点击解锁

3. **观察 Resize 句柄**:
   - [ ] Box 的 **8 个方向**（上下左右 + 四个角）都有白色圆点
   - [ ] 圆点大小: 20x20 像素，白色填充，灰色边框

4. **测试悬停效果**:
   - [ ] 鼠标悬停任意句柄
   - [ ] 句柄变绿色
   - [ ] 句柄放大 1.3 倍
   - [ ] 光标变为对应的 Resize 图标（↔ ↕ ↘ 等）

5. **测试拖拽 Resize**:
   - [ ] 点击并按住右下角白色圆点
   - [ ] 向右下方拖动鼠标
   - [ ] **关键**: Box 应该**实时变大**（不是移动位置）
   - [ ] 释放鼠标，Box 保持新尺寸

6. **测试所有 8 个方向**:
   - [ ] 右下 (SE): 向右下拖动 → Box 向右下扩展
   - [ ] 右 (E): 向右拖动 → Box 变宽
   - [ ] 下 (S): 向下拖动 → Box 变高
   - [ ] 左下 (SW): 向左下拖动 → Box 向左下扩展
   - [ ] 左 (W): 向左拖动 → Box 向左扩展（位置也会移动）
   - [ ] 左上 (NW): 向左上拖动 → Box 向左上扩展
   - [ ] 上 (N): 向上拖动 → Box 向上扩展（位置也会移动）
   - [ ] 右上 (NE): 向右上拖动 → Box 向右上扩展

7. **测试最小尺寸限制**:
   - [ ] 尝试把 Box 缩小到很小
   - [ ] 应该在 150x150 像素停止（无法更小）

---

### 步骤 2: 验证窗口层级（所有窗口遮挡 Box）✅

#### 测试清单：

**预期行为**: ✅ **所有应用窗口都应该遮挡 Box**

1. **Chrome 普通窗口**:
   - [ ] 打开 Chrome（非全屏）
   - [ ] 移动到 Box 上方
   - [ ] ✅ Chrome 遮挡 Box

2. **Chrome 全屏**:
   - [ ] 按 `Cmd+Ctrl+F` 进入全屏
   - [ ] ✅ Chrome 完全遮挡 Box（看不到 Box）
   - [ ] 退出全屏后 Box 重新可见

3. **VS Code / Cursor**:
   - [ ] 打开 Cursor 窗口
   - [ ] 移动到 Box 上方
   - [ ] ✅ Cursor 遮挡 Box

4. **Activity Monitor**:
   - [ ] 打开活动监视器
   - [ ] 移动到 Box 上方
   - [ ] ✅ Activity Monitor 遮挡 Box

5. **Finder**:
   - [ ] 打开 Finder 窗口
   - [ ] 移动到 Box 上方
   - [ ] ✅ Finder 遮挡 Box

6. **任意应用**:
   - [ ] 打开微信、Safari、Terminal 等
   - [ ] ✅ 所有应用都遮挡 Box

---

### 步骤 3: 验证鼠标穿透 ✅

1. **空白区域点击**:
   - [ ] 点击 Box **之间的空白区域**
   - [ ] ✅ 可以选中 macOS 桌面的文件/图标
   - [ ] ✅ 不会触发应用事件

2. **Box 本身可点击**:
   - [ ] 点击 Box 的标题栏
   - [ ] ✅ 可以拖动 Box
   - [ ] 点击 Box 内容区域
   - [ ] ✅ 可以与 Box 交互

3. **AI Icon 可点击**:
   - [ ] 点击左下角 AI Icon
   - [ ] ✅ 设置面板弹出

---

## 🔧 调试技巧

### 如果 Resize 仍然不工作

#### 调试步骤 1: 检查句柄是否可见
```
打开浏览器开发者工具（如果在 browser mock mode）:
1. 右键 Box → 检查元素
2. 查找 className="resize-handle"
3. 检查 style.pointerEvents 是否为 "auto"
4. 检查 style.zIndex 是否为 10000
```

#### 调试步骤 2: 测试事件监听
```
在控制台输入:
document.querySelectorAll('.resize-handle').forEach(handle => {
  handle.addEventListener('mousedown', (e) => {
    console.log('Resize handle clicked!', e);
  });
});

然后点击句柄，看控制台是否输出。
```

#### 调试步骤 3: 检查是否锁定
```
Box 锁定后无法 Resize:
- 查看标题栏右侧图标
- 🔓 = 未锁定（可以 Resize） ✅
- 🔒 = 已锁定（无法 Resize） ❌
```

---

### 如果窗口层级不正确

#### 调试步骤 1: 检查终端日志
启动 `pnpm tauri dev` 后，检查终端是否有错误：
```
✅ 正常：没有 "macos-private-api is not enabled" 警告
❌ 异常：有警告 → 说明插件未初始化
```

#### 调试步骤 2: 检查窗口层级（macOS 调试）
在 Tauri 窗口打开后，打开 macOS Terminal:
```bash
# 查看当前所有窗口的层级
osascript -e 'tell application "System Events" to get windows'
```

我们的窗口应该是最低的层级（-2147483637）。

#### 调试步骤 3: 测试极端情况
```
1. 打开 10 个不同应用的窗口
2. 全部移动到 Box 上方
3. 预期：ALL 窗口都遮挡 Box

如果有任何窗口被 Box 遮挡 = 层级设置失败
```

---

## 📊 预期结果总结

### ✅ 成功的标志：

| 功能 | 预期行为 | 如何确认 |
|------|---------|---------|
| **Resize** | 所有 8 个方向都能拖拽调整 | 拖动白色圆点，Box 实时变化 |
| **窗口层级** | 所有应用都遮挡 Box | Chrome 全屏看不到 Box |
| **鼠标穿透** | 空白区域点击不响应应用 | 能选中桌面图标 |
| **UI 可见性** | 按钮清晰可见 | 标题栏按钮不模糊 |
| **Settings 关闭** | 点击外部自动关闭设置面板 | 点击桌面，面板消失 |

---

## 🎉 验证完成后的下一步

### 如果全部通过 ✅
请告诉我：**"所有验证通过！"**

我会继续执行：
- Task 4.2: 真实文件拖入（OS File Drop）
- Task 5.1: 语言设置

### 如果有问题 ❌
请详细描述：
1. **哪个步骤失败**（如：Resize 步骤 5）
2. **实际行为**（如：Box 移动了而不是 Resize）
3. **截图**（如果有视觉问题）

---

## 🔍 技术细节说明（给开发者）

### Resize 实现原理

```typescript
// 自定义 Hook: useResize
export function useResize() {
  // 1. 记录初始状态
  const startX, startY, startWidth, startHeight

  // 2. 监听全局鼠标移动
  const handleMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY
    
    // 根据方向计算新尺寸
    if (direction === 'se') {
      newWidth = startWidth + deltaX
      newHeight = startHeight + deltaY
    }
    // ... 其他 7 个方向的逻辑
  }

  // 3. 监听全局鼠标释放
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  // 4. 句柄的 onMouseDown 启动 Resize
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}
```

**关键点**:
- 使用原生 `MouseEvent`，不经过 Draggable
- 事件监听在 `document` 级别，保证拖动流畅
- `stopPropagation()` 阻止 Draggable 响应

---

### 窗口层级实现原理

```rust
// macOS 窗口层级常量（从低到高）
kCGDesktopWindowLevel       = -2147483647  // 桌面壁纸
kCGBackstopMenuLevel        = -20          // 菜单背景
kCGNormalWindowLevel        = 0            // 普通窗口（Chrome, VS Code）
kCGFloatingWindowLevel      = 3            // 浮动窗口
kCGModalPanelWindowLevel    = 8            // 模态对话框
kCGStatusBarWindowLevel     = 25           // 状态栏
kCGScreenSaverWindowLevel   = 1000         // 屏保

// 我们的设置
ns_window.setLevel_(kCGDesktopWindowLevel + 10)  // -2147483637
```

**为什么 Chrome 全屏也能遮挡？**
- Chrome 全屏使用 `kCGFullScreenWindowLevel` = 很高的值
- 我们的窗口在最低层，全屏窗口自然在上方

---

## 📝 修改文件清单

### 前端:
1. `packages/plugin-organizer/src/hooks/useResize.ts` - 新建自定义 Resize Hook
2. `packages/plugin-organizer/src/SmartContainer.tsx` - 移除 react-resizable，使用自定义实现

### 后端:
1. `apps/desktop/src-tauri/src/lib.rs` - 修改窗口层级设置

### 配置:
1. `apps/desktop/src-tauri/tauri.conf.json` - 已正确配置（无需修改）

---

**现在请开始验证！ 🚀**

