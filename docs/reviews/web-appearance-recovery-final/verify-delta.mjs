/**
 * Final-regression delta audit for CP-APPEARANCE-01 (control-plane batch 51; contract
 * docs/reviews/web-appearance-recovery-contract/contract.md r3 §13 row 10, §14 E27; control plane "Required evidence
 * 覆盖核对" and "本轮唯一任务": the carry-over basis of E9–E13 and E26 from the earlier fixed revision to the final one).
 * Verification only; it executes no product code in a browser and changes no product file or existing evidence.
 *
 * Usage (from the repository root of a checkout that contains this directory):
 *   XAI_DEPS_ROOT=<checkout whose pnpm-lock.yaml equals both revisions'> [XAI_NATIVE_TMPDIR=<scratch dir>] \
 *     node docs/reviews/web-appearance-recovery-final/verify-delta.mjs <fixed> <earlier> <suffix>
 *
 * A. Source delta. `git diff <earlier> <fixed> -- apps packages package.json pnpm-lock.yaml` and the full unrestricted
 *    diff outside docs/ must both be exactly: M packages/xai-web-settings-appearance/src/styles.css,
 *    A …/src/__tests__/AppearancePane.focus-ring.test.tsx, A …/src/__tests__/AppearancePane.selected-focus.test.tsx.
 *    Along the product commits between the two revisions, each styles.css must start with its predecessor byte for
 *    byte (append-only). The appended text, comments removed, must be exactly two top-level rules with the selectors
 *    `.appearance-pane .slider-row input[type="range"]:focus-visible` and `.appearance-pane .accent-sw.active:focus-visible`,
 *    no at-rule, no !important, and only outline, outline-offset and box-shadow declarations. No non-test, non-Markdown
 *    file under apps/ or packages/ at the fixed revision may reference the two new test files.
 * B. Production bundle. `vite build` (the archive's apps/web package.json "build" script, asserted) runs in an
 *    immutable `git archive` of each revision with private node_modules (third-party links from XAI_DEPS_ROOT, @repo
 *    links to the archive's own packages, as ../web-features-recovery-final/verify-packages.mjs), VITE_* variables
 *    removed from the environment. Every emitted file is hashed. The multiset of .js SHA-256 values must be equal at both
 *    revisions, and a .js file name may change only for a chunk whose bytes are identical (Vite folds the CSS a chunk
 *    imports into that chunk's file-name hash). The CSS difference must be exactly the two rules above, and every other
 *    differing file (HTML entry, manifest, source maps of renamed chunks) must be identical once the renamed asset names
 *    are substituted. Provenance: every source of every emitted (hidden) source map must resolve inside that archive or
 *    the dependency store, or be a non-file virtual module; none may come from a checkout's packages/, apps/ or docs/.
 * C. Native evidence bundles. The esbuild bundles that the E9–E11 runner (../web-appearance-recovery-native/
 *    verify-native-fixed.mjs) and the E12/E13/E26 runner (verify-native-host-retryall.mjs, variants `fixed` and
 *    `fixed-coord`) served to Chrome are rebuilt here with those runners' exact esbuild options, fixtures (hash-checked
 *    against the runners' logs), @repo pin, plugin order and directory layout. The bundle text carries `../…` module
 *    comments relative to the archive snapshot, so the snapshot depth is a build input: the earlier revision is built
 *    at candidate depths until the logged JS and CSS hashes are reproduced exactly (fidelity control), then the fixed
 *    revision is built at that depth. The fixed JS must equal the earlier (logged) JS byte for byte; the CSS difference
 *    must be exactly the two rules above.
 * - Lockfile gate: SHA-256 equality of XAI_DEPS_ROOT/pnpm-lock.yaml, `git show <rev>:pnpm-lock.yaml` for both
 *   revisions, every extracted lockfile and the contract hash.
 * - Writes delta-<suffix>-<fixed>.log beside this file (XAI_FINAL_OUTPUT_DIR redirects it, for development smoke runs
 *   only), refusing to overwrite. Exit 0 when every assertion and harness check passes; 1 when an assertion fails; 2
 *   when only a harness check fails. Temporary directories are deleted; nothing is written into the dependency
 *   checkout.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const evidence = fileURLToPath(new URL("./", import.meta.url));
const runnerFile = fileURLToPath(import.meta.url);
const owned = "docs/reviews/web-appearance-recovery-final";
const checkoutRoot = realpathSync(root);
// The native runners use XAI_DEPS_ROOT as given (not realpath'd); esbuild resolves symlinks either way.
const dependencyRootRaw = process.env.XAI_DEPS_ROOT ?? root;
const dependencyRoot = realpathSync(resolve(dependencyRootRaw));
const [fixedArgument, earlierArgument, suffix, ...extra] = process.argv.slice(2);
if (!fixedArgument || !earlierArgument || !suffix || extra.length) throw Error("Usage: node verify-delta.mjs <fixed> <earlier> <suffix>");
for (const value of [fixedArgument, earlierArgument, suffix]) if (!/^[A-Za-z0-9._-]+$/.test(value)) throw Error(`Unsafe argument: ${value}`);

const EXPECTED_LOCK_SHA256 = "df05f2ddfd7f2d04d526ec3cccf6559991686188a0e4bcbc48d2b0451c9aeab9";
const APPEARANCE_DIR = "packages/xai-web-settings-appearance";
const STYLES = `${APPEARANCE_DIR}/src/styles.css`;
const NEW_TESTS = ["AppearancePane.focus-ring.test.tsx", "AppearancePane.selected-focus.test.tsx"].map(name => `${APPEARANCE_DIR}/src/__tests__/${name}`);
const EXPECTED_DELTA = [["M", STYLES], ...NEW_TESTS.map(path => ["A", path])];
const EXPECTED_SELECTORS = ['.appearance-pane .slider-row input[type="range"]:focus-visible', ".appearance-pane .accent-sw.active:focus-visible"];
const ALLOWED_PROPERTIES = new Set(["outline", "outline-offset", "box-shadow"]);
const NATIVE = "docs/reviews/web-appearance-recovery-native";
const DEPTH_CANDIDATES = [10, 8, 9, 11, 12];
const NATIVE_BUNDLES = [
  {
    id: "E9-E11 verify-native-fixed.mjs (controls, reset, export)", runner: "verify-native-fixed.mjs", fixture: "native-fixed-app.tsx",
    logs: ["native-24073b5-fixed1-controls.log", "native-24073b5-fixed1-reset.log", "native-24073b5-fixed1-export.log"], record: rec => rec.name === "baseline",
    snapshotName: () => "source", outfileName: "bundle.js", define: { "import.meta.env": "{}" }, coordinator: false, pluginName: "appearance-native-fixed-archive-pin-guard",
  },
  {
    id: "E12/E13/E26 verify-native-host-retryall.mjs variant fixed (host, downstream, retryall)", runner: "verify-native-host-retryall.mjs", fixture: "native-host-retryall-app.tsx",
    logs: ["native-24073b5-fixed1-host.log", "native-24073b5-fixed1-downstream.log", "native-24073b5-fixed1-retryall.log"], record: rec => rec.name === "bundle-provenance" && rec.variant === "fixed",
    snapshotName: commit => `source-${commit.slice(0, 7)}`, outfileName: "bundle-fixed.js", define: { "import.meta.env": "{}", __NATIVE_VARIANT__: JSON.stringify("fixed") }, coordinator: false, pluginName: "appearance-host-retryall-archive-pin-guard",
  },
  {
    id: "E12 verify-native-host-retryall.mjs variant fixed-coord (host coordinator branch)", runner: "verify-native-host-retryall.mjs", fixture: "native-host-retryall-app.tsx",
    logs: ["native-24073b5-fixed1-host.log"], record: rec => rec.name === "bundle-provenance" && rec.variant === "fixed-coord",
    snapshotName: commit => `source-${commit.slice(0, 7)}`, outfileName: "bundle-fixed-coord.js", define: { "import.meta.env": "{}", __NATIVE_VARIANT__: JSON.stringify("fixed-coord") }, coordinator: true, pluginName: "appearance-host-retryall-archive-pin-guard",
  },
];
// Verbatim copy of verify-native-host-retryall.mjs `coordinatorWrapper` (the run checks that the frozen runner holds
// this exact source text).
const coordinatorWrapper = (webEntry) => `
import { useWebAuthSession as realUseWebAuthSession } from ${JSON.stringify(webEntry)};
export * from ${JSON.stringify(webEntry)};
const OWNER = "appearance-native-A";
const log = (window.__nativeAuth = window.__nativeAuth || { captures: 0, signOuts: [], bootstraps: 0 });
let active = { generation: "native-auth-generation-1", owner: OWNER };
const coordinator = {
  capture() { log.captures += 1; return active ? Object.freeze({ generation: active.generation, owner: active.owner }) : null; },
  async signOut(captured, settings) {
    log.signOuts.push({ seq: window.__native ? window.__native.next() : 0, captured: { generation: captured.generation, owner: captured.owner }, settings: settings === undefined ? null : settings });
    active = null;
    return { status: "applied", remote: "succeeded", local: { status: "applied" }, transient: { envelope: "cleared", verifier: "cleared", index: "cleared" } };
  },
  async bootstrap() { log.bootstraps += 1; return { status: "applied" }; },
  async reconcile() { return { status: "applied" }; },
  getSnapshot() { return { status: active ? "authenticated" : "unauthenticated", session: null, generation: active ? active.generation : null, owner: active ? active.owner : null, client: null, error: null, revision: 0 }; },
  subscribe() { return () => {}; },
};
export function useWebAuthSession() {
  const value = realUseWebAuthSession();
  return { ...value, coordinator };
}
`;

const outputDir = process.env.XAI_FINAL_OUTPUT_DIR ? realpathSync(resolve(process.env.XAI_FINAL_OUTPUT_DIR)) : evidence;
const logPath = join(outputDir, `delta-${suffix}-${fixedArgument}.log`);
if (existsSync(logPath)) throw Error(`Evidence exists; use a new suffix: ${logPath}`);

const sha256 = data => createHash("sha256").update(data).digest("hex");
const git = args => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 }).replace(/\n$/, "");
const gitBuffer = args => execFileSync("git", args, { cwd: root, maxBuffer: 1024 * 1024 * 1024 });
const resolveRevision = revision => {
  const commit = git(["rev-parse", "--verify", `${revision}^{commit}`]);
  return { revision, commit, tree: git(["rev-parse", `${commit}^{tree}`]) };
};
const fixed = resolveRevision(fixedArgument);
const earlier = resolveRevision(earlierArgument);
const runnerHead = git(["rev-parse", "HEAD"]);
const runnerHash = sha256(readFileSync(runnerFile));
const strip = text => String(text ?? "").replace(/\u001b\[[0-9;]*m/g, "");
const inside = (file, folder) => file === folder || file.startsWith(`${folder}/`);
const zList = text => text.split("\0").filter(Boolean);
const versionOf = file => { try { return JSON.parse(readFileSync(file, "utf8")).version; } catch { return "unknown"; } };

// Lockfile gate.
assert(existsSync(join(dependencyRoot, "node_modules")), "Dependency tree missing; set XAI_DEPS_ROOT to a checkout with installed node_modules");
const dependencyLockHash = sha256(readFileSync(join(dependencyRoot, "pnpm-lock.yaml")));
const lockOf = info => sha256(gitBuffer(["show", `${info.commit}:pnpm-lock.yaml`]));
const fixedLockHash = lockOf(fixed);
const earlierLockHash = lockOf(earlier);
assert.equal(dependencyLockHash, EXPECTED_LOCK_SHA256, "Dependency checkout lockfile differs from the contract lockfile");
assert.equal(fixedLockHash, EXPECTED_LOCK_SHA256, "Fixed revision lockfile differs from the contract lockfile");
assert.equal(earlierLockHash, EXPECTED_LOCK_SHA256, "Earlier revision lockfile differs from the contract lockfile");
const FORBIDDEN = [...new Set([dependencyRoot, checkoutRoot])].flatMap(base => ["packages", "apps", "docs"].map(folder => join(base, folder)));
const STORE = join(dependencyRoot, "node_modules/.pnpm");

const checks = [];
const check = (kind, label, ok, detail = "") => { checks.push({ kind, label, ok, detail }); return ok; };
const lines = [];
const temporary = [];
const tmpBase = () => realpathSync(process.env.XAI_NATIVE_TMPDIR ?? tmpdir());
const extractedLocks = [];
const extractArchive = (info, directory) => {
  execFileSync("tar", ["-x", "-C", directory], { input: gitBuffer(["archive", info.commit]) });
  const extracted = sha256(readFileSync(join(directory, "pnpm-lock.yaml")));
  extractedLocks.push(`${info.revision}@${relative(tmpBase(), directory) || directory}=${extracted}`);
  assert.equal(extracted, EXPECTED_LOCK_SHA256, `Extracted lockfile of ${info.revision} differs from the contract lockfile`);
};

// ---- CSS helpers ------------------------------------------------------------------------------------
const normalizeSelector = selector => selector.replace(/\s+/g, " ").replace(/"/g, "").trim();
/** Top-level rules of a comment-free CSS text: [{ selector, declarations: [[property, value]] }], plus leftover text. */
const parseRules = text => {
  const clean = text.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules = [];
  const leftover = clean.replace(/([^{}]+)\{([^{}]*)\}/g, (_, selector, body) => {
    const declarations = body.split(";").map(part => part.trim()).filter(Boolean).map(part => { const index = part.indexOf(":"); return [part.slice(0, index).trim(), part.slice(index + 1).trim()]; });
    rules.push({ selector: selector.trim(), declarations });
    return "";
  });
  return { rules, leftover: leftover.trim(), atRules: /@/.test(clean), important: /!important/i.test(clean) };
};
const rulesAreTheTwoFocusRules = (text, label) => {
  const parsed = parseRules(text);
  const selectors = parsed.rules.map(rule => normalizeSelector(rule.selector));
  const properties = parsed.rules.flatMap(rule => rule.declarations.map(([property]) => property));
  const ok = parsed.rules.length === 2 && JSON.stringify(selectors) === JSON.stringify(EXPECTED_SELECTORS.map(normalizeSelector))
    && properties.every(property => ALLOWED_PROPERTIES.has(property)) && parsed.leftover === "" && !parsed.atRules && !parsed.important;
  lines.push(`  ${label}: rules=${parsed.rules.length} selectors=${JSON.stringify(parsed.rules.map(rule => rule.selector))} declarations=${JSON.stringify(parsed.rules.map(rule => rule.declarations))} leftover=${JSON.stringify(parsed.leftover)} at_rules=${parsed.atRules} important=${parsed.important}`);
  return ok;
};
/** Single contiguous insertion between two texts (by lines): returns { removed, inserted } line arrays. */
const insertionOf = (beforeText, afterText) => {
  const a = beforeText.split("\n");
  const b = afterText.split("\n");
  let prefix = 0;
  while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix += 1;
  let suffixLength = 0;
  while (suffixLength < a.length - prefix && suffixLength < b.length - prefix && a[a.length - 1 - suffixLength] === b[b.length - 1 - suffixLength]) suffixLength += 1;
  return { prefix, suffix: suffixLength, removed: a.slice(prefix, a.length - suffixLength), inserted: b.slice(prefix, b.length - suffixLength) };
};
/** Same, by characters (minified one-line CSS). A pure insertion's position is ambiguous when the inserted text and
 * its neighbour share characters, so the window is slid left (an equivalent insertion) until it starts at a rule
 * boundary ("}" before it). */
