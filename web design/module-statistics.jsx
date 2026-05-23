/* ============================================================
   Statistics module — expanded data: KPIs, trends, distributions
   Reacts to range tabs (week / month / all-time)
   ============================================================ */
const Icon = window.Icon;
const MOCK = window.MOCK;

const SERIES = {
  week: {
    labels: { en:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], zh:["一","二","三","四","五","六","日"] },
    focus:  [42, 90, 55, 120, 80, 35, 60],   // minutes
    tasks:  [4, 7, 3, 9, 6, 2, 5],
    kpi:    { tasks_trend:"+12%", focus_trend:"+8%", habits:"5/5", avg_trend:"+15%" },
  },
  month: {
    labels: { en:["W1","W2","W3","W4"], zh:["1 周","2 周","3 周","4 周"] },
    focus:  [320, 540, 410, 480],
    tasks:  [22, 38, 27, 31],
    kpi:    { tasks_trend:"+9%", focus_trend:"+14%", habits:"23/30", avg_trend:"+11%" },
  },
  all: {
    labels: { en:["Jan","Feb","Mar","Apr","May"], zh:["1 月","2 月","3 月","4 月","5 月"] },
    focus:  [1820, 2240, 1980, 2330, 1750],
    tasks:  [98, 124, 110, 142, 88],
    kpi:    { tasks_trend:"+22%", focus_trend:"+31%", habits:"94%", avg_trend:"+18%" },
  },
};

const HOUR_DIST = [
  0, 0, 0, 0, 0, 0, 5, 12, 22, 34, 45, 38,   // 0–11
  20, 18, 30, 42, 36, 24, 14, 28, 22, 12, 6, 2 // 12–23
];

const TAG_PCTS = [38, 22, 18, 12, 10];

const HABIT_SCORES = [
  { id:"h2", percent: 90, streak: 27 },
  { id:"h1", percent: 75, streak: 14 },
  { id:"h5", percent: 60, streak:  8 },
  { id:"h3", percent: 40, streak:  3 },
  { id:"h4", percent: 25, streak:  1 },
];

