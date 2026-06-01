function openDocInLibrary(path){
  setPage("docs");
  if(serveMode){
    openDoc(path, {fullscreen:true});
    return;
  }
  if(httpMode){
    maybeActivateDocServeMode().then(() => {
      if(serveMode) openDoc(path, {fullscreen:true});
      else renderStaticDocLibraryNotice("打开文档", path);
    });
    return;
  }
  renderStaticDocLibraryNotice("打开文档", path);
}

const httpMode = location.protocol === "http:" || location.protocol === "https:";
let serveMode = false;
let currentDocPath = "";
let currentTreeDir = "";
let currentTreeChildren = [];
let currentDocEntry = null;
let currentDocContent = "";
let docApiCheckStarted = false;
let docApiCheckPromise = null;
let docLiveHandlersAttached = false;
let docStaticHandlersAttached = false;

function branchDocSeeds(){
  const branch = dashboardState.git?.branch || "";
  if(branch === "dev"){
    return [
      ["Desktop RC", "docs/adr/0013-branch-sync-governance.md"],
      ["G1 native", "docs/workflow/roadmap/xai-g1-native-foundation.md"],
      ["Workflow", "docs/workflow/project/usage-guide.md"],
      ["Native map", "docs/PLUGIN_MAP.md"]
    ];
  }
  return [
    ["Web", "docs/workflow/roadmap/xai-web-console.md"],
    ["ADR-0013", "docs/adr/0013-branch-sync-governance.md"],
    ["D3 gate", ".teams/skills/xai-web-to-desktop-sync/SKILL.md"],
    ["Usage", "docs/workflow/project/usage-guide.md"]
  ];
}

async function fetchJson(url){
  const response = await fetch(url, {cache:"no-store", headers:{Accept:"application/json"}});
  const text = await response.text();
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch (error) {
    throw new Error(`Expected JSON from ${url}; got HTTP ${response.status}`);
  }
  if(!response.ok) throw new Error(body.error || `HTTP ${response.status}`);
  return body;
}

async function detectDashboardApi(){
  if(!httpMode) return null;
  try {
    return await fetchJson("/api/tree?dir=");
  } catch (error) {
    return null;
  }
}

function setDocServeMode(enabled){
  serveMode = Boolean(enabled);
  const modePill = document.getElementById("docModePill");
  const modeLabel = serveMode ? "serve" : httpMode ? "static" : "file";
  if(modePill){
    modePill.textContent = modeLabel;
    modePill.className = `pill ${serveMode ? "b-green" : "b-yellow"}`;
  }
  document.querySelector(".doc-preview")?.classList.toggle("is-visible", !serveMode);
  const notice = document.getElementById("serveNotice");
  if(notice){
    notice.textContent = serveMode
      ? "serve 模式 · 真实文件夹导航 · 本地路径实时读取"
      : "静态预览 · 启动 pnpm dashboard:serve 后可读取真实文件";
  }
}

function basename(path){
  return String(path || "").split("/").filter(Boolean).pop() || path || "文档根目录";
}

function dirname(path){
  const parts = String(path || "").split("/").filter(Boolean);
  parts.pop();
  return parts.join("/");
}

function docKindFor(entry){
  if(entry?.kind) return entry.kind;
  if(entry?.type === "dir") return "Folder";
  const ext = String(entry?.ext || entry?.path?.split(".").pop() || "").toLowerCase();
  if(ext === "md") return "Markdown";
  if(ext === "mdc") return "Cursor Rule";
  if(ext === "toml") return "Agent TOML";
  if(ext === "json") return "JSON";
  if(ext === "txt") return "Text";
  return entry?.type === "file" ? "File" : "Folder";
}

function inferredImportance(path, type = "file"){
  const value = String(path || "").toLowerCase();
  if(/claude\.md|agents\.md|usage-guide|handbook|plugin_map|adr-0013|subagent_workflow|sop_new_feature|sop_bugfix/.test(value)) return "必读";
  if(/dev_log|design\.md|api\.md|test\.md|roadmap|workflow|skill|agent/.test(value)) return "必要";
  if(/adr|contracts|portable|release-log|branch-policy/.test(value)) return "系统级";
  return type === "dir" ? "参考" : "参考";
}

