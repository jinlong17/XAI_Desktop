/** Real Chrome with an isolated profile and download directory; fixtures only, no production services. */
import { build } from '../../../node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/lib/main.js';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';

const sourceCommit = process.argv[2];
if (!sourceCommit) throw new Error('fixed revision required');
const root = fileURLToPath(new URL('../../../', import.meta.url));
const output = fileURLToPath(new URL('./', import.meta.url));
const logName = process.env.BOARD_WORKSPACE_NATIVE_LOG ?? 'native-results.log';
const directory = mkdtempSync(join(tmpdir(), 'xai-board-workspace-'));
const snapshot = join(directory, 'source');
const downloads = join(directory, 'downloads');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const records = [];
const record = (name, value) => { records.push({ name, ...value }); console.log(name, JSON.stringify(value)); };
let browser, server, socket;
try {
  mkdirSync(snapshot); mkdirSync(downloads);
  execFileSync('tar', ['-x', '-C', snapshot], { input: execFileSync('git', ['archive', sourceCommit], { cwd: root, maxBuffer: 100 * 1024 * 1024 }) });
  symlinkSync(join(root, 'node_modules'), join(snapshot, 'node_modules'));
  const aliases = new Map();
  for (const name of readdirSync(join(snapshot, 'packages'))) {
    const folder = join(snapshot, 'packages', name);
    try { const pkg = JSON.parse(readFileSync(join(folder, 'package.json'), 'utf8')); aliases.set(pkg.name, { folder, pkg }); symlinkSync(join(root, 'packages', name, 'node_modules'), join(folder, 'node_modules')); } catch {}
  }
  const pinnedPackages = { name: 'pinned-workspace-packages', setup(buildContext) { buildContext.onResolve({ filter: /^@repo\// }, args => { const parts = args.path.split('/'); const entry = aliases.get(parts.slice(0, 2).join('/')); if (!entry) return; const sub = parts.length > 2 ? './' + parts.slice(2).join('/') : '.'; let target = entry.pkg.exports?.[sub]; if (typeof target === 'object') target = target.import ?? target.default; if (typeof target !== 'string') throw new Error('Unresolved pinned export ' + args.path); return { path: join(entry.folder, target) }; }); } };
  const built = await build({ stdin: { contents: readFileSync(join(output, 'native.tsx'), 'utf8'), resolveDir: snapshot, loader: 'tsx' }, plugins: [pinnedPackages], loader: { '.png': 'dataurl', '.svg': 'dataurl' }, nodePaths: [join(root, 'apps/web/node_modules')], bundle: true, format: 'esm', platform: 'browser', write: false, outfile: join(directory, 'bundle.js'), define: { 'import.meta.env': '{}' } });
  const js = built.outputFiles.find(file => file.path.endsWith('.js')).text;
  const css = built.outputFiles.find(file => file.path.endsWith('.css')).text;
  server = createServer((req, res) => { res.setHeader('Content-Type', 'text/html'); res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>' + css + '</style><div id="app"></div><script type="module">' + js + '</script>'); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--disable-gpu', '--no-first-run', '--disable-background-networking', '--remote-debugging-port=0', '--user-data-dir=' + join(directory, 'profile'), 'about:blank'], { stdio: 'ignore' });
  let port;
  for (let i = 0; i < 100; i++) { try { port = Number(readFileSync(join(directory, 'profile', 'DevToolsActivePort'), 'utf8').split('\n')[0]); break; } catch { await delay(50); } }
  assert(port);
  const targets = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
  socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  let id = 0; const pending = new Map();
  socket.addEventListener('message', event => { const message = JSON.parse(event.data); if (message.id) { const request = pending.get(message.id); pending.delete(message.id); message.error ? request.reject(new Error(JSON.stringify(message.error))) : request.resolve(message.result); } });
  const cdp = (method, params = {}) => new Promise((resolve, reject) => { const requestId = ++id; pending.set(requestId, { resolve, reject }); socket.send(JSON.stringify({ id: requestId, method, params })); });
  const ev = async expression => { const result = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails)); return result.result.value; };
  await cdp('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads });
  await cdp('Page.navigate', { url: 'http://127.0.0.1:' + server.address().port });
  for (let i = 0; i < 100; i++) { if (await ev("!!document.querySelector('[data-testid=bv-switch]')")) break; await delay(50); }
  const click = async selector => { await ev(`document.querySelector(${JSON.stringify(selector)}).click()`); await delay(100); };
  const clickText = async label => { await ev(`(()=>{const button=[...document.querySelectorAll('button')].find(item=>item.textContent.trim()===${JSON.stringify(label)});if(!button)throw Error('missing '+${JSON.stringify(label)});button.click()})()`); await delay(100); };
  const input = async (selector, value, enter = false) => { await ev(`(()=>{const element=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(element,${JSON.stringify(value)});element.dispatchEvent(new Event('input',{bubbles:true}));${enter ? "element.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));" : ''}})()`); await delay(100); };
  const raw = key => ev(`localStorage.getItem(${JSON.stringify(key)})`);
  const download = async () => { let filename; for (let i = 0; i < 100; i++) { filename = readdirSync(downloads).find(name => name.endsWith('.json')); if (filename) break; await delay(50); } assert(filename); assert.equal(readdirSync(downloads).length, 1); const payload = JSON.parse(readFileSync(join(downloads, filename), 'utf8')); rmSync(join(downloads, filename)); return payload; };

  record('baseline', { commit: sourceCommit, chromePid: browser.pid });
  await click('[data-testid=bv-switch]'); await click('[data-testid=bs-new-workspace]'); await input('[data-testid=bs-ws-new-name]', 'First workspace');
  const original = await raw(await ev('verify.workspaceKey')); await ev('verify.denyWorkspace()'); await click('[data-testid=bs-ws-new-add]');
  const initial = { alert: await ev("!!document.querySelector('[role=alert]')"), retained: await ev("document.querySelector('[data-testid=bs-ws-new-name]').value"), bytesUnchanged: await raw(await ev('verify.workspaceKey')) === original };
  assert(initial.alert && initial.retained === 'First workspace' && initial.bytesUnchanged);
  await input('[data-testid=bs-ws-new-name]', 'Latest workspace'); await clickText('Retry workspace change');
  const proposals = await ev('verify.proposals()'); const candidate = JSON.parse(proposals[0]).at(-1); assert.equal(candidate.id, JSON.parse(proposals[1]).at(-1).id); assert.equal(JSON.parse(proposals[1]).at(-1).name.en, 'Latest workspace');
  await clickText('Export workspace draft'); const createDraft = await download(); assert.equal(createDraft.action.createdId, candidate.id); assert.equal(createDraft.action.name, 'Latest workspace'); assert.equal(createDraft.storedWorkspaces, original);
  await ev('verify.restore()'); await clickText('Retry workspace change'); const savedCreate = JSON.parse(await raw(await ev('verify.workspaceKey'))); assert.equal(savedCreate.filter(workspace => workspace.name.en === 'Latest workspace').length, 1); record('actual-create-latest-download-stable-id-retry', { pass: true });

  await click('[data-testid=bs-ws-rename-empty]'); await input('[data-testid=bs-ws-rename-input-empty]', 'First rename'); await ev('verify.denyWorkspace()'); await input('[data-testid=bs-ws-rename-input-empty]', 'First rename', true);
  await input('[data-testid=bs-ws-rename-input-empty]', 'Latest rename'); await clickText('Export workspace draft'); const renameDraft = await download(); assert.equal(renameDraft.action.id, 'empty'); assert.equal(renameDraft.action.name, 'Latest rename'); assert.equal(renameDraft.storedWorkspaces, await raw(await ev('verify.workspaceKey')));
  await ev('verify.restore()'); await clickText('Retry workspace change'); assert.equal(JSON.parse(await raw(await ev('verify.workspaceKey'))).find(workspace => workspace.id === 'empty').name.en, 'Latest rename'); record('actual-rename-latest-download-retry', { pass: true });

  await clickText('×'); await click('[data-testid=bv-switch]'); await ev(`(()=>{const key=${JSON.stringify(await ev('verify.activeKey'))};localStorage.removeItem(key);window.dispatchEvent(new StorageEvent('storage',{key,newValue:null,storageArea:localStorage}))})()`); await delay(100); await click('[data-testid=bs-card-b-pm]'); assert.equal(await raw(await ev('verify.activeKey')), 'b-pm');
  await click('[data-testid=bv-switch]'); await ev('verify.denyActive()'); await click('[data-testid=bs-card-b-default]'); assert(await ev("!!document.querySelector('[role=alert]')")); await ev('verify.restore()'); await clickText('Retry workspace change'); assert.equal(await raw(await ev('verify.activeKey')), 'b-default'); record('normal-and-failed-pick-retry', { pass: true });

  await click('[data-testid=bv-switch]'); await click('[data-testid=bs-new-workspace]'); await input('[data-testid=bs-ws-new-name]', 'A-only'); await ev('verify.denyWorkspace()'); await click('[data-testid=bs-ws-new-add]'); await ev('verify.restore()'); const aKey = await ev('verify.workspaceKey'), aBytes = await raw(aKey); const b = await ev('verify.switchToB()'); const bBytes = await raw(b.workspaceKey); await clickText('Retry workspace change'); await clickText('Export workspace draft'); assert.equal(await raw(aKey), aBytes); assert.equal(await raw(b.workspaceKey), bBytes); assert.equal(readdirSync(downloads).length, 0); assert((await ev('document.body.innerText')).includes('Export failed')); record('old-account-retry-export-denied', { pass: true });
  record('PASS', { scope: 'Board workspace CRUD and ordinary board selection', checks: 4 });
} finally {
  writeFileSync(join(output, logName), records.map(record => JSON.stringify(record)).join('\n') + '\n');
  socket?.close(); server?.closeAllConnections(); server?.close();
  if (browser?.exitCode === null) browser.kill('SIGTERM');
  await delay(500); if (browser?.exitCode === null) browser.kill('SIGKILL');
  rmSync(directory, { recursive: true, force: true, maxRetries: 8, retryDelay: 150 });
}
