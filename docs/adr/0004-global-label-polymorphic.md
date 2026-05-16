# ADR-0004: 全局 Label 系统作为多态跨切关注

| 字段 | 值 |
|------|---|
| 状态 | Accepted |
| 日期 | 2026-05-12 |
| 决策者 | InnoPeak(产品 Owner)+ Claude(架构协作) |

## 背景

PRD v1.3 引入"全局 Label 系统"(§5.11),产品 Owner 明确要求:Label 应该是**跨模块的统一标签**,Todo / 习惯 / 便签 / 剪贴板项 / Grid Item / 看板卡片 都可以打同一套 Label,从而支持"按标签跨模块聚合"(如选中"健康"标签 → 同时显示相关 Todo + 习惯 + 便签)。

初版 PRD 把标签设计为 Todo 私有的 `todo_tags` 表 —— 这是错的,无法实现跨模块聚合。

## 方案

### 方案 A: 每个模块各有自己的 tags 表

`todo_tags` / `habit_tags` / `note_tags` / `clipboard_tags` ...

**优点**:简单,每个模块独立。
**缺点**:
- 跨模块按标签聚合要 JOIN 多张表,逻辑分散
- "同一个标签"在不同模块下是不同实体,不能统一管理
- 用户无法看到"健康标签下都有什么"的统一视图
- **否决** —— 与产品需求相悖。

### 方案 B: 全局 `labels` 表 + 每模块独立的 `*_label_assignments` 表

```sql
CREATE TABLE labels (...);
CREATE TABLE todo_labels (todo_id, label_id);
CREATE TABLE habit_labels (habit_id, label_id);
CREATE TABLE note_labels (note_id, label_id);
...
```

**优点**:Label 实体统一管理。
**缺点**:
- 每加一个新可贴标签的实体就要加一张表
- 跨模块查询"标签 X 下所有内容"要 UNION 多张表
- Plugin 间耦合度高(plugin-todo 要管理 todo_labels)
- 不利于横向扩展

### 方案 C: 全局 `labels` 表 + **多态** `label_assignments` 表

```sql
CREATE TABLE labels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  parent_id TEXT NULL,      -- P1:层级
  created_at INTEGER,
  updated_at INTEGER
);

CREATE TABLE label_assignments (
  label_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,   -- 'todo' / 'habit' / 'note' / 'clipboard_item' / 'grid_item' / 'board_card'
  entity_id TEXT NOT NULL,
  created_at INTEGER,
  PRIMARY KEY (label_id, entity_type, entity_id)
);

CREATE INDEX idx_label_assign_entity ON label_assignments(entity_type, entity_id);
```

**优点**:
- 一张表统一所有 entity 的 label 关系
- 新增"可贴标签的实体类型"只需在 plugin-labels 注册 `entity_type` 常量,**零 schema 变更**
- 跨模块查询"标签 X 下所有内容":单 SELECT + GROUP BY entity_type
- plugin-labels 单独拥有 labels 模块,其他 plugin 不直接管理 label 表

**缺点**:
- 失去数据库 FK 约束(`entity_id` 多态,无法 FK 到具体表)→ 需应用层一致性保证
- 跨模块查询返回的 `entity_id` 是字符串,需要按 `entity_type` 分别 JOIN 到对应实体表才能拿到完整数据
- 删除某 entity 时需要级联清理对应的 `label_assignments` 记录(应用层或 trigger)

### 方案 D: 用 JSON 数组在每个 entity 表存 label_ids

```sql
ALTER TABLE todos ADD COLUMN label_ids TEXT;  -- JSON array
```

**优点**:无 JOIN,读取快。
**缺点**:
- 反向查询"标签 X 下所有 Todo"要全表扫描或建 JSON 索引(SQLite 支持但低效)
- 跨模块查询更难
- 难以维护引用完整性
- **否决**。

## 决策

**选择方案 C(多态 `label_assignments` 表)**。

理由:
1. 完美支持"按标签跨模块聚合"产品需求(SELECT * FROM label_assignments WHERE label_id=?)
2. 新增 entity_type 零 schema 变更,符合 plugin 化扩展精神
3. 应用层一致性的复杂度可控(plugin-labels 提供统一 `assign(entity_type, entity_id, label_id)` / `unassign` / `query` API,所有 plugin 通过此接口)
4. plugin-labels 完全自包含,其他 plugin 只需声明自己的 `entity_type`

## 后果

**正面**:
- 一套 Label 系统支持所有可标记实体
- Todo / 习惯 / 便签 / 剪贴板 / Grid / 看板卡片均接入,跨模块体验统一
- 未来加新模块(如 AI 对话记录、桌宠成就)只需注册新 `entity_type`,零迁移
- plugin-labels 作为基础设施 plugin,其他业务 plugin 只依赖其 API,符合 plugin 单向依赖原则

**负面**:
- **失去数据库 FK 约束**:`entity_id` 是多态字段,无法外键。应用层必须保证一致性:
  - Plugin 删除 entity 时,通过 `core-events` 发 `<entity>:deleted` 事件,plugin-labels 监听并清理对应 assignments
  - 定时一致性检查(每周 vacuum 时跑一次)清理孤儿 assignment
- **查询复杂度上升**:跨模块查询"标签 X 下所有内容"返回 `(entity_type, entity_id)` 列表,再按类型分组 JOIN 对应表。封装在 plugin-labels 提供 `queryByLabel(label_id) -> { todos, habits, notes, ... }` API,UI 层无感知。
- **测试要求**:label_assignments 的多态一致性必须有专门测试(orphan detection / 删除级联)

## 衍生约束 — 各 Plugin 实施要求

- 每个有"可标记 entity"的 Plugin 必须:
  1. 在 `manifest.json` 声明 `labelable_entity_types: ['todo', ...]`
  2. 监听 `labels:assigned` / `labels:unassigned` 事件以刷新本模块 UI
  3. Entity 删除时发 `<plugin>:<entity>-deleted` 事件,plugin-labels 自动清理
- plugin-labels 公开 API:
  - `assign(label_id, entity_type, entity_id)`
  - `unassign(label_id, entity_type, entity_id)`
  - `listForEntity(entity_type, entity_id) -> Label[]`
  - `queryByLabel(label_id) -> AssignmentList`
  - `createLabel / updateLabel / deleteLabel`

## 相关

- PRD §5.11 全局 Label 系统
- PRD §8 数据模型(labels + label_assignments 表)
- SYSTEM_ARCHITECTURE.md §6.1(`labels:` 事件前缀)
- ADR-0001 静态插件注册(本 ADR 不冲突)
