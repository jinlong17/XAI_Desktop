# 完整清理和验证指南

> **目的**: 确保所有修改生效，消除缓存影响  
> **时间**: 约 5-10 分钟

---

## 🧹 步骤 1: 完全清理（必须执行）

### 1.1 清理 Rust 编译缓存

```bash
cd /Users/jinlong/Desktop/jinlong_project/XAI_Desktop/apps/desktop/src-tauri
cargo clean
cd ../..
```

**说明**: Rust 代码修改（窗口层级）必须清理缓存才能生效

---

### 1.2 清理浏览器缓存和 localStorage

**重要**: 旧的 localStorage 数据会包含之前的 Mock 文件！

#### 方法 A: 手动清理（推荐）

在应用启动后：
1. 打开开发工具（如果可用）
2. 在控制台运行:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

#### 方法 B: 删除所有 Box

启动应用后，删除所有现有的 Box，然后创建新的。

---

### 1.3 清理 node_modules（可选）

```bash
cd /Users/jinlong/Desktop/jinlong_project/XAI_Desktop
rm -rf node_modules apps/desktop/node_modules packages/plugin-organizer/node_modules
pnpm install
```

**说明**: 如果 CSS 不生效，可能需要清理前端依赖

---

## 🚀 步骤 2: 重新编译和启动

```bash
cd /Users/jinlong/Desktop/jinlong_project/XAI_Desktop/apps/desktop
pnpm tauri dev
```

**预期**: 编译需要几分钟（因为 cargo clean 了）

---

## ✅ 步骤 3: 逐项验证

### 验证 1: 窗口层级（最重要）

**测试**: Chrome 全屏是否能遮挡 Box？

#### 步骤:
1. 启动应用，创建一个 Box
2. 打开 Chrome 浏览器
3. 按 `Cmd+Ctrl+F` 进入全屏
4. Chrome 窗口移动到覆盖 Box 的位置

#### 预期结果:
✅ **成功**: Box 被 Chrome 完全遮挡，看不见了  
❌ **失败**: Box 仍然浮在 Chrome 之上

#### 如果失败:
可能需要调整窗口层级。在终端运行：
```bash
# 查看是否有 Tauri 警告
```

检查终端输出是否有关于窗口层级的警告。

---

### 验证 2: 鼠标穿透

**测试**: 空白区域点击能否选中桌面图标？

#### 步骤:
1. 确保桌面上有一些文件/文件夹
2. 应用窗口覆盖这些图标
3. 在 Box 之间的空白区域点击

#### 预期结果:
✅ **成功**: 能看到桌面图标被选中（蓝色高亮）  
❌ **失败**: 点击没有反应，或者应用拦截了点击

#### 调试方法:
如果失败，在开发工具控制台检查：
```javascript
// 检查 body 的 pointer-events
console.log(getComputedStyle(document.body).pointerEvents);
// 应该输出: "none"

// 检查 root 的 pointer-events
console.log(getComputedStyle(document.getElementById('root')).pointerEvents);
// 应该输出: "none"
```

#### 如果仍然失败:
手动强制设置：
```javascript
document.body.style.pointerEvents = 'none';
document.getElementById('root').style.pointerEvents = 'none';
```

---

### 验证 3: 空 Box（关键）

**测试**: 新建的 Box 是否为空？

#### 步骤:
1. 在应用中点击 "+ New Grid" 或创建新 Box 的按钮
2. 观察新 Box 的内部

#### 预期结果:
✅ **成功**: Box 内部完全空白，没有任何文件图标  
❌ **失败**: Box 内部有 5 个假文件（document.pdf, photo.png 等）

#### 如果失败（重要）:
**原因**: localStorage 中有旧数据！

**解决方案**:
1. 打开开发工具
2. 运行:
   ```javascript
   localStorage.clear();
   location.reload();
   ```
3. 重新创建 Box

**或者**: 删除所有现有的 Box，只测试新创建的

---

### 验证 4: Resize 功能

**测试**: 能否拖拽调整 Box 大小？

#### 步骤:
1. 创建一个 Box
2. 鼠标移动到 Box 的右下角
3. 观察光标是否变为 resize 图标（↘️）
4. 点击并拖动

#### 预期结果:
✅ **成功**: 
- 右下角有可见的 resize 句柄（小圆点）
- 光标变为 ↘️
- 可以拖动改变大小

