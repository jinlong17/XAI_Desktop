/**
 * K-1 (batch 44): read-only inventory of every committed Date & Time native log
 * (../web-date-time-recovery-native/native-*.log). For each log it prints the fixed SHA and Chrome build of the
 * run, the mode, the result, and every "select-input" record: the capture-phase keydown/keyup/input/change trace
 * that verify-native.mjs change(0) installs on document before its typeahead press and reads 200 ms after it
 * (verify-native.mjs:41). A stream started by the press would appear there as extra keydowns.
 *
 * Usage: node docs/reviews/web-native-keyinput-k1/dt-traces-k1.mjs
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const directory = fileURLToPath(new URL("../web-date-time-recovery-native/", import.meta.url));
// review.md "Input setup diagnostics, excluded from product verdict": produced before the first committed runner
// version (ff865fb) by uncommitted predecessors whose key code is not in the repository.
const DIAGNOSTICS = new Set(["native-73b4eb9-before-clean.log", "native-73b4eb9-before-controls.log", "native-73b4eb9-keyboard-before-clean.log",
  "native-73b4eb9-raw-key-before-clean.log", "native-73b4eb9-focused-raw-before-clean.log", "native-73b4eb9-focus-emulation-before-clean.log"]);
const logs = readdirSync(directory).filter((name) => /^native-.*\.log$/.test(name)).sort();
const totals = { logs: 0, logsWithTrace: 0, typeaheadLogs: 0, diagnosticLogs: 0, tracedPresses: 0, strayKeydowns: 0, focusModeLogs: 0, logsWithoutKeys: 0 };
for (const name of logs) {
  const records = readFileSync(join(directory, name), "utf8").trim().split("\n").map((line) => JSON.parse(line));
  const baseline = records.find((r) => r.name === "baseline") ?? {};
  const final = records.filter((r) => r.name === "native").at(-1) ?? null;
  const traces = records.filter((r) => r.name === "select-input");
  // change(0) adds one more set of four capture listeners on every call, so the k-th press (1-based) is recorded k
  // times; the listener count is reconstructed from the order of the calls.
  let previousListeners = 0;
  const presses = traces.map((trace, index) => {
    const listeners = previousListeners + 1;
    previousListeners = listeners;
    const keydowns = trace.events.filter((e) => e.name === "keydown");
    const keyups = trace.events.filter((e) => e.name === "keyup");
    const distinctKeys = [...new Set(keydowns.map((e) => e.key))];
    // One runner keydown per runner key, seen by each installed listener set. The committed runner sends one key
    // ("s" or "周"); the four 73b4eb9 input-setup diagnostics (uncommitted predecessor) sent ArrowDown then Enter.
    const expected = listeners * distinctKeys.length;
    const stray = Math.max(0, keydowns.length - expected);
    return { press: index + 1, listeners, keydowns: keydowns.length, keyups: keyups.length, keys: distinctKeys, trusted: trace.events.every((e) => e.trusted), stray, valueAfter: trace.value };
  });
  const mode = final?.mode ?? name.replace(/^native-[0-9a-f]+-(?:[a-z0-9-]*?-)?/, "").replace(/\.log$/, "");
  const focusMode = /-focus\.log$/.test(name);
  const diagnostic = DIAGNOSTICS.has(name);
  totals.logs += 1;
  if (presses.length) totals.logsWithTrace += 1;
  if (presses.length && !diagnostic) totals.typeaheadLogs += 1;
  if (diagnostic) totals.diagnosticLogs += 1;
  if (focusMode) totals.focusModeLogs += 1;
  if (!presses.length && !focusMode && !diagnostic) totals.logsWithoutKeys += 1;
  totals.tracedPresses += presses.length;
  totals.strayKeydowns += presses.reduce((sum, p) => sum + p.stray, 0);
  console.log(JSON.stringify({ name: "dt-log", log: name, commit: baseline.commit ?? null, browser: baseline.browser ?? null, mode,
    result: final ? (final.pass ? "pass" : "fail") : "no-native-record", runtimeErrors: final?.runtimeErrors ?? null,
    keySends: diagnostic ? `input-setup diagnostic from an uncommitted predecessor runner (excluded from the product verdict, review.md); traced keys: ${presses.flatMap((p) => p.keys).join(", ") || "no trace recorded"}`
      : presses.length ? "typeahead (nativeVirtualKeyCode 1 for s, 36 for 周)" : focusMode ? "focus: Shift+Tab, Tab, Escape (no nativeVirtualKeyCode)" : "none",
    typeaheadPresses: presses }));
}
console.log(JSON.stringify({ name: "dt-summary", ...totals }));
