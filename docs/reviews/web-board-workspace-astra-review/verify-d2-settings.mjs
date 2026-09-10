/** Reviewer runner: product/tests from immutable git archive; independent assertions from this directory. */
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, symlinkSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const evidence = fileURLToPath(new URL('./', import.meta.url));
const revision = process.argv[2];
if (!revision) throw Error('Pinned revision required');
const dir = mkdtempSync(join(tmpdir(), 'xai-astra-tasks-d1-'));
try {
 execFileSync('tar', ['-x', '-C', dir], { input: execFileSync('git', ['archive', revision], { cwd: root, maxBuffer: 100 * 1024 * 1024 }) });
 symlinkSync(join(root, 'node_modules'), join(dir, 'node_modules'));
 const aliases = [];
 for (const name of readdirSync(join(dir, 'packages'))) {
  const folder = join(dir, 'packages', name);
  let pkg; try { pkg = JSON.parse(readFileSync(join(folder, 'package.json'), 'utf8')); } catch { continue; }
  symlinkSync(join(root, 'packages', name, 'node_modules'), join(folder, 'node_modules'));
  for (const [key, value] of Object.entries(pkg.exports ?? {})) {
   const target = typeof value === 'string' ? value : value.import ?? value.default;
   if (typeof target === 'string' && !key.includes('*')) aliases.push({ find: pkg.name + (key === '.' ? '' : key.slice(1)), replacement: join(folder, target) });
  }
 }
 aliases.sort((a, b) => b.find.length - a.find.length);
 aliases.push({find:'react-dom',replacement:join(root,'packages/plugin-web-storage/node_modules/react-dom')},{find:'react',replacement:join(root,'packages/plugin-web-board-workspaces/node_modules/react')},{find:'@testing-library/react',replacement:join(root,'packages/plugin-web-board-workspaces/node_modules/@testing-library/react')});
 const owned = join(dir, 'docs/reviews/web-board-workspace-astra-review'); mkdirSync(owned, {recursive:true});
 for (const file of ['named-lock-fixture.ts','d2-settings-orchestrator.test.tsx','d2-settings-slice.test.ts','d2-settings-entry-snapshot.test.ts']) copyFileSync(join(evidence,file),join(owned,file));
 for (const [name, include] of [['d2-settings-orchestrator', ['docs/reviews/web-board-workspace-astra-review/d2-settings-orchestrator.test.tsx']], ['d2-settings-slice', ['docs/reviews/web-board-workspace-astra-review/d2-settings-slice.test.ts']], ['d2-settings-entry-snapshot', ['docs/reviews/web-board-workspace-astra-review/d2-settings-entry-snapshot.test.ts']], ['d2-settings-package', ['src/__tests__/**/*.{test,spec}.{ts,tsx}']]]) {
  if (process.argv[3] && name !== process.argv[3]) continue;
  const config = join(dir, 'astra.config.mjs');
  const suiteRoot = name === 'd2-settings-package' ? join(dir,'packages/plugin-web-settings-rest') : dir;
  const suiteInclude = name === 'd2-settings-package' ? ['src/__tests__/**/*.{test,spec}.{ts,tsx}'] : include;
  writeFileSync(config, 'export default '+JSON.stringify({root:suiteRoot,resolve:{alias:aliases},esbuild:{jsx:'automatic'},test:{globals:name==='d2-settings-package',clearMocks:name!=='d2-settings-package',restoreMocks:name!=='d2-settings-package',environment:'jsdom',testTimeout:20000,setupFiles:name==='d2-settings-package'?[join(dir,'packages/plugin-web-settings-rest/vitest.setup.ts')]:[],include:suiteInclude}}));
  const result = spawnSync(join(root,'packages/plugin-web-board-workspaces/node_modules/.bin/vitest'), ['run','--config',config], {cwd:suiteRoot,encoding:'utf8',maxBuffer:20*1024*1024});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status ?? 1;
  writeFileSync(join(evidence,name+(process.argv[4] ? '-'+process.argv[4] : '')+'-'+revision+'.log'), `revision=${revision}\ntest-fixture=review-owned only; package run unmodified\nexit=${result.status}\n${result.stdout}\n${result.stderr}`.trimEnd() + '\n');
  console.log(name, 'exit='+result.status, result.stdout.slice(-1600));
 }
} finally { rmSync(dir, {recursive:true,force:true}); }
