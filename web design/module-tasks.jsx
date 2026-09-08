/* ============================================================
   Tasks module — multi-column board with drag-and-drop between time buckets
   ============================================================ */

const Icon = window.Icon;
const MOCK = window.MOCK;

function TaskTag({ id, lang }){
  const tag = MOCK.tags.find(t => t.id === id);
  if (!tag) return null;
  return <span className={"tag " + tag.cls}>{lang === "zh" ? tag.zh : tag.en}</span>;
}
function taskTagId(cls){
  return { study:"1", work:"2", personal:"3", todo:"4", other:"5" }[cls] || "1";
}

/* Compute display date string for a task based on the column it belongs to */
function dateForCol(colId){
  const today = new Date();
  const fmt = (d) => `${d.getMonth()+1}/${d.getDate()}`;
  if (colId === "overdue") {
    const d = new Date(today); d.setDate(d.getDate() - 3); return fmt(d);
  }
  if (colId === "next7") {
    const d = new Date(today); d.setDate(d.getDate() + 2); return fmt(d);
  }
  if (colId === "later") {
    const d = new Date(today); d.setDate(d.getDate() + 30);
    return d.toLocaleString("en-US", { month:"short", day:"numeric" });
  }
  return null;
}

function TaskCardV2({ task, lang, completed, onToggle, draggable, onDragStart, onDragEnd, dragging }){
  const tag = task.tag ? MOCK.tags.find(t => t.cls === task.tag) : null;
  const hasMeta = tag || task.date || task.inbox;
  return (
    <div
      className={"task-card" + (completed ? " is-completed" : "") + (dragging ? " is-dragging" : "")}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onToggle}>
      <div className="task-card-head">
        <span className="task-grip" data-no-drag><Icon name="grip" size={12}/></span>
        <span className={"cbx" + (completed ? " checked" : "")} onClick={(e)=>{e.stopPropagation(); onToggle();}}></span>
        <div className="task-card-body">
          <div className="task-title">{task.title[lang]}</div>
          {task.sub?.[lang] && <div className="task-sub">{task.sub[lang]}</div>}
        </div>
        {task.dateLabel?.[lang] && <span className="task-pill">{task.dateLabel[lang]}</span>}
      </div>
      {hasMeta && (
        <div className="task-meta">
          {tag && <span className={"tag " + tag.cls}>{lang === "zh" ? tag.zh : tag.en}</span>}
          <span className="grow"></span>
          {task.date && <span className="task-date">{lang==="zh" && task.dateZh ? task.dateZh : task.date}</span>}
          {task.inbox && <span className="task-loc"><Icon name="inbox" size={11}/></span>}
        </div>
      )}
    </div>
  );
}

function TaskSidebar({ lang, list, setList }){
  const { s } = window.useI18n(lang);
  const items = MOCK.lists;
  return (
    <nav className="module-sidebar">
      <div className="sidebar-section">
        {items.map(it => (
          <div key={it.id}
            className="list-row"
            data-active={list === it.id}
            onClick={()=>setList(it.id)}>
            <Icon name={it.icon} size={16}/>
            <span className="grow">{s("common." + it.key)}</span>
            {it.count != null && <span className="count">{it.count}</span>}
          </div>
        ))}
      </div>

      <div className="sec-label">{s("common.lists")}</div>
      <div className="sidebar-section">
        {MOCK.customLists.map(cl => (
          <div key={cl.id} className="list-row" data-active={list===cl.id} onClick={()=>setList(cl.id)}>
            <span className="dot" style={{color: cl.color}}></span>
            <span className="grow">{lang==="zh" ? cl.zh : cl.en}</span>
          </div>
        ))}
      </div>

      <div className="sec-label">{s("common.filters")}</div>
      <div className="filter-hint">
        {lang==="zh"
          ? "按清单、日期、优先级、标签等筛选任务。"
          : "Display tasks filtered by list, date, priority, tag, and more."}
      </div>

      <div className="sec-label">{s("common.tags")}</div>
      <div className="sidebar-section">
        {MOCK.tags.map(t => (
          <div key={t.id} className="list-row">
            <span className="dot" style={{color: t.color}}></span>
            <span className="grow">{lang==="zh" ? t.zh : t.en}</span>
            <span className="count">{t.count}</span>
          </div>
        ))}
      </div>

      <div className="sec-label">{s("common.calendar_sub")}</div>
      <div className="sidebar-section">
        <div className="list-row">
          <Icon name="calendar" size={16}/>
          <span className="grow">{lang==="zh" ? "本地日历" : "Local Calendars"}</span>
          <span className="count">8</span>
        </div>
      </div>

      <div className="sidebar-section sidebar-footer">
        <div className="list-row"><Icon name="check" size={16}/><span className="grow">{s("common.completed")}</span></div>
        <div className="list-row"><span className="dot" style={{color:"var(--text-3)"}}></span><span className="grow">{s("common.wont_do")}</span></div>
        <div className="list-row"><Icon name="trash" size={16}/><span className="grow">{s("common.trash")}</span></div>
      </div>
    </nav>
  );
}

