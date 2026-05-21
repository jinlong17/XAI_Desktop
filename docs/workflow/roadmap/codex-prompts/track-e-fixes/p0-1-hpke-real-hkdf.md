Goal:
Track E P0-1 修复 — packages/hpke-per-device-wrap/ 的 deriveAesKey 不是真 HKDF。

Branch (你必须在此分支): codex/track-e-sync-hardening

问题（来自 Claude Code 跨厂商 review）:
packages/hpke-per-device-wrap/src/index.ts 中的 deriveAesKey 写的是：
  SHA256("xai.hpke.wrap.v1" ‖ sharedSecret ‖ info)
这是自定义 KDF，不是 RFC 5869 HKDF。但套件名声称 X25519-HKDF-SHA256-AES256GCM，
存在严重密码学错误标注。

修复要求（务必同时满足）:
1. 把 deriveAesKey 改成真正的 HKDF-SHA256。推荐用 node:crypto 的 hkdfSync：
   const okm = crypto.hkdfSync('sha256', sharedSecret, salt, info, 32);
   - salt 可固定为 new TextEncoder().encode('xai.hpke.wrap.v1.salt')（或 32 字节零，按 RFC 5869）
   - info 沿用调用者传入的 info
   - 输出 32 字节 AES-256 key
2. 保持 suite 名 'X25519-HKDF-SHA256-AES256GCM' 不变（现在名实相符）。
3. 现有 sealDekForDevice/openDekForDevice 的对外签名不变。
4. 更新 tests/hpke-per-device-wrap.test.ts：
   - 现有 2 个测试继续通过（seal/open 往返、info==aad 拒绝）
   - 新增 1 个 test vector 测试：固定 sharedSecret（用确定的 X25519 keypair）+ 固定 iv + 固定 dek + 固定 info + 固定 aad，验证 ciphertext/tag 是 hex 已知值（计算出来后写入测试）
5. 在 packages/hpke-per-device-wrap/docs/dev_log.md 末尾追加一条 P0 fix 记录，引用本 prompt。

验证命令（必须全部通过）:
- pnpm --filter @repo/hpke-per-device-wrap test
- pnpm --filter @repo/hpke-per-device-wrap check-types

完成后:
- 用 git add 仅 staging packages/hpke-per-device-wrap/ 下的改动
- commit message: "fix(hpke): replace ad-hoc SHA256 KDF with RFC 5869 HKDF-SHA256"
  body 包含 Why（review 指出 suite 名与实现不符）/ What / Risk / Tests
- 不 push

禁止修改:
- 任何 packages/hpke-per-device-wrap/ 之外的文件
- 任何文档（除上述 dev_log.md 之外）
