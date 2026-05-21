# Track D Fix — D4: ExportService Import Schema Validation

## 背景

Claude Code 对 `codex/track-d-repo-integration` 的审查发现 **P2 issue**：

> **`ExportService` import lacks schema validation** — `packages/plugin-organizer/src/ExportService.ts:32-43` casts decoded payload to `RepoRecord[]` and writes directly via `adapter.save`. Crypto integrity is OK (AES-GCM tag), but a valid-passphrase + tampered-shape payload would corrupt the repo.

## 目标

`importEntities` 在调用 `adapter.save(record)` 前，必须 validate 每条 record 的 shape，确保是合法的 `RepoRecord`（has `id`, `entityType`, `schemaVersion`, `createdAt`, `updatedAt`, `syncScope`）。

`@repo/core-data` 已经提供 `assertRepoRecord(record)` 函数（位于 `packages/core-data/src/repo-utils.ts`），需要从主入口 re-export 或直接 import。

## 实施要求

### 1. 修改 `packages/plugin-organizer/src/ExportService.ts`

#### a) Import

```ts
import { assertRepoRecord, type RepoRecord } from "@repo/core-data";
```

确认 `@repo/core-data` 主入口（`packages/core-data/src/index.ts`）re-export 了 `assertRepoRecord`。如果没有，加 re-export（这是 internal infra utility，不算 contract 改动）。

#### b) `importEntities` 加 validation

```ts
export async function importEntities(
  bundle: ExportBundle,
  sources: readonly ExportSource<RepoRecord>[],
  passphrase: string,
): Promise<ImportResult> {
  const decoded = await decryptJson<{ records: unknown }>(bundle.payload, passphrase);
  if (!decoded || !Array.isArray(decoded.records)) {
    throw new ExportImportError("Invalid bundle payload: records is not an array");
  }

  const byEntityType = new Map(
    sources.map((source) => [source.entityType, source.adapter] as const),
  );

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const raw of decoded.records) {
    try {
      // shape validation - throws on missing/wrong-typed fields
      assertRepoRecord(raw as RepoRecord);
    } catch (err) {
      errors.push(`record rejected: ${err instanceof Error ? err.message : String(err)}`);
      continue;
    }

    const record = raw as RepoRecord;
    const adapter = byEntityType.get(record.entityType);
    if (!adapter) {
      skipped += 1;
      continue;
    }

    // optional: schemaVersion check
    // (current adapters don't expose expected schemaVersion, so we just trust the source)

    await adapter.save(record);
    imported += 1;
  }

  return { imported, skipped, errors };
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export class ExportImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExportImportError";
  }
}
```

#### c) 兼容性

调用方现在期待 `number` 返回。改为 `ImportResult` 是 breaking change。

**两种方案**：

- **(推荐)** 同时导出 `ImportResult` 类型，让调用方处理新结构；
- 或保留 `number` 返回值（imported count），但额外通过 `console.warn` 报告 skipped/errors。

选 (推荐)。在 `index.ts` 加 export：

```ts
export { exportEntities, importEntities, ExportImportError } from "./ExportService";
export type { ExportBundle, ExportSource, ImportResult } from "./ExportService";
```

#### d) 注释

```ts
/**
 * Import an encrypted export bundle.
 *
 * Each decoded record passes through `assertRepoRecord` before being
 * written to its plugin's adapter. AES-GCM auth tag guarantees
 * cryptographic integrity, but a valid-passphrase payload with a
 * tampered shape (e.g. missing `entityType`) would otherwise corrupt
 * the repo. Records with unknown `entityType` are silently skipped
 * (no matching adapter); records that fail shape validation are
 * collected in `errors` and the caller must surface them.
 */
```

### 2. 增加测试

新增 `packages/plugin-organizer/src/ExportService.test.ts`：

- happy path: export 一个 record + import 回来 → `imported === 1, errors === []`
- shape-rejected: 构造一个缺 `entityType` 的 payload → 重新 encrypt（test 内部用相同 passphrase）→ import → `errors.length === 1, imported === 0`
- unknown entityType: import 一个没有对应 adapter 的 record → `skipped === 1, imported === 0`
- 错误 passphrase → `decryptJson` 抛出（AES-GCM auth tag mismatch）

注意：测试需要 mock 一个 `DataAdapter<T>`（in-memory Map 即可），不需要真 repo。

### 3. 验证

```bash
pnpm --filter @repo/plugin-organizer check-types
pnpm --filter @repo/plugin-organizer test
pnpm --filter desktop build
```

### 4. 提交

```
fix(organizer): validate record shape on ExportService import

Why: cross-vendor review (Track D REVISE) flagged that importEntities
cast decoded records to RepoRecord[] without validation. AES-GCM auth
tag covers crypto integrity, but a tampered-shape payload could
corrupt the repo.
What: each record passes assertRepoRecord before adapter.save; result
is now ImportResult { imported, skipped, errors } instead of number;
new ExportImportError class for surface errors.
Scope: plugin-organizer/src/ExportService.ts + tests + index re-export.
Tests: pnpm --filter @repo/plugin-organizer test.
```

## 红线

- **禁止**修改 `packages/core-data/src/types.ts`（Repository 接口冻结）。如果需要从 `@repo/core-data` 主入口 re-export `assertRepoRecord`，那只是在 index.ts 加一行 export，不是改 types。
- **禁止**修改 `docs/contracts/`、`apps/desktop/src/**`。
- **禁止**改 encrypt 逻辑或 bundle format（v1 锁定）。

## 输出

50 字以内中文摘要，确认 check-types + test + desktop build 全绿，附 commit hash。
