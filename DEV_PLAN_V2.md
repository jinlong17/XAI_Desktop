# DEV_PLAN_V2.md (Closed-Loop Edition)

> **版本目标**: v0.6 - Real System Integration  
> **核心任务**: 修复透明度底层机制 + 实现真实文件系统读取 (不再使用 Mock)  
> **开发模式**: Strict TDD (Implement -> Test -> Verify -> Fix)  
> **创建时间**: 2024-12-10

---

## 🛠️ Phase 1: 基础设施修复 (Infrastructure)

### Task 1.1: 激活 macOS 私有 API 以修复透明度

**Status**: ✅ [Done] - 配置完成，等待手动验证  
**Priority**: Critical (Blocker)  
**Context**: 终端报错提示缺少 `macos-private-api`，这是导致背景全白的根本原因。

**已完成**:
- ✅ Cargo.toml: 启用 `features = ["macos-private-api"]`
- ✅ tauri.conf.json: 添加 `"macOSPrivateApi": true`
- ✅ tauri.conf.json: 配置 `hiddenTitle` 和 `titleBarStyle`
- ✅ 创建验证脚本: `scripts/verify-transparency.sh`
- ✅ 验证脚本运行通过 (4/4 检查)

**AI_PROMPT**:
```markdown
【闭环任务：修复透明窗口底层配置】

## 1. [Implement] 安装与配置

### 步骤 1.1: 启用 Cargo Feature
修改 `apps/desktop/src-tauri/Cargo.toml`:
```toml
[dependencies]
tauri = { version = "2", features = ["macos-private-api"] }
tauri-plugin-opener = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

### 步骤 1.2: 配置 Tauri
修改 `apps/desktop/src-tauri/tauri.conf.json`:
- 在 `app` 节点下添加 `"macOSPrivateApi": true`
- 确保 `windows[0].transparent` 设为 `true`
- 确保 `windows[0].decorations` 设为 `false`

示例:
```json
{
  "app": {
    "macOSPrivateApi": true,
    "windows": [{
      "transparent": true,
      "decorations": false,
      "hiddenTitle": true,
      "titleBarStyle": "Overlay"
    }]
  }
}
```

### 步骤 1.3: 验证 Rust 代码
确认 `apps/desktop/src-tauri/src/lib.rs` 已包含以下代码:
```rust
#[cfg(target_os = "macos")]
unsafe {
    let ns_window = window.ns_window().expect("ns_window") as id;
    ns_window.setBackgroundColor_(NSColor::clearColor(nil));
    ns_window.setOpaque_(NO);
}
```

## 2. [Test] 验证配置 (Manual Check)

创建 `scripts/verify-transparency.sh`:
```bash
#!/bin/bash
echo "🔍 Verifying Transparency Configuration..."
echo ""

# Check Cargo.toml
if grep -q 'features = \["macos-private-api"\]' apps/desktop/src-tauri/Cargo.toml; then
    echo "✅ macos-private-api feature enabled"
else
    echo "❌ macos-private-api feature NOT found"
fi

# Check tauri.conf.json
if grep -q '"transparent": true' apps/desktop/src-tauri/tauri.conf.json; then
    echo "✅ Window transparency enabled"
else
    echo "❌ Window transparency NOT enabled"
fi

if grep -q '"macOSPrivateApi": true' apps/desktop/src-tauri/tauri.conf.json; then
    echo "✅ macOSPrivateApi enabled"
else
    echo "⚠️  macOSPrivateApi not found"
fi
```

运行验证:
```bash
chmod +x scripts/verify-transparency.sh
./scripts/verify-transparency.sh
```

## 3. [Verify] 运行应用并验证

### 步骤 3.1: 清理并重新编译
```bash
cd apps/desktop
pnpm tauri clean
pnpm tauri dev
```

### 步骤 3.2: 关键检查
- [ ] 观察终端是否还有 "macos-private-api is not enabled" 的警告
- [ ] **视觉检查**: 确认能否看到桌面壁纸
- [ ] 测试点击空白区域是否能选中桌面图标

## 4. [Fix] 故障排除

如果构建失败:
```bash
cd apps/desktop/src-tauri
cargo clean
cd ../..
pnpm tauri clean
pnpm tauri dev
```

如果仍然白屏:
1. 检查 macOS 版本（需要 10.14+）
2. 检查系统设置 → 辅助功能 → 显示 → "降低透明度"是否关闭
3. 尝试生产构建: `pnpm tauri build`
```

---

## 📂 Phase 2: 真实文件系统集成 (Real File System)

> **目标**: 彻底移除 `mockData.ts`，让 Grid 容器读取真实的桌面文件。

### Task 2.1: 实现文件系统服务 (TDD Core)

**Status**: [Todo]  
**Priority**: High  
**Depends On**: Task 1.1 完成

**Context**: 我们需要一个中间层 `FileSystemService` 来隔离 Tauri 的 FS API，方便测试。

**AI_PROMPT**:
```markdown
【闭环任务：创建真实文件读取服务】

## 1. [Implement] 定义接口与服务

### 步骤 1.1: 安装依赖
```bash
pnpm add @tauri-apps/plugin-fs --filter @repo/plugin-organizer
```

### 步骤 1.2: 创建服务文件
在 `packages/plugin-organizer/src/services/` 下创建 `FileSystemService.ts`:

```typescript
import { readDir, BaseDirectory } from '@tauri-apps/plugin-fs';
import type { DesktopItem } from '../types';

export class FileSystemService {
  /**
   * 读取桌面文件
   * @param path 可选路径，默认读取桌面
   * @returns DesktopItem 数组
   */
  async readDesktopFiles(path?: string): Promise<DesktopItem[]> {
    try {
      const targetPath = path || '';
      const entries = await readDir(targetPath, { 
        baseDir: BaseDirectory.Desktop 
      });
      
      // 过滤隐藏文件并转换格式
      const items: DesktopItem[] = entries
        .filter(entry => !entry.name.startsWith('.'))
        .map((entry, index) => ({
          id: `file-${entry.name}-${index}`,
          name: entry.name,
          path: entry.name,
          type: this.getFileType(entry.name),
          size: 0, // 需要额外的 stat 调用获取
          icon: this.getFileIcon(entry.name),
          createdAt: new Date().toISOString(),
        }));
      
      return items;
    } catch (error) {
      console.warn('Failed to read desktop files:', error);
      return [];
    }
  }
  
  private getFileType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const typeMap: Record<string, string> = {
      'pdf': 'pdf',
      'doc': 'document',
      'docx': 'document',
      'txt': 'text',
      'jpg': 'image',
      'png': 'image',
      'gif': 'image',
      'mp4': 'video',
      'mov': 'video',
    };
    return typeMap[ext || ''] || 'file';
  }
  
  private getFileIcon(filename: string): string {
    const type = this.getFileType(filename);
    const iconMap: Record<string, string> = {
      'pdf': '📄',
      'document': '📝',
      'text': '📃',
      'image': '🖼️',
      'video': '🎬',
      'file': '📁',
    };
    return iconMap[type] || '📄';
  }
}
```

## 2. [Test] 编写单元测试

创建 `packages/plugin-organizer/src/services/__tests__/FileSystemService.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileSystemService } from '../FileSystemService';

// Mock Tauri FS API
vi.mock('@tauri-apps/plugin-fs', () => ({
  readDir: vi.fn(),
  BaseDirectory: {
    Desktop: 'Desktop',
  },
}));

import { readDir } from '@tauri-apps/plugin-fs';

describe('FileSystemService', () => {
  let service: FileSystemService;
  
  beforeEach(() => {
    service = new FileSystemService();
    vi.clearAllMocks();
  });
  
  it('should list files from desktop', async () => {
    // Mock 返回数据
    (readDir as any).mockResolvedValue([
      { name: 'document.pdf', isFile: true },
      { name: 'photo.png', isFile: true },
    ]);
    
    const files = await service.readDesktopFiles();
    
    expect(files).toHaveLength(2);
    expect(files[0].name).toBe('document.pdf');
    expect(files[0].type).toBe('pdf');
    expect(files[0].icon).toBe('📄');
    expect(files[1].name).toBe('photo.png');
    expect(files[1].type).toBe('image');
  });
  
  it('should filter hidden files', async () => {
    (readDir as any).mockResolvedValue([
      { name: '.DS_Store', isFile: true },
      { name: 'visible.txt', isFile: true },
    ]);
    
    const files = await service.readDesktopFiles();
    
    expect(files).toHaveLength(1);
    expect(files[0].name).toBe('visible.txt');
  });
  
  it('should handle empty directory', async () => {
    (readDir as any).mockResolvedValue([]);
    
    const files = await service.readDesktopFiles();
    
    expect(files).toHaveLength(0);
  });
  
  it('should handle read errors gracefully', async () => {
    (readDir as any).mockRejectedValue(new Error('Permission denied'));
    
    const files = await service.readDesktopFiles();
    
    expect(files).toHaveLength(0);
  });
});
```

## 3. [Verify] 运行测试

```bash
cd packages/plugin-organizer
pnpm test:run FileSystemService
```

期望输出:
```
✓ should list files from desktop
✓ should filter hidden files
✓ should handle empty directory
✓ should handle read errors gracefully

Tests  4 passed (4)
```

## 4. [Fix] 自动修复

如果测试失败:
- **Mock 不生效**: 检查 `vi.mock` 的路径是否正确
- **类型错误**: 确保 `DesktopItem` 接口包含所有必需字段
- **断言失败**: 对比预期值和实际值，调整逻辑
```

---

### Task 2.2: 配置 Tauri 权限 (Capabilities)

**Status**: [Todo]  
**Priority**: High  
**Depends On**: Task 2.1

**Context**: Tauri v2 默认禁止文件访问，必须显式开启 `fs` capability。

**AI_PROMPT**:
```markdown
【闭环任务：配置安全访问权限】

## 1. [Implement] 配置 Capabilities

创建或修改 `apps/desktop/src-tauri/capabilities/default.json`:

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Capability for the main window",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "fs:default",
    "fs:allow-read-dir",
    "fs:allow-stat",
    "fs:allow-exists"
  ],
  "scope": {
    "allow": [
      "$DESKTOP/**",
      "$DOWNLOAD/**",
      "$DOCUMENT/**"
    ]
  }
}
```

## 2. [Test] 验证配置格式

创建 `scripts/validate-capabilities.js`:

```javascript
const fs = require('fs');
const path = require('path');

const capPath = path.join(
  __dirname,
  '../apps/desktop/src-tauri/capabilities/default.json'
);

