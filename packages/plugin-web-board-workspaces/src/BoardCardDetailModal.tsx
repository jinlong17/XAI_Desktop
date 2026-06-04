import { useEffect, useMemo, useState } from "react";
import {
  BOARD_MEMBER_OPTIONS,
  PM_LABELS,
} from "@repo/plugin-web-board-core";
import type {
  BoardCardActivityEntry,
  BoardCardAttachmentLink,
  BoardCardData,
  BoardChecklistItem,
} from "@repo/plugin-web-board-core";
import type { Lang } from "./internal/strings.js";

export interface BoardCardDetailModalProps {
  card: BoardCardData;
  listName: string;
  lang: Lang;
  onPatchCard: (patch: Partial<BoardCardData>) => void;
  onClose: () => void;
}

export type BoardCardDetailSurfaceProps = BoardCardDetailModalProps;

const STR = {
  close: { en: "Close", zh: "关闭" },
  description: { en: "Description", zh: "描述" },
  labels: { en: "Labels", zh: "标签" },
  members: { en: "Members", zh: "成员" },
  dates: { en: "Dates", zh: "日期" },
  start: { en: "Start", zh: "开始" },
  due: { en: "Due", zh: "截止" },
  checklist: { en: "Checklist", zh: "核对表" },
  addItem: { en: "Add item", zh: "添加条目" },
  attachments: { en: "Attachments", zh: "附件" },
  addLink: { en: "Add link", zh: "添加链接" },
  url: { en: "URL", zh: "链接" },
  title: { en: "Title", zh: "标题" },
  activity: { en: "Activity", zh: "动态" },
  addNote: { en: "Add note", zh: "添加记录" },
  empty: { en: "No items yet", zh: "暂无内容" },
  remove: { en: "Remove", zh: "移除" },
};

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function patchTitle(
  card: BoardCardData,
  lang: Lang,
  value: string,
): BoardCardData["title"] {
  if (card.title.en === card.title.zh) {
    return { en: value, zh: value };
  }
  return { ...card.title, [lang]: value };
}

function displayUrlTitle(link: BoardCardAttachmentLink): string {
  return link.title?.trim() || link.url;
}

function getChecklistItems(card: BoardCardData): BoardChecklistItem[] {
  if (card.checklistItems !== undefined) return card.checklistItems;
  if (!card.checklist || card.checklist.total <= 0) return [];
  return Array.from({ length: card.checklist.total }, (_, index) => ({
    id: `legacy-${card.id}-${index + 1}`,
    text: `Item ${index + 1}`,
    done: index < card.checklist!.done,
  }));
}

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "";
    }
    return parsed.toString();
  } catch {
    return "";
  }
}

