/**
 * Diagnostic (CP-APPEARANCE-01 batch 51; not gate evidence; receipt §5.3): why the E16/E17 F1 logs at 419e56d record a
 * different JS bundle hash from the 24073b5 logs although the product JavaScript is identical (verify-delta.mjs).
 * Each F1 runner bundles its fixture with esbuild from stdin, absWorkingDir = <tmp>/<mkdtemp>/source, so every bundled
 * third-party module carries a `// ../../…` comment whose length depends on how deep that snapshot directory is.
 * This script rebuilds the five F1 fixture bundles with the runners' exact esbuild options (stdin fixture, @repo pin,
 * nodePaths, loaders, define, outfile beside the snapshot) at both revisions and at snapshot depths 8–12, and reports:
 * which depth reproduces each logged hash, and whether the two revisions give the same JS at every depth.
 *
 * Usage (repository root): XAI_DEPS_ROOT=<deps> [XAI_NATIVE_TMPDIR=<scratch>] \
 *   node docs/reviews/web-appearance-recovery-final/diagnostics/f1-bundle-depth.mjs <suffix>
 * Writes f1-bundle-depth-<suffix>.log beside this file, refusing to overwrite. Exit 0 when every family's JS is equal
 * across the two revisions at every depth and every logged hash is reproduced at some depth; 1 otherwise.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../../../../", import.meta.url));
const here = fileURLToPath(new URL("./", import.meta.url));
const [suffix] = process.argv.slice(2);
if (!suffix || !/^[A-Za-z0-9._-]+$/.test(suffix)) throw Error("Usage: node f1-bundle-depth.mjs <suffix>");
const output = join(here, `f1-bundle-depth-${suffix}.log`);
if (existsSync(output)) throw Error(`Evidence exists: ${output}`);
const dependencyRoot = process.env.XAI_DEPS_ROOT ?? root;
const dependencyNodeModules = join(dependencyRoot, "node_modules");
const sha256 = data => createHash("sha256").update(data).digest("hex");
const git = args => execFileSync("git", args, { cwd: root, maxBuffer: 1024 * 1024 * 1024 });
const REVISIONS = [["24073b5", "24073b522262d8b4bec0abfa29347db28adbdd9e"], ["419e56d", "419e56de9f23e4467fea806fbd4a990e1f429941"]];
const DEPTHS = [8, 9, 10, 11, 12];
const FAMILIES = [
  { id: "verify-f1.mjs (sticky, more, collaborate)", fixture: "docs/reviews/web-sticky-recovery-f1/f1-host.tsx", sourcefile: "f1-host.tsx",
    logs: { "24073b5": "docs/reviews/web-sticky-recovery-f1/f1-24073b5-sticky-fixed1.log", "419e56d": `docs/reviews/web-sticky-recovery-f1/f1-419e56d-sticky-${suffix}.log` } },
  { id: "verify-f1-callers.mjs (selfcheck … pomodoro)", fixture: "docs/reviews/web-sticky-recovery-f1/f1-callers-host.tsx", sourcefile: "f1-callers-host.tsx",
    logs: { "24073b5": "docs/reviews/web-sticky-recovery-f1/f1-24073b5-selfcheck-fixed1.log", "419e56d": `docs/reviews/web-sticky-recovery-f1/f1-419e56d-selfcheck-${suffix}.log` } },
  { id: "verify-f1-race.mjs (race)", fixture: "docs/reviews/web-sticky-recovery-f1/f1-race-host.tsx", sourcefile: "f1-race-host.tsx",
    logs: { "24073b5": "docs/reviews/web-sticky-recovery-f1/f1-24073b5-race-fixed1.log", "419e56d": `docs/reviews/web-sticky-recovery-f1/f1-419e56d-race-${suffix}.log` } },
  { id: "verify-f1-features.mjs (selfcheck, features)", fixture: "docs/reviews/web-features-recovery-f1/f1-features-host.tsx", sourcefile: "f1-features-host.tsx",
    logs: { "24073b5": "docs/reviews/web-features-recovery-f1/f1-24073b5-features-fixed1.log", "419e56d": `docs/reviews/web-features-recovery-f1/f1-419e56d-features-${suffix}.log` } },
  { id: "verify-f1-appearance(-k1).mjs (selfcheck, appearance)", fixture: "docs/reviews/web-native-keyinput-k1/f1-appearance-host.tsx", sourcefile: "f1-appearance-host.tsx",
    logs: { "24073b5": "docs/reviews/web-appearance-recovery-f1/f1-24073b5-appearance-fixed1.log", "419e56d": `docs/reviews/web-native-keyinput-k1/f1-419e56d-appearance-${suffix}.log` } },
];
const baselineOf = path => readFileSync(join(root, path), "utf8").split("\n").filter(Boolean).map(line => JSON.parse(line)).find(item => item.name === "baseline");
const esbuildFolder = readdirSync(join(dependencyNodeModules, ".pnpm")).find(name => name.startsWith("esbuild@0.28.1"));
const esbuild = await import(pathToFileURL(join(dependencyNodeModules, ".pnpm", esbuildFolder, "node_modules/esbuild/lib/main.js")).href);
const base = realpathSync(process.env.XAI_NATIVE_TMPDIR ?? tmpdir());
const holders = [];
const lines = [`diagnostic=f1-bundle-depth suffix=${suffix} esbuild=${esbuild.version} node=${process.version} temporary_base=${base} dependency_root=${dependencyRoot}`];
const results = {};
let ok = true;
try {
  for (const [revision, commit] of REVISIONS) {
    for (const depth of DEPTHS) {
      // One mkdtemp per (revision, depth), as the runners create one per run; snapshot = <dir>/source at `depth`.
      const holder = realpathSync(mkdtempSync(join(base, "xai-f1-depth-")));
      holders.push(holder);
      const nest = depth - 1 - holder.split(sep).filter(Boolean).length;
      if (nest < 0) throw Error(`depth ${depth} unreachable from ${holder}`);
      let directory = holder;
      for (let index = 0; index < nest; index += 1) { directory = join(directory, `n${index}`); mkdirSync(directory); }
      const snapshot = join(directory, "source");
      mkdirSync(snapshot);
      execFileSync("tar", ["-x", "-C", snapshot], { input: git(["archive", commit]) });
      symlinkSync(dependencyNodeModules, join(snapshot, "node_modules"));
      symlinkSync(join(dependencyRoot, "apps/web/node_modules"), join(snapshot, "apps/web/node_modules"));
      const aliases = new Map();
      for (const name of readdirSync(join(snapshot, "packages"))) {
        const folder = join(snapshot, "packages", name);
        if (!existsSync(join(folder, "package.json"))) continue;
        const pkg = JSON.parse(readFileSync(join(folder, "package.json"), "utf8"));
        aliases.set(pkg.name, { folder, pkg });
        const packageDependencies = join(dependencyRoot, "packages", name, "node_modules");
        if (existsSync(packageDependencies)) symlinkSync(packageDependencies, join(folder, "node_modules"));
      }
      const pinnedPackages = { name: "pinned-workspace-packages", setup(buildApi) {
        buildApi.onResolve({ filter: /^@repo\// }, (args) => {
          const parts = args.path.split("/");
          const entry = aliases.get(parts.slice(0, 2).join("/"));
          if (!entry) throw Error(`Unknown workspace package ${args.path}`);
          const sub = parts.length > 2 ? `./${parts.slice(2).join("/")}` : ".";
          let target = entry.pkg.exports?.[sub];
          if (target && typeof target === "object") target = target.import ?? target.default;
          if (typeof target !== "string") throw Error(`Unresolved pinned export ${args.path}`);
          return { path: join(entry.folder, target) };
        });
      } };
      for (const family of FAMILIES) {
        const built = await esbuild.build({
          stdin: { contents: readFileSync(join(root, family.fixture), "utf8"), resolveDir: snapshot, loader: "tsx", sourcefile: family.sourcefile },
          absWorkingDir: snapshot,
          plugins: [pinnedPackages],
          nodePaths: [join(dependencyRoot, "apps/web/node_modules")],
          loader: { ".png": "dataurl", ".svg": "dataurl", ".woff2": "dataurl", ".woff": "dataurl" },
          bundle: true, format: "esm", platform: "browser", write: false, metafile: true, logLevel: "silent",
          outfile: join(directory, "bundle.js"),
          define: { "import.meta.env": "{}" },
        });
        const js = sha256(built.outputFiles.find(file => file.path.endsWith(".js")).text);
        const css = sha256(built.outputFiles.find(file => file.path.endsWith(".css")).text);
        results[`${family.id}|${revision}|${depth}`] = { js, css };
      }
      rmSync(holder, { recursive: true, force: true });
      console.log(`built ${revision} snapshot depth ${snapshot.split(sep).filter(Boolean).length}`);
    }
  }
  for (const family of FAMILIES) {
    lines.push(`## ${family.id} (fixture ${family.fixture} sha256=${sha256(readFileSync(join(root, family.fixture)))})`);
    const logged = Object.fromEntries(REVISIONS.map(([revision]) => { const baseline = baselineOf(family.logs[revision]); return [revision, { js: baseline.bundleSha256, css: baseline.bundleCssSha256, log: family.logs[revision] }]; }));
    for (const [revision] of REVISIONS) lines.push(`  logged ${revision}: js=${logged[revision].js} css=${logged[revision].css} (${logged[revision].log})`);
    for (const depth of DEPTHS) {
      const a = results[`${family.id}|24073b5|${depth}`], b = results[`${family.id}|419e56d|${depth}`];
      lines.push(`  depth ${depth}: 24073b5 js=${a.js.slice(0, 16)} css=${a.css.slice(0, 16)}${a.js === logged["24073b5"].js && a.css === logged["24073b5"].css ? " =logged" : ""} | 419e56d js=${b.js.slice(0, 16)} css=${b.css.slice(0, 16)}${b.js === logged["419e56d"].js && b.css === logged["419e56d"].css ? " =logged" : ""} | JS equal=${a.js === b.js} CSS equal=${a.css === b.css}`);
    }
    const jsEqualEverywhere = DEPTHS.every(depth => results[`${family.id}|24073b5|${depth}`].js === results[`${family.id}|419e56d|${depth}`].js);
    const reproduced = REVISIONS.map(([revision]) => DEPTHS.filter(depth => results[`${family.id}|${revision}|${depth}`].js === logged[revision].js && results[`${family.id}|${revision}|${depth}`].css === logged[revision].css));
    const familyOk = jsEqualEverywhere && reproduced.every(list => list.length > 0);
    ok &&= familyOk;
    lines.push(`  => ${familyOk ? "EXPLAINED" : "NOT EXPLAINED"}: JS identical across revisions at every depth=${jsEqualEverywhere}; logged 24073b5 reproduced at depth ${reproduced[0].join(",") || "none"}; logged 419e56d reproduced at depth ${reproduced[1].join(",") || "none"}`);
  }
} finally {
  for (const holder of holders) rmSync(holder, { recursive: true, force: true });
}
lines.push(`exit=${ok ? 0 : 1}`);
writeFileSync(output, `${lines.join("\n")}\n`, { flag: "wx" });
console.log(lines.filter(line => line.startsWith("  =>") || line.startsWith("##")).join("\n"));
process.exitCode = ok ? 0 : 1;