try {
  const data = JSON.parse(fs.readFileSync(capPath, 'utf8'));
  
  const required = ['fs:allow-read-dir', 'fs:allow-stat'];
  const missing = required.filter(p => !data.permissions.includes(p));
  
  if (missing.length > 0) {
    console.error('❌ Missing permissions:', missing);
    process.exit(1);
  }
  
  if (!data.scope || !data.scope.allow) {
    console.error('❌ Missing scope configuration');
    process.exit(1);
  }
  
  console.log('✅ Capabilities configuration valid');
  console.log('   Permissions:', data.permissions.filter(p => p.startsWith('fs:')));
  console.log('   Scope:', data.scope.allow);
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
```

## 3. [Verify] 运行验证

```bash
node scripts/validate-capabilities.js
```

期望输出:
```
✅ Capabilities configuration valid
   Permissions: [ 'fs:allow-read-dir', 'fs:allow-stat', 'fs:allow-exists' ]
   Scope: [ '$DESKTOP/**', '$DOWNLOAD/**', '$DOCUMENT/**' ]
```

## 4. [Fix] 修正

如果验证失败:
- 检查 JSON 语法
- 确认权限字段完整
- 验证 scope 路径格式
```

---

### Task 2.3: 重构 GridSystem 接入真实数据

**Status**: [Todo]  
**Priority**: High  
**Depends On**: Task 2.1, Task 2.2

**Context**: 将 `useGridSystem` 中的 mock 数据源替换为 `FileSystemService`。

**AI_PROMPT**:
```markdown
【闭环任务：UI 层接入真实数据】

## 1. [Implement] 修改 Hook

修改 `packages/plugin-organizer/src/useGridSystem.tsx`:

### 步骤 1.1: 导入服务
```typescript
import { FileSystemService } from './services/FileSystemService';
```

### 步骤 1.2: 初始化服务
```typescript
const fsService = useMemo(() => new FileSystemService(), []);
```

### 步骤 1.3: 修改初始化逻辑
替换原有的 mock 数据加载:

```typescript
useEffect(() => {
  const loadDesktopFiles = async () => {
    // 检查是否在 Tauri 环境
    if (typeof window === 'undefined' || !window.__TAURI__) {
      console.info('Not in Tauri environment, skipping file system load');
      return;
    }
    
    try {
      const files = await fsService.readDesktopFiles();
      
      if (files.length > 0 && grids.length === 0) {
        // 创建默认的 "Desktop" 容器
        const defaultGrid: GridBox = {
          id: 'desktop-inbox',
          title: 'Desktop Files',
          x: 100,
          y: 100,
          width: 400,
          height: 500,
          viewMode: 'grid',
          itemIds: files.map(f => f.id),
          isFolded: false,
          isLocked: false,
        };
        
        setGrids([defaultGrid]);
        
        const itemsMap = files.reduce((acc, file) => {
          acc[file.id] = file;
          return acc;
        }, {} as Record<string, DesktopItem>);
        
        setItems(itemsMap);
      }
    } catch (error) {
      console.warn('Failed to load desktop files:', error);
    }
  };
  
  loadDesktopFiles();
}, []); // 只在初始化时运行一次
```

### 步骤 1.4: 删除 Mock 引用
移除所有对 `mockData.ts` 的导入和使用。

## 2. [Test] 组件集成测试

由于测试环境已被清理，暂时跳过单元测试。
在 Tauri 环境中进行手动验证。

## 3. [Verify] 手动验证

```bash
cd apps/desktop
pnpm tauri dev
```

### 验证清单:
- [ ] 应用启动时自动读取桌面文件
- [ ] 显示 "Desktop Files" 容器
- [ ] 容器内显示真实的桌面文件（不是 Mock 数据）
- [ ] 文件图标正确显示
- [ ] 可以拖拽文件重新排列

## 4. [Fix] 故障排除

常见问题:
- **文件读取失败**: 检查 Tauri 权限配置
- **容器不显示**: 检查控制台是否有错误
- **无限重渲染**: 确保 useEffect 依赖数组正确
```

---

### Task 2.4: 删除 Mock 数据系统

**Status**: [Todo]  
**Priority**: Low  
**Depends On**: Task 2.3 验证通过

**AI_PROMPT**:
```markdown
【清理任务：移除遗留代码】

## 1. [Implement] 删除文件

```bash
rm packages/plugin-organizer/src/mockData.ts
```

## 2. [Test] 验证无引用

```bash
grep -r "mockData" packages/plugin-organizer/src/
```

期望: 无结果

## 3. [Verify] 运行应用

```bash
cd apps/desktop
pnpm tauri dev
```

确认应用仍然正常工作。

## 4. [Fix] 修正引用

如果发现残留引用，删除或替换为 FileSystemService。
```

---

## 🎯 执行顺序

### 当前优先级

1. **Task 1.1** (Critical) - 修复透明度 ← **立即执行**
2. Task 2.1 (High) - FileSystemService
3. Task 2.2 (High) - Tauri 权限
4. Task 2.3 (High) - 接入真实数据
5. Task 2.4 (Low) - 清理 Mock

---

## 📊 成功标准

### Phase 1 完成标准
- [ ] 终端无 "macos-private-api" 警告
- [ ] 能看到桌面壁纸
- [ ] 点击空白区域能操作桌面

### Phase 2 完成标准
- [ ] FileSystemService 测试全部通过 (4/4)
- [ ] 应用启动自动加载桌面文件
- [ ] 不再依赖 mockData.ts
- [ ] 显示真实文件图标和信息

---

## 🚀 立即开始

### 命令
```bash
cd /Users/jinlong/Desktop/jinlong_project/XAI_Desktop
```

### 执行 Task 1.1
按照上述 AI_PROMPT 的步骤操作。

---

---

## 🎨 v0.6 - 交互与真实数据接入 (Interaction & Core Logic Refinement)

> **版本目标**: 消除"幕布感"，实现真正的桌面挂件体验  
> **核心改进**: 窗口层级优化 + 鼠标穿透 + 真实文件交互  
> **优先级**: Critical (用户体验核心)

---

## 🪟 Phase 3: 窗口行为优化 (Window Behavior)

### Task 3.1: 窗口层级与鼠标穿透

**Status**: [Todo]  
**Priority**: Critical (Blocker)  
**Context**: 当前窗口始终在最前，遮挡其他应用；空白区域无法点击穿透到桌面。

**需求说明**:
- ✅ **期望行为**: Box 像桌面挂件一样贴在壁纸层，不遮挡其他应用（如 Chrome 全屏时应该盖住 Box）
- ✅ **期望行为**: 在 Box 之间的缝隙点击，应该能选中 macOS 桌面的文件
- ❌ **当前问题**: 窗口像"幕布"一样覆盖整个桌面，无法穿透

**AI_PROMPT**:
```markdown
【闭环任务：窗口层级与鼠标穿透配置】

## 1. [Implement] 修改窗口层级

### 步骤 1.1: 调整 Rust 窗口层级
修改 `apps/desktop/src-tauri/src/lib.rs`:

```rust
#[cfg(target_os = "macos")]
{
    use cocoa::appkit::{NSWindow, NSWindowCollectionBehavior};
    use cocoa::base::{id, NO};
    
    unsafe {
        let ns_window = window.ns_window().expect("ns_window") as id;
        
        // 设置窗口集合行为
        let behavior = NSWindowCollectionBehavior::NSWindowCollectionBehaviorCanJoinAllSpaces
            | NSWindowCollectionBehavior::NSWindowCollectionBehaviorStationary
            | NSWindowCollectionBehavior::NSWindowCollectionBehaviorIgnoresCycle;
        ns_window.setCollectionBehavior_(behavior);
        
        // 设置窗口层级：在桌面图标之上，但在普通窗口之下
        // kCGDesktopIconWindowLevel = 0, 我们设置为 -1 让它略低于普通窗口
        ns_window.setLevel_(-1);
        
        // 保持透明设置
        ns_window.setBackgroundColor_(NSColor::clearColor(nil));
        ns_window.setOpaque_(NO);
    }
}
```

### 步骤 1.2: 配置 CSS 穿透
修改 `apps/desktop/src/index.css`:

```css
/* 全局默认穿透 */
html, body, #root {
  pointer-events: none !important;
}

/* 应用容器也穿透 */
.app-shell, .interactive-layer {
  pointer-events: none !important;
}
```

修改 `apps/desktop/src/App.css`:

```css
/* 只有交互元素可点击 */
.smart-container,
.ai-cube,
.settings-panel {
  pointer-events: auto !important;
}
```

### 步骤 1.3: 验证组件配置
确认 `SmartContainer.tsx` 有 `className="smart-container"`。
确认 `AiCube.tsx` 有 `className="ai-cube"`。

## 2. [Test] 手动验证清单

由于窗口行为无法自动化测试，创建 `scripts/manual_check_list.md`:

```markdown
# 窗口行为手动验证清单

## 前置准备
1. 启动应用: `pnpm tauri dev`
2. 在桌面放置几个文件/文件夹用于测试

## 测试项目

### ✅ Test 1: 窗口层级（不遮挡其他应用）
- [ ] 打开 Chrome 或任意浏览器，全屏显示
- [ ] **预期**: Box 应该被浏览器窗口完全遮挡
- [ ] **实际**: _____________

### ✅ Test 2: 鼠标穿透（空白区域）
- [ ] 在两个 Box 之间的空白区域点击
- [ ] **预期**: 能选中桌面上的文件/文件夹，Mac 出现蓝色选框
- [ ] **实际**: _____________

### ✅ Test 3: Box 可交互
- [ ] 点击 Box 的标题栏
- [ ] **预期**: 可以拖动 Box
- [ ] **实际**: _____________

### ✅ Test 4: AI Cube 可交互
- [ ] 点击左上角的 AI Cube
- [ ] **预期**: 打开设置面板
- [ ] **实际**: _____________

### ✅ Test 5: 多空间支持
- [ ] 切换到另一个 Mission Control 空间
- [ ] **预期**: Box 仍然可见（跨空间显示）
- [ ] **实际**: _____________

## 故障排除

如果 Test 1 失败（Box 仍然遮挡浏览器）:
- 检查 lib.rs 中的 `setLevel_(-1)` 是否生效
- 尝试调整为 `setLevel_(0)` 或 `setLevel_(-2)`

如果 Test 2 失败（无法穿透）:
- 检查 index.css 中的 `pointer-events: none` 是否应用
- 使用浏览器开发工具检查 body 的 computed styles
- 确认 SmartContainer 有 `pointer-events: auto`
```

## 3. [Verify] 运行验证

```bash
# 1. 清理并重新编译
cd apps/desktop
pnpm tauri clean
pnpm tauri dev

