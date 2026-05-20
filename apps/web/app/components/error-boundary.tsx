"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

export class ErrorBoundary extends Component<{ children: ReactNode }, { error?: Error }> {
  state: { error?: Error } = {};

  static getDerivedStateFromError(error: Error): { error: Error } {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Sentry placeholder", { error, errorInfo });
  }

  render() {
    if (this.state.error) {
      return (
        <section className="workspace-panel">
          <h2>Something went wrong</h2>
          <p>The web shell captured this error locally. Sentry wiring is a placeholder.</p>
        </section>
      );
    }
    return this.props.children;
  }
}
