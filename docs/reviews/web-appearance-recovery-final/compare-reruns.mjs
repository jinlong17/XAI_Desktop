/**
 * Final-regression rerun comparison for CP-APPEARANCE-01 (control-plane batch 51; contract r3 §14 E7, E8, E16, E17,
 * E25; control plane "低成本重跑": compare the reruns at the final fixed revision case by case with the earlier fixed
 * revision's results, and the E25 rerun with the accepted Features E13 log).
 *
 * Usage (from the repository root): node docs/reviews/web-appearance-recovery-final/compare-reruns.mjs <suffix>
 *
 * Reads only committed or newly written logs under docs/reviews/ (no product code runs). Writes
 * compare-reruns-<suffix>.log beside this file (refusing to overwrite) and exits 1 if any comparison fails; every
 * failure is reported as a fact here and explained in the E27 receipt.
 * - E7: the eight frozen Sol modes and the batch-41 corrected continuity-export copy, case by case (ordered names and
 *   statuses), oracle hash lines, PRECONDITION counts and, for the two adjudicated cases OE-1/OE-2, the first failure
 *   lines; `original` matched by name (the 11 extra cases must be exactly the two new guard test files' cases).
 * - E8: the frozen parent host, case by case.
 * - E16: the 12 frozen F1 invocations, check by check (id, kind, pass), result verdict and outcomes, and bundle hashes.
 * - E17: the K-1 corrected Appearance F1 copy against the frozen-runner `fixed1` logs (the K-1 audit precondition
 *   excluded) and against the K-1 `k1corr1` logs at the earlier revision (full sequences).
 * - E25: the frozen Features downstream runner's refusal, and the E25 copy against the accepted Features E13 log.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

const reviews = fileURLToPath(new URL("../", import.meta.url));
const evidence = fileURLToPath(new URL("./", import.meta.url));
const root = fileURLToPath(new URL("../../../", import.meta.url));
const [suffix, ...extra] = process.argv.slice(2);
if (!suffix || extra.length || !/^[A-Za-z0-9._-]+$/.test(suffix)) throw Error("Usage: node compare-reruns.mjs <suffix>");
// XAI_FINAL_OUTPUT_DIR redirects the output (dry runs only; not evidence).
const output = join(process.env.XAI_FINAL_OUTPUT_DIR ?? evidence, `compare-reruns-${suffix}.log`);
if (existsSync(output)) throw Error(`Evidence exists; use a new suffix: ${output}`);
const FIXED = "419e56d";
const EARLIER = "24073b5";

const read = path => { const full = join(reviews, path); if (!existsSync(full)) throw Error(`Missing log: ${path}`); return readFileSync(full, "utf8").replace(/\u001b\[[0-9;]*m/g, ""); };
const sha = path => createHash("sha256").update(readFileSync(join(reviews, path))).digest("hex");
const exitOf = text => (text.match(/^exit=(\S+)/m) ?? [, "missing"])[1];
const headerLine = (text, key) => (text.match(new RegExp(`^${key}[ =].*$`, "m")) ?? [""])[0];
const caseLines = text => [...text.matchAll(/^case (\d+) (\S+)( PRECONDITION)? \| (.*)$/gm)].map(match => ({ n: match[1], status: match[2], precondition: Boolean(match[3]), name: match[4] }));
const firstOf = (text, n) => { const index = text.indexOf(`\ncase ${n} `); if (index < 0) return ""; const next = text.slice(index + 1).split("\n")[1] ?? ""; return next.startsWith("    first: ") ? next.slice("    first: ".length) : ""; };
const jsonl = path => read(path).split("\n").filter(Boolean).map(line => JSON.parse(line));
const checksOf = records => records.filter(record => record.name === "check").map(record => `${record.id}|${record.kind}|${record.pass}`);

const lines = [];
const failures = [];
const record = (label, ok, facts = []) => {
  lines.push(`${ok ? "MATCH" : "DIFF "} ${label}`);
  for (const fact of facts) lines.push(`      ${fact}`);
  if (!ok) failures.push(label);
};
const facts = (role, path, text) => `${role} ${path} sha256=${sha(path)} exit=${exitOf(text)} ${headerLine(text, "harness_checks")}`;

// ---------------- E7 ----------------
lines.push(`## E7: Sol fixed reruns at ${FIXED} vs ${EARLIER} (fixed1, batch 42)`);
const SOL = "web-appearance-recovery-sol";
for (const mode of ["bytes", "fields", "reset", "queues", "host", "retry-all"]) {
  const freshPath = `${SOL}/${mode}-${suffix}-${FIXED}.log`, basePath = `${SOL}/${mode}-fixed1-${EARLIER}.log`;
  const fresh = read(freshPath), base = read(basePath);
  const a = caseLines(fresh), b = caseLines(base);
  const namesEqual = isDeepStrictEqual(a.map(entry => entry.name), b.map(entry => entry.name));
  const statusesEqual = isDeepStrictEqual(a.map(entry => entry.status), b.map(entry => entry.status));
  const allPass = a.length > 0 && a.every(entry => entry.status === "PASSED");
  const oracleEqual = headerLine(fresh, "oracle_sha256") === headerLine(base, "oracle_sha256") && headerLine(fresh, "oracle_sha256") !== "";
  record(`E7 ${mode}: ${a.filter(entry => entry.status === "PASSED").length}/${a.length} at ${FIXED} vs ${b.filter(entry => entry.status === "PASSED").length}/${b.length} at ${EARLIER}; case by case`, exitOf(fresh) === "0" && namesEqual && statusesEqual && allPass && oracleEqual && a.every(entry => !entry.precondition),
    [facts("fresh", freshPath, fresh), facts("earlier", basePath, base), `ordered names equal=${namesEqual} statuses equal=${statusesEqual} oracle_sha256 line equal=${oracleEqual} PRECONDITION=${a.filter(entry => entry.precondition).length}`]);
}
{
  const freshPath = `${SOL}/continuity-export-${suffix}-${FIXED}.log`, basePath = `${SOL}/continuity-export-fixed1-${EARLIER}.log`;
  const fresh = read(freshPath), base = read(basePath);
  const a = caseLines(fresh), b = caseLines(base);
  const failed = a.filter(entry => entry.status === "FAILED").map(entry => entry.n);
  const firstEqual = ["006", "007"].every(n => firstOf(fresh, n) !== "" && firstOf(fresh, n) === firstOf(base, n));
  const ok = exitOf(fresh) === "1" && isDeepStrictEqual(a.map(entry => entry.name), b.map(entry => entry.name)) && isDeepStrictEqual(a.map(entry => entry.status), b.map(entry => entry.status))
    && isDeepStrictEqual(failed, ["006", "007"]) && firstEqual && headerLine(fresh, "oracle_sha256") === headerLine(base, "oracle_sha256") && a.every(entry => !entry.precondition);
  record(`E7 continuity-export (frozen): ${a.filter(entry => entry.status === "PASSED").length}/${a.length}; failures exactly 006 (OE-1) and 007 (OE-2) with the ${EARLIER} first lines`, ok,
    [facts("fresh", freshPath, fresh), facts("earlier", basePath, base), `failed=${failed.join(",")}`, `006 first: ${firstOf(fresh, "006")}`, `007 first: ${firstOf(fresh, "007")}`, `first lines equal to ${EARLIER}=${firstEqual}`]);
  const correctedPath = `web-appearance-recovery-oracle-erratum/corrected-${suffix}-${FIXED}.log`, correctedBase = `web-appearance-recovery-oracle-erratum/corrected-fixed1-${EARLIER}.log`;
  const corrected = read(correctedPath), correctedEarlier = read(correctedBase);
  const c = caseLines(corrected), d = caseLines(correctedEarlier);
  const adjudicated = a.map((entry, index) => (["006", "007"].includes(entry.n) ? c[index]?.status : entry.status));
  record(`E7 continuity-export (corrected copy, OE ruling): ${c.filter(entry => entry.status === "PASSED").length}/${c.length} at ${FIXED} vs ${d.filter(entry => entry.status === "PASSED").length}/${d.length} at ${EARLIER}; adjudicated 006/007 ${["006", "007"].map(n => c.find(entry => entry.n === n)?.status).join("/")}`,
    exitOf(corrected) === "0" && c.length === 26 && c.every(entry => entry.status === "PASSED") && isDeepStrictEqual(c.map(entry => entry.name), d.map(entry => entry.name)) && isDeepStrictEqual(c.map(entry => entry.name), a.map(entry => entry.name)) && adjudicated.every(status => status === "PASSED"),
    [facts("fresh", correctedPath, corrected), facts("earlier", correctedBase, correctedEarlier), `case names equal to the frozen file's=${isDeepStrictEqual(c.map(entry => entry.name), a.map(entry => entry.name))}; ${headerLine(corrected, "corrected_diff_check").slice(0, 160)}`]);
}
{
  const freshPath = `${SOL}/original-${suffix}-${FIXED}.log`, basePath = `${SOL}/original-fixed1-${EARLIER}.log`;
  const fresh = read(freshPath), base = read(basePath);
  const a = caseLines(fresh), b = caseLines(base);
  const remaining = [...a];
  const missing = [];
  for (const entry of b) { const index = remaining.findIndex(other => other.name === entry.name); if (index < 0) missing.push(entry.name); else remaining.splice(index, 1); }
  // The 11 extra cases must be exactly those of the two guard test files added after the earlier revision.
  const guardTitles = [];
  for (const file of ["AppearancePane.focus-ring.test.tsx", "AppearancePane.selected-focus.test.tsx"]) {
    const text = execFileSync("git", ["show", `${FIXED}:packages/xai-web-settings-appearance/src/__tests__/${file}`], { cwd: root, encoding: "utf8" });
    let describe = "";
    for (const line of text.split("\n")) {
      const d = /^describe\("([^"]+)"/.exec(line);
      if (d) describe = d[1];
      const t = /^\s+it\("([^"]+)"/.exec(line);
      if (t) guardTitles.push(`${describe} ${t[1]}`);
    }
  }
  // `original` names carry the run label ("[appearance-package] …"); the guard tests belong to that run.
  const extraNames = remaining.map(entry => entry.name.replace(/^\[appearance-package\] /, "")).sort();
  const extrasAreGuards = isDeepStrictEqual(extraNames, [...guardTitles].sort());
  record(`E7 original: ${a.filter(entry => entry.status === "PASSED").length}/${a.length} at ${FIXED} vs ${b.length}/${b.length} at ${EARLIER}: all ${b.length} earlier names present${missing.length ? " (MISSING " + missing.length + ")" : ""}; ${remaining.length} extra = the two guard test files' ${guardTitles.length} cases: ${extrasAreGuards}`,
    exitOf(fresh) === "0" && a.every(entry => entry.status === "PASSED") && missing.length === 0 && extrasAreGuards,
    [facts("fresh", freshPath, fresh), facts("earlier", basePath, base), ...remaining.map(entry => `extra ${entry.status} ${entry.name}`)]);
}

// ---------------- E8 ----------------
lines.push(`## E8: parent host at ${FIXED} vs ${EARLIER}`);
{
  const freshPath = `web-appearance-recovery-independent/host-${suffix}-${FIXED}.log`, basePath = `web-appearance-recovery-independent/host-fixed1-${EARLIER}.log`;
  const fresh = read(freshPath), base = read(basePath);
  const a = caseLines(fresh), b = caseLines(base);
  record(`E8 host: ${a.filter(entry => entry.status === "PASSED").length}/${a.length} vs ${b.filter(entry => entry.status === "PASSED").length}/${b.length}; case by case`,
    exitOf(fresh) === "0" && a.length === 33 && isDeepStrictEqual(a.map(entry => `${entry.status} ${entry.name}`), b.map(entry => `${entry.status} ${entry.name}`)),
    [facts("fresh", freshPath, fresh), facts("earlier", basePath, base), `${headerLine(fresh, "runner_sha256") || headerLine(fresh, "oracle_sha256").slice(0, 200)}`]);
}

// ---------------- E16 ----------------
lines.push(`## E16: the 12 frozen F1 invocations at ${FIXED} vs ${EARLIER} (fixed1)`);
const F1 = [
  ...["sticky", "more", "collaborate"].map(mode => ["web-sticky-recovery-f1", mode]),
  ...["selfcheck", "notifications", "date-time", "smart-lists", "header", "pomodoro"].map(mode => ["web-sticky-recovery-f1", mode]),
  ["web-sticky-recovery-f1", "race"],
  ...["selfcheck", "features"].map(mode => ["web-features-recovery-f1", mode]),
];
const outcomeView = outcomes => (outcomes ?? []).map(({ staleCommits, guardVersions, ...rest }) => rest);
// The F1 bundle text carries `../…` module comments whose length depends on the snapshot depth of each run, so a logged
// JS hash is compared through diagnostics/f1-bundle-depth-<suffix>.log: same JS at both revisions at every depth, and
// each logged hash reproduced at the depth of its run.
const depthLog = read(`web-appearance-recovery-final/diagnostics/f1-bundle-depth-${suffix}.log`);
const familyOf = (dir, mode) => (dir === "web-features-recovery-f1" ? "verify-f1-features.mjs" : mode === "race" ? "verify-f1-race.mjs" : ["sticky", "more", "collaborate"].includes(mode) ? "verify-f1.mjs" : "verify-f1-callers.mjs");
const explained = family => { const start = depthLog.indexOf(`## ${family} `); if (start < 0) return "missing"; const verdict = depthLog.slice(start).split("\n").find(line => line.startsWith("  => ")) ?? ""; return verdict.slice(5); };
for (const [dir, mode] of F1) {
  const freshPath = `${dir}/f1-${FIXED}-${mode}-${suffix}.log`, basePath = `${dir}/f1-${EARLIER}-${mode}-fixed1.log`;
  const fresh = jsonl(freshPath), base = jsonl(basePath);
  const a = checksOf(fresh), b = checksOf(base);
  const resultA = fresh.find(item => item.name === "result"), resultB = base.find(item => item.name === "result");
  const baseA = fresh.find(item => item.name === "baseline"), baseB = base.find(item => item.name === "baseline");
  const text = read(freshPath);
  const invalid = (text.match(/Invalid blocker state transition/g) ?? []).length;
  const bundleVerdict = explained(familyOf(dir, mode));
  const ok = resultA?.pass === true && isDeepStrictEqual(a, b) && (resultA.verdict ?? null) === (resultB.verdict ?? null) && isDeepStrictEqual(outcomeView(resultA.outcomes), outcomeView(resultB.outcomes))
    && invalid === 0 && (resultA.runtimeErrors ?? 0) === 0 && bundleVerdict.startsWith("EXPLAINED") && isDeepStrictEqual(baseA?.productHashes, baseB?.productHashes);
  record(`E16 ${dir.replace("web-", "").replace("-recovery-f1", "")} ${mode}: ${a.length} checks vs ${b.length}; sequence equal=${isDeepStrictEqual(a, b)}; verdict ${resultA?.verdict ?? (resultA?.pass ? "pass" : "fail")} vs ${resultB?.verdict ?? (resultB?.pass ? "pass" : "fail")}`, ok,
    [`fresh ${freshPath} sha256=${sha(freshPath)}`, `earlier ${basePath} sha256=${sha(basePath)}`,
      `outcomes equal (staleCommits/guardVersions excluded, as batch 42)=${isDeepStrictEqual(outcomeView(resultA?.outcomes), outcomeView(resultB?.outcomes))}; Invalid-blocker-transition mentions=${invalid}; runtimeErrors=${resultA?.runtimeErrors ?? 0}; deferredFailures=${JSON.stringify(resultA?.deferredFailures ?? [])}`,
      `recorded product file hashes equal=${isDeepStrictEqual(baseA?.productHashes, baseB?.productHashes)} (${Object.keys(baseA?.productHashes ?? {}).length} files); bundle inputs ${JSON.stringify(baseB?.bundleInputs?.total)} -> ${JSON.stringify(baseA?.bundleInputs?.total)}`,
      `logged bundle JS ${baseB?.bundleSha256?.slice(0, 16)} -> ${baseA?.bundleSha256?.slice(0, 16)}, CSS ${baseB?.bundleCssSha256?.slice(0, 16)} -> ${baseA?.bundleCssSha256?.slice(0, 16)}; depth diagnostic for ${familyOf(dir, mode)}: ${bundleVerdict}; runner ${baseA?.runnerSha256?.slice(0, 16) ?? "(in the baseline file hashes)"}`]);
}

// ---------------- E17 ----------------
lines.push(`## E17: Appearance F1 at ${FIXED} through the K-1 corrected copy (no nativeVirtualKeyCode, key audit)`);
const AUDIT = "run:k1-keyboard-trace-contains-only-the-runner-key-presses";
for (const mode of ["selfcheck", "appearance"]) {
  const freshPath = `web-native-keyinput-k1/f1-${FIXED}-${mode}-${suffix}.log`;
  const frozenPath = `web-appearance-recovery-f1/f1-${EARLIER}-${mode}-fixed1.log`;
  const k1Path = `web-native-keyinput-k1/f1-${EARLIER}-${mode}-k1corr1.log`;
  const fresh = jsonl(freshPath), frozen = jsonl(frozenPath), k1 = jsonl(k1Path);
  const a = checksOf(fresh), withoutAudit = a.filter(item => !item.startsWith(`${AUDIT}|`));
  const resultA = fresh.find(item => item.name === "result"), resultK = k1.find(item => item.name === "result"), resultF = frozen.find(item => item.name === "result");
  const audit = fresh.find(item => item.name === "observation" && /k1/.test(JSON.stringify(item).slice(0, 200))) ?? null;
  const baseA = fresh.find(item => item.name === "baseline"), baseF = frozen.find(item => item.name === "baseline");
  const text = read(freshPath);
  const ok = resultA?.pass === true && isDeepStrictEqual(withoutAudit, checksOf(frozen)) && isDeepStrictEqual(a, checksOf(k1)) && a.includes(`${AUDIT}|precondition|true`)
    && (resultA.verdict ?? null) === (resultF.verdict ?? null) && isDeepStrictEqual(outcomeView(resultA.outcomes), outcomeView(resultK.outcomes)) && !text.includes("Invalid blocker state transition") && !text.includes("nativeVirtualKeyCode\":");
  record(`E17 ${mode}: ${a.length} checks (${withoutAudit.length} + K-1 audit); verdict ${resultA?.verdict}; vs frozen fixed1 ${checksOf(frozen).length} checks equal=${isDeepStrictEqual(withoutAudit, checksOf(frozen))}; vs k1corr1 equal=${isDeepStrictEqual(a, checksOf(k1))}`, ok,
    [`fresh ${freshPath} sha256=${sha(freshPath)}`, `frozen ${frozenPath} sha256=${sha(frozenPath)}`, `k1corr1 ${k1Path} sha256=${sha(k1Path)}`,
      `outcomes ${JSON.stringify((resultA?.outcomes ?? []).map(item => `${item.case}:${item.state ?? item.outcome ?? ""}`))}; runtimeErrors=${resultA?.runtimeErrors ?? 0}`,
      `logged bundle JS ${baseF?.bundleSha256?.slice(0, 16)} -> ${baseA?.bundleSha256?.slice(0, 16)}, CSS ${baseF?.bundleCssSha256?.slice(0, 16)} -> ${baseA?.bundleCssSha256?.slice(0, 16)}; depth diagnostic: ${explained("verify-f1-appearance(-k1).mjs")}`,
      `key audit record: ${audit ? JSON.stringify(audit).slice(0, 300) : "see the audit precondition check"}`]);
}

// ---------------- E25 ----------------
lines.push(`## E25: Features native downstream at ${FIXED}`);
{
  const frozenPath = `web-features-recovery-native/native-${FIXED}-${suffix}-downstream.log`;
  const frozen = jsonl(frozenPath);
  const result = frozen.find(item => item.name === "result");
  const checks = frozen.filter(item => item.name === "check");
  const failed = checks.filter(item => !item.pass).map(item => item.id);
  record(`E25 frozen runner (unchanged, 82df2961…/harness 499fca4c…): harness-invalid at exactly the caller-bound precondition baseline:fixed-delta-only-in-features-package, every earlier precondition PASS`,
    result?.harnessValid === false && result?.checkId === "baseline:fixed-delta-only-in-features-package" && isDeepStrictEqual(failed, ["baseline:fixed-delta-only-in-features-package"]) && checks.slice(0, -1).every(item => item.pass),
    [`frozen ${frozenPath} sha256=${sha(frozenPath)}`, `checks ${checks.map(item => `${item.id}=${item.pass}`).join(" ")}`, `fixedDelta recorded=${JSON.stringify(checks.at(-1)?.fixedDelta?.length ?? null)} files`]);
  const copyPath = `web-appearance-recovery-final/native-${FIXED}-${suffix}-downstream.log`, acceptedPath = "web-features-recovery-native/native-5cd63ff-fixed1-downstream.log";
  const copy = jsonl(copyPath), accepted = jsonl(acceptedPath);
  const map = id => (id === "baseline:fixed-delta-is-features-then-appearance-section-11" ? "baseline:fixed-delta-only-in-features-package" : id);
  const a = copy.filter(item => item.name === "check" && item.id !== AUDIT).map(item => `${map(item.id)}|${item.kind}|${item.pass}`);
  const b = checksOf(accepted);
  const resultA = copy.find(item => item.name === "result"), resultB = accepted.find(item => item.name === "result");
  const audit = copy.find(item => item.name === "k1-key-audit");
  const product = copy.filter(item => item.name === "check" && item.kind === "product");
  record(`E25 copy (runner/fixture/prelude byte-identical; harness: one precondition generalized + K-1 audit): ${resultA?.checks} checks, ${resultA?.productChecks} product (accepted ${resultB?.checks}/${resultB?.productChecks}); sequence equal after mapping=${isDeepStrictEqual(a, b)}`,
    resultA?.pass === true && resultA?.harnessValid === true && isDeepStrictEqual(a, b) && product.length === 140 && product.every(item => item.pass) && resultA.runtimeErrors === 0 && resultA.consoleWarnings === 0 && audit?.ok === true
      && (resultA.dialogs ?? []).length === (resultB.dialogs ?? []).length,
    [`copy ${copyPath} sha256=${sha(copyPath)}`, `accepted ${acceptedPath} sha256=${sha(acceptedPath)}`,
      `K-1 audit: pressed=${audit?.pressed?.length} keydowns=${audit?.keydowns} keyups=${audit?.keyups} keypresses=${audit?.keypresses} ok=${audit?.ok}; dialogs ${(resultA?.dialogs ?? []).length} vs ${(resultB?.dialogs ?? []).length}; runtimeErrors=${resultA?.runtimeErrors} consoleWarnings=${resultA?.consoleWarnings}`]);
}

lines.push(`## Summary: ${lines.filter(line => line.startsWith("MATCH")).length} MATCH, ${failures.length} DIFF`);
for (const label of failures) lines.push(`DIFF ${label}`);
writeFileSync(output, `comparison=${suffix}\n${lines.join("\n")}\nexit=${failures.length ? 1 : 0}\n`, { flag: "wx" });
console.log(`compare-reruns ${suffix}: ${lines.filter(line => line.startsWith("MATCH")).length} MATCH, ${failures.length} DIFF; log ${output}`);
for (const label of failures) console.log(`  DIFF ${label}`);
process.exitCode = failures.length ? 1 : 0;
