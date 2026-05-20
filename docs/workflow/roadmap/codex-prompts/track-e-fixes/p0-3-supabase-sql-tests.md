Goal:
Track E P0-3 修复 — apps/web/supabase/tests/ 下 5 个 SQL 集成测试被替换为纯 JS mock，回归严重。

Branch (你必须在此分支): codex/track-e-sync-hardening

问题（来自 Claude Code 跨厂商 review）:
apps/web/supabase/tests/{audit-log,nonce-lease,rekey,rls-fuzz-property,rls-policies}.test.ts
原来用 Docker Postgres + docker exec psql 跑真实迁移和 RLS（每文件 195–361 行）。
新版本被改成纯 JS in-memory mock（每文件 45–80 行），SQL 迁移只剩 readFileSync + 字符串 grep。
真实 SQL/RLS/RPC 行为不再被任何测试执行。

修复策略（务必采用"env flag 双层"方案）:

对每个 *.test.ts 文件做以下改造：

1. 保留现有 JS mock 测试作为"smoke"层（描述里加 "[smoke]" 前缀），永远跑
2. 恢复原来的 Docker-Postgres 集成测试作为"integration"层，包在
   describe.skipIf(!process.env.SUPABASE_INTEGRATION_TESTS) 里
3. 集成层的代码可以从 git history 里恢复（git show main:apps/web/supabase/tests/audit-log.test.ts 等）
4. 集成测试必须包含:
   - beforeAll: 起 Docker postgres container（名字带 process.pid 避免冲突）+ 顺序 apply 所有 migration
   - afterAll: 停止并删除 container
   - 真实 psql 执行 SELECT/INSERT 验证 RLS、RPC、hash chain 行为
5. 在 apps/web/package.json 增加（如果还没有）:
   "test:nonce:integration": "SUPABASE_INTEGRATION_TESTS=1 vitest run supabase/tests/nonce-lease.test.ts"
   类似的 :integration 变体给另外 4 个文件
6. 在 apps/web/supabase/tests/README.md（不存在就创建）写明：
   - smoke 层默认跑，验证 JS mock + SQL 文件存在性
   - integration 层需要本地 Docker，用 pnpm --filter web test:<name>:integration 触发
   - CI 默认只跑 smoke，integration 跑在 G9 nightly job

需要恢复的 5 个文件:
- apps/web/supabase/tests/audit-log.test.ts
- apps/web/supabase/tests/nonce-lease.test.ts
- apps/web/supabase/tests/rekey.test.ts
- apps/web/supabase/tests/rls-fuzz-property.test.ts
- apps/web/supabase/tests/rls-policies.test.ts

获取历史的命令:
git show main:apps/web/supabase/tests/audit-log.test.ts > /tmp/audit-log.old.ts
git show main:apps/web/supabase/tests/nonce-lease.test.ts > /tmp/nonce-lease.old.ts
git show main:apps/web/supabase/tests/rekey.test.ts > /tmp/rekey.old.ts
git show main:apps/web/supabase/tests/rls-fuzz-property.test.ts > /tmp/rls-fuzz.old.ts
git show main:apps/web/supabase/tests/rls-policies.test.ts > /tmp/rls-policies.old.ts

合成方法（每个文件）:
1. 读 /tmp/<name>.old.ts 拿到原 Docker postgres beforeAll/afterAll + docker/psql helpers + 真实 SQL 断言
2. 把当前文件里的 JS mock describe block 改名加 [smoke] 前缀，全部保留
3. 在同一文件追加一个新的 describe.skipIf(...) block，里面是 Docker 集成层
4. 两层共用顶部 imports，但 Docker helpers 只在集成层用

验证命令（必须全部通过 — smoke 层默认跑）:
- pnpm --filter web test:nonce
- pnpm --filter web test:rekey
- pnpm --filter web test:audit
- pnpm --filter web test:rls
- pnpm --filter web check-types

不要尝试启动 Docker 容器去跑 integration 层（本地无 Docker 也没关系，skipIf 会跳过）。

完成后:
- git add apps/web/supabase/tests/*.test.ts apps/web/supabase/tests/README.md apps/web/package.json
- commit message: "fix(supabase-tests): restore Docker-Postgres integration layer behind env flag"
  body 包含 Why / What / Risk（CI 默认仍跑 smoke） / Tests
- 不 push

禁止修改:
- apps/web/supabase/migrations/ 下的任何 SQL（SQL 没问题，只是没被测）
- apps/web/ 下与 sync test 无关的其他代码
- packages/ 下任何文件