const insertionOfChars = (beforeText, afterText) => {
  let prefix = 0;
  while (prefix < beforeText.length && prefix < afterText.length && beforeText[prefix] === afterText[prefix]) prefix += 1;
  let suffixLength = 0;
  while (suffixLength < beforeText.length - prefix && suffixLength < afterText.length - prefix && beforeText[beforeText.length - 1 - suffixLength] === afterText[afterText.length - 1 - suffixLength]) suffixLength += 1;
  const removed = beforeText.slice(prefix, beforeText.length - suffixLength);
  let start = prefix;
  let end = afterText.length - suffixLength;
  if (removed === "") while (start > 0 && afterText[start - 1] !== "}" && afterText[start - 1] === afterText[end - 1]) { start -= 1; end -= 1; }
  return { prefix: start, removed, inserted: afterText.slice(start, end) };
};

let exitCode = 1;
try {
  // ================= A. Source delta =================
  lines.push(`## A. Source delta ${earlier.revision}..${fixed.revision}`);
  const parseNameStatus = text => { const parts = zList(text); const out = []; for (let index = 0; index < parts.length; index += 2) out.push([parts[index], parts[index + 1]]); return out; };
  const asText = entries => entries.map(([status, path]) => `${status} ${path}`).sort();
  const productDiff = parseNameStatus(git(["diff", "--name-status", "-z", "--no-renames", earlier.commit, fixed.commit, "--", "apps", "packages", "package.json", "pnpm-lock.yaml"]));
  const fullDiff = parseNameStatus(git(["diff", "--name-status", "-z", "--no-renames", earlier.commit, fixed.commit]));
  const outsideDocs = fullDiff.filter(([, path]) => !path.startsWith("docs/"));
  const numstat = git(["diff", "--numstat", "--no-renames", earlier.commit, fixed.commit, "--", "apps", "packages", "package.json", "pnpm-lock.yaml"]).split("\n").filter(Boolean);
  lines.push(`product-scope diff (-- apps packages package.json pnpm-lock.yaml): ${productDiff.length} entries`, ...numstat.map(line => `  numstat ${line.replace(/\t/g, " ")}`));
  lines.push(`full unrestricted diff: ${fullDiff.length} entries, ${fullDiff.length - outsideDocs.length} under docs/, ${outsideDocs.length} outside docs/`, ...asText(outsideDocs).map(line => `  outside-docs ${line}`));
  check("assert", `A: product-scope diff ${earlier.revision}..${fixed.revision} is exactly M styles.css + A the two guard tests`, JSON.stringify(asText(productDiff)) === JSON.stringify(asText(EXPECTED_DELTA)), asText(productDiff).join(", "));
  check("assert", `A: full unrestricted diff outside docs/ is exactly the same three files`, JSON.stringify(asText(outsideDocs)) === JSON.stringify(asText(EXPECTED_DELTA)), asText(outsideDocs).join(", "));
  const removedLines = numstat.reduce((sum, line) => sum + Number(line.split("\t")[1]), 0);
  check("assert", "A: the product delta removes no line (numstat deletions 0)", removedLines === 0, `deletions=${removedLines}`);
  const chain = git(["log", "--reverse", "--format=%H %s", `${earlier.commit}..${fixed.commit}`, "--", "apps", "packages", "package.json", "pnpm-lock.yaml"]).split("\n").filter(Boolean);
  lines.push(`product commits ${earlier.revision}..${fixed.revision}: ${chain.length}`, ...chain.map(line => `  ${line}`));
  const steps = [earlier.commit, ...chain.map(line => line.split(" ")[0])];
  let appendOnly = true;
  for (let index = 1; index < steps.length; index += 1) {
    const previous = gitBuffer(["show", `${steps[index - 1]}:${STYLES}`]);
    const next = gitBuffer(["show", `${steps[index]}:${STYLES}`]);
    const prefixEqual = next.length >= previous.length && next.subarray(0, previous.length).equals(previous);
    appendOnly &&= prefixEqual;
    const appended = next.subarray(previous.length).toString("utf8");
    lines.push(`  step ${steps[index - 1].slice(0, 7)} -> ${steps[index].slice(0, 7)}: styles.css ${previous.length} -> ${next.length} bytes; prefix equal=${prefixEqual}; sha256 ${sha256(previous).slice(0, 16)} -> ${sha256(next).slice(0, 16)}; appended ${appended.split("\n").length - 1} lines sha256=${sha256(appended).slice(0, 16)}`);
  }
  check("assert", "A: along every product commit, styles.css starts with its predecessor byte for byte (append-only)", appendOnly && steps.length >= 2);
  const earlierStyles = gitBuffer(["show", `${earlier.commit}:${STYLES}`]);
  const fixedStyles = gitBuffer(["show", `${fixed.commit}:${STYLES}`]);
  const appendedText = fixedStyles.subarray(earlierStyles.length).toString("utf8");
  lines.push(`appended text ${earlier.revision}..${fixed.revision} (${appendedText.split("\n").length - 1} lines, sha256=${sha256(appendedText)}):`, ...appendedText.split("\n").map(line => `  | ${line}`));
  check("assert", "A: the appended CSS is exactly the two :focus-visible rules scoped under .appearance-pane, declaring only outline, outline-offset and box-shadow (no at-rule, no !important)",
    fixedStyles.subarray(0, earlierStyles.length).equals(earlierStyles) && rulesAreTheTwoFocusRules(appendedText, "source rules"));
  const grep = spawnSync("git", ["grep", "-l", "-F", "-e", "AppearancePane.focus-ring", "-e", "AppearancePane.selected-focus", fixed.commit, "--", "apps", "packages"], { cwd: root, encoding: "utf8" });
  if (grep.status !== 0 && grep.status !== 1) throw Error(`git grep failed: ${grep.stderr}`);
  const references = grep.stdout.split("\n").filter(Boolean)
    .map(entry => entry.slice(fixed.commit.length + 1)).filter(path => !/(^|\/)__tests__\//.test(path) && !/\.(test|spec)\.[cm]?[jt]sx?$/.test(path) && !path.toLowerCase().endsWith(".md"));
  check("assert", "A: no non-test, non-Markdown file under apps/ or packages/ references the two new test files", references.length === 0, references.join(","));
  for (const path of NEW_TESTS) lines.push(`new test ${path} sha256=${sha256(gitBuffer(["show", `${fixed.commit}:${path}`]))}`);

  // ================= B. Production bundle (vite build) =================
  lines.push("## B. Production bundle: `vite build` of apps/web in an immutable archive of each revision");
  const removedEnvironment = Object.keys(process.env).filter(key => key.startsWith("VITE_")).sort();
  const buildEnvironment = { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" };
  for (const key of removedEnvironment) delete buildEnvironment[key];
  lines.push(`vite_build_environment: VITE_* variables removed=${removedEnvironment.length ? removedEnvironment.join(",") : "none present"}; NODE_ENV=${buildEnvironment.NODE_ENV ?? "unset"}; NO_COLOR=1`);
  const viteBuilds = {};
  for (const info of [earlier, fixed]) {
    const directory = realpathSync(mkdtempSync(join(tmpBase(), "xai-appearance-final-vite-")));
    temporary.push(directory);
    extractArchive(info, directory);
    // Private node_modules as in ../web-features-recovery-final/verify-packages.mjs.
    const workspace = new Map();
    for (const base of ["packages", "apps"]) {
      for (const entry of readdirSync(join(directory, base))) {
        const folder = join(directory, base, entry);
        let pkg;
        try { pkg = JSON.parse(readFileSync(join(folder, "package.json"), "utf8")); } catch { continue; }
        if (typeof pkg.name !== "string") continue;
        assert(!workspace.has(pkg.name), `Duplicate workspace package name in the archive: ${pkg.name}`);
        workspace.set(pkg.name, { folder, rel: `${base}/${entry}`, pkg });
      }
    }
    const repoDeps = pkg => [...new Set(Object.keys({ ...pkg.dependencies, ...pkg.optionalDependencies, ...pkg.peerDependencies, ...pkg.devDependencies }).filter(name => name.startsWith("@repo/")))].sort();
    const KEEP_DOT_ENTRIES = new Set([".bin", ".pnpm"]);
    let thirdPartyLinks = 0;
    let workspaceLinks = 0;
    const linkThirdParty = (source, target) => {
      if (!existsSync(source)) return;
      mkdirSync(target, { recursive: true });
      for (const entry of readdirSync(source)) {
        if (entry === "@repo" || (entry.startsWith(".") && !KEEP_DOT_ENTRIES.has(entry))) continue;
        symlinkSync(join(source, entry), join(target, entry));
        thirdPartyLinks += 1;
      }
    };
    const linkWorkspace = (pkg, target) => {
      for (const name of repoDeps(pkg)) {
        if (!workspace.has(name)) continue;
        mkdirSync(join(target, "@repo"), { recursive: true });
        symlinkSync(workspace.get(name).folder, join(target, "@repo", name.slice("@repo/".length)));
        workspaceLinks += 1;
      }
    };
    linkThirdParty(join(dependencyRoot, "node_modules"), join(directory, "node_modules"));
    linkWorkspace(JSON.parse(readFileSync(join(directory, "package.json"), "utf8")), join(directory, "node_modules"));
    for (const [, entry] of workspace) {
      linkThirdParty(join(dependencyRoot, entry.rel, "node_modules"), join(entry.folder, "node_modules"));
      linkWorkspace(entry.pkg, join(entry.folder, "node_modules"));
    }
    const webRoot = join(directory, "apps/web");
    const webPackage = JSON.parse(readFileSync(join(webRoot, "package.json"), "utf8"));
    check("harness", `B: ${info.revision} archive apps/web package.json script "build" is "vite build" (found ${JSON.stringify(webPackage.scripts?.build)})`, webPackage.scripts?.build === "vite build");
    const viteBin = [join(dependencyRoot, "apps/web/node_modules/.bin/vite"), join(dependencyRoot, "node_modules/.bin/vite")].find(candidate => existsSync(candidate));
    assert(viteBin, "vite binary not found in the dependency checkout");
    const viteHome = realpathSync(join(dependencyRoot, "apps/web/node_modules/vite"));
    const started = Date.now();
    const result = spawnSync(viteBin, ["build"], { cwd: webRoot, encoding: "utf8", maxBuffer: 256 * 1024 * 1024, env: buildEnvironment });
    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    const dist = join(webRoot, "dist");
    const files = new Map();
    const walk = (folder) => { for (const entry of readdirSync(folder, { withFileTypes: true })) { const full = join(folder, entry.name); if (entry.isDirectory()) walk(full); else files.set(relative(dist, full), { sha: sha256(readFileSync(full)), size: lstatSync(full).size, full }); } };
    if (existsSync(dist)) walk(dist);
    // Provenance through the hidden source maps.
    const provenance = { maps: 0, sources: 0, archive: 0, store: 0, virtual: 0, forbidden: [], elsewhere: [], archiveByPackage: new Map() };
    for (const [name, entry] of files) {
      if (!name.endsWith(".map")) continue;
      provenance.maps += 1;
      const map = JSON.parse(readFileSync(entry.full, "utf8"));
      for (const source of map.sources ?? []) {
        provenance.sources += 1;
        const absolute = resolve(dirname(entry.full), map.sourceRoot ?? "", source);
        if (FORBIDDEN.some(folder => inside(absolute, folder))) provenance.forbidden.push(source);
        else if (inside(absolute, directory) && existsSync(absolute)) { provenance.archive += 1; const key = relative(directory, absolute).split("/").slice(0, 2).join("/"); provenance.archiveByPackage.set(key, (provenance.archiveByPackage.get(key) ?? 0) + 1); }
        else if (inside(absolute, STORE)) provenance.store += 1;
        else if (!existsSync(absolute)) provenance.virtual += 1;
        else provenance.elsewhere.push(source);
      }
    }
    viteBuilds[info.revision] = { files, status: result.status, signal: result.signal, seconds };
    lines.push(`vite build @${info.revision} (${info.commit}): exit=${result.status}${result.signal ? ` signal=${result.signal}` : ""} seconds=${seconds} bin=${relative(dependencyRoot, viteBin)} vite=${versionOf(join(viteHome, "package.json"))} node_modules_links third_party=${thirdPartyLinks} workspace=${workspaceLinks}`);
    for (const line of strip(result.stdout).split("\n").filter(line => line.trim())) lines.push(`  stdout | ${line}`);
    for (const line of strip(result.stderr).split("\n").filter(line => line.trim())) lines.push(`  stderr | ${line}`);
    lines.push(`  emitted files=${files.size}: ${[...files].filter(([name]) => name.endsWith(".js")).length} .js, ${[...files].filter(([name]) => name.endsWith(".css")).length} .css, ${[...files].filter(([name]) => name.endsWith(".map")).length} .map`);
    for (const [name, entry] of [...files].sort(([a], [b]) => a.localeCompare(b))) lines.push(`  file ${name} size=${entry.size} sha256=${entry.sha}`);
    lines.push(`  provenance maps=${provenance.maps} sources=${provenance.sources} archive=${provenance.archive} store=${provenance.store} virtual(non-file)=${provenance.virtual} elsewhere=${provenance.elsewhere.length} forbidden=${provenance.forbidden.length} archive_by_package ${[...provenance.archiveByPackage].sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join(" ")}`);
    for (const source of [...provenance.elsewhere, ...provenance.forbidden].slice(0, 20)) lines.push(`  provenance-outlier ${source}`);
    check("harness", `B: vite build @${info.revision} exited 0 and emitted .js files`, result.status === 0 && [...files.keys()].some(name => name.endsWith(".js")));
    check("harness", `B: vite build @${info.revision} source-map provenance: every source in the archive, the dependency store or virtual; none from a checkout (${provenance.archive} archive, ${provenance.store} store, ${provenance.virtual} virtual)`,
      provenance.maps > 0 && provenance.forbidden.length === 0 && provenance.elsewhere.length === 0);
    check("harness", `B: vite build @${info.revision} bundled the Appearance package from the archive (source maps reference ${provenance.archiveByPackage.get(APPEARANCE_DIR) ?? 0} of its files)`, (provenance.archiveByPackage.get(APPEARANCE_DIR) ?? 0) > 0);
  }
  {
    const a = viteBuilds[earlier.revision].files;
    const b = viteBuilds[fixed.revision].files;
    // Content identity of the JavaScript, then the names: Vite derives a chunk's file name from its content and from
    // the CSS it imports, so a chunk whose bytes are unchanged may still be renamed when its stylesheet changes.
    const jsNames = names => [...names.keys()].filter(name => name.endsWith(".js")).sort();
    const jsA = jsNames(a);
    const jsB = jsNames(b);
    const hashesA = jsA.map(name => a.get(name).sha).sort();
    const hashesB = jsB.map(name => b.get(name).sha).sort();
    const contentSame = jsA.length > 0 && JSON.stringify(hashesA) === JSON.stringify(hashesB) && new Set(hashesA).size === hashesA.length;
    const renamedJs = jsA.filter(name => !b.has(name)).map(name => [name, jsB.find(other => !a.has(other) && b.get(other).sha === a.get(name).sha) ?? null]);
    lines.push(`vite JS comparison: ${earlier.revision} ${jsA.length} .js, ${fixed.revision} ${jsB.length} .js; multiset of SHA-256 identical: ${contentSame}; same name and bytes: ${jsA.filter(name => b.get(name)?.sha === a.get(name).sha).length}; renamed with identical bytes: ${renamedJs.filter(([, to]) => to).length}`);
    for (const name of jsA) {
      const pair = renamedJs.find(([from]) => from === name);
      lines.push(`  js ${name} ${earlier.revision}=${a.get(name).sha} ${fixed.revision}=${b.get(name)?.sha ?? (pair?.[1] ? `${b.get(pair[1]).sha} as ${pair[1]}` : "absent")}${b.get(name)?.sha === a.get(name).sha ? " same name, same bytes" : pair?.[1] ? " RENAMED, same bytes" : " DIFFERS"}`);
    }
    for (const name of jsB.filter(name => !a.has(name) && !renamedJs.some(([, to]) => to === name))) lines.push(`  js ${name} only at ${fixed.revision} sha256=${b.get(name).sha}`);
    check("assert", `B: every production .js file built from ${fixed.revision} has exactly the bytes of one built from ${earlier.revision} (${jsA.length} files; SHA-256 multisets equal)`, contentSame);
    check("assert", "B: the only .js name changes are renames of byte-identical chunks (no .js file differs in content under any name)", renamedJs.every(([, to]) => to) && jsB.filter(name => !a.has(name)).length === renamedJs.length && jsA.filter(name => b.has(name)).every(name => a.get(name).sha === b.get(name).sha));
    const allNames = [...new Set([...a.keys(), ...b.keys()])].sort();
    const differing = allNames.filter(name => a.get(name)?.sha !== b.get(name)?.sha);
    lines.push(`vite differing paths (${differing.length}):`, ...differing.map(name => `  ${name}: ${earlier.revision}=${a.get(name)?.sha ?? "absent"} ${fixed.revision}=${b.get(name)?.sha ?? "absent"}`));
    const cssA = [...a.keys()].filter(name => name.endsWith(".css") && !b.has(name));
    const cssB = [...b.keys()].filter(name => name.endsWith(".css") && !a.has(name));
    const sameNamedCssDiffers = [...a.keys()].filter(name => name.endsWith(".css") && b.has(name) && a.get(name).sha !== b.get(name).sha);
    lines.push(`vite CSS assets: renamed ${JSON.stringify(cssA)} -> ${JSON.stringify(cssB)}; same-name CSS differing ${JSON.stringify(sameNamedCssDiffers)}`);
    let cssOk = false;
    if (cssA.length === 1 && cssB.length === 1 && sameNamedCssDiffers.length === 0) {
      const before = readFileSync(a.get(cssA[0]).full, "utf8");
      const after = readFileSync(b.get(cssB[0]).full, "utf8");
      const delta = insertionOfChars(before, after);
      lines.push(`  minified CSS insertion at offset ${delta.prefix}: removed ${JSON.stringify(delta.removed)} inserted ${JSON.stringify(delta.inserted)}`);
      cssOk = delta.removed === "" && rulesAreTheTwoFocusRules(delta.inserted, "production CSS insertion");
    }
    check("assert", "B: the production CSS difference is one renamed stylesheet whose only change is the insertion of the two focus rules", cssOk);
    // Every other differing path must be a source map of a renamed chunk, the HTML entry or the manifest, identical once
    // each renamed asset's old and new base names are replaced by one placeholder.
    const renames = [...renamedJs.filter(([, to]) => to), ...(cssA.length === 1 && cssB.length === 1 ? [[cssA[0], cssB[0]]] : [])];
    const baseOf = name => name.split("/").pop();
    const normalize = text => renames.reduce((current, [from, to], index) => current.split(baseOf(from)).join(`<RENAMED-${index}>`).split(baseOf(to)).join(`<RENAMED-${index}>`), text);
    const mapPairs = renamedJs.filter(([, to]) => to).map(([from, to]) => [`${from}.map`, `${to}.map`]);
    const explained = new Set([...renamedJs.flat(), ...cssA, ...cssB, ...mapPairs.flat()]);
    const others = differing.filter(name => !explained.has(name));
    lines.push(`vite renames: ${renames.map(([from, to]) => `${from} -> ${to}`).join("; ") || "none"}`);
    for (const [from, to] of mapPairs) {
      const same = a.has(from) && b.has(to) && normalize(readFileSync(a.get(from).full, "utf8")) === normalize(readFileSync(b.get(to).full, "utf8"));
      lines.push(`  source map ${from} -> ${to}: identical after substituting the renamed names = ${same}`);
      check("assert", `B: source map of the renamed chunk ${baseOf(from)} is identical after substituting the renamed names`, same);
    }
    for (const name of others) {
      const same = a.has(name) && b.has(name) && (name.endsWith(".html") || name.endsWith(".json")) && normalize(readFileSync(a.get(name).full, "utf8")) === normalize(readFileSync(b.get(name).full, "utf8"));
      lines.push(`  ${name}: identical after substituting the renamed names = ${same}`);
      check("assert", `B: ${name} differs only by the renamed asset names`, same);
    }
    lines.push(`vite differing paths that are neither a renamed asset nor its source map (each checked above after substitution): ${others.join(", ") || "none"}`);
  }

  // ================= C. Native evidence bundles (esbuild, as the E9–E13/E26 runners) =================
  lines.push("## C. Native evidence bundles rebuilt with the frozen runners' esbuild options");
  const dependencyNodeModules = join(dependencyRootRaw, "node_modules");
  const esbuildFolder = readdirSync(join(dependencyNodeModules, ".pnpm")).find(name => name.startsWith("esbuild@0.28.1"));
  assert(esbuildFolder, "pinned esbuild 0.28.1 missing");
  const esbuild = await import(pathToFileURL(join(dependencyNodeModules, ".pnpm", esbuildFolder, "node_modules/esbuild/lib/main.js")).href);
  const hostRunnerSource = readFileSync(join(root, NATIVE, "verify-native-host-retryall.mjs"), "utf8");
  check("harness", "C: the coordinatorWrapper used here is the frozen E12 runner's source text, verbatim", hostRunnerSource.includes(`const coordinatorWrapper = ${coordinatorWrapper.toString()};`));
  lines.push(`esbuild=${esbuild.version} from ${relative(dependencyRoot, join(realpathSync(dependencyNodeModules), ".pnpm", esbuildFolder))}`);
  const buildNative = async (spec, info, depth) => {
    const holder = realpathSync(mkdtempSync(join(tmpBase(), "xai-appearance-final-delta-")));
    temporary.push(holder);
    const nest = depth - 1 - holder.split(sep).filter(Boolean).length;
    if (nest < 0) throw Error(`Depth ${depth} is not reachable under ${holder}`);
    let directory = holder;
    for (let index = 0; index < nest; index += 1) { directory = join(directory, `n${index}`); mkdirSync(directory); }
    const snapshot = join(directory, spec.snapshotName(info.commit));
    mkdirSync(snapshot);
    extractArchive(info, snapshot);
    symlinkSync(dependencyNodeModules, join(snapshot, "node_modules"));
    symlinkSync(join(dependencyRootRaw, "apps/web/node_modules"), join(snapshot, "apps/web/node_modules"));
    const aliases = new Map();
    for (const name of readdirSync(join(snapshot, "packages"))) {
      const folder = join(snapshot, "packages", name);
      if (!existsSync(join(folder, "package.json"))) continue;
      const pkg = JSON.parse(readFileSync(join(folder, "package.json"), "utf8"));
      aliases.set(pkg.name, { folder, pkg });
      const packageDependencies = join(dependencyRootRaw, "packages", name, "node_modules");
      if (existsSync(packageDependencies)) symlinkSync(packageDependencies, join(folder, "node_modules"));
    }
    const forbiddenRoots = [...new Set([dependencyRootRaw, root].map(base => realpathSync(base)))].flatMap(base => ["packages", "apps", "docs"].map(tree => join(base, tree) + sep));
    const guardViolations = [];
    const archiveModules = new Set();
    const archiveRoot = snapshot + sep;
    const authAlias = aliases.get("@repo/web-auth-device-session");
    const webEntry = join(authAlias.folder, typeof authAlias.pkg.exports["./web"] === "object" ? authAlias.pkg.exports["./web"].import : authAlias.pkg.exports["./web"]);
    const plugin = { name: spec.pluginName, setup(buildApi) {
      if (spec.coordinator) {
        buildApi.onResolve({ filter: /^@repo\/web-auth-device-session\/web$/ }, () => ({ path: "auth-session-context-with-synthetic-coordinator", namespace: "native-auth" }));
        buildApi.onLoad({ filter: /.*/, namespace: "native-auth" }, () => ({ contents: coordinatorWrapper(webEntry), loader: "js", resolveDir: snapshot }));
      }
      buildApi.onResolve({ filter: /^@repo\// }, (args) => {
        const parts = args.path.split("/");
        const alias = aliases.get(parts.slice(0, 2).join("/"));
        if (!alias) throw Error(`Unknown workspace package ${args.path}`);
        const sub = parts.length > 2 ? `./${parts.slice(2).join("/")}` : ".";
        let target = alias.pkg.exports?.[sub];
        if (target && typeof target === "object") target = target.import ?? target.default;
        if (typeof target !== "string") throw Error(`Unresolved pinned export ${args.path}`);
        return { path: join(alias.folder, target) };
      });
      buildApi.onLoad({ filter: /.*/ }, (args) => {
        if (args.namespace === "native-auth") return undefined;
        const file = args.path;
        if (file.startsWith(archiveRoot) && !file.includes(`${sep}node_modules${sep}`)) archiveModules.add(relative(snapshot, file));
        if (!file.includes(`${sep}node_modules${sep}`) && forbiddenRoots.some(base => file.startsWith(base))) {
          guardViolations.push(file);
          throw Error(`Guard: module loaded from a checkout instead of the archive: ${file}`);
        }
        return undefined;
      });
    } };
    const fixtureSource = readFileSync(join(root, NATIVE, spec.fixture), "utf8");
    const built = await esbuild.build({
      stdin: { contents: fixtureSource, resolveDir: snapshot, loader: "tsx", sourcefile: spec.fixture },
      absWorkingDir: snapshot,
      plugins: [plugin],
      nodePaths: [join(dependencyRootRaw, "apps/web/node_modules")],
      loader: { ".png": "dataurl", ".svg": "dataurl", ".woff2": "dataurl", ".woff": "dataurl" },
      bundle: true, format: "esm", platform: "browser", write: false, metafile: true, logLevel: "silent",
      outfile: join(directory, spec.outfileName),
      define: spec.define,
    });
    const js = built.outputFiles.find(file => file.path.endsWith(".js")).text;
    const css = built.outputFiles.find(file => file.path.endsWith(".css")).text;
    const inputs = Object.keys(built.metafile.inputs);
    const foreign = inputs.filter(input => input.startsWith("../") && !input.includes("node_modules/"));
    rmSync(holder, { recursive: true, force: true });
    return { js, css, jsSha: sha256(js), cssSha: sha256(css), inputs: inputs.length, archiveModules: archiveModules.size, foreign, guardViolations, snapshotDepth: snapshot.split(sep).filter(Boolean).length };
  };
  for (const spec of NATIVE_BUNDLES) {
    const records = spec.logs.map(log => ({ log, records: readFileSync(join(root, NATIVE, log), "utf8").split("\n").filter(Boolean).map(line => JSON.parse(line)) }));
    const logged = records.map(({ log, records: list }) => ({ log, record: list.find(spec.record), files: list.find(rec => rec.fileSha256)?.fileSha256 ?? null }));
    const fixtureHash = sha256(readFileSync(join(root, NATIVE, spec.fixture)));
    const runnerHashNative = sha256(readFileSync(join(root, NATIVE, spec.runner)));
    lines.push(`### ${spec.id}`);
    for (const entry of logged) lines.push(`  logged ${NATIVE}/${entry.log} (sha256=${sha256(readFileSync(join(root, NATIVE, entry.log)))}): js=${entry.record?.bundleSha256} css=${entry.record?.bundleCssSha256} revision=${entry.record?.resolved ?? entry.record?.revision} fixture_sha256=${entry.files?.[spec.fixture]} runner_sha256=${entry.files?.[spec.runner]}`);
    const target = logged[0].record;
    check("harness", `C: ${spec.id}: every cited log records the same JS and CSS bundle hashes at ${earlier.revision}`, logged.every(entry => entry.record && entry.record.bundleSha256 === target.bundleSha256 && entry.record.bundleCssSha256 === target.bundleCssSha256 && String(entry.record.resolved ?? entry.record.revision).startsWith(earlier.commit)));
    check("harness", `C: ${spec.id}: this checkout's fixture and runner equal the files the logged run recorded (${fixtureHash.slice(0, 16)}, ${runnerHashNative.slice(0, 16)})`, logged.every(entry => entry.files?.[spec.fixture] === fixtureHash && entry.files?.[spec.runner] === runnerHashNative));
    let matched = null;
    for (const depth of DEPTH_CANDIDATES) {
      const build = await buildNative(spec, earlier, depth);
      lines.push(`  rebuild @${earlier.revision} snapshot depth ${build.snapshotDepth}: js=${build.jsSha} css=${build.cssSha} inputs=${build.inputs} archive_modules=${build.archiveModules} foreign=${build.foreign.length} guard_violations=${build.guardViolations.length}${build.jsSha === target.bundleSha256 && build.cssSha === target.bundleCssSha256 ? " = logged (fidelity reproduced)" : ""}`);
      if (build.jsSha === target.bundleSha256 && build.cssSha === target.bundleCssSha256) { matched = { depth, build }; break; }
    }
    check("assert", `C: ${spec.id}: the logged ${earlier.revision} JS ${target.bundleSha256.slice(0, 16)} and CSS ${target.bundleCssSha256.slice(0, 16)} are reproduced exactly by this rebuild (fidelity control)`, Boolean(matched));
    const depth = matched?.depth ?? DEPTH_CANDIDATES[0];
    const fixedBuild = await buildNative(spec, fixed, depth);
    const earlierBuild = matched?.build ?? await buildNative(spec, earlier, depth);
    lines.push(`  rebuild @${fixed.revision} snapshot depth ${fixedBuild.snapshotDepth}: js=${fixedBuild.jsSha} css=${fixedBuild.cssSha} inputs=${fixedBuild.inputs} archive_modules=${fixedBuild.archiveModules} foreign=${fixedBuild.foreign.length} guard_violations=${fixedBuild.guardViolations.length}`);
    check("harness", `C: ${spec.id}: no module from a checkout in either rebuild`, fixedBuild.foreign.length === 0 && fixedBuild.guardViolations.length === 0 && earlierBuild.foreign.length === 0 && earlierBuild.guardViolations.length === 0);
    check("assert", `C: ${spec.id}: the JS bundle built from ${fixed.revision} is byte-identical to the one built from ${earlier.revision}${matched ? " (= the logged bundle the native run executed)" : ""}`, fixedBuild.jsSha === earlierBuild.jsSha);
    const delta = insertionOf(earlierBuild.css, fixedBuild.css);
    lines.push(`  CSS ${earlier.revision} -> ${fixed.revision}: common prefix ${delta.prefix} lines, common suffix ${delta.suffix} lines, removed ${delta.removed.length} lines, inserted ${delta.inserted.length} lines:`, ...delta.inserted.map(line => `    + ${line}`));
    check("assert", `C: ${spec.id}: the CSS bundle differs only by the insertion of the two focus rules`, fixedBuild.cssSha !== earlierBuild.cssSha && delta.removed.length === 0 && rulesAreTheTwoFocusRules(delta.inserted.join("\n"), `${spec.id} CSS insertion`));
  }

  const failedAsserts = checks.filter(entry => entry.kind === "assert" && !entry.ok);
  const failedHarness = checks.filter(entry => entry.kind === "harness" && !entry.ok);
  exitCode = failedAsserts.length ? 1 : failedHarness.length ? 2 : 0;
} catch (error) {
  check("harness", `runner completed without an exception (${String(error?.stack ?? error).split("\n")[0]})`, false);
  lines.push(`runner_exception ${String(error?.stack ?? error)}`);
  exitCode = checks.some(entry => entry.kind === "assert" && !entry.ok) ? 1 : 2;
} finally {
  for (const directory of temporary) rmSync(directory, { recursive: true, force: true });
  const totals = kind => `${checks.filter(entry => entry.kind === kind && entry.ok).length}/${checks.filter(entry => entry.kind === kind).length}`;
  const header = [
    `requested_fixed=${fixed.revision}`,
    `resolved_fixed_commit=${fixed.commit}`,
    `resolved_fixed_tree=${fixed.tree}`,
    `requested_earlier=${earlier.revision}`,
    `resolved_earlier_commit=${earlier.commit}`,
    `resolved_earlier_tree=${earlier.tree}`,
    `suffix=${suffix}`,
    `command=XAI_DEPS_ROOT=${dependencyRootRaw}${process.env.XAI_NATIVE_TMPDIR ? ` XAI_NATIVE_TMPDIR=${process.env.XAI_NATIVE_TMPDIR}` : ""} node ${owned}/verify-delta.mjs ${fixedArgument} ${earlierArgument} ${suffix}`,
    `output_dir=${outputDir === evidence ? owned : `${outputDir} (redirected; not evidence)`}`,
    `runner_checkout_head=${runnerHead}`,
    `runner_sha256=${runnerHash}`,
    `node=${process.version} platform=${process.platform}-${process.arch} tz=${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
    `dependency_root=${dependencyRoot}`,
    `temporary_base=${tmpBase()}`,
    `expected_lockfile_sha256=${EXPECTED_LOCK_SHA256}`,
    `dependency_lockfile_sha256=${dependencyLockHash}`,
    `fixed_lockfile_sha256=${fixedLockHash} earlier_lockfile_sha256=${earlierLockHash}`,
    `extracted_lockfiles ${extractedLocks.join(" ")}`,
    `repo_pin=vite build: private node_modules with @repo links to the archive's packages (as verify-packages.mjs), checked through every source map; esbuild: the native runners' exact-export pin and checkout guard`,
  ];
  const checkLines = checks.map(entry => `${entry.ok ? "PASS" : "FAIL"} [${entry.kind}] ${entry.label}${entry.detail ? ` :: ${entry.detail}` : ""}`);
  const body = [...header, ...lines, "## Checks", ...checkLines, `assertions=${totals("assert")} harness=${totals("harness")}`, `exit=${exitCode}`];
  if (existsSync(logPath)) throw Error(`Evidence appeared during the run; refusing to overwrite ${logPath}`);
  writeFileSync(logPath, body.join("\n").trimEnd() + "\n", { flag: "wx" });
  console.log(`delta ${fixed.revision} vs ${earlier.revision}: assertions=${totals("assert")} harness=${totals("harness")} exit=${exitCode}`);
  for (const line of checkLines.filter(line => line.startsWith("FAIL"))) console.log(`  ${line}`);
  console.log(`  log: ${relative(root, logPath)}`);
}
process.exitCode = exitCode;
