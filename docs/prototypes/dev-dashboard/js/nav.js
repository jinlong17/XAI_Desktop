const DEFAULT_NAV_ITEMS = [
  {page:"overview", label:"总览"},
  {page:"tasks", label:"任务进度"},
  {page:"dev-data", label:"开发数据"},
  {page:"branches", label:"分支管理"},
  {page:"product-flow", label:"产品结构图"},
  {page:"docs", label:"文档库"},
  {page:"skill-agent", label:"Skill 和 Agent"},
  {page:"release-log", label:"发布记录"}
];
const pageIds = DEFAULT_NAV_ITEMS.map(item => item.page);
const navItemByPage = new Map(DEFAULT_NAV_ITEMS.map(item => [item.page, item]));
const NAV_ORDER_STORAGE_KEY = "xai-dev-dashboard.navOrder.v1";
let currentPage = "overview";
let navOrder = readNavOrder();
let navDragState = null;
let navDropPlacement = null;

function sameOrder(a, b){
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function sanitizeNavOrder(order){
  const seen = new Set();
  const next = [];
  (Array.isArray(order) ? order : []).forEach(page => {
    if(pageIds.includes(page) && !seen.has(page)){
      seen.add(page);
      next.push(page);
    }
  });
  pageIds.forEach(page => {
    if(!seen.has(page)) next.push(page);
  });
  return next;
}

function readNavOrder(){
  try{
    const raw = localStorage.getItem(NAV_ORDER_STORAGE_KEY);
    return sanitizeNavOrder(raw ? JSON.parse(raw) : pageIds);
  }catch{
    return [...pageIds];
  }
}

function saveNavOrder(){
  try{
    if(sameOrder(navOrder, pageIds)){
      localStorage.removeItem(NAV_ORDER_STORAGE_KEY);
      return;
    }
    localStorage.setItem(NAV_ORDER_STORAGE_KEY, JSON.stringify(navOrder));
  }catch{}
}

function syncNavActive(page = currentPage){
  document.querySelectorAll(".nav a[data-page]").forEach(link => {
    link.classList.toggle("is-active", link.dataset.page === page);
  });
}

function moveNavPage(page, direction){
  const index = navOrder.indexOf(page);
  const nextIndex = direction === "up" ? index - 1 : index + 1;
  if(index < 0 || nextIndex < 0 || nextIndex >= navOrder.length) return;
  [navOrder[index], navOrder[nextIndex]] = [navOrder[nextIndex], navOrder[index]];
  saveNavOrder();
  renderPrimaryNav();
}

function clearNavDropIndicators(){
  document.querySelectorAll("#primaryNavList .nav-item").forEach(item => {
    item.classList.remove("is-drop-before", "is-drop-after");
  });
}

function showNavDropPlacement(placement){
  clearNavDropIndicators();
  navDropPlacement = placement;
  if(!placement) return;
  const target = document.querySelector(`#primaryNavList [data-nav-item="${placement.targetPage}"]`);
  target?.classList.add(placement.position === "after" ? "is-drop-after" : "is-drop-before");
}

function navPlacementFromCoordinates(clientX, clientY){
  const list = document.getElementById("primaryNavList");
  if(!list || !navDragState) return null;
  const items = [...list.querySelectorAll(".nav-item")]
    .filter(item => item.dataset.navItem !== navDragState.page);
  if(!items.length) return null;
  const isHorizontal = getComputedStyle(list).display === "flex";
  const ordered = items.sort((a, b) => {
    const ar = a.getBoundingClientRect();
    const br = b.getBoundingClientRect();
    return isHorizontal ? ar.left - br.left : ar.top - br.top;
  });
  for(const item of ordered){
    const rect = item.getBoundingClientRect();
    const midpoint = isHorizontal ? rect.left + rect.width / 2 : rect.top + rect.height / 2;
    const pointer = isHorizontal ? clientX : clientY;
    if(pointer < midpoint){
      return {targetPage:item.dataset.navItem, position:"before"};
    }
  }
  return {targetPage:ordered[ordered.length - 1].dataset.navItem, position:"after"};
}

function reorderNavPage(page, placement){
  if(!page || !placement) return;
  const withoutDragged = navOrder.filter(item => item !== page);
  const anchorIndex = withoutDragged.indexOf(placement.targetPage);
  if(anchorIndex < 0) return;
  const insertIndex = placement.position === "after" ? anchorIndex + 1 : anchorIndex;
  const nextOrder = [
    ...withoutDragged.slice(0, insertIndex),
    page,
    ...withoutDragged.slice(insertIndex)
  ];
  if(sameOrder(nextOrder, navOrder)) return;
  navOrder = sanitizeNavOrder(nextOrder);
  saveNavOrder();
  renderPrimaryNav();
}

function cleanupNavDrag(){
  window.removeEventListener("pointermove", handleNavDragMove);
  window.removeEventListener("pointerup", finishNavDrag);
  document.body.classList.remove("is-nav-dragging");
  document.querySelectorAll("#primaryNavList .nav-item").forEach(item => {
    item.classList.remove("is-dragging", "is-drop-before", "is-drop-after");
  });
  navDragState = null;
  navDropPlacement = null;
}

function handleNavDragMove(event){
  if(!navDragState) return;
  const dx = event.clientX - navDragState.startX;
  const dy = event.clientY - navDragState.startY;
  if(!navDragState.active && Math.hypot(dx, dy) < 4) return;
  event.preventDefault();
  navDragState.active = true;
  showNavDropPlacement(navPlacementFromCoordinates(event.clientX, event.clientY));
}

function finishNavDrag(event){
  if(!navDragState) return;
  const page = navDragState.page;
  const placement = navDropPlacement || (navDragState.active ? navPlacementFromCoordinates(event.clientX, event.clientY) : null);
  const shouldReorder = navDragState.active && placement;
  cleanupNavDrag();
  if(shouldReorder) reorderNavPage(page, placement);
}

function startNavDrag(event, page){
  if(event.button !== undefined && event.button !== 0) return;
  const item = event.currentTarget.closest(".nav-item");
  if(!item) return;
  event.preventDefault();
  navDragState = {
    page,
    startX:event.clientX,
    startY:event.clientY,
    active:false
  };
  item.classList.add("is-dragging");
  document.body.classList.add("is-nav-dragging");
  window.addEventListener("pointermove", handleNavDragMove, {passive:false});
  window.addEventListener("pointerup", finishNavDrag);
}

function renderPrimaryNav(){
  const list = document.getElementById("primaryNavList");
  if(!list) return;
  list.innerHTML = navOrder.map((page, index) => {
    const item = navItemByPage.get(page);
    if(!item) return "";
    return `
      <div class="nav-item" data-nav-item="${h(item.page)}">
        <a class="nav-link" href="#${h(item.page)}" data-page="${h(item.page)}" draggable="false"><span>${h(item.label)}</span></a>
        <span class="nav-drag-handle" data-nav-drag-page="${h(item.page)}" role="button" tabindex="0" aria-label="拖拽移动 ${h(item.label)}" title="拖拽排序">⋮⋮</span>
      </div>
    `;
  }).join("");
  list.querySelectorAll("a[data-page]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      setPage(link.dataset.page);
    });
  });
  list.querySelectorAll("[data-nav-drag-page]").forEach(handle => {
    handle.addEventListener("pointerdown", event => startNavDrag(event, handle.dataset.navDragPage));
    handle.addEventListener("keydown", event => {
      if(event.key === "ArrowUp" || event.key === "ArrowLeft"){
        event.preventDefault();
        moveNavPage(handle.dataset.navDragPage, "up");
      }
      if(event.key === "ArrowDown" || event.key === "ArrowRight"){
        event.preventDefault();
        moveNavPage(handle.dataset.navDragPage, "down");
      }
    });
  });
  const resetButton = document.getElementById("navOrderReset");
  if(resetButton){
    resetButton.disabled = sameOrder(navOrder, pageIds);
    resetButton.onclick = () => {
      navOrder = [...pageIds];
      saveNavOrder();
      renderPrimaryNav();
    };
  }
  syncNavActive();
}

function setPage(page, updateHash = true){
  const nextPage = pageIds.includes(page) ? page : "overview";
  currentPage = nextPage;
  document.querySelectorAll("[data-page-section]").forEach(section => {
    section.classList.toggle("is-active", section.dataset.pageSection === nextPage);
  });
  if(nextPage === "docs" && typeof maybeActivateDocServeMode === "function"){
    maybeActivateDocServeMode();
  }
  syncNavActive(nextPage);
  if(updateHash && location.hash !== `#${nextPage}`){
    history.pushState(null, "", `#${nextPage}`);
  }
  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
    setTimeout(() => window.scrollTo(0, 0), 0);
  });
}
