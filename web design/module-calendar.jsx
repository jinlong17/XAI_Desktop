/* ============================================================
   Calendar module — dense month grid with colored event strips
   ============================================================ */
const Icon = window.Icon;
const MOCK = window.MOCK;

function CalendarModule({ lang }){
  const { s } = window.useI18n(lang);
  const [view, setView] = useState("month");

  // May 2026 starts on a Friday, so week starts Mon: w18 row begins on Apr 27
  // we render 5 rows.
  const rows = [
    [{d:27,m:"prev",w:"W18"},{d:28,m:"prev"},{d:29,m:"prev"},{d:30,m:"prev"},{d:1,m:"cur",holiday:lang==="zh"?"劳动节":""},{d:2,m:"cur"},{d:3,m:"cur"}],
    [{d:4,m:"cur",w:"W19"},{d:5,m:"cur"},{d:6,m:"cur"},{d:7,m:"cur"},{d:8,m:"cur"},{d:9,m:"cur",holiday:lang==="zh"?"母亲节":""},{d:10,m:"cur"}],
    [{d:11,m:"cur",w:"W20"},{d:12,m:"cur"},{d:13,m:"cur"},{d:14,m:"cur"},{d:15,m:"cur"},{d:16,m:"cur"},{d:17,m:"cur"}],
    [{d:18,m:"cur",w:"W21"},{d:19,m:"cur"},{d:20,m:"cur"},{d:21,m:"cur"},{d:22,m:"cur",today:true},{d:23,m:"cur"},{d:24,m:"cur"}],
    [{d:25,m:"cur",w:"W22"},{d:26,m:"cur"},{d:27,m:"cur"},{d:28,m:"cur"},{d:29,m:"cur"},{d:30,m:"cur"},{d:31,m:"cur"}],
  ];

  const dayNames = lang==="zh" ? ["周一","周二","周三","周四","周五","周六","周日"]
                                : ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  return (
    <div className="module module-cal">
      <header className="cal-toolbar">
        <button className="icon-btn"><Icon name="list" size={16}/></button>
        <h1 className="module-title">{lang==="zh" ? "2026 年 5 月" : "May 2026"}</h1>
        <span className="grow"></span>
        <button className="icon-btn"><Icon name="plus" size={16}/></button>
        <div className="seg">
          <button aria-selected={view==="day"}   onClick={()=>setView("day")}>{s("cal.day")}</button>
          <button aria-selected={view==="week"}  onClick={()=>setView("week")}>{s("cal.week")}</button>
          <button aria-selected={view==="month"} onClick={()=>setView("month")}>{s("cal.month")}</button>
        </div>
        <button className="icon-btn"><Icon name="arrowL" size={16}/></button>
        <button className="btn ghost btn-today">{s("cal.today")}</button>
        <button className="icon-btn"><Icon name="arrowR" size={16}/></button>
        <button className="icon-btn"><Icon name="dots" size={16}/></button>
      </header>

      <div className="cal-grid panel">
        <div className="cal-weekheader">
          {dayNames.map((d,i)=>(<div key={i} className="cal-weekday">{d}</div>))}
        </div>
        <div className="cal-rows">
          {rows.map((row, ri) => (
            <div key={ri} className="cal-row">
              {row.map((cell, ci) => {
                const events = (cell.m === "cur" && MOCK.calEvents[cell.d]) || [];
                return (
                  <div key={ci} className={"cal-day" + (cell.m==="prev"?" prev":"") + (cell.today?" today":"")}>
                    <div className="cal-day-head">
                      {ci===0 && cell.w && <span className="cal-week-num">{cell.w}</span>}
                      <span className="cal-day-num">
                        {cell.today
                          ? <span className="today-pill">{cell.d}</span>
                          : cell.d}
                      </span>
                      {cell.holiday && <span className="cal-holiday">{cell.holiday}</span>}
                    </div>
                    <div className="cal-events">
                      {events.slice(0,5).map((e, ei) => (
                        <div key={ei} className={"cal-event ev-" + e.c}>
                          <span className="ev-dot"></span>
                          <span className="ev-title">{e.t[lang]}</span>
                          {e.time && <span className="ev-time mono">{e.time}</span>}
                        </div>
                      ))}
                      {events.length > 5 && <div className="cal-more">+{events.length-5}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="cal-banner">
        <Icon name="star" size={14}/>
        <span>{s("cal.sample_banner")}</span>
        <button className="banner-upgrade">{s("common.upgrade")} <Icon name="chevR" size={12}/></button>
      </div>
    </div>
  );
}

window.CalendarModule = CalendarModule;