function docMetaFor(entry = {}){
  const hubMeta = docHub.by_path?.[entry.path] || {};
  const path = entry.path || hubMeta.path || "";
  return {
    ...entry,
    ...hubMeta,
    path,
    label: hubMeta.label || entry.label || entry.name || basename(path),
    summary: hubMeta.summary || entry.summary || (entry.type === "dir" ? "本地文件夹，点击进入查看子文档。" : "本地项目文档，内容来自仓库实时文件。"),
    type: hubMeta.type || entry.type || "file",
    kind: hubMeta.kind || docKindFor(entry),
    importance: hubMeta.importance || entry.importance || inferredImportance(path, entry.type),
    tags: hubMeta.tags || entry.tags || [],
    updated_at: entry.modified || hubMeta.updated_at || "",
    size_bytes: entry.size || hubMeta.size_bytes || 0
  };
}

function formatBytes(bytes){
  const n = Number(bytes) || 0;
  if(!n) return "—";
  if(n < 1024) return `${n} B`;
  if(n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(value){
  const ts = Date.parse(value || "");
  if(!Number.isFinite(ts)) return "—";
  return new Date(ts).toLocaleString("zh-CN", {dateStyle:"medium", timeStyle:"short"});
}

function fileIcon(entry){
  if(entry.type === "dir") return "DIR";
  const kind = docKindFor(entry);
  if(kind === "Markdown") return "MD";
  if(kind === "Agent TOML") return "TOML";
  if(kind === "JSON") return "JSON";
  if(kind === "Cursor Rule") return "MDC";
  return "TXT";
}

function docFamilyFor(entry = {}){
  const path = String(entry.path || "").toLowerCase();
  const value = `${path} ${entry.kind || ""} ${(entry.tags || []).join(" ")}`.toLowerCase();
  if(/(^|\/)(agents|claude)\.md$|\.cursor\/rules\/handoff|项目规则|规则文档/.test(value)) return "rules";
  if(/skill|agent toml|\.agents\/|\.codex\/agents|\.claude\/agents|\.claude\/agents-v2|\.teams\/skills|\.cursor\/agents/.test(value)) return "skill";
  if(/workflow|dev_log|sop_|usage-guide|roadmap|release-log|工作流|流程/.test(value)) return "workflow";
  if(/adr|contracts|portable|plugin_map|branch-policy|系统/.test(value)) return "system";
  return "reference";
}

function docCategoryLabel(entry = {}){
  const family = docFamilyFor(entry);
  if(family === "rules") return "项目规则文档";
  if(family === "skill") return "Skill / Agent 文档";
  if(family === "workflow") return "核心开发流程";
  if(entry.importance === "必读") return "必读文档";
  if(entry.importance === "系统级" || family === "system") return "系统性文档";
  return "普通参考文档";
}

function docTheme(entry = {}){
  const family = docFamilyFor(entry);
  if(family === "rules") return {tone:"#ea4335", bg:"#fff0ed"};
  if(family === "skill") return {tone:"#7c4dff", bg:"#f1edff"};
  if(family === "workflow") return {tone:"#b56f00", bg:"#fff7df"};
  if(entry.importance === "必读") return {tone:"#ea4335", bg:"#ffefed"};
  if(entry.importance === "必要") return {tone:"#1a73e8", bg:"#eaf2ff"};
  if(entry.importance === "系统级") return {tone:"#07849a", bg:"#e6f8fb"};
  return {tone:"#566175", bg:"#eef1f6"};
}

function docGroupImportance(group = {}){
  const value = `${group.key || ""} ${group.title || ""}`.toLowerCase();
  if(/must|必读|rule|规则/.test(value)) return "必读";
  if(/workflow|工作流|流程|roadmap|release/.test(value)) return "必要";
  if(/system|系统|adr|contract|portable/.test(value)) return "系统级";
  if(/skill|agent/.test(value)) return "必要";
  return group.importance || "参考";
}

function renderDocRecommendations(){
  const groups = docHub.groups || [];
  document.getElementById("docRecommendationGroups").innerHTML = groups.map(group => {
    const groupMeta = docMetaFor({
      path: group.key || group.title,
      label: group.title,
      summary: group.summary,
      importance: docGroupImportance(group)
    });
    const groupFamily = docFamilyFor({...groupMeta, path: `${group.key || ""} ${group.title || ""}`});
    return `
    <section class="doc-rec-card" data-importance="${h(groupMeta.importance)}" data-doc-family="${h(groupFamily)}">
      <b>${h(group.title)}</b>
      <span>${h(group.summary)}</span>
      <div class="doc-rec-meta">
        <span class="importance-pill" data-importance="${h(groupMeta.importance)}">${h(groupMeta.importance)}</span>
        <span class="pill">${h(docCategoryLabel({...groupMeta, path: `${group.key || ""} ${group.title || ""}`}))}</span>
      </div>
      <div class="doc-rec-links">
        ${(group.entries || []).slice(0, 4).map(entry => {
          const meta = docMetaFor(entry);
          return `
          <button class="doc-rec-link" data-importance="${h(meta.importance)}" data-doc-family="${h(docFamilyFor(meta))}" data-library-path="${h(meta.path)}" data-library-type="${h(meta.type || "file")}" type="button">
            <span>${h(meta.label)}</span>
            <small>${h(docCategoryLabel(meta))}</small>
          </button>
        `;
        }).join("")}
      </div>
    </section>
  `;
  }).join("");
  document.querySelectorAll("#docRecommendationGroups [data-library-path]").forEach(button => {
    button.addEventListener("click", () => openLibraryEntry(button.dataset.libraryPath, button.dataset.libraryType));
  });
}

function renderDocRoots(){
  const roots = docHub.roots?.length ? docHub.roots : [
    {label:"docs", path:"docs", summary:"项目文档根目录", type:"dir", importance:"必读"},
    {label:".teams/skills", path:".teams/skills", summary:"项目级 skills", type:"dir", importance:"必要"},
    {label:".codex/agents", path:".codex/agents", summary:"Codex agents", type:"dir", importance:"必要"}
  ];
  document.getElementById("docRootList").innerHTML = roots.map(root => {
    const meta = docMetaFor(root);
    return `
    <button class="doc-root-button ${currentTreeDir === meta.path || currentTreeDir.startsWith(`${meta.path}/`) ? "is-on" : ""}" data-importance="${h(meta.importance)}" data-doc-family="${h(docFamilyFor(meta))}" data-root-path="${h(meta.path)}" type="button">
      ${h(meta.label)}
      <span>${h(docCategoryLabel(meta))} · ${h(meta.path)}</span>
    </button>
  `;
  }).join("");
  document.querySelectorAll("[data-root-path]").forEach(button => {
    button.addEventListener("click", () => openLibraryEntry(button.dataset.rootPath, "dir"));
  });
}

function renderBranchDocs(){
  document.getElementById("branchDocs").innerHTML = branchDocSeeds().map(([label, path]) => `
    <button class="reader-btn" data-doc-path="${h(path)}" type="button">${h(label)}</button>
  `).join("");
  document.querySelectorAll("[data-doc-path]").forEach(button => {
    button.addEventListener("click", () => openDoc(button.dataset.docPath, {fullscreen:true}));
  });
}

function openLibraryEntry(path, type = "file"){
  if(!serveMode){
    renderStaticDocLibraryNotice(type === "dir" ? "浏览文件夹" : "打开文档", path);
    return;
  }
  if(type === "dir") loadTree(path);
  else openDoc(path, {fullscreen:true});
}

function localServiceHint(action = "浏览真实目录", path = ""){
  const currentMode = httpMode ? "普通 HTTP 静态预览" : "file:// 静态预览";
  const reason = httpMode ? "当前 HTTP 服务未提供 Dashboard API（/api/tree、/api/file）。" : "浏览器不能直接读取仓库目录 API。";
  return `
    <div class="flow-note" style="margin:12px">
      <b>${h(action)}需要本地服务</b>
      <p style="margin-top:8px">当前页面是 <code>${h(currentMode)}</code>，${h(reason)}</p>
      <p style="margin-top:8px">运行 <code>pnpm dashboard:serve</code> 后打开 <code>http://127.0.0.1:4177/#docs</code>，即可点击文件夹、上级、刷新和文档进入实时浏览。</p>
      ${path ? `<p style="margin-top:8px">目标路径：<code>${h(path)}</code></p>` : ""}
    </div>
  `;
}

function renderStaticDocLibraryNotice(action = "浏览真实目录", path = ""){
  document.getElementById("treePathLabel").textContent = path || "静态预览";
  document.getElementById("folderSummary").textContent = "静态模式 · 启动本地服务后可点击浏览";
  document.getElementById("docFolderList").innerHTML = localServiceHint(action, path);
  document.getElementById("docTree").innerHTML = localServiceHint("展开目录树", path);
  document.getElementById("docPreviewSource").textContent = "静态预览不能读取文件内容；启动本地服务后可全屏浏览文档。";
  document.getElementById("markdownBody").innerHTML = localServiceHint(action, path);
}

function initStaticDocLibrary(){
  if(docStaticHandlersAttached) return;
  docStaticHandlersAttached = true;
  document.getElementById("serveNotice").textContent = "静态预览 · 目录点击需要本地服务";
  document.getElementById("treeUpButton").disabled = false;
  document.getElementById("docRefreshFolderButton").disabled = false;
  document.getElementById("docRefreshButton").disabled = false;
  document.getElementById("docOpenButton").disabled = false;
  document.getElementById("docFullscreenButton").disabled = true;
  const staticAction = action => { if(!serveMode) renderStaticDocLibraryNotice(action); };
  document.getElementById("treeUpButton").addEventListener("click", () => staticAction("返回上级目录"));
  document.getElementById("docRefreshFolderButton").addEventListener("click", () => staticAction("刷新目录"));
  document.getElementById("docRefreshButton").addEventListener("click", () => staticAction("刷新文档库"));
  document.getElementById("docOpenButton").addEventListener("click", () => staticAction("查看文档"));
  document.getElementById("docCopyButton").addEventListener("click", () => staticAction("复制路径"));
  document.getElementById("docRevealButton").addEventListener("click", () => staticAction("在 Finder 显示"));
  document.getElementById("docSearchButton").addEventListener("click", () => staticAction("搜索文档"));
  document.querySelector(".doc-folder-toolbar")?.addEventListener("click", event => {
    if(event.target.id !== "treeUpButton") staticAction("浏览当前文件夹");
  });
  document.getElementById("docSearch").addEventListener("keydown", event => {
    if(event.key === "Enter") staticAction("搜索文档");
  });
}

function renderDocCollections(){
  const tabs = document.getElementById("docCategoryTabs");
  const panel = document.getElementById("docCategoryPanel");
  if(!docCollections.length){
    tabs.innerHTML = "";
    panel.innerHTML = `<div class="flow-note"><b>文档分类未生成</b><p style="margin-top:8px">运行 <code>node scripts/dashboard/generate-state.mjs</code> 刷新快照。</p></div>`;
    return;
  }
  if(!docCollections.some(item => item.key === currentDocCollection)){
    currentDocCollection = docCollections[0].key;
  }
  tabs.innerHTML = docCollections.map(item => `
    <button class="doc-cat-tab ${item.key === currentDocCollection ? "is-on" : ""}" data-doc-category="${h(item.key)}" type="button">
      ${h(item.title)}
      <small>${h(String(item.count || 0))} entries</small>
    </button>
  `).join("");
  const selected = docCollections.find(item => item.key === currentDocCollection) || docCollections[0];
  const entries = selected.entries || [];
  panel.innerHTML = `
    <div class="doc-cat-summary">
      <b>${h(selected.title)}</b>
      <span>${h(selected.summary)}</span>
      <div class="chip-row">${(selected.tags || []).map(tag => `<span class="pill">${h(tag)}</span>`).join("")}</div>
    </div>
    <div class="doc-card-grid">
      ${entries.map(entry => `
        <button class="doc-card" data-library-path="${h(entry.path)}" data-library-type="${h(entry.type || "file")}" type="button">
          <b>${h(entry.label)}</b>
          <span>${h(entry.summary || "")}</span>
          <div class="chip-row">${(entry.tags || []).slice(0,2).map(tag => `<span class="pill">${h(tag)}</span>`).join("")}</div>
          <code>${h(entry.path)}</code>
        </button>
      `).join("") || `<div class="flow-note"><b>暂无条目</b></div>`}
    </div>
  `;
  document.querySelectorAll("[data-doc-category]").forEach(button => {
    button.addEventListener("click", () => {
      currentDocCollection = button.dataset.docCategory;
      renderDocCollections();
    });
  });
  document.querySelectorAll("[data-library-path]").forEach(button => {
    button.addEventListener("click", () => openLibraryEntry(button.dataset.libraryPath, button.dataset.libraryType));
  });
}

function renderInspector(entry = currentDocEntry){
  const meta = docMetaFor(entry || {});
  currentDocEntry = meta.path ? meta : currentDocEntry;
  const title = meta.path ? meta.label : "未选择文档";
  const source = meta.path || "选择左侧文件夹或中间文件";
  const importance = meta.importance || "参考";
  const category = docCategoryLabel(meta);
  const family = docFamilyFor(meta);
  const titleShell = document.querySelector(".doc-inspector-title");
  if(titleShell){
    titleShell.dataset.importance = importance;
    titleShell.dataset.docFamily = family;
  }
  const importanceNode = document.getElementById("docImportancePill");
  importanceNode.textContent = importance;
  importanceNode.dataset.importance = importance;
  document.getElementById("docTitle").textContent = title;
  document.getElementById("docSource").textContent = source;
  document.getElementById("docPreviewSource").textContent = meta.path ? `${category} · ${meta.kind} · ${meta.path}` : "选择 Markdown / TOML / JSON 文档后在这里预览。";
  document.getElementById("docMetaGrid").innerHTML = meta.path ? `
    <div><b>类型</b><span>${h(meta.kind)}</span></div>
    <div><b>重要性</b><span>${h(importance)}</span></div>
    <div><b>分类</b><span>${h(category)}</span></div>
    <div><b>路径</b><span>${h(meta.path)}</span></div>
    <div><b>更新</b><span>${h(formatDate(meta.updated_at))}</span></div>
    <div><b>大小</b><span>${h(formatBytes(meta.size_bytes))}</span></div>
    <div><b>标签</b><span>${h((meta.tags || []).join(" / ") || "—")}</span></div>
    <div><b>说明</b><span>${h(meta.summary)}</span></div>
  ` : `<div><b>状态</b><span>请选择一个文档或文件夹</span></div>`;
  updateFullscreenButton();
}

function renderFolderList(children = currentTreeChildren){
  const q = document.getElementById("docSearch")?.value.trim().toLowerCase() || "";
  const filtered = (children || []).filter(item => {
    if(!q) return true;
    const meta = docMetaFor(item);
    return `${meta.label} ${meta.path} ${meta.summary} ${(meta.tags || []).join(" ")}`.toLowerCase().includes(q);
  });
  const dirs = filtered.filter(item => item.type === "dir").length;
  const files = filtered.filter(item => item.type !== "dir").length;
  document.getElementById("folderSummary").textContent = `${dirs} 个文件夹 · ${files} 个文档`;
  const rows = filtered.map(item => {
    const meta = docMetaFor(item);
    return `
      <button class="doc-item-row ${meta.path === currentDocPath ? "is-on" : ""}" data-importance="${h(meta.importance)}" data-doc-family="${h(docFamilyFor(meta))}" data-folder-type="${h(meta.type)}" data-folder-path="${h(meta.path)}" type="button">
        <span class="doc-icon">${h(fileIcon(meta))}</span>
        <span class="doc-item-main">
          <b>${h(meta.label)}</b>
          <span>${h(docCategoryLabel(meta))} · ${h(meta.path)}</span>
        </span>
        <span class="doc-item-meta">
          <span class="importance-pill" data-importance="${h(meta.importance)}">${h(meta.importance)}</span>
          <span class="pill">${h(meta.kind)}</span>
        </span>
      </button>
    `;
  }).join("");
  document.getElementById("docFolderList").innerHTML = rows ? `
    <div class="doc-folder-list-head"><span></span><span>名称 / 路径</span><span>级别 / 类型</span></div>
    ${rows}
  ` : `<div class="flow-note" style="margin:12px"><b>当前筛选无结果</b><p style="margin-top:6px">清空搜索或返回上级目录。</p></div>`;
  document.querySelectorAll("[data-folder-path]").forEach(button => {
    button.addEventListener("click", () => {
      if(button.dataset.folderType === "dir") openLibraryEntry(button.dataset.folderPath, "dir");
      else openLibraryEntry(button.dataset.folderPath, "file");
    });
  });
}

function renderTree(children){
  document.getElementById("docTree").innerHTML = children.map(item => {
    const meta = docMetaFor(item);
    return `
    <button class="tree-row ${meta.path === currentDocPath || meta.path === currentTreeDir ? "is-on" : ""}" data-tree-type="${h(meta.type)}" data-tree-path="${h(meta.path)}" type="button">
      <span>${meta.type === "dir" ? "›" : "·"}</span>
      <span>${h(item.virtual ? item.name : meta.label)}</span>
    </button>
  `;
  }).join("");
  document.querySelectorAll("[data-tree-path]").forEach(button => {
    button.addEventListener("click", () => {
      if(button.dataset.treeType === "dir") loadTree(button.dataset.treePath);
      else openDoc(button.dataset.treePath, {fullscreen:true});
    });
  });
}

async function loadTree(dir = "", prefetchedData = null){
  if(!serveMode) return;
  let data = prefetchedData;
  try {
    if(!data) data = await fetchJson(`/api/tree?dir=${encodeURIComponent(dir)}`);
  } catch (error) {
    renderTreeError(error, dir);
    return false;
  }
  currentTreeDir = data.path || "";
  currentTreeChildren = data.children || [];
  document.getElementById("treePathLabel").textContent = currentTreeDir || "文档根目录";
  document.getElementById("treeUpButton").disabled = !currentTreeDir;
  renderDocRoots();
  renderTree(currentTreeChildren);
  renderFolderList(currentTreeChildren);
  renderInspector(docMetaFor({path: currentTreeDir, type: "dir", name: basename(currentTreeDir)}));
  if(!currentDocPath || currentDocPath.startsWith(currentTreeDir)){
    document.getElementById("markdownBody").innerHTML = `<div class="flow-note"><b>${h(currentTreeDir || "文档根目录")}</b><p style="margin-top:8px">从中间列表选择文档后预览内容；文件夹内容已实时从本地目录读取。</p></div>`;
    renderOutline("");
  }
  return true;
}

function parentDir(path){
  if(!path) return "";
  const parts = path.split("/").filter(Boolean);
  parts.pop();
  return parts.join("/");
}

const browsableTreeRoots = [
  "docs",
  ".agents/templates",
  ".agents/skills",
  ".teams/skills",
  ".codex/agents",
  ".codex/skills",
  ".claude/agents",
  ".claude/skills",
  ".cursor/agents",
  ".cursor/rules",
  "web design"
];

function isBrowsableTreeDir(path){
  if(!path || path === "packages") return true;
  if(/^packages\/[^/]+\/docs(\/|$)/.test(path)) return true;
  return browsableTreeRoots.some(root => path === root || path.startsWith(`${root}/`));
}

function parentTreeDir(path){
  const parent = parentDir(path);
  if(!parent) return "";
  if(isBrowsableTreeDir(parent)) return parent;
  if(/^packages\/[^/]+\/docs(\/|$)/.test(path)) return "packages";
  return "";
}

function renderTreeError(error, dir){
  const message = error?.message || "目录读取失败";
  document.getElementById("folderSummary").textContent = "目录读取失败";
  document.getElementById("docFolderList").innerHTML = `
    <div class="flow-note" style="margin:12px">
      <b>无法打开目录</b>
      <p style="margin-top:8px">${h(message)}</p>
      ${dir ? `<p style="margin-top:8px">目标路径：<code>${h(dir)}</code></p>` : ""}
      <p style="margin-top:8px">可以返回文档根目录，或从左侧选择一个可浏览的文档入口。</p>
    </div>
  `;
}

function renderInlineMarkdown(text){
  return h(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function headingId(text, index){
  const slug = String(text)
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);
  return `section-${index}-${slug || "heading"}`;
}

function collectHeadings(markdown){
  const headings = [];
  String(markdown || "").split(/\r?\n/).forEach(line => {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if(match){
      headings.push({
        level: match[1].length,
        text: match[2].replace(/`/g, "").trim(),
        id: headingId(match[2], headings.length)
      });
    }
  });
  return headings;
}

function renderMarkdown(markdown){
  const lines = String(markdown || "").split(/\r?\n/);
  const html = [];
  let inCode = false;
  let inList = false;
  let tableRows = [];
  let headingIndex = 0;
  function closeList(){
    if(inList){ html.push("</ul>"); inList = false; }
  }
  function flushTable(){
    if(!tableRows.length) return;
    const rows = tableRows.map(line => line.replace(/^\|/, "").replace(/\|$/, "").split("|").map(cell => cell.trim()));
    const [head, sep, ...body] = rows;
    if(sep && sep.every(cell => /^:?-{3,}:?$/.test(cell))){
      html.push(`<table><thead><tr>${head.map(cell => `<th>${renderInlineMarkdown(cell)}</th>`).join("")}</tr></thead><tbody>${body.map(row => `<tr>${row.map(cell => `<td>${renderInlineMarkdown(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
    } else {
      rows.forEach(row => html.push(`<p>${renderInlineMarkdown(row.join(" | "))}</p>`));
    }
    tableRows = [];
  }
  lines.forEach(line => {
    if(line.startsWith("```")){
      flushTable();
      closeList();
      if(inCode) html.push("</code></pre>");
      else html.push("<pre><code>");
      inCode = !inCode;
      return;
    }
    if(inCode){
      html.push(`${h(line)}\n`);
      return;
    }
    if(line.trim().startsWith("|")){
      closeList();
      tableRows.push(line);
      return;
    }
    flushTable();
    if(!line.trim()){
      closeList();
      return;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if(heading){
      closeList();
      const id = headingId(heading[2], headingIndex);
      headingIndex += 1;
      html.push(`<h${heading[1].length} id="${h(id)}">${renderInlineMarkdown(heading[2])}</h${heading[1].length}>`);
      return;
    }
    if(line.startsWith(">")){
      closeList();
      html.push(`<blockquote>${renderInlineMarkdown(line.replace(/^>\s?/, ""))}</blockquote>`);
      return;
    }
    if(/^---+$/.test(line.trim())){
      closeList();
      html.push("<hr>");
      return;
    }
    const bullet = line.match(/^\s*[-*]\s+(.+)$/);
    if(bullet){
      if(!inList){ html.push("<ul>"); inList = true; }
      html.push(`<li>${renderInlineMarkdown(bullet[1])}</li>`);
      return;
    }
    closeList();
    html.push(`<p>${renderInlineMarkdown(line)}</p>`);
  });
  flushTable();
  closeList();
  if(inCode) html.push("</code></pre>");
  return html.join("");
}

function renderOutline(markdown){
  const headings = collectHeadings(markdown).slice(0, 24);
  document.getElementById("docOutline").innerHTML = headings.length ? `
    <div class="outline-title">文档目录</div>
    <div class="outline-list">
      ${headings.map(heading => `
        <button class="outline-row" data-outline-id="${h(heading.id)}" data-level="${h(heading.level)}" type="button">${h(heading.text)}</button>
      `).join("")}
    </div>
  ` : `<div class="flow-note"><b>无标题</b><p style="margin-top:8px">当前文件没有 Markdown 标题。</p></div>`;
  document.querySelectorAll("[data-outline-id]").forEach(button => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.outlineId);
      if(target) target.scrollIntoView({block:"start", behavior:"smooth"});
    });
  });
}

function updateFullscreenButton(){
  const button = document.getElementById("docFullscreenButton");
  if(!button) return;
  const canRead = Boolean(serveMode && currentDocPath && currentDocEntry?.type !== "dir");
  button.disabled = !canRead;
  button.textContent = canRead ? "全屏浏览" : "选择文档";
}

function renderFullscreenReader(){
  if(!currentDocPath || currentDocEntry?.type === "dir") return;
  const meta = docMetaFor(currentDocEntry);
  const theme = docTheme(meta);
  const category = docCategoryLabel(meta);
  const head = document.getElementById("docFullscreenHead");
  if(head){
    head.style.setProperty("--doc-fullscreen-bg", theme.bg);
    head.style.setProperty("--doc-fullscreen-tone", theme.tone);
  }
  document.getElementById("docFullscreenTitle").textContent = meta.label || basename(currentDocPath);
  document.getElementById("docFullscreenSource").textContent = `${category} · ${meta.importance} · ${meta.kind} · ${meta.path}`;
  document.getElementById("docFullscreenBody").innerHTML = renderMarkdown(currentDocContent);
}

function openFullscreenReader(){
  if(!serveMode || !currentDocPath || currentDocEntry?.type === "dir") return;
  renderFullscreenReader();
  const overlay = document.getElementById("docFullscreenOverlay");
  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("doc-fullscreen-active");
  document.getElementById("docExitFullscreenButton").focus();
}

function closeFullscreenReader(){
  const overlay = document.getElementById("docFullscreenOverlay");
  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("doc-fullscreen-active");
  document.getElementById("docFullscreenButton")?.focus();
}

async function openDoc(path, options = {}){
  if(!serveMode){
    renderStaticDocLibraryNotice("打开文档", path);
    return;
  }
  let doc;
  try {
    doc = await fetchJson(`/api/file?path=${encodeURIComponent(path)}`);
  } catch (error) {
    currentDocPath = path;
    currentDocContent = "";
    currentDocEntry = docMetaFor({path, type:"file", name:basename(path)});
    renderInspector(currentDocEntry);
    document.getElementById("markdownBody").innerHTML = `<div class="flow-note"><b>文档读取失败</b><p style="margin-top:8px">${h(error.message)}</p></div>`;
    renderOutline("");
    return;
  }
  currentDocPath = doc.path;
  currentDocContent = doc.content || "";
  currentDocEntry = docMetaFor({
    name: doc.name,
    path: doc.path,
    type: "file",
    ext: doc.ext,
    size: doc.size,
    modified: doc.modified
  });
  renderInspector(currentDocEntry);
  document.getElementById("markdownBody").innerHTML = renderMarkdown(doc.content);
  renderOutline(doc.content);
  if(document.getElementById("docFullscreenOverlay")?.classList.contains("is-open")){
    renderFullscreenReader();
  } else if(options.fullscreen){
    openFullscreenReader();
  }
  document.querySelectorAll("[data-tree-path]").forEach(button => button.classList.toggle("is-on", button.dataset.treePath === currentDocPath));
  document.querySelectorAll("[data-folder-path]").forEach(button => button.classList.toggle("is-on", button.dataset.folderPath === currentDocPath));
}

function escapeRegExp(value){
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(value, query){
  const html = h(value);
  if(!query) return html;
  const escapedQuery = h(query);
  return html.replace(new RegExp(escapeRegExp(escapedQuery), "ig"), match => `<mark>${match}</mark>`);
}

async function searchDocs(){
  if(!serveMode) return;
  const q = document.getElementById("docSearch").value.trim();
  const data = await fetchJson(`/api/search?q=${encodeURIComponent(q)}`);
  const root = document.getElementById("searchResults");
  root.classList.toggle("is-on", Boolean(q));
  root.innerHTML = (data.results || []).map(result => `
    <button class="tree-row search-row" data-search-path="${h(result.path)}" type="button">
      <span>${h(result.line)}</span>
      <span><b>${h(result.path)}</b> ${highlight(result.text, q)}</span>
    </button>
  `).join("") || `<div class="flow-note"><b>无结果</b></div>`;
  document.querySelectorAll("[data-search-path]").forEach(button => {
    button.addEventListener("click", () => openDoc(button.dataset.searchPath, {fullscreen:true}));
  });
}

function renderRegistry(){
  const rows = [
    ...skills.map(item => ({...item, kind:"skill"})),
    ...agents.map(item => ({...item, kind:"agent"}))
  ];
  document.getElementById("registryGrid").innerHTML = rows.map(item => `
    <div class="registry-row">
      <div>
        <b>${h(item.kind)} · ${h(item.name)}</b>
        <span class="registry-desc">${h(item.desc)}</span>
        <span class="registry-trigger">${h((item.triggers || []).join(" · ") || "trigger: template / direct dispatch")}</span>
        <span>${h(item.path)}</span>
      </div>
      <span class="badge ${badgeClass(item.status)}">${h(item.status)}</span>
    </div>
  `).join("");
}

function attachLiveDocHandlers(){
  if(docLiveHandlersAttached) return;
  docLiveHandlersAttached = true;
  const searchInput = document.getElementById("docSearch");
  document.getElementById("docSearchButton").addEventListener("click", searchDocs);
  searchInput.addEventListener("keydown", event => { if(event.key === "Enter") searchDocs(); });
  searchInput.addEventListener("input", () => renderFolderList());
  document.getElementById("treeUpButton").addEventListener("click", () => loadTree(parentTreeDir(currentTreeDir)));
  document.getElementById("docRefreshFolderButton").addEventListener("click", () => loadTree(currentTreeDir));
  document.getElementById("docRefreshButton").addEventListener("click", async () => {
    await fetchJson("/api/refresh");
    location.reload();
  });
  document.getElementById("docOpenButton").addEventListener("click", () => {
    if(currentDocEntry?.type === "dir") loadTree(currentDocEntry.path);
    else if(currentDocPath) openFullscreenReader();
  });
  document.getElementById("docFullscreenButton").addEventListener("click", openFullscreenReader);
  document.getElementById("docExitFullscreenButton").addEventListener("click", closeFullscreenReader);
  document.getElementById("docFullscreenCopyButton").addEventListener("click", () => {
    const path = currentDocEntry?.type === "dir" ? "" : currentDocPath;
    if(path) copyText(path, document.getElementById("docFullscreenCopyButton"));
  });
  document.getElementById("docFullscreenOverlay").addEventListener("click", event => {
    if(event.target.id === "docFullscreenOverlay") closeFullscreenReader();
  });
  window.addEventListener("keydown", event => {
    if(event.key === "Escape" && document.getElementById("docFullscreenOverlay")?.classList.contains("is-open")){
      closeFullscreenReader();
    }
  });
  document.getElementById("docCopyButton").addEventListener("click", async () => {
    const path = currentDocEntry?.path || currentDocPath;
    if(path) copyText(path, document.getElementById("docCopyButton"));
  });
  document.getElementById("docRevealButton").addEventListener("click", async () => {
    const path = currentDocEntry?.path || currentDocPath;
    if(path) await fetchJson(`/api/reveal?path=${encodeURIComponent(path)}`);
  });
}

async function maybeActivateDocServeMode(){
  if(serveMode || !httpMode) return serveMode;
  if(docApiCheckStarted && docApiCheckPromise) return docApiCheckPromise;
  docApiCheckStarted = true;
  docApiCheckPromise = (async () => {
    const initialTree = await detectDashboardApi();
    setDocServeMode(Boolean(initialTree));
    if(!serveMode){
      renderStaticDocLibraryNotice();
      return false;
    }
    attachLiveDocHandlers();
    const ok = await loadTree("", initialTree);
    if(ok && !currentDocPath) openDoc("AGENTS.md");
    return serveMode;
  })();
  return docApiCheckPromise;
}

function initDocLibrary(){
  setDocServeMode(false);
  renderDocRecommendations();
  renderDocRoots();
  renderInspector();
  renderStaticDocLibraryNotice();
  initStaticDocLibrary();
  if(location.hash === "#docs") maybeActivateDocServeMode();
}
