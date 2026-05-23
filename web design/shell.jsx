/* ============================================================
   App Shell — rail + module sidebar + topbar + avatar menu
   ============================================================ */

const { useState, useEffect, useMemo, useRef } = React;
const Icon = window.Icon;
const I18N = window.I18N;
const MOCK = window.MOCK;

window.useI18n = function(lang){
  const t = I18N[lang];
  return {
    t,
    s: (path) => path.split(".").reduce((o,k)=>o?.[k], t) ?? path,
  };
};

/* ---------- Avatar dropdown menu ---------- */
function AvatarMenu({ open, onClose, setModule, lang }){
  const { s } = window.useI18n(lang);
  if (!open) return null;
  const items = [
    { id:"settings",   icon:"sliders", key:"settings" },
    { id:"statistics", icon:"chart",   key:"statistics" },
    { id:"signout",    icon:"download",key:"sign_out", danger:false, divider:true },
  ];
  return (
    <>
      <div className="avatar-menu-scrim" onClick={onClose}/>
      <div className="avatar-menu" role="menu">
        <div className="avm-header">
          <div className="avm-avatar">
            <svg viewBox="0 0 40 40" width="36" height="36">
              <defs>
                <linearGradient id="avmg" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#d8c8b7"/>
                  <stop offset="1" stopColor="#a08877"/>
                </linearGradient>
              </defs>
              <rect width="40" height="40" fill="url(#avmg)"/>
              <circle cx="20" cy="16" r="6" fill="#fff" opacity=".7"/>
              <ellipse cx="20" cy="32" rx="11" ry="7" fill="#fff" opacity=".55"/>
            </svg>
            <span className="avm-crown"><Icon name="star" size={10}/></span>
          </div>
          <div className="avm-id">
            <div className="avm-name">{lang==="zh" ? "百事可爱" : "Aki Chen"}</div>
            <div className="avm-mail">aki.chen@xai.app</div>
          </div>
        </div>
        <div className="avm-items">
          <button className="avm-item" onClick={()=>{ setModule("settings"); onClose(); }}>
            <Icon name="sliders" size={16}/><span>{s("avatar.settings")}</span>
          </button>
          <button className="avm-item" onClick={()=>{ setModule("statistics"); onClose(); }}>
            <Icon name="chart" size={16}/><span>{s("avatar.statistics")}</span>
          </button>
          <div className="avm-divider"></div>
          <button className="avm-item danger">
            <Icon name="download" size={16} style={{transform:"rotate(180deg)"}}/>
            <span>{s("avatar.sign_out")}</span>
          </button>
        </div>
      </div>
    </>
  );
}

