"use client";

import { useMemo, useState } from "react";
import { WebLayout } from "../components/WebLayout";
import { createMockDeletionPlan } from "../lib/accountMocks";

export default function DeleteAccountPage() {
  const plan = useMemo(() => createMockDeletionPlan(), []);
  const [status, setStatus] = useState("Deletion plan staged. Legal and Supabase execution gates are deferred.");

  return (
    <WebLayout active="legal">
      <section className="page-stack">
        <div className="section-heading">
          <p className="eyebrow">Account</p>
          <h1>Delete account</h1>
        </div>
        <div className="workspace-panel danger-panel">
          <h2>Request deletion</h2>
          <p>
            This entry maps to plugin-account account deletion planning. Real server cleanup requires Supabase service
            credentials and legal approval before GA.
          </p>
          <button type="button" className="danger-action" onClick={() => setStatus("Mock deletion request recorded.")}>
            Request deletion
          </button>
        </div>
        <pre className="code-block">{JSON.stringify(plan, null, 2)}</pre>
        <p className="status-note">{status}</p>
      </section>
    </WebLayout>
  );
}
