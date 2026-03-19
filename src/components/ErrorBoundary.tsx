'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  label?: string;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="font-sans text-sm text-brand-muted">
            {this.props.label ?? 'Something went wrong.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-5 py-2.5 font-sans font-medium text-sm border border-brand-border
                       text-brand-text hover:border-brand-text transition-colors"
            style={{ borderRadius: 2 }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