# 2. 按照 scripts/manual_check_list.md 逐项测试
```

## 4. [Fix] 故障排除

### 问题 A: 窗口仍然遮挡其他应用
**原因**: 窗口层级设置不正确

**解决方案**:
```rust
// 尝试不同的层级值
ns_window.setLevel_(-1);  // 推荐
// 或
ns_window.setLevel_(0);   // 备选
```

### 问题 B: 无法点击穿透
**原因**: CSS pointer-events 未生效

**诊断**:
```javascript
// 在浏览器控制台运行
console.log(getComputedStyle(document.body).pointerEvents); 
// 应该输出 "none"
```

**解决方案**:
- 确保 CSS 规则有 `!important`
- 检查是否有其他样式覆盖

### 问题 C: Box 也无法点击
**原因**: pointer-events: auto 未正确应用

**解决方案**:
```css
/* 增强优先级 */
.smart-container,
.ai-cube {
  pointer-events: auto !important;
  z-index: 1000;
}
```
```

---

### Task 3.2: UI 可视性优化

**Status**: [Todo]  
**Priority**: Medium  
**Context**: Box 标题栏的操作按钮（折叠/锁定/关闭）对比度太低，看不清。

**AI_PROMPT**:
```markdown
【闭环任务：优化 Box 标题栏按钮可视性】

## 1. [Implement] 调整按钮样式

修改 `packages/plugin-organizer/src/SmartContainer.tsx`:

### 步骤 1.1: 增强按钮对比度
找到标题栏按钮的样式定义，调整为：

```typescript
const iconButtonStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.9)', // 从 0.2 提高到 0.9
  border: '1px solid rgba(0, 0, 0, 0.1)',
  borderRadius: '4px',
  padding: '4px 8px',
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'all 0.2s',
  color: '#1a1a1a', // 深色文字
  fontWeight: '500',
};

const iconButtonHoverStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 1)',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  transform: 'scale(1.05)',
};
```

### 步骤 1.2: 添加 hover 状态
```typescript
const [hoveredButton, setHoveredButton] = useState<string | null>(null);

// 在按钮上添加
onMouseEnter={() => setHoveredButton('fold')}
onMouseLeave={() => setHoveredButton(null)}
style={{
  ...iconButtonStyle,
  ...(hoveredButton === 'fold' ? iconButtonHoverStyle : {})
}}
```

## 2. [Test] 视觉验证

创建 `scripts/visual_check_buttons.md`:

```markdown
# Box 按钮可视性验证

## 测试环境
- 背景: 白色壁纸、深色壁纸、彩色壁纸

## 验证清单

### ✅ Test 1: 按钮可见性（静态）
- [ ] 在白色壁纸下，能清晰看到所有按钮
- [ ] 在深色壁纸下，能清晰看到所有按钮
- [ ] 按钮文字可读

### ✅ Test 2: Hover 反馈
- [ ] 鼠标悬停时，按钮有明显的视觉反馈
- [ ] Hover 动画流畅

### ✅ Test 3: 对比度测试
使用 WCAG 对比度工具:
- [ ] 文字与背景对比度 > 4.5:1 (AA 级别)
```

## 3. [Verify] 运行应用

```bash
pnpm tauri dev
```

按照 `scripts/visual_check_buttons.md` 测试。

## 4. [Fix] 微调

如果对比度仍然不足:
```typescript
// 进一步提高对比度
const iconButtonStyle = {
  background: '#ffffff',
  border: '1px solid #d0d0d0',
  color: '#000000',
  fontWeight: '600',
};
```
```

---

## 🧩 Phase 4: 核心逻辑优化 (Core Logic)

### Task 4.1: 移除 Mock 数据 + 修复 Resize

**Status**: [Todo]  
**Priority**: High  
**Context**: 
- 需求 #1: 新建 Box 时不应自动填充假数据
- 需求 #6: Box 无法拖拽调整大小

**AI_PROMPT**:
```markdown
【闭环任务：移除 Mock + 修复 Resize】

## 1. [Implement] 移除 Mock 数据

### 步骤 1.1: 删除 Mock 文件
```bash
rm packages/plugin-organizer/src/mockData.ts
```

### 步骤 1.2: 修改 useGridSystem.tsx
修改 `packages/plugin-organizer/src/useGridSystem.tsx`:

找到 `createGrid` 函数，确保：
```typescript
const createGrid = useCallback((x: number, y: number) => {
  const newGrid: GridBox = {
    id: `box-${Date.now()}`,
    title: 'New Box',
    x,
    y,
    width: 300,
    height: 400,
    viewMode: 'grid',
    itemIds: [], // 空数组，不再填充 Mock 数据
    isFolded: false,
    isLocked: false,
  };
  
  setGrids(prev => [...prev, newGrid]);
  saveLayout(); // 触发持久化
}, [saveLayout]);
```

### 步骤 1.3: 移除初始化 Mock
删除任何在 `useEffect` 中自动创建带 Mock 数据的 Grid 的代码。

## 2. [Implement] 修复 Resize 功能

### 步骤 2.1: 检查 SmartContainer 的 Resizable 配置
修改 `packages/plugin-organizer/src/SmartContainer.tsx`:

确认使用 `react-resizable` 或类似库:
```typescript
import { Resizable } from 'react-resizable';

// 在组件中
<Resizable
  width={data.width}
  height={data.height}
  onResize={(e, { size }) => {
    onUpdate(data.id, { width: size.width, height: size.height });
  }}
  minConstraints={[200, 150]} // 最小尺寸
  maxConstraints={[800, 600]} // 最大尺寸
>
  {/* Box 内容 */}
</Resizable>
```

### 步骤 2.2: 添加 Resize 句柄样式
```css
.react-resizable-handle {
  position: absolute;
  width: 20px;
  height: 20px;
  bottom: 0;
  right: 0;
  background: url('data:image/svg+xml;base64,...'); /* 拖拽图标 */
  cursor: nwse-resize;
}
```

## 3. [Test] 集成测试（手动）

创建 `scripts/test_resize_and_empty.md`:

```markdown
# Resize 和空 Box 测试

## Test 1: 新建 Box 是空的
- [ ] 点击 "+ New Grid" 按钮
- [ ] **预期**: Box 内部没有任何文件，显示空状态提示
- [ ] **实际**: _____________

## Test 2: Resize 功能
- [ ] 鼠标移动到 Box 右下角
- [ ] **预期**: 光标变为 resize 图标
- [ ] **实际**: _____________

- [ ] 拖拽右下角
- [ ] **预期**: Box 尺寸随鼠标动态变化
- [ ] **实际**: _____________

- [ ] 释放鼠标
- [ ] **预期**: 新尺寸被保存（刷新后仍保持）
- [ ] **实际**: _____________

## Test 3: 尺寸限制
- [ ] 尝试将 Box 拖得非常小
- [ ] **预期**: 有最小尺寸限制（如 200x150）
- [ ] **实际**: _____________

- [ ] 尝试将 Box 拖得非常大
- [ ] **预期**: 有最大尺寸限制（如 800x600）
- [ ] **实际**: _____________
```

## 4. [Verify] 运行测试

```bash
pnpm tauri dev
```

按照测试清单验证。

## 5. [Fix] 故障排除

### 问题: Resize 句柄不显示
**解决**:
```typescript
// 确保引入了 react-resizable 的 CSS
import 'react-resizable/css/styles.css';
```

### 问题: 拖拽时 Box 移动而不是 Resize
**解决**:
- 确保 Resize 句柄的 `pointer-events: auto`
- 句柄的 `z-index` 足够高
```

---

### Task 4.2: 真实文件拖入 (OS File Drop)

**Status**: [Todo]  
**Priority**: High  
**Context**: 需求 #7 - 支持从 macOS 桌面直接拖拽文件/文件夹到 Box 中。

**AI_PROMPT**:
```markdown
【闭环任务：实现 OS 文件拖入】

## 1. [Implement] 配置 Tauri File Drop

### 步骤 1.1: 启用 File Drop
修改 `apps/desktop/src-tauri/tauri.conf.json`:

```json
{
  "app": {
    "windows": [{
      "fileDropEnabled": true
    }]
  }
}
```

### 步骤 1.2: 配置文件权限
确认 `apps/desktop/src-tauri/capabilities/default.json` 包含:

```json
{
  "permissions": [
    "fs:allow-read-file",
    "fs:allow-stat"
  ]
}
```

### 步骤 1.3: 创建文件拖入 Hook
创建 `packages/plugin-organizer/src/hooks/useFileDrop.ts`:

```typescript
import { useEffect } from 'react';
import { listen, UnlistenFn } from '@tauri-apps/api/event';

interface FileDropPayload {
  paths: string[];
  position: { x: number; y: number };
}

export function useFileDrop(onDrop: (files: string[]) => void) {
  useEffect(() => {
    let unlisten: UnlistenFn | undefined;
    
    const setupListener = async () => {
      // 监听文件拖入事件
      unlisten = await listen<FileDropPayload>('tauri://file-drop', (event) => {
        console.log('Files dropped:', event.payload.paths);
        onDrop(event.payload.paths);
      });
    };
    
    // 检查是否在 Tauri 环境
    if (typeof window !== 'undefined' && window.__TAURI__) {
      setupListener();
    }
    
    return () => {
      unlisten?.();
    };
  }, [onDrop]);
}
```

### 步骤 1.4: 集成到 OrganizerLayer
修改 `apps/desktop/src/plugins/OrganizerLayer.tsx`:

```typescript
import { useFileDrop } from '@repo/plugin-organizer/hooks/useFileDrop';
import { useGridSystem } from '@repo/plugin-organizer';

function OrganizerContent() {
  const { grids, items, createItem, addItemToGrid } = useGridSystem();
  
  // 处理文件拖入
  const handleFileDrop = useCallback((filePaths: string[]) => {
    // 找到鼠标位置下的 Grid
    const targetGrid = findGridAtPosition(/* 鼠标位置 */);
    
    if (targetGrid) {
      // 将文件转换为 DesktopItem 并添加到 Grid
      filePaths.forEach(path => {
        const fileName = path.split('/').pop() || 'Unknown';
        const newItem: DesktopItem = {
          id: `file-${Date.now()}-${Math.random()}`,
          name: fileName,
          path: path,
          type: getFileType(fileName),
          icon: getFileIcon(fileName),
          size: 0,
          createdAt: new Date().toISOString(),
        };
        
        createItem(newItem);
        addItemToGrid(targetGrid.id, newItem.id);
      });
    }
  }, [grids, createItem, addItemToGrid]);
  
  useFileDrop(handleFileDrop);
  
  // ... 其余代码
}
```

## 2. [Test] 编写单元测试

创建 `packages/plugin-organizer/src/hooks/__tests__/useFileDrop.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFileDrop } from '../useFileDrop';

// Mock Tauri API
vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn((event, callback) => {
    // 保存回调供测试使用
    (globalThis as any).__tauriFileDropCallback = callback;
    return Promise.resolve(() => {}); // unlisten
  }),
}));

