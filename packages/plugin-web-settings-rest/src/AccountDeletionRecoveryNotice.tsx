import { useCallback, useEffect, useRef, useState } from "react";
import {
  listPendingAccountDeletions, resumeAccountLocalDeletion,
  subscribeAccountDeletionReceipts, type AccountDeletionReceipt,
} from "./internal/accountDeletionRecovery.js";

export interface AccountDeletionRecoveryNoticeProps { readonly lang?: "en" | "zh"; }
/** Safe outside authenticated routes: only pending-operation copy, never account identifiers/content. */
export function AccountDeletionRecoveryNotice({ lang = "en" }: AccountDeletionRecoveryNoticeProps) {
  const [pending, setPending] = useState<AccountDeletionReceipt[]>([]);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const active = useRef(false);
  const inspect = useCallback(() => {
    try { setPending(listPendingAccountDeletions()); }
    catch { setFailed(true); }
  }, []);
  useEffect(() => {
    active.current = true;
    inspect();
    const unsubscribe = subscribeAccountDeletionReceipts(inspect);
    return () => { active.current = false; unsubscribe(); };
  }, [inspect]);
  const retry = async () => {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setFailed(false);
    try {
      // Enumerate only durable tombstone receipts from already-authorized deletion.
      // No mutable current-account lookup, server request or authentication change.
      for (const receipt of listPendingAccountDeletions()) await resumeAccountLocalDeletion(receipt);
    } catch { if (active.current) setFailed(true); }
    finally {
      inFlight.current = false;
      if (active.current) { setBusy(false); inspect(); }
    }
  };
  if (!pending.length && !failed) return null;
  return <section className="account-deletion-recovery" aria-label={lang === "zh" ? "完成本地数据清理" : "Finish local data cleanup"} aria-busy={busy}>
    <p>{lang === "zh" ? "上次账户移除还有本地数据待清理。" : "A previous account removal still has local data to clean up."}</p>
    <p>{lang === "zh" ? "重试只清理此前已确认移除的账户，不会更改当前账户或向服务器发送删除请求。" : "Retry only cleans accounts whose removal was already confirmed. It does not change your current account or send a server deletion request."}</p>
    {failed && <p role="alert">{lang === "zh" ? "本地清理未完成。请检查浏览器存储权限后重试；清理记录已保留。" : "Local cleanup could not finish. Check browser storage access and retry; the recovery record is retained."}</p>}
    <button type="button" className="btn ghost" disabled={busy} onClick={() => void retry()}>
      {busy ? (lang === "zh" ? "正在清理…" : "Cleaning up…") : (lang === "zh" ? "重试本地清理" : "Retry local cleanup")}
    </button>
  </section>;
}
