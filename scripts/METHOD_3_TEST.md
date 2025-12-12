# 🧪 方案 3: Transient + 延迟设置 + skipTaskbar=false

## 核心策略

### 问题分析
- ✅ 需求 1: 窗口在所有 Space 中可见 (`CanJoinAllSpaces`)
- ✅ 需求 2: 所有应用窗口都能遮挡 Box（窗口层级正常）
- ❌ 之前的方案无法同时满足这两个需求

### 新方案的三重保障

#### 1. **添加 `Transient` 行为**
```rust
NSWindowCollectionBehaviorCanJoinAllSpaces
| NSWindowCollectionBehaviorTransient      // ← 新增：临时窗口行为
| NSWindowCollectionBehaviorIgnoresCycle   // ← 不参与窗口切换
```

**`Transient` 的作用**:
- 告诉 macOS 这是一个"临时"窗口（类似通知、浮动面板）
- 临时窗口通常层级较低，易被遮挡
- 但仍然可以配合 `CanJoinAllSpaces` 跨 Space 可见

#### 2. **延迟重新设置层级**
```rust
// 初始设置
ns_window.setLevel_(i32::MIN + 100);

// 500ms 后再次设置（防止 Tauri 覆盖）
std::thread::spawn(move || {
    std::thread::sleep(Duration::from_millis(500));
    ns_window.setLevel_(i32::MIN + 100);  // 重新应用
});
```

**为什么需要延迟？**
- Tauri 在 `setup` 后可能还有初始化逻辑
- 这些逻辑可能重置窗口属性
- 延迟确保我们的设置是最后执行的

#### 3. **修改 `skipTaskbar: false`**
```json
// tauri.conf.json
{
  "skipTaskbar": false  // 之前是 true
}
```

**为什么？**
- `skipTaskbar: true` 可能让系统认为这是"特殊"窗口
- 特殊窗口可能有更高的默认层级
- 改为 `false` 让窗口像普通窗口一样参与层级管理

---

## 🚀 测试步骤

### 步骤 1: 重新启动
```bash
cd /Users/jinlong/Desktop/jinlong_project/XAI_Desktop/apps/desktop
pnpm tauri dev
```

---

### 步骤 2: 检查终端输出（关键）

应该看到 **两次** 输出：

#### 第一次（启动时）:
```
✅ macOS window configured (Method 3 - Transient):
   - Window level: -2147483548 (extremely low)
   - Behaviors: CanJoinAllSpaces + Transient + IgnoresCycle
   - Transparent: true
```

#### 第二次（500ms 后）:
```
🔄 Window level re-applied after delay: -2147483548
```

**如果看不到第二次输出** → 延迟逻辑可能失败

---

### 步骤 3: 测试窗口遮挡

#### 完整测试清单：

```
1. Chrome 普通窗口:
   [ ] 打开 Chrome（不要全屏）
   [ ] 移动到 Box 上方
   [ ] 预期: Chrome 遮挡 Box ✅

2. Chrome 全屏:
   [ ] 按 Cmd+Ctrl+F 进入全屏
   [ ] 预期: Box 完全看不见 ✅

3. VS Code / Cursor:
   [ ] 打开 Cursor
   [ ] 移动到 Box 上方
   [ ] 预期: Cursor 遮挡 Box ✅

4. Finder:
   [ ] 打开 Finder
   [ ] 移动到 Box 上方
   [ ] 预期: Finder 遮挡 Box ✅

5. 切换 Space:
   [ ] 按 Ctrl + → 切换到另一个 Space
   [ ] 预期: Box 仍然可见 ✅
   [ ] 在新 Space 中打开应用
   [ ] 预期: 应用能遮挡 Box ✅

6. Mission Control:
   [ ] 按 F3 或三指上滑
   [ ] 预期: 看到 Box 在最底层 ✅
```

---

## 📊 技术细节

### NSWindowCollectionBehavior 组合效果

| 行为 | 作用 | 与层级的关系 |
|------|------|-------------|
| `CanJoinAllSpaces` | 在所有 Space 中可见 | ⚠️ 可能提升层级 |
| `Transient` | 临时窗口行为 | ✅ 倾向于低层级 |
| `IgnoresCycle` | 不参与窗口切换 | ✅ 不影响用户的窗口导航 |

### 窗口层级值

```
kCGDesktopWindowLevel     = i32::MIN + 20     (-2147483627)
我们的窗口                 = i32::MIN + 100    (-2147483548)
kCGNormalWindowLevel      = 0
kCGFloatingWindowLevel    = 3
```

### skipTaskbar 的影响

| 设置 | 效果 | 可能的副作用 |
|------|------|-------------|
| `true` | 不在 Dock/任务切换器中显示 | 可能被视为"特殊"窗口，层级异常 |
| `false` | 在 Dock 中显示 | ⚠️ Box 会出现在 Dock（可能不理想） |

---

## 🔍 调试方法

### 如果仍然无法遮挡

#### 检查 1: 确认延迟设置生效
```
查看终端输出是否有:
🔄 Window level re-applied after delay: -2147483548

如果没有 → 延迟逻辑失败
```

#### 检查 2: 测试不同的延迟时间
```rust
// 在 lib.rs 中修改
std::thread::sleep(Duration::from_millis(1000));  // 改为 1 秒
```

#### 检查 3: 尝试移除 Transient
```rust
// 如果 Transient 导致问题，尝试只用 CanJoinAllSpaces
let behavior = NSWindowCollectionBehaviorCanJoinAllSpaces;
```

---

## 🎯 预期结果

### 如果方案 3 成功 ✅
- ✅ Box 在所有 Space 中可见
- ✅ 所有窗口都能遮挡 Box
- ⚠️ Box 会出现在 Dock（因为 `skipTaskbar: false`）

### 如果 Dock 图标是问题
可以尝试：
1. 接受它（桌面应用在 Dock 中是正常的）
2. 或者尝试其他方法隐藏 Dock 图标（如修改 `Info.plist`）

---

## 备用方案 4（如果方案 3 失败）

### 使用用户可配置的选项
```rust
// 提供一个设置选项
if user_settings.cross_space_visible {
    // 方案 A: CanJoinAllSpaces（可能层级异常）
} else {
    // 方案 B: 只在当前 Space（层级正常）
}
```

让用户自己选择是要"跨 Space 可见"还是"正确的层级"。

---

**当前状态**: 等待方案 3 测试结果
**关键指标**: 
1. 终端是否显示两次层级设置
2. 所有窗口是否能遮挡 Box
3. Box 是否在所有 Space 中可见

