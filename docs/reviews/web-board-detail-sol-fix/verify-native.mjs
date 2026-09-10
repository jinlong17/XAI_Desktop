/** Real Chrome, isolated profile and actual download directory. Synthetic local board data only. */
import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { createServer } from "node:http";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "../../../node_modules/.pnpm/esbuild@0.28.1/node_modules/esbuild/lib/main.js";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const output = fileURLToPath(new URL("./", import.meta.url));
const revision = process.argv[2];
if (!revision) throw new Error("Pinned revision required");
const directory = mkdtempSync(join(tmpdir(), "xai-board-detail-native-"));
const snapshot = join(directory, "source");
const downloads = join(directory, "downloads");
mkdirSync(snapshot);
mkdirSync(downloads);
execFileSync("tar", ["-x", "-C", snapshot], {
  input: execFileSync("git", ["archive", revision], {
    cwd: root,
    maxBuffer: 100 * 1024 * 1024,
  }),
});
symlinkSync(join(root, "node_modules"), join(snapshot, "node_modules"));
const packages = new Map();
for (const name of readdirSync(join(snapshot, "packages"))) {
  const folder = join(snapshot, "packages", name);
  try {
    const pkg = JSON.parse(readFileSync(join(folder, "package.json"), "utf8"));
    packages.set(pkg.name, { folder, pkg });
    symlinkSync(join(root, "packages", name, "node_modules"), join(folder, "node_modules"));
  } catch {
    // Ignore non-package folders.
  }
}
const pinnedPackages = {
  name: "pinned-workspace-packages",
  setup(context) {
    context.onResolve({ filter: /^@repo\// }, (args) => {
      const parts = args.path.split("/");
      const entry = packages.get(parts.slice(0, 2).join("/"));
      if (!entry) return undefined;
      const subpath = parts.length > 2 ? `./${parts.slice(2).join("/")}` : ".";
      let target = entry.pkg.exports?.[subpath];
      if (typeof target === "object") target = target.import ?? target.default;
      if (typeof target !== "string") throw new Error(`Unresolved pinned export ${args.path}`);
      return { path: join(entry.folder, target) };
    });
  },
};

