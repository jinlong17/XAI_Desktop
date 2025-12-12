# 快速修复指南

## 🔧 已修复的问题

### 问题 1: `pnpm tauri clean` 命令不存在

**错误**:
```
error: unrecognized subcommand 'clean'
```

**原因**: Tauri CLI 没有 `clean` 命令

**正确做法**:
```bash
# 方法 1: 使用 cargo clean（推荐）
cd apps/desktop/src-tauri
cargo clean
cd ../..

# 方法 2: 直接删除 target 目录
rm -rf apps/desktop/src-tauri/target
```

---

### 问题 2: `fileDropEnabled` 配置错误

**错误**:
```
Error `tauri.conf.json` error on `app > windows > 0`: 
Additional properties are not allowed ('fileDropEnabled' was unexpected)
```

**原因**: 在 Tauri v2 中，`fileDropEnabled` 不应该放在 `windows` 数组的单个窗口配置中

**修复**: 已从 `tauri.conf.json` 中移除 `fileDropEnabled` 属性

**说明**: Tauri v2 默认支持文件拖放事件，不需要显式配置此属性。文件拖放通过监听 `tauri://file-drop` 事件实现。

---

## ✅ 现在可以正常启动

### 启动命令

```bash
cd /Users/jinlong/Desktop/jinlong_project/XAI_Desktop/apps/desktop
pnpm tauri dev
```

### 如果需要清理缓存

```bash
# 清理 Rust 编译缓存
cd apps/desktop/src-tauri
cargo clean
cd ../..

# 重新启动
cd apps/desktop
pnpm tauri dev
```

---

## 📝 关于文件拖放 (Task 4.2)

虽然移除了 `fileDropEnabled` 配置，但 Tauri v2 **仍然支持文件拖放**。

### 使用方式

在前端代码中监听文件拖放事件：

```typescript
import { listen } from '@tauri-apps/api/event';

// 监听文件拖放
await listen('tauri://file-drop', (event) => {
  console.log('Files dropped:', event.payload);
  // event.payload: string[] - 文件路径数组
});
```

### 权限配置

需要在 `apps/desktop/src-tauri/capabilities/default.json` 中添加文件系统权限：

```json
{
  "permissions": [
    "core:default",
    "fs:allow-read-file",
    "fs:allow-read-dir"
  ]
}
```

---

## 🎯 下一步

1. ✅ 启动应用: `cd apps/desktop && pnpm tauri dev`
2. ✅ 按照 `scripts/manual_check_list.md` 进行验证
3. ⏸️ Task 4.2（文件拖入）需要后续实现 Hook

---

**修复时间**: 2024-12-10  
**状态**: 已解决，应用可以正常启动

