"use client";

import { useState, type ChangeEvent } from "react";
import { WebLayout } from "../components/WebLayout";
import { verifyMockImportBundle } from "../lib/accountMocks";

export default function ImportPage() {
  const [status, setStatus] = useState("Upload an encrypted account bundle to verify it before restore.");

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) {
      return;
    }
    setStatus(verifyMockImportBundle(await file.text()));
  }

  return (
    <WebLayout active="data">
      <section className="page-stack">
        <div className="section-heading">
          <p className="eyebrow">Data</p>
          <h1>Import</h1>
        </div>
        <div className="workspace-panel">
          <h2>Verify and restore</h2>
          <p>
            Import validates the encrypted export envelope before restoring. The restore write path is held behind the
            Supabase and recovery-key deferred gates.
          </p>
          <label className="upload-target">
            Upload bundle
            <input type="file" accept=".json,.xaibundle,application/json" onChange={(event) => void handleFile(event)} />
          </label>
        </div>
        <p className="status-note">{status}</p>
      </section>
    </WebLayout>
  );
}
