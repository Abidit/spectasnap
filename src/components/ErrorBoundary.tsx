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
          <div
            className="w-10 h-10 flex items-center justify-center bg-cream-200 border border-cream-400 mb-1"
            style={{ borderRadius: 2 }}
          >
            <span className="text-ink-500 text-lg" aria-hidden="true">!</span>
          </div>
          <p className="font-sans text-sm text-ink-500 max-w-xs leading-relaxed">
            {this.props.label ?? 'Something went wrong. Please try again.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-5 py-2.5 font-sans font-semibold text-sm border border-cream-400
                       text-ink-900 hover:border-ink-900 transition-colors"
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