describe('useFileDrop', () => {
  beforeEach(() => {
    // Mock Tauri 环境
    (window as any).__TAURI__ = {};
  });
  
  it('should call onDrop when files are dropped', async () => {
    const onDrop = vi.fn();
    renderHook(() => useFileDrop(onDrop));
    
    // 模拟文件拖入事件
    const mockPayload = {
      paths: ['/Users/test/file1.txt', '/Users/test/file2.pdf'],
      position: { x: 100, y: 200 },
    };
    
    const callback = (globalThis as any).__tauriFileDropCallback;
    await callback({ payload: mockPayload });
    
    expect(onDrop).toHaveBeenCalledWith(mockPayload.paths);
  });
  
  it('should not setup listener if not in Tauri environment', () => {
    delete (window as any).__TAURI__;
    const onDrop = vi.fn();
    renderHook(() => useFileDrop(onDrop));
    
    expect((globalThis as any).__tauriFileDropCallback).toBeUndefined();
  });
});
```

## 3. [Verify] 运行测试

```bash
cd packages/plugin-organizer
pnpm test:run useFileDrop
```

期望: 2/2 测试通过 ✅

## 4. [Verify] 手动测试

创建 `scripts/test_file_drop.md`:

```markdown
# 文件拖入测试

## 前置准备
- 在 Mac 桌面准备几个测试文件（.txt, .pdf, .jpg 等）
- 启动应用: `pnpm tauri dev`

## Test 1: 单文件拖入
- [ ] 从桌面拖拽一个 .txt 文件到 Box 上
- [ ] **预期**: 文件图标出现在 Box 内
- [ ] **实际**: _____________

## Test 2: 多文件拖入
- [ ] 同时拖拽 3 个文件到 Box 上
- [ ] **预期**: 3 个文件都被添加
- [ ] **实际**: _____________

## Test 3: 文件夹拖入
- [ ] 拖拽一个文件夹到 Box 上
- [ ] **预期**: 文件夹作为一个项目被添加
- [ ] **实际**: _____________

## Test 4: 拖入位置识别
- [ ] 拖拽文件到两个 Box 之间的空白区域
- [ ] **预期**: 文件不被添加（或提示选择目标 Box）
- [ ] **实际**: _____________
```

## 5. [Fix] 故障排除

### 问题: 拖入文件没有反应
**诊断**:
```typescript
// 添加调试日志
useFileDrop((files) => {
  console.log('Files dropped:', files);
});
```

**检查**:
- tauri.conf.json 的 `fileDropEnabled: true` 是否生效
- 权限配置是否正确
- Hook 是否正确挂载

### 问题: 无法确定拖入目标 Box
**解决**: 实现 `findGridAtPosition` 函数:
```typescript
function findGridAtPosition(x: number, y: number): GridBox | null {
  return grids.find(grid => {
    return x >= grid.x && x <= grid.x + grid.width &&
           y >= grid.y && y <= grid.y + grid.height;
  }) || null;
}
```
```

---

## ⚙️ Phase 5: 设置增强 (Settings)

### Task 5.1: 添加语言选择

**Status**: [Todo]  
**Priority**: Low  
**Context**: 需求 #5 - 在 AI Icon Setting 面板增加语言下拉选项（中/英）。

**AI_PROMPT**:
```markdown
【闭环任务：添加语言设置 UI】

## 1. [Implement] 扩展 SettingsContext

### 步骤 1.1: 更新 Context
修改 `apps/desktop/src/context/SettingsContext.tsx`:

```typescript
interface SettingsContextValue {
  // 现有设置
  gridOpacity: number;
  gridBlur: number;
  // 新增
  language: 'zh' | 'en';
  setLanguage: (lang: 'zh' | 'en') => void;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<'zh' | 'en'>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as 'zh' | 'en') || 'en';
  });
  
  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);
  
  return (
    <SettingsContext.Provider value={{
      // ... 其他值
      language,
      setLanguage,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}
```

### 步骤 1.2: 更新 SettingsPanel UI
修改 `apps/desktop/src/components/Settings/SettingsPanel.tsx`:

```typescript
import { useSettings } from '../../context/SettingsContext';

export function SettingsPanel() {
  const { language, setLanguage, /* ... */ } = useSettings();
  
  return (
    <div className="settings-panel">
      {/* 现有设置 ... */}
      
      {/* 新增语言选择 */}
      <div className="setting-item">
        <label>Language / 语言</label>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value as 'zh' | 'en')}
          style={{
            padding: '6px 12px',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(15,23,42,0.8)',
            color: '#e7ecf3',
            cursor: 'pointer',
          }}
        >
          <option value="en">English</option>
          <option value="zh">中文</option>
        </select>
      </div>
    </div>
  );
}
```

## 2. [Test] 单元测试

创建 `apps/desktop/src/context/__tests__/SettingsContext.test.tsx`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SettingsProvider, useSettings } from '../SettingsContext';

describe('SettingsContext - Language', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  
  it('should default to English', () => {
    const { result } = renderHook(() => useSettings(), {
      wrapper: SettingsProvider,
    });
    
    expect(result.current.language).toBe('en');
  });
  
  it('should change language', () => {
    const { result } = renderHook(() => useSettings(), {
      wrapper: SettingsProvider,
    });
    
    act(() => {
      result.current.setLanguage('zh');
    });
    
    expect(result.current.language).toBe('zh');
  });
  
  it('should persist language to localStorage', () => {
    const { result } = renderHook(() => useSettings(), {
      wrapper: SettingsProvider,
    });
    
    act(() => {
      result.current.setLanguage('zh');
    });
    
    expect(localStorage.getItem('app-language')).toBe('zh');
  });
  
  it('should load language from localStorage', () => {
    localStorage.setItem('app-language', 'zh');
    
    const { result } = renderHook(() => useSettings(), {
      wrapper: SettingsProvider,
    });
    
    expect(result.current.language).toBe('zh');
  });
});
```

## 3. [Verify] 运行测试

```bash
cd apps/desktop
pnpm test:run SettingsContext
```

期望: 4/4 测试通过 ✅

## 4. [Verify] 手动验证

```markdown
# 语言设置测试

## Test 1: 切换语言
- [ ] 打开 Settings 面板
- [ ] 找到 "Language / 语言" 下拉框
- [ ] 切换到 "中文"
- [ ] **预期**: 选项被保存
- [ ] **实际**: _____________

## Test 2: 持久化
- [ ] 切换到 "中文"
- [ ] 刷新应用（重新运行 pnpm tauri dev）
- [ ] 打开 Settings 面板
- [ ] **预期**: 语言仍然是 "中文"
- [ ] **实际**: _____________
```

## 5. [Fix] 未来扩展

目前仅实现状态存储。未来可以：
- 创建 i18n 翻译文件
- 根据 `language` 状态动态切换 UI 文本
```

---

## 🎯 v0.6 执行顺序

### 优先级排序

1. **Task 3.1** (Critical) - 窗口层级与鼠标穿透 ← **最高优先级**
2. **Task 4.1** (High) - 移除 Mock + 修复 Resize
3. **Task 4.2** (High) - 真实文件拖入
4. **Task 3.2** (Medium) - UI 可视性优化
5. **Task 5.1** (Low) - 语言设置

---

## 📊 v0.6 成功标准

### Phase 3 完成标准（窗口行为）
- [ ] 全屏浏览器时，Box 被遮挡（不在最前）
- [ ] 空白区域点击能选中桌面文件
- [ ] Box 和 AI Cube 仍然可以正常交互
- [ ] Box 标题栏按钮清晰可见

### Phase 4 完成标准（核心逻辑）
- [ ] 新建 Box 内部为空（无 Mock 数据）
- [ ] Box 可以拖拽右下角调整大小
- [ ] 可以从 macOS 拖拽文件到 Box
- [ ] 文件显示真实图标和名称

### Phase 5 完成标准（设置）
- [ ] Settings 面板有语言下拉框
- [ ] 语言选择会被持久化

---

---

## 🚀 v2.2 - 效率助手套件 (Efficiency Suite)

> **版本目标**: 新增三大效率工具模块  
> **核心功能**: 桌面便利贴 + 四象限任务盘 + 番茄时钟  
> **开发模式**: Strict TDD (Implement -> Test -> Verify -> Fix)  
> **创建时间**: 2024-12-10

---

## 📦 Phase 6: 效率助手基础架构 (Efficiency Infrastructure)

### Task 6.1: 创建效率助手状态管理

**Status**: [Todo]  
**Priority**: High (Blocker)  
**Context**: 新增独立的 Store 管理便利贴、任务和番茄钟状态。

**AI_PROMPT**:
```markdown
【闭环任务：创建效率助手 Store】

## 1. [Implement] 定义数据结构与 Hook

### 步骤 1.1: 创建类型定义
创建 `packages/plugin-organizer/src/efficiency/types.ts`:

```typescript
export interface EfficiencyItemBase {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  position: { x: number; y: number };
}

export interface StickyNote extends EfficiencyItemBase {
  type: 'note';
  color: 'yellow' | 'pink' | 'blue' | 'green';
  isFolded: boolean;
  size: { width: number; height: number };
}

export type Quadrant = 
  | 'urgent-important' 
  | 'important-not-urgent' 
  | 'urgent-not-important' 
  | 'not-urgent-not-important';

export interface Task extends EfficiencyItemBase {
  type: 'task';
  isCompleted: boolean;
  quadrant: Quadrant;
  sourceNoteId?: string;
}

export type EfficiencyItem = StickyNote | Task;

export interface PomodoroState {
  isRunning: boolean;
  remainingSeconds: number;
  totalSeconds: number;
}

export interface PersistedEfficiencyData {
  notes: StickyNote[];
  tasks: Task[];
  pomodoro: PomodoroState;
}
```

### 步骤 1.2: 创建 Store Hook
创建 `packages/plugin-organizer/src/efficiency/useEfficiencyStore.tsx`:

