/**
 * Final-regression comparison for CP-APPRAIL-01 (control-plane batch 64; contract r1 §10 items 10–12, §13 prediction
 * table, §15 E20–E24). Written after ../web-appearance-recovery-final/compare-accepted.mjs (b411eb3d…) and
 * compare-reruns.mjs (60d2c440…), both read, not modified; their revisions and pairs are Appearance-specific.
 *
 * Usage (from the repository root): node docs/reviews/web-apprail-order-recovery-final/compare-accepted.mjs <suffix>
 *
 * Reads only committed or newly written logs under docs/reviews/ (no product code runs). It compares every batch-64
 * log with the accepted log it stands against — for the accepted-caller suites, the accepted Appearance final
 * regression's `appearance-final-v1` logs at 419e56d (Appearance acceptance a560863), or the caller's own accepted
 * receipt log where that final did not run the suite — and the E21/E22 package logs with Terra's run record and the
 * 419e56d before controls: exit status, totals, per-file counts, per-case names and statuses where both logs list
 * them, PRECONDITION lines and oracle hash lines. The frozen originals beside judging copies are checked against the
 * contract §13 predictions, not against "all pass". Writes compare-accepted-<suffix>.log beside this file (refusing to
 * overwrite) and exits 1 if any pair differs.
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
const output = join(process.env.XAI_FINAL_OUTPUT_DIR ?? evidence, `compare-accepted-${suffix}.log`);
if (existsSync(output)) throw Error(`Evidence exists; use a new suffix: ${output}`);
const FIXED = "f9eb4b1";
const BEFORE = "419e56d";
const ACC = "appearance-final-v1";
const FIN = "web-apprail-order-recovery-final";

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
const preconditions = text => (text.match(/PRECONDITION:/g) ?? []).length;
const headerLine = (text, key) => (text.match(new RegExp(`^${key}[ =].*$`, "m")) ?? [""])[0];
const mapText = map => [...map].sort(([a], [b]) => a.localeCompare(b)).map(([file, count]) => `${file}=${count}`).join(" ");
const sameMap = (left, right) => mapText(left) === mapText(right);
const totalsSummary = text => (text.match(/^totals files=(\d+) tests=(\d+) passed=(\d+) failed=(\d+)/m) ?? []).slice(1).map(Number);
const passedOf = cases => cases.filter(entry => entry.status === "PASSED").length;
const jsonl = path => read(path).split("\n").filter(Boolean).map(line => JSON.parse(line));

const lines = [];
const diffs = [];
const record = (label, ok, facts) => {
  lines.push(`${ok ? "MATCH" : "DIFF "} ${label}`);
  for (const fact of facts) lines.push(`      ${fact}`);
  if (!ok) diffs.push(label);
};
const logFacts = (role, path, text) => `${role} ${path} sha256=${sha(path)} exit=${exitOf(text)} tests="${totalsOf(text).line}" preconditions=${preconditions(text)}`;
const sameCases = (fresh, accepted) => isDeepStrictEqual(caseLines(fresh).map(entry => `${entry.status}${entry.precondition ? " PRECONDITION" : ""} | ${entry.name}`), caseLines(accepted).map(entry => `${entry.status}${entry.precondition ? " PRECONDITION" : ""} | ${entry.name}`));
const caseDiff = (fresh, accepted) => {
  const a = caseLines(fresh), b = caseLines(accepted);
  return a.map((entry, index) => ({ entry, other: b[index] })).filter(({ entry, other }) => entry.name !== other?.name || entry.status !== other?.status || entry.precondition !== other?.precondition)
    .map(({ entry, other }) => `differs: new ${entry.status}${entry.precondition ? " PRECONDITION" : ""} | ${entry.name} ; accepted ${other ? `${other.status}${other.precondition ? " PRECONDITION" : ""} | ${other.name}` : "absent"}`);
};

// ---------- A. E21 / E22 / §10 item 10 package gates ----------
lines.push(`## A. E21–E22 package gates (${FIN}/verify-packages.mjs) vs Terra's run record and the ${BEFORE} before controls`);
{
  const path = `${FIN}/shell-test-${suffix}-${FIXED}.log`, terra = "web-apprail-order-recovery-terra/shell-test-f9eb4b1.log", prev = `web-appearance-recovery-final/shell-test-${ACC}-${BEFORE}.log`;
  const fresh = read(path), terraText = read(terra), prevText = read(prev);
  const t = totalsSummary(fresh);
  const files = fileCountsSummary(fresh), prevFiles = fileCountsSummary(prevText);
  const filesEqual = sameMap(files, fileCountsDefault(terraText));
  const added = [...files].filter(([file]) => !prevFiles.has(file)).map(([file, count]) => `${file}(${count})`);
  const changed = [...files].filter(([file, count]) => prevFiles.has(file) && prevFiles.get(file) !== count).map(([file, count]) => `${file}(${prevFiles.get(file)}->${count})`);
  record(`E21 shell-test @${FIXED}: files=${t[0]} tests=${t[1]} passed=${t[2]} vs Terra ${totalsOf(terraText).line} (per-file equal=${filesEqual}); vs accepted Appearance final @${BEFORE} 9/115: added ${added.join(",")}; changed ${changed.join(",") || "none"}`,
    exitOf(fresh) === "0" && t[0] === 12 && t[1] === 205 && t[2] === 205 && filesEqual && changed.length === 1 && changed[0] === "src/__tests__/Topbar.test.tsx(24->26)" && added.length === 3,
    [logFacts("new", path, fresh), `terra ${terra} sha256=${sha(terra)}`, logFacts("accepted", prev, prevText), `files ${mapText(files)}`]);
}
for (const [mode, expected, prevMode] of [["shell-unchanged-files", 91, "shell-unchanged-files"], ["shell-topbar-unchanged", 24, null], ["web-unchanged-files", 118, null], ["storage-unchanged", 31, null]]) {
  const fixedPath = `${FIN}/${mode}-${suffix}-${FIXED}.log`, beforePath = `${FIN}/${mode}-${suffix}-${BEFORE}.log`;
  const fixed = read(fixedPath), before = read(beforePath);
  const executed = text => caseLines(text).filter(entry => entry.status === "PASSED" || entry.status === "FAILED").map(entry => `${entry.status} ${entry.name}`);
  const a = executed(fixed), b = executed(before);
  const facts = [logFacts("fixed", fixedPath, fixed), logFacts("before", beforePath, before), (fixed.match(/^name_filter=.*$/m) ?? ["name_filter=none (whole files)"])[0]];
  let prevOk = true;
  if (prevMode) {
    const prevPath = `web-appearance-recovery-final/${prevMode}-${ACC}-${BEFORE}.log`, prevText = read(prevPath);
    prevOk = isDeepStrictEqual(executed(prevText), b);
    facts.push(`${logFacts("accepted Appearance final", prevPath, prevText)} executed names equal to this ${BEFORE} control=${prevOk}`);
  }
  record(`${mode}: ${a.length} executed at ${FIXED} vs ${b.length} at ${BEFORE} (before control); executed names and statuses equal=${isDeepStrictEqual(a, b)}`,
    exitOf(fixed) === "0" && exitOf(before) === "0" && a.length === expected && isDeepStrictEqual(a, b) && a.every(entry => entry.startsWith("PASSED")) && /harness_checks=PASS/.test(fixed) && /harness_checks=PASS/.test(before) && prevOk,
    facts);
}
{
  const path = `${FIN}/web-test-${suffix}-${FIXED}.log`, controlPath = `${FIN}/web-test-${suffix}-${BEFORE}.log`;
  const acceptedPath = `web-appearance-recovery-final/web-test-${ACC}-${BEFORE}.log`, terra = "web-apprail-order-recovery-terra/web-test-f9eb4b1.log";
  const fresh = read(path), control = read(controlPath), accepted = read(acceptedPath), terraText = read(terra);
  const fixedFiles = fileCountsSummary(fresh), beforeFiles = fileCountsSummary(control);
  const added = [...fixedFiles].filter(([file]) => !beforeFiles.has(file));
  const changed = [...fixedFiles].filter(([file, count]) => beforeFiles.has(file) && beforeFiles.get(file) !== count);
  const t = totalsSummary(fresh), c = totalsSummary(control);
  const controlEqualsAccepted = sameMap(beforeFiles, fileCountsSummary(accepted));
  const terraEqual = sameMap(fixedFiles, fileCountsDefault(terraText));
  record(`E22 web-test: ${t[2]}/${t[1]} in ${t[0]} files at ${FIXED} vs control ${c[2]}/${c[1]} in ${c[0]} files at ${BEFORE}; delta = added ${added.map(([file, count]) => `${file}(${count})`).join(",") || "none"}, changed counts ${changed.map(([file, count]) => `${file}(${beforeFiles.get(file)}->${count})`).join(",") || "none"}`,
    exitOf(fresh) === "0" && exitOf(control) === "0" && t[0] === 30 && t[1] === 196 && t[2] === 196 && c[0] === 29 && c[1] === 178 && c[2] === 178 && added.length === 1 && added[0][0] === "src/__tests__/App.railorder.test.tsx" && added[0][1] === 18 && changed.length === 0 && controlEqualsAccepted && terraEqual,
    [logFacts("fixed", path, fresh), logFacts("control", controlPath, control), logFacts("accepted Appearance final", acceptedPath, accepted), `terra ${terra} sha256=${sha(terra)} ${totalsOf(terraText).line}`,
      `control per-file equal to the accepted Appearance final @${BEFORE}=${controlEqualsAccepted}; fixed per-file equal to Terra=${terraEqual}`, `fixed files ${mapText(fixedFiles)}`]);
}
for (const mode of ["shell-check-types", "shell-lint", "web-check-types", "web-lint"]) {
  const path = `${FIN}/${mode}-${suffix}-${FIXED}.log`, fresh = read(path);
  const prevPath = `web-appearance-recovery-final/${mode}-${ACC}-${BEFORE}.log`, prevText = read(prevPath);
  const facts = fresh.match(/^(tsc_exit|eslint_exit)=.*$/m)?.[0] ?? "";
  const program = fresh.match(/^program_files=.*$/m)?.[0] ?? "";
  record(`${mode} @${FIXED}: exit=${exitOf(fresh)} ${facts} (accepted Appearance final @${BEFORE}: ${prevText.match(/^(tsc_exit|eslint_exit)=.*$/m)?.[0] ?? ""} ${prevText.match(/^program_files=.*$/m)?.[0] ?? ""})`,
    exitOf(fresh) === "0" && /harness_checks=PASS/.test(fresh) && (/^tsc_exit=0 diagnostics_lines=0$/m.test(fresh) || /^eslint_exit=0 files=\d+ errors=0 warnings=0 fatal=0$/m.test(fresh)),
    [`new ${path} sha256=${sha(path)} ${headerLine(fresh, "harness_checks")} ${program}`]);
}

// ---------- B. E20 ----------
lines.push("## B. E20 storage check-types and the Sol lifecycle assertion for xai_rail_order");
{
  const storagePath = `web-features-recovery-final/storage-check-types-${suffix}-${FIXED}.log`, prevPath = `web-features-recovery-final/storage-check-types-${ACC}-${BEFORE}.log`;
  const storage = read(storagePath), prev = read(prevPath);
  const programs = text => (text.match(/^program_files=(\d+) archive=(\d+) store=(\d+) elsewhere=(\d+) forbidden=(\d+)/m) ?? []).slice(1).join("/");
  record(`storage-check-types: exit=${exitOf(storage)} ${(storage.match(/^tsc_exit=.*$/m) ?? [""])[0]}; program files ${programs(storage)} vs accepted Appearance final @${BEFORE} ${programs(prev)}`,
    exitOf(storage) === "0" && /^tsc_exit=0 diagnostics_lines=0$/m.test(storage) && /harness_checks=PASS/.test(storage) && programs(storage) === programs(prev),
    [`new ${storagePath} sha256=${sha(storagePath)}`, `accepted ${prevPath} sha256=${sha(prevPath)}`]);
  const bytesPath = `web-apprail-order-recovery-sol/bytes-${suffix}-${FIXED}.log`, fixed1 = "web-apprail-order-recovery-sol/bytes-apprail-fixed1-f9eb4b1.log", before1 = "web-apprail-order-recovery-sol/bytes-before1-419e56d.log";
  const bytes = read(bytesPath);
  const lifecycle = caseLines(bytes).find(entry => entry.name.startsWith("PC §2/§10.11 lifecycle classification"));
  const statuses = [fixed1, before1].map(path => [path, caseLines(read(path)).find(entry => entry.name === lifecycle?.name)?.status ?? "missing"]);
  record(`E20 Sol lifecycle assertion (AppRail Sol bytes.test.tsx L237, "PC §2/§10.11 lifecycle classification …"): ${lifecycle?.status ?? "missing"} at ${FIXED}; ${statuses.map(([path, status]) => `${path.split("/")[1]} ${status}`).join("; ")}; whole mode ${passedOf(caseLines(bytes))}/${caseLines(bytes).length}, names and statuses equal to E7 fixed1=${sameCases(bytes, read(fixed1))}`,
    lifecycle?.status === "PASSED" && statuses.every(([, status]) => status === "PASSED") && exitOf(bytes) === "0" && sameCases(bytes, read(fixed1)) && headerLine(bytes, "oracle_sha256") === headerLine(read(fixed1), "oracle_sha256"),
    [`new ${bytesPath} sha256=${sha(bytesPath)} ${headerLine(bytes, "harness_checks")}`]);
}

// ---------- C. Appearance ----------
lines.push(`## C. Appearance (accepted a560863): Sol eight modes, OE corrected copy, parent host and package vs the accepted Appearance final logs at ${BEFORE}`);
for (const mode of ["bytes", "fields", "reset", "queues", "continuity-export", "host", "retry-all", "original"]) {
  const newPath = `web-appearance-recovery-sol/${mode}-${suffix}-${FIXED}.log`, accPath = `web-appearance-recovery-sol/${mode}-${ACC}-${BEFORE}.log`;
  const fresh = read(newPath), accepted = read(accPath);
  const a = caseLines(fresh), b = caseLines(accepted);
  const oracleEqual = headerLine(fresh, "oracle_sha256") === headerLine(accepted, "oracle_sha256");
  const frozenCE = mode === "continuity-export";
  const failing = a.filter(entry => entry.status !== "PASSED").map(entry => entry.name);
  const predicted = frozenCE ? a.length === 26 && passedOf(a) === 24 && failing.length === 2 && exitOf(fresh) === "1" : exitOf(fresh) === "0" && passedOf(a) === a.length;
  // `original` runs the archive's own shell Topbar tests: the only permitted difference is the two additive §11 cases
  // TP-RAIL-1/2 (contract §11 item 8), every accepted case present in the same order with the same status.
  const ADDITIVE = ["[shell-topbar] Topbar TP-RAIL-1 — ", "[shell-topbar] Topbar TP-RAIL-2 — "];
  const extras = a.filter(entry => !b.some(other => other.name === entry.name));
  const additiveOnly = mode === "original" && extras.length === 2 && ADDITIVE.every(prefix => extras.some(entry => entry.name.startsWith(prefix) && entry.status === "PASSED"))
    && isDeepStrictEqual(a.filter(entry => !extras.includes(entry)).map(entry => `${entry.status} ${entry.name}`), b.map(entry => `${entry.status} ${entry.name}`));
  record(`appearance-sol ${mode}: ${passedOf(a)}/${a.length} vs accepted ${passedOf(b)}/${b.length}${frozenCE ? " [frozen; §13 predicts 24/26 (006 OE-1, 007 OE-2)]" : ""}; names/statuses equal=${sameCases(fresh, accepted)}${mode === "original" ? `; additive TP-RAIL-1/2 only=${additiveOnly}` : ""}`,
    predicted && (sameCases(fresh, accepted) || additiveOnly) && oracleEqual && preconditions(fresh) === 0,
    [logFacts("new", newPath, fresh), logFacts("accepted", accPath, accepted), `oracle_sha256 equal=${oracleEqual}`, ...failing.map(name => `non-pass: ${name}`), ...extras.map(entry => `added: ${entry.status} | ${entry.name}`)]);
}
{
  const newPath = `web-appearance-recovery-oracle-erratum/corrected-${suffix}-${FIXED}.log`, accPath = `web-appearance-recovery-oracle-erratum/corrected-${ACC}-${BEFORE}.log`;
  const fresh = read(newPath), accepted = read(accPath);
  const a = caseLines(fresh);
  record(`OE corrected continuity-export (judging copy): ${passedOf(a)}/${a.length} vs accepted ${passedOf(caseLines(accepted))}/${caseLines(accepted).length} [§13 predicts 26/26]`,
    exitOf(fresh) === "0" && a.length === 26 && passedOf(a) === 26 && sameCases(fresh, accepted),
    [logFacts("new", newPath, fresh), logFacts("accepted", accPath, accepted)]);
  const hostPath = `web-appearance-recovery-independent/host-${suffix}-${FIXED}.log`, hostAcc = `web-appearance-recovery-independent/host-${ACC}-${BEFORE}.log`;
  const host = read(hostPath), hostA = read(hostAcc);
  record(`appearance parent host: ${passedOf(caseLines(host))}/${caseLines(host).length} vs accepted ${passedOf(caseLines(hostA))}/${caseLines(hostA).length}`,
    exitOf(host) === "0" && caseLines(host).length === 33 && passedOf(caseLines(host)) === 33 && sameCases(host, hostA), [logFacts("new", hostPath, host), logFacts("accepted", hostAcc, hostA)]);
  const pkgPath = `web-appearance-recovery-final/appearance-test-${suffix}-${FIXED}.log`, pkgAcc = `web-appearance-recovery-final/appearance-test-${ACC}-${BEFORE}.log`;
  const pkg = read(pkgPath), pkgA = read(pkgAcc);
  const t = totalsSummary(pkg);
  record(`appearance package test: files=${t[0]} tests=${t[1]} passed=${t[2]} vs accepted 11/137 (per-file equal=${sameMap(fileCountsSummary(pkg), fileCountsSummary(pkgA))})`,
    exitOf(pkg) === "0" && t[0] === 11 && t[1] === 137 && t[2] === 137 && sameMap(fileCountsSummary(pkg), fileCountsSummary(pkgA)), [logFacts("new", pkgPath, pkg), logFacts("accepted", pkgAcc, pkgA)]);
}

// ---------- D. Features ----------
lines.push(`## D. Features (accepted ec55f9e): Sol seven modes, downstream three ways at both revisions, host, package and reader tests`);
for (const mode of ["bytes", "fields", "reset", "queues", "continuity-export", "original"]) {
  const newPath = `web-features-recovery-sol/${mode}-${suffix}-${FIXED}.log`, accPath = `web-features-recovery-sol/${mode}-${ACC}-${BEFORE}.log`;
  const fresh = read(newPath), accepted = read(accPath);
  const oracleEqual = headerLine(fresh, "oracle_sha256") === headerLine(accepted, "oracle_sha256");
  record(`features-sol ${mode}: ${passedOf(caseLines(fresh))}/${caseLines(fresh).length} vs accepted ${passedOf(caseLines(accepted))}/${caseLines(accepted).length}; names/statuses equal=${sameCases(fresh, accepted)}`,
    exitOf(fresh) === "0" && passedOf(caseLines(fresh)) === caseLines(fresh).length && sameCases(fresh, accepted) && oracleEqual && preconditions(fresh) === 0,
    [logFacts("new", newPath, fresh), logFacts("accepted", accPath, accepted), `oracle_sha256 equal=${oracleEqual}`, ...caseDiff(fresh, accepted)]);
}
{
  const C012 = "H6 §10.5 after a full reset the App's accent hue, background tone";
  const C014 = "H6 §10.5 an AppRail drag-reorder after a reset persists an order derived from the stored custom order";
  const frozenAccepted = caseLines(read(`web-features-recovery-sol/downstream-${ACC}-${BEFORE}.log`));
  const runs = [
    ["frozen", FIXED, `web-features-recovery-sol/downstream-${suffix}-${FIXED}.log`, ["012", "014"], "13/15 (case 012 PRECONDITION, F-FD1; case 014 PRECONDITION, A7)"],
    ["frozen", BEFORE, `web-features-recovery-sol/downstream-${suffix}-${BEFORE}.log`, ["012"], "14/15 (case 012 PRECONDITION, F-FD1)"],
    ["C-FD1", FIXED, `web-appearance-recovery-final/diagnostics/features-sol-downstream-corrected-${suffix}-${FIXED}.log`, ["014"], "14/15 (case 014 PRECONDITION, A7)"],
    ["C-FD1", BEFORE, `web-appearance-recovery-final/diagnostics/features-sol-downstream-corrected-${suffix}-${BEFORE}.log`, [], "15/15"],
    ["C-RD1 (judging)", FIXED, `web-apprail-order-recovery-sol/features-sol-downstream-c-rd1-${suffix}-${FIXED}.log`, [], "15/15"],
    ["C-RD1 (judging)", BEFORE, `web-apprail-order-recovery-sol/features-sol-downstream-c-rd1-${suffix}-${BEFORE}.log`, [], "15/15"],
  ];
  for (const [label, revision, path, expectedFailing, prediction] of runs) {
    const fresh = read(path);
    const a = caseLines(fresh);
    const failing = a.map((entry, index) => ({ ...entry, number: String(index + 1).padStart(3, "0") })).filter(entry => entry.status !== "PASSED");
    const signature = failing.every(entry => entry.precondition && ((entry.number === "012" && entry.name.startsWith(C012) && /PRECONDITION: the App displays the seeded appearance, rail order and pet: \{"accentHue":"210","bgTone":null/.test(fresh))
      || (entry.number === "014" && entry.name === C014)));
    const ok = isDeepStrictEqual(a.map(entry => entry.name), frozenAccepted.map(entry => entry.name)) && isDeepStrictEqual(failing.map(entry => entry.number), expectedFailing) && signature
      && exitOf(fresh) === (expectedFailing.length ? "1" : "0");
    const first014 = (fresh.match(/^case 014 [^\n]*\n {4}first: ([^\n]*)/m) ?? [, ""])[1].slice(0, 300);
    record(`Features downstream ${label} @${revision}: ${passedOf(a)}/${a.length}; non-pass ${failing.map(entry => `${entry.number}${entry.precondition ? " PRECONDITION" : ""}`).join(", ") || "none"} [§13 predicts ${prediction}]`, ok,
      [logFacts("run", path, fresh), headerLine(fresh, "diagnostic_runner_sha256") || headerLine(fresh, "runner_sha256"), ...(first014 ? [`case 014 first line: ${first014}`] : [])]);
  }
  const hostPath = `web-features-recovery-independent/host-${suffix}-${FIXED}.log`, hostAcc = `web-features-recovery-independent/host-${ACC}-${BEFORE}.log`;
  const host = read(hostPath), hostA = read(hostAcc);
  record(`features host: ${passedOf(caseLines(host))}/${caseLines(host).length} vs accepted ${passedOf(caseLines(hostA))}/${caseLines(hostA).length}`,
    exitOf(host) === "0" && caseLines(host).length === 40 && passedOf(caseLines(host)) === 40 && sameCases(host, hostA), [logFacts("new", hostPath, host), logFacts("accepted", hostAcc, hostA)]);
  for (const [mode, accPath, files, tests] of [["features-test", `web-features-recovery-final/features-test-${ACC}-${BEFORE}.log`, 7, 45], ["features-readers", "web-features-recovery-final/features-readers-features-final-v1-5cd63ff.log", 5, 17]]) {
    const path = `web-features-recovery-final/${mode}-${suffix}-${FIXED}.log`, fresh = read(path), accepted = read(accPath);
    const t = totalsSummary(fresh);
    record(`${mode}: files=${t[0]} tests=${t[1]} passed=${t[2]} vs accepted ${files}/${tests} (per-file equal=${sameMap(fileCountsSummary(fresh), fileCountsSummary(accepted))})`,
      exitOf(fresh) === "0" && t[0] === files && t[1] === tests && t[2] === tests && sameMap(fileCountsSummary(fresh), fileCountsSummary(accepted)), [logFacts("new", path, fresh), logFacts("accepted", accPath, accepted)]);
  }
}

// ---------- E. More, Notifications, Date & Time ----------
lines.push(`## E. More (accepted 27adb10), Notifications (ad223a2) and Date & Time (d0d934d): verify-callers.mjs 17 modes and C-FB002`);
for (const [mode, expected] of [["more-fields", 22], ["more-reset", 20], ["more-queues", 14], ["more-boundaries", 10], ["more-owner-export", 13], ["more-original", 15], ["more-host", 11],
  ["notifications-core", 11], ["notifications-recovery", 3], ["notifications-operations", 2], ["notifications-boundaries", 4], ["notifications-extended", 10], ["notifications-original", 11],
  ["notifications-astra-boundaries", 24], ["notifications-astra-host", 15], ["notifications-parent-host", 12], ["datetime", 7]]) {
  const newPath = `web-features-recovery-final/${mode}-${suffix}-${FIXED}.log`, accPath = `web-features-recovery-final/${mode}-${ACC}-${BEFORE}.log`;
  const fresh = read(newPath), accepted = read(accPath);
  const a = caseLines(fresh);
  const boundaries = mode === "more-boundaries";
  const namesEqual = isDeepStrictEqual(a.map(entry => entry.name), caseLines(accepted).map(entry => entry.name));
  const ok = exitOf(fresh) === "0" && a.length === expected && passedOf(a) === expected && sameCases(fresh, accepted) && sameMap(fileCountsSummary(fresh), fileCountsSummary(accepted));
  record(`${mode} @${FIXED}: ${passedOf(a)}/${a.length} vs accepted ${passedOf(caseLines(accepted))}/${caseLines(accepted).length} (receipt count ${expected})${boundaries ? " [frozen oracle, recorded as it falls; nondeterministic per F-B002; §13: not judging]" : ""}`,
    boundaries ? namesEqual && a.length === expected : ok,
    [logFacts("new", newPath, fresh), logFacts("accepted", accPath, accepted), `names equal=${namesEqual}${boundaries ? `; frozen outcome ${passedOf(a)}/${a.length} exit=${exitOf(fresh)}` : ""}`, ...(boundaries ? [] : caseDiff(fresh, accepted))]);
}
{
  const path = `web-more-recovery-fb002/logs/corrected-full-${suffix}-${FIXED}.log`, accPath = `web-more-recovery-fb002/logs/corrected-full-${ACC}-${BEFORE}.log`;
  const fresh = read(path), accepted = read(accPath);
  const a = caseLines(fresh);
  const rangeErrors = (fresh.match(/^rangeerror cases=(\d+) output_lines=(\d+)/m) ?? []).slice(1).map(Number);
  record(`More boundaries corrected (C-FB002, judging) @${FIXED}: ${passedOf(a)}/${a.length}, RangeError cases/lines ${rangeErrors.join("/")} [§13 predicts 10/10]`,
    exitOf(fresh) === "0" && a.length === 10 && passedOf(a) === 10 && sameCases(fresh, accepted) && rangeErrors[0] === 0 && rangeErrors[1] === 0,
    [logFacts("new", path, fresh), logFacts("accepted", accPath, accepted)]);
}

// ---------- F. Sticky ----------
lines.push(`## F. Sticky (accepted 699f6e6): Sol five modes and host vs the accepted Appearance final logs at ${BEFORE}`);
for (const [mode, dir, expected] of [["bytes", "web-sticky-recovery-sol", 13], ["fields", "web-sticky-recovery-sol", 47], ["queues", "web-sticky-recovery-sol", 27], ["continuity-export", "web-sticky-recovery-sol", 22], ["original", "web-sticky-recovery-sol", 10], ["host", "web-sticky-recovery-independent", 28]]) {
  const newPath = `${dir}/${mode}-${suffix}-${FIXED}.log`, accPath = `${dir}/${mode}-${ACC}-${BEFORE}.log`;
  const fresh = read(newPath), accepted = read(accPath);
  const a = totalsOf(fresh), b = totalsOf(accepted);
  const titlesEqual = JSON.stringify(verboseTitles(fresh)) === JSON.stringify(verboseTitles(accepted));
  const oracleEqual = headerLine(fresh, "oracle_sha256") === headerLine(accepted, "oracle_sha256");
  record(`sticky ${mode}: ${a.passed}/${a.total} vs accepted ${b.passed}/${b.total} (receipt count ${expected})`,
    exitOf(fresh) === "0" && a.total === expected && a.passed === expected && a.failed === 0 && b.total === expected && titlesEqual && oracleEqual && preconditions(fresh) === 0,
    [logFacts("new", newPath, fresh), logFacts("accepted", accPath, accepted), `ordered test titles equal=${titlesEqual} (${verboseTitles(fresh).length}); oracle_sha256 equal=${oracleEqual}`]);
}

// ---------- G. settings-shell, settings-rest ----------
lines.push(`## G. settings-shell and settings-rest packages`);
for (const [mode, files, tests] of [["settings-shell-test", 11, 54], ["settings-rest-test", 44, 314]]) {
  const path = `web-features-recovery-final/${mode}-${suffix}-${FIXED}.log`, accPath = `web-features-recovery-final/${mode}-${ACC}-${BEFORE}.log`;
  const fresh = read(path), accepted = read(accPath);
  const t = totalsSummary(fresh);
  record(`${mode}: files=${t[0]} tests=${t[1]} passed=${t[2]} vs accepted ${files}/${tests} (per-file equal=${sameMap(fileCountsSummary(fresh), fileCountsSummary(accepted))})`,
    exitOf(fresh) === "0" && t[0] === files && t[1] === tests && t[2] === tests && sameMap(fileCountsSummary(fresh), fileCountsSummary(accepted)), [logFacts("new", path, fresh), logFacts("accepted", accPath, accepted)]);
}

// ---------- H. Shell- or App-mounting host suites (contract §13 last row) ----------
lines.push(`## H. Smart Lists, Collaborate, Pomodoro and Dashboard Header host suites (E23 copies of the frozen older runners, host-suites/; default reporter) vs their accepted logs, with ${BEFORE} controls`);
const HOST_SUITES = [
  ["web-smart-lists-recovery-astra", "export", 8, "export-f1post1-f359be6.log"], ["web-smart-lists-recovery-astra", "host", 10, "host-f1post1-f359be6.log"],
  ["web-smart-lists-recovery-astra", "host-entry", 3, "host-entry-f1post1-f359be6.log"], ["web-smart-lists-recovery-astra", "host-wrapper", 5, "host-wrapper-f1post1-f359be6.log"],
  ["web-smart-lists-recovery-astra", "app", 5, "app-f1post1-f359be6.log"], ["web-smart-lists-recovery-astra", "original39", 39, "original39-f1post1-f359be6.log"],
  ["web-smart-lists-recovery-astra", "original-parent", 4, "original-parent-f1post1-f359be6.log"], ["web-smart-lists-recovery-astra", "package", 314, "package-f1post1-f359be6.log"],
  ["web-collaborate-recovery-independent", "contracts", 37, "contracts-lock-complete-c604951.log"], ["web-collaborate-recovery-independent", "host", 8, "host-header-parent-c9a388d.log"],
  ["web-collaborate-recovery-independent", "package", 314, null],
  ["web-pomodoro-departure-independent", "departure", 9, "departure-f1post1-f359be6.log"], ["web-pomodoro-departure-independent", "advanced", 8, "advanced-f1post1-f359be6.log"],
  ["web-pomodoro-departure-independent", "package", 314, "package-f1post1-f359be6.log"],
  ["web-dashboard-header-departure-independent", "departure", 5, "departure-f1post1-f359be6.log"], ["web-dashboard-header-departure-independent", "advanced", 5, "advanced-f1post1-f359be6.log"],
  ["web-dashboard-header-departure-independent", "followon", 2, "followon-f1post1-f359be6.log"],
];
for (const [dir, mode, expected, acceptedName] of HOST_SUITES) {
  const path = `${FIN}/host-suites/${dir}/${mode}-${suffix}-${FIXED}.log`, fresh = read(path); // E23 copy (frozen runner refused: ENOBUFS)
  const a = totalsOf(fresh);
  const facts = [logFacts("new", path, fresh), `files ${mapText(fileCountsDefault(fresh))}`];
  let accOk = true;
  if (acceptedName) {
    const accPath = `${dir}/${acceptedName}`, accepted = read(accPath);
    const b = totalsOf(accepted);
    accOk = b.total === expected && b.passed === expected && sameMap(fileCountsDefault(fresh), fileCountsDefault(accepted));
    facts.push(`${logFacts("accepted", accPath, accepted)} per-file equal=${sameMap(fileCountsDefault(fresh), fileCountsDefault(accepted))}`);
  } else {
    const restPath = `web-features-recovery-final/settings-rest-test-${suffix}-${FIXED}.log`;
    accOk = sameMap(new Map([...fileCountsDefault(fresh)].map(([file, count]) => [file.replace(/^packages\/plugin-web-settings-rest\//, ""), count])), fileCountsSummary(read(restPath)));
    facts.push(`no accepted log of this mode exists; per-file equal to this batch's settings-rest package gate ${restPath}=${accOk}`);
  }
  let controlOk = true;
  if (mode !== "package") {
    const controlPath = `${FIN}/host-suites/${dir}/${mode}-${suffix}-${BEFORE}.log`, control = read(controlPath);
    controlOk = exitOf(control) === "0" && sameMap(fileCountsDefault(fresh), fileCountsDefault(control)) && totalsOf(control).passed === expected;
    facts.push(`${logFacts(`control @${BEFORE}`, controlPath, control)} per-file equal=${sameMap(fileCountsDefault(fresh), fileCountsDefault(control))}`);
  }
  record(`${dir.replace("web-", "").replace(/-recovery|-departure/g, "")} ${mode} @${FIXED}: ${a.passed}/${a.total} (accepted count ${expected})`,
    exitOf(fresh) === "0" && a.total === expected && a.passed === expected && a.failed === 0 && accOk && controlOk, facts);
}

// ---------- I. E24 native ----------
lines.push(`## I. E24 Features native host and downstream: frozen refusals and the harness copy vs the accepted logs`);
{
  const AUDIT = "run:k1-keyboard-trace-contains-only-the-runner-key-presses";
  for (const [mode, frozenId] of [["host", "baseline:fixed-delta-only-in-features-package"], ["downstream", "baseline:fixed-delta-only-in-features-package"]]) {
    const frozenPath = `web-features-recovery-native/native-${FIXED}-${suffix}-${mode}.log`;
    const frozen = jsonl(frozenPath);
    const result = frozen.find(item => item.name === "result");
    const checks = frozen.filter(item => item.name === "check");
    const failed = checks.filter(item => !item.pass).map(item => item.id);
    record(`E24 frozen ${mode} runner (unchanged): harness-invalid at exactly the caller-bound precondition ${frozenId}, every earlier precondition PASS (${checks.length - 1} PASS)`,
      result?.harnessValid === false && result?.pass === false && isDeepStrictEqual(failed, [frozenId]) && checks.at(-1)?.id === frozenId && checks.slice(0, -1).every(item => item.pass && item.kind === "precondition"),
      [`frozen ${frozenPath} sha256=${sha(frozenPath)}`, `checks ${checks.map(item => `${item.id}=${item.pass}`).join(" ")}`, `fixedDelta recorded=${checks.at(-1)?.fixedDelta?.length ?? null} files`]);
  }
  for (const [mode, accPath, accHasAudit, productExpected] of [["host", "web-features-recovery-native/native-5cd63ff-fixed1-host.log", false, null], ["downstream", "web-appearance-recovery-final/native-419e56d-appearance-final-v1-downstream.log", true, 140]]) {
    const copyPath = `${FIN}/native-${FIXED}-${suffix}-${mode}.log`;
    const copy = jsonl(copyPath), accepted = jsonl(accPath);
    const map = id => (id === "baseline:fixed-delta-is-features-then-appearance-then-apprail-section-11" || id === "baseline:fixed-delta-is-features-then-appearance-section-11" ? "baseline:fixed-delta(mapped)" : id === "baseline:fixed-delta-only-in-features-package" ? "baseline:fixed-delta(mapped)" : id);
    const seq = (list, dropAudit) => list.filter(item => item.name === "check" && !(dropAudit && item.id === AUDIT)).map(item => `${map(item.id)}|${item.kind}|${item.pass}`);
    const a = seq(copy, !accHasAudit), b = seq(accepted, false);
    const resultA = copy.find(item => item.name === "result"), resultB = accepted.find(item => item.name === "result");
    const audit = copy.find(item => item.name === "k1-key-audit");
    const product = copy.filter(item => item.name === "check" && item.kind === "product");
    const deltaCheck = copy.find(item => item.name === "check" && item.id === "baseline:fixed-delta-is-features-then-appearance-then-apprail-section-11");
    record(`E24 copy ${mode}: pass=${resultA?.pass} harnessValid=${resultA?.harnessValid} ${resultA?.checks} checks, ${resultA?.productChecks} product (accepted ${resultB?.checks}/${resultB?.productChecks}); check id/kind/pass sequence equal after mapping the delta precondition${accHasAudit ? "" : " and removing the K-1 audit check"}=${isDeepStrictEqual(a, b)}`,
      resultA?.pass === true && resultA?.harnessValid === true && isDeepStrictEqual(a, b) && product.length === resultB?.productChecks && (productExpected === null || product.length === productExpected) && product.every(item => item.pass)
        && resultA.runtimeErrors === 0 && (resultA.deferredFailures ?? []).length === 0 && audit?.ok === true && (resultA.dialogs ?? []).length === (resultB.dialogs ?? []).length && deltaCheck?.pass === true,
      [`copy ${copyPath} sha256=${sha(copyPath)}`, `accepted ${accPath} sha256=${sha(accPath)}`,
        `delta precondition: features=${deltaCheck?.featuresDelta?.length} appearance=${deltaCheck?.appearanceDelta?.length} apprail=${deltaCheck?.railDelta?.length} fixedDelta=${deltaCheck?.fixedDelta?.length}`,
        `K-1 audit: pressed=${audit?.pressed?.length} keydowns=${audit?.keydowns} keyups=${audit?.keyups} keypresses=${audit?.keypresses} ok=${audit?.ok}; dialogs ${(resultA?.dialogs ?? []).length} vs ${(resultB?.dialogs ?? []).length}; runtimeErrors=${resultA?.runtimeErrors} consoleWarnings=${resultA?.consoleWarnings} (accepted ${resultB?.consoleWarnings})`]);
  }
}

lines.push(`## Summary: ${lines.filter(line => line.startsWith("MATCH")).length} MATCH, ${diffs.length} DIFF`);
for (const label of diffs) lines.push(`DIFF ${label}`);
writeFileSync(output, `comparison=${suffix}\n${lines.join("\n")}\nexit=${diffs.length ? 1 : 0}\n`, { flag: "wx" });
console.log(`compare-accepted ${suffix}: ${lines.filter(line => line.startsWith("MATCH")).length} MATCH, ${diffs.length} DIFF; log ${output}`);
for (const label of diffs) console.log(`  DIFF ${label}`);
process.exitCode = diffs.length ? 1 : 0;
