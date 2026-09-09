/** Fixed-revision native Chrome verification. Isolated source, browser profile, and synthetic local accounts. */
import { build } from '../../../node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/lib/main.js';
import { execFileSync, spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const requestedRef = process.argv[2];
if (!requestedRef) throw new Error('Usage: node verify-native.mjs <fixed-git-revision>');
const revision = execFileSync('git', ['rev-parse', `${requestedRef}^{commit}`], { cwd: root, encoding: 'utf8' }).trim();
const temporary = mkdtempSync(join(tmpdir(), 'xai-tasks-ui-reopen-'));
const snapshot = join(temporary, 'source');
mkdirSync(snapshot);
execFileSync('tar', ['-x', '-C', snapshot], { input: execFileSync('git', ['archive', revision], { cwd: root, maxBuffer: 120 * 1024 * 1024 }) });
symlinkSync(join(root, 'node_modules'), join(snapshot, 'node_modules'));

const aliases = new Map();
for (const name of readdirSync(join(snapshot, 'packages'))) {
  const folder = join(snapshot, 'packages', name);
  try {
    const pkg = JSON.parse(readFileSync(join(folder, 'package.json'), 'utf8'));
    aliases.set(pkg.name, { folder, pkg });
    symlinkSync(join(root, 'packages', name, 'node_modules'), join(folder, 'node_modules'));
  } catch {}
}

const pinnedPackages = {
  name: 'pinned-workspace-packages',
  setup(context) {
    context.onResolve({ filter: /^@repo\// }, args => {
      const parts = args.path.split('/');
      const entry = aliases.get(parts.slice(0, 2).join('/'));
      if (!entry) return;
      const subpath = parts.length > 2 ? `./${parts.slice(2).join('/')}` : '.';
      let target = entry.pkg.exports?.[subpath];
      if (typeof target === 'object') target = target.import ?? target.default;
      if (typeof target !== 'string') throw new Error(`Unresolved pinned export ${args.path}`);
      return { path: join(entry.folder, target) };
    });
  },
};

let browser;
let server;
let timer;
let checkpoint = null;
try {
  const probe = readFileSync(new URL('./native-probe.ts', import.meta.url), 'utf8');
  const bundle = await build({
    stdin: { contents: probe, resolveDir: snapshot, loader: 'tsx' },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    sourcemap: 'inline',
    plugins: [pinnedPackages],
    loader: { '.css': 'empty', '.svg': 'dataurl', '.png': 'dataurl' },
    define: { 'import.meta.env': '{}', 'process.env.NODE_ENV': '"development"' },
  });
  let resolveResult;
  let rejectResult;
  const result = new Promise((resolve, reject) => {
    resolveResult = resolve;
    rejectResult = reject;
    timer = setTimeout(() => reject(new Error('Native Chrome receipt verification timed out after 90s')), 90_000);
  });
  server = createServer((request, response) => {
    if (request.url === '/result') {
      let body = '';
      request.on('data', chunk => { body += chunk; });
      request.on('end', () => {
        response.end('ok');
        try { resolveResult(JSON.parse(body)); } catch (error) { rejectResult(error); }
      });
      return;
    }
    response.setHeader('Content-Type', 'text/html');
    response.end(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><main id="app"></main><script>window.__checkpoint=${JSON.stringify(checkpoint).replaceAll("<", "\\u003c")};</script><script type="module">${bundle.outputFiles[0].text}</script>`);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  browser = spawn(process.env.CHROME_BINARY || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new', '--window-size=1280,900', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    '--disable-background-networking', `--user-data-dir=${join(temporary, 'profile')}`, url+'/?phase=initial',
  ], { stdio: 'ignore' });
  browser.on('error', rejectResult);
  let outcome = await result;
  if (outcome.pass) {
    const firstPid = browser.pid;
    const before = outcome;
    checkpoint = outcome.checkpoint;
    let forced = false;
    await new Promise(resolve => {
      browser.once('exit', resolve);
      browser.kill('SIGTERM');
      setTimeout(() => { if (browser.exitCode === null && browser.signalCode === null) { forced = true; browser.kill('SIGKILL'); } }, 3000).unref();
    });
    if (forced) throw new Error('Chrome needed forced termination; refuse normal-close claim');
    clearTimeout(timer);
    const resumed = new Promise((resolve,reject) => {
      resolveResult = resolve; rejectResult = reject;
      timer = setTimeout(() => reject(new Error('Reopened browser result timed out')), 90000);
    });
    browser = spawn(process.env.CHROME_BINARY || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
      '--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
      `--user-data-dir=${join(temporary,'profile')}`, url+'/?phase=reopen',
    ], {stdio:'ignore'});
    browser.on('error',rejectResult);
    const after = await resumed;
    outcome = {pass:before.pass && after.pass,firstPid,reopenedPid:browser.pid,termination:'SIGTERM with observed process exit; no SIGKILL fallback',before,after};
  }
  const report = { requestedRef, revision, source: 'git archive with pinned @repo package imports', profile: 'isolated temporary Chrome profile', ...outcome };
  writeFileSync(new URL(`./native-${revision.slice(0,7)}.json`, import.meta.url), JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify(report, null, 2));
  if (!outcome.pass) process.exitCode = 1;
} finally {
  clearTimeout(timer);
  server?.closeAllConnections();
  server?.close();
  if (browser && browser.exitCode === null) {
    await new Promise(resolve => {
      browser.once('exit', resolve);
      browser.kill('SIGTERM');
      setTimeout(() => { if (browser.exitCode === null) browser.kill('SIGKILL'); }, 1500).unref();
    });
  }
  rmSync(temporary, { recursive: true, force: true, maxRetries: 8, retryDelay: 150 });
}