export function BoardCardDetailSurface({
  card,
  listName,
  lang,
  onPatchCard,
  onClose,
}: BoardCardDetailSurfaceProps) {
  const [checklistText, setChecklistText] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentTitle, setAttachmentTitle] = useState("");
  const [activityText, setActivityText] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const checklistItems = getChecklistItems(card);
  const attachments = card.attachments ?? [];
  const activity = card.activity ?? [];
  const checklistSummary = useMemo(() => {
    const done = checklistItems.filter((item) => item.done).length;
    return `${done}/${checklistItems.length}`;
  }, [checklistItems]);

  const replaceChecklistItems = (items: BoardChecklistItem[]) => {
    onPatchCard({ checklistItems: items });
  };

  const addChecklistItem = () => {
    const text = checklistText.trim();
    if (!text) return;
    replaceChecklistItems([
      ...checklistItems,
      { id: makeId("chk"), text, done: false },
    ]);
    setChecklistText("");
  };

  const addAttachment = () => {
    const url = normalizeUrl(attachmentUrl);
    if (!url) return;
    const title = attachmentTitle.trim();
    onPatchCard({
      attachments: [
        ...attachments,
        {
          id: makeId("att"),
          url,
          ...(title ? { title } : {}),
        },
      ],
    });
    setAttachmentUrl("");
    setAttachmentTitle("");
  };

  const addActivityNote = () => {
    const body = activityText.trim();
    if (!body) return;
    const entry: BoardCardActivityEntry = {
      id: makeId("act"),
      kind: "note",
      body,
      createdAt: new Date().toISOString(),
    };
    onPatchCard({ activity: [entry, ...activity] });
    setActivityText("");
  };

  return (
    <section className="card-detail" role="dialog" aria-modal="true">
        <header className="cd-head">
          <div className="cd-head-main">
            <input
              className="cd-title-input"
              value={card.title[lang]}
              onChange={(event) => onPatchCard({ title: patchTitle(card, lang, event.target.value) })}
              data-testid="card-detail-title-input"
              aria-label={STR.title[lang]}
            />
            <div className="cd-list-name">{listName}</div>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label={STR.close[lang]}
            data-testid="card-detail-close"
          >
            x
          </button>
        </header>

        <div className="cd-body">
          <section className="cd-section">
            <h3>{STR.description[lang]}</h3>
            <textarea
              className="cd-description"
              value={card.description ?? ""}
              onChange={(event) => onPatchCard({ description: event.target.value })}
              data-testid="card-detail-description"
            />
          </section>

          <section className="cd-section">
            <h3>{STR.labels[lang]}</h3>
            <div className="cd-chip-grid">
              {PM_LABELS.map((label) => {
                const on = (card.labels ?? []).includes(label.id);
                return (
                  <button
                    key={label.id}
                    type="button"
                    className={"cd-choice" + (on ? " active" : "")}
                    style={{ borderColor: label.color }}
                    onClick={() => {
                      const labels = card.labels ?? [];
                      onPatchCard({
                        labels: on
                          ? labels.filter((id) => id !== label.id)
                          : [...labels, label.id],
                      });
                    }}
                    data-testid={`card-detail-label-${label.id}`}
                  >
                    <span className="bc-label" style={{ background: label.color }}>
                      {label.name[lang]}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="cd-section">
            <h3>{STR.members[lang]}</h3>
            <div className="cd-chip-grid">
              {BOARD_MEMBER_OPTIONS.map((member) => {
                const on = (card.members ?? []).includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    className={"cd-choice cd-member-choice" + (on ? " active" : "")}
                    onClick={() => {
                      const members = card.members ?? [];
                      onPatchCard({
                        members: on
                          ? members.filter((id) => id !== member.id)
                          : [...members, member.id],
                      });
                    }}
                    data-testid={`card-detail-member-${member.id}`}
                  >
                    <span className="bc-member" style={{ background: member.color }}>
                      {member.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="cd-section">
            <h3>{STR.dates[lang]}</h3>
            <div className="cd-date-grid">
              <label>
                <span>{STR.start[lang]}</span>
                <input
                  type="date"
                  value={card.startDate ?? ""}
                  onChange={(event) => {
                    onPatchCard({ startDate: event.target.value || undefined });
                  }}
                  data-testid="card-detail-start-date"
                />
              </label>
              <label>
                <span>{STR.due[lang]}</span>
                <input
                  type="date"
                  value={card.dueDate ?? ""}
                  onChange={(event) => {
                    onPatchCard({ dueDate: event.target.value || undefined });
                  }}
                  data-testid="card-detail-due-date"
                />
              </label>
            </div>
          </section>

          <section className="cd-section">
            <div className="cd-section-head">
              <h3>{STR.checklist[lang]}</h3>
              <span className="mono">{checklistSummary}</span>
            </div>
            <div className="cd-list">
              {checklistItems.length === 0 ? (
                <div className="cd-empty">{STR.empty[lang]}</div>
              ) : (
                checklistItems.map((item) => (
                  <div key={item.id} className="cd-check-row">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={(event) => {
                        replaceChecklistItems(
                          checklistItems.map((entry) =>
                            entry.id === item.id
                              ? { ...entry, done: event.target.checked }
                              : entry,
                          ),
                        );
                      }}
                      data-testid={`card-detail-check-${item.id}`}
                    />
                    <input
                      value={item.text}
                      onChange={(event) => {
                        replaceChecklistItems(
                          checklistItems.map((entry) =>
                            entry.id === item.id
                              ? { ...entry, text: event.target.value }
                              : entry,
                          ),
                        );
                      }}
                    />
                    <button
                      type="button"
                      className="icon-btn danger"
                      onClick={() => {
                        replaceChecklistItems(
                          checklistItems.filter((entry) => entry.id !== item.id),
                        );
                      }}
                      aria-label={STR.remove[lang]}
                    >
                      x
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="cd-inline-form">
              <input
                value={checklistText}
                onChange={(event) => setChecklistText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addChecklistItem();
                }}
                data-testid="card-detail-checklist-input"
              />
              <button
                type="button"
                className="btn primary"
                onClick={addChecklistItem}
                data-testid="card-detail-checklist-add"
              >
                {STR.addItem[lang]}
              </button>
            </div>
          </section>

          <section className="cd-section">
            <h3>{STR.attachments[lang]}</h3>
            <div className="cd-list">
              {attachments.length === 0 ? (
                <div className="cd-empty">{STR.empty[lang]}</div>
              ) : (
                attachments.map((link) => (
                  <div key={link.id} className="cd-link-row">
                    <a href={link.url} target="_blank" rel="noreferrer">
                      {displayUrlTitle(link)}
                    </a>
                    <button
                      type="button"
                      className="icon-btn danger"
                      onClick={() => {
                        onPatchCard({
                          attachments: attachments.filter((entry) => entry.id !== link.id),
                        });
                      }}
                      aria-label={STR.remove[lang]}
                    >
                      x
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="cd-attachment-form">
              <input
                value={attachmentUrl}
                onChange={(event) => setAttachmentUrl(event.target.value)}
                placeholder={STR.url[lang]}
                data-testid="card-detail-attachment-url"
              />
              <input
                value={attachmentTitle}
                onChange={(event) => setAttachmentTitle(event.target.value)}
                placeholder={STR.title[lang]}
                data-testid="card-detail-attachment-title"
              />
              <button
                type="button"
                className="btn primary"
                onClick={addAttachment}
                data-testid="card-detail-attachment-add"
              >
                {STR.addLink[lang]}
              </button>
            </div>
          </section>

          <section className="cd-section">
            <h3>{STR.activity[lang]}</h3>
            <div className="cd-inline-form">
              <input
                value={activityText}
                onChange={(event) => setActivityText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addActivityNote();
                }}
                data-testid="card-detail-activity-input"
              />
              <button type="button" className="btn" onClick={addActivityNote}>
                {STR.addNote[lang]}
              </button>
            </div>
            <div className="cd-list">
              {activity.length === 0 ? (
                <div className="cd-empty">{STR.empty[lang]}</div>
              ) : (
                activity.map((entry) => (
                  <div key={entry.id} className="cd-activity-row">
                    <span>{entry.body}</span>
                    <time className="mono">{new Date(entry.createdAt).toLocaleDateString()}</time>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
    </section>
  );
}

export function BoardCardDetailModal(props: BoardCardDetailModalProps) {
  return (
    <div
      className="card-detail-scrim"
      data-testid="card-detail-modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) props.onClose();
      }}
    >
      <BoardCardDetailSurface {...props} />
    </div>
  );
}
