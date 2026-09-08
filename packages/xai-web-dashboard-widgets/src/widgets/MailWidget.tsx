/**
 * MailWidget — read-only Notifications digest (§G-B real aggregation).
 *
 * §G-B wiring (READ-ONLY — never mutates task/calendar stores — RM1):
 *   - usePref("xai_task_cols") + usePref("xai_calendar_events") for reactivity
 *   - buildNotifications(taskStore, calStore, now, lang, 6)
 *   - badge = signals.length
 *   - honest "All clear" / "暂无通知" empty state (RM6)
 *   - keeps the FROZEN mail widget id (no rename — §S2; Q-Mail-rename resolved)
 *
 * MAILS fixture export is kept for fixtures.test.ts back-compat (RW4 analog to RW4).
 * Ported from `web design/module-dashboard.jsx` lines 450-472.
 *
 * Design: packages/xai-web-dashboard-widgets/docs/design.md §G
 * API:    packages/xai-web-dashboard-widgets/docs/api.md §G.4
 */
import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";
import { usePref } from "@repo/plugin-web-storage";

import { Icon } from "../internal/Icon.js";
import { strNotif } from "../internal/strings.js";
import { buildNotifications } from "../internal/dataReads/notifications.js";

export interface MailWidgetProps {
  lang: Lang;
  /** Current Date (injected for testability + `ctx.now` threading from registrations.tsx). */
  now: Date;
  /** Deep-link callback supplied by dashboard grid context. */
  goTo?: (moduleId: string) => void;
}

export function MailWidget({ lang, now, goTo = () => {} }: MailWidgetProps) {
  const { s } = useI18n(lang);

  // READ-ONLY: never call the setter (RM1 — AC-MAIL-READONLY-1 guard)
  const [taskStore] = usePref("xai_task_cols");
  const [calStore] = usePref("xai_calendar_events");

  const signals = buildNotifications(taskStore, calStore, now, lang, 6);

  return (
    <div className="widget-content w-mail-body">
      <div className="wgt-h">
        <Icon name="mail" size={14} />
        <span>{strNotif("title", lang)}</span>
        <span className="grow" />
        <span className="mail-badge" data-mail-badge>
          {signals.length}
        </span>
      </div>

      {signals.length === 0 ? (
        /* Honest "All clear" empty state (NOT a fixture row — RM6) */
        <div className="notif-empty">
          <span>{strNotif("empty", lang)}</span>
        </div>
      ) : (
        <ul className="mail-list">
          {signals.map((sig) => {
            const targetModule = sig.sourceType === "task-overdue" ? "tasks" : "calendar";
            return (
              <li
                key={sig.id}
                className="mail-row"
                data-source-type={sig.sourceType}
                data-no-drag
                role="button"
                tabIndex={0}
                onClick={() => goTo(targetModule)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    goTo(targetModule);
                  }
                }}
              >
                {/* Source-type dot / icon for visual distinction (AC-MAIL-REAL-2) */}
                <span
                  className={`notif-dot notif-dot--${sig.sourceType}`}
                  aria-label={
                    sig.sourceType === "task-overdue"
                      ? strNotif("src_overdue", lang)
                      : strNotif("src_today", lang)
                  }
                />
                <div className="mail-body">
                  <div className="mail-from">{sig.label}</div>
                  {sig.time && (
                    <div className="mail-subj mono">{sig.time}</div>
                  )}
                </div>
                {/* Source-type label (small, muted) */}
                <div className="mail-time">
                  {sig.sourceType === "task-overdue"
                    ? strNotif("src_overdue", lang)
                    : strNotif("src_today", lang)}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {/* Keep header fallback for widget title accessible; use existing token as backup */}
      <span className="sr-only">{s("dashboard.mail")}</span>
    </div>
  );
}
