/**
 * TableView — row-per-card table with inline Due picker, Labels popover,
 * Members popover, and checklist Progress column.
 *
 * Row anchor: xai-web-board-views (#8, Wave W2e)
 * API contract: packages/xai-web-board-views/docs/api.md §3
 *
 * REC-1 note: local-state reproduction of board-core patterns is intentional
 * for v1; exit strategy is documented in design.md §1 (R11).
 */

import { useState } from "react";
import type { BoardListData, BoardCardData } from "@repo/plugin-web-board-core";
import { BOARD_MEMBER_OPTIONS, PM_LABELS } from "@repo/plugin-web-board-core";
import type { Lang } from "./internal/i18n.js";
import {
  todayShortcut,
  tomorrowShortcut,
  nextMondayShortcut,
} from "./internal/dueShortcuts.js";

export interface TableViewProps {
  lists: readonly BoardListData[];
  lang: Lang;
  updateCard: (listId: string, cardId: string, patch: Partial<BoardCardData>) => void;
  /** Called when the user clicks the title cell. Row #9 will wire this to a card detail modal. */
  onOpenCard?: (card: BoardCardData, listId: string) => void;
}

type EditingField = "labels" | "members" | "due";
type EditingState = { cardId: string; field: EditingField } | null;

const COL_HEADERS = {
  card:      { en: "Card",      zh: "卡片"   },
  list:      { en: "List",      zh: "列"     },
  labels:    { en: "Labels",    zh: "标签"   },
  members:   { en: "Members",   zh: "成员"   },
  due:       { en: "Due",       zh: "截止日" },
  checklist: { en: "Checklist", zh: "核对表" },
};

