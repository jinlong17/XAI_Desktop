/* ============================================================
   Eisenhower Matrix — 2x2 productivity grid
   ============================================================ */
const Icon = window.Icon;
const MOCK = window.MOCK;

function MatrixModule({ lang }){
  const { s } = window.useI18n(lang);

  // Reuse overdue tasks for Q4
  const overdue = MOCK.taskCols[0].tasks;
  const nodate  = MOCK.taskCols[3].tasks;

  const quadrants = [
    { id:"q1", key:"urgent_important",         color:"var(--red)",   tasks: [] },
    { id:"q2", key:"not_urgent_important",     color:"var(--amber)", tasks: [] },
    { id:"q3", key:"urgent_unimportant",       color:"var(--blue)",  tasks: [] },
    { id:"q4", key:"not_urgent_unimportant",   color:"var(--accent)",tasks: overdue, extra: nodate },
  ];

  return (
    <div className="module module-matrix">
      <header className="module-head">
        <h1 className="module-title">{s("matrix.title")}</h1>
        <span className="grow"></span>
        <button className="icon-btn"><Icon name="plus" size={16}/></button>
        <button className="icon-btn"><Icon name="dots" size={16}/></button>
      </header>

      <div className="matrix-grid">
        {quadrants.map((q, idx) => (
          <section key={q.id} className="matrix-q panel" style={{"--qc": q.color}}>
            <header className="q-head">
              <span className="q-number">{idx+1}</span>
              <h2 className="q-title">{s(`matrix.${q.key}`)}</h2>
              <span className="grow"></span>
              <button className="icon-btn"><Icon name="plus" size={14}/></button>
              <button className="icon-btn"><Icon name="dots" size={14}/></button>
            </header>
            <div className="q-body">
              {q.tasks.length === 0 ? (
                <div className="q-empty">{s("common.no_tasks")}</div>
              ) : (
                <>
                  <Group label={s("common.overdue")} count={q.tasks.length} lang={lang} tasks={q.tasks}/>
                  {q.extra && <Group label={s("common.no_date")} count={q.extra.length} lang={lang} tasks={q.extra}/>}
                </>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function Group({ label, count, tasks, lang }){
  const [open, setOpen] = useState(true);
  return (
    <div className="m-group">
      <button className="m-group-head" onClick={()=>setOpen(!open)}>
        <Icon name="chevD" size={13} style={{transform: open?"rotate(0)":"rotate(-90deg)", transition:"transform .2s"}}/>
        <span>{label}</span>
        <span className="col-count">{count}</span>
      </button>
      {open && (
        <ul className="m-rows">
          {tasks.map(t => {
            const tag = t.tag ? MOCK.tags.find(x => x.cls === t.tag) : null;
            return (
              <li key={t.id} className="m-row">
                <span className="cbx"></span>
                <span className="m-title">{t.title[lang]}</span>
                <span className="grow"></span>
                {tag && <span className={"tag "+tag.cls}>{lang==="zh" ? tag.zh : tag.en}</span>}
                <span className="m-meta">{lang==="zh" ? "收件箱" : "Inbox"}</span>
                {t.date && <span className="m-date mono">{lang==="zh" && t.dateZh ? t.dateZh : t.date}</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

window.MatrixModule = MatrixModule;
