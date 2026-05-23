/* ============================================================
   Pomodoro module — centered timer, right overview + focus log
   ============================================================ */
const Icon = window.Icon;
const MOCK = window.MOCK;

function PomodoroModule({ lang }){
  const { s } = window.useI18n(lang);
  const FOCUS = 30 * 60; // 30 minutes
  const [remaining, setRemaining] = useState(29*60 + 57);
  const [state, setState] = useState("paused"); // running | paused
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (state !== "running") return;
    const id = setInterval(() => {
      setRemaining(r => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [state]);

  const mm = String(Math.floor(remaining/60)).padStart(2,'0');
  const ss = String(remaining%60).padStart(2,'0');
  const progress = 1 - remaining / FOCUS;
  const r = 132;
  const c = 2 * Math.PI * r;

  return (
    <div className="module module-pomo">
      <section className="pomo-main">
        <header className="module-head">
          <h1 className="module-title">{s("pomo.title")}</h1>
          <span className="grow"></span>
          <button className="icon-btn" onClick={()=>setMuted(!muted)}>
            <Icon name={muted?"soundOff":"sound"} size={16}/>
          </button>
          <button className="icon-btn"><Icon name="dots" size={16}/></button>
        </header>

        <div className="pomo-stage">
          <button className="focus-pill">
            <span>{s("pomo.focus")}</span>
            <Icon name="chevR" size={12}/>
          </button>

          <div className="timer-ring">
            <svg viewBox="0 0 300 300" className="ring-svg">
              <circle cx="150" cy="150" r={r}
                fill="none" stroke="var(--border-1)" strokeWidth="2"/>
              <circle cx="150" cy="150" r={r}
                fill="none" stroke="var(--accent)" strokeWidth="2.4"
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={c * (1 - progress)}
                transform="rotate(-90 150 150)"
                style={{transition: state==="running" ? "stroke-dashoffset 1s linear" : "stroke-dashoffset .4s var(--ease-out)"}}/>
              <circle cx="150" cy={150 - r} r="3.5" fill="var(--accent)"/>
            </svg>
            <div className="timer-inner">
              <div className="timer-num mono">{mm}:{ss}</div>
              <div className="timer-state">{state==="paused" ? s("pomo.paused") : s("pomo.running")}</div>
            </div>
          </div>

          <div className="pomo-actions">
            <button className="btn primary" onClick={()=>setState("running")}>
              {state==="paused" ? s("pomo.continue") : s("pomo.start")}
            </button>
            <button className="btn ghost" onClick={()=>{ setState("paused"); setRemaining(FOCUS); }}>
              {s("pomo.end")}
            </button>
          </div>
        </div>
      </section>

      <aside className="pomo-side">
        <h2 className="side-h">{s("pomo.overview")}</h2>
        <div className="pomo-stats">
          <div className="pomo-stat panel">
            <div className="ps-label">{s("pomo.todays_pomos")}</div>
            <div className="ps-val mono">0</div>
          </div>
          <div className="pomo-stat panel">
            <div className="ps-label">{s("pomo.todays_focus")}</div>
            <div className="ps-val mono">0<span className="ps-unit">m</span></div>
          </div>
          <div className="pomo-stat panel">
            <div className="ps-label">{s("pomo.total_pomos")}</div>
            <div className="ps-val mono">294</div>
          </div>
          <div className="pomo-stat panel">
            <div className="ps-label">{s("pomo.total_focus")}</div>
            <div className="ps-val mono">140<span className="ps-unit">h</span>{" "}6<span className="ps-unit">m</span></div>
          </div>
        </div>

        <div className="record-head">
          <h2 className="side-h">{s("pomo.focus_record")}</h2>
          <span className="grow"></span>
          <button className="icon-btn"><Icon name="plus" size={15}/></button>
          <button className="icon-btn"><Icon name="dots" size={15}/></button>
        </div>

        <div className="record-list">
          {MOCK.focusRecords.map((g, i) => (
            <div key={i} className="record-group">
              <div className="record-date">{g.date[lang]}</div>
              {g.items.map((it,j) => (
                <div key={j} className="record-row">
                  <span className="rec-dot"><Icon name="timer" size={11}/></span>
                  <span className="rec-time mono">{it.time}</span>
                  <span className="grow"></span>
                  <span className="rec-dur mono">{it.dur}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

window.PomodoroModule = PomodoroModule;