export function TableView({ lists, lang, updateCard, onOpenCard }: TableViewProps) {
  const [editing, setEditing] = useState<EditingState>(null);

  const closeEditor = () => setEditing(null);

  const rows = lists.flatMap((list) =>
    list.cards.map((card) => ({ card, list })),
  );

  const today = new Date();
  const ty = today.getFullYear();
  const tm = today.getMonth() + 1; // 1-based
  const td = today.getDate();

  const isEdit = (cardId: string, field: EditingField) =>
    editing?.cardId === cardId && editing?.field === field;

  return (
    <div className="board-table-wrap" data-testid="board-table-wrap">
      <table className="board-table">
        <thead>
          <tr>
            <th>{lang === "zh" ? COL_HEADERS.card.zh : COL_HEADERS.card.en}</th>
            <th>{lang === "zh" ? COL_HEADERS.list.zh : COL_HEADERS.list.en}</th>
            <th>{lang === "zh" ? COL_HEADERS.labels.zh : COL_HEADERS.labels.en}</th>
            <th>{lang === "zh" ? COL_HEADERS.members.zh : COL_HEADERS.members.en}</th>
            <th>{lang === "zh" ? COL_HEADERS.due.zh : COL_HEADERS.due.en}</th>
            <th>{lang === "zh" ? COL_HEADERS.checklist.zh : COL_HEADERS.checklist.en}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ card, list }) => {
            const listName = list.key
              ? list.key
              : (list.customName?.[lang] ?? "");
            const labelObjs = (card.labels ?? [])
              .map((id) => PM_LABELS.find((l) => l.id === id))
              .filter(Boolean) as typeof PM_LABELS[number][];
            const memberObjs = (card.members ?? [])
              .map((uid) => BOARD_MEMBER_OPTIONS.find((m) => m.id === uid))
              .filter(Boolean) as typeof BOARD_MEMBER_OPTIONS[number][];
            const cl = card.checklist;
            const pct = cl ? Math.round((100 * cl.done) / Math.max(1, cl.total)) : null;
            const dueLate = card.dueLate;
            const dueDisplay =
              card.dueEn && lang === "en" ? card.dueEn : card.due;

            return (
              <tr key={card.id} data-testid="board-table-row">
                {/* Title cell */}
                <td
                  className="td-title"
                  onClick={() => onOpenCard?.(card, list.id)}
                  data-testid="td-title"
                >
                  <span className="cbx" />
                  <span>{card.title[lang]}</span>
                </td>

                {/* List pill */}
                <td onClick={(e) => e.stopPropagation()}>
                  <span
                    className="td-pill"
                    style={
                      list.color
                        ? {
                            background: `var(--board-list-color-${list.color})`,
                            color: "#fff",
                            borderColor: "transparent",
                          }
                        : {}
                    }
                    data-testid="td-list-pill"
                  >
                    {listName}
                  </span>
                </td>

                {/* Labels cell */}
                <td
                  className="td-editable"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing({ cardId: card.id, field: "labels" });
                  }}
                  data-testid="td-labels"
                >
                  <div className="td-labels">
                    {labelObjs.length === 0 ? (
                      <span className="td-empty-hint" data-testid="td-labels-empty">
                        + {lang === "zh" ? "标签" : "Labels"}
                      </span>
                    ) : (
                      labelObjs.map((l) => (
                        <span
                          key={l.id}
                          className="bc-label"
                          style={{ background: l.color }}
                        >
                          {l.name[lang]}
                        </span>
                      ))
                    )}
                  </div>
                  {isEdit(card.id, "labels") && (
                    <>
                      <div
                        className="popover-scrim"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeEditor();
                        }}
                      />
                      <div className="popover td-popover" data-testid="labels-popover">
                        <header className="popover-head">
                          <span>{lang === "zh" ? "标签" : "Labels"}</span>
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={closeEditor}
                            aria-label="close"
                          >
                            ×
                          </button>
                        </header>
                        <div className="popover-list">
                          {PM_LABELS.map((l) => {
                            const on = (card.labels ?? []).includes(l.id);
                            return (
                              <button
                                key={l.id}
                                type="button"
                                className="popover-item label-row"
                                data-testid={`label-toggle-${l.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const labels = card.labels ?? [];
                                  const next = on
                                    ? labels.filter((id) => id !== l.id)
                                    : [...labels, l.id];
                                  updateCard(list.id, card.id, { labels: next });
                                }}
                              >
                                <span
                                  className="bc-label"
                                  style={{ background: l.color }}
                                >
                                  {l.name[lang]}
                                </span>
                                <span className="grow" />
                                {on && <span aria-hidden="true">✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </td>

                {/* Members cell */}
                <td
                  className="td-editable"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing({ cardId: card.id, field: "members" });
                  }}
                  data-testid="td-members"
                >
                  <div className="td-members">
                    {memberObjs.length === 0 ? (
                      <span className="td-empty-hint">+</span>
                    ) : (
                      memberObjs.map((u) => (
                        <span
                          key={u.id}
                          className="bc-member"
                          style={{ background: u.color }}
                        >
                          {u.name}
                        </span>
                      ))
                    )}
                  </div>
                  {isEdit(card.id, "members") && (
                    <>
                      <div
                        className="popover-scrim"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeEditor();
                        }}
                      />
                      <div className="popover td-popover" data-testid="members-popover">
                        <header className="popover-head">
                          <span>{lang === "zh" ? "成员" : "Members"}</span>
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={closeEditor}
                            aria-label="close"
                          >
                            ×
                          </button>
                        </header>
                        <div className="popover-list">
                          {BOARD_MEMBER_OPTIONS.map((u) => {
                            const on = (card.members ?? []).includes(u.id);
                            return (
                              <button
                                key={u.id}
                                type="button"
                                className="popover-item label-row"
                                data-testid={`member-toggle-${u.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const members = card.members ?? [];
                                  const next = on
                                    ? members.filter((m) => m !== u.id)
                                    : [...members, u.id];
                                  updateCard(list.id, card.id, { members: next });
                                }}
                              >
                                <span
                                  className="bc-member"
                                  style={{ background: u.color }}
                                >
                                  {u.name}
                                </span>
                                <span className="grow" />
                                {on && <span aria-hidden="true">✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </td>

                {/* Due cell */}
                <td
                  className="td-editable"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing({ cardId: card.id, field: "due" });
                  }}
                  data-testid="td-due"
                >
                  {dueDisplay ? (
                    <span
                      className={"td-due mono" + (dueLate ? " late" : "")}
                      data-testid="td-due-value"
                    >
                      {dueDisplay}
                    </span>
                  ) : (
                    <span className="td-empty-hint">
                      + {lang === "zh" ? "截止日" : "Due"}
                    </span>
                  )}
                  {isEdit(card.id, "due") && (
                    <>
                      <div
                        className="popover-scrim"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeEditor();
                        }}
                      />
                      <div className="popover td-popover td-popover-due" data-testid="due-popover">
                        <header className="popover-head">
                          <span>{lang === "zh" ? "截止日" : "Due"}</span>
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={closeEditor}
                            aria-label="close"
                          >
                            ×
                          </button>
                        </header>
                        <div className="td-due-body">
                          <input
                            type="date"
                            autoFocus
                            className="td-date-input"
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const v = e.target.value;
                              if (!v) return;
                              const d = new Date(v);
                              const newDue = `${d.getMonth() + 1}/${d.getDate()}`;
                              updateCard(list.id, card.id, {
                                due: newDue,
                                dueEn: undefined,
                                dueLate: false,
                              });
                              closeEditor();
                            }}
                          />
                          <div className="td-quick-due">
                            {/* Today shortcut — emits "Today" (en) / "今天" (zh) */}
                            <button
                              type="button"
                              className="td-quick-btn"
                              data-testid="due-shortcut-today"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateCard(list.id, card.id, {
                                  due: todayShortcut(lang),
                                  dueEn: undefined,
                                  dueLate: false,
                                });
                                closeEditor();
                              }}
                            >
                              {lang === "zh" ? "今天" : "Today"}
                            </button>
                            {/* Tomorrow shortcut — emits "M/D" */}
                            <button
                              type="button"
                              className="td-quick-btn"
                              data-testid="due-shortcut-tomorrow"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newDue = tomorrowShortcut(ty, tm, td);
                                updateCard(list.id, card.id, {
                                  due: newDue,
                                  dueEn: undefined,
                                  dueLate: false,
                                });
                                closeEditor();
                              }}
                            >
                              {lang === "zh" ? "明天" : "Tomorrow"}
                            </button>
                            {/* Next Mon shortcut — emits "M/D" */}
                            <button
                              type="button"
                              className="td-quick-btn"
                              data-testid="due-shortcut-next-mon"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newDue = nextMondayShortcut(ty, tm, td);
                                updateCard(list.id, card.id, {
                                  due: newDue,
                                  dueEn: undefined,
                                  dueLate: false,
                                });
                                closeEditor();
                              }}
                            >
                              {lang === "zh" ? "下周一" : "Next Mon"}
                            </button>
                            {card.due && (
                              <button
                                type="button"
                                className="td-quick-btn danger"
                                data-testid="due-shortcut-clear"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateCard(list.id, card.id, { due: undefined });
                                  closeEditor();
                                }}
                              >
                                {lang === "zh" ? "清除" : "Clear"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </td>

                {/* Checklist / Progress cell */}
                <td
                  onClick={() => onOpenCard?.(card, list.id)}
                  data-testid="td-checklist"
                >
                  {cl ? (
                    <div className="td-checklist">
                      <div className="td-cl-bar">
                        <div
                          style={{ width: pct + "%" }}
                          data-testid="td-cl-bar-fill"
                        />
                      </div>
                      <span className="mono" data-testid="td-cl-text">
                        {cl.done}/{cl.total}
                      </span>
                    </div>
                  ) : (
                    <span className="td-empty">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