function TasksModule({ lang }){
  const { s } = window.useI18n(lang);
  const [list, setList] = useState("all");
  const [completedTasks, setCompletedTasks] = useState(new Set());

  // Deep-clone MOCK.taskCols into local state so we can move tasks between columns
  const [taskCols, setTaskCols] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("xai_task_cols") || "null");
      if (Array.isArray(saved) && saved.length === MOCK.taskCols.length) return saved;
    } catch(e){}
    return JSON.parse(JSON.stringify(MOCK.taskCols));
  });
  useEffect(()=>{ try { localStorage.setItem("xai_task_cols", JSON.stringify(taskCols)); } catch(e){} }, [taskCols]);

  const toggle = (id) => setCompletedTasks(cs => {
    const n = new Set(cs);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  /* ------- drag and drop between columns ------- */
  const [dragging, setDragging]   = useState(null); // { taskId, fromColId }
  const [overColId, setOverColId] = useState(null);

  const onDragStart = (e, task, colId) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify({ taskId: task.id, fromColId: colId }));
    setDragging({ taskId: task.id, fromColId: colId });
  };
  const onDragEnd = () => { setDragging(null); setOverColId(null); };

  const onDragOverCol = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (overColId !== colId) setOverColId(colId);
  };
  const onDropCol = (e, toColId) => {
    e.preventDefault();
    let data;
    try { data = JSON.parse(e.dataTransfer.getData("text/plain")); } catch(err) { return; }
    const { taskId, fromColId } = data;
    setOverColId(null);
    setDragging(null);
    if (!taskId || fromColId === toColId) return;

    setTaskCols(cols => {
      const fromIdx = cols.findIndex(c => c.id === fromColId);
      const toIdx   = cols.findIndex(c => c.id === toColId);
      if (fromIdx < 0 || toIdx < 0) return cols;
      const fromCol = cols[fromIdx];
      const task = fromCol.tasks.find(t => t.id === taskId);
      if (!task) return cols;

      // Update date label based on destination column
      const newDate = dateForCol(toColId);
      const moved = { ...task };
      if (toColId === "nodate") {
        delete moved.date; delete moved.dateZh; delete moved.dateLabel;
      } else if (newDate) {
        moved.date = newDate;
        // synthesize zh date
        const m = newDate.match(/^(\d+)\/(\d+)/);
        moved.dateZh = m ? `${m[1]} 月 ${m[2]} 日` : newDate;
        delete moved.dateLabel;
      }
      // Remove sub when moving (it usually doesn't apply)
      // Keep tag/inbox.

      return cols.map((c, i) => {
        if (i === fromIdx) return { ...c, tasks: c.tasks.filter(t => t.id !== taskId), count: Math.max(0, (c.count||0) - 1) };
        if (i === toIdx)   return { ...c, tasks: [moved, ...c.tasks], count: (c.count||0) + 1 };
        return c;
      });
    });
  };

  return (
    <div className="module module-tasks">
      <TaskSidebar lang={lang} list={list} setList={setList}/>
      <main className="tasks-main">
        <header className="module-head">
          <div className="row gap-2">
            <Icon name="list" size={18}/>
            <h1 className="module-title">{s("tasks.all")}</h1>
            {dragging && (
              <span className="drag-hint" style={{marginLeft:8}}>
                {lang==="zh"?"拖到任意时间列改截止":"Drop on any column to reschedule"}
              </span>
            )}
          </div>
          <div className="row gap-2">
            <button className="icon-btn"><Icon name="sliders" size={16}/></button>
            <button className="icon-btn"><Icon name="dots" size={16}/></button>
          </div>
        </header>

        <div className="task-columns">
          {taskCols.map(col => (
            <section key={col.id}
              className={"task-col" + (overColId === col.id ? " drop-target" : "")}
              onDragOver={(e)=>onDragOverCol(e, col.id)}
              onDragLeave={()=>setOverColId(o => o === col.id ? null : o)}
              onDrop={(e)=>onDropCol(e, col.id)}>
              <header className="task-col-head">
                <h2>{s("common." + col.key)}</h2>
                <span className="col-count">{col.tasks.length}</span>
                <span className="grow"></span>
                {col.action === "postpone" && <button className="col-action">{s("common.postpone")} <Icon name="plus" size={11}/></button>}
                {col.action === "add" && <button className="icon-btn"><Icon name="plus" size={14}/></button>}
              </header>
              <div className="task-col-body">
                {col.tasks.map(task => (
                  <TaskCardV2 key={task.id} task={task} lang={lang}
                    completed={completedTasks.has(task.id)}
                    onToggle={()=>toggle(task.id)}
                    draggable
                    dragging={dragging?.taskId === task.id}
                    onDragStart={(e)=>onDragStart(e, task, col.id)}
                    onDragEnd={onDragEnd}/>
                ))}
                {col.tasks.length === 0 && (
                  <div className="task-col-empty">{lang==="zh"?"拖任务到这里":"Drop tasks here"}</div>
                )}
                {col.completed && (
                  <CompletedGroup tasks={col.completed} lang={lang}/>
                )}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

function CompletedGroup({ tasks, lang }){
  const [open, setOpen] = useState(true);
  const { s } = window.useI18n(lang);
  return (
    <div className="completed-group">
      <button className="completed-head" onClick={()=>setOpen(!open)}>
        <Icon name="chevD" size={14} style={{transform: open ? "rotate(0)" : "rotate(-90deg)", transition:"transform .2s"}}/>
        {s("common.completed")} <span className="col-count">{tasks.length}</span>
      </button>
      {open && (
        <div className="completed-list">
          {tasks.map(t => (
            <TaskCardV2 key={t.id} task={t} lang={lang} completed={true} onToggle={()=>{}} draggable={false}/>
          ))}
          <button className="view-more">{s("common.view_more")}</button>
        </div>
      )}
    </div>
  );
}

window.TasksModule = TasksModule;
