/* ============================================================
   Dashboard — personal widget board with macOS-style drag-to-reorder
   ============================================================ */
const Icon = window.Icon;
const MOCK = window.MOCK;
const { useLayoutEffect, useRef: useRef2 } = React;

/* Widget config: id + grid span class */
const WIDGETS_CONFIG = [
  { id: "clock",       span: "w-clock" },
  { id: "stat-tasks",  span: "w-stat" },
  { id: "stat-streak", span: "w-stat" },
  { id: "stat-pomos",  span: "w-stat" },
  { id: "weather",     span: "w-weather" },
  { id: "mini-cal",    span: "w-mini-cal" },
  { id: "timezones",   span: "w-timezones" },
  { id: "stickies",    span: "w-stickies" },
  { id: "mail",        span: "w-mail" },
  { id: "upcoming",    span: "w-upcoming" },
];

function DashboardModule({ lang, goTo }){
  const { s } = window.useI18n(lang);
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(()=>setNow(new Date()), 1000);
    return ()=>clearInterval(id);
  }, []);

  /* ------- widget order state + persistence ------- */
  const [order, setOrder] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("xai_dash_order") || "null");
      if (Array.isArray(saved) && saved.length === WIDGETS_CONFIG.length) {
        // sanity: only ids we know
        const known = new Set(WIDGETS_CONFIG.map(w => w.id));
        if (saved.every(id => known.has(id))) return saved;
      }
    } catch(e){}
    return WIDGETS_CONFIG.map(w => w.id);
  });
  useEffect(()=>{
    try { localStorage.setItem("xai_dash_order", JSON.stringify(order)); } catch(e){}
  }, [order]);

  /* ------- FLIP animation refs ------- */
  const itemRefs = useRef2({});
  const lastRects = useRef2({});
  useLayoutEffect(() => {
    Object.entries(itemRefs.current).forEach(([k, el]) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const last = lastRects.current[k];
      if (last) {
        const dx = last.left - rect.left;
        const dy = last.top - rect.top;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          el.style.transition = "none";
          el.style.transform = `translate(${dx}px, ${dy}px)`;
          // force reflow
          void el.offsetWidth;
          el.style.transition = "transform 380ms cubic-bezier(.34, 1.3, .42, 1)";
          el.style.transform = "";
        }
      }
      lastRects.current[k] = rect;
    });
  });

  /* ------- Drag state ------- */
  const [drag, setDrag] = useState(null);
  // drag = { id, offsetX, offsetY, x, y, width, height }
  const dragRef = useRef2(null);
  const startDrag = (id, e) => {
    const el = itemRefs.current[id];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDrag({
      id,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    });
  };

  useEffect(() => {
    if (!drag) return;
    const onMove = (e) => {
      setDrag(d => d && { ...d, x: e.clientX - d.offsetX, y: e.clientY - d.offsetY });
      // detect over which other widget
      const elements = Object.entries(itemRefs.current);
      let bestId = null;
      let bestDist = Infinity;
      const cx = e.clientX, cy = e.clientY;
      elements.forEach(([id, el]) => {
        if (id === drag.id || !el) return;
        const r = el.getBoundingClientRect();
        const mx = (r.left + r.right)/2;
        const my = (r.top + r.bottom)/2;
        if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) {
          const d = Math.hypot(cx-mx, cy-my);
          if (d < bestDist) { bestDist = d; bestId = id; }
        }
      });
      if (bestId && bestId !== drag.id) {
        // swap positions in order
        setOrder(o => {
          const i1 = o.indexOf(drag.id);
          const i2 = o.indexOf(bestId);
          if (i1 < 0 || i2 < 0) return o;
          const next = [...o];
          next.splice(i1, 1);
          next.splice(i2, 0, drag.id);
          return next;
        });
      }
    };
    const onUp = () => setDrag(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [drag?.id]);

  /* ------- Greeting ------- */
  const greeting = (() => {
    const h = now.getHours();
    if (h < 12)  return s("dashboard.good_morning");
    if (h < 18)  return s("dashboard.good_afternoon");
    return s("dashboard.good_evening");
  })();
  const dateStr = lang === "zh"
    ? `${now.getFullYear()} 年 ${now.getMonth()+1} 月 ${now.getDate()} 日 · ${["周日","周一","周二","周三","周四","周五","周六"][now.getDay()]}`
    : now.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });

  const renderWidgetBody = (id) => {
    switch (id) {
      case "clock":       return <ClockWidget now={now} lang={lang}/>;
      case "stat-tasks":  return <StatTasks lang={lang}/>;
      case "stat-streak": return <StatStreak lang={lang}/>;
      case "stat-pomos":  return <StatPomos  lang={lang}/>;
      case "weather":     return <WeatherWidget lang={lang}/>;
      case "mini-cal":    return <MiniCalWidget lang={lang} now={now} goTo={goTo}/>;
      case "timezones":   return <WorldClocks lang={lang} now={now}/>;
      case "stickies":    return <StickiesWidget lang={lang}/>;
      case "mail":        return <MailWidget lang={lang}/>;
      case "upcoming":    return <UpcomingWidget lang={lang}/>;
      default: return null;
    }
  };

  return (
    <div className="module module-dashboard">
      <header className="dash-head">
        <div>
          <h1 className="dash-greeting">{greeting}, {lang==="zh"?"百事":"Aki"}.</h1>
          <div className="dash-date">{dateStr}</div>
        </div>
        <button className="btn ghost dash-add">
          <Icon name="plus" size={14}/> {s("dashboard.add_widget")}
        </button>
      </header>

      <div className={"dash-grid" + (drag ? " is-dragging" : "")}>
        {order.map(id => {
          const cfg = WIDGETS_CONFIG.find(w => w.id === id);
          if (!cfg) return null;
          const isDragged = drag?.id === id;
          return (
            <div
              key={id}
              ref={el => { itemRefs.current[id] = el; }}
              className={"widget-shell " + cfg.span + (isDragged ? " dragging" : "")}
              onPointerDown={(e) => {
                // Only start drag on actual widget surface — not on inputs/buttons
                if (e.target.closest("button, input, textarea, [data-no-drag], .tz-view-toggle, .tz-picker")) return;
                if (e.button !== 0) return;
                startDrag(id, e);
              }}
            >
              {renderWidgetBody(id)}
            </div>
          );
        })}
      </div>

      {/* Ghost (the floating dragged widget) */}
      {drag && (
        <div className="widget-ghost"
          style={{
            transform: `translate(${drag.x}px, ${drag.y}px) rotate(-2deg) scale(1.03)`,
            width: drag.width + "px",
            height: drag.height + "px",
          }}>
          {renderWidgetBody(drag.id)}
        </div>
      )}
    </div>
  );
}

