import { Component, type ReactNode } from 'react';

// Last-resort screen if rendering crashes. React already reports the error in the console.
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-lg w-full text-center">
          <h1 className="text-xl font-semibold text-gray-900">Une erreur est survenue.</h1>
          <p className="mt-2 text-sm text-gray-600">Something went wrong. Please reload the page.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
          >
            Recharger / Reload
          </button>
        </div>
      </div>
    );
  }
}
