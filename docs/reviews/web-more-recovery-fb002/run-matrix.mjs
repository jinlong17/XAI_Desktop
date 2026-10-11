/**
 * F-B002 matrix driver (control-plane batch 31). Runs verify-fb002.mjs serially, one Vitest run and one log per
 * repetition, repetition-major (round-robin across revisions), and appends one line per run to
 * logs/driver-<group>-<iteration>.log (exclusive create; refuses to overwrite).
 *
 * Usage (from the repository root):
 *   XAI_DEPS_ROOT=<dependency checkout> node docs/reviews/web-more-recovery-fb002/run-matrix.mjs <group> <iteration>
 *
 * Groups (batch-31 matrix):
 *   corrected-full     corrected oracle, full file, 10 repetitions at afbfb24 7b216a3 f359be6 5cd63ff
 *   corrected-case002  corrected oracle, case 002 alone, 3 repetitions at afbfb24 7b216a3 f359be6 5cd63ff
 *   original-full      frozen original oracle, full file, 10 repetitions at afbfb24 7b216a3
 * Run suffixes are <iteration>r01 … <iteration>rNN. Exit status: the first nonzero run exit status (nonzero statuses
 * are preserved; the before revision afbfb24 is expected to exit 1), else 0.
 */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL("./", import.meta.url));
const root = fileURLToPath(new URL("../../../", import.meta.url));
const logs = join(here, "logs");
const runner = join(here, "verify-fb002.mjs");
const GROUPS = {
  "corrected-full": { oracle: "corrected", scope: "full", repetitions: 10, revisions: ["afbfb24", "7b216a3", "f359be6", "5cd63ff"] },
  "corrected-case002": { oracle: "corrected", scope: "case002", repetitions: 3, revisions: ["afbfb24", "7b216a3", "f359be6", "5cd63ff"] },
  "original-full": { oracle: "original", scope: "full", repetitions: 10, revisions: ["afbfb24", "7b216a3"] },
};
const [group, iteration, ...extra] = process.argv.slice(2);
if (!GROUPS[group] || !iteration || extra.length || !/^v[0-9]+$/.test(iteration)) throw Error(`Usage: node run-matrix.mjs <${Object.keys(GROUPS).join("|")}> <vN>`);
if (!process.env.XAI_DEPS_ROOT) throw Error("Set XAI_DEPS_ROOT to the dependency checkout");
if (process.env.XAI_FB002_OUTPUT_DIR) throw Error("The matrix driver writes evidence only; unset XAI_FB002_OUTPUT_DIR");
const { oracle, scope, repetitions, revisions } = GROUPS[group];
mkdirSync(logs, { recursive: true });
const driverLog = join(logs, `driver-${group}-${iteration}.log`);
const sha256 = data => createHash("sha256").update(data).digest("hex");
writeFileSync(driverLog, [
  `driver=docs/reviews/web-more-recovery-fb002/run-matrix.mjs sha256=${sha256(readFileSync(fileURLToPath(import.meta.url)))}`,
  `runner=docs/reviews/web-more-recovery-fb002/verify-fb002.mjs sha256=${sha256(readFileSync(runner))}`,
  `group=${group} oracle=${oracle} scope=${scope} repetitions=${repetitions} revisions=${revisions.join(",")} iteration=${iteration} order=repetition-major`,
  `command=XAI_DEPS_ROOT=${process.env.XAI_DEPS_ROOT} node docs/reviews/web-more-recovery-fb002/run-matrix.mjs ${group} ${iteration}`,
  `started_at=${new Date().toISOString()}`,
].join("\n") + "\n", { flag: "wx" });

let firstFailure = 0;
const tally = new Map(revisions.map(revision => [revision, { runs: 0, exit0: 0, case002Passed: 0, rangeCases: 0 }]));
for (let index = 1; index <= repetitions; index += 1) {
  for (const revision of revisions) {
    const suffix = `${iteration}r${String(index).padStart(2, "0")}`;
    const log = join(logs, `${oracle}-${scope}-${suffix}-${revision}.log`);
    if (existsSync(log)) throw Error(`Evidence exists; use a new iteration: ${log}`);
    const started = Date.now();
    const result = spawnSync(process.execPath, [runner, revision, oracle, scope, suffix], { cwd: root, encoding: "utf8", env: { ...process.env } });
    const status = result.status ?? 1;
    const text = existsSync(log) ? readFileSync(log, "utf8") : "";
    const field = pattern => (text.match(pattern) ?? [, "missing"])[1];
    const totals = field(/^totals ([^\n]*)$/m).replace(/ suite_errors.*/, "");
    const range = field(/^rangeerror ([^\n]*)$/m);
    const harness = field(/^harness_checks=([^\n]*)$/m);
    const case002 = field(/^case 002 ([A-Z]+) \|/m);
    const failed = [...text.matchAll(/^case (\d{3}) FAILED \| [^\n]*\n {4}first: ([^\n]*)\n {4}at: ([^\n]*)/gm)].map(match => `c${match[1]}: ${match[2].slice(0, 160)} @ ${match[3].replace(/^.*\//, "")}`);
    const entry = tally.get(revision);
    entry.runs += 1; if (status === 0) entry.exit0 += 1; if (case002 === "PASSED") entry.case002Passed += 1;
    entry.rangeCases += Number((/cases=(\d+)/.exec(range) ?? [, 0])[1]);
    const line = `${suffix} ${revision} exit=${status} ${Math.round((Date.now() - started) / 100) / 10}s harness=${harness} ${totals} rangeerror(${range}) case002=${case002} log_sha256=${text ? sha256(readFileSync(log)) : "missing"}${failed.length ? `\n    failed: ${failed.join(" ; ")}` : ""}${!text ? `\n    runner_stderr: ${String(result.stderr).slice(0, 600)}` : ""}`;
    appendFileSync(driverLog, line + "\n");
    console.log(line);
    if (status !== 0 && firstFailure === 0) firstFailure = status;
  }
}
const summary = [...tally].map(([revision, entry]) => `summary ${revision} runs=${entry.runs} exit0=${entry.exit0} case002_passed=${entry.case002Passed} rangeerror_cases_total=${entry.rangeCases}`);
appendFileSync(driverLog, [...summary, `finished_at=${new Date().toISOString()}`, `driver_exit=${firstFailure}`].join("\n") + "\n");
for (const line of summary) console.log(line);
process.exitCode = firstFailure;