```typescript
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StickyNote, Task, PomodoroState, PersistedEfficiencyData, Quadrant } from './types';

const STORAGE_KEY = 'xai-efficiency-data';
const POMODORO_DURATION = 25 * 60; // 25分钟

interface EfficiencyStoreValue {
  notes: StickyNote[];
  tasks: Task[];
  pomodoroState: PomodoroState;
  
  // Note CRUD
  createNote: (x: number, y: number) => void;
  updateNote: (id: string, patch: Partial<StickyNote>) => void;
  deleteNote: (id: string) => void;
  
  // Note -> Task 转换
  convertNoteToTask: (noteId: string, quadrant: Quadrant) => void;
  
  // Task CRUD
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleTaskComplete: (id: string) => void;
  deleteTask: (id: string) => void;
  
  // Pomodoro
  startPomodoro: () => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;
}

const EfficiencyContext = createContext<EfficiencyStoreValue | undefined>(undefined);

function loadEfficiencyData(): PersistedEfficiencyData | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PersistedEfficiencyData;
  } catch {
    return null;
  }
}

function saveEfficiencyData(data: PersistedEfficiencyData) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function EfficiencyStoreProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pomodoroState, setPomodoroState] = useState<PomodoroState>({
    isRunning: false,
    remainingSeconds: POMODORO_DURATION,
    totalSeconds: POMODORO_DURATION,
  });
  
  const saveTimer = useRef<number | null>(null);
  const pomodoroInterval = useRef<number | null>(null);

  // 1️⃣ 初始化加载数据
  useEffect(() => {
    const data = loadEfficiencyData();
    if (data) {
      setNotes(data.notes);
      setTasks(data.tasks);
      if (data.pomodoro) {
        setPomodoroState(data.pomodoro);
      }
    }
  }, []);

  // 2️⃣ Note CRUD
  const createNote = useCallback((x: number, y: number) => {
    const newNote: StickyNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: 'note',
      content: '',
      color: 'yellow',
      isFolded: false,
      size: { width: 200, height: 200 },
      position: { x, y },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes(prev => [...prev, newNote]);
  }, []);

  const updateNote = useCallback((id: string, patch: Partial<StickyNote>) => {
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, ...patch, updatedAt: Date.now() } 
        : note
    ));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  }, []);

  // 3️⃣ Note -> Task 转换（核心功能）
  const convertNoteToTask = useCallback((noteId: string, quadrant: Quadrant) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: 'task',
      content: note.content,
      isCompleted: false,
      quadrant,
      sourceNoteId: noteId,
      position: note.position,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // 删除便利贴，添加任务
    setNotes(prev => prev.filter(n => n.id !== noteId));
    setTasks(prev => [...prev, newTask]);
  }, [notes]);

  // 4️⃣ Task CRUD
  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, ...patch, updatedAt: Date.now() } 
        : task
    ));
  }, []);

  const toggleTaskComplete = useCallback((id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, isCompleted: !task.isCompleted, updatedAt: Date.now() } 
        : task
    ));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  // 5️⃣ Pomodoro Timer
  const startPomodoro = useCallback(() => {
    setPomodoroState(prev => ({ ...prev, isRunning: true }));
  }, []);

  const pausePomodoro = useCallback(() => {
    setPomodoroState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const resetPomodoro = useCallback(() => {
    setPomodoroState({
      isRunning: false,
      remainingSeconds: POMODORO_DURATION,
      totalSeconds: POMODORO_DURATION,
    });
  }, []);

  // 6️⃣ 番茄钟倒计时逻辑
  useEffect(() => {
    if (pomodoroState.isRunning) {
      pomodoroInterval.current = window.setInterval(() => {
        setPomodoroState(prev => {
          if (prev.remainingSeconds <= 1) {
            // 倒计时结束
            if (typeof window !== 'undefined' && window.__TAURI__) {
              // TODO: 触发 Tauri Notification
              console.log('⏰ Pomodoro Timer finished!');
            }
            return {
              ...prev,
              isRunning: false,
              remainingSeconds: 0,
            };
          }
          return {
            ...prev,
            remainingSeconds: prev.remainingSeconds - 1,
          };
        });
      }, 1000);
    } else {
      if (pomodoroInterval.current) {
        window.clearInterval(pomodoroInterval.current);
        pomodoroInterval.current = null;
      }
    }

    return () => {
      if (pomodoroInterval.current) {
        window.clearInterval(pomodoroInterval.current);
      }
    };
  }, [pomodoroState.isRunning]);

  // 7️⃣ 持久化（防抖）
  useEffect(() => {
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
    }
    saveTimer.current = window.setTimeout(() => {
      const data: PersistedEfficiencyData = { notes, tasks, pomodoro: pomodoroState };
      saveEfficiencyData(data);
    }, 1000);
    return () => {
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
      }
    };
  }, [notes, tasks, pomodoroState]);

  const value = useMemo<EfficiencyStoreValue>(
    () => ({
      notes,
      tasks,
      pomodoroState,
      createNote,
      updateNote,
      deleteNote,
      convertNoteToTask,
      updateTask,
      toggleTaskComplete,
      deleteTask,
      startPomodoro,
      pausePomodoro,
      resetPomodoro,
    }),
    [
      notes,
      tasks,
      pomodoroState,
      createNote,
      updateNote,
      deleteNote,
      convertNoteToTask,
      updateTask,
      toggleTaskComplete,
      deleteTask,
      startPomodoro,
      pausePomodoro,
      resetPomodoro,
    ],
  );

  return <EfficiencyContext.Provider value={value}>{children}</EfficiencyContext.Provider>;
}

export function useEfficiencyStore(): EfficiencyStoreValue {
  const ctx = useContext(EfficiencyContext);
  if (!ctx) throw new Error('useEfficiencyStore must be used within EfficiencyStoreProvider');
  return ctx;
}
```

## 2. [Test] 编写单元测试

创建 `packages/plugin-organizer/src/efficiency/__tests__/useEfficiencyStore.test.tsx`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { EfficiencyStoreProvider, useEfficiencyStore } from '../useEfficiencyStore';

describe('useEfficiencyStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllTimers();
  });

  it('should create a new note', () => {
    const { result } = renderHook(() => useEfficiencyStore(), {
      wrapper: EfficiencyStoreProvider,
    });

    expect(result.current.notes).toHaveLength(0);

    act(() => {
      result.current.createNote(100, 200);
    });

    expect(result.current.notes).toHaveLength(1);
    expect(result.current.notes[0].position).toEqual({ x: 100, y: 200 });
    expect(result.current.notes[0].color).toBe('yellow');
  });

  it('should update note properties', () => {
    const { result } = renderHook(() => useEfficiencyStore(), {
      wrapper: EfficiencyStoreProvider,
    });

    act(() => {
      result.current.createNote(100, 200);
    });

    const noteId = result.current.notes[0].id;

    act(() => {
      result.current.updateNote(noteId, { 
        content: 'Test note', 
        color: 'pink' 
      });
    });

    expect(result.current.notes[0].content).toBe('Test note');
    expect(result.current.notes[0].color).toBe('pink');
  });

  it('should convert note to task', () => {
    const { result } = renderHook(() => useEfficiencyStore(), {
      wrapper: EfficiencyStoreProvider,
    });

    act(() => {
      result.current.createNote(100, 200);
    });

    const noteId = result.current.notes[0].id;

    act(() => {
      result.current.updateNote(noteId, { content: 'Important meeting' });
    });

    act(() => {
      result.current.convertNoteToTask(noteId, 'urgent-important');
    });

    // 便利贴应该被移除
    expect(result.current.notes).toHaveLength(0);
    
    // 任务应该被创建
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].content).toBe('Important meeting');
    expect(result.current.tasks[0].quadrant).toBe('urgent-important');
    expect(result.current.tasks[0].sourceNoteId).toBe(noteId);
  });

  it('should toggle task completion', () => {
    const { result } = renderHook(() => useEfficiencyStore(), {
      wrapper: EfficiencyStoreProvider,
    });

    // 先创建一个任务（通过转换）
    act(() => {
      result.current.createNote(100, 200);
    });

    const noteId = result.current.notes[0].id;

    act(() => {
      result.current.convertNoteToTask(noteId, 'urgent-important');
    });

    const taskId = result.current.tasks[0].id;

    expect(result.current.tasks[0].isCompleted).toBe(false);

    act(() => {
      result.current.toggleTaskComplete(taskId);
    });

    expect(result.current.tasks[0].isCompleted).toBe(true);
  });

  it('should start and pause pomodoro timer', () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useEfficiencyStore(), {
      wrapper: EfficiencyStoreProvider,
    });

    expect(result.current.pomodoroState.isRunning).toBe(false);
    expect(result.current.pomodoroState.remainingSeconds).toBe(25 * 60);

    act(() => {
      result.current.startPomodoro();
    });

    expect(result.current.pomodoroState.isRunning).toBe(true);

    // 前进 5 秒
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.pomodoroState.remainingSeconds).toBe(25 * 60 - 5);

    act(() => {
      result.current.pausePomodoro();
    });

    expect(result.current.pomodoroState.isRunning).toBe(false);

    vi.useRealTimers();
  });

  it('should reset pomodoro timer', () => {
    const { result } = renderHook(() => useEfficiencyStore(), {
      wrapper: EfficiencyStoreProvider,
    });

    act(() => {
      result.current.startPomodoro();
    });

    act(() => {
      result.current.resetPomodoro();
    });

    expect(result.current.pomodoroState.isRunning).toBe(false);
    expect(result.current.pomodoroState.remainingSeconds).toBe(25 * 60);
  });
});
```

## 3. [Verify] 运行测试

```bash
cd packages/plugin-organizer
pnpm test:run useEfficiencyStore
```

期望输出:
```
✓ should create a new note
✓ should update note properties
✓ should convert note to task
✓ should toggle task completion
✓ should start and pause pomodoro timer
✓ should reset pomodoro timer

Tests  6 passed (6)
```

## 4. [Fix] 故障排除

如果测试失败:
- **类型错误**: 检查 types.ts 的接口定义
- **定时器测试失败**: 确保使用 vi.useFakeTimers()
- **状态不更新**: 检查 useCallback 的依赖数组
```

---

### Task 6.2: 实现桌面便利贴组件

**Status**: [Todo]  
**Priority**: High  
**Depends On**: Task 6.1

**AI_PROMPT**:
```markdown
【闭环任务：实现便利贴 UI 组件】

## 1. [Implement] 创建便利贴组件

### 步骤 1.1: 创建便利贴组件
创建 `packages/plugin-organizer/src/efficiency/components/StickyNoteCard.tsx`:

```typescript
import { CSSProperties, useRef, useState, KeyboardEvent } from 'react';
import Draggable, { DraggableEvent, DraggableData } from 'react-draggable';
import { Resizable, ResizeCallbackData } from 'react-resizable';
import { useDraggable } from '@dnd-kit/core';
import { StickyNote } from '../types';

const COLOR_MAP: Record<StickyNote['color'], string> = {
  yellow: '#fef3c7',
  pink: '#fce7f3',
  blue: '#dbeafe',
  green: '#d1fae5',
};

const MIN_SIZE = 150;

interface StickyNoteCardProps {
  note: StickyNote;
  onUpdate: (id: string, patch: Partial<StickyNote>) => void;
  onDelete: (id: string) => void;
}

