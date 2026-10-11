/** Called only against a streamed archive. No product alias may resolve through dependency checkout. */
import { readFileSync, readdirSync, realpathSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
export function archiveAliases(snapshot, record) {
  const root = realpathSync(snapshot), packages = new Map();
  for (const dir of readdirSync(join(root, 'packages'))) {
    let pkg; try { pkg = JSON.parse(readFileSync(join(root, 'packages', dir, 'package.json'))); } catch { continue; }
    if (pkg.name?.startsWith('@repo/')) {
      if (packages.has(pkg.name)) throw Error('ALIAS_DUPLICATE');
      packages.set(pkg.name, { pkg, dir: join(root, 'packages', dir) });
    }
  }
  const resolvePackage = name => {
    const parts = name.split('/'), entry = packages.get(parts.slice(0,2).join('/'));
    if (!entry) throw Error('ALIAS_UNKNOWN '+name);
    const subpath = parts.length === 2 ? '.' : './'+parts.slice(2).join('/');
    let target = entry.pkg.exports?.[subpath];
    if (typeof target === 'object') target = target.import ?? target.default;
    if (typeof target !== 'string') throw Error('ALIAS_EXPORT '+name);
    const path = realpathSync(resolve(entry.dir, target));
    if (!path.startsWith(root+sep) || path.includes(sep+'node_modules'+sep)) throw Error('ALIAS_DRIFT '+name);
    record('archive-alias', { name, path, subpath }); return path;
  };
  return {
    root, resolvePackage,
    esbuild: { name: 't06-archive-only', setup(build) { build.onResolve({ filter: /^@repo\// }, args => ({ path: resolvePackage(args.path) })); } },
    vite: { name: 't06-archive-only', enforce: 'pre', resolveId(name) { if (name.startsWith('@repo/')) return resolvePackage(name); } },
  };
}
export function hostConfig(snapshot, plugin) {
  return { root: join(snapshot, 'apps/web'), configFile: false, envFile: false, plugins: [plugin], server: { host: '127.0.0.1', port: 0, strictPort: false, fs: { allow: [snapshot] } },
    define: { 'import.meta.env.VITE_WEB_AUTH_MODE': '"mock-authenticated"' }, optimizeDeps: { noDiscovery: true } };
}