/* ---------- Widget bodies ---------- */
function ClockWidget({ now, lang }){
  const { s } = window.useI18n(lang);
  const [style, setStyle] = useState(() => {
    try { return localStorage.getItem("xai_clock_style") || "classic"; } catch(e){ return "classic"; }
  });
  useEffect(()=>{ try { localStorage.setItem("xai_clock_style", style); } catch(e){} }, [style]);

  const [tz, setTz] = useState(() => {
    try { return localStorage.getItem("xai_clock_tz") || "local"; } catch(e){ return "local"; }
  });
  useEffect(()=>{ try { localStorage.setItem("xai_clock_tz", tz); } catch(e){} }, [tz]);
  const [tzOpen, setTzOpen] = useState(false);

  // Compute time in the selected timezone
  let displayTime, locationLabel;
  if (tz === "local") {
    displayTime = now;
    locationLabel = lang==="zh" ? MOCK.weather.city.zh : MOCK.weather.city.en;
  } else {
    const city = CITY_LIBRARY.find(c => c.id === tz);
    const utc = now.getTime() + now.getTimezoneOffset()*60*1000;
    displayTime = city ? new Date(utc + city.tz*3600*1000) : now;
    locationLabel = city ? city.city[lang] : (lang==="zh" ? "本地" : "Local");
  }

  const hh = String(displayTime.getHours()).padStart(2,'0');
  const mm = String(displayTime.getMinutes()).padStart(2,'0');
  const ss = String(displayTime.getSeconds()).padStart(2,'0');
  const h12 = (displayTime.getHours() % 12) || 12;
  const ampm = displayTime.getHours() >= 12 ? "PM" : "AM";

  const STYLES = [
    { id:"classic", icon:"clock" },
    { id:"split",   icon:"list" },
    { id:"minimal", icon:"type" },
    { id:"analog",  icon:"timer" },
  ];

  let content;
  if (style === "classic") {
    content = (
      <div className="clock-time mono">
        {hh}<span className="clk-colon">:</span>{mm}<span className="clk-sec mono">:{ss}</span>
      </div>
    );
  } else if (style === "split") {
    content = (
      <div className="clock-split mono">
        <span className="cs-hour">{hh}</span>
        <span className="cs-colon">:</span>
        <span className="cs-min">{mm}</span>
        <span className="cs-colon cs-dim">:</span>
        <span className="cs-dim">{ss}</span>
      </div>
    );
  } else if (style === "minimal") {
    content = (
      <div className="clock-min mono">
        <span>{String(h12).padStart(2,'0')}</span>
        <span className="cm-dim">{mm}</span>
        <span className="cm-ampm">{ampm}</span>
      </div>
    );
  } else if (style === "analog") {
    const h = displayTime.getHours(), m = displayTime.getMinutes(), sec = displayTime.getSeconds();
    const hAng = ((h%12) + m/60) * 30;
    const mAng = (m + sec/60) * 6;
    const sAng = sec * 6;
    content = (
      <svg viewBox="0 0 100 100" width="180" height="180" className="clock-analog">
        <circle cx="50" cy="50" r="47" fill="var(--bg-panel-2)" stroke="var(--border-1)" strokeWidth="1"/>
        {/* 60 minute ticks */}
        {Array.from({length: 60}).map((_, i) => {
          if (i % 5 === 0) return null;
          const a = i * 6 * Math.PI/180;
          const x1 = 50 + Math.sin(a)*45, y1 = 50 - Math.cos(a)*45;
          const x2 = 50 + Math.sin(a)*46.5, y2 = 50 - Math.cos(a)*46.5;
          return <line key={"m"+i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="var(--text-3)" strokeWidth="0.4" strokeLinecap="round" opacity="0.5"/>;
        })}
        {/* 12 hour ticks */}
        {Array.from({length: 12}).map((_, i) => {
          const a = i * 30 * Math.PI/180;
          const x1 = 50 + Math.sin(a)*42, y1 = 50 - Math.cos(a)*42;
          const x2 = 50 + Math.sin(a)*46.5, y2 = 50 - Math.cos(a)*46.5;
          return <line key={"h"+i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="var(--text-1)" strokeWidth="1.4" strokeLinecap="round"/>;
        })}
        {/* hour numerals */}
        {[12,1,2,3,4,5,6,7,8,9,10,11].map((n, i) => {
          const a = i * 30 * Math.PI/180;
          const x = 50 + Math.sin(a)*36, y = 50 - Math.cos(a)*36 + 2.4;
          return <text key={"n"+n} x={x} y={y} fontSize="6.2" fill="var(--text-1)"
            textAnchor="middle" fontWeight="600" fontFamily="var(--font-mono)">{n}</text>;
        })}
        {/* hands */}
        <line x1="50" y1="50" x2="50" y2="26" stroke="var(--text-1)" strokeWidth="3.2" strokeLinecap="round" transform={`rotate(${hAng} 50 50)`}/>
        <line x1="50" y1="50" x2="50" y2="14" stroke="var(--text-1)" strokeWidth="2.0" strokeLinecap="round" transform={`rotate(${mAng} 50 50)`}/>
        <line x1="50" y1="50" x2="50" y2="10" stroke="var(--accent)" strokeWidth="1.0" strokeLinecap="round" transform={`rotate(${sAng} 50 50)`}/>
        <line x1="50" y1="50" x2="50" y2="58" stroke="var(--accent)" strokeWidth="1.0" strokeLinecap="round" transform={`rotate(${sAng} 50 50)`}/>
        <circle cx="50" cy="50" r="2.8" fill="var(--text-1)"/>
        <circle cx="50" cy="50" r="1.2" fill="var(--accent)"/>
      </svg>
    );
  }

  return (
    <div className="widget widget-content w-clock-body">
      <div className="clock-toolbar" data-no-drag>
        <button className="clk-tz-btn" onClick={()=>setTzOpen(o=>!o)} title={lang==="zh"?"时区":"Timezone"}>
          <Icon name="globe" size={11}/>
          <span>{locationLabel}</span>
          <Icon name="chevD" size={10}/>
        </button>
        <div className="clk-style-toggle">
          {STYLES.map(st => (
            <button key={st.id}
              aria-selected={style===st.id}
              onClick={()=>setStyle(st.id)}
              title={st.id}>
              <Icon name={st.icon} size={11}/>
            </button>
          ))}
        </div>
        {tzOpen && (
          <>
            <div className="popover-scrim" onClick={()=>setTzOpen(false)}/>
            <div className="popover clk-tz-popover">
              <div className="popover-list">
                <button className={"popover-item" + (tz==="local"?" active":"")}
                  onClick={()=>{ setTz("local"); setTzOpen(false); }}>
                  <Icon name="pin" size={13}/>
                  <span>{lang==="zh"?"本地时间":"Local time"}</span>
                  {tz==="local" && <Icon name="check2" size={13} color="var(--accent)" style={{marginLeft:"auto"}}/>}
                </button>
                <div className="popover-divider"/>
                {CITY_LIBRARY.map(c => (
                  <button key={c.id}
                    className={"popover-item" + (tz===c.id?" active":"")}
                    onClick={()=>{ setTz(c.id); setTzOpen(false); }}>
                    <Icon name="globe" size={13}/>
                    <span>{c.city[lang]}</span>
                    <span className="mono" style={{marginLeft:"auto",fontSize:11,opacity:.65}}>UTC{c.tz>=0?"+":""}{c.tz}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      {content}
      <div className="clock-sub">{locationLabel}</div>
    </div>
  );
}

function StatTasks({ lang }){
  const { s } = window.useI18n(lang);
  return (
    <div className="widget widget-content">
      <div className="ws-label">{s("dashboard.tasks_done")}</div>
      <div className="ws-row">
        <div className="ws-val mono">14<span className="ws-unit">/22</span></div>
        <Donut value={14/22} color="var(--accent)" size={48}/>
      </div>
    </div>
  );
}
function StatStreak({ lang }){
  const { s } = window.useI18n(lang);
  return (
    <div className="widget widget-content">
      <div className="ws-label">{s("dashboard.streak")}</div>
      <div className="ws-row">
        <div className="ws-val mono">27<span className="ws-unit">{lang==="zh"?" 天":" d"}</span></div>
        <Icon name="flame" size={32} color="var(--red)"/>
      </div>
    </div>
  );
}
function StatPomos({ lang }){
  const { s } = window.useI18n(lang);
  return (
    <div className="widget widget-content">
      <div className="ws-label">{s("dashboard.pomos")}</div>
      <div className="ws-row">
        <div className="ws-val mono">6</div>
        <PomoDots count={6} total={8}/>
      </div>
    </div>
  );
}
function WeatherWidget({ lang }){
  const { s } = window.useI18n(lang);
  return (
    <div className="widget widget-content">
      <div className="ww-head">
        <span>{s("dashboard.weather")} · {lang==="zh" ? MOCK.weather.city.zh : MOCK.weather.city.en}</span>
      </div>
      <div className="ww-now">
        <div className="ww-temp mono">{MOCK.weather.temp}°</div>
        <div className="ww-info">
          <Icon name={MOCK.weather.icon} size={28} color="var(--text-2)"/>
          <div>
            <div className="ww-cond">{MOCK.weather.condition[lang]}</div>
            <div className="ww-hilo mono">{MOCK.weather.hi}° / {MOCK.weather.lo}°</div>
          </div>
        </div>
      </div>
      <div className="ww-forecast">
        {MOCK.weather.forecast.map((d,i) => (
          <div key={i} className="wwf-day">
            <div className="wwf-d">{d.d[lang]}</div>
            <Icon name={d.ico} size={16} color="var(--text-2)"/>
            <div className="wwf-t mono">{d.hi}°<span className="muted">{d.lo}°</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
function StickiesWidget({ lang }){
  const { s } = window.useI18n(lang);
  return (
    <div className="widget widget-content">
      <div className="wgt-h">
        <Icon name="note" size={14}/> <span>{s("dashboard.sticky_notes")}</span>
        <span className="grow"></span>
        <button className="icon-btn"><Icon name="plus" size={14}/></button>
      </div>
      <div className="sticky-stack">
        {MOCK.stickies.map(n => (
          <div key={n.id} className="sticky" style={{background:n.color}}>
            {n.text[lang]}
          </div>
        ))}
      </div>
    </div>
  );
}
function MailWidget({ lang }){
  const { s } = window.useI18n(lang);
  return (
    <div className="widget widget-content">
      <div className="wgt-h">
        <Icon name="mail" size={14}/> <span>{s("dashboard.mail")}</span>
        <span className="mail-badge">{MOCK.mails.filter(m=>m.unread).length}</span>
      </div>
      <ul className="mail-list">
        {MOCK.mails.map(m => (
          <li key={m.id} className={"mail-row" + (m.unread?" unread":"")}>
            {m.unread && <span className="mail-dot"/>}
            <div className="mail-body">
              <div className="mail-from">{m.from}</div>
              <div className="mail-subj">{m.subj[lang]}</div>
            </div>
            <div className="mail-time mono">{m.time}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
function UpcomingWidget({ lang }){
  const { s } = window.useI18n(lang);
  return (
    <div className="widget widget-content">
      <div className="wgt-h">
        <Icon name="calendar" size={14}/> <span>{s("dashboard.upcoming")}</span>
      </div>
      <ul className="upc-list">
        {MOCK.upcoming.map(e => (
          <li key={e.id} className="upc-row">
            <div className="upc-date">
              <div className="upc-d mono">{e.date}</div>
              <div className="upc-m">{e.month[lang]}</div>
            </div>
            <div className="grow upc-body">
              <div className="upc-title">{e.title[lang]}</div>
              <div className="upc-time mono">{e.time}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Mini month calendar (macOS-style) ---------- */
function MiniCalWidget({ lang, now, goTo }){
  const { s } = window.useI18n(lang);
  const [offset, setOffset] = useState(0); // months relative to now
  const view = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const month = view.getMonth(), year = view.getFullYear();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const startCol = (firstDay.getDay() + 6) % 7; // monday-first
  const todayInView = view.getMonth() === now.getMonth() && view.getFullYear() === now.getFullYear();

  // Mock events live in MOCK.calEvents (May 2026 dataset). Show dots for those days.
  // Plus we colour-categorize first event of each day.
  const evMap = MOCK.calEvents || {};

  const dayNames = lang==="zh" ? ["一","二","三","四","五","六","日"] : ["M","T","W","T","F","S","S"];
  const monthLabel = lang==="zh"
    ? `${year} 年 ${month+1} 月`
    : view.toLocaleDateString("en-US", { month:"long", year:"numeric" });

  const cells = [];
  for (let i=0; i<startCol; i++) cells.push(null);
  for (let d=1; d<=daysInMonth; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);

  return (
    <div className="widget widget-content w-mini-cal-body"
      onClick={(e) => { if (!e.target.closest("[data-no-drag]")) goTo && goTo("calendar"); }}>
      <header className="mc-head" data-no-drag>
        <button className="mc-nav" onClick={(e)=>{ e.stopPropagation(); setOffset(o=>o-1); }}>
          <Icon name="arrowL" size={12}/>
        </button>
        <div className="mc-title">
          <div className="mc-m">{monthLabel}</div>
          {todayInView && <div className="mc-today mono">{now.getDate()}</div>}
        </div>
        <button className="mc-nav" onClick={(e)=>{ e.stopPropagation(); setOffset(o=>o+1); }}>
          <Icon name="arrowR" size={12}/>
        </button>
      </header>
      <div className="mc-grid">
        {dayNames.map((d,i) => <div key={"h"+i} className="mc-wd">{d}</div>)}
        {cells.map((d, i) => {
          if (d == null) return <div key={"e"+i} className="mc-cell empty"/>;
          const isToday = todayInView && d === now.getDate();
          const events = evMap[d] || [];
          const ev = events.slice(0, 3);
          return (
            <div key={"d"+i} className={"mc-cell" + (isToday ? " today" : "") + (events.length ? " has" : "")}>
              <span className="mc-num">{d}</span>
              {ev.length > 0 && (
                <span className="mc-dots">
                  {ev.map((e,ii) => (
                    <span key={ii} className={"mc-dot mc-dot-" + e.c}/>
                  ))}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <footer className="mc-foot" data-no-drag>
        <button className="mc-jump" onClick={(e)=>{ e.stopPropagation(); goTo && goTo("calendar"); }}>
          {lang==="zh" ? "打开日历" : "Open Calendar"} <Icon name="arrowR" size={11}/>
        </button>
      </footer>
    </div>
  );
}

/* ---------- World Clocks (iPhone-style, switchable view) ---------- */
const CITY_LIBRARY = [
  { id:"shanghai", city:{en:"Shanghai", zh:"上海"},     tz: 8 },
  { id:"london",   city:{en:"London", zh:"伦敦"},        tz: 1 },
  { id:"new_york", city:{en:"New York", zh:"纽约"},      tz: -4 },
  { id:"tokyo",    city:{en:"Tokyo", zh:"东京"},         tz: 9 },
  { id:"sf",       city:{en:"San Francisco", zh:"旧金山"}, tz: -7 },
  { id:"paris",    city:{en:"Paris", zh:"巴黎"},         tz: 2 },
  { id:"sydney",   city:{en:"Sydney", zh:"悉尼"},        tz: 11 },
  { id:"berlin",   city:{en:"Berlin", zh:"柏林"},        tz: 2 },
  { id:"dubai",    city:{en:"Dubai", zh:"迪拜"},         tz: 4 },
  { id:"singapore",city:{en:"Singapore", zh:"新加坡"},   tz: 8 },
  { id:"hk",       city:{en:"Hong Kong", zh:"香港"},     tz: 8 },
  { id:"la",       city:{en:"Los Angeles", zh:"洛杉矶"}, tz: -7 },
];

function WorldClocks({ lang, now }){
  const { s } = window.useI18n(lang);
  const [zones, setZones] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("xai_zones") || "null");
      if (Array.isArray(saved) && saved.length) return saved;
    } catch(e){}
    return ["shanghai", "london", "new_york", "tokyo"];
  });
  const [view, setView]   = useState("list");
  const [picker, setPicker] = useState(false);

  useEffect(()=>{
    try { localStorage.setItem("xai_zones", JSON.stringify(zones)); } catch(e){}
  }, [zones]);

  const hereOffset = -now.getTimezoneOffset() / 60;

  const addZone = (id) => {
    if (!zones.includes(id)) setZones([...zones, id]);
    setPicker(false);
  };
  const removeZone = (id) => setZones(zs => zs.filter(z => z !== id));

  const items = zones.map(id => CITY_LIBRARY.find(c => c.id === id)).filter(Boolean);
  const VIEWS = ["list", "analog", "grid"];

  return (
    <div className="widget widget-content w-timezones-body">
      <div className="wgt-h">
        <Icon name="globe" size={14}/> <span>{s("dashboard.timezones")}</span>
        <span className="grow"></span>
        <div className="tz-view-toggle" data-no-drag>
          {VIEWS.map(v => (
            <button key={v} aria-selected={view===v} onClick={()=>setView(v)} title={v}>
              <Icon name={v==="list" ? "list" : v==="analog" ? "clock" : "grid4"} size={11}/>
            </button>
          ))}
        </div>
        <button className="icon-btn" onClick={()=>setPicker(p=>!p)} title={lang==="zh"?"添加城市":"Add city"} data-no-drag>
          <Icon name="plus" size={14}/>
        </button>
      </div>

      <div className={"tz-body tz-body-" + view}>
        {items.map(z => {
          const utc = now.getTime() + now.getTimezoneOffset()*60*1000;
          const local = new Date(utc + z.tz*3600*1000);
          const h24 = local.getHours();
          const h12 = (h24 % 12) || 12;
          const m = String(local.getMinutes()).padStart(2,'0');
          const ampm = h24 >= 12 ? "PM" : "AM";
          const isNight = h24 < 6 || h24 >= 19;
          const dayDelta = (() => {
            const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const d2 = new Date(local.getFullYear(), local.getMonth(), local.getDate());
            const diff = Math.round((d2 - d1) / 86400000);
            if (diff === 0) return lang==="zh" ? "今天" : "Today";
            if (diff === 1) return lang==="zh" ? "明天" : "Tomorrow";
            if (diff === -1) return lang==="zh" ? "昨天" : "Yesterday";
            return (diff > 0 ? "+" : "") + diff + "d";
          })();
          const offsetDelta = z.tz - hereOffset;
          const offsetStr = (offsetDelta >= 0 ? "+" : "") + offsetDelta + "h";

          if (view === "analog") {
            return (
              <div key={z.id} className="tz-row tz-row-analog">
                <TzClock h={h24} m={local.getMinutes()} s={local.getSeconds()} size={56} />
                <div className="tz-info">
                  <div className="tz-city">{z.city[lang]}</div>
                  <div className="tz-meta">
                    <span className="tz-day">{dayDelta}</span>
                    <span className="tz-offset mono">{offsetStr}</span>
                  </div>
                </div>
                <button className="tz-remove" onClick={()=>removeZone(z.id)} aria-label="Remove" data-no-drag>
                  <Icon name="close" size={11}/>
                </button>
              </div>
            );
          }
          if (view === "grid") {
            return (
              <div key={z.id} className={"tz-card" + (isNight ? " night" : "")}>
                <div className="tz-card-head">
                  <span className="tz-city">{z.city[lang]}</span>
                  <button className="tz-remove" onClick={()=>removeZone(z.id)} aria-label="Remove" data-no-drag>
                    <Icon name="close" size={11}/>
                  </button>
                </div>
                <div className="tz-card-time mono">
                  {String(h24).padStart(2,'0')}<span className="tz-colon">:</span>{m}
                </div>
                <div className="tz-card-foot">
                  <span>{dayDelta}</span>
                  <span className="tz-offset mono">{offsetStr}</span>
                </div>
              </div>
            );
          }
          return (
            <div key={z.id} className="tz-row tz-row-list">
              <div className="tz-info">
                <div className="tz-city">{z.city[lang]}</div>
                <div className="tz-meta">
                  <span className="tz-day">{dayDelta}</span>
                  <span className="tz-divider">·</span>
                  <span className="tz-offset mono">{offsetStr}</span>
                </div>
              </div>
              <div className="tz-big mono">
                <span className="tz-h">{String(h12).padStart(2,'0')}</span>
                <span className="tz-colon">:</span>
                <span className="tz-h">{m}</span>
                <span className="tz-ampm">{ampm}</span>
              </div>
              <button className="tz-remove" onClick={()=>removeZone(z.id)} aria-label="Remove" data-no-drag>
                <Icon name="close" size={11}/>
              </button>
            </div>
          );
        })}
      </div>

      {picker && (
        <div className="tz-picker" data-no-drag>
          <div className="tz-picker-h">{lang==="zh" ? "添加城市" : "Add city"}</div>
          <div className="tz-picker-list">
            {CITY_LIBRARY.filter(c => !zones.includes(c.id)).map(c => (
              <button key={c.id} className="tz-picker-row" onClick={()=>addZone(c.id)}>
                <span>{c.city[lang]}</span>
                <span className="tz-offset mono">UTC{c.tz >= 0 ? "+" : ""}{c.tz}</span>
              </button>
            ))}
            {CITY_LIBRARY.filter(c => !zones.includes(c.id)).length === 0 && (
              <div className="tz-picker-empty">{lang==="zh" ? "已添加全部城市" : "All cities added"}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TzClock({ h, m, s, size = 48 }){
  const hAng = ((h%12) + m/60) * 30;
  const mAng = (m + s/60) * 6;
  const sAng = s * 6;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="tz-clock">
      <circle cx="50" cy="50" r="46" fill="var(--bg-panel-2)" stroke="var(--border-1)" strokeWidth="1.5"/>
      {[0,3,6,9].map(i => {
        const a = i * 30 * Math.PI/180;
        const x = 50 + Math.sin(a)*38, y = 50 - Math.cos(a)*38;
        return <circle key={i} cx={x} cy={y} r="1.6" fill="var(--text-2)"/>;
      })}
      <line x1="50" y1="50" x2="50" y2="26" stroke="var(--text-1)" strokeWidth="4" strokeLinecap="round" transform={`rotate(${hAng} 50 50)`}/>
      <line x1="50" y1="50" x2="50" y2="14" stroke="var(--text-1)" strokeWidth="2.4" strokeLinecap="round" transform={`rotate(${mAng} 50 50)`}/>
      <line x1="50" y1="50" x2="50" y2="10" stroke="oklch(60% 0.18 25)" strokeWidth="1.2" strokeLinecap="round" transform={`rotate(${sAng} 50 50)`}/>
      <circle cx="50" cy="50" r="3" fill="var(--text-1)"/>
      <circle cx="50" cy="50" r="1.4" fill="oklch(60% 0.18 25)"/>
    </svg>
  );
}

/* ---------- Donut + pomo dots ---------- */
function Donut({ value, color, size = 56 }){
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border-1)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c*(1-value)}
        transform={`rotate(-90 ${size/2} ${size/2})`}/>
    </svg>
  );
}

function PomoDots({ count, total }){
  return (
    <div className="pomo-dots">
      {Array.from({length: total}).map((_,i) => (
        <span key={i} className={"pd-dot" + (i<count?" on":"")}/>
      ))}
    </div>
  );
}

window.DashboardModule = DashboardModule;