export function StickyNoteCard({ note, onUpdate, onDelete }: StickyNoteCardProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [contentDraft, setContentDraft] = useState(note.content);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: note.id,
    data: { type: 'sticky-note', note },
  });

  const handleDragStop = (_e: DraggableEvent, data: DraggableData) => {
    onUpdate(note.id, { position: { x: data.x, y: data.y } });
  };

  const handleResize = (_e: unknown, { size }: ResizeCallbackData) => {
    onUpdate(note.id, { 
      size: { 
        width: Math.max(MIN_SIZE, size.width), 
        height: Math.max(MIN_SIZE, size.height) 
      } 
    });
  };

  const handleContentBlur = () => {
    setIsEditing(false);
    onUpdate(note.id, { content: contentDraft });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setContentDraft(note.content);
    }
  };

  const cycleColor = () => {
    const colors: StickyNote['color'][] = ['yellow', 'pink', 'blue', 'green'];
    const currentIndex = colors.indexOf(note.color);
    const nextColor = colors[(currentIndex + 1) % colors.length];
    onUpdate(note.id, { color: nextColor });
    setContextMenu(null);
  };

  const toggleFold = () => {
    onUpdate(note.id, { isFolded: !note.isFolded });
    setContextMenu(null);
  };

  const cardStyle: CSSProperties = {
    width: note.size.width,
    height: note.isFolded ? 40 : note.size.height,
    backgroundColor: COLOR_MAP[note.color],
    borderRadius: 8,
    boxShadow: isDragging 
      ? '0 12px 24px rgba(0,0,0,0.3)' 
      : '0 4px 12px rgba(0,0,0,0.15)',
    padding: 12,
    cursor: 'move',
    position: 'relative',
    overflow: 'hidden',
    transition: 'height 0.2s ease',
    pointerEvents: 'auto',
  };

  const textareaStyle: CSSProperties = {
    width: '100%',
    height: note.isFolded ? 'auto' : 'calc(100% - 24px)',
    border: 'none',
    background: 'transparent',
    resize: 'none',
    fontFamily: 'inherit',
    fontSize: 14,
    color: '#1f2937',
    outline: 'none',
    cursor: isEditing ? 'text' : 'move',
    overflow: note.isFolded ? 'hidden' : 'auto',
    whiteSpace: note.isFolded ? 'nowrap' : 'pre-wrap',
    textOverflow: note.isFolded ? 'ellipsis' : 'clip',
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      position={note.position}
      onStop={handleDragStop}
      disabled={isEditing}
    >
      <div
        ref={nodeRef}
        style={{ position: 'absolute', pointerEvents: 'auto' }}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({ x: e.clientX, y: e.clientY });
        }}
      >
        <Resizable
          width={note.size.width}
          height={note.size.height}
          onResize={handleResize}
          resizeHandles={note.isFolded ? [] : ['se']}
          handle={
            <span
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 16,
                height: 16,
                cursor: 'nwse-resize',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '0 0 8px 0',
              }}
            />
          }
        >
          <div
            ref={setDragRef}
            style={cardStyle}
            {...attributes}
            {...listeners}
            onClick={() => !isEditing && setIsEditing(true)}
          >
            <textarea
              value={contentDraft}
              onChange={(e) => setContentDraft(e.target.value)}
              onBlur={handleContentBlur}
              onKeyDown={handleKeyDown}
              placeholder="输入内容..."
              style={textareaStyle}
              readOnly={!isEditing}
            />
          </div>
        </Resizable>

        {contextMenu && (
          <div
            style={{
              position: 'fixed',
              top: contextMenu.y,
              left: contextMenu.x,
              background: 'rgba(0,0,0,0.85)',
              borderRadius: 8,
              padding: '8px',
              boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
              zIndex: 1000,
              minWidth: 120,
            }}
            onClick={() => setContextMenu(null)}
          >
            <button
              onClick={cycleColor}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                padding: '8px',
                textAlign: 'left',
                cursor: 'pointer',
                borderRadius: 4,
              }}
            >
              🎨 切换颜色
            </button>
            <button
              onClick={toggleFold}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                padding: '8px',
                textAlign: 'left',
                cursor: 'pointer',
                borderRadius: 4,
              }}
            >
              {note.isFolded ? '📂 展开' : '📁 折叠'}
            </button>
            <button
              onClick={() => {
                onDelete(note.id);
                setContextMenu(null);
              }}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#ff6b6b',
                padding: '8px',
                textAlign: 'left',
                cursor: 'pointer',
                borderRadius: 4,
              }}
            >
              🗑️ 删除
            </button>
          </div>
        )}
      </div>
    </Draggable>
  );
}
```

### 步骤 1.2: 创建便利贴层容器
创建 `packages/plugin-organizer/src/efficiency/components/StickyNotesLayer.tsx`:

```typescript
import { useEfficiencyStore } from '../useEfficiencyStore';
import { StickyNoteCard } from './StickyNoteCard';

export function StickyNotesLayer() {
  const { notes, updateNote, deleteNote } = useEfficiencyStore();

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}>
      {notes.map(note => (
        <StickyNoteCard
          key={note.id}
          note={note}
          onUpdate={updateNote}
          onDelete={deleteNote}
        />
      ))}
    </div>
  );
}
```

## 2. [Test] 手动验证清单

创建 `scripts/test_sticky_notes.md`:

```markdown
# 桌面便利贴测试清单

## 前置准备
- 启动应用: `pnpm tauri dev`
- 通过 AI Cube 菜单点击 "Add Note"

## Test 1: 创建便利贴
- [ ] 点击 "Add Note" 按钮
- [ ] **预期**: 在鼠标位置附近出现黄色便利贴
- [ ] **实际**: _____________

## Test 2: 编辑内容
- [ ] 点击便利贴内部
- [ ] 输入 "测试内容123"
- [ ] 点击外部区域
- [ ] **预期**: 内容被保存
- [ ] **实际**: _____________

## Test 3: 拖拽移动
- [ ] 拖拽便利贴到其他位置
- [ ] **预期**: 位置实时更新
- [ ] **实际**: _____________

## Test 4: 调整大小
- [ ] 拖拽便利贴右下角的 Resize 句柄
- [ ] **预期**: 尺寸实时变化
- [ ] **实际**: _____________

## Test 5: 右键菜单
- [ ] 右键点击便利贴
- [ ] **预期**: 显示菜单（切换颜色/折叠/删除）
- [ ] **实际**: _____________

## Test 6: 切换颜色
- [ ] 右键点击 "🎨 切换颜色"
- [ ] **预期**: 颜色从黄色 -> 粉色 -> 蓝色 -> 绿色循环
- [ ] **实际**: _____________

## Test 7: 折叠/展开
- [ ] 右键点击 "📁 折叠"
- [ ] **预期**: 便利贴只显示第一行内容
- [ ] 再次点击 "📂 展开"
- [ ] **预期**: 恢复完整内容显示
- [ ] **实际**: _____________

## Test 8: 持久化
- [ ] 创建 2 个便利贴，输入不同内容
- [ ] 刷新应用（Cmd+R 或重启）
- [ ] **预期**: 便利贴的位置、内容、颜色、折叠状态都保持
- [ ] **实际**: _____________

## Test 9: 删除便利贴
- [ ] 右键点击 "🗑️ 删除"
- [ ] **预期**: 便利贴立即消失
- [ ] **实际**: _____________
```

## 3. [Verify] 集成到应用

修改 `apps/desktop/src/plugins/OrganizerLayer.tsx`，添加便利贴层：

```typescript
import { EfficiencyStoreProvider } from '@repo/plugin-organizer/efficiency/useEfficiencyStore';
import { StickyNotesLayer } from '@repo/plugin-organizer/efficiency/components/StickyNotesLayer';

export function OrganizerLayer() {
  return (
    <EfficiencyStoreProvider>
      <div style={{ width: '100vw', height: '100vh', pointerEvents: 'none' }}>
        {/* 原有的 Grid 系统 */}
        <GridSystemProvider>
          {/* ... */}
        </GridSystemProvider>

        {/* 新增便利贴层 */}
        <StickyNotesLayer />
      </div>
    </EfficiencyStoreProvider>
  );
}
```

## 4. [Fix] 故障排除

### 问题: 便利贴无法拖拽
**解决**: 检查父容器的 `pointerEvents: 'none'`，确保便利贴组件本身是 `'auto'`

### 问题: 右键菜单不消失
**解决**: 添加 `useEffect` 监听全局点击事件关闭菜单

### 问题: 内容不保存
**解决**: 检查 `onBlur` 事件是否正确触发 `onUpdate`
```

---

### Task 6.3: 实现四象限任务盘

**Status**: [Todo]  
**Priority**: High  
**Depends On**: Task 6.2

**AI_PROMPT**:
```markdown
【闭环任务：实现四象限任务盘 + Data Transition】

## 1. [Implement] 创建四象限组件

### 步骤 1.1: 创建任务卡片组件
创建 `packages/plugin-organizer/src/efficiency/components/TaskCard.tsx`:

```typescript
import { CSSProperties } from 'react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onToggleComplete, onDelete }: TaskCardProps) {
  const cardStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    border: '1px solid rgba(0,0,0,0.1)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textDecoration: task.isCompleted ? 'line-through' : 'none',
    opacity: task.isCompleted ? 0.6 : 1,
    transition: 'all 0.2s ease',
  };

  return (
    <div style={cardStyle}>
      <input
        type="checkbox"
        checked={task.isCompleted}
        onChange={() => onToggleComplete(task.id)}
        style={{ cursor: 'pointer' }}
      />
      <span style={{ flex: 1, fontSize: 14, color: '#1f2937' }}>
        {task.content || '(空任务)'}
      </span>
      <button
        onClick={() => onDelete(task.id)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#ef4444',
          cursor: 'pointer',
          fontSize: 16,
        }}
        title="删除任务"
      >
        ×
      </button>
    </div>
  );
}
```

### 步骤 1.2: 创建四象限矩阵组件
创建 `packages/plugin-organizer/src/efficiency/components/EisenhowerMatrix.tsx`:

```typescript
import { CSSProperties } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useEfficiencyStore } from '../useEfficiencyStore';
import { Quadrant } from '../types';
import { TaskCard } from './TaskCard';

const QUADRANT_LABELS: Record<Quadrant, { title: string; color: string }> = {
  'urgent-important': { title: '紧急且重要', color: '#fecaca' },
  'important-not-urgent': { title: '重要不紧急', color: '#bfdbfe' },
  'urgent-not-important': { title: '紧急不重要', color: '#fde68a' },
  'not-urgent-not-important': { title: '不紧急不重要', color: '#d1fae5' },
};

interface QuadrantBoxProps {
  quadrant: Quadrant;
}

