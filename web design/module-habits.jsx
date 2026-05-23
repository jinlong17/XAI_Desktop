/* ============================================================
   Habits module — list/grid + detail with stats & monthly calendar
   ============================================================ */
const Icon = window.Icon;
const MOCK = window.MOCK;

function HabitsModule({ lang }){
  const { s, t } = window.useI18n(lang);
  const [selected, setSelected] = useState("h2");
  const [habits, setHabits] = useState(MOCK.habits);
  const [view, setView]   = useState("list");
  const habit = habits.find(h => h.id === selected) || habits[0];

  const weekDates = [16,17,18,19,20,21,22];
  const weekDays = lang==="zh" ? ["周六","周日","周一","周二","周三","周四","周五"] : ["Sat","Sun","Mon","Tue","Wed","Thu","Fri"];

  const toggleWeek = (habitId, dayIdx) => {
    setHabits(hs => hs.map(h => h.id === habitId
      ? { ...h, weekChecks: h.weekChecks.map((c,i)=> i===dayIdx ? !c : c) }
      : h));
  };

  return (
    <div className="module module-habits">
      <section className="habits-list panel">
        <header className="module-head module-head-inline">
          <h1 className="module-title">{s("habits.title")}</h1>
          <span className="grow"></span>
          <div className="seg">
            <button aria-selected={view==="list"} onClick={()=>setView("list")}><Icon name="list" size={13}/></button>
            <button aria-selected={view==="grid"} onClick={()=>setView("grid")}><Icon name="grid4" size={13}/></button>
          </div>
          <button className="icon-btn"><Icon name="plus" size={16}/></button>
          <button className="icon-btn"><Icon name="dots" size={16}/></button>
        </header>

        <div className="week-header">
          {weekDays.map((d,i) => (
            <div key={i} className={"weekday" + (i===6 ? " today" : "")}>
              <div className="wd-name">{d}</div>
              <div className="wd-num">{weekDates[i]}</div>
            </div>
          ))}
        </div>

        <div className="habit-rows">
          {habits.map(h => (
            <div key={h.id}
              className={"habit-row" + (h.id===selected ? " active" : "")}
              onClick={()=>setSelected(h.id)}>
              <div className="habit-emoji">{h.emoji}</div>
              <div className="habit-row-body">
                <div className="habit-title">{h.title[lang]}</div>
                <div className="habit-stats">
                  <Icon name="bolt" size={12}/> <span>{h.total} {s("common.days")}</span>
                  <Icon name="fire" size={12} style={{marginLeft:8}}/> <span>{h.streak} {s("common.day")}</span>
                </div>
              </div>
              <div className="habit-week">
                {h.weekChecks.map((c,i)=>(
                  <button key={i}
                    className={"hcell" + (c?" on":"") + (i===6?" today":"")}
                    onClick={(e)=>{ e.stopPropagation(); toggleWeek(h.id, i); }}>
                    {c && <Icon name="check" size={10}/>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="habits-detail">
        <header className="detail-head">
          <span className="habit-emoji-lg">{habit.emoji}</span>
          <h2 className="detail-title">{habit.title[lang]}</h2>
          <span className="grow"></span>
          <button className="icon-btn"><Icon name="dots" size={16}/></button>
        </header>

        <div className="stat-grid">
          <StatCard icon="check" color="var(--accent)" label={s("habits.monthly_checkins")} value="0" unit={s("common.day")}/>
          <StatCard icon="bolt"  color="var(--blue)"   label={s("habits.total_checkins")}  value={habit.total} unit={s("common.days")}/>
          <StatCard icon="target" color="var(--amber)" label={s("habits.monthly_rate")}    value="0" unit="%"/>
          <StatCard icon="fire"   color="var(--red)"   label={s("habits.streak")}          value={habit.streak} unit={s("common.day")}/>
        </div>

        <div className="progress-card panel">
          <div className="progress-head">
            <div>
              <div className="progress-num mono">6/365</div>
              <div className="progress-sub">359 {s("common.days")}</div>
            </div>
            <div className="grow"></div>
            <div className="goal-medal">
              <svg viewBox="0 0 60 60" width="56" height="56">
                <defs>
                  <linearGradient id="med" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0" stopColor="oklch(95% 0.02 165)"/>
                    <stop offset="1" stopColor="oklch(82% 0.05 165)"/>
                  </linearGradient>
                </defs>
                <circle cx="30" cy="30" r="22" fill="url(#med)" stroke="oklch(75% 0.05 165)" strokeWidth="1"/>
                <path d="M22 30l5 5 11-11" fill="none" stroke="oklch(55% 0.10 165)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="month-cal">
            <header>
              <button className="icon-btn"><Icon name="arrowL" size={14}/></button>
              <h3>{lang==="zh" ? "5 月" : "May"}</h3>
              <button className="icon-btn"><Icon name="arrowR" size={14}/></button>
            </header>
            <div className="cal-grid">
              {(lang==="zh" ? ["一","二","三","四","五","六","日"] : ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"])
                .map((d,i)=>(<div key={i} className="cal-h">{d}</div>))}
              {Array.from({length:35}, (_,i) => {
                const day = i - 5;
                const inMonth = day >= 1 && day <= 31;
                const isToday = day === 22;
                return (
                  <div key={i} className={"cal-cell" + (inMonth?" in":"") + (isToday?" today":"")}>
                    <div className="cal-num">{day < 1 ? 26 + i : day > 31 ? day - 31 : day}</div>
                    <div className="cal-ring"></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="log-card panel">
          <h3 className="log-title">{s("habits.habit_log")}</h3>
          <p className="log-empty">{s("habits.empty_log")}</p>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, color, label, value, unit }){
  return (
    <div className="stat-card panel">
      <div className="stat-head">
        <span className="stat-ico" style={{color, background:`color-mix(in oklch, ${color} 14%, transparent)`}}>
          <Icon name={icon} size={13}/>
        </span>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-value mono">
        {value}<span className="stat-unit">{unit}</span>
      </div>
    </div>
  );
}

window.HabitsModule = HabitsModule;
