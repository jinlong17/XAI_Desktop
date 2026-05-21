Goal:
Track E P1-1 修复 — packages/plugin-account/src/beta-ops.ts 的 exportEncryptedAccountData 不是加密自包含。

Branch (你必须在此分支): codex/track-e-sync-hardening

问题（来自 Claude Code 跨厂商 review）:
当前 exportEncryptedAccountData 只是 JSON.stringify({schema, exportedAtMs:0, records})，
- encryptedPayload 字节是加密的（OK）
- 但 export 包装层没有签名/MAC/envelope encryption
- exportedAtMs: 0 硬编码

不满足"加密自包含"要求。

修复要求（最小可行方案）:

1. 给 exportEncryptedAccountData 加可选的 integrity 参数：
   interface ExportOptions {
     nowMs?: () => number;
     hmacKey?: Uint8Array;  // 32 字节，从 mnemonic 派生（调用方负责）
   }
   - 如果传 hmacKey: 用 HMAC-SHA256 计算整个 records 数组（canonical JSON）的 MAC
     输出新增字段 integrityMac: hex string
   - 如果传 nowMs: exportedAtMs 使用 nowMs() 而不是 0
   - 默认 nowMs = Date.now

2. 输出 schema 升级为 v2，结构：
   {
     "schema": "xai.encrypted-export.v2",
     "exportedAtMs": <实际时间戳>,
     "integrityAlgo": "HMAC-SHA256" | null,
     "integrityMac": "<hex>" | null,
     "records": [...]
   }
   - 当未传 hmacKey 时 integrityAlgo/integrityMac 设为 null，并在 export 顶层写个 console.warn（"export is not integrity-protected"）

3. 新增 importEncryptedAccountData(exportJson: string, options?: { hmacKey?: Uint8Array }):
   - 解析 JSON
   - 如果 integrityMac 非 null：验证 HMAC，失败抛 E3038
   - 如果 hmacKey 传了但 export 是 v2/null：抛 E3038 "import requires integrity but export has none"
   - 如果 schema 不是 v1/v2：抛 E3005
   - v1 (legacy) 直接返回 records，不验签
   - v2 验签通过后返回 records

4. 新增 tests/beta-ops.test.ts 用例（加在现有 3 个测试之后）:
   - export+import 往返（有 hmacKey）通过
   - export+import 往返（无 hmacKey）通过 + 触发 console.warn
   - 篡改 records 后导入失败 E3038
   - import v1 export（构造一个手写的 v1 JSON）成功且无验签

类型导出:
- 在 packages/plugin-account/src/index.ts 已 re-export 的话同步导出 importEncryptedAccountData 和新类型

验证命令（必须全部通过）:
- pnpm --filter @repo/plugin-account test
- pnpm --filter @repo/plugin-account check-types

完成后:
- git add 仅 packages/plugin-account/src/beta-ops.ts packages/plugin-account/src/index.ts packages/plugin-account/tests/beta-ops.test.ts
- commit message: "fix(beta-ops): add HMAC integrity envelope and import path to encrypted export"
  body 包含 Why / What / Risk（v1 兼容） / Tests
- 不 push

禁止修改:
- 其他包
- packages/plugin-account/src/ 下与 beta-ops 无关的文件（即不要碰 rekey.ts / sync-engine.ts / 等）
