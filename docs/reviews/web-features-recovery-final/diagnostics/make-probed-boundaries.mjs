// Scratch-only: derive a probed copy of the More Sol boundaries oracle (not evidence, never committed).
// The only change: right after case 002 installs its getItem spy, log what a device-key getItem does and how deep
// the spy recursed, plus the V8 stack-size flag in effect. Everything else is byte-identical.
import { readFileSync, writeFileSync } from "node:fs";
const [source, target] = process.argv.slice(2);
const text = readFileSync(source, "utf8");
const anchor = `return base.call(this, key); }); const ui = mount();`;
if (!text.includes(anchor)) throw Error("anchor not found");
const probe = `return base.call(this, key); }); { let outcome; try { outcome = "value=" + JSON.stringify(localStorage.getItem("xai_pref_more_date_recognition")); } catch (error) { outcome = "threw " + (error && error.constructor && error.constructor.name); } console.log("DIAG case002 probe getItem(date_recognition) " + outcome + " execArgv=" + JSON.stringify(process.execArgv)); } const ui = mount();`;
writeFileSync(target, text.replace(anchor, probe));
console.log("written", target);