/* ---------- App Rail ---------- */
function AppRail({ module, setModule, lang, petOn, setPetOn, railPos }){
  const [avatarOpen, setAvatarOpen] = useState(false);
  const DEFAULT_ITEMS = [
    { id:"ai",         icon:"sparkle" },
    { id:"tasks",      icon:"check" },
    { id:"board",      icon:"kanban" },
    { id:"dashboard",  icon:"layout" },
    { id:"calendar",   icon:"calendar" },
    { id:"matrix",     icon:"grid4" },
    { id:"pomodoro",   icon:"timer" },
    { id:"habits",     icon:"pin" },
    { id:"meditation", icon:"leaf" },
    { id:"countdown",  icon:"countdown" },
    { id:"search",     icon:"search" },
  ];
  const [order, setOrder] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("xai_rail_order") || "null");
      if (Array.isArray(saved) && saved.length === DEFAULT_ITEMS.length) {
        const valid = new Set(DEFAULT_ITEMS.map(i => i.id));
        if (saved.every(id => valid.has(id))) return saved;
      }
    } catch(e){}
    return DEFAULT_ITEMS.map(i => i.id);
  });
  useEffect(()=>{ try { localStorage.setItem("xai_rail_order", JSON.stringify(order)); } catch(e){} }, [order]);
  const items = order.map(id => DEFAULT_ITEMS.find(i => i.id === id)).filter(Boolean);

  const [dragId, setDragId] = useState(null);
  const onDragStart = (e, id) => { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", id); setDragId(id); };
  const onDragOver  = (e, id) => {
    e.preventDefault();
    if (!dragId || dragId === id) return;
    setOrder(o => {
      const i1 = o.indexOf(dragId), i2 = o.indexOf(id);
      if (i1<0 || i2<0) return o;
      const next = [...o]; next.splice(i1,1); next.splice(i2,0,dragId);
      return next;
    });
  };
  const onDragEnd = () => setDragId(null);

  const bottom = [
    { id:"pet",   icon:"paw",   action:()=>setPetOn(!petOn), active: petOn },
    { id:"sync",  icon:"sync" },
    { id:"notif", icon:"bell" },
    { id:"help",  icon:"help" },
  ];
  const labels = I18N[lang].nav;
  const horizontal = railPos === "top" || railPos === "bottom";
  return (
    <aside className="app-rail" data-pos={railPos || "left"}>
      <div className="rail-avatar-wrap">
        <button className="rail-avatar" onClick={()=>setAvatarOpen(v=>!v)}>
          <div className="avatar-img">
            <svg viewBox="0 0 40 40" width="36" height="36">
              <defs>
                <linearGradient id="avg" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#d8c8b7"/>
                  <stop offset="1" stopColor="#a08877"/>
                </linearGradient>
              </defs>
              <rect width="40" height="40" fill="url(#avg)"/>
              <circle cx="20" cy="16" r="6" fill="#fff" opacity=".7"/>
              <ellipse cx="20" cy="32" rx="11" ry="7" fill="#fff" opacity=".55"/>
            </svg>
          </div>
        </button>
        <AvatarMenu open={avatarOpen} onClose={()=>setAvatarOpen(false)} setModule={setModule} lang={lang}/>
      </div>
      <div className="rail-items">
        {items.map(it => (
          <button key={it.id}
            className={"rail-btn has-tip" + (module===it.id ? " active" : "") + (dragId===it.id?" dragging":"")}
            data-tip={labels[it.id] || it.id}
            draggable
            onDragStart={(e)=>onDragStart(e, it.id)}
            onDragOver={(e)=>onDragOver(e, it.id)}
            onDragEnd={onDragEnd}
            onClick={()=>{ if (!dragId) setModule(it.id); }}>
            <Icon name={it.icon} size={20} />
          </button>
        ))}
      </div>
      <div className="rail-bottom">
        {bottom.map(it => (
          <button key={it.id}
            className={"rail-btn has-tip" + (it.active ? " active" : "")}
            data-tip={it.id === "pet" ? labels.pet : it.id}
            onClick={it.action}>
            <Icon name={it.icon} size={18} />
          </button>
        ))}
      </div>
    </aside>
  );
}

/* ---------- Topbar ---------- */
function Topbar({ lang, setLang, theme, setTheme, density, setDensity, onOpenSettings }){
  const { s } = window.useI18n(lang);
  return (
    <header className="topbar">
      <div className="search-box">
        <Icon name="search" size={15} />
        <input placeholder={s("common.search_placeholder")} />
        <span className="kbd">⌘K</span>
      </div>

      <div className="topbar-controls">
        <div className="seg" role="tablist">
          <button aria-selected={lang==="en"} onClick={()=>setLang("en")}>EN</button>
          <button aria-selected={lang==="zh"} onClick={()=>setLang("zh")}>中文</button>
        </div>
        <div className="seg">
          <button aria-selected={theme==="light"} onClick={()=>setTheme("light")} title="Light"><Icon name="sun" size={14}/></button>
          <button aria-selected={theme==="dark"}  onClick={()=>setTheme("dark")} title="Dark"><Icon name="moon" size={14}/></button>
          <button aria-selected={theme==="system"} onClick={()=>setTheme("system")} title="System"><Icon name="monitor" size={14}/></button>
        </div>
        <div className="seg">
          <button aria-selected={density==="comfortable"} onClick={()=>setDensity("comfortable")}>{s("settings.comfortable")}</button>
          <button aria-selected={density==="compact"}     onClick={()=>setDensity("compact")}>{s("settings.compact")}</button>
        </div>

        <button className="icon-btn" onClick={onOpenSettings} title={s("nav.settings")}>
          <Icon name="sliders" size={18}/>
        </button>
      </div>
    </header>
  );
}

window.AppRail = AppRail;
window.Topbar  = Topbar;
