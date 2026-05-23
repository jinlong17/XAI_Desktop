/**
 * MailWidget — unread red dot + count badge + 4-row mail list.
 *
 * Ported from `web design/module-dashboard.jsx` lines 450-472.
 */
import { useI18n } from "@repo/plugin-web-tokens";
import type { Lang } from "@repo/plugin-web-tokens";

import { Icon } from "../internal/Icon.js";
import { MAILS } from "../internal/fixtures.js";

export interface MailWidgetProps {
  lang: Lang;
}

export function MailWidget({ lang }: MailWidgetProps) {
  const { s } = useI18n(lang);
  const unreadCount = MAILS.filter((m) => m.unread).length;
  return (
    <div className="widget-content w-mail-body">
      <div className="wgt-h">
        <Icon name="mail" size={14} />
        <span>{s("dashboard.mail")}</span>
        <span className="grow" />
        <span className="mail-badge" data-mail-badge>
          {unreadCount}
        </span>
      </div>
      <ul className="mail-list">
        {MAILS.map((m) => (
          <li key={m.id} className={"mail-row" + (m.unread ? " unread" : "")} data-mail-id={m.id}>
            {m.unread && <span className="mail-dot" />}
            <div className="mail-body">
              <div className="mail-from">{m.from}</div>
              <div className="mail-subj">{m.subj[lang]}</div>
            </div>
            <div className="mail-time mono">{m.time}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
