import { useEffect, useMemo, useState } from "react";
import {
  BOARD_INTEGRATION_PROVIDERS,
  BOARD_MEMBER_OPTIONS,
  PM_LABELS,
  createBoardCardComment,
  createBoardIntegrationAttachment,
} from "@repo/plugin-web-board-core";
import type {
  BoardCardAttachmentLink,
  BoardCardData,
  BoardChecklistItem,
  BoardIntegrationProviderId,
} from "@repo/plugin-web-board-core";
import type { Lang } from "./internal/strings.js";

export interface BoardCardDetailModalProps {
  card: BoardCardData;
  listName: string;
  lang: Lang;
  taskLinkStatus?: BoardCardTaskLinkStatus;
  onCreateLinkedTask?: () => void;
  onUnlinkTask?: () => void;
  onPatchCard: (patch: Partial<BoardCardData>) => void;
  onClose: () => void;
}

export type BoardCardDetailSurfaceProps = BoardCardDetailModalProps;

export interface BoardCardTaskLinkStatus {
  taskId: string;
  label: string;
  missing: boolean;
}

const STR = {
  close: { en: "Close", zh: "关闭" },
  description: { en: "Description", zh: "描述" },
  labels: { en: "Labels", zh: "标签" },
  members: { en: "Members", zh: "成员" },
  dates: { en: "Dates", zh: "日期" },
  start: { en: "Start", zh: "开始" },
  due: { en: "Due", zh: "截止" },
  task: { en: "Task", zh: "任务" },
  createTask: { en: "Create task", zh: "创建任务" },
  linkedTask: { en: "Linked task", zh: "已关联任务" },
  unlinkTask: { en: "Unlink", zh: "取消关联" },
  missingTask: { en: "Missing task", zh: "任务缺失" },
  checklist: { en: "Checklist", zh: "核对表" },
  addItem: { en: "Add item", zh: "添加条目" },
  attachments: { en: "Attachments", zh: "附件" },
  integrationProvider: { en: "Provider", zh: "来源" },
  addLink: { en: "Add link", zh: "添加链接" },
  url: { en: "URL", zh: "链接" },
  title: { en: "Title", zh: "标题" },
  activity: { en: "Comments & Activity", zh: "评论与动态" },
  comment: { en: "Comment", zh: "评论" },
  note: { en: "Note", zh: "记录" },
  addComment: { en: "Add comment", zh: "添加评论" },
  you: { en: "You", zh: "我" },
  empty: { en: "No items yet", zh: "暂无内容" },
  remove: { en: "Remove", zh: "移除" },
};

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function patchTitle(value: string): BoardCardData["title"] {
  return { en: value, zh: value };
}

function displayUrlTitle(link: BoardCardAttachmentLink): string {
  return link.title?.trim() || link.url;
}

function displayAttachmentProvider(link: BoardCardAttachmentLink): string | null {
  if (link.source?.kind !== "integration") return null;
  return link.source.providerName;
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

export function BoardCardDetailSurface({
  card,
  listName,
  lang,
  taskLinkStatus,
  onCreateLinkedTask,
  onUnlinkTask,
  onPatchCard,
  onClose,
}: BoardCardDetailSurfaceProps) {
  const [checklistText, setChecklistText] = useState("");
  const [integrationProviderId, setIntegrationProviderId] =
    useState<BoardIntegrationProviderId>("link");
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
    const result = createBoardIntegrationAttachment({
      id: makeId("att"),
      providerId: integrationProviderId,
      url: attachmentUrl,
      title: attachmentTitle,
    });
    if (result.status !== "valid") return;
    onPatchCard({
      attachments: [
        ...attachments,
        result.attachment,
      ],
    });
    setAttachmentUrl("");
    setAttachmentTitle("");
  };

  const addActivityComment = () => {
    const result = createBoardCardComment({
      id: makeId("act"),
      body: activityText,
      createdAt: new Date().toISOString(),
      authorId: "local-user",
      authorName: STR.you[lang],
    });
    if (result.status !== "valid") return;
    onPatchCard({ activity: [result.entry, ...activity] });
    setActivityText("");
  };

  return (
    <section className="card-detail" role="dialog" aria-modal="true">
        <header className="cd-head">
          <div className="cd-head-main">
            <input
              className="cd-title-input"
              value={card.title[lang]}
              onChange={(event) => onPatchCard({ title: patchTitle(event.target.value) })}
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

          <section className="cd-section" data-testid="card-detail-task-section">
            <h3>{STR.task[lang]}</h3>
            {card.taskLink ? (
              <div className="cd-task-link-row">
                <div className="cd-task-link-main">
                  <span className="cd-task-link-title">{STR.linkedTask[lang]}</span>
                  <span className="mono" data-testid="card-detail-task-id">
                    {taskLinkStatus?.taskId ?? card.taskLink.taskId}
                  </span>
                </div>
                <span
                  className={"cd-task-status" + (taskLinkStatus?.missing ? " warning" : "")}
                  data-testid="card-detail-task-status"
                >
                  {taskLinkStatus?.label ?? STR.missingTask[lang]}
                </span>
                {onUnlinkTask && (
                  <button
                    type="button"
                    className="btn"
                    onClick={onUnlinkTask}
                    data-testid="card-detail-unlink-task"
                  >
                    {STR.unlinkTask[lang]}
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="btn primary"
                onClick={onCreateLinkedTask}
                disabled={!onCreateLinkedTask}
                data-testid="card-detail-create-task"
              >
                {STR.createTask[lang]}
              </button>
            )}
          </section>

          <section className="cd-section">
            <div className="cd-section-head">
              <h3>{STR.checklist[lang]}</h3>
              <span className="mono" data-testid="card-detail-checklist-summary">
                {checklistSummary}
              </span>
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
                      data-testid={`card-detail-check-text-${item.id}`}
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
                      data-testid={`card-detail-check-remove-${item.id}`}
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
                    <div className="cd-link-main">
                      <a href={link.url} target="_blank" rel="noreferrer">
                        {displayUrlTitle(link)}
                      </a>
                      {displayAttachmentProvider(link) ? (
                        <span
                          className="cd-link-provider"
                          data-testid={`card-detail-attachment-provider-${link.id}`}
                        >
                          {displayAttachmentProvider(link)}
                        </span>
                      ) : null}
                    </div>
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
              <select
                value={integrationProviderId}
                onChange={(event) =>
                  setIntegrationProviderId(event.target.value as BoardIntegrationProviderId)
                }
                aria-label={STR.integrationProvider[lang]}
                data-testid="card-detail-integration-provider"
              >
                {BOARD_INTEGRATION_PROVIDERS.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.label}
                  </option>
                ))}
              </select>
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
                  if (event.key === "Enter") addActivityComment();
                }}
                data-testid="card-detail-activity-input"
              />
              <button
                type="button"
                className="btn"
                onClick={addActivityComment}
                data-testid="card-detail-activity-add"
              >
                {STR.addComment[lang]}
              </button>
            </div>
            <div className="cd-list">
              {activity.length === 0 ? (
                <div className="cd-empty">{STR.empty[lang]}</div>
              ) : (
                activity.map((entry) => (
                  <div key={entry.id} className="cd-activity-row">
                    <span
                      className="cd-activity-kind"
                      data-testid={`card-detail-activity-kind-${entry.id}`}
                    >
                      {entry.kind === "comment" ? STR.comment[lang] : STR.note[lang]}
                    </span>
                    <div className="cd-activity-main">
                      <span>{entry.body}</span>
                      {entry.authorName ? (
                        <span className="cd-activity-author">{entry.authorName}</span>
                      ) : null}
                    </div>
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
