/* ============================================================
   Board module — multiple views + list color customization
   Views: Board / Table / Calendar / Dashboard / Timeline / Map
   ============================================================ */
const Icon = window.Icon;
const MOCK = window.MOCK;

// Look up a label by id across global + PM palettes
const ALL_LABELS = () => [...MOCK.boardLabels, ...(window.PM_LABELS || [])];
const findLabel = (id) => ALL_LABELS().find(l => l.id === id);

/* 10-color palette for list colors */
const LIST_COLORS = [
  { id:"green",  c:"oklch(62% 0.13 155)" },
  { id:"yellow", c:"oklch(78% 0.16 90)" },
  { id:"orange", c:"oklch(70% 0.16 60)" },
  { id:"red",    c:"oklch(63% 0.18 25)" },
  { id:"purple", c:"oklch(62% 0.16 295)" },
  { id:"blue",   c:"oklch(60% 0.16 245)" },
  { id:"teal",   c:"oklch(62% 0.12 195)" },
  { id:"lime",   c:"oklch(72% 0.16 130)" },
  { id:"pink",   c:"oklch(68% 0.16 350)" },
  { id:"gray",   c:"oklch(58% 0.01 220)" },
];

function BoardModule({ lang }){
  const { s } = window.useI18n(lang);

  /* ----- Workspaces + boards (persisted) ----- */
  const [workspaces] = useState(window.DEFAULT_WORKSPACES);
  const [boards, setBoards] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("xai_boards_v2") || "null");
      if (Array.isArray(saved) && saved.length) return saved;
    } catch(e){}
    return window.makeDefaultBoards();
  });
  const [activeBoardId, setActiveBoardId] = useState(() => {
    try { return localStorage.getItem("xai_active_board") || "b-default"; } catch(e){ return "b-default"; }
  });
  useEffect(()=>{ try { localStorage.setItem("xai_boards_v2", JSON.stringify(boards)); } catch(e){} }, [boards]);
  useEffect(()=>{ try { localStorage.setItem("xai_active_board", activeBoardId); } catch(e){} }, [activeBoardId]);

  const activeBoard = boards.find(b => b.id === activeBoardId) || boards[0];
  const activeWorkspace = workspaces.find(w => w.id === activeBoard?.workspaceId) || workspaces[0];
  const lists = activeBoard?.lists || [];

  const setLists = (updater) => {
    setBoards(bs => bs.map(b => b.id === activeBoardId
      ? { ...b, lists: typeof updater === "function" ? updater(b.lists) : updater }
      : b));
  };

  /* ----- Switcher / creator state ----- */
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [createOpen, setCreateOpen]     = useState(false);

  const createBoard = (templateId, name, workspaceId) => {
    const tpl = window.BOARD_TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;
    const newId = "b-" + Date.now().toString(36);
    const newBoard = {
      id: newId,
      workspaceId,
      name: { en: name, zh: name },
      cover: tpl.cover,
      template: templateId,
      lists: tpl.lists(),
    };
    setBoards(bs => [...bs, newBoard]);
    setActiveBoardId(newId);
    setCreateOpen(false);
    setSwitcherOpen(false);
  };
  const deleteBoard = (id) => {
    setBoards(bs => {
      const remaining = bs.filter(b => b.id !== id);
      if (id === activeBoardId && remaining[0]) setActiveBoardId(remaining[0].id);
      return remaining.length ? remaining : window.makeDefaultBoards();
    });
  };

  /* ----- View state ----- */
  const [view, setView]               = useState("board");
  const [viewPickerOpen, setViewOpen] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [panels, setPanels] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("xai_board_panels") || "null");
      if (saved && typeof saved === "object") return saved;
    } catch(e){}
    return { inbox: false, planner: false, board: true };
  });
  useEffect(()=>{ try { localStorage.setItem("xai_board_panels", JSON.stringify(panels)); } catch(e){} }, [panels]);
  const togglePanel = (k) => setPanels(p => {
    const next = { ...p, [k]: !p[k] };
    // keep at least one panel on
    if (!next.inbox && !next.planner && !next.board) next.board = true;
    return next;
  });
  const [inboxCards, setInboxCards] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("xai_board_inbox") || "null");
      if (Array.isArray(saved)) return saved;
    } catch(e){}
    return [
      { id:"ix1", text:{ en:"Capture from email, Slack, and Teams", zh:"从邮件 / Slack / Teams 捕获" } },
      { id:"ix2", text:{ en:"Dive into Trello basics", zh:"了解项目板基础" } },
      { id:"ix3", text:{ en:"See it, send it, save it for later", zh:"看到了就发到收件箱" } },
    ];
  });
  useEffect(()=>{ try { localStorage.setItem("xai_board_inbox", JSON.stringify(inboxCards)); } catch(e){} }, [inboxCards]);
  const [draftListIdx, setDraftListIdx] = useState(null);
  const [composerText, setComposerText] = useState("");
  const [showListComposer, setShowListComposer] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [openCard, setOpenCard]         = useState(null);
  const [listMenu, setListMenu]         = useState(null);

  const totalCards = lists.reduce((n,l)=>n+l.cards.length, 0);

  const addCard = (listIdx) => {
    const text = composerText.trim();
    if (!text) { setDraftListIdx(null); return; }
    setLists(ls => ls.map((l,i) => i===listIdx
      ? { ...l, cards: [...l.cards, { id:"new-"+Date.now(), title:{ en:text, zh:text }, labels:[] }]}
      : l));
    setComposerText("");
  };

  const addList = () => {
    const text = newListName.trim();
    if (!text) { setShowListComposer(false); return; }
    setLists(ls => [...ls, { id:"l-"+Date.now(), key:null, customName:{en:text,zh:text}, cards:[] }]);
    setNewListName("");
  };

  const updateCard = (listId, cardId, patch) => {
    setLists(ls => ls.map(l => l.id === listId
      ? { ...l, cards: l.cards.map(c => c.id === cardId ? { ...c, ...patch } : c) }
      : l));
  };
  const moveCardToList = (cardId, fromListId, toListId) => {
    if (fromListId === toListId) return;
    setLists(ls => {
      const fromList = ls.find(l => l.id === fromListId);
      const card = fromList?.cards.find(c => c.id === cardId);
      if (!card) return ls;
      return ls.map(l => {
        if (l.id === fromListId) return { ...l, cards: l.cards.filter(c => c.id !== cardId) };
        if (l.id === toListId)   return { ...l, cards: [...l.cards, card] };
        return l;
      });
    });
  };

  const setListColor = (listId, colorId) => {
    setLists(ls => ls.map(l => l.id === listId ? { ...l, color: colorId } : l));
  };

  const VIEWS_CONFIG = [
    { id:"board",     icon:"kanban" },
    { id:"table",     icon:"list" },
    { id:"calendar",  icon:"calendar" },
    { id:"dashboard", icon:"chart" },
    { id:"timeline",  icon:"sliders" },
    { id:"map",       icon:"globe" },
  ];

  const isPM = activeBoard?.template === "pm";

  return (
    <div className="module module-board">
      <header className="board-toolbar">
        <span className="ws-chip" style={{ background: activeWorkspace?.color }}>
          {activeWorkspace?.name[lang]?.slice(0,2)}
        </span>
        <button className="board-title-wrap" onClick={()=>setSwitcherOpen(true)}>
          <Icon name="kanban" size={18}/>
          <h1 className="module-title">{activeBoard?.name[lang]}</h1>
          <Icon name="chevD" size={14}/>
        </button>

        {/* View picker */}
        <div className="view-picker-wrap">
          <button className="view-picker-btn" onClick={()=>setViewOpen(v=>!v)}>
            <Icon name={VIEWS_CONFIG.find(v=>v.id===view).icon} size={14}/>
            <span>{s(`board.views.${view}`)}</span>
            <Icon name="chevD" size={12}/>
          </button>
          {viewPickerOpen && (
            <>
              <div className="popover-scrim" onClick={()=>setViewOpen(false)}/>
              <div className="popover view-picker">
                <header className="popover-head">
                  <span>{s("board.views_header")}</span>
                  <button className="icon-btn" onClick={()=>setViewOpen(false)}><Icon name="close" size={14}/></button>
                </header>
                <div className="popover-list">
                  {VIEWS_CONFIG.map(v => (
                    <button key={v.id}
                      className={"popover-item" + (view===v.id?" active":"")}
                      onClick={()=>{ setView(v.id); setViewOpen(false); }}>
                      <Icon name={v.icon} size={15}/>
                      <span>{s(`board.views.${v.id}`)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <span className="board-count">{totalCards} {s("board.total")}</span>

        <span className="grow"></span>

        <div className="board-members">
          {MOCK.boardMembers.map(m => (
            <span key={m.id} className="member-chip" style={{background:m.color}}>{m.name}</span>
          ))}
        </div>
        <button className={"board-icon-btn" + (overviewOpen?" active":"")} onClick={()=>setOverviewOpen(o=>!o)}>
          <Icon name="chart" size={14}/> {lang==="zh"?"总览":"Overview"}
        </button>
        <button className="board-icon-btn"><Icon name="filter" size={14}/> {s("board.filter")}</button>
        <button className="board-icon-btn primary"><Icon name="user" size={14}/> {s("board.share")}</button>
        <button className="icon-btn"><Icon name="dots" size={16}/></button>
      </header>

      <div className="board-canvas">
        {overviewOpen && view === "board" && panels.board && <StatusOverviewBanner lists={lists} lang={lang} onClose={()=>setOverviewOpen(false)}/>}

        <div className={"board-panels board-panels-" + (Object.values(panels).filter(Boolean).length === 1 ? "single" : "multi")}>
          {panels.inbox && (
            <InboxPanel cards={inboxCards} setCards={setInboxCards} lang={lang}/>
          )}
          {panels.planner && (
            <PlannerPanel lists={lists} lang={lang} onOpenCard={(card, listId)=>setOpenCard({listId, card})}/>
          )}
          {panels.board && (
            <div className="board-main-panel">
              {view === "board"     && <BoardView lists={lists} lang={lang} s={s} board={activeBoard}
                                           draftListIdx={draftListIdx} setDraftListIdx={setDraftListIdx}
                                           composerText={composerText} setComposerText={setComposerText}
                                           showListComposer={showListComposer} setShowListComposer={setShowListComposer}
                                           newListName={newListName} setNewListName={setNewListName}
                                           addCard={addCard} addList={addList}
                                           listMenu={listMenu} setListMenu={setListMenu}
                                           setListColor={setListColor}
                                           moveCardToList={moveCardToList}
                                           onOpenCard={(card, listId)=>setOpenCard({listId, card})}/>}
              {view === "table"     && <TableView lists={lists} lang={lang} s={s} updateCard={updateCard} onOpenCard={(card, listId)=>setOpenCard({listId, card})}/>}
              {view === "calendar"  && <BoardCalendarView lists={lists} lang={lang} s={s} updateCard={updateCard} onOpenCard={(card, listId)=>setOpenCard({listId, card})}/>}
              {view === "dashboard" && <BoardDashboardView lists={lists} lang={lang} s={s}/>}
              {view === "timeline"  && <TimelineView lists={lists} lang={lang} s={s} updateCard={updateCard} onOpenCard={(card, listId)=>setOpenCard({listId, card})}/>}
              {view === "map"       && <MapView lang={lang} s={s}/>}
            </div>
          )}
        </div>
      </div>

      <div className="board-view-switcher">
        {[
          { id:"inbox",   icon:"inbox",  key:"view_inbox" },
          { id:"planner", icon:"calendar", key:"view_planner" },
          { id:"board",   icon:"kanban", key:"view_board" },
        ].map(v => (
          <button key={v.id}
            className={"bv-btn" + (panels[v.id]?" active":"")}
            onClick={()=>togglePanel(v.id)}>
            <Icon name={v.icon} size={14}/>
            <span>{s("board."+v.key)}</span>
          </button>
        ))}
        <span className="bv-divider"/>
        <button className="bv-btn" onClick={()=>setSwitcherOpen(true)}>
          <Icon name="grid4" size={14}/>
          <span>{lang==="zh"?"切换看板":"Switch boards"}</span>
        </button>
      </div>

      {switcherOpen && (
        <BoardSwitcher
          lang={lang} workspaces={workspaces} boards={boards}
          activeBoardId={activeBoardId}
          onPick={(id)=>{ setActiveBoardId(id); setSwitcherOpen(false); }}
          onCreate={()=>{ setCreateOpen(true); setSwitcherOpen(false); }}
          onDelete={deleteBoard}
          onClose={()=>setSwitcherOpen(false)}/>
      )}

      {createOpen && (
        <BoardCreator
          lang={lang} workspaces={workspaces}
          onCancel={()=>setCreateOpen(false)}
          onCreate={createBoard}/>
      )}

      {openCard && (
        <CardDetail
          lang={lang}
          listId={openCard.listId}
          card={openCard.card}
          onClose={()=>setOpenCard(null)}/>
      )}
    </div>
  );
}

/* ============================================================
   BOARD VIEW (default Kanban)
   ============================================================ */
function BoardView({ lists, lang, s, draftListIdx, setDraftListIdx, composerText, setComposerText,
                    showListComposer, setShowListComposer, newListName, setNewListName,
                    addCard, addList, listMenu, setListMenu, setListColor, moveCardToList, onOpenCard }){
  const [dragging, setDragging] = useState(null); // { cardId, fromListId }
  const [overListId, setOverListId] = useState(null);

  const onDragStartCard = (e, card, listId) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify({ cardId: card.id, fromListId: listId }));
    setDragging({ cardId: card.id, fromListId: listId });
  };
  const onDragEndCard = () => { setDragging(null); setOverListId(null); };
  const onDragOverList = (e, listId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (overListId !== listId) setOverListId(listId);
  };
  const onDropList = (e, toListId) => {
    e.preventDefault();
    let data;
    try { data = JSON.parse(e.dataTransfer.getData("text/plain")); } catch(err){ return; }
    setOverListId(null);
    setDragging(null);
    if (data?.cardId && data.fromListId !== toListId) {
      moveCardToList(data.cardId, data.fromListId, toListId);
    }
  };

  return (
    <div className="board-lists">
      {lists.map((l, li) => (
        <BoardList key={l.id}
          list={l} lang={lang}
          isComposer={draftListIdx === li}
          openComposer={()=>{ setDraftListIdx(li); setComposerText(""); }}
          closeComposer={()=>setDraftListIdx(null)}
          composerText={composerText} setComposerText={setComposerText}
          addCard={()=>addCard(li)}
          listMenuOpen={listMenu === l.id}
          openListMenu={()=>setListMenu(l.id)}
          closeListMenu={()=>setListMenu(null)}
          setListColor={(colorId) => setListColor(l.id, colorId)}
          isDropTarget={overListId === l.id && dragging && dragging.fromListId !== l.id}
          onListDragOver={(e)=>onDragOverList(e, l.id)}
          onListDragLeave={()=>setOverListId(o => o === l.id ? null : o)}
          onListDrop={(e)=>onDropList(e, l.id)}
          onCardDragStart={(e, card)=>onDragStartCard(e, card, l.id)}
          onCardDragEnd={onDragEndCard}
          draggingCardId={dragging?.cardId}
          onOpenCard={(card)=>onOpenCard(card, l.id)}/>
      ))}

      {showListComposer ? (
        <div className="list-composer">
          <input autoFocus className="list-name-input"
            value={newListName}
            onChange={e=>setNewListName(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter") addList(); if(e.key==="Escape") setShowListComposer(false); }}
            placeholder={lang==="zh" ? "输入列名…" : "Enter list name…"}/>
          <div className="composer-actions">
            <button className="btn primary" onClick={addList}>{s("common.add")}</button>
            <button className="icon-btn" onClick={()=>setShowListComposer(false)}><Icon name="close" size={16}/></button>
          </div>
        </div>
      ) : (
        <button className="add-list-btn" onClick={()=>setShowListComposer(true)}>
          <Icon name="plus" size={16}/> {s("board.add_list")}
        </button>
      )}
    </div>
  );
}

function BoardList({ list, lang, isComposer, openComposer, closeComposer, composerText, setComposerText, addCard,
                     listMenuOpen, openListMenu, closeListMenu, setListColor, onOpenCard,
                     isDropTarget, onListDragOver, onListDragLeave, onListDrop,
                     onCardDragStart, onCardDragEnd, draggingCardId }){
  const { s } = window.useI18n(lang);
  const name = list.key ? s(`board.lists.${list.key}`) : (list.customName?.[lang] || "Untitled");
  const colorObj = list.color ? LIST_COLORS.find(c => c.id === list.color) : null;

  return (
    <section className={"board-list" + (colorObj ? " has-color" : "") + (isDropTarget ? " drop-target" : "")}
             style={colorObj ? {"--list-color": colorObj.c} : {}}
             onDragOver={onListDragOver}
             onDragLeave={onListDragLeave}
             onDrop={onListDrop}>
      {colorObj && <div className="bl-stripe"/>}
      <header className="bl-head">
        <h2>{name}</h2>
        <span className="col-count">{list.cards.length}</span>
        <span className="grow"></span>
        <button className="icon-btn" onClick={openListMenu}><Icon name="dots" size={14}/></button>
      </header>

      {listMenuOpen && (
        <>
          <div className="popover-scrim" onClick={closeListMenu}/>
          <div className="popover list-actions-popover">
            <header className="popover-head">
              <span>{s("board.list_actions")}</span>
              <button className="icon-btn" onClick={closeListMenu}><Icon name="close" size={14}/></button>
            </header>
            <div className="popover-list">
              <button className="popover-item" onClick={()=>{ openComposer(); closeListMenu(); }}>
                <Icon name="plus" size={14}/> {s("board.add_card")}
              </button>
              <button className="popover-item"><Icon name="paperclip" size={14}/> {s("board.copy_list")}</button>
              <button className="popover-item"><Icon name="arrowR" size={14}/> {s("board.move_list")}</button>
              <button className="popover-item"><Icon name="bell" size={14}/> {s("board.watch")}</button>
              <div className="popover-divider"></div>
              <div className="color-picker-h">{s("board.change_color")}</div>
              <div className="color-grid">
                {LIST_COLORS.map(c => (
                  <button key={c.id}
                    className={"color-sw" + (list.color === c.id ? " active":"")}
                    style={{background: c.c}}
                    onClick={()=>{ setListColor(c.id); closeListMenu(); }}>
                    {list.color === c.id && <Icon name="check2" size={12} color="#fff"/>}
                  </button>
                ))}
              </div>
              <button className="popover-item remove-color" onClick={()=>{ setListColor(null); closeListMenu(); }}>
                <Icon name="close" size={14}/> {s("board.remove_color")}
              </button>
              <div className="popover-divider"></div>
              <button className="popover-item danger"><Icon name="trash" size={14}/> {s("board.archive")}</button>
            </div>
          </div>
        </>
      )}

      <div className="bl-body">
        {list.cards.map(card => (
          <BoardCard key={card.id} card={card} lang={lang}
            onClick={()=>onOpenCard(card)}
            draggable
            dragging={draggingCardId === card.id}
            onDragStart={(e)=>onCardDragStart(e, card)}
            onDragEnd={onCardDragEnd}/>
        ))}

        {isComposer ? (
          <div className="card-composer">
            <textarea autoFocus
              value={composerText}
              onChange={e=>setComposerText(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); addCard(); } if(e.key==="Escape") closeComposer(); }}
              placeholder={s("board.create_card_title")}/>
            <div className="composer-actions">
              <button className="btn primary" onClick={addCard}>{s("common.add")}</button>
              <button className="icon-btn" onClick={closeComposer}><Icon name="close" size={16}/></button>
            </div>
          </div>
        ) : (
          <button className="add-card-btn" onClick={openComposer}>
            <Icon name="plus" size={14}/> {s("board.add_card")}
          </button>
        )}
      </div>
    </section>
  );
}

function BoardCard({ card, lang, onClick, draggable, dragging, onDragStart, onDragEnd }){
  const labelObjs = (card.labels||[]).map(id => findLabel(id)).filter(Boolean);
  const dueText = card.dueEn && lang==="en" ? card.dueEn : card.due;
  const cl = card.checklist;
  const clDone = cl && cl.done === cl.total && cl.total > 0;
  return (
    <article className={"board-card" + (dragging ? " is-dragging" : "")}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}>
      {card.cover && <div className="bc-cover" style={{background: card.cover}}/>}
      <div className="bc-body">
        {labelObjs.length > 0 && (
          <div className="bc-labels">
            {labelObjs.map(l => (
              <span key={l.id} className="bc-label" style={{background:l.color}} title={l.name[lang]}>
                <span className="bc-label-text">{l.name[lang]}</span>
              </span>
            ))}
          </div>
        )}
        <div className="bc-title">{card.title[lang]}</div>
        <div className="bc-meta">
          {card.due && (
            <span className={"bc-due" + (card.dueLate?" late":"") + (dueText==="Today"||card.due==="今天"?" today":"")}>
              <Icon name="clock" size={11}/> {dueText}
            </span>
          )}
          {cl && (
            <span className={"bc-checklist" + (clDone?" done":"")}>
              <Icon name="check" size={11}/> {cl.done}/{cl.total}
            </span>
          )}
          {card.attach && <span className="bc-attach"><Icon name="paperclip" size={11}/> {card.attach}</span>}
          <span className="grow"></span>
          {(card.members||[]).map(uid => {
            const u = MOCK.boardMembers.find(m => m.id===uid);
            return u ? <span key={uid} className="bc-member" style={{background:u.color}}>{u.name}</span> : null;
          })}
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   TABLE VIEW
   ============================================================ */
function TableView({ lists, lang, s, updateCard, onOpenCard }){
  const rows = [];
  lists.forEach(list => list.cards.forEach(card => rows.push({ card, list })));
  const [editing, setEditing] = useState(null); // {cardId, field}

  const closeEditor = () => setEditing(null);

  const setDue = (card, list, newDue) => {
    updateCard(list.id, card.id, { due: newDue, dueEn: undefined, dueLate: false });
    closeEditor();
  };
  const toggleLabel = (card, list, labelId) => {
    const labels = card.labels || [];
    const next = labels.includes(labelId) ? labels.filter(l => l !== labelId) : [...labels, labelId];
    updateCard(list.id, card.id, { labels: next });
  };
  const toggleMember = (card, list, uid) => {
    const members = card.members || [];
    const next = members.includes(uid) ? members.filter(m => m !== uid) : [...members, uid];
    updateCard(list.id, card.id, { members: next });
  };

  return (
    <div className="board-table-wrap">
      <table className="board-table">
        <thead>
          <tr>
            <th>{s("board.table_card")} <Icon name="chevD" size={12}/></th>
            <th>{s("board.table_list")}</th>
            <th>{s("board.table_labels")}</th>
            <th>{s("board.table_members")}</th>
            <th>{s("board.table_due")}</th>
            <th>{s("board.table_checklist")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({card, list}) => {
            const listName = list.key ? s(`board.lists.${list.key}`) : list.customName?.[lang];
            const labelObjs = (card.labels||[]).map(id => findLabel(id)).filter(Boolean);
            const memberObjs = (card.members||[]).map(uid => MOCK.boardMembers.find(m=>m.id===uid)).filter(Boolean);
            const listColor = list.color ? LIST_COLORS.find(c => c.id === list.color) : null;
            const cl = card.checklist;
            const pct = cl ? Math.round(100 * cl.done / Math.max(1,cl.total)) : null;
            const isEdit = (field) => editing?.cardId === card.id && editing?.field === field;
            return (
              <tr key={card.id}>
                <td className="td-title" onClick={()=>onOpenCard(card, list.id)}>
                  <span className={"cbx"}></span>
                  <span>{card.title[lang]}</span>
                </td>
                <td onClick={(e)=>e.stopPropagation()}>
                  <span className="td-pill" style={listColor ? {background: listColor.c, color:"#fff", borderColor:"transparent"} : {}}>
                    {listName}
                  </span>
                </td>
                <td className="td-editable"
                    onClick={(e)=>{ e.stopPropagation(); setEditing({cardId:card.id, field:"labels"}); }}>
                  <div className="td-labels">
                    {labelObjs.length === 0
                      ? <span className="td-empty-hint">+ {s("board.labels")}</span>
                      : labelObjs.map(l => <span key={l.id} className="bc-label" style={{background:l.color}}>{l.name[lang]}</span>)}
                  </div>
                  {isEdit("labels") && (
                    <>
                      <div className="popover-scrim" onClick={(e)=>{ e.stopPropagation(); closeEditor(); }}/>
                      <div className="popover td-popover">
                        <header className="popover-head"><span>{s("board.labels")}</span><button className="icon-btn" onClick={closeEditor}><Icon name="close" size={12}/></button></header>
                        <div className="popover-list">
                          {ALL_LABELS().map(l => {
                            const on = (card.labels||[]).includes(l.id);
                            return (
                              <button key={l.id} className="popover-item label-row" onClick={(e)=>{ e.stopPropagation(); toggleLabel(card, list, l.id); }}>
                                <span className="bc-label" style={{background:l.color}}>{l.name[lang]}</span>
                                <span className="grow"></span>
                                {on && <Icon name="check2" size={14} color="var(--accent)"/>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </td>
                <td className="td-editable"
                    onClick={(e)=>{ e.stopPropagation(); setEditing({cardId:card.id, field:"members"}); }}>
                  <div className="td-members">
                    {memberObjs.length === 0
                      ? <span className="td-empty-hint">+</span>
                      : memberObjs.map(u => <span key={u.id} className="bc-member" style={{background:u.color}}>{u.name}</span>)}
                  </div>
                  {isEdit("members") && (
                    <>
                      <div className="popover-scrim" onClick={(e)=>{ e.stopPropagation(); closeEditor(); }}/>
                      <div className="popover td-popover">
                        <header className="popover-head"><span>{s("board.table_members")}</span><button className="icon-btn" onClick={closeEditor}><Icon name="close" size={12}/></button></header>
                        <div className="popover-list">
                          {MOCK.boardMembers.map(u => {
                            const on = (card.members||[]).includes(u.id);
                            return (
                              <button key={u.id} className="popover-item label-row" onClick={(e)=>{ e.stopPropagation(); toggleMember(card, list, u.id); }}>
                                <span className="bc-member" style={{background:u.color}}>{u.name}</span>
                                <span>{u.id.toUpperCase()}</span>
                                <span className="grow"></span>
                                {on && <Icon name="check2" size={14} color="var(--accent)"/>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </td>
                <td className="td-editable"
                    onClick={(e)=>{ e.stopPropagation(); setEditing({cardId:card.id, field:"due"}); }}>
                  {card.due ? (
                    <span className={"td-due mono" + (card.dueLate?" late":"")}>
                      {card.dueEn && lang==="en" ? card.dueEn : card.due}
                    </span>
                  ) : <span className="td-empty-hint">+ {s("board.due")}</span>}
                  {isEdit("due") && (
                    <>
                      <div className="popover-scrim" onClick={(e)=>{ e.stopPropagation(); closeEditor(); }}/>
                      <div className="popover td-popover td-popover-due">
                        <header className="popover-head"><span>{s("board.due")}</span><button className="icon-btn" onClick={closeEditor}><Icon name="close" size={12}/></button></header>
                        <div className="td-due-body">
                          <input type="date"
                            autoFocus
                            className="td-date-input"
                            onClick={(e)=>e.stopPropagation()}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (!v) return;
                              const d = new Date(v);
                              setDue(card, list, `${d.getMonth()+1}/${d.getDate()}`);
                            }}/>
                          <div className="td-quick-due">
                            {[{l:lang==="zh"?"今天":"Today", v:0},
                              {l:lang==="zh"?"明天":"Tomorrow", v:1},
                              {l:lang==="zh"?"下周一":"Next Mon", v:((8-new Date().getDay())%7)||7}].map(opt=>{
                              const t = new Date(); t.setDate(t.getDate()+opt.v);
                              return (
                                <button key={opt.l} className="td-quick-btn"
                                  onClick={(e)=>{ e.stopPropagation(); setDue(card, list, `${t.getMonth()+1}/${t.getDate()}`); }}>
                                  {opt.l}
                                </button>
                              );
                            })}
                            {card.due && (
                              <button className="td-quick-btn danger"
                                onClick={(e)=>{ e.stopPropagation(); updateCard(list.id, card.id, {due:null}); closeEditor(); }}>
                                {lang==="zh"?"清除":"Clear"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </td>
                <td onClick={()=>onOpenCard(card, list.id)}>
                  {cl ? (
                    <div className="td-checklist">
                      <div className="td-cl-bar"><div style={{width: pct+"%"}}/></div>
                      <span className="mono">{cl.done}/{cl.total}</span>
                    </div>
                  ) : <span className="td-empty">—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================
   CALENDAR VIEW
   ============================================================ */
function BoardCalendarView({ lists, lang, s, updateCard, onOpenCard }){
  const today = new Date();
  const month = today.getMonth();
  const year  = today.getFullYear();
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month+1, 0).getDate();

  const [dragOverDay, setDragOverDay] = useState(null);
  const [draggingId, setDraggingId]   = useState(null);

  const byDay = {};
  lists.forEach(list => list.cards.forEach(card => {
    if (!card.due) return;
    let day;
    if (typeof card.due === "string") {
      const m = card.due.match(/^(\d+)\/(\d+)/);
      if (m) day = parseInt(m[2], 10);
      else if (card.due === "Today" || card.due === "今天") day = today.getDate();
    }
    if (day) {
      byDay[day] = byDay[day] || [];
      byDay[day].push({ card, list });
    }
  }));

  const totalDueCards = Object.values(byDay).reduce((n, arr) => n + arr.length, 0);
  const dayNames = lang==="zh" ? ["周一","周二","周三","周四","周五","周六","周日"] : ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const monthLabel = lang==="zh" ? `${year} 年 ${month+1} 月` : firstDay.toLocaleDateString("en-US", { month:"long", year:"numeric" });

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);

  const onDragStart = (e, card, list) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ cardId: card.id, listId: list.id }));
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(card.id);
  };
  const onDragEnd = () => { setDraggingId(null); setDragOverDay(null); };
  const onDragOverCell = (e, day) => {
    if (!day) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverDay !== day) setDragOverDay(day);
  };
  const onDropCell = (e, day) => {
    e.preventDefault();
    setDragOverDay(null);
    setDraggingId(null);
    try {
      const { cardId, listId } = JSON.parse(e.dataTransfer.getData("text/plain"));
      const newDue = `${month+1}/${day}`;
      updateCard(listId, cardId, { due: newDue, dueEn: undefined, dueLate: false });
    } catch(err){}
  };

  return (
    <div className="board-cal panel">
      <header className="board-cal-head">
        <button className="icon-btn"><Icon name="arrowL" size={14}/></button>
        <h2>{monthLabel}</h2>
        <button className="icon-btn"><Icon name="arrowR" size={14}/></button>
        <span className="grow"></span>
        <span className="muted">{totalDueCards} {lang==="zh"?"项有截止":"with due dates"}</span>
        {draggingId && <span className="drag-hint">{lang==="zh"?"拖到任意日期改截止":"Drop on a day to reschedule"}</span>}
      </header>
      <div className="board-cal-week">
        {dayNames.map((d,i)=>(<div key={i} className="bcw">{d}</div>))}
      </div>
      <div className="board-cal-grid">
        {cells.map((d, i) => (
          <div key={i}
            className={"board-cal-cell"
              + (!d ? " empty" : "")
              + (d===today.getDate()?" today":"")
              + (d && dragOverDay === d ? " drag-over" : "")}
            onDragOver={(e)=>onDragOverCell(e, d)}
            onDragLeave={()=>setDragOverDay(null)}
            onDrop={(e)=>onDropCell(e, d)}>
            {d && <div className="bcc-num">{d===today.getDate() ? <span className="today-pill">{d}</span> : d}</div>}
            {d && byDay[d] && (
              <div className="bcc-cards">
                {byDay[d].slice(0,3).map(({card, list}, ii) => {
                  const listColor = list.color ? LIST_COLORS.find(c=>c.id===list.color) : null;
                  return (
                    <button key={ii}
                      className={"bcc-card" + (draggingId===card.id?" dragging":"")}
                      draggable
                      onDragStart={(e)=>onDragStart(e, card, list)}
                      onDragEnd={onDragEnd}
                      style={{borderLeftColor: listColor?.c || "var(--accent)"}}
                      onClick={()=>onOpenCard(card, list.id)}>
                      {card.title[lang]}
                    </button>
                  );
                })}
                {byDay[d].length > 3 && <span className="bcc-more">+{byDay[d].length-3}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
      {totalDueCards === 0 && <div className="bcal-empty">{s("board.empty_calendar")}</div>}
    </div>
  );
}

/* ============================================================
   DASHBOARD VIEW (board summary)
   ============================================================ */
function BoardDashboardView({ lists, lang, s }){
  const total = lists.reduce((n,l)=>n+l.cards.length, 0);
  const allCards = lists.flatMap(l => l.cards);
  const overdue = allCards.filter(c => c.dueLate).length;
  const dueToday = allCards.filter(c => c.due === "Today" || c.due === "今天").length;
  const labelCounts = {};
  allCards.forEach(c => (c.labels||[]).forEach(id => {
    labelCounts[id] = (labelCounts[id]||0) + 1;
  }));
  const labelData = ALL_LABELS().map(l => ({
    label: l, count: labelCounts[l.id] || 0
  })).filter(d => d.count > 0);
  const maxLabelCount = Math.max(1, ...labelData.map(d=>d.count));

  return (
    <div className="board-dash">
      <div className="bd-kpis">
        <BDKpi label={lang==="zh"?"卡片总数":"Total cards"} value={total} icon="kanban" color="var(--accent)"/>
        <BDKpi label={lang==="zh"?"今日到期":"Due today"} value={dueToday} icon="clock" color="var(--amber)"/>
        <BDKpi label={lang==="zh"?"逾期":"Overdue"} value={overdue} icon="bell" color="var(--red)"/>
        <BDKpi label={lang==="zh"?"列数":"Lists"} value={lists.length} icon="list" color="var(--blue)"/>
      </div>

      <div className="bd-row">
        <div className="bd-card panel">
          <h3>{lang==="zh"?"按列分布":"Cards per list"}</h3>
          <div className="bd-bars">
            {lists.map(l => {
              const name = l.key ? s(`board.lists.${l.key}`) : l.customName?.[lang];
              const color = l.color ? LIST_COLORS.find(c=>c.id===l.color)?.c : "var(--accent)";
              const pct = Math.round(100 * l.cards.length / Math.max(1,total));
              return (
                <div key={l.id} className="bd-bar-row">
                  <div className="bd-bar-label">{name}</div>
                  <div className="bd-bar-track">
                    <div className="bd-bar-fill" style={{width: pct+"%", background: color}}></div>
                  </div>
                  <div className="bd-bar-val mono">{l.cards.length}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bd-card panel">
          <h3>{lang==="zh"?"按标签分布":"Cards by label"}</h3>
          <div className="bd-bars">
            {labelData.map(({label, count}) => (
              <div key={label.id} className="bd-bar-row">
                <div className="bd-bar-label">
                  <span className="bc-label" style={{background:label.color}}>{label.name[lang]}</span>
                </div>
                <div className="bd-bar-track">
                  <div className="bd-bar-fill" style={{width: (count/maxLabelCount*100)+"%", background: label.color}}></div>
                </div>
                <div className="bd-bar-val mono">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BDKpi({ label, value, icon, color }){
  return (
    <div className="bd-kpi panel">
      <span className="kpi-ico" style={{color, background:`color-mix(in oklch, ${color} 14%, transparent)`}}>
        <Icon name={icon} size={14}/>
      </span>
      <div>
        <div className="bd-kpi-val mono">{value}</div>
        <div className="bd-kpi-label">{label}</div>
      </div>
    </div>
  );
}

/* ============================================================
   TIMELINE VIEW
   ============================================================ */
function TimelineView({ lists, lang, s, updateCard, onOpenCard }){
  const today = new Date();
  const days = 30;
  const dayLabels = Array.from({length: days}, (_,i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    return { d: d.getDate(), m: d.getMonth()+1, isToday: i===0 };
  });

  const trackRef = useRef(null);
  const [drag, setDrag] = useState(null); // { cardId, listId, mode:"resize-l"|"resize-r"|"move", initStart, initEnd, startX }
  const [preview, setPreview] = useState({}); // { cardId: { start, end } }

  const parseDay = (s) => {
    if (!s) return null;
    const m = String(s).match(/^(\d+)\/(\d+)/);
    if (m) {
      const monthDate = new Date(today.getFullYear(), parseInt(m[1])-1, parseInt(m[2]));
      return Math.round((monthDate - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000);
    }
    if (s === "Today" || s === "今天") return 0;
    return null;
  };
  const dayToStr = (off) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + off);
    return `${d.getMonth()+1}/${d.getDate()}`;
  };

  const itemsByList = lists.map(list => {
    const items = list.cards.map(card => {
      const endOff = parseDay(card.due);
      if (endOff == null) return null;
      const startOff = card.start != null ? parseDay(card.start) : endOff;
      const p = preview[card.id];
      const start = p ? p.start : startOff;
      const end   = p ? p.end   : endOff;
      return { card, start, end, list };
    }).filter(x => x && x.end >= 0 && x.start < days);
    return { list, items };
  });

  /* drag handlers */
  const onHandleDown = (e, mode, card, list) => {
    e.stopPropagation();
    e.preventDefault();
    const startOff = card.start != null ? parseDay(card.start) : parseDay(card.due);
    const endOff   = parseDay(card.due);
    if (startOff == null || endOff == null) return;
    setDrag({ cardId: card.id, listId: list.id, mode, initStart: startOff, initEnd: endOff, startX: e.clientX });
  };

  useEffect(() => {
    if (!drag) return;
    const trackEl = trackRef.current;
    if (!trackEl) return;
    const rect = trackEl.getBoundingClientRect();
    const dayWidth = rect.width / days;

    const onMove = (e) => {
      const dx = e.clientX - drag.startX;
      const deltaDays = Math.round(dx / dayWidth);
      let s = drag.initStart, en = drag.initEnd;
      if (drag.mode === "resize-l") s = Math.min(drag.initEnd, drag.initStart + deltaDays);
      else if (drag.mode === "resize-r") en = Math.max(drag.initStart, drag.initEnd + deltaDays);
      else if (drag.mode === "move") {
        s = drag.initStart + deltaDays;
        en = drag.initEnd + deltaDays;
      }
      s = Math.max(0, Math.min(days-1, s));
      en = Math.max(0, Math.min(days-1, en));
      setPreview(p => ({ ...p, [drag.cardId]: { start: s, end: en } }));
    };
    const onUp = () => {
      const p = preview[drag.cardId];
      const final = p || { start: drag.initStart, end: drag.initEnd };
      const patch = {
        due:   dayToStr(final.end),
        start: final.start === final.end ? null : dayToStr(final.start),
        dueEn: undefined,
        dueLate: false,
      };
      updateCard(drag.listId, drag.cardId, patch);
      setPreview(p => { const n = {...p}; delete n[drag.cardId]; return n; });
      setDrag(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [drag, preview]);

  return (
    <div className="board-timeline panel">
      <div className="bt-grid">
        <div className="bt-corner"></div>
        <div className="bt-days">
          {dayLabels.map((d, i) => (
            <div key={i} className={"bt-day" + (d.isToday?" today":"")}>
              <div className="bt-day-num">{d.d}</div>
              <div className="bt-day-m">{d.m}/{d.d}</div>
            </div>
          ))}
        </div>

        {itemsByList.map(({list, items}) => {
          const colorObj = list.color ? LIST_COLORS.find(c => c.id === list.color) : null;
          const color = colorObj?.c || "var(--accent)";
          const name = list.key ? s(`board.lists.${list.key}`) : list.customName?.[lang];
          return (
            <React.Fragment key={list.id}>
              <div className="bt-list-name">
                <span className="dot" style={{color}}></span> {name}
              </div>
              <div className="bt-track" ref={items.length ? trackRef : null}>
                {items.map(({card, start, end}) => {
                  const width = ((end - start + 1) / days) * 100;
                  const left  = (start / days) * 100;
                  const isDragging = drag?.cardId === card.id;
                  return (
                    <div key={card.id}
                      className={"bt-bar" + (isDragging ? " dragging" : "")}
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        background: `color-mix(in oklch, ${color} 18%, transparent)`,
                        borderColor: color,
                        color: color,
                      }}>
                      <div className="bt-handle bt-handle-l"
                        onPointerDown={(e)=>onHandleDown(e, "resize-l", card, list)}/>
                      <div className="bt-bar-content"
                        onPointerDown={(e)=>onHandleDown(e, "move", card, list)}
                        onClick={(e)=>{ if (!drag) onOpenCard(card, list.id); }}>
                        <span className="bt-bar-title">{card.title[lang]}</span>
                      </div>
                      <div className="bt-handle bt-handle-r"
                        onPointerDown={(e)=>onHandleDown(e, "resize-r", card, list)}/>
                    </div>
                  );
                })}
                {items.length === 0 && <div className="bt-empty muted">{s("board.no_cards")}</div>}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   MAP VIEW (placeholder — original abstract map)
   ============================================================ */
function MapView({ lang, s }){
  return (
    <div className="board-map panel">
      <div className="bm-svg">
        <svg viewBox="0 0 600 360" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="mapDots" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="oklch(80% 0.04 165)"/>
            </pattern>
          </defs>
          <rect width="600" height="360" fill="oklch(96% 0.02 165)"/>
          <rect width="600" height="360" fill="url(#mapDots)"/>
          <path d="M 50 200 Q 150 80 280 130 T 540 110" stroke="oklch(70% 0.06 165)" strokeWidth="2" fill="none" strokeDasharray="3 6"/>
          <path d="M 30 280 Q 200 240 350 280 T 580 250" stroke="oklch(70% 0.06 165)" strokeWidth="2" fill="none" strokeDasharray="3 6"/>
          {[[120,120],[280,130],[420,200],[520,150],[200,260],[380,290]].map(([x,y],i)=>(
            <g key={i}>
              <circle cx={x} cy={y} r="14" fill="var(--accent)" opacity=".25"/>
              <circle cx={x} cy={y} r="6"  fill="var(--accent)"/>
              <text x={x+12} y={y-4} fontSize="11" fill="var(--text-2)" fontWeight="600">{`Pin ${i+1}`}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="bm-overlay">
        <div className="bm-card">
          <Icon name="globe" size={28} color="var(--accent)"/>
          <h3>{lang==="zh"?"地图视图":"Map view"}</h3>
          <p>{lang==="zh"
            ? "将带地理位置的卡片可视化在地图上。给卡片设置地点字段后即可显示。"
            : "Visualize cards with locations on a map. Add a location field to your cards to populate it."}</p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Card detail modal
   ============================================================ */
function CardDetail({ card, lang, listId, onClose }){
  const { s } = window.useI18n(lang);
  const labelObjs = (card.labels||[]).map(id => findLabel(id)).filter(Boolean);
  const cl = card.checklist;
  const [checked, setChecked] = useState(()=>Array.from({length:cl?.total||0},(_,i)=>i<(cl?.done||0)));
  const doneCount = checked.filter(Boolean).length;
  const pct = cl?.total ? Math.round(100 * doneCount / cl.total) : 0;
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="card-modal" onClick={e=>e.stopPropagation()}>
        {card.cover && <div className="cm-cover" style={{background:card.cover}}/>}
        <header className="cm-head">
          <h2>{card.title[lang]}</h2>
          <button className="icon-btn" onClick={onClose}><Icon name="close" size={16}/></button>
        </header>
        <div className="cm-meta">
          {labelObjs.length>0 && (
            <div className="cm-sect">
              <div className="cm-sect-label">{s("board.labels")}</div>
              <div className="cm-labels">
                {labelObjs.map(l => (
                  <span key={l.id} className="bc-label" style={{background:l.color}}>{l.name[lang]}</span>
                ))}
              </div>
            </div>
          )}
          {card.due && (
            <div className="cm-sect">
              <div className="cm-sect-label">{s("board.due")}</div>
              <div className={"cm-due-pill" + (card.dueLate?" late":"")}>
                <Icon name="clock" size={12}/> {card.dueEn && lang==="en" ? card.dueEn : card.due}
              </div>
            </div>
          )}
          {(card.members||[]).length > 0 && (
            <div className="cm-sect">
              <div className="cm-sect-label">{lang==="zh"?"成员":"Members"}</div>
              <div className="cm-members">
                {card.members.map(uid => {
                  const u = MOCK.boardMembers.find(m=>m.id===uid);
                  return u ? <span key={uid} className="bc-member" style={{background:u.color}}>{u.name}</span> : null;
                })}
              </div>
            </div>
          )}
        </div>
        {cl && (
          <div className="cm-checklist">
            <div className="cm-checklist-head">
              <h3>{s("board.checklist")}</h3>
              <span className="mono cm-pct">{pct}%</span>
            </div>
            <div className="cm-progress"><div className="cm-progress-bar" style={{width: pct+"%"}}/></div>
            <ul className="cm-list">
              {Array.from({length: cl.total}).map((_,i) => (
                <li key={i} className={"cm-item" + (checked[i]?" done":"")}
                  onClick={()=>setChecked(cs => cs.map((c,j)=>j===i?!c:c))}>
                  <span className={"cbx" + (checked[i]?" checked":"")}></span>
                  <span>{lang==="zh" ? `子任务 ${i+1}` : `Subtask ${i+1}`}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="cm-actions">
          <button className="cm-action"><Icon name="check2" size={14}/> {s("board.checklist")}</button>
          <button className="cm-action"><Icon name="clock" size={14}/> {s("board.due")}</button>
          <button className="cm-action"><Icon name="tag" size={14}/> {s("board.labels")}</button>
          <button className="cm-action"><Icon name="paperclip" size={14}/> {lang==="zh"?"附件":"Attach"}</button>
          <button className="cm-action"><Icon name="user" size={14}/> {lang==="zh"?"成员":"Members"}</button>
        </div>
      </div>
    </div>
  );
}

window.BoardModule = BoardModule;

/* ============================================================
   INBOX PANEL — capture-style list
   ============================================================ */
function InboxPanel({ cards, setCards, lang }){
  const [text, setText] = useState("");
  const add = () => {
    if (!text.trim()) return;
    setCards(cs => [{ id:"ix-"+Date.now().toString(36), text:{ en:text, zh:text } }, ...cs]);
    setText("");
  };
  const remove = (id) => setCards(cs => cs.filter(c => c.id !== id));
  return (
    <section className="board-panel inbox-panel">
      <header className="panel-head">
        <Icon name="inbox" size={14}/>
        <h2>{lang==="zh" ? "收件箱" : "Inbox"}</h2>
        <span className="col-count">{cards.length}</span>
        <span className="grow"></span>
        <button className="icon-btn"><Icon name="filter" size={13}/></button>
        <button className="icon-btn"><Icon name="dots" size={14}/></button>
      </header>
      <div className="ix-composer">
        <input
          value={text}
          onChange={e=>setText(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter") add(); }}
          placeholder={lang==="zh"?"添加卡片":"Add a card"}/>
      </div>
      <div className="ix-body">
        {cards.map(c => (
          <article key={c.id} className="ix-card">
            <div className="ix-text">{c.text[lang] || c.text.en}</div>
            <div className="ix-meta">
              <Icon name="mail" size={11} color="var(--text-3)"/>
              <Icon name="list" size={11} color="var(--text-3)"/>
              <span className="grow"></span>
              <button className="icon-btn" onClick={()=>remove(c.id)}>
                <Icon name="close" size={11}/>
              </button>
            </div>
          </article>
        ))}
        {cards.length === 0 && <div className="ix-empty">{lang==="zh"?"收件箱为空":"Inbox is empty"}</div>}
      </div>
    </section>
  );
}

/* ============================================================
   PLANNER PANEL — today's time-slot view
   ============================================================ */
function PlannerPanel({ lists, lang, onOpenCard }){
  const today = new Date();
  const todayLabel = lang==="zh"
    ? `${today.getMonth()+1}月${today.getDate()}日 ${["周日","周一","周二","周三","周四","周五","周六"][today.getDay()]}`
    : today.toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" });
  // Pseudo time-slot events seeded from board cards with due dates
  const allCards = lists.flatMap(l => l.cards.map(c => ({...c, listId:l.id, listColor: l.color})));
  const dueToday = allCards.filter(c => c.due === "Today" || c.due === "今天" || c.due === `${today.getMonth()+1}/${today.getDate()}`);
  // Assign mock hours
  const slots = [];
  const colors = ["green","blue","amber","purple"];
  dueToday.slice(0, 6).forEach((c, i) => {
    const hr = 9 + i*2;
    slots.push({ card: c, hour: hr, dur: 60, color: colors[i % colors.length] });
  });
  if (slots.length === 0) {
    // sample slots when empty
    slots.push({ sample:true, label: lang==="zh"?"专注": "Deep focus", hour:9,  dur:60, color:"green" });
    slots.push({ sample:true, label: lang==="zh"?"复盘":  "Review",     hour:11, dur:30, color:"amber" });
    slots.push({ sample:true, label: lang==="zh"?"散步":  "Walk",       hour:14, dur:30, color:"blue" });
  }
  const hours = Array.from({length: 12}, (_,i) => i + 8); // 8am - 7pm
  const slotByHour = {};
  slots.forEach(s => slotByHour[s.hour] = s);

  return (
    <section className="board-panel planner-panel">
      <header className="panel-head">
        <Icon name="calendar" size={14}/>
        <h2>{lang==="zh" ? "计划" : "Planner"}</h2>
        <span className="grow"></span>
        <button className="icon-btn"><Icon name="dots" size={14}/></button>
      </header>
      <div className="pl-date">{todayLabel}</div>
      <div className="pl-body">
        {hours.map(h => {
          const slot = slotByHour[h];
          return (
            <div key={h} className="pl-row">
              <div className="pl-h mono">{String(h%12||12)}{h<12||h===24?"a":"p"}</div>
              <div className="pl-slot">
                {slot && (
                  <button className={"pl-event pl-color-" + slot.color}
                    onClick={()=>slot.card && onOpenCard(slot.card, slot.card.listId)}>
                    <span className="pl-event-title">{slot.card ? slot.card.title[lang] : slot.label}</span>
                    <span className="pl-event-time mono">{String(h%12||12)}:00</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================
   BOARD SWITCHER (workspaces + boards grid)
   ============================================================ */
function BoardSwitcher({ lang, workspaces, boards, activeBoardId, onPick, onCreate, onDelete, onClose }){
  const [filter, setFilter]   = useState("");
  const [scope, setScope]     = useState("all");
  const filtered = boards.filter(b => {
    if (scope !== "all" && b.workspaceId !== scope) return false;
    if (filter && !b.name[lang].toLowerCase().includes(filter.toLowerCase())) return false;
    return true;
  });
  const groupedByWs = workspaces.map(ws => ({
    ws,
    boards: filtered.filter(b => b.workspaceId === ws.id),
  }));

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="board-switcher" onClick={e=>e.stopPropagation()}>
        <header className="bs-head">
          <div className="bs-search">
            <Icon name="search" size={14}/>
            <input
              autoFocus
              value={filter}
              onChange={e=>setFilter(e.target.value)}
              placeholder={lang==="zh" ? "搜索看板…" : "Search your boards…"}/>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="close" size={16}/></button>
        </header>

        <div className="bs-scopes">
          <button aria-selected={scope==="all"} onClick={()=>setScope("all")}>{lang==="zh"?"全部":"All"}</button>
          {workspaces.map(ws => (
            <button key={ws.id} aria-selected={scope===ws.id} onClick={()=>setScope(ws.id)}>
              <span className="ws-dot" style={{background: ws.color}}></span>
              {ws.name[lang]}
            </button>
          ))}
          <span className="grow"></span>
          <button className="btn primary bs-new" onClick={onCreate}>
            <Icon name="plus" size={13}/> {lang==="zh"?"新建看板":"New board"}
          </button>
        </div>

        <div className="bs-body">
          {(scope === "all" ? groupedByWs : groupedByWs.filter(g => g.ws.id === scope)).map(({ws, boards}) => (
            boards.length > 0 && (
              <section key={ws.id} className="bs-group">
                <header className="bs-group-h">
                  <span className="ws-dot" style={{background: ws.color}}></span>
                  <h3>{ws.name[lang]}</h3>
                  <span className="muted">{boards.length}</span>
                </header>
                <div className="bs-grid">
                  {boards.map(b => (
                    <button key={b.id}
                      className={"bs-card" + (b.id === activeBoardId ? " active":"")}
                      onClick={()=>onPick(b.id)}>
                      <div className="bs-cover" style={{ background: b.cover }}>
                        {b.template === "pm"  && <Icon name="kanban" size={18} color="rgba(255,255,255,.8)"/>}
                        {b.template === "kanban" && <Icon name="list" size={18} color="rgba(255,255,255,.8)"/>}
                      </div>
                      <div className="bs-info">
                        <div className="bs-name">{b.name[lang]}</div>
                        <div className="bs-meta mono">{b.lists.reduce((n,l)=>n+l.cards.length,0)} {lang==="zh"?"卡片":"cards"}</div>
                      </div>
                      {b.id !== activeBoardId && boards.length + (groupedByWs.flatMap(g=>g.boards).length - boards.length) > 1 && (
                        <button className="bs-delete"
                          title={lang==="zh"?"删除":"Delete"}
                          onClick={(e)=>{ e.stopPropagation(); if(confirm(lang==="zh"?"删除该看板？":"Delete this board?")) onDelete(b.id); }}>
                          <Icon name="trash" size={12}/>
                        </button>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            )
          ))}
          {filtered.length === 0 && (
            <div className="bs-empty">{lang==="zh"?"没有匹配的看板。":"No matching boards."}</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   BOARD CREATOR (template chooser)
   ============================================================ */
function BoardCreator({ lang, workspaces, onCreate, onCancel }){
  const [tpl, setTpl] = useState("pm");
  const [ws,  setWs]  = useState(workspaces[0].id);
  const [name, setName] = useState(lang==="zh" ? "新看板" : "New board");

  return (
    <div className="modal-scrim" onClick={onCancel}>
      <div className="board-creator" onClick={e=>e.stopPropagation()}>
        <header className="bc-head">
          <h2>{lang==="zh"?"新建看板":"Create board"}</h2>
          <button className="icon-btn" onClick={onCancel}><Icon name="close" size={16}/></button>
        </header>
        <div className="bc-body">
          <div className="bc-templates">
            {window.BOARD_TEMPLATES.map(t => (
              <button key={t.id}
                className={"bc-tpl" + (tpl===t.id?" active":"")}
                onClick={()=>setTpl(t.id)}>
                <div className="bc-tpl-cover" style={{background: t.cover}}/>
                <div className="bc-tpl-name">{t.name[lang]}</div>
                <div className="bc-tpl-desc">{t.desc[lang]}</div>
              </button>
            ))}
          </div>
          <div className="bc-form">
            <label className="bc-field">
              <span>{lang==="zh"?"看板名称":"Board name"}</span>
              <input autoFocus value={name} onChange={e=>setName(e.target.value)}/>
            </label>
            <label className="bc-field">
              <span>{lang==="zh"?"所属工作区":"Workspace"}</span>
              <select value={ws} onChange={e=>setWs(e.target.value)}>
                {workspaces.map(w => <option key={w.id} value={w.id}>{w.name[lang]}</option>)}
              </select>
            </label>
          </div>
        </div>
        <footer className="bc-foot">
          <button className="btn ghost" onClick={onCancel}>{lang==="zh"?"取消":"Cancel"}</button>
          <button className="btn primary" onClick={()=>onCreate(tpl, name.trim() || (lang==="zh"?"新看板":"New board"), ws)}>
            <Icon name="plus" size={13}/> {lang==="zh"?"创建":"Create"}
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ============================================================
   STATUS OVERVIEW (PM template banner)
   ============================================================ */
function StatusOverviewBanner({ lists, lang }){
  const total = lists.reduce((n,l)=>n+l.cards.length, 0);
  const done = lists.find(l => /done|完成/.test(l.customName?.en + " " + l.customName?.zh))?.cards.length || 0;
  const donePct = total ? Math.round(100 * done / total) : 0;

  const segs = lists.filter(l => l.cards.length > 0).map(l => {
    const colorObj = l.color ? LIST_COLORS.find(c => c.id === l.color) : null;
    return {
      label: l.customName?.[lang] || l.key,
      count: l.cards.length,
      color: colorObj?.c || "var(--accent)",
    };
  });
  const sum = segs.reduce((n,s)=>n+s.count, 0) || 1;
  const r = 44;
  const c = 2 * Math.PI * r;
  let acc = 0;

  return (
    <div className="status-overview panel">
      <div className="so-left">
        <header className="so-head">
          <h3>{lang==="zh" ? "状态总览" : "Status Overview"}</h3>
          <span className="muted">{lang==="zh" ? "近 7 天" : "Last 7 days"}</span>
        </header>
        <p className="so-desc">
          {lang==="zh"
            ? "基于看板列展示项目整体进度。点击下方列查看更多详情。"
            : "View your project's overall progress based on your workflow. Click a list below for details."}
        </p>
      </div>

      <div className="so-ring">
        <svg viewBox="0 0 120 120" width="148" height="148">
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border-1)" strokeWidth="14"/>
          {segs.map((seg, i) => {
            const len = (seg.count / sum) * c;
            const offset = c - acc;
            acc += len;
            return (
              <circle key={i} cx="60" cy="60" r={r} fill="none"
                stroke={seg.color} strokeWidth="14"
                strokeDasharray={`${len} ${c-len}`}
                strokeDashoffset={offset}
                transform="rotate(-90 60 60)"
                style={{ transition: "stroke-dashoffset .4s var(--ease-out)" }}/>
            );
          })}
        </svg>
        <div className="so-ring-center">
          <div className="so-ring-pct mono">{donePct}%</div>
          <div className="so-ring-label">{lang==="zh" ? "已完成" : "Done"}</div>
        </div>
      </div>

      <ul className="so-legend">
        {segs.map((s,i) => (
          <li key={i}>
            <span className="leg-dot" style={{background: s.color}}></span>
            <span className="so-leg-name">{s.label}</span>
            <span className="so-leg-val mono">{s.count}</span>
          </li>
        ))}
        <li className="so-total">
          <span className="so-leg-name">{lang==="zh" ? "总计" : "Total"}</span>
          <span className="so-leg-val mono">{total}</span>
        </li>
      </ul>
    </div>
  );
}
