import { WebLayout } from "../components/WebLayout";

export default function TermsPage() {
  return (
    <WebLayout active="legal">
      <article className="legal-doc">
        <p className="eyebrow">Legal review required</p>
        <h1>Terms of Service</h1>
        <p>
          These draft terms cover the XAI Desktop release candidate and must be reviewed by counsel before GA or App
          Store submission.
        </p>
        <h2>Use of the app</h2>
        <p>
          Users are responsible for maintaining access to their recovery material. Local-first encrypted data may be
          unrecoverable if account credentials and recovery material are lost.
        </p>
        <h2>Availability</h2>
        <p>
          Sync, export, account deletion, crash reporting, and auto-update services may be unavailable during release
          candidate testing.
        </p>
        <h2>Changes</h2>
        <p>Final terms will be published before public distribution.</p>
      </article>
    </WebLayout>
  );
}
