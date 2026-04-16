# 🚀 快速启动指南

> 状态说明（2026-03-02）:
> - 本文档用于快速启动和基础验证。
> - 项目当前真实进度与阻塞请以 `docs/development/PROGRESS_SNAPSHOT.md` 为准。

## ✅ 问题已修复

### 修复内容：
1. ❌ **错误**: 试图使用不存在的 `tauri-plugin-macos-private-api` 插件
2. ✅ **修复**: Tauri v2 的 macOS 私有 API 是内置 feature，不需要额外插件

### 正确配置：

#### `Cargo.toml`:
```toml
[dependencies]
tauri = { version = "2", features = ["macos-private-api"] }  ← 启用 feature
```

#### `tauri.conf.json`:
```json
{
  "app": {
    "macOSPrivateApi": true  ← 启用权限
  }
}
```

#### `lib.rs`:
```rust
// ✅ 不需要这行：
// .plugin(tauri_plugin_macos_private_api::init())

// ✅ Tauri 会自动启用 macOS 私有 API
```

---

## 🚀 启动应用

### 方式 1: 使用脚本（推荐）
```bash
cd /Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop
./scripts/restart.sh
```

### 方式 2: 手动命令
```bash
cd /Users/lijinlong/Desktop/AI_Desktop/XAI_Desktop/apps/desktop
pnpm tauri dev
```

---

## 📊 预期输出

```
✅ 正常流程：

1. Compiling desktop_lib v0.1.0
   ↓
2. Finished dev [unoptimized + debuginfo]
   ↓
3. VITE v7.2.4 ready in XXX ms
   ↓
4. 应用窗口出现 ✅
```

---

## 🧪 验证清单

应用启动后，请测试：

### ✅ 1. Resize 功能
- [ ] 双击桌面创建 Box
- [ ] 确保标题栏显示 🔓（未锁定）
- [ ] 看到 8 个白色圆点（resize 句柄）
- [ ] 点击并拖动任意圆点
- [ ] **预期**: Box 实时 Resize（不是移动）

### ✅ 2. 窗口层级
- [ ] 打开 Chrome，按 `Cmd+Ctrl+F` 全屏
- [ ] **预期**: Chrome 完全遮挡 Box
- [ ] 打开任意应用（VS Code, Finder 等）
- [ ] **预期**: 所有窗口都遮挡 Box

### ✅ 3. 鼠标穿透
- [ ] 点击 Box **之间的空白区域**
- [ ] **预期**: 可以选中 macOS 桌面的文件

---

## ⚠️ 如果遇到问题

### 错误 1: 端口占用
```
Error: Port 1420 is already in use
```

**解决**:
```bash
lsof -ti:1420 | xargs kill -9
```

### 错误 2: 编译失败
```
error: no matching package named `XXX`
```

**解决**:
```bash
cd apps/desktop/src-tauri
cargo clean
cd ..
pnpm tauri dev
```

### 错误 3: 白色背景
```
终端显示: "macos-private-api is not enabled"
```

**检查**:
1. `Cargo.toml` → `features = ["macos-private-api"]` ✅
2. `tauri.conf.json` → `macOSPrivateApi: true` ✅

---

## 📝 技术说明

### 为什么不需要插件？

在 Tauri v2 中：
- `macos-private-api` 是 **Tauri 核心的 feature**
- 通过 Cargo feature 启用即可
- **不需要** 额外的 `.plugin()` 调用

### 窗口层级设置

```rust
// lib.rs 中的关键代码
ns_window.setLevel_((-2147483647 + 10) as i64);

// 层级对照：
// kCGDesktopWindowLevel    = -2147483647  ← 桌面壁纸
// 我们的窗口                = -2147483637  ← 比壁纸高一点
// kCGNormalWindowLevel     = 0            ← 普通应用
// kCGFloatingWindowLevel   = 3            ← 浮动窗口
```

**说明**: 窗口层级是当前核心问题之一，不同实验分支结果可能不同。请结合 `docs/development/PROGRESS_SNAPSHOT.md` 与 `docs/development/TECHNICAL_STATUS.md` 判断当前结论。

---

**现在请运行启动命令！** 🎯

