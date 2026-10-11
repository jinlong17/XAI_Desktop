// CP-APPRAIL-01 batch 64 (contract r1 §13 last row, §15 E23) COPY of ../../../web-smart-lists-recovery-astra/verify-fixed.mjs
// (SHA-256 f79c2dfff6778ce17d8093f5e07c51425ce319115c381f90329ea813c2608246, frozen, not modified). The frozen runner reads `git archive` into a 100 MiB buffer; the archive is
// 74,393,600 bytes at f359be6 (where its last accepted logs ran) but 125,992,960 at 419e56d and 148,408,320 at f9eb4b1,
// so it aborts with `spawnSync git ENOBUFS` before any test runs, at both revisions (refusal transcript
// ../../frozen-host-suite-refusals-apprail-final-v1.log). Exactly two changes, both marked "E23 copy": (1) the archive
// buffer is 1 GiB; (2) `root` climbs two more levels because this copy sits two directories deeper. The test files beside
// it are byte-identical copies of the frozen ones and are staged at the frozen runner's own archive path, exactly as
// before. Modes, config, aliases, Vitest binary, log format and exit handling are the frozen runner's code.
/** Reviewer runner: product/tests from immutable git archive; independent assertions from this directory. */
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, symlinkSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
const root = fileURLToPath(new URL('../../../../../', import.meta.url)); // E23 copy, change 2: two levels deeper
const evidence = fileURLToPath(new URL('./', import.meta.url));
const revision = process.argv[2];
if (!revision) throw Error('Pinned revision required');
const commit = execFileSync('git',['rev-parse',revision],{cwd:root,encoding:'utf8'}).trim();
const dir = mkdtempSync(join(tmpdir(), 'xai-detail-review-'));
try {
 execFileSync('tar', ['-x', '-C', dir], { input: execFileSync('git', ['archive', commit], { cwd: root, maxBuffer: 1024 * 1024 * 1024 /* E23 copy, change 1: was 100 * 1024 * 1024 */ }) });
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
 aliases.push({find:'react-router',replacement:join(root,'apps/web/node_modules/react-router')});
 aliases.push({find:'react',replacement:join(root,'packages/plugin-web-board-workspaces/node_modules/react')},{find:'@testing-library/react',replacement:join(root,'packages/plugin-web-board-workspaces/node_modules/@testing-library/react')});
 const owned = join(dir, 'docs/reviews/web-smart-lists-recovery-astra'); mkdirSync(owned, {recursive:true});
 for(const file of ['export.test.tsx','host.test.tsx','app.test.tsx','host-entry.test.tsx','host-wrapper.test.tsx']) copyFileSync(join(evidence,file),join(owned,file));

 symlinkSync(join(root,'apps/web/node_modules'),join(dir,'apps/web/node_modules'));
 for (const [name, include] of [
  ['export', ['docs/reviews/web-smart-lists-recovery-astra/export.test.tsx']],
 ['host',['docs/reviews/web-smart-lists-recovery-astra/host.test.tsx']],
 ['host-entry',['docs/reviews/web-smart-lists-recovery-astra/host-entry.test.tsx']],
 ['host-wrapper',['docs/reviews/web-smart-lists-recovery-astra/host-wrapper.test.tsx']],
 ['app',['docs/reviews/web-smart-lists-recovery-astra/app.test.tsx']],
 ['original39',['docs/reviews/web-d2-smart-lists-astra/contracts.test.tsx']],

 ['original-parent', ['docs/reviews/web-d2-smart-lists-independent/contracts.test.tsx']],
 ['package', ['packages/plugin-web-settings-rest/src/__tests__/**/*.{test,spec}.{ts,tsx}']],
 ]) {
  if (process.argv[3] && name !== process.argv[3]) continue;
  const config = join(dir, 'astra.config.mjs');
  writeFileSync(config, 'export default '+JSON.stringify({root:dir,resolve:{alias:aliases},esbuild:{jsx:'automatic'},test:{globals:true,environment:'jsdom',setupFiles:name==='package'?[join(dir,'packages/plugin-web-settings-rest/vitest.setup.ts')]:[],include}}));
  const result = spawnSync(join(root,'packages/plugin-web-board-workspaces/node_modules/.bin/vitest'), ['run','--config',config], {cwd:dir,encoding:'utf8',maxBuffer:20*1024*1024});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status ?? 1;
  const output=join(evidence,name+(process.argv[4] ? '-'+process.argv[4] : '')+'-'+revision.replace(/[^a-zA-Z0-9_-]/g,'_')+'.log');
  if(existsSync(output)) throw Error('Evidence exists; use a fresh suffix');
  writeFileSync(output, `revision=${revision} fixed_commit=${commit}\nexit=${result.status}\n${result.stdout}\n${result.stderr}`.trimEnd() + '\n');
  console.log(name, 'exit='+result.status, result.stdout.slice(-1600));
 }
} finally { rmSync(dir, {recursive:true,force:true}); }
