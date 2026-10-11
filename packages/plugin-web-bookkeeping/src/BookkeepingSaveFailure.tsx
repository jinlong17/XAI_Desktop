import { useEffect, useRef, useState } from 'react';
import type { BookkeepingSaveRecovery } from './internal/storage.js';
export function BookkeepingSaveFailure({ recovery, lang, onRecovered }: { recovery: BookkeepingSaveRecovery; lang: 'zh'|'en'; onRecovered:()=>void }) {
  const panel=useRef<HTMLDivElement>(null);
  const [message,setMessage]=useState('');
  useEffect(()=>{panel.current?.focus();},[]);
  const pending=recovery.pending;
  if(!pending) return null;
  const text=(zh:string,en:string)=>lang==='zh'?zh:en;
  const exportDraft=()=>{
    let url:string|undefined;
    try {
      url=URL.createObjectURL(new Blob([recovery.exportDraft()],{type:'application/json'}));
      const link=document.createElement('a');link.href=url;link.download='xai-bookkeeping-unsaved-draft.json';document.body.append(link);
      try {link.click();} finally {link.remove();}
      setMessage(text('已请求下载，请检查浏览器下载记录。','Download requested. Check your browser downloads.'));
    } catch {setMessage(text('草稿导出失败，内容仍保留在当前页面。','Draft export failed. It remains on this page.'));}
    finally {if(url){const saved=url;setTimeout(()=>URL.revokeObjectURL(saved),1000);}}
  };
  return <div className="bk-save-recovery" role="alertdialog" aria-modal="true" aria-labelledby="bk-save-failure-title" tabIndex={-1} ref={panel}>
    <h3 id="bk-save-failure-title">{pending.canonicalCommitted?text('记录已保存，部分布局未保存','Records saved; some layout settings were not saved'):text('未能保存，草稿已保留','Save failed. Your draft is retained.')}</h3>
    <p>{pending.failure==='conflict'?text('存储内容已被其他页面修改。请导出草稿后重新加载，避免覆盖新的记录。','Storage changed in another page. Export this draft and reload to avoid overwriting newer records.'):pending.failure==='account'?text('账户已改变，不能重试此账户的保存。','The account changed. This save cannot be retried here.'):text('恢复保存前暂停编辑，以免覆盖草稿。请保持页面打开，重试或先导出。','Editing is paused to preserve the draft. Keep this page open, retry, or export it first.')}</p>
    <div className="bk-save-recovery-actions">
      <button type="button" className="btn primary" disabled={pending.failure==='account'||pending.failure==='conflict'} onClick={()=>{if(recovery.retry())onRecovered();}}>{text('重试保存','Retry save')}</button>
      <button type="button" className="btn" onClick={exportDraft}>{text('导出草稿','Export draft')}</button>
      <button type="button" className="btn ghost" onClick={()=>{recovery.discard();onRecovered();}}>{pending.canonicalCommitted?text('保留已保存记录','Keep saved records'):text('放弃未保存更改','Discard unsaved changes')}</button>
    </div>
    {message?<p role="status">{message}</p>:null}
  </div>;
}
