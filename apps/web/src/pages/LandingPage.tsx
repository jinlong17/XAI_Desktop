import { Link } from "react-router";

export function LandingPage() {
  return (
    <main className="host-page">
      <h1>XAI Console</h1>
      <p>Tasks, boards, calendar, dashboard, and AI workspace in one browser app.</p>
      <Link className="host-page__primary" to="/app">
        Open console
      </Link>
    </main>
  );
}
