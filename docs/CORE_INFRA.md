# CORE_INFRA.md — 底座工具清单

> Plugin 开发时，所有底层资源必须从此处获取，禁止私建。
>
> 最后更新: 2026-05-13

---

## 1. 关键文件路径

### Host 层 (`apps/desktop/src/`)
| 文件 | 说明 |
|------|------|
| `App.tsx` | 根组件 — Provider 组合 + 层挂载 |
| `main.tsx` | 入口 — Hash-based 多窗口路由 |
| `App.css`, `index.css` | 全局样式 (透明、pointer-events、毛玻璃) |
| `components/DndProvider.tsx` | @dnd-kit 全局 DnD 包装器 |

### Rust 后端 (`apps/desktop/src-tauri/`)
| 文件 | 说明 |
|------|------|
| `src/lib.rs` | Tauri builder 配置 + 所有命令 (目标: 重构为模块化) |
| `tauri.conf.json` | 窗口配置、CSP、capabilities |
| `Cargo.toml` | Rust 依赖 |

### Plugin (`packages/plugin-organizer/src/`)
| 文件 | 说明 |
|------|------|
| `types.ts` | 规范数据类型: `GridBox`, `DesktopItem`, `PersistedLayout` |
| `SmartContainer.tsx` | 核心 Grid 组件 (477行) |
| `GridItem.tsx` | 文件/文件夹项渲染器 |
| `useGridSystem.tsx` | Grid 状态管理 + localStorage 持久化 |
| `useContainerManager.tsx` | 容器生命周期管理 |
| `hooks/useFileDrop.ts` | HTML5 拖放 + 文件路径工具 |
| `hooks/useCustomResize.tsx` | 8 方向调整大小 |

### 待迁移文件 (当前在 Host 层，应在 Plugin 中)
| 当前位置 | 目标 | 说明 |
|---------|------|------|
| `plugins/OrganizerLayer.tsx` | plugin-organizer | Grid 编排 + 文件拖放中继 |
| `hooks/useMultiWindowGrids.ts` | plugin-organizer | 跨窗口 Grid 同步引擎 |
| `hooks/useGridWindow.ts` | plugin-organizer | Tauri invoke 封装 |
| `hooks/useGlobalMouse.ts` | @repo/core/hooks | macOS 全局鼠标追踪 |
| `components/AiAssistant/AiCube.tsx` | plugin-ai-cube | AI Cube UI |
| `components/Settings/SettingsPanel.tsx` | plugin-settings | 外观设置面板 |
| `context/SettingsContext.tsx` | @repo/core/store | 全局外观设置 |
| `context/InteractiveContext.tsx` | @repo/core/store | 交互模式状态 |

---

## 2. Tauri 命令调用 (目标 API)

```typescript
import { useTauriInvoke } from '@repo/core/hooks';
const { invoke } = useTauriInvoke();
await invoke('create_grid_window', { id, rect });
```

## 3. 跨窗口事件 (目标 API)

```typescript
import { emitEvent, useEventListener } from '@repo/core/events';

// 发送
await emitEvent('organizer:grid-update', { gridId, changes });

// 监听
useEventListener('organizer:grid-update', (payload) => { ... });
```

## 4. 全局类型 (目标 API)

```typescript
import type { GridBox, DesktopItem, PluginManifest, WindowType } from '@repo/core/types';
```

## 5. 状态管理 (目标 API)

```typescript
import { useAppStore } from '@repo/core/store';
const { interactive, setInteractive } = useAppStore();
```

## 6. 窗口工具 (目标 API)

```typescript
import { useWindow } from '@repo/core/hooks';
const { windowLabel, windowType, isMainWindow } = useWindow();
```

## 7. 插件注册 (目标 API)

```typescript
import { PluginRegistry } from '@repo/core/registry';
PluginRegistry.register(manifest, { OverlayLayer, ControlWidget, GridContent });
```

## 8. Rust Tauri Commands (当前)

| 命令 | 参数 | 说明 |
|------|------|------|
| `greet` | `{ name: string }` | 测试 stub |
| `create_grid_window` | `{ grid_id, x, y, width, height }` | 创建原生 grid 窗口 |
| `update_grid_window` | `{ grid_id, x, y, width, height }` | 更新窗口位置/大小 |
| `close_grid_window` | `{ grid_id }` | 销毁窗口 + 移除状态 |

## 9. 规范数据类型 (当前)

```typescript
interface GridBox {
  id: string;
  title: string;
  rect: { x: number; y: number; width: number; height: number };
  isLocked: boolean;
  isFolded: boolean;
  viewMode: 'grid' | 'list';
  itemIds: string[];
  themeColor?: string;
}

interface DesktopItem {
  id: string;
  filename: string;
  filepath: string;
  type: 'file' | 'folder' | 'app';
  icon: string;
  size?: number;
  createdAt: number;
}

interface PersistedLayout {
  grids: GridBox[];
  items: DesktopItem[];
}
```
