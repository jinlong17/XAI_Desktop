// Scratch-only: probed copy #2 of the More Sol boundaries oracle (not evidence, never committed).
// Logs, right after case 002 installs its getItem spy, how the spy, the prototype and the global relate and how deep
// a device-key getItem recursed. Also logs the same facts at the start of case 001.
import { readFileSync, writeFileSync } from "node:fs";
const [source, target] = process.argv.slice(2);
let text = readFileSync(source, "utf8");
const facts = (label) => `{ const g = globalThis as any; let depth = 0; let maxDepth = 0; const proto = Storage.prototype as any; const current = proto.getItem; const wrapped = function (this: Storage, key: string) { depth += 1; maxDepth = Math.max(maxDepth, depth); try { return current.call(this, key); } finally { depth -= 1; } }; proto.getItem = wrapped; let outcome: string; try { outcome = "value=" + JSON.stringify(localStorage.getItem("xai_pref_more_date_recognition")); } catch (error: any) { outcome = "threw " + error?.constructor?.name; } proto.getItem = current; console.log("DIAG ${label} " + outcome + " maxDepth=" + maxDepth + " protoIsSpy=" + Boolean((current as any)?.mock) + " sameStorageProto=" + (Object.getPrototypeOf(g.localStorage) === Storage.prototype) + " localStorageGetItemIsProto=" + (g.localStorage.getItem === current) + " windowLS=" + (g.window?.localStorage === g.localStorage)); }`;
const anchor002 = `return base.call(this, key); }); const ui = mount();`;
if (!text.includes(anchor002)) throw Error("anchor 002 not found");
text = text.replace(anchor002, `return base.call(this, key); }); ${facts("case002")} const ui = mount();`);
const anchor001 = `const device = deviceCases[0]!, account = accountCases[0]!, ui = mount();`;
if (!text.includes(anchor001)) throw Error("anchor 001 not found");
text = text.replace(anchor001, `${facts("case001-start")} const device = deviceCases[0]!, account = accountCases[0]!, ui = mount();`);
writeFileSync(target, text);
console.log("written", target);