function QuadrantBox({ quadrant }: QuadrantBoxProps) {
  const { tasks, toggleTaskComplete, deleteTask } = useEfficiencyStore();
  const { isOver, setNodeRef } = useDroppable({
    id: `quadrant-${quadrant}`,
    data: { type: 'quadrant', quadrant },
  });

  const quadrantTasks = tasks.filter(t => t.quadrant === quadrant);
  const config = QUADRANT_LABELS[quadrant];

  const boxStyle: CSSProperties = {
    flex: 1,
    minHeight: 250,
    background: isOver ? `${config.color}cc` : `${config.color}66`,
    border: isOver ? '3px dashed #3b82f6' : '2px solid rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    transition: 'all 0.2s ease',
  };

  return (
    <div ref={setNodeRef} style={boxStyle}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1f2937' }}>
        {config.title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto' }}>
        {quadrantTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleComplete={toggleTaskComplete}
            onDelete={deleteTask}
          />
        ))}
        {quadrantTasks.length === 0 && (
          <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', margin: '20px 0' }}>
            拖入便利贴到此区域
          </p>
        )}
      </div>
    </div>
  );
}

export function EisenhowerMatrix() {
  const matrixStyle: CSSProperties = {
    position: 'fixed',
    bottom: 32,
    right: 32,
    width: 600,
    height: 500,
    background: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
    backdropFilter: 'blur(12px)',
    padding: 16,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: 16,
    pointerEvents: 'auto',
    zIndex: 100,
  };

  return (
    <div style={matrixStyle}>
      <QuadrantBox quadrant="urgent-important" />
      <QuadrantBox quadrant="important-not-urgent" />
      <QuadrantBox quadrant="urgent-not-important" />
      <QuadrantBox quadrant="not-urgent-not-important" />
    </div>
  );
}
```

### 步骤 1.3: 配置 DnD Context
修改 `apps/desktop/src/plugins/OrganizerLayer.tsx`：

```typescript
import { DndContext, DragOverlay, useSensors, useSensor, PointerSensor } from '@dnd-kit/core';
import { useEfficiencyStore } from '@repo/plugin-organizer/efficiency/useEfficiencyStore';
import { EisenhowerMatrix } from '@repo/plugin-organizer/efficiency/components/EisenhowerMatrix';

export function OrganizerLayer() {
  const { convertNoteToTask } = useEfficiencyStore();
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (!over) return;

    // 检查是否是便利贴拖到四象限
    if (
      active.data.current?.type === 'sticky-note' &&
      over.data.current?.type === 'quadrant'
    ) {
      const noteId = active.id;
      const quadrant = over.data.current.quadrant;
      
      // 触发数据转换：便利贴 -> 任务
      convertNoteToTask(noteId, quadrant);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <EfficiencyStoreProvider>
        <div style={{ width: '100vw', height: '100vh', pointerEvents: 'none' }}>
          <StickyNotesLayer />
          <EisenhowerMatrix />
          
          <DragOverlay>
            {/* 可选：拖拽时显示预览 */}
          </DragOverlay>
        </div>
      </EfficiencyStoreProvider>
    </DndContext>
  );
}
```

## 2. [Test] Data Transition 单元测试

创建 `packages/plugin-organizer/src/efficiency/__tests__/dataTransition.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { EfficiencyStoreProvider, useEfficiencyStore } from '../useEfficiencyStore';

describe('Data Transition: Note -> Task', () => {
  it('should convert note to task and remove from notes array', () => {
    const { result } = renderHook(() => useEfficiencyStore(), {
      wrapper: EfficiencyStoreProvider,
    });

    // 1. 创建便利贴
    act(() => {
      result.current.createNote(100, 200);
    });

    const noteId = result.current.notes[0].id;

    // 2. 更新便利贴内容
    act(() => {
      result.current.updateNote(noteId, { content: '学习 TypeScript' });
    });

    expect(result.current.notes).toHaveLength(1);
    expect(result.current.tasks).toHaveLength(0);

    // 3. 模拟拖拽：转换为任务
    act(() => {
      result.current.convertNoteToTask(noteId, 'important-not-urgent');
    });

    // 4. 断言：便利贴被移除
    expect(result.current.notes).toHaveLength(0);

    // 5. 断言：任务被创建
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].content).toBe('学习 TypeScript');
    expect(result.current.tasks[0].quadrant).toBe('important-not-urgent');
    expect(result.current.tasks[0].type).toBe('task');
    expect(result.current.tasks[0].sourceNoteId).toBe(noteId);
  });

  it('should preserve position info during conversion', () => {
    const { result } = renderHook(() => useEfficiencyStore(), {
      wrapper: EfficiencyStoreProvider,
    });

    act(() => {
      result.current.createNote(300, 400);
    });

    const noteId = result.current.notes[0].id;
    const originalPosition = result.current.notes[0].position;

    act(() => {
      result.current.convertNoteToTask(noteId, 'urgent-important');
    });

    expect(result.current.tasks[0].position).toEqual(originalPosition);
  });
});
```

## 3. [Verify] 手动验证清单

创建 `scripts/test_eisenhower_matrix.md`:

```markdown
# 四象限任务盘测试清单

## 前置准备
- 启动应用: `pnpm tauri dev`
- 创建 2-3 个便利贴并输入内容

## Test 1: 四象限显示
- [ ] 应用右下角显示四象限矩阵
- [ ] 每个象限有标题和颜色
- [ ] **预期**: 四个区域清晰可见
- [ ] **实际**: _____________

## Test 2: 拖拽便利贴到象限（核心功能）
- [ ] 拖拽一个便利贴到 "紧急且重要" 区域
- [ ] **预期**: 
  - 便利贴从桌面消失
  - 该区域出现新任务，内容与便利贴一致
  - 任务前有 checkbox
- [ ] **实际**: _____________

## Test 3: 拖拽高亮反馈
- [ ] 拖拽便利贴悬停在象限区域上方
- [ ] **预期**: 象限背景高亮或边框变化
- [ ] **实际**: _____________

## Test 4: 任务完成标记
- [ ] 点击任务前的 checkbox
- [ ] **预期**: 任务文字添加删除线，透明度降低
- [ ] 再次点击
- [ ] **预期**: 恢复正常状态
- [ ] **实际**: _____________

## Test 5: 任务删除
- [ ] 点击任务右侧的 "×" 按钮
- [ ] **预期**: 任务立即从列表消失
- [ ] **实际**: _____________

## Test 6: 多象限测试
- [ ] 创建 4 个便利贴
- [ ] 分别拖入 4 个象限
- [ ] **预期**: 每个象限各显示 1 个任务
- [ ] **实际**: _____________

## Test 7: 持久化
- [ ] 完成上述测试后，刷新应用
- [ ] **预期**: 所有任务的状态（完成/未完成）和位置都保持
- [ ] **实际**: _____________
```

## 4. [Fix] 故障排除

### 问题: 拖拽便利贴后没有转换为任务
**诊断**:
```typescript
// 在 handleDragEnd 中添加日志
console.log('Active:', active.data.current);
console.log('Over:', over.data.current);
```

**解决**: 确保 `useDraggable` 和 `useDroppable` 的 data 字段正确设置

### 问题: 任务显示在错误的象限
**解决**: 检查 `convertNoteToTask` 中的 quadrant 参数是否正确传递

### 问题: 便利贴拖拽后仍然存在
**解决**: 确认 `convertNoteToTask` 中调用了 `setNotes(prev => prev.filter(...))`
```

---

### Task 6.4: 实现番茄时钟

**Status**: [Todo]  
**Priority**: Medium  
**Depends On**: Task 6.1

**AI_PROMPT**:
```markdown
【闭环任务：实现番茄时钟 UI 和通知】

## 1. [Implement] 创建番茄钟组件

### 步骤 1.1: 创建番茄钟组件
创建 `packages/plugin-organizer/src/efficiency/components/PomodoroTimer.tsx`:

```typescript
import { CSSProperties, useMemo } from 'react';
import { useEfficiencyStore } from '../useEfficiencyStore';

export function PomodoroTimer() {
  const { pomodoroState, startPomodoro, pausePomodoro, resetPomodoro } = useEfficiencyStore();

  const minutes = Math.floor(pomodoroState.remainingSeconds / 60);
  const seconds = pomodoroState.remainingSeconds % 60;
  const progress = (pomodoroState.remainingSeconds / pomodoroState.totalSeconds) * 100;

  const containerStyle: CSSProperties = {
    position: 'fixed',
    top: 32,
    right: 32,
    width: 200,
    background: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    backdropFilter: 'blur(12px)',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    pointerEvents: 'auto',
    zIndex: 100,
  };

  const timerStyle: CSSProperties = {
    fontSize: 48,
    fontWeight: 700,
    color: '#1f2937',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.05em',
  };

  const progressBarStyle: CSSProperties = {
    width: '100%',
    height: 8,
    background: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  };

  const progressFillStyle: CSSProperties = {
    height: '100%',
    width: `${progress}%`,
    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
    transition: 'width 1s linear',
  };

  const buttonStyle: CSSProperties = {
    width: '100%',
    padding: '10px',
    borderRadius: 8,
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={containerStyle}>
      <h3 style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>番茄时钟</h3>
      
      <div style={timerStyle}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>

      <div style={progressBarStyle}>
        <div style={progressFillStyle} />
      </div>

      <div style={{ display: 'flex', gap: 8, width: '100%' }}>
        {!pomodoroState.isRunning ? (
          <button
            onClick={startPomodoro}
            style={{
              ...buttonStyle,
              background: '#10b981',
              color: '#fff',
            }}
          >
            开始
          </button>
        ) : (
          <button
            onClick={pausePomodoro}
            style={{
              ...buttonStyle,
              background: '#f59e0b',
              color: '#fff',
            }}
          >
            暂停
          </button>
        )}
        
        <button
          onClick={resetPomodoro}
          style={{
            ...buttonStyle,
            background: 'rgba(0,0,0,0.05)',
            color: '#6b7280',
          }}
        >
          重置
        </button>
      </div>
    </div>
  );
}
```

### 步骤 1.2: 添加通知功能（Tauri）
修改 `packages/plugin-organizer/src/efficiency/useEfficiencyStore.tsx`：

```typescript
// 在倒计时结束时触发通知
useEffect(() => {
  if (pomodoroState.isRunning) {
    pomodoroInterval.current = window.setInterval(() => {
      setPomodoroState(prev => {
        if (prev.remainingSeconds <= 1) {
          // 倒计时结束
          if (typeof window !== 'undefined' && window.__TAURI__) {
            // 调用 Tauri 通知 API
            import('@tauri-apps/plugin-notification').then(({ sendNotification }) => {
              sendNotification({
                title: '番茄时钟',
                body: '25分钟专注时间结束！休息一下吧 🎉',
              }).catch(err => console.warn('Notification failed:', err));
            });
          }
          return {
            ...prev,
            isRunning: false,
            remainingSeconds: 0,
          };
        }
        return {
          ...prev,
          remainingSeconds: prev.remainingSeconds - 1,
        };
      });
    }, 1000);
  } else {
    if (pomodoroInterval.current) {
      window.clearInterval(pomodoroInterval.current);
      pomodoroInterval.current = null;
    }
  }

  return () => {
    if (pomodoroInterval.current) {
      window.clearInterval(pomodoroInterval.current);
    }
  };
}, [pomodoroState.isRunning]);
```

### 步骤 1.3: 配置 Tauri 通知权限
修改 `apps/desktop/src-tauri/capabilities/default.json`:

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Capability for the main window",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "fs:default",
    "fs:allow-read-dir",
    "fs:allow-stat",
    "fs:allow-exists",
    "notification:default",
    "notification:allow-is-permission-granted",
    "notification:allow-request-permission",
    "notification:allow-notify"
  ]
}
```

