/**
 * morePane — Settings → More pane.
 *
 * 15 persisted keys + per-pane Reset Default link (clears only the 15 More-owned keys).
 * Port of web design/module-settings.jsx lines 658-822.
 * API contract: packages/xai-web-settings-rest/docs/api.md §4.6
 *
 * Non-blocking observation O1 resolution:
 * usePref is reactive — after removePref the hook re-reads defaults from registry.
 * No explicit re-mount is needed; the reset link calls removePref for each key and
 * dispatches a synthetic storage event to wake up same-tab listeners.
 */

import * as React from "react";
import type { Pane, PaneRenderProps } from "@repo/plugin-web-settings-shell";
import { Toggle, SettingRow, SectionBlock } from "@repo/plugin-web-settings-shell";
import { useI18n } from "@repo/plugin-web-tokens";
import { usePref, removePref, accountScope, type AccountScope } from "@repo/plugin-web-storage";
import type { WebPrefKey } from "@repo/plugin-web-storage";
import { localI18n } from "../internal/localI18n.js";
import type {
  WindowType,
  TaskDefaultDate,
  TaskDefaultReminderDue,
  TaskDefaultReminderAll,
  TaskDefaultPriority,
  TaskDefaultTagId,
  TaskDefaultListId,
  AddTo,
  OverdueAt,
} from "../types.js";

// The 15 More-owned pref keys — used by per-pane Reset Default (pane-scoped only).
const MORE_OWNED_KEYS: readonly WebPrefKey[] = [
  "xai_pref_more_win_type",
  "xai_pref_more_launch_at_login",
  "xai_pref_more_minimize_on_launch",
  "xai_pref_more_date_recognition",
  "xai_pref_more_remove_date_text",
  "xai_pref_more_remove_tags",
  "xai_pref_more_url_parse",
  "xai_pref_more_default_date",
  "xai_pref_more_default_rem_due",
  "xai_pref_more_default_rem_all",
  "xai_pref_more_default_pri",
  "xai_pref_more_default_tag",
  "xai_pref_more_default_list",
  "xai_pref_more_add_to",
  "xai_pref_more_overdue_at",
] as const;

function resetMorePrefs(scope: AccountScope): void {
  accountScope.assertCurrent(scope);
  // Keep the original per-pane reset: device settings reset only when explicitly
  // selected here, while private default list/tag references use this account.
  for (const key of MORE_OWNED_KEYS) removePref(key, scope);
}

interface TaskTemplateSpec {
  readonly nameEn: string;
  readonly nameZh: string;
  readonly itemsEn: readonly string[];
  readonly itemsZh: readonly string[];
}

const TEMPLATES: readonly TaskTemplateSpec[] = [
  {
    nameEn: "Daily prep",
    nameZh: "每天工作前要做的几件事",
    itemsEn: [
      "Quick recap of yesterday",
      "Spend time on email",
      "Review smart list 'Tod…'",
      "Pick the most important…",
      "Pick the hardest task…",
    ],
    itemsZh: [
      "简单回顾昨天的情况",
      "花点时间处理邮件…",
      "查看智能清单「今…」",
      "确定今天最重要的 1…",
      "确定今天最难的事…",
    ],
  },
  {
    nameEn: "Daily journal",
    nameZh: "每日记录",
    itemsEn: [
      "What did I finish today?",
      "What was noteworthy?",
      "What surprises came up?",
    ],
    itemsZh: [
      "今天完成了什么？",
      "今天发生了哪些美好或值得关注的事？",
      "今天遇到了哪些突发问题？",
    ],
  },
  {
    nameEn: "Travel checklist",
    nameZh: "旅行必备物品",
    itemsEn: [
      "ID / Passport / Visa…",
      "Chargers / cables",
      "Umbrella",
      "Light backpack",
      "Clothes: tops / bottoms",
    ],
    itemsZh: [
      "身份证 / 护照 / 学…",
      "充电器 / 数据线",
      "晴雨伞",
      "易于携带的小背包",
      "衣物：上衣 / 下装",
    ],
  },
] as const;

