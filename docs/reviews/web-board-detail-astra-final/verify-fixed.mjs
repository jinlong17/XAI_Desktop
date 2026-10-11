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
const dir = mkdtempSync(join(tmpdir(), 'xai-detail-review-'));
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
 aliases.push({find:'react',replacement:join(root,'packages/plugin-web-board-workspaces/node_modules/react')},{find:'@testing-library/react',replacement:join(root,'packages/plugin-web-board-workspaces/node_modules/@testing-library/react')});
 const owned = join(dir, 'docs/reviews/web-board-detail-astra-final'); mkdirSync(owned, {recursive:true});
 copyFileSync(join(evidence,'detail-contract.test.tsx'),join(owned,'detail-contract.test.tsx'));
 for (const [name, include] of [
  ['independent', ['docs/reviews/web-board-detail-astra-final/detail-contract.test.tsx']],
  ['author-tests-rerun', ['packages/plugin-web-board-workspaces/src/__tests__/BoardDetailSaveRecovery.test.tsx','packages/plugin-web-board-workspaces/src/__tests__/responsiveStyles.test.ts']],
 ]) {
  if (process.argv[3] && name !== process.argv[3]) continue;
  const config = join(dir, 'astra.config.mjs');
  writeFileSync(config, 'export default '+JSON.stringify({root:dir,resolve:{alias:aliases},esbuild:{jsx:'automatic'},test:{globals:true,environment:'jsdom',setupFiles:[join(dir,'packages/plugin-web-board-workspaces/vitest.setup.ts')],include}}));
  const result = spawnSync(join(root,'packages/plugin-web-board-workspaces/node_modules/.bin/vitest'), ['run','--config',config], {cwd:dir,encoding:'utf8',maxBuffer:20*1024*1024});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status ?? 1;
  writeFileSync(join(evidence,name+(process.argv[4] ? '-'+process.argv[4] : '')+'-'+revision.replace(/[^a-zA-Z0-9_-]/g,'_')+'.log'), `revision=${revision}\nexit=${result.status}\n${result.stdout}\n${result.stderr}`.trimEnd() + '\n');
  console.log(name, 'exit='+result.status, result.stdout.slice(-1600));
 }
} finally { rmSync(dir, {recursive:true,force:true}); }
