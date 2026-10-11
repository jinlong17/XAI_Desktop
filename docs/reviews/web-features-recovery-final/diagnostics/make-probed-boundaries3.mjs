// Scratch-only: probed copy #3 of the More Sol boundaries oracle (not evidence, never committed).
// After case 002 installs its getItem spy, wrap the prototype method once more with a pass-through recorder that
// logs every getItem call that THREW (key and error type) until the case's waitFor ends, then print the record.
import { readFileSync, writeFileSync } from "node:fs";
const [source, target] = process.argv.slice(2);
let text = readFileSync(source, "utf8");
const anchor = `return base.call(this, key); }); const ui = mount(); await flush(); reset(ui); await flush(30);`;
if (!text.includes(anchor)) throw Error("anchor not found");
text = text.replace(anchor, `return base.call(this, key); }); const diagProto = Storage.prototype as any; const diagSpy = diagProto.getItem; const diagThrown: string[] = []; let diagDepth = 0; diagProto.getItem = function (this: Storage, key: string) { diagDepth += 1; try { return diagSpy.call(this, key); } catch (error: any) { if (diagDepth === 1) diagThrown.push(String(key) + ":" + error?.constructor?.name); throw error; } finally { diagDepth -= 1; } }; const ui = mount(); await flush(); console.log("DIAG after-mount outermost-throws=" + JSON.stringify(diagThrown.splice(0))); reset(ui); await flush(30); console.log("DIAG after-reset outermost-throws=" + JSON.stringify(diagThrown.splice(0)));`);
writeFileSync(target, text);
console.log("written", target);
