"use client";

import { WebLayout } from "../components/WebLayout";

export default function LoginPage() {
  return (
    <WebLayout active="login">
      <section className="auth-shell">
        <h1>Sign in</h1>
        <p>Mock login for the browser host. Account plugins remain isolated from this shell.</p>
        <form className="auth-form">
          <label>
            Email
            <input type="email" placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input type="password" placeholder="Local mock only" />
          </label>
          <button
            type="button"
            onClick={() =>
              alert("Mock login only — auth is not wired in this scaffold.")
            }
          >
            Continue
          </button>
        </form>
      </section>
    </WebLayout>
  );
}