function StatisticsModule({ lang }){
  const { s } = window.useI18n(lang);
  const [range, setRange] = useState("week");

  const series = SERIES[range];
  const labels = series.labels[lang] || series.labels.en;
  const focusData = series.focus;
  const tasksData = series.tasks;

  const totalFocus = focusData.reduce((a,b)=>a+b, 0);
  const totalTasks = tasksData.reduce((a,b)=>a+b, 0);

  const peakHour = HOUR_DIST.indexOf(Math.max(...HOUR_DIST));
  const peakHourLabel = `${String(peakHour).padStart(2,'0')}:00`;

  return (
    <div className="module module-stats">
      <header className="module-head">
        <h1 className="module-title"><Icon name="chart" size={18}/> {s("statistics.title")}</h1>
        <span className="grow"></span>
        <div className="seg">
          <button aria-selected={range==="week"}  onClick={()=>setRange("week")}>{s("statistics.this_week")}</button>
          <button aria-selected={range==="month"} onClick={()=>setRange("month")}>{s("statistics.this_month")}</button>
          <button aria-selected={range==="all"}   onClick={()=>setRange("all")}>{s("statistics.all_time")}</button>
        </div>
      </header>

      <div className="stats-grid">
        {/* KPIs */}
        <div className="kpi-row">
          <KPICard color="var(--accent)" icon="check"
            label={s("statistics.tasks_completed")}
            value={totalTasks} unit="" trend={series.kpi.tasks_trend}/>
          <KPICard color="var(--blue)" icon="timer"
            label={s("statistics.focus_time")}
            value={`${Math.floor(totalFocus/60)}`} unit={`h ${totalFocus%60}m`} trend={series.kpi.focus_trend}/>
          <KPICard color="var(--amber)" icon="pin"
            label={s("statistics.habits_kept")}
            value={series.kpi.habits.split('/')[0]} unit={series.kpi.habits.includes('/')?'/'+series.kpi.habits.split('/')[1]:series.kpi.habits} trend="100%"/>
          <KPICard color="var(--red)" icon="flame"
            label={s("statistics.daily_avg")}
            value={Math.round(totalFocus/labels.length)} unit="m" trend={series.kpi.avg_trend}/>
        </div>

        {/* Focus trend line chart (large) */}
        <div className="stats-chart stats-trend panel">
          <div className="sc-head">
            <h3>{lang==="zh"?"专注时长趋势":"Focus trend"}</h3>
            <div className="sc-totals mono">{totalFocus} min · {labels.length} {lang==="zh"?"段":"buckets"}</div>
          </div>
          <LineChart labels={labels} data={focusData} color="var(--accent)" unit="m"/>
        </div>

        {/* Tasks bar chart */}
        <div className="stats-chart panel">
          <div className="sc-head">
            <h3>{s("statistics.tasks_completed")}</h3>
            <div className="sc-totals mono">{totalTasks}</div>
          </div>
          <BarChart labels={labels} data={tasksData} color="var(--blue)"/>
        </div>

        {/* Productive hours (24-hour bar) */}
        <div className="stats-chart panel">
          <div className="sc-head">
            <h3>{lang==="zh"?"高产时段":"Productive hours"}</h3>
            <div className="sc-totals mono"><Icon name="flame" size={11} color="var(--red)"/> {lang==="zh"?"高峰":"Peak"} {peakHourLabel}</div>
          </div>
          <HourBar data={HOUR_DIST} peak={peakHour}/>
        </div>

        {/* Tag breakdown donut */}
        <div className="stats-donut panel">
          <h3>{lang==="zh"?"标签分布":"By tag"}</h3>
          <RingChart segs={MOCK.tags.map((t,i)=>({ v: TAG_PCTS[i], color: t.color }))}/>
          <ul className="legend">
            {MOCK.tags.map((tg, i) => (
              <li key={tg.id}>
                <span className="leg-dot" style={{background: tg.color}}></span>
                <span>{lang==="zh" ? tg.zh : tg.en}</span>
                <span className="grow"></span>
                <span className="mono">{TAG_PCTS[i]}%</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Habit leaderboard */}
        <div className="stats-habits panel">
          <h3>{lang==="zh"?"习惯排行":"Habit leaderboard"}</h3>
          <ul className="habit-rank">
            {HABIT_SCORES.map((rank, i) => {
              const habit = MOCK.habits.find(h => h.id === rank.id) || MOCK.habits[0];
              return (
                <li key={rank.id} className="hrank-row">
                  <span className="hrank-i mono">{i+1}</span>
                  <span className="hrank-emoji">{habit.emoji}</span>
                  <div className="hrank-body">
                    <div className="hrank-title">{habit.title[lang]}</div>
                    <div className="hrank-bar"><div style={{width: rank.percent+"%"}}/></div>
                  </div>
                  <span className="hrank-streak mono">
                    <Icon name="fire" size={11} color="var(--red)"/> {rank.streak}d
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Heatmap */}
        <div className="stats-heat panel">
          <h3>{lang==="zh"?"专注热力图":"Focus heatmap"} <span className="muted mono" style={{fontSize:"11px",fontWeight:500}}>{lang==="zh"?"近 26 周":"Last 26 weeks"}</span></h3>
          <Heatmap/>
          <div className="heat-legend">
            <span className="muted">{lang==="zh"?"少":"Less"}</span>
            {[0,1,2,3,4].map(v=><span key={v} className={"heat-cell heat-"+v}></span>)}
            <span className="muted">{lang==="zh"?"多":"More"}</span>
          </div>
        </div>

        {/* Insight callout */}
        <div className="stats-insight panel">
          <Icon name="sparkle" size={18} color="var(--accent)"/>
          <div>
            <h4>{lang==="zh"?"本周洞察":"This week's insight"}</h4>
            <p>{lang==="zh"
              ? `你在 ${peakHourLabel} 左右最高产，专注时长比上周多 ${series.kpi.focus_trend}。继续保持上午的节奏。`
              : `You're sharpest around ${peakHourLabel}, and your focus time is ${series.kpi.focus_trend} vs last period. Keep the morning rhythm.`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- KPI ---------- */
function KPICard({ color, icon, label, value, unit, trend }){
  return (
    <div className="kpi panel">
      <div className="kpi-head">
        <span className="kpi-ico" style={{color, background:`color-mix(in oklch, ${color} 14%, transparent)`}}>
          <Icon name={icon} size={14}/>
        </span>
        <span className="kpi-label">{label}</span>
      </div>
      <div className="kpi-row-val">
        <div className="kpi-val mono">{value}<span className="kpi-unit">{unit}</span></div>
        <div className="kpi-trend">{trend}</div>
      </div>
    </div>
  );
}

/* ---------- Bars ---------- */
function BarChart({ labels, data, color, unit }){
  const max = Math.max(...data, 1);
  return (
    <div className="bar-chart">
      {data.map((v, i) => (
        <div key={i} className="bar-col">
          <div className="bar-val mono">{v}{unit||""}</div>
          <div className="bar-track">
            <div className="bar-fill" style={{ height: `${(v/max)*100}%`, background: color }}></div>
          </div>
          <div className="bar-label">{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}

function HourBar({ data, peak }){
  const max = Math.max(...data, 1);
  return (
    <div className="hour-bar">
      {data.map((v, i) => (
        <div key={i} className={"hbar-col" + (i===peak?" peak":"")}>
          <div className="hbar-track">
            <div className="hbar-fill" style={{height: `${(v/max)*100}%`}}/>
          </div>
          {i % 3 === 0 && <div className="hbar-label mono">{String(i).padStart(2,'0')}</div>}
        </div>
      ))}
    </div>
  );
}

/* ---------- Line chart ---------- */
function LineChart({ labels, data, color, unit }){
  const w = 600, h = 180, pad = 30;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = (max - min) || 1;
  const pts = data.map((v,i) => {
    const x = pad + i * (w - 2*pad) / Math.max(1, data.length-1);
    const y = h - pad - ((v - min) / span) * (h - 2*pad);
    return [x, y];
  });
  const linePath = pts.map((p,i)=> (i===0?"M":"L")+p[0]+","+p[1]).join(" ");
  const areaPath = linePath + " L"+pts[pts.length-1][0]+","+(h-pad)+" L"+pts[0][0]+","+(h-pad)+" Z";

  return (
    <div className="line-chart">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="lcFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity=".25"/>
            <stop offset="1" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[0,1,2,3].map(g=> {
          const y = pad + g * (h - 2*pad) / 3;
          return <line key={g} x1={pad} x2={w-pad} y1={y} y2={y} stroke="var(--border-1)" strokeWidth="1"/>;
        })}
        <path d={areaPath} fill="url(#lcFill)"/>
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
        {pts.map((p,i)=>(
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r="3.5" fill={color}/>
            <circle cx={p[0]} cy={p[1]} r="6" fill={color} opacity=".18"/>
          </g>
        ))}
      </svg>
      <div className="lc-labels">
        {labels.map((l,i) => <span key={i}>{l}</span>)}
      </div>
    </div>
  );
}

/* ---------- Donut ---------- */
function RingChart({ segs }){
  const total = segs.reduce((a,b)=>a+b.v, 0);
  const r = 50;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg viewBox="0 0 120 120" width="160" height="160" className="ringchart">
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border-1)" strokeWidth="10"/>
      {segs.map((seg, i) => {
        const len = (seg.v/total) * c;
        const offset = c - acc;
        acc += len;
        return (
          <circle key={i} cx="60" cy="60" r={r} fill="none"
            stroke={seg.color} strokeWidth="10"
            strokeDasharray={`${len} ${c-len}`}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dashoffset .4s var(--ease-out)" }}/>
        );
      })}
    </svg>
  );
}

/* ---------- Heatmap ---------- */
function Heatmap(){
  const cells = useMemo(() => {
    const arr = [];
    for (let w = 0; w < 26; w++) {
      for (let d = 0; d < 7; d++) {
        const v = Math.random();
        arr.push(v < .3 ? 0 : v < .55 ? 1 : v < .75 ? 2 : v < .9 ? 3 : 4);
      }
    }
    return arr;
  }, []);
  return (
    <div className="heatmap">
      {cells.map((v, i) => <div key={i} className={"heat-cell heat-"+v}></div>)}
    </div>
  );
}

window.StatisticsModule = StatisticsModule;