## 2. [Test] 番茄钟逻辑测试

已在 Task 6.1 中测试，此处测试通知功能：

创建 `packages/plugin-organizer/src/efficiency/__tests__/pomodoroNotification.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { EfficiencyStoreProvider, useEfficiencyStore } from '../useEfficiencyStore';

// Mock Tauri notification API
vi.mock('@tauri-apps/plugin-notification', () => ({
  sendNotification: vi.fn(() => Promise.resolve()),
}));

describe('Pomodoro Notification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    (window as any).__TAURI__ = {}; // 模拟 Tauri 环境
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (window as any).__TAURI__;
  });

  it('should trigger notification when timer reaches 0', async () => {
    const { sendNotification } = await import('@tauri-apps/plugin-notification');
    
    const { result } = renderHook(() => useEfficiencyStore(), {
      wrapper: EfficiencyStoreProvider,
    });

    // 设置剩余时间为 3 秒
    act(() => {
      result.current.resetPomodoro();
      // 手动修改为 3 秒（测试用）
      // 实际应用中是 25*60 秒
    });

    act(() => {
      result.current.startPomodoro();
    });

    // 前进到倒计时结束
    await act(async () => {
      vi.advanceTimersByTime(25 * 60 * 1000 + 1000);
    });

    // 断言：通知被调用
    expect(sendNotification).toHaveBeenCalledWith({
      title: '番茄时钟',
      body: expect.stringContaining('结束'),
    });

    // 断言：定时器停止
    expect(result.current.pomodoroState.isRunning).toBe(false);
  });
});
```

## 3. [Verify] 手动验证清单

创建 `scripts/test_pomodoro.md`:

```markdown
# 番茄时钟测试清单

## 前置准备
- 启动应用: `pnpm tauri dev`
- 确认系统允许应用发送通知

## Test 1: UI 显示
- [ ] 应用右上角显示番茄钟组件
- [ ] 显示 "25:00" 倒计时
- [ ] 显示进度条
- [ ] **预期**: UI 清晰可见
- [ ] **实际**: _____________

## Test 2: 开始倒计时
- [ ] 点击 "开始" 按钮
- [ ] **预期**: 
  - 倒计时开始递减（每秒 -1）
  - 进度条实时更新
  - 按钮变为 "暂停"
- [ ] **实际**: _____________

## Test 3: 暂停功能
- [ ] 点击 "暂停" 按钮
- [ ] **预期**: 倒计时停止，时间不变
- [ ] 再次点击 "开始"
- [ ] **预期**: 从暂停位置继续倒计时
- [ ] **实际**: _____________

## Test 4: 重置功能
- [ ] 倒计时进行到 20:00
- [ ] 点击 "重置" 按钮
- [ ] **预期**: 倒计时恢复到 25:00，停止运行
- [ ] **实际**: _____________

## Test 5: 倒计时结束通知（重要）
- [ ] 为了快速测试，可以临时修改代码：
  ```typescript
  const POMODORO_DURATION = 5; // 5秒测试
  ```
- [ ] 点击 "开始"
- [ ] 等待 5 秒
- [ ] **预期**: 
  - 系统弹出通知："番茄时钟 - 25分钟专注时间结束！"
  - 倒计时停止在 00:00
- [ ] **实际**: _____________

## Test 6: 持久化
- [ ] 开始倒计时到 20:00
- [ ] 刷新应用
- [ ] **预期**: 倒计时状态保持（20:00，暂停状态）
- [ ] **实际**: _____________
```

## 4. [Verify] 集成到应用

修改 `apps/desktop/src/plugins/OrganizerLayer.tsx`：

```typescript
import { PomodoroTimer } from '@repo/plugin-organizer/efficiency/components/PomodoroTimer';

export function OrganizerLayer() {
  return (
    <EfficiencyStoreProvider>
      <div style={{ width: '100vw', height: '100vh', pointerEvents: 'none' }}>
        <StickyNotesLayer />
        <EisenhowerMatrix />
        <PomodoroTimer />
      </div>
    </EfficiencyStoreProvider>
  );
}
```

## 5. [Fix] 故障排除

### 问题: 通知不显示
**解决**:
```bash
# 检查权限配置
grep -A 5 "notification" apps/desktop/src-tauri/capabilities/default.json

# 在 macOS 系统设置中允许应用通知
```

### 问题: 倒计时不精确
**解决**: 使用 `setInterval` 而不是 `setTimeout`，每秒更新一次

### 问题: 进度条不更新
**解决**: 检查 CSS transition，确保 `width` 属性正确绑定
```

---

### Task 6.5: AI Cube 集成 - 添加便利贴创建入口

**Status**: [Todo]  
**Priority**: Medium  
**Depends On**: Task 6.2

**AI_PROMPT**:
```markdown
【闭环任务：在 AI Cube 菜单中添加 "Add Note" 功能】

## 1. [Implement] 扩展 AI Cube 菜单

修改 `apps/desktop/src/components/AiAssistant/AiCube.tsx`：

### 步骤 1.1: 导入效率助手 Hook
```typescript
import { useEfficiencyStore } from '@repo/plugin-organizer/efficiency/useEfficiencyStore';
```

### 步骤 1.2: 添加右键菜单选项
```typescript
export function AiCube({ isPanelOpen, onTogglePanel, onAnchorChange }: AiCubeProps) {
  const { createNote } = useEfficiencyStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleAddNote = () => {
    // 在鼠标位置附近创建便利贴
    createNote(contextMenu?.x ?? 200, contextMenu?.y ?? 200);
    setContextMenu(null);
  };

  return (
    <>
      <Draggable {...props}>
        <div
          {...otherProps}
          onContextMenu={handleContextMenu}
        >
          {/* AI Cube 内容 */}
        </div>
      </Draggable>

      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            background: 'rgba(0,0,0,0.85)',
            borderRadius: 8,
            padding: 8,
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
            zIndex: 10000,
            minWidth: 140,
          }}
          onClick={() => setContextMenu(null)}
        >
          <button
            onClick={handleAddNote}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: '#fff',
              padding: '8px 12px',
              textAlign: 'left',
              cursor: 'pointer',
              borderRadius: 4,
              fontSize: 14,
            }}
          >
            📝 Add Note
          </button>
          <button
            onClick={onTogglePanel}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: '#fff',
              padding: '8px 12px',
              textAlign: 'left',
              cursor: 'pointer',
              borderRadius: 4,
              fontSize: 14,
            }}
          >
            ⚙️ Settings
          </button>
        </div>
      )}
    </>
  );
}
```

## 2. [Test] 手动验证

```markdown
# AI Cube 菜单测试

## Test 1: 右键菜单显示
- [ ] 右键点击 AI Cube
- [ ] **预期**: 显示菜单，包含 "📝 Add Note" 和 "⚙️ Settings"
- [ ] **实际**: _____________

## Test 2: 创建便利贴
- [ ] 右键点击 AI Cube
- [ ] 点击 "📝 Add Note"
- [ ] **预期**: 在 AI Cube 附近出现新的黄色便利贴
- [ ] **实际**: _____________

## Test 3: 菜单自动关闭
- [ ] 右键打开菜单
- [ ] 点击页面其他区域
- [ ] **预期**: 菜单自动关闭
- [ ] **实际**: _____________
```

## 3. [Verify] 集成测试

确保 `OrganizerLayer` 中已包装 `EfficiencyStoreProvider`，使 `AiCube` 可以访问 `createNote` 方法。

## 4. [Fix] 故障排除

### 问题: useEfficiencyStore 报错 "must be used within Provider"
**解决**: 确保 `AiCube` 在 `<EfficiencyStoreProvider>` 内部渲染

### 问题: 便利贴创建位置不正确
**解决**: 使用 `event.clientX/Y` 而不是相对位置
```

---

## 🎯 v2.2 执行顺序

### 优先级排序

1. **Task 6.1** (High, Blocker) - 效率助手 Store ← **第一步**
2. **Task 6.2** (High) - 桌面便利贴组件
3. **Task 6.3** (High) - 四象限任务盘 + Data Transition
4. **Task 6.4** (Medium) - 番茄时钟
5. **Task 6.5** (Medium) - AI Cube 集成

---

## 📊 v2.2 成功标准

### Phase 6 完成标准（效率助手套件）

#### 便利贴功能
- [ ] 通过 AI Cube 右键菜单创建便利贴
- [ ] 支持编辑多行文本
- [ ] 支持右键切换颜色（4种颜色）
- [ ] 支持拖拽调整位置和大小
- [ ] 支持折叠/展开（折叠仅显示首行）
- [ ] 重启后位置、内容、颜色、折叠状态不丢失

#### 四象限任务盘
- [ ] 显示 2x2 四象限矩阵
- [ ] 支持拖拽便利贴到任意象限
- [ ] **Data Transition**: 拖入后便利贴从桌面移除，转换为任务显示在象限中
- [ ] 任务支持 Checkbox 标记完成
- [ ] 完成的任务显示删除线和透明度
- [ ] 支持删除任务

#### 番茄时钟
- [ ] 显示 25:00 倒计时和进度条
- [ ] 支持开始/暂停/重置
- [ ] 倒计时结束触发系统通知
- [ ] 状态持久化（刷新后保持）

---

## 🔍 关键测试项（Data Transition）

**最重要的测试场景**：

```markdown
# Data Transition 核心验证

## 场景：便利贴转任务
1. 创建便利贴，输入 "学习 React"
2. 拖拽到 "重要不紧急" 象限
3. **预期结果**:
   - ✅ 便利贴从桌面消失
   - ✅ "重要不紧急" 象限新增任务 "学习 React"
   - ✅ 任务有 checkbox（未勾选状态）
   - ✅ 任务的 `sourceNoteId` 记录了原便利贴 ID

## 单元测试必须通过
```typescript
expect(result.current.notes).toHaveLength(0); // 便利贴被移除
expect(result.current.tasks).toHaveLength(1); // 任务被创建
expect(result.current.tasks[0].content).toBe('学习 React'); // 内容正确
expect(result.current.tasks[0].quadrant).toBe('important-not-urgent'); // 象限正确
```
```

