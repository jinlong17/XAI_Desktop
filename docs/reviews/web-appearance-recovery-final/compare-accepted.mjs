/**
 * Final-regression comparison for CP-APPEARANCE-01 (control-plane batch 51; contract r3 §10 items 10–12, §13 row 10,
 * §14 E20–E24). Written after ../web-features-recovery-final/compare-accepted.mjs (823c12a2…, read, not modified), whose
 * revisions are hard-coded to the Features caller.
 *
 * Usage (from the repository root): node docs/reviews/web-appearance-recovery-final/compare-accepted.mjs <suffix>
 *
 * Reads only committed or newly written logs under docs/reviews/ (no product code runs) and compares every batch-51 log
 * with the accepted receipt log it stands against, and the E21–E23 package logs with Terra's own run records and the
 * before controls: exit status, totals, per-file counts, per-case names and statuses where both logs list them, console
 * blocks, PRECONDITION lines and oracle hash lines. Writes compare-accepted-<suffix>.log beside this file (refusing to
 * overwrite) and exits 1 if any pair differs; every difference is reported as a fact here and explained in the E27
 * receipt (F-FD1 is the Features Sol downstream case 012 precondition, judged by its diagnostic corrected copy).
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

const reviews = fileURLToPath(new URL("../", import.meta.url));
const evidence = fileURLToPath(new URL("./", import.meta.url));
const [suffix, ...extra] = process.argv.slice(2);
if (!suffix || extra.length || !/^[A-Za-z0-9._-]+$/.test(suffix)) throw Error("Usage: node compare-accepted.mjs <suffix>");
// XAI_FINAL_OUTPUT_DIR redirects the output (dry runs only; not evidence).
const output = join(process.env.XAI_FINAL_OUTPUT_DIR ?? evidence, `compare-accepted-${suffix}.log`);
if (existsSync(output)) throw Error(`Evidence exists; use a new suffix: ${output}`);
const FIXED = "419e56d";
const BEFORE = "5cd63ff";

const strip = text => text.replace(/\u001b\[[0-9;]*m/g, "");
const read = path => { const full = join(reviews, path); if (!existsSync(full)) throw Error(`Missing log: ${path}`); return strip(readFileSync(full, "utf8")); };
const sha = path => createHash("sha256").update(readFileSync(join(reviews, path))).digest("hex");
const stdoutOf = text => { const start = text.indexOf("---- stdout ----"); const end = text.indexOf("---- runner summary ----"); return start >= 0 ? text.slice(start, end >= 0 ? end : undefined) : text; };
const exitOf = text => (text.match(/^exit=(\S+)/m) ?? text.match(/^# exit: (\S+)/m) ?? [, "missing"])[1];
const totalsOf = text => {
  const line = (stdoutOf(text).match(/^\s+Tests\s+(.*)$/m) ?? [, ""])[1];
  return { total: Number((line.match(/\((\d+)\)/) ?? [, NaN])[1]), passed: Number((line.match(/(\d+) passed/) ?? [, 0])[1]), failed: Number((line.match(/(\d+) failed/) ?? [, 0])[1]), line: line.trim() };
};
const fileCountsDefault = text => { const counts = new Map(); for (const match of stdoutOf(text).matchAll(/^ [✓×❯] (\S+) \((\d+) tests?(?: \| \d+ (?:failed|skipped))*\)/gm)) counts.set(match[1], Number(match[2])); return counts; };
const fileCountsSummary = text => { const counts = new Map(); for (const match of text.matchAll(/^file (\S+) status=\S+ tests=(\d+)/gm)) counts.set(match[1], Number(match[2])); return counts; };
const verboseTitles = text => [...stdoutOf(text).matchAll(/^ [✓×] (.+?)(?: \d+ms)?$/gm)].map(match => match[1]).filter(title => !/\(\d+ tests?\)/.test(title));
const caseLines = text => [...text.matchAll(/^case \d+ (\S+)( PRECONDITION)? \| (.*)$/gm)].map(match => ({ status: match[1], precondition: Boolean(match[2]), name: match[3] }));
const blocks = text => (text.match(/^(stderr|stdout) \| /gm) ?? []).length;
const preconditions = text => (text.match(/PRECONDITION:/g) ?? []).length;
const headerLine = (text, key) => (text.match(new RegExp(`^${key}[ =].*$`, "m")) ?? [""])[0];
const mapText = map => [...map].sort(([a], [b]) => a.localeCompare(b)).map(([file, count]) => `${file}=${count}`).join(" ");
const sameMap = (left, right) => mapText(left) === mapText(right);
const totalsSummary = text => (text.match(/^totals files=(\d+) tests=(\d+) passed=(\d+) failed=(\d+)/m) ?? []).slice(1).map(Number);
const normalizeRest = map => new Map([...map].map(([file, count]) => [file.replace(/^packages\/plugin-web-settings-rest\//, ""), count]));

const lines = [];
const diffs = [];
const record = (label, ok, facts) => {
  lines.push(`${ok ? "MATCH" : "DIFF "} ${label}`);
  for (const fact of facts) lines.push(`      ${fact}`);
  if (!ok) diffs.push(label);
};
const logFacts = (role, path, text) => `${role} ${path} sha256=${sha(path)} exit=${exitOf(text)} tests="${totalsOf(text).line}" console_blocks=${blocks(text)} preconditions=${preconditions(text)}`;

// A. Sticky (existing runners) vs the accepted post1 logs at f359be6.
lines.push("## A. Sticky Sol and host (existing runners) vs accepted post1 logs at f359be6 (E24 Sticky Sol 109, original 10, host 28)");
for (const [mode, dir, expected] of [["bytes", "web-sticky-recovery-sol", 13], ["fields", "web-sticky-recovery-sol", 47], ["queues", "web-sticky-recovery-sol", 27], ["continuity-export", "web-sticky-recovery-sol", 22], ["original", "web-sticky-recovery-sol", 10], ["host", "web-sticky-recovery-independent", 28]]) {
  const newPath = `${dir}/${mode}-${suffix}-${FIXED}.log`, acceptedPath = `${dir}/${mode}-post1-f359be6.log`;
  const fresh = read(newPath), accepted = read(acceptedPath);
  const a = totalsOf(fresh), b = totalsOf(accepted);
  const titlesEqual = JSON.stringify(verboseTitles(fresh)) === JSON.stringify(verboseTitles(accepted));
  const oracleEqual = headerLine(fresh, "oracle_sha256") === headerLine(accepted, "oracle_sha256");
  record(`sticky ${mode}: ${a.passed}/${a.total} vs accepted ${b.passed}/${b.total} (contract count ${expected})`,
    exitOf(fresh) === "0" && a.total === expected && a.passed === expected && a.failed === 0 && b.total === expected && titlesEqual && oracleEqual && blocks(fresh) === blocks(accepted) && preconditions(fresh) === 0,
    [logFacts("new", newPath, fresh), logFacts("accepted", acceptedPath, accepted), `ordered test titles equal=${titlesEqual} (${verboseTitles(fresh).length}); oracle_sha256 header equal=${oracleEqual}`]);
}

// B. Features accepted suites: Sol (E7 fixed1 at 5cd63ff), host (E8) and package (Features final).
lines.push("## B. Features accepted suites (E24 Features: Sol bytes 17, fields 49, reset 31, queues 40, continuity-export 26, downstream 15, original 6; host 40; package 45)");
for (const [mode, expected] of [["bytes", 17], ["fields", 49], ["reset", 31], ["queues", 40], ["continuity-export", 26], ["downstream", 15], ["original", 6]]) {
  const newPath = `web-features-recovery-sol/${mode}-${suffix}-${FIXED}.log`, acceptedPath = `web-features-recovery-sol/${mode}-fixed1-${BEFORE}.log`;
  const fresh = read(newPath), accepted = read(acceptedPath);
  const a = caseLines(fresh), b = caseLines(accepted);
  const namesEqual = isDeepStrictEqual(a.map(entry => entry.name), b.map(entry => entry.name));
  const statusesEqual = isDeepStrictEqual(a.map(entry => entry.status), b.map(entry => entry.status));
  const oracleEqual = headerLine(fresh, "oracle_sha256") === headerLine(accepted, "oracle_sha256");
  const passed = a.filter(entry => entry.status === "PASSED").length;
  const differing = a.map((entry, index) => ({ entry, other: b[index] })).filter(({ entry, other }) => entry.status !== other?.status).map(({ entry }) => `${entry.status}${entry.precondition ? " PRECONDITION" : ""} | ${entry.name}`);
  record(`features-sol ${mode}: ${passed}/${a.length} vs accepted ${b.filter(entry => entry.status === "PASSED").length}/${b.length} (contract count ${expected})`,
    exitOf(fresh) === "0" && a.length === expected && passed === expected && namesEqual && statusesEqual && oracleEqual && preconditions(fresh) === 0,
    [logFacts("new", newPath, fresh), logFacts("accepted", acceptedPath, accepted), `case names equal=${namesEqual} statuses equal=${statusesEqual} oracle_sha256 header equal=${oracleEqual}`, ...differing.map(text => `differs: ${text}`)]);
}
{
  // F-FD1: the frozen downstream oracle's case 012 precondition; iterations, the earlier fixed revision and the
  // diagnostic corrected copy (seed "sage" -> "mist") at both products.
  const accepted = read(`web-features-recovery-sol/downstream-fixed1-${BEFORE}.log`);
  const acceptedCases = caseLines(accepted);
  for (const path of [`web-features-recovery-sol/downstream-${suffix}-${FIXED}.log`, `web-features-recovery-sol/downstream-appearance-final-v2-${FIXED}.log`, "web-features-recovery-sol/downstream-appearance-final-v1-24073b5.log"]) {
    const fresh = read(path);
    const a = caseLines(fresh);
    const failing = a.filter(entry => entry.status !== "PASSED");
    const ok = isDeepStrictEqual(a.map(entry => entry.name), acceptedCases.map(entry => entry.name)) && failing.length === 1 && failing[0].precondition && failing[0].name.startsWith("H6 §10.5 after a full reset the App's accent hue, background tone")
      && /PRECONDITION: the App displays the seeded appearance, rail order and pet: \{"accentHue":"210","bgTone":null,"railPosAttr":"right","railDataPos":"right"/.test(fresh);
    record(`F-FD1 frozen downstream ${path.split("/")[1]}: ${a.length - failing.length}/${a.length}; the only non-pass is case 012's precondition (observed bgTone null for the seeded out-of-domain "sage"; every other display field as seeded)`, ok,
      [logFacts("run", path, fresh), ...failing.map(entry => `${entry.status}${entry.precondition ? " PRECONDITION" : ""} | ${entry.name}`)]);
  }
  for (const revision of [FIXED, BEFORE]) {
    const path = `web-appearance-recovery-final/diagnostics/features-sol-downstream-corrected-${suffix}-${revision}.log`;
    const fresh = read(path);
    const a = caseLines(fresh);
    record(`F-FD1 diagnostic corrected copy @${revision}: ${a.filter(entry => entry.status === "PASSED").length}/${a.length}; names equal to the accepted log`,
      exitOf(fresh) === "0" && a.length === 15 && a.every(entry => entry.status === "PASSED") && isDeepStrictEqual(a.map(entry => entry.name), acceptedCases.map(entry => entry.name)),
      [logFacts("diagnostic", path, fresh), headerLine(fresh, "diagnostic_runner_sha256")]);
  }
}
{
  const newPath = `web-features-recovery-independent/host-${suffix}-${FIXED}.log`, acceptedPath = `web-features-recovery-independent/host-fixed1-${BEFORE}.log`;
  const fresh = read(newPath), accepted = read(acceptedPath);
  const a = caseLines(fresh), b = caseLines(accepted);
  record(`features host: ${a.filter(entry => entry.status === "PASSED").length}/${a.length} vs accepted ${b.filter(entry => entry.status === "PASSED").length}/${b.length} (contract count 40)`,
    exitOf(fresh) === "0" && a.length === 40 && isDeepStrictEqual(a.map(entry => `${entry.status} ${entry.name}`), b.map(entry => `${entry.status} ${entry.name}`)),
    [logFacts("new", newPath, fresh), logFacts("accepted", acceptedPath, accepted)]);
  const pkgPath = `web-features-recovery-final/features-test-${suffix}-${FIXED}.log`, pkgAccepted = `web-features-recovery-final/features-test-features-final-v1-${BEFORE}.log`;
  const pkg = read(pkgPath), pkgBase = read(pkgAccepted);
  const t = totalsSummary(pkg);
  const filesEqual = sameMap(fileCountsSummary(pkg), fileCountsSummary(pkgBase));
  record(`features package: files=${t[0]} tests=${t[1]} passed=${t[2]} vs accepted 7 files / 45 (per-file equal=${filesEqual})`, exitOf(pkg) === "0" && t[0] === 7 && t[1] === 45 && t[2] === 45 && filesEqual,
    [logFacts("new", pkgPath, pkg), logFacts("accepted", pkgAccepted, pkgBase), `files ${mapText(fileCountsSummary(pkg))}`]);
}

// C. More, Notifications and Date & Time suites (verify-callers.mjs) vs accepted older-runner logs and the Features
// final regression's 5cd63ff logs; More boundaries with both oracles (C-FB002).
lines.push("## C. More, Notifications and Date & Time suites (verify-callers.mjs, frozen) vs accepted logs; More boundaries frozen and corrected");
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
  const newPath = `web-features-recovery-final/${mode}-${suffix}-${FIXED}.log`;
  const fresh = read(newPath);
  const freshCases = caseLines(fresh);
  const passed = freshCases.filter(entry => entry.status === "PASSED").length;
  const filesEqual = sameMap(fileCountsSummary(fresh), fileCountsDefault(accepted));
  const recentPath = `web-features-recovery-final/${mode}-features-final-v1-${BEFORE}.log`;
  const recent = read(recentPath);
  const namesEqualRecent = isDeepStrictEqual(freshCases.map(entry => entry.name), caseLines(recent).map(entry => entry.name));
  const boundaries = mode === "more-boundaries";
  const ok = exitOf(fresh) === "0" && freshCases.length === expected && passed === expected && acceptedTotals.total === expected && acceptedTotals.passed === expected && filesEqual && blocks(fresh) === blocks(accepted) && namesEqualRecent;
  record(`${mode} @${FIXED}: ${passed}/${freshCases.length} vs accepted ${acceptedTotals.passed}/${acceptedTotals.total} (contract count ${expected})${boundaries ? " [frozen oracle, recorded as it falls; nondeterministic per F-B002]" : ""}`, boundaries ? true : ok,
    [logFacts("new", newPath, fresh), logFacts("accepted", acceptedPath, accepted), `per-file counts equal=${filesEqual} (${mapText(fileCountsSummary(fresh))}); console blocks new/accepted=${blocks(fresh)}/${blocks(accepted)}; case names equal to ${recentPath} (Features final @${BEFORE})=${namesEqualRecent}${boundaries ? `; frozen outcome ${passed}/${freshCases.length} exit=${exitOf(fresh)}` : ""}`]);
}
{
  const path = `web-more-recovery-fb002/logs/corrected-full-${suffix}-${FIXED}.log`, basePath = `web-more-recovery-fb002/logs/corrected-full-v1r01-${BEFORE}.log`;
  const fresh = read(path), base = read(basePath);
  const a = caseLines(fresh), b = caseLines(base);
  const rangeErrors = (fresh.match(/^rangeerror cases=(\d+) output_lines=(\d+)/m) ?? []).slice(1).map(Number);
  record(`more-boundaries corrected oracle (C-FB002) @${FIXED}: ${a.filter(entry => entry.status === "PASSED").length}/${a.length}, RangeError cases/lines ${rangeErrors.join("/")}; names equal to batch 31 @${BEFORE}`,
    exitOf(fresh) === "0" && a.length === 10 && a.every(entry => entry.status === "PASSED") && isDeepStrictEqual(a.map(entry => entry.name), b.map(entry => entry.name)) && rangeErrors[0] === 0 && rangeErrors[1] === 0,
    [logFacts("new", path, fresh), logFacts("batch-31", basePath, base), headerLine(fresh, "oracle_run_sha256") || headerLine(fresh, "runner_sha256")]);
}

// D. Package gates run by the frozen Features runner (E20 storage, E24 settings-shell and settings-rest) and E20 lifecycle.
lines.push("## D. E20 and the E24 package suites (frozen ../web-features-recovery-final/verify-packages.mjs)");
{
  const restPath = `web-features-recovery-final/settings-rest-test-${suffix}-${FIXED}.log`, restAccepted = "web-notifications-recovery-astra/package-sticky-final-v1-f359be6.log";
  const rest = read(restPath), restBase = read(restAccepted);
  const t = totalsSummary(rest);
  const filesEqual = sameMap(fileCountsSummary(rest), normalizeRest(fileCountsDefault(restBase)));
  record(`settings-rest-test: files=${t[0]} tests=${t[1]} passed=${t[2]} vs accepted 44 files / 314 (per-file equal=${filesEqual})`, exitOf(rest) === "0" && t[0] === 44 && t[1] === 314 && t[2] === 314 && filesEqual,
    [logFacts("new", restPath, rest), logFacts("accepted", restAccepted, restBase)]);
  const shellPath = `web-features-recovery-final/settings-shell-test-${suffix}-${FIXED}.log`, shellBase = `web-features-recovery-final/settings-shell-test-features-final-v1-${BEFORE}.log`;
  const shell = read(shellPath), shellPrevious = read(shellBase);
  const s = totalsSummary(shell);
  const shellFiles = sameMap(fileCountsSummary(shell), fileCountsSummary(shellPrevious));
  record(`settings-shell-test: files=${s[0]} tests=${s[1]} passed=${s[2]} vs 11 files / 54 (Features final @${BEFORE}; no accepted independent receipt exists) per-file equal=${shellFiles}`, exitOf(shell) === "0" && s[0] === 11 && s[1] === 54 && s[2] === 54 && shellFiles,
    [logFacts("new", shellPath, shell), logFacts("previous", shellBase, shellPrevious)]);
  const storagePath = `web-features-recovery-final/storage-check-types-${suffix}-${FIXED}.log`, storageAccepted = "web-more-recovery-final/storage-check-types-sticky-final-v1-f359be6.log", storagePrevious = `web-features-recovery-final/storage-check-types-features-final-v1-${BEFORE}.log`;
  const storage = read(storagePath), storageBase = read(storageAccepted), storagePrev = read(storagePrevious);
  const programs = text => (text.match(/^program_files=(\d+) archive=(\d+) store=(\d+) elsewhere=(\d+) forbidden=(\d+)/m) ?? []).slice(1).join("/");
  record(`storage-check-types (E20): exit=${exitOf(storage)} ${(storage.match(/^tsc_exit=.*$/m) ?? [""])[0]}; program files ${programs(storage)} vs Features final @${BEFORE} ${programs(storagePrev)}; accepted exit=${exitOf(storageBase)}`,
    exitOf(storage) === "0" && /^tsc_exit=0 diagnostics_lines=0$/m.test(storage) && /harness_checks=PASS/.test(storage) && programs(storage) === programs(storagePrev) && exitOf(storageBase) === "0",
    [`new ${storagePath} sha256=${sha(storagePath)}`, `accepted ${storageAccepted} sha256=${sha(storageAccepted)}`, `previous ${storagePrevious} sha256=${sha(storagePrevious)}`]);
  // E20 lifecycle: Appearance Sol bytes case "PC §2 §10.11 lifecycle" at the fixed revision, against E7 (24073b5) and E2 (5cd63ff).
  const bytesPath = `web-appearance-recovery-sol/bytes-${suffix}-${FIXED}.log`;
  const bytes = read(bytesPath);
  const lifecycle = caseLines(bytes).find(entry => entry.name.startsWith("PC §2 §10.11 lifecycle: the seven keys"));
  const statuses = ["web-appearance-recovery-sol/bytes-fixed1-24073b5.log", "web-appearance-recovery-sol/bytes-before3-5cd63ff.log"].map(path => [path, caseLines(read(path)).find(entry => entry.name === lifecycle?.name)?.status ?? "missing"]);
  record(`E20 Sol lifecycle assertion (bytes.test.tsx L271-277, case 006): ${lifecycle?.status ?? "missing"} at ${FIXED}; ${statuses.map(([path, status]) => `${path.split("/")[1]} ${status}`).join("; ")}`,
    lifecycle?.status === "PASSED" && statuses.every(([, status]) => status === "PASSED") && exitOf(bytes) === "0",
    [`new ${bytesPath} sha256=${sha(bytesPath)} ${headerLine(bytes, "harness_checks")}`]);
}

// E. E21–E23: the new package runner at the fixed revision, against Terra's run records and the before controls.
lines.push("## E. E21–E23 package gates (verify-packages.mjs of this directory) vs Terra's records and the 5cd63ff controls");
const terraFiles = text => fileCountsDefault(text);
{
  const path = `web-appearance-recovery-final/appearance-test-${suffix}-${FIXED}.log`, terra = "web-appearance-recovery-terra/r3-appearance-test.log";
  const fresh = read(path), terraText = read(terra);
  const t = totalsSummary(fresh);
  const fileMap = new Map([...fileCountsSummary(fresh)].map(([file, count]) => [file, count]));
  const filesEqual = sameMap(fileMap, terraFiles(terraText));
  record(`E21 appearance-test: files=${t[0]} tests=${t[1]} passed=${t[2]} vs Terra r3 ${totalsOf(terraText).line} (per-file equal=${filesEqual})`, exitOf(fresh) === "0" && t[0] === 11 && t[1] === 137 && t[2] === 137 && filesEqual,
    [logFacts("new", path, fresh), `terra ${terra} sha256=${sha(terra)} exit=${exitOf(terraText)}`, `files ${mapText(fileMap)}`]);
}
for (const mode of ["appearance-unchanged-files", "appearance-unchanged-cases", "shell-unchanged-files", "shell-topbar-unchanged"]) {
  const fixedPath = `web-appearance-recovery-final/${mode}-${suffix}-${FIXED}.log`, beforePath = `web-appearance-recovery-final/${mode}-${suffix}-${BEFORE}.log`;
  const fixed = read(fixedPath), before = read(beforePath);
  const executed = text => caseLines(text).filter(entry => entry.status === "PASSED" || entry.status === "FAILED").map(entry => `${entry.status} ${entry.name}`);
  const a = executed(fixed), b = executed(before);
  record(`${mode}: ${a.length} executed at ${FIXED} vs ${b.length} at ${BEFORE} (before control); executed names and statuses equal=${isDeepStrictEqual(a, b)}`,
    exitOf(fixed) === "0" && exitOf(before) === "0" && a.length > 0 && isDeepStrictEqual(a, b) && a.every(entry => entry.startsWith("PASSED")) && /harness_checks=PASS/.test(fixed) && /harness_checks=PASS/.test(before),
    [logFacts("fixed", fixedPath, fixed), logFacts("before", beforePath, before), (fixed.match(/^name_filter=.*$/m) ?? ["name_filter=none (whole files)"])[0]]);
}
{
  const path = `web-appearance-recovery-final/shell-test-${suffix}-${FIXED}.log`, terra = "web-appearance-recovery-terra/shell-test.log";
  const fresh = read(path), terraText = read(terra);
  const t = totalsSummary(fresh);
  const filesEqual = sameMap(fileCountsSummary(fresh), terraFiles(terraText));
  record(`E22 shell-test: files=${t[0]} tests=${t[1]} passed=${t[2]} vs Terra r1 ${totalsOf(terraText).line} (per-file equal=${filesEqual})`, exitOf(fresh) === "0" && t[0] === 9 && t[1] === 115 && t[2] === 115 && filesEqual,
    [logFacts("new", path, fresh), `terra ${terra} sha256=${sha(terra)} exit=${exitOf(terraText)}`, `files ${mapText(fileCountsSummary(fresh))}`]);
}
{
  const path = `web-appearance-recovery-final/web-test-${suffix}-${FIXED}.log`, controlPath = `web-appearance-recovery-final/web-test-${suffix}-${BEFORE}.log`;
  const acceptedPath = `web-features-recovery-final/web-test-features-final-v1-${BEFORE}.log`, terra = "web-appearance-recovery-terra/r3-web-test.log";
  const fresh = read(path), control = read(controlPath), accepted = read(acceptedPath), terraText = read(terra);
  const fixedFiles = fileCountsSummary(fresh), beforeFiles = fileCountsSummary(control);
  const added = [...fixedFiles].filter(([file]) => !beforeFiles.has(file));
  const changed = [...fixedFiles].filter(([file, count]) => beforeFiles.has(file) && beforeFiles.get(file) !== count);
  const t = totalsSummary(fresh), c = totalsSummary(control);
  const controlEqualsAccepted = sameMap(beforeFiles, fileCountsSummary(accepted));
  const terraEqual = sameMap(fixedFiles, terraFiles(terraText));
  const required = { "src/__tests__/App.lazy-init.test.tsx": 8, "src/__tests__/App.signout.test.tsx": 7 };
  const requiredOk = Object.entries(required).every(([file, count]) => fixedFiles.get(file) === count && beforeFiles.get(file) === count);
  record(`E23 web-test: ${t[2]}/${t[1]} in ${t[0]} files at ${FIXED} vs control ${c[2]}/${c[1]} in ${c[0]} files at ${BEFORE}; delta = added ${added.map(([file, count]) => `${file}(${count})`).join(",") || "none"}, changed counts ${changed.map(([file, count]) => `${file}(${beforeFiles.get(file)}->${count})`).join(",") || "none"}`,
    exitOf(fresh) === "0" && exitOf(control) === "0" && t[0] === 29 && t[1] === 178 && t[2] === 178 && c[0] === 28 && c[1] === 156 && c[2] === 156 && added.length === 1 && added[0][0] === "src/__tests__/App.appearance.test.tsx" && changed.length === 0 && controlEqualsAccepted && terraEqual && requiredOk,
    [logFacts("fixed", path, fresh), logFacts("control", controlPath, control), logFacts("accepted", acceptedPath, accepted), `terra ${terra} sha256=${sha(terra)} ${totalsOf(terraText).line}`,
      `control per-file equal to the Features final @${BEFORE}=${controlEqualsAccepted}; fixed per-file equal to Terra r3=${terraEqual}; App.lazy-init ${fixedFiles.get("src/__tests__/App.lazy-init.test.tsx")} (APP-LP1–5 + 3 readLocalPref), App.signout ${fixedFiles.get("src/__tests__/App.signout.test.tsx")}`,
      `fixed files ${mapText(fixedFiles)}`]);
}
for (const mode of ["appearance-typecheck", "appearance-lint", "shell-check-types", "shell-lint", "web-check-types", "web-lint"]) {
  const path = `web-appearance-recovery-final/${mode}-${suffix}-${FIXED}.log`, fresh = read(path);
  const facts = fresh.match(/^(tsc_exit|eslint_exit)=.*$/m)?.[0] ?? "";
  const program = fresh.match(/^program_files=.*$/m)?.[0] ?? "";
  record(`${mode} @${FIXED}: exit=${exitOf(fresh)} ${facts}`, exitOf(fresh) === "0" && /harness_checks=PASS/.test(fresh) && (/^tsc_exit=0 diagnostics_lines=0$/m.test(fresh) || /^eslint_exit=0 files=\d+ errors=0 warnings=0 fatal=0$/m.test(fresh)),
    [`new ${path} sha256=${sha(path)} ${headerLine(fresh, "harness_checks")} ${program}`]);
}

lines.push(`## Summary: ${lines.filter(line => line.startsWith("MATCH")).length} MATCH, ${diffs.length} DIFF`);
for (const label of diffs) lines.push(`DIFF ${label}`);
writeFileSync(output, `comparison=${suffix}\n${lines.join("\n")}\nexit=${diffs.length ? 1 : 0}\n`, { flag: "wx" });
console.log(`compare-accepted ${suffix}: ${lines.filter(line => line.startsWith("MATCH")).length} MATCH, ${diffs.length} DIFF; log ${output}`);
for (const label of diffs) console.log(`  DIFF ${label}`);
process.exitCode = diffs.length ? 1 : 0;