❌ **失败**: 
- 看不到句柄
- 光标不变
- 拖动没反应

#### 调试方法:
检查 react-resizable CSS 是否加载：
```javascript
// 在控制台检查
document.querySelectorAll('link[href*="react-resizable"]').length > 0
// 应该返回 true 或看到加载的样式
```

#### 如果失败:
可能需要手动添加 resize 句柄样式：
```javascript
// 临时测试
const style = document.createElement('style');
style.textContent = `
  .react-resizable-handle {
    position: absolute;
    width: 20px;
    height: 20px;
    bottom: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.5);
    border: 2px solid #666;
    cursor: nwse-resize;
  }
`;
document.head.appendChild(style);
```

---

### 验证 5: 按钮可见性

**测试**: 标题栏按钮是否清晰可见？

#### 步骤:
1. 创建一个 Box
2. 观察标题栏的按钮（⌄, 🔒, ···, 视图切换）
3. 在不同的壁纸下测试（白色、深色、彩色）

#### 预期结果:
✅ **成功**: 按钮有白色背景（85% 不透明度），文字/图标清晰  
❌ **失败**: 按钮几乎看不见，对比度很低

#### 如果失败:
检查按钮元素的样式：
```javascript
// 找到一个按钮
const button = document.querySelector('.smart-container__header button');
console.log(getComputedStyle(button).background);
// 应该包含 rgba(255, 255, 255, 0.85)
```

---

## 🔧 常见问题和解决方案

### 问题 A: 所有测试都失败

**可能原因**: 代码没有重新编译

**解决方案**:
```bash
# 完全清理
cd apps/desktop/src-tauri
cargo clean
cd ../..

# 删除旧的构建产物
rm -rf apps/desktop/src-tauri/target

# 重新编译（会花几分钟）
cd apps/desktop
pnpm tauri dev
```

---

### 问题 B: 验证 1 和 2 失败（窗口行为）

**可能原因**: macOS 窗口层级设置不生效

**调试步骤**:
1. 检查终端输出是否有 Rust 错误
2. 尝试不同的窗口层级值

**临时修改测试**:
编辑 `apps/desktop/src-tauri/src/lib.rs`:
```rust
// 尝试不同的值
ns_window.setLevel_(0);   // 普通层级
// 或
ns_window.setLevel_(-2);  // 更低的层级
```

重新编译测试。

---

### 问题 C: 验证 3 失败（Box 不为空）

**可能原因**: localStorage 有旧数据

**彻底解决**:
```javascript
// 在控制台运行
localStorage.removeItem('xai-desktop-layout');
location.reload();
```

然后重新创建 Box。

---

### 问题 D: 验证 4 失败（Resize 不工作）

**可能原因**: react-resizable CSS 未加载

**检查**:
```bash
# 确认包已安装
cd packages/plugin-organizer
pnpm list react-resizable
# 应该显示 react-resizable@3.0.5
```

**手动导入测试**:
在 `SmartContainer.tsx` 顶部确认有：
```typescript
import "react-resizable/css/styles.css";
```

---

## 📊 验证结果记录

请填写验证结果：

```
执行时间: __________

✅ 清理步骤:
[ ] 1.1 cargo clean
[ ] 1.2 localStorage.clear()
[ ] 1.3 pnpm install（如果需要）

✅ 重新编译:
[ ] 编译成功，无错误

✅ 验证结果:
[ ] 验证 1: 窗口层级     [ ] 通过 [ ] 失败
[ ] 验证 2: 鼠标穿透     [ ] 通过 [ ] 失败
[ ] 验证 3: 空 Box       [ ] 通过 [ ] 失败
[ ] 验证 4: Resize       [ ] 通过 [ ] 失败
[ ] 验证 5: 按钮可见性   [ ] 通过 [ ] 失败

总体评价:
[ ] 全部通过 ✅
[ ] 部分通过，具体失败项: _______________
[ ] 大部分失败

备注:
_________________________________________
```

---

## 🎯 如果全部失败

请提供以下信息以便进一步诊断：

1. **终端完整输出**（包括编译过程）
2. **浏览器控制台的错误**（如果有开发工具）
3. **截图**（显示当前状态）
4. **macOS 版本**: 运行 `sw_vers`

---

**记住**: 最关键的是 **cargo clean + localStorage.clear()**！