function MorePaneContent({ lang }: PaneRenderProps): React.ReactElement {
  const { s } = useI18n(lang);
  const t = localI18n(lang);
  const [scope] = React.useState(() => accountScope.capture());

  // Reset counter forces re-render of pane when reset is triggered.
  // This ensures usePref hooks read fresh defaults without a component remount.
  const [resetKey, setResetKey] = React.useState(0);
  const [resetFailed, setResetFailed] = React.useState(false);

  const [winType, setWinType] = usePref(
    "xai_pref_more_win_type" as WebPrefKey,
  ) as readonly [WindowType, (v: WindowType) => void, unknown];

  const [launch, setLaunch] = usePref(
    "xai_pref_more_launch_at_login" as WebPrefKey,
  ) as readonly [boolean, (v: boolean) => void, unknown];

  const [minimize, setMinimize] = usePref(
    "xai_pref_more_minimize_on_launch" as WebPrefKey,
  ) as readonly [boolean, (v: boolean) => void, unknown];

  const [dateRec, setDateRec] = usePref(
    "xai_pref_more_date_recognition" as WebPrefKey,
  ) as readonly [boolean, (v: boolean) => void, unknown];

  const [removeDateText, setRemoveDateText] = usePref(
    "xai_pref_more_remove_date_text" as WebPrefKey,
  ) as readonly [boolean, (v: boolean) => void, unknown];

  const [removeTags, setRemoveTags] = usePref(
    "xai_pref_more_remove_tags" as WebPrefKey,
  ) as readonly [boolean, (v: boolean) => void, unknown];

  const [urlParse, setUrlParse] = usePref(
    "xai_pref_more_url_parse" as WebPrefKey,
  ) as readonly [boolean, (v: boolean) => void, unknown];

  const [defaultDate, setDefaultDate] = usePref(
    "xai_pref_more_default_date" as WebPrefKey,
  ) as readonly [TaskDefaultDate, (v: TaskDefaultDate) => void, unknown];

  const [defaultRem, setDefaultRem] = usePref(
    "xai_pref_more_default_rem_due" as WebPrefKey,
  ) as readonly [TaskDefaultReminderDue, (v: TaskDefaultReminderDue) => void, unknown];

  const [defaultRemAll, setDefaultRemAll] = usePref(
    "xai_pref_more_default_rem_all" as WebPrefKey,
  ) as readonly [TaskDefaultReminderAll, (v: TaskDefaultReminderAll) => void, unknown];

  const [defaultPri, setDefaultPri] = usePref(
    "xai_pref_more_default_pri" as WebPrefKey,
  ) as readonly [TaskDefaultPriority, (v: TaskDefaultPriority) => void, unknown];

  const [defaultTag, setDefaultTag] = usePref(
    "xai_pref_more_default_tag" as WebPrefKey,
  ) as readonly [TaskDefaultTagId, (v: TaskDefaultTagId) => void, unknown];

  const [defaultList, setDefaultList] = usePref(
    "xai_pref_more_default_list" as WebPrefKey,
  ) as readonly [TaskDefaultListId, (v: TaskDefaultListId) => void, unknown];

  const [addTo, setAddTo] = usePref(
    "xai_pref_more_add_to" as WebPrefKey,
  ) as readonly [AddTo, (v: AddTo) => void, unknown];

  const [overdueAt, setOverdueAt] = usePref(
    "xai_pref_more_overdue_at" as WebPrefKey,
  ) as readonly [OverdueAt, (v: OverdueAt) => void, unknown];

  function handleReset(): void {
    try { resetMorePrefs(scope); setResetFailed(false); setResetKey((k) => k + 1); }
    catch { setResetFailed(true); }
  }

  return (
    <div className="more-pane" key={resetKey}>
      {resetFailed && <p role="alert">{lang === "zh" ? "账户已更改，请重新打开设置后重试。" : "Account changed. Reopen settings and retry."}</p>}
      {/* Language (read-only) */}
      <SectionBlock>
        <SettingRow label={t("more.language")}>
          <select className="sl-select" value="follow" onChange={() => {}} aria-label={t("more.language")}>
            <option value="follow">{t("more.followSystem")}</option>
          </select>
        </SettingRow>
      </SectionBlock>

      {/* Window + Launch */}
      <SectionBlock style={{ marginTop: 14 }}>
        <SettingRow label={t("more.windowType")}>
          <select
            className="sl-select"
            value={winType}
            onChange={(e) => setWinType(e.target.value as WindowType)}
            aria-label={t("more.windowType")}
          >
            <option value="window">{t("more.winWindow")}</option>
            <option value="tray">{t("more.winTray")}</option>
            <option value="full">{t("more.winFull")}</option>
          </select>
        </SettingRow>
        <SettingRow label={t("more.launchAtLogin")}>
          <Toggle
            on={launch}
            onChange={() => setLaunch(!launch)}
            ariaLabel={t("more.launchAtLogin")}
          />
        </SettingRow>
        <SettingRow label={t("more.minimizeOnLaunch")}>
          <Toggle
            on={minimize}
            onChange={() => setMinimize(!minimize)}
            ariaLabel={t("more.minimizeOnLaunch")}
          />
        </SettingRow>
      </SectionBlock>

      {/* Smart Recognition */}
      <h4 className="pane-h-block">{t("more.smartRecog")}</h4>
      <SectionBlock>
        <SettingRow label={t("more.dateRecog")} desc={t("more.dateRecogDesc")}>
          <Toggle
            on={dateRec}
            onChange={() => setDateRec(!dateRec)}
            ariaLabel={t("more.dateRecog")}
          />
        </SettingRow>
        {/* Remove text in tasks — inline checkbox moved into children slot (design.md §6.1) */}
        <SettingRow label={t("more.removeText")}>
          <label className="check-inline" onClick={() => setRemoveDateText(!removeDateText)}>
            <span className={"cbx" + (removeDateText ? " checked" : "")} />
          </label>
        </SettingRow>
        <SettingRow label={t("more.tagRecog")} desc={t("more.tagRecogDesc")}>
          <label className="check-inline" onClick={() => setRemoveTags(!removeTags)}>
            <span className={"cbx" + (removeTags ? " checked" : "")} />
            <span>{t("more.removeTags")}</span>
          </label>
        </SettingRow>
        <SettingRow label={t("more.urlParse")} desc={t("more.urlParseDesc")}>
          <Toggle
            on={urlParse}
            onChange={() => setUrlParse(!urlParse)}
            ariaLabel={t("more.urlParse")}
          />
        </SettingRow>
      </SectionBlock>

      {/* Task Default — Reminders */}
      <h4 className="pane-h-block">{t("more.taskDefault")}</h4>
      <SectionBlock>
        <SettingRow label={t("more.defaultDate")}>
          <select
            className="sl-select"
            value={defaultDate}
            onChange={(e) => setDefaultDate(e.target.value as TaskDefaultDate)}
            aria-label={t("more.defaultDate")}
          >
            <option value="none">{t("more.dateNone")}</option>
            <option value="today">{t("more.dateToday")}</option>
            <option value="tomorrow">{t("more.dateTomorrow")}</option>
          </select>
        </SettingRow>
        <SettingRow label={t("more.defaultRemDue")}>
          <select
            className="sl-select"
            value={defaultRem}
            onChange={(e) => setDefaultRem(e.target.value as TaskDefaultReminderDue)}
            aria-label={t("more.defaultRemDue")}
          >
            <option value="none">{t("more.remNone")}</option>
            <option value="on_time">{t("more.remOnTime")}</option>
            <option value="5min">{t("more.rem5min")}</option>
            <option value="15min">{t("more.rem15min")}</option>
          </select>
        </SettingRow>
        <SettingRow label={t("more.defaultRemAll")}>
          <select
            className="sl-select"
            value={defaultRemAll}
            onChange={(e) => setDefaultRemAll(e.target.value as TaskDefaultReminderAll)}
            aria-label={t("more.defaultRemAll")}
          >
            <option value="none">{t("more.remNone")}</option>
            <option value="9am">{t("more.rem9am")}</option>
            <option value="day_before">{t("more.remDayBefore")}</option>
          </select>
        </SettingRow>
      </SectionBlock>

      {/* Task Default — Defaults */}
      <SectionBlock style={{ marginTop: 14 }}>
        <SettingRow label={t("more.defaultPri")}>
          <select
            className="sl-select"
            value={defaultPri}
            onChange={(e) => setDefaultPri(e.target.value as TaskDefaultPriority)}
            aria-label={t("more.defaultPri")}
          >
            <option value="none">{t("more.priNone")}</option>
            <option value="low">{t("more.priLow")}</option>
            <option value="med">{t("more.priMed")}</option>
            <option value="high">{t("more.priHigh")}</option>
          </select>
        </SettingRow>
        <SettingRow label={t("more.defaultTag")}>
          <select
            className="sl-select"
            value={defaultTag}
            onChange={(e) => setDefaultTag(e.target.value as TaskDefaultTagId)}
            aria-label={t("more.defaultTag")}
          >
            <option value="none">{t("more.tagNone")}</option>
            <option value="study">{t("more.tagStudy")}</option>
            <option value="work">{t("more.tagWork")}</option>
            <option value="personal">{t("more.tagPersonal")}</option>
          </select>
        </SettingRow>
        <SettingRow label={t("more.defaultList")}>
          <select
            className="sl-select"
            value={defaultList}
            onChange={(e) => setDefaultList(e.target.value as TaskDefaultListId)}
            aria-label={t("more.defaultList")}
          >
            <option value="inbox">{t("more.listInbox")}</option>
            <option value="today">{t("more.listToday")}</option>
          </select>
        </SettingRow>
      </SectionBlock>

      {/* Add to / Overdue at */}
      <SectionBlock style={{ marginTop: 14 }}>
        <SettingRow label={t("more.defaultAddTo")}>
          <select
            className="sl-select"
            value={addTo}
            onChange={(e) => setAddTo(e.target.value as AddTo)}
            aria-label={t("more.defaultAddTo")}
          >
            <option value="top">{t("more.addTop")}</option>
            <option value="bottom">{t("more.addBottom")}</option>
          </select>
        </SettingRow>
        <SettingRow label={t("more.overdueAt")}>
          <select
            className="sl-select"
            value={overdueAt}
            onChange={(e) => setOverdueAt(e.target.value as OverdueAt)}
            aria-label={t("more.overdueAt")}
          >
            <option value="top">{t("more.overdueTop")}</option>
            <option value="bottom">{t("more.overdueBottom")}</option>
          </select>
        </SettingRow>
      </SectionBlock>

      {/* Per-pane Reset Default — clears only this pane's 14 keys (design.md §8 R8) */}
      <div
        className="reset-link"
        role="button"
        tabIndex={0}
        onClick={handleReset}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleReset(); }}
        data-testid="more-reset-default"
      >
        {t("more.resetDefault")}
      </div>

      {/* Task Template — read-only */}
      <h4 className="pane-h-block">{t("more.taskTemplate")}</h4>
      <div className="template-grid">
        {TEMPLATES.map((tpl, i) => (
          <div key={i} className="template-card">
            <h5>{lang === "zh" ? tpl.nameZh : tpl.nameEn}</h5>
            <ul>
              {(lang === "zh" ? tpl.itemsZh : tpl.itemsEn).map((item, j) => (
                <li key={j}>
                  <span className="cbx" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Suppress unused s variable warning */}
      {s("settings.more") && null}
    </div>
  );
}

export const morePane: Pane = {
  id: "more",
  icon: "help",
  i18nKey: "settings.more",
  render: (props: PaneRenderProps): React.ReactElement => (
    <MorePaneContent {...props} />
  ),
};
