# XAI_Desktop Contracts

本目录记录跨模块工程契约。凡是影响多个 plugin、Host、Rust command、Web host 或 Sync 的接口,都必须先在这里明确。

## 文件

| 文件 | 范围 |
|---|---|
| `events-v0.md` | `@repo/core` EventMap 和跨窗口事件规则 |
| `data-repository-v0.md` | `@repo/core-data` Repository / migration / driver contract |
| `account-cloud-sync-architecture.md` | Account Cloud Sync positioning, topology, module boundaries, and read-model contract |
| `account-sync-entity-scope-matrix.md` | Account Cloud Sync entity classes, surface access boundaries, and local-first exclusions |
| `account-device-identity-contract.md` | Shared account, device, session, admin-claim, and lifecycle contract for Account Cloud Sync surfaces |
| `tauri-commands-v0.md` | Tauri command、window label、capability allowlist contract |
| `plugin-organizer-public-api-v0.md` | Host 与 `@repo/plugin-organizer` 的 public import / Grid content contract |

## 变更规则

- 契约变更必须带版本说明。
- Breaking change 必须同步 execution pack 和 backlog。
- Plugin 只能依赖 public contract,不能读取其他 plugin internal。
- Web host 不实现 Tauri-only contract,必须有 browser-safe stub 或降级说明。
