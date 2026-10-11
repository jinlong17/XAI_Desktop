/**
 * Final-regression comparison for CP-FEATURES-01 (control-plane batch 30; contract §13 row 8, §14 E21–E24).
 *
 * Usage (from the repository root): node docs/reviews/web-features-recovery-final/compare-accepted.mjs <suffix>
 *
 * Reads only committed or newly written logs under docs/reviews/ (no product code runs) and compares every batch-30
 * log with the accepted receipt log it stands against: exit status, totals, per-file test counts, per-test titles
 * where both logs list them, stderr/stdout console blocks, PRECONDITION lines and oracle/runner hash lines.
 * Writes compare-accepted-<suffix>.log beside this file (refusing to overwrite) and exits 1 if any pair differs;
 * differences are reported as facts here and explained in the E25 receipt.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const reviews = fileURLToPath(new URL("../", import.meta.url));
const evidence = fileURLToPath(new URL("./", import.meta.url));
const [suffix, ...extra] = process.argv.slice(2);
if (!suffix || extra.length || !/^[A-Za-z0-9._-]+$/.test(suffix)) throw Error("Usage: node compare-accepted.mjs <suffix>");
const output = join(evidence, `compare-accepted-${suffix}.log`);
if (existsSync(output)) throw Error(`Evidence exists; use a new suffix: ${output}`);

const strip = text => text.replace(/\u001b\[[0-9;]*m/g, "");
const read = path => { const full = join(reviews, path); if (!existsSync(full)) throw Error(`Missing log: ${path}`); return strip(readFileSync(full, "utf8")); };
const sha = path => createHash("sha256").update(readFileSync(join(reviews, path))).digest("hex");
const stdoutOf = text => { const start = text.indexOf("---- stdout ----"); const end = text.indexOf("---- runner summary ----"); return start >= 0 ? text.slice(start, end >= 0 ? end : undefined) : text; };
const exitOf = text => (text.match(/^exit=(\S+)/m) ?? [, "missing"])[1];
const totalsOf = text => {
  const line = (stdoutOf(text).match(/^\s+Tests\s+(.*)$/m) ?? [, ""])[1];
  const total = Number((line.match(/\((\d+)\)/) ?? [, NaN])[1]);
  const passed = Number((line.match(/(\d+) passed/) ?? [, 0])[1]);
  const failed = Number((line.match(/(\d+) failed/) ?? [, 0])[1]);
  return { total, passed, failed, line: line.trim() };
};
const fileCountsDefault = text => {
  const counts = new Map();
  for (const match of stdoutOf(text).matchAll(/^ [✓×❯] (\S+) \((\d+) tests?(?: \| \d+ failed)?\)/gm)) counts.set(match[1], Number(match[2]));
  return counts;
};
const fileCountsSummary = text => {
  const counts = new Map();
  for (const match of text.matchAll(/^file (\S+) status=\S+ tests=(\d+)/gm)) counts.set(match[1], Number(match[2]));
  return counts;
};
const verboseTitles = text => [...stdoutOf(text).matchAll(/^ [✓×] (.+?)(?: \d+ms)?$/gm)].map(match => match[1]).filter(title => !/\(\d+ tests?\)/.test(title));
const caseLines = text => [...text.matchAll(/^case \d+ (\S+)(?: PRECONDITION)? \| (.*)$/gm)].map(match => ({ status: match[1], name: match[2] }));
const blocks = text => (text.match(/^(stderr|stdout) \| /gm) ?? []).length;
const preconditions = text => (text.match(/PRECONDITION:/g) ?? []).length;
const headerLine = (text, key) => (text.match(new RegExp(`^${key}[ =].*$`, "m")) ?? [""])[0];
const mapText = map => [...map].sort(([a], [b]) => a.localeCompare(b)).map(([file, count]) => `${file}=${count}`).join(" ");
const sameMap = (left, right) => mapText(left) === mapText(right);
const normalizeRest = map => new Map([...map].map(([file, count]) => [file.replace(/^packages\/plugin-web-settings-rest\//, ""), count]));

const lines = [];
const diffs = [];
const record = (label, ok, facts) => {
  lines.push(`${ok ? "MATCH" : "DIFF "} ${label}`);
  for (const fact of facts) lines.push(`      ${fact}`);
  if (!ok) diffs.push(label);
};
const logFacts = (role, path, text) => `${role} ${path} sha256=${sha(path)} exit=${exitOf(text)} tests="${totalsOf(text).line}" console_blocks=${blocks(text)} preconditions=${preconditions(text)}`;

// A. Accepted Sticky suites, same runner as the accepted post1 logs (verbose titles comparable).
lines.push("## A. Sticky Sol and host (existing runners) vs accepted post1 logs at f359be6");
for (const [mode, dir, expected] of [["bytes", "web-sticky-recovery-sol", 13], ["fields", "web-sticky-recovery-sol", 47], ["queues", "web-sticky-recovery-sol", 27], ["continuity-export", "web-sticky-recovery-sol", 22], ["original", "web-sticky-recovery-sol", 10], ["host", "web-sticky-recovery-independent", 28]]) {
  const newPath = `${dir}/${mode}-${suffix}-5cd63ff.log`, acceptedPath = `${dir}/${mode}-post1-f359be6.log`;
  const fresh = read(newPath), accepted = read(acceptedPath);
  const a = totalsOf(fresh), b = totalsOf(accepted);
  const titlesEqual = JSON.stringify(verboseTitles(fresh)) === JSON.stringify(verboseTitles(accepted));
  const oracleEqual = headerLine(fresh, "oracle_sha256") === headerLine(accepted, "oracle_sha256");
  const ok = exitOf(fresh) === "0" && a.total === expected && a.passed === expected && a.failed === 0 && b.total === expected && titlesEqual && oracleEqual && blocks(fresh) === blocks(accepted) && preconditions(fresh) === 0;
  record(`sticky ${mode}: ${a.passed}/${a.total} vs accepted ${b.passed}/${b.total} (contract count ${expected})`, ok,
    [logFacts("new", newPath, fresh), logFacts("accepted", acceptedPath, accepted), `ordered test titles equal=${titlesEqual} (${verboseTitles(fresh).length}); oracle_sha256 header equal=${oracleEqual}`]);
}

// B. Features Sol bytes (E20 lifecycle assertion) vs the E7 fixed1 log and the E2 before2 log, same runner.
lines.push("## B. Features Sol bytes (E20) vs E7 fixed1 and E2 before2");
{
  const newPath = `web-features-recovery-sol/bytes-${suffix}-5cd63ff.log`;
  const fresh = read(newPath);
  for (const acceptedPath of ["web-features-recovery-sol/bytes-fixed1-5cd63ff.log", "web-features-recovery-sol/bytes-before2-f359be6.log"]) {
    const accepted = read(acceptedPath);
    const freshCases = caseLines(fresh), acceptedCases = caseLines(accepted);
    const namesEqual = JSON.stringify(freshCases.map(entry => entry.name)) === JSON.stringify(acceptedCases.map(entry => entry.name));
    const statusesEqual = JSON.stringify(freshCases.map(entry => entry.status)) === JSON.stringify(acceptedCases.map(entry => entry.status));
    const lifecycle = freshCases.find(entry => entry.name.startsWith("PC §2 §10.11 the 8 keys"));
    const oracleEqual = headerLine(fresh, "oracle_sha256") === headerLine(accepted, "oracle_sha256");
    const ok = exitOf(fresh) === "0" && namesEqual && statusesEqual && oracleEqual && lifecycle?.status === "PASSED" && preconditions(fresh) === 0;
    record(`features-sol bytes: ${freshCases.filter(entry => entry.status === "PASSED").length}/${freshCases.length} vs ${acceptedPath.split("/")[1]} ${acceptedCases.filter(entry => entry.status === "PASSED").length}/${acceptedCases.length}; lifecycle case (bytes.test.tsx L174-191, assertions L186-187) ${lifecycle?.status ?? "missing"}`, ok,
      [logFacts("new", newPath, fresh), logFacts("accepted", acceptedPath, accepted), `case names equal=${namesEqual} statuses equal=${statusesEqual} oracle_sha256 header equal=${oracleEqual}`]);
  }
}

// C. Accepted-caller suites re-hosted by verify-callers.mjs vs the accepted logs of the older runners.
lines.push("## C. More, Notifications and Date & Time suites (verify-callers.mjs) vs accepted older-runner logs");
const callerPairs = [
  ["more-fields", "web-more-recovery-sol/fields", 22], ["more-reset", "web-more-recovery-sol/reset", 20], ["more-queues", "web-more-recovery-sol/queues", 14],
  ["more-boundaries", "web-more-recovery-sol/boundaries", 10], ["more-owner-export", "web-more-recovery-sol/owner-export", 13], ["more-original", "web-more-recovery-sol/original", 15],
  ["more-host", "web-more-recovery-independent/host", 11],
  ["notifications-core", "web-notifications-recovery-sol/core", 11], ["notifications-recovery", "web-notifications-recovery-sol/recovery", 3], ["notifications-operations", "web-notifications-recovery-sol/operations", 2],
  ["notifications-boundaries", "web-notifications-recovery-sol/boundaries", 4], ["notifications-extended", "web-notifications-recovery-sol/extended", 10], ["notifications-original", "web-notifications-recovery-sol/original", 11],
  ["notifications-astra-boundaries", "web-notifications-recovery-astra/boundaries", 24], ["notifications-astra-host", "web-notifications-recovery-astra/host", 15],
  ["notifications-parent-host", "web-notifications-recovery-independent/host", 12], ["datetime", "web-notifications-recovery-astra/datetime", 7],
];
for (const [mode, acceptedBase, expected] of callerPairs) {
  const acceptedPath = `${acceptedBase}-sticky-final-v1-f359be6.log`;
  const accepted = read(acceptedPath);
  const acceptedTotals = totalsOf(accepted);
  const acceptedFiles = fileCountsDefault(accepted);
  // The primary run plus any diagnostic iteration (features-final-v2, -v3) that exists for this suite.
  const iterations = [suffix, ...["features-final-v2", "features-final-v3"].filter(iteration => iteration !== suffix)];
  for (const iteration of iterations) {
    for (const revision of ["5cd63ff", "f359be6"]) {
      const newPath = `web-features-recovery-final/${mode}-${iteration}-${revision}.log`;
      if (!existsSync(join(reviews, newPath))) continue;
      const fresh = read(newPath);
      const freshCases = caseLines(fresh);
      const passed = freshCases.filter(entry => entry.status === "PASSED").length;
      const filesEqual = sameMap(fileCountsSummary(fresh), acceptedFiles);
      const ok = exitOf(fresh) === "0" && freshCases.length === expected && passed === expected && acceptedTotals.total === expected && acceptedTotals.passed === expected && filesEqual && blocks(fresh) === blocks(accepted);
      const failedNames = freshCases.filter(entry => entry.status === "FAILED").map(entry => entry.name);
      const firstFailure = (fresh.match(/^ {4}first: (.*)$/m) ?? [, ""])[1];
      record(`${mode} ${iteration} @${revision}: ${passed}/${freshCases.length} vs accepted ${acceptedTotals.passed}/${acceptedTotals.total} (contract count ${expected})`, ok,
        [logFacts("new", newPath, fresh), logFacts("accepted", acceptedPath, accepted), `per-file counts equal=${filesEqual} (${mapText(fileCountsSummary(fresh))}); console blocks new/accepted=${blocks(fresh)}/${blocks(accepted)}${failedNames.length ? `; FAILED: ${failedNames.join(" ; ")}; first: ${firstFailure}` : ""}`]);
    }
  }
}

// D. Package gates (verify-packages.mjs) vs the accepted package receipts and the before controls.
lines.push("## D. Package gates (verify-packages.mjs)");
{
  const acceptedWeb = "web-more-recovery-final/web-test-sticky-final-v1-f359be6.log";
  const webAccepted = read(acceptedWeb);
  for (const revision of ["5cd63ff", "f359be6"]) {
    const path = `web-features-recovery-final/web-test-${suffix}-${revision}.log`, fresh = read(path);
    const filesEqual = sameMap(fileCountsSummary(fresh), fileCountsDefault(webAccepted));
    const totals = (fresh.match(/^totals files=(\d+) tests=(\d+) passed=(\d+) failed=(\d+)/m) ?? []).slice(1).map(Number);
    record(`web-test @${revision}: files=${totals[0]} tests=${totals[1]} passed=${totals[2]} vs accepted 28 files / 156`, exitOf(fresh) === "0" && totals[0] === 28 && totals[1] === 156 && totals[2] === 156 && filesEqual,
      [logFacts("new", path, fresh), logFacts("accepted", acceptedWeb, webAccepted), `per-file counts equal=${filesEqual}`]);
  }
  const acceptedRest = "web-notifications-recovery-astra/package-sticky-final-v1-f359be6.log";
  const restAccepted = read(acceptedRest);
  for (const revision of ["5cd63ff", "f359be6"]) {
    const path = `web-features-recovery-final/settings-rest-test-${suffix}-${revision}.log`, fresh = read(path);
    const filesEqual = sameMap(fileCountsSummary(fresh), normalizeRest(fileCountsDefault(restAccepted)));
    const totals = (fresh.match(/^totals files=(\d+) tests=(\d+) passed=(\d+) failed=(\d+)/m) ?? []).slice(1).map(Number);
    record(`settings-rest-test @${revision}: files=${totals[0]} tests=${totals[1]} passed=${totals[2]} vs accepted 44 files / 314`, exitOf(fresh) === "0" && totals[0] === 44 && totals[1] === 314 && totals[2] === 314 && filesEqual,
      [logFacts("new", path, fresh), logFacts("accepted", acceptedRest, restAccepted), `per-file counts equal=${filesEqual}`]);
  }
  for (const [mode, acceptedPath] of [["storage-check-types", "web-more-recovery-final/storage-check-types-sticky-final-v1-f359be6.log"], ["web-check-types", "web-more-recovery-final/web-check-types-sticky-final-v1-f359be6.log"], ["web-lint", "web-more-recovery-final/web-lint-sticky-final-v1-f359be6.log"]]) {
    const accepted = read(acceptedPath);
    for (const revision of ["5cd63ff", "f359be6"]) {
      const path = `web-features-recovery-final/${mode}-${suffix}-${revision}.log`, fresh = read(path);
      const facts = fresh.match(/^(tsc_exit|eslint_exit)=.*$/m)?.[0] ?? "";
      record(`${mode} @${revision}: exit=${exitOf(fresh)} vs accepted exit=${exitOf(accepted)}`, exitOf(fresh) === "0" && exitOf(accepted) === "0" && /harness_checks=PASS/.test(fresh),
        [`new ${path} sha256=${sha(path)} ${facts} ${headerLine(fresh, "harness_checks")}`, `accepted ${acceptedPath} sha256=${sha(acceptedPath)} exit=${exitOf(accepted)}`]);
    }
  }
  // Features package: fixed vs before control, readers vs the Sol reader logs, typecheck and lint.
  const featuresFixed = read(`web-features-recovery-final/features-test-${suffix}-5cd63ff.log`), featuresBefore = read(`web-features-recovery-final/features-test-${suffix}-f359be6.log`);
  const fixedFiles = fileCountsSummary(featuresFixed), beforeFiles = fileCountsSummary(featuresBefore);
  const added = [...fixedFiles].filter(([file]) => !beforeFiles.has(file));
  const changed = [...fixedFiles].filter(([file, count]) => beforeFiles.has(file) && beforeFiles.get(file) !== count);
  const fixedTotals = (featuresFixed.match(/^totals files=(\d+) tests=(\d+) passed=(\d+)/m) ?? []).slice(1).map(Number);
  const beforeTotals = (featuresBefore.match(/^totals files=(\d+) tests=(\d+) passed=(\d+)/m) ?? []).slice(1).map(Number);
  record(`features-test: @5cd63ff ${fixedTotals[2]}/${fixedTotals[1]} in ${fixedTotals[0]} files (Terra commit message: 45/45) vs @f359be6 ${beforeTotals[2]}/${beforeTotals[1]} in ${beforeTotals[0]} files; delta = added files ${added.map(([file, count]) => `${file}(${count})`).join(",") || "none"}, changed counts ${changed.map(([file, count]) => `${file}(${beforeFiles.get(file)}->${count})`).join(",") || "none"}`,
    exitOf(featuresFixed) === "0" && exitOf(featuresBefore) === "0" && fixedTotals[1] === 45 && fixedTotals[2] === 45 && added.length === 1 && added[0][0] === "src/__tests__/FeaturesPaneRecovery.test.tsx" && changed.length === 0,
    [logFacts("fixed", "web-features-recovery-final/features-test-" + suffix + "-5cd63ff.log", featuresFixed), logFacts("before", "web-features-recovery-final/features-test-" + suffix + "-f359be6.log", featuresBefore), `fixed files ${mapText(fixedFiles)}`, `before files ${mapText(beforeFiles)}`]);
  const readerTitles = text => caseLines(text.replace(/^case (\d+) (\S+) \| \S+ > /gm, "case $1 $2 | ")).map(entry => `${entry.status} ${entry.name}`);
  const solReaderTitles = text => caseLines(text).map(entry => `${entry.status} ${entry.name}`);
  for (const [revision, solPath] of [["5cd63ff", "web-features-recovery-sol/readers-features-fixed1-5cd63ff.log"], ["f359be6", "web-features-recovery-sol/readers-features-before2-f359be6.log"]]) {
    const path = `web-features-recovery-final/features-readers-${suffix}-${revision}.log`, fresh = read(path), sol = read(solPath);
    const freshSet = [...readerTitles(fresh)].sort(), solSet = [...solReaderTitles(sol)].sort();
    record(`features-readers @${revision}: ${freshSet.filter(title => title.startsWith("PASSED")).length}/${freshSet.length} (package config) vs Sol readers-features ${solSet.filter(title => title.startsWith("PASSED")).length}/${solSet.length}`,
      exitOf(fresh) === "0" && freshSet.length === 17 && JSON.stringify(freshSet) === JSON.stringify(solSet),
      [logFacts("new", path, fresh), logFacts("sol", solPath, sol), `status+title multiset equal=${JSON.stringify(freshSet) === JSON.stringify(solSet)}`]);
  }
  for (const mode of ["features-typecheck", "features-lint", "settings-shell-test"]) {
    for (const revision of ["5cd63ff", "f359be6"]) {
      const path = `web-features-recovery-final/${mode}-${suffix}-${revision}.log`, fresh = read(path);
      const facts = fresh.match(/^(tsc_exit|eslint_exit|totals files)=?.*$/m)?.[0] ?? "";
      record(`${mode} @${revision}: exit=${exitOf(fresh)}`, exitOf(fresh) === "0" && /harness_checks=PASS/.test(fresh), [`new ${path} sha256=${sha(path)} ${facts} ${headerLine(fresh, "harness_checks")}`]);
    }
  }
  const shellFixed = fileCountsSummary(read(`web-features-recovery-final/settings-shell-test-${suffix}-5cd63ff.log`));
  const shellBefore = fileCountsSummary(read(`web-features-recovery-final/settings-shell-test-${suffix}-f359be6.log`));
  record(`settings-shell-test per-file counts @5cd63ff equal @f359be6 (no accepted independent receipt exists; historical author report 11 files / 54 tests)`, sameMap(shellFixed, shellBefore), [`5cd63ff ${mapText(shellFixed)}`, `f359be6 ${mapText(shellBefore)}`]);
}

lines.push(`## Summary: ${lines.filter(line => line.startsWith("MATCH")).length} MATCH, ${diffs.length} DIFF`);
for (const label of diffs) lines.push(`DIFF ${label}`);
writeFileSync(output, `comparison=${suffix}\n${lines.join("\n")}\nexit=${diffs.length ? 1 : 0}\n`, { flag: "wx" });
console.log(`compare-accepted ${suffix}: ${lines.filter(line => line.startsWith("MATCH")).length} MATCH, ${diffs.length} DIFF; log ${output}`);
for (const label of diffs) console.log(`  DIFF ${label}`);
process.exitCode = diffs.length ? 1 : 0;