const built = await build({
  stdin: {
    contents: readFileSync(join(output, "native.tsx"), "utf8"),
    resolveDir: snapshot,
    loader: "tsx",
  },
  plugins: [pinnedPackages],
  loader: { ".png": "dataurl", ".svg": "dataurl" },
  nodePaths: [join(root, "apps/web/node_modules")],
  bundle: true,
  format: "esm",
  platform: "browser",
  write: false,
  outfile: join(directory, "bundle.js"),
  define: { "import.meta.env": "{}" },
});
const javascript = built.outputFiles.find((file) => file.path.endsWith(".js")).text;
const css = built.outputFiles.find((file) => file.path.endsWith(".css")).text;
const server = createServer((_request, response) => {
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.end(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><div id="app"></div><script type="module">${javascript}</script></body></html>`,
  );
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const browser = spawn(
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--disable-background-networking",
    "--remote-debugging-port=0",
    `--user-data-dir=${join(directory, "profile")}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);
let socket;
const records = [];
const record = (name, value) => {
  const entry = { name, ...value };
  records.push(entry);
  console.log(JSON.stringify(entry));
};

try {
  let port;
  for (let index = 0; index < 100; index += 1) {
    try {
      port = Number(readFileSync(join(directory, "profile", "DevToolsActivePort"), "utf8").split("\n")[0]);
      break;
    } catch {
      await delay(50);
    }
  }
  assert(port, "Chrome DevTools port was not created");
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket = new WebSocket(targets.find((target) => target.type === "page").webSocketDebuggerUrl);
  await new Promise((resolve) => socket.addEventListener("open", resolve, { once: true }));
  let sequence = 0;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id) return;
    const request = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) request.reject(new Error(JSON.stringify(message.error)));
    else request.resolve(message.result);
  });
  const cdp = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++sequence;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) => {
    const result = await cdp("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const click = async (selector) => {
    await evaluate(`(()=>{const element=document.querySelector(${JSON.stringify(selector)});if(!element)throw Error('missing ${selector}');element.click()})()`);
    await delay(120);
  };
  const setValue = async (selector, value, tag = "input") => {
    const prototype = tag === "select" ? "HTMLSelectElement" : "HTMLInputElement";
    await evaluate(`(()=>{const element=document.querySelector(${JSON.stringify(selector)});if(!element)throw Error('missing input');Object.getOwnPropertyDescriptor(${prototype}.prototype,'value').set.call(element,${JSON.stringify(value)});element.dispatchEvent(new Event('input',{bubbles:true}));element.dispatchEvent(new Event('change',{bubbles:true}))})()`);
    await delay(80);
  };
  const waitReady = async () => {
    for (let index = 0; index < 100; index += 1) {
      if (await evaluate("!!document.querySelector('[data-testid=board-card]')")) return;
      await delay(50);
    }
    throw new Error("Board UI did not become ready");
  };
  const openCard = async () => {
    await click("[data-testid=board-card]");
    assert.equal(await evaluate("!!document.querySelector('[data-testid=card-detail-modal]')"), true);
  };
  const boardData = async () => {
    const raw = await evaluate("localStorage.getItem(window.verify.key)");
    const decoded = JSON.parse(raw);
    return { raw, boards: Array.isArray(decoded) ? decoded : decoded.boards };
  };
  const card = (boards) => boards[0].lists[0].cards.find((entry) => entry.id === "bc1");

  await cdp("Browser.setDownloadBehavior", { behavior: "allow", downloadPath: downloads });
  await cdp("Page.navigate", { url: `http://127.0.0.1:${server.address().port}` });
  await waitReady();
  record("baseline", { revision, chromePid: browser.pid });

  const scenarios = [
    {
      kind: "checklist",
      width: 1280,
      initial: "Initial native checklist",
      latest: "Latest native checklist",
      input: "[data-testid=card-detail-checklist-input]",
      add: "[data-testid=card-detail-checklist-add]",
      entries: (value) => value.checklistItems ?? [],
      visible: "Latest native checklist",
    },
    {
      kind: "attachment",
      width: 768,
      initial: "https://example.com/initial-native",
      latest: "https://drive.google.com/file/d/latest-native",
      input: "[data-testid=card-detail-attachment-url]",
      add: "[data-testid=card-detail-attachment-add]",
      entries: (value) => value.attachments ?? [],
      visible: "Latest native attachment",
    },
    {
      kind: "activity",
      width: 390,
      initial: "Initial native activity",
      latest: "Latest native activity",
      input: "[data-testid=card-detail-activity-input]",
      add: "[data-testid=card-detail-activity-add]",
      entries: (value) => value.activity ?? [],
      visible: "Latest native activity",
    },
  ];

  for (const scenario of scenarios) {
    await cdp("Emulation.setDeviceMetricsOverride", {
      width: scenario.width,
      height: scenario.width === 390 ? 844 : 900,
      deviceScaleFactor: 1,
      mobile: scenario.width === 390,
    });
    if (!(await evaluate("!!document.querySelector('[data-testid=card-detail-modal]')"))) await openCard();
    const before = await boardData();
    await evaluate("window.verify.deny()");
    await setValue(scenario.input, scenario.initial);
    if (scenario.kind === "attachment") {
      await setValue("[data-testid=card-detail-integration-provider]", "github", "select");
      await setValue("[data-testid=card-detail-attachment-title]", "Initial native attachment");
    }
    await click(scenario.add);
    assert.equal(await evaluate("window.verify.rejectedWrites() > 0"), true);
    assert.equal((await boardData()).raw, before.raw);
    assert.equal(await evaluate(`document.querySelector(${JSON.stringify(scenario.input)}).value`), scenario.initial);
    assert.equal(await evaluate("!!document.querySelector('[data-testid=card-detail-save-recovery]')"), true);

    await setValue(scenario.input, scenario.latest);
    if (scenario.kind === "attachment") {
      await setValue("[data-testid=card-detail-integration-provider]", "drive", "select");
      await setValue("[data-testid=card-detail-attachment-title]", "Latest native attachment");
    }
    const layout = await evaluate(`(()=>{const panel=document.querySelector('[data-testid=card-detail-save-recovery]');const rect=panel.getBoundingClientRect();const button=panel.querySelector('button').getBoundingClientRect();return {innerWidth,scrollWidth:document.documentElement.scrollWidth,left:rect.left,right:rect.right,buttonHeight:button.height}})()`);
    assert(layout.scrollWidth <= layout.innerWidth);
    assert(layout.left >= 0 && layout.right <= layout.innerWidth);
    assert(layout.buttonHeight >= 44);

    await click("[data-testid=card-detail-export-draft]");
    let filename;
    for (let index = 0; index < 100; index += 1) {
      filename = readdirSync(downloads).find((entry) => entry.endsWith(".json"));
      if (filename) break;
      await delay(50);
    }
    assert.equal(filename, `board-detail-${scenario.kind}-draft.json`);
    const downloaded = JSON.parse(readFileSync(join(downloads, filename), "utf8"));
    assert.deepEqual(downloaded.target, {
      boardId: "b-default",
      listId: "b-backlog",
      cardId: "bc1",
    });
    assert.equal(downloaded.owner.accountId, "board-detail-native");
    assert.equal(downloaded.originalStorageRaw, before.raw);
    if (scenario.kind === "checklist") assert.equal(downloaded.draft.text, scenario.latest);
    if (scenario.kind === "attachment") {
      assert.equal(downloaded.draft.url, scenario.latest);
      assert.equal(downloaded.draft.title, "Latest native attachment");
      assert.equal(downloaded.draft.providerId, "drive");
    }
    if (scenario.kind === "activity") assert.equal(downloaded.draft.body, scenario.latest);
    rmSync(join(downloads, filename));

    await evaluate("window.verify.restore()");
    await click("[data-testid=card-detail-retry-save]");
    const after = await boardData();
    const matches = scenario.entries(card(after.boards)).filter((entry) => entry.id === downloaded.proposal.id);
    assert.equal(matches.length, 1);
    assert.equal(await evaluate(`document.querySelector(${JSON.stringify(scenario.input)}).value`), "");
    assert.equal(await evaluate("!!document.querySelector('[data-testid=card-detail-save-recovery]')"), false);
    if (scenario.kind === "activity") assert.equal(matches[0].createdAt, downloaded.proposal.createdAt);
    record(`${scenario.kind}-download-retry-${scenario.width}`, {
      pass: true,
      filename,
      proposalId: downloaded.proposal.id,
      layout,
    });

    await cdp("Page.reload");
    await waitReady();
    await openCard();
    const visibleAfterReload =
      scenario.kind === "checklist"
        ? await evaluate(`[...document.querySelectorAll('.cd-check-row input')].some((element)=>element.value===${JSON.stringify(scenario.visible)})`)
        : (await evaluate("document.body.innerText")).includes(scenario.visible);
    assert.equal(visibleAfterReload, true);
  }
  record("PASS", { scope: "Board detail checklist, attachment, and activity recovery" });
} finally {
  writeFileSync(
    join(output, `native-${revision}.log`),
    records.map((entry) => JSON.stringify(entry)).join("\n") + "\n",
  );
  socket?.close();
  server.closeAllConnections();
  server.close();
  if (browser.exitCode === null) {
    await new Promise((resolve) => {
      browser.once("exit", resolve);
      browser.kill("SIGTERM");
      setTimeout(() => {
        if (browser.exitCode === null) browser.kill("SIGKILL");
      }, 1500).unref();
    });
  }
  rmSync(directory, { recursive: true, force: true, maxRetries: 8, retryDelay: 150 });
}
