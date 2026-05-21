"use client";

import { useState, type FormEvent } from "react";
import { WebLayout } from "../components/WebLayout";
import { createMockOAuthSession, createPasskeyStubMessage } from "../lib/accountMocks";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("OAuth is using a mock provider. Supabase Auth remains a deferred gate.");

  function handlePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(`Mock session prepared for ${email}. Replace this path with Supabase Auth.`);
  }

  function handlePasskey() {
    setMessage(createPasskeyStubMessage("PublicKeyCredential" in window));
  }

  return (
    <WebLayout active="login">
      <section className="auth-shell login-surface">
        <div className="section-heading">
          <p className="eyebrow">Account</p>
          <h1>Sign in</h1>
        </div>
        <div className="action-row">
          <button type="button" className="secondary-action" onClick={() => setMessage(createMockOAuthSession("mock-oauth"))}>
            Continue with mock OAuth
          </button>
          <button type="button" className="secondary-action" onClick={handlePasskey}>
            Use passkey
          </button>
        </div>
        <form className="auth-form" onSubmit={handlePassword}>
          <label>
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.currentTarget.value)} />
          </label>
          <label>
            Password
            <input
              type="password"
              placeholder="Local mock only"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
            />
          </label>
          <button type="submit">Continue</button>
        </form>
        <p className="status-note">{message}</p>
      </section>
    </WebLayout>
  );
}
